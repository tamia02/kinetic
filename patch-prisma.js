const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src/generated/prisma');

function patchFile(filePath, patchFn) {
  const fullPath = path.join(baseDir, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping missing file: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  const newContent = patchFn(content, filePath);
  if (content !== newContent) {
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(`Successfully patched: ${filePath}`);
  } else {
    console.log(`No changes needed for: ${filePath}`);
  }
}

function patchScalarEnum(content, enumName, fields) {
  const regex = new RegExp(`((?:exports\\.Prisma\\.|export const | )${enumName}\\s*[:=]\\s*\\{)([\\s\\S]+?)(\\})`, 'g');
  return content.replace(regex, (match, head, body, tail) => {
    let newBody = body;
    fields.forEach(f => {
      if (!newBody.includes(`${f}: '${f}'`) && !newBody.includes(` ${f}:'${f}'`)) {
        newBody = newBody.trimEnd();
        if (newBody.length > 0 && !newBody.endsWith(',')) newBody += ',';
        newBody += `\n  ${f}: '${f}'\n`;
      }
    });
    return head + newBody + tail;
  });
}

function patchDMMF(content, filePath) {
  const startMarker = 'config.runtimeDataModel = JSON.parse("';
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) return content;
  const endIdx = content.indexOf('")', startIdx + startMarker.length);
  if (endIdx === -1) return content;
  const escapedJsonStr = content.substring(startIdx + startMarker.length, endIdx);
  let jsonStr = escapedJsonStr.replace(/\\"/g, '"');
  let dmmf = JSON.parse(jsonStr);
  dmmf.enums = dmmf.enums || {};
  if (!dmmf.enums.Provider) dmmf.enums.Provider = { values: [{ name: 'MODAL', dbName: null }, { name: 'SARVAM', dbName: null }] };
  if (dmmf.models.Voice && !dmmf.models.Voice.fields.find(f => f.name === 'provider')) {
    dmmf.models.Voice.fields.push({ name: 'provider', kind: 'enum', type: 'Provider' });
  }
  if (dmmf.models.Generation) {
    const fields = [{ name: 'provider', kind: 'enum', type: 'Provider' }, { name: 'model', kind: 'scalar', type: 'String' }, { name: 'pace', kind: 'scalar', type: 'Float' }, { name: 'language', kind: 'scalar', type: 'String' }];
    fields.forEach(f => { if (!dmmf.models.Generation.fields.find(ef => ef.name === f.name)) dmmf.models.Generation.fields.push(f); });
  }
  const updatedJsonStr = JSON.stringify(dmmf).replace(/"/g, '\\"');
  return content.substring(0, startIdx + startMarker.length) + updatedJsonStr + content.substring(endIdx);
}

function nuclearWasmRemoval(content, filePath) {
  console.log(`  Applying nuclear Wasm removal for ${filePath}`);
  
  // 1. Remove parameterizationSchema attribute from the config object literal
  content = content.replace(/"parameterizationSchema":\s*\{\s*"strings":\s*\[[\s\S]*?\]\s*,\s*"graph":\s*".*?"\s*\}/, '"parameterizationSchema": null');
  
  // 2. Remove any separate parameterizationSchema assignments
  content = content.replace(/config\.parameterizationSchema\s*=\s*\{[\s\S]*?\};?\s*(?=\n|\r|$)/g, 'config.parameterizationSchema = null;\n');
  content = content.replace(/config\.parameterizationSchema\s*=\s*JSON\.parse\([\s\S]*?\);?\s*(?=\n|\r|$)/g, 'config.parameterizationSchema = null;\n');

  // 3. Remove compilerWasm assignments
  content = content.replace(/config\.compilerWasm\s*=\s*\{[\s\S]*?\};?\s*(?=\n|\r|$)/g, 'config.compilerWasm = null;\n');

  return content;
}

// 1. Patch enums.ts
patchFile('enums.ts', (content) => {
  if (!content.includes('export const Provider =')) {
    return content.trimEnd() + "\n\nexport const Provider = {\n  MODAL: 'MODAL',\n  SARVAM: 'SARVAM'\n} as const\nexport type Provider = (typeof Provider)[keyof typeof Provider]\n";
  }
  return content;
});

// 2. Patch internal/prismaNamespace.ts
patchFile('internal/prismaNamespace.ts', (content) => {
  content = patchScalarEnum(content, 'VoiceScalarFieldEnum', ['provider']);
  content = patchScalarEnum(content, 'GenerationScalarFieldEnum', ['provider', 'model', 'pace', 'language']);
  return content;
});

// 3. Patch index.js and internal/class.ts
['index.js', 'internal/class.ts'].forEach(file => {
  patchFile(file, (content) => {
    content = patchScalarEnum(content, 'VoiceScalarFieldEnum', ['provider']);
    content = patchScalarEnum(content, 'GenerationScalarFieldEnum', ['provider', 'model', 'pace', 'language']);
    content = patchDMMF(content, file);
    content = nuclearWasmRemoval(content, file);
    return content;
  });
});

console.log('Comperehensive Prisma Client patch (v17 - NUCLEAR) completed.');
