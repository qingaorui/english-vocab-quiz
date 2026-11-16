/* 把审校意见应用到批次 JSON：node build/patch.js build/fixes-1.json [...]
   修复项格式：{ "word": "...", "match": "句子片段", "sentence": "", "options": [], "answer": "", "meaning": "", "note": "", "level": "", "pos": "" }
   只覆盖提供的字段；"delete": true 表示删除该题（随后需重新分配词表覆盖，慎用）。 */
const fs = require("fs");
const path = require("path");

const batchDir = __dirname;
const specs = fs.readdirSync(path.join(batchDir, "batches")).filter(f => f.endsWith(".json"));

const batches = [];
specs.forEach(f => {
  const id = f.replace(".json", "");
  const file = path.join(batchDir, "batch-" + id + ".json");
  if (!fs.existsSync(file)) return;
  batches.push({ id, file, items: JSON.parse(fs.readFileSync(file, "utf8")) });
});

const fixFiles = process.argv.slice(2);
let applied = 0, missed = 0;

fixFiles.forEach(ff => {
  const fixes = JSON.parse(fs.readFileSync(ff, "utf8"));
  fixes.forEach(fix => {
    let hit = null;
    for (const b of batches) {
      const cands = b.items.filter(it => it.word.toLowerCase() === String(fix.word).toLowerCase());
      if (!cands.length) continue;
      if (fix.match) {
        hit = cands.find(it => it.sentence.includes(fix.match));
      } else {
        hit = cands[0];
      }
      if (hit) break;
    }
    if (!hit) { missed++; console.log(`✗ 未找到: ${fix.word} ${fix.match || ""}`); return; }
    ["sentence", "options", "answer", "meaning", "note", "level", "pos"].forEach(k => {
      if (k in fix) hit[k] = fix[k];
    });
    applied++;
  });
});

batches.forEach(b => {
  fs.writeFileSync(b.file, JSON.stringify(b.items, null, 2), "utf8");
});

console.log(`应用 ${applied} 处修改，未匹配 ${missed} 处，涉及 ${batches.length} 个批次文件`);
