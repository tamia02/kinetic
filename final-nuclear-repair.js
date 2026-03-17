const fs = require('fs');
const path = require('path');

const prismaDir = 'src/generated/prisma';

function nuclearRepair() {
  const edgePath = path.join(prismaDir, 'edge.js');
  const targetPath = path.join(prismaDir, 'index.js');
  
  let content = fs.readFileSync(edgePath, 'utf8');
  
  // 1. Change runtime to Node
  content = content.replace('./runtime/wasm-compiler-edge.js', './runtime/client.js');

  // 2. Clear problematic large strings to avoid syntax/escape issues
  content = content.replace(/"inlineSchema":\s*".*?"/, '"inlineSchema": ""');
  content = content.replace(/"parameterizationSchema":\s*\{[\s\S]*?\}/, '"parameterizationSchema": null');
  content = content.replace(/config\.parameterizationSchema\s*=\s*\{[\s\S]*?\};?/, 'config.parameterizationSchema = null;');
  content = content.replace(/config\.compilerWasm\s*=\s*\{[\s\S]*?\};?/, 'config.compilerWasm = null;');

  // 3. Patch the DMMF (runtimeDataModel) - This is what actually matters!
  // We'll use a very specific replacement that we know works.
  const dmmfStart = 'config.runtimeDataModel = JSON.parse("';
  const dmmfEnd = '")';
  const startIdx = content.indexOf(dmmfStart);
  const endIdx = content.indexOf(dmmfEnd, startIdx + dmmfStart.length);
  
  if (startIdx !== -1 && endIdx !== -1) {
    const originalDmmfStr = content.substring(startIdx + dmmfStart.length, endIdx).replace(/\\"/g, '"');
    let dmmf = JSON.parse(originalDmmfStr);
    
    // Add fields to Voice
    if (dmmf.models.Voice) {
      if (!dmmf.models.Voice.fields.find(f => f.name === 'provider')) {
        dmmf.models.Voice.fields.push({"name":"provider","kind":"enum","type":"Provider"});
      }
    }
    
    // Add fields to Generation
    if (dmmf.models.Generation) {
      const gFields = [
        {"name":"provider","kind":"enum","type":"Provider"},
        {"name":"model","kind":"scalar","type":"String"},
        {"name":"pace","kind":"scalar","type":"Float"},
        {"name":"language","kind":"scalar","type":"String"}
      ];
      gFields.forEach(f => {
        if (!dmmf.models.Generation.fields.find(ef => ef.name === f.name)) {
          dmmf.models.Generation.fields.push(f);
        }
      });
    }
    
    // Add Provider enum
    dmmf.enums = dmmf.enums || {};
    dmmf.enums.Provider = {"values":[{"name":"MODAL","dbName":null},{"name":"SARVAM","dbName":null}]};
    
    const newDmmfStr = JSON.stringify(dmmf).replace(/"/g, '\\"');
    content = content.substring(0, startIdx + dmmfStart.length) + newDmmfStr + content.substring(endIdx);
  }

  // 4. Patch Scalar Enums in reconstructed content
  content = content.replace(/r2ObjectKey: 'r2ObjectKey',/g, "r2ObjectKey: 'r2ObjectKey',\n  provider: 'provider',");
  content = content.replace(/repetitionPenalty: 'repetitionPenalty'/g, "repetitionPenalty: 'repetitionPenalty',\n  provider: 'provider',\n  model: 'model',\n  pace: 'pace',\n  language: 'language'");

  // 5. Add Provider enum definition exports
  const voiceVariantStr = "exports.VoiceVariant = exports.$Enums.VoiceVariant = {";
  const providerEnumStr = "exports.Provider = exports.$Enums.Provider = {\n  MODAL: 'MODAL',\n  SARVAM: 'SARVAM'\n};\n\n";
  if (!content.includes('exports.Provider =')) {
    content = content.replace(voiceVariantStr, providerEnumStr + voiceVariantStr);
  }

  fs.writeFileSync(targetPath, content, 'utf8');
  console.log(`Nuclear Repair completed for ${targetPath}.`);
}

nuclearRepair();
