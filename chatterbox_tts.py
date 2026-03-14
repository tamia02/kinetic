"""Chatterbox TTS API - Text-to-speech with voice cloning on Modal."""

import modal

# Use this to add R2 tokens:
# modal secret create cloudflare-r2 \
#   AWS_ACCESS_KEY_ID=<r2-access-key-id> \
#   AWS_SECRET_ACCESS_KEY=<r2-secret-access-key>

# Use this to test locally:
# modal run chatterbox_tts.py \
#   --prompt "Hello from Chatterbox [chuckle]." \
#   --voice-key "voices/system/<voice-id>"

# Use this to test CURL:
# curl -X POST "https://<your-modal-endpoint>/generate" \
#   -H "Content-Type: application/json" \
#   -H "X-Api-Key: <your-api-key>" \
#   -d '{"prompt": "Hello from Chatterbox [chuckle].", "voice_key": "voices/system/<voice-id>"}' \
#   --output output.wav

# R2 cloud bucket mount (read-only, replaces Modal Volume)
R2_BUCKET_NAME = "kinetic"
R2_ACCOUNT_ID = "549201afabb79ddd81f764849bfb19d1"
R2_MOUNT_PATH = "/r2"
r2_bucket = modal.CloudBucketMount(
    R2_BUCKET_NAME,
    bucket_endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
    secret=modal.Secret.from_name("cloudflare-r2"),
    read_only=True,
)

# Modal setup
image = modal.Image.debian_slim(python_version="3.10").uv_pip_install(
    "chatterbox-tts==0.1.6",
    "fastapi[standard]==0.124.4",
    "peft==0.18.0",
)
app = modal.App("chatterbox-tts", image=image)

with image.imports():
    import io
    import os
    from pathlib import Path

    import torch
    import torchaudio as ta
    from chatterbox.tts_turbo import ChatterboxTurboTTS
    from fastapi import (
        Depends,
        FastAPI,
        HTTPException,
        Security,
    )
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import StreamingResponse
    from fastapi.security import APIKeyHeader
    from pydantic import BaseModel, Field

    api_key_scheme = APIKeyHeader(
        name="x-api-key",
        scheme_name="ApiKeyAuth",
        auto_error=False,
    )

    def verify_api_key(x_api_key: str | None = Security(api_key_scheme)):
        expected = os.environ.get("CHATTERBOX_API_KEY", "")
        if not expected or x_api_key != expected:
            raise HTTPException(status_code=403, detail="Invalid API key")
        return x_api_key

    class TTSRequest(BaseModel):
        """Request model for text-to-speech generation."""

        prompt: str = Field(..., min_length=1, max_length=5000)
        voice_key: str = Field(..., min_length=1, max_length=300)
        temperature: float = Field(default=0.8, ge=0.0, le=2.0)
        top_p: float = Field(default=0.95, ge=0.0, le=1.0)
        top_k: int = Field(default=1000, ge=1, le=10000)
        repetition_penalty: float = Field(default=1.2, ge=1.0, le=2.0)
        norm_loudness: bool = Field(default=True)
        sample_rate: int | None = Field(default=None)


@app.cls(
    gpu="a10g",
    scaledown_window=60 * 5,
    secrets=[
        modal.Secret.from_name("hf-token"),
        modal.Secret.from_name("chatterbox-api-key"),
        modal.Secret.from_name("cloudflare-r2"),
    ],
    volumes={R2_MOUNT_PATH: r2_bucket},
)
@modal.concurrent(max_inputs=10)
class Chatterbox:
    @modal.enter()
    def load_model(self):
        self.model = ChatterboxTurboTTS.from_pretrained(device="cuda")

    @modal.asgi_app()
    def serve(self):
        web_app = FastAPI(
            title="Chatterbox TTS API",
            description="Text-to-speech with voice cloning",
            docs_url="/docs",
            dependencies=[Depends(verify_api_key)],
        )
        web_app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        @web_app.post("/generate")
        def generate_speech(request: TTSRequest):
            voice_path = Path(R2_MOUNT_PATH) / request.voice_key
            if not voice_path.exists():
                raise HTTPException(
                    status_code=400,
                    detail=f"Voice not found at '{request.voice_key}'",
                )

            try:
                # Pass None to 'generate' if no sample_rate is requested 
                # so it returns a standard WAV file.
                audio_bytes = self.generate.local(
                    request.prompt,
                    str(voice_path),
                    request.temperature,
                    request.top_p,
                    request.top_k,
                    request.repetition_penalty,
                    request.norm_loudness,
                    target_sr=request.sample_rate,
                )

                # If sample_rate was explicitly requested, we return raw PCM (no header)
                # This is useful for Vapi integration.
                if request.sample_rate:
                    return StreamingResponse(
                        io.BytesIO(audio_bytes),
                        media_type="application/octet-stream",
                    )

                # Otherwise return standard WAV
                buffer = io.BytesIO()
                # Create a temporary tensor to save as WAV
                import torch
                # We need to reconstruct the tensor from bytes to save with header
                # Or just use the original method. Let's simplify.
                # Actually, the 'generate' method below can be modified to return bytes or tensor.
                return StreamingResponse(
                    io.BytesIO(audio_bytes),
                    media_type="audio/wav",
                )
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to generate audio: {e}",
                )

        return web_app

    @modal.method()
    def generate(
        self,
        prompt: str,
        audio_prompt_path: str,
        temperature: float = 0.8,
        top_p: float = 0.95,
        top_k: int = 1000,
        repetition_penalty: float = 1.2,
        norm_loudness: bool = True,
        target_sr: int | None = None,
    ):
        wav = self.model.generate(
            prompt,
            audio_prompt_path=audio_prompt_path,
            temperature=temperature,
            top_p=top_p,
            top_k=top_k,
            repetition_penalty=repetition_penalty,
            norm_loudness=norm_loudness,
        )

        if target_sr and target_sr != self.model.sr:
            import torchaudio.transforms as T
            resampler = T.Resample(self.model.sr, target_sr).to(wav.device)
            wav = resampler(wav)
            sr = target_sr
        else:
            sr = self.model.sr

        buffer = io.BytesIO()
        if target_sr is not None:
            # Return raw PCM if sr was explicitly requested
            # We use 16-bit PCM (s16le)
            wav_s16 = (wav * 32767).clamp(-32768, 32767).to(torch.int16)
            return wav_s16.cpu().numpy().tobytes()
        
        ta.save(buffer, wav, sr, format="wav")
        buffer.seek(0)
        return buffer.read()


@app.local_entrypoint()
def test(
    prompt: str = "Chatterbox running on Modal [chuckle].",
    voice_key: str = "voices/system/default.wav",
    output_path: str = "/tmp/chatterbox-tts/output.wav",
    temperature: float = 0.8,
    top_p: float = 0.95,
    top_k: int = 1000,
    repetition_penalty: float = 1.2,
    norm_loudness: bool = True,
):
    import pathlib

    chatterbox = Chatterbox()
    audio_prompt_path = f"{R2_MOUNT_PATH}/{voice_key}"
    audio_bytes = chatterbox.generate.remote(
        prompt=prompt,
        audio_prompt_path=audio_prompt_path,
        temperature=temperature,
        top_p=top_p,
        top_k=top_k,
        repetition_penalty=repetition_penalty,
        norm_loudness=norm_loudness,
    )

    output_file = pathlib.Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_bytes(audio_bytes)
    print(f"Audio saved to {output_file}")
