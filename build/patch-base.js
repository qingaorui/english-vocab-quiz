/* 把审校意见应用到“基础题库”文件（data/unit1..4.js、data/extra.js）
   node build/patch-base.js build/fixes-1.json [...] */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const dataDir = path.join(__dirname, "..", "data");
const BASE_FILES = ["unit1.js", "unit2.js", "unit3.js", "unit4.js", "extra.js"];
const FIELDS = ["sentence", "options", "answer", "meaning", "note", "level", "pos"];

const store = {};
BASE_FILES.forEach(f => {
  const sandbox = { window: { QUIZ_BANK: [] } };
  vm.runInContext(fs.readFileSync(path.join(dataDir, f), "utf8"), vm.createContext(sandbox), { filename: f });
  store[f] = sandbox.window.QUIZ_BANK;
});

let applied = 0, missed = 0;
const touched = new Set();

process.argv.slice(2).forEach(ff => {
  const fixes = JSON.parse(fs.readFileSync(ff, "utf8"));
  fixes.forEach(fix => {
    let hit = null, hitFile = null;
    for (const f of BASE_FILES) {
      hit = store[f].find(it =>
        it.word.toLowerCase() === String(fix.word).toLowerCase() &&
        (!fix.match || it.sentence.includes(fix.match))
      );
      if (hit) { hitFile = f; break; }
    }
    if (!hit) { missed++; console.log(`· 基础库未匹配（可能在扩展库）: ${fix.word}`); return; }
    FIELDS.forEach(k => { if (k in fix) hit[k] = fix[k]; });
    touched.add(hitFile);
    applied++;
    console.log(`✓ ${hit.id} ${hit.word}`);
  });
});

function pad(n) { return String(n).padStart(2, "0"); }
function q(s) { return JSON.stringify(String(s)); }

touched.forEach(f => {
  const items = store[f];
  const out = items.map(it => {
    const parts = [
      `id: ${q(it.id)}, unit: ${it.unit}, word: ${q(it.word)}, pos: ${q(it.pos)}, level: ${q(it.level)}`,
      `sentence: ${q(it.sentence)}`,
      `options: [${it.options.map(q).join(", ")}]`,
      `answer: ${q(it.answer)}`,
      `meaning: ${q(it.meaning)}`,
      `note: ${q(it.note)}`
    ];
    return "  {\n    " + parts.join(",\n    ") + "\n  }";
  });
  const header = `/* 教材词汇基础题库（${items.length} 题）— 审校修复后由 build/patch-base.js 重写 */\n`;
  fs.writeFileSync(path.join(dataDir, f), header + "window.QUIZ_BANK = window.QUIZ_BANK || [];\nwindow.QUIZ_BANK.push(\n" + out.join(",\n") + "\n);\n", "utf8");
  console.log(`重写 ${f}: ${items.length} 题`);
});

console.log(`应用 ${applied} 处，未匹配 ${missed} 处`);
