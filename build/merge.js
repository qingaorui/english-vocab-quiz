/* 合并各批次题目到 data/ 下的数据文件：node build/merge.js */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { validate } = require("./validate-batch.js");

const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
const batchDir = path.join(root, "build");

/* 批次 -> 目标文件 / 单元 / id 前缀 */
const PLAN = [
  { ids: ["01", "02"], unit: 6, file: "phrases.js", prefix: "ph", title: "短语搭配（固定搭配 25 个 × 2 题）" },
  { ids: ["03"], unit: 1, file: "unit1-extension.js", prefix: "u1", title: "Unit 1 延伸 — 校园适应与心理" },
  { ids: ["04"], unit: 2, file: "unit2-extension.js", prefix: "u2", title: "Unit 2 延伸 — 饮食与营养" },
  { ids: ["05"], unit: 3, file: "unit3-extension.js", prefix: "u3", title: "Unit 3 延伸 — 社团、艺术与运动" },
  { ids: ["06"], unit: 4, file: "unit4-extension.js", prefix: "u4", title: "Unit 4 延伸 — 人际与沟通" },
  { ids: ["07", "08"], unit: 5, file: "cet-1.js", prefix: "ex", title: "四六级拓展 — 科技与创新 / 环境与可持续" },
  { ids: ["09", "10", "11", "12"], unit: 5, file: "cet-2.js", prefix: "ex", title: "四六级拓展 — 经济、职场、社会、心理" }
];

/* 1. 读原始题库（只读基础文件，扩展文件每次重新生成以保证幂等） */
const BASE_FILES = ["unit1.js", "unit2.js", "unit3.js", "unit4.js", "extra.js"];
const sandbox = { window: { QUIZ_BANK: [] } };
const ctx = vm.createContext(sandbox);
BASE_FILES.forEach(f => {
  vm.runInContext(fs.readFileSync(path.join(dataDir, f), "utf8"), ctx, { filename: f });
});
const existing = sandbox.window.QUIZ_BANK;
const existingSentences = new Set(existing.map(q => q.sentence.toLowerCase()));
const perUnit = {};
existing.forEach(q => { perUnit[q.unit] = (perUnit[q.unit] || 0) + 1; });
console.log("现有题数:", existing.length, JSON.stringify(perUnit));

/* 2. 校验并合并各批次 */
const groups = {};
let totalNew = 0;
const problems = [];
const newSentences = new Set();

PLAN.forEach(p => {
  const items = [];
  p.ids.forEach(id => {
    const spec = JSON.parse(fs.readFileSync(path.join(batchDir, "batches", id + ".json"), "utf8"));
    const file = path.join(batchDir, "batch-" + id + ".json");
    if (!fs.existsSync(file)) { problems.push(`缺少批次文件 ${id}`); return; }
    let arr;
    try { arr = JSON.parse(fs.readFileSync(file, "utf8")); }
    catch (e) { problems.push(`批次 ${id} JSON 解析失败: ${e.message}`); return; }

    const { errors } = validate(arr, spec);
    errors.forEach(e => problems.push(`批次 ${id}: ${e}`));

    arr.forEach(it => {
      const s = String(it.sentence).toLowerCase();
      if (newSentences.has(s)) problems.push(`批次 ${id}: 跨批次句子重复 (${it.word})`);
      if (existingSentences.has(s)) problems.push(`批次 ${id}: 与已有题目句子重复 (${it.word})`);
      newSentences.add(s);
      items.push(it);
    });
    totalNew += arr.length;
  });
  groups[p.file] = { plan: p, items };
});

/* 3. 生成 id 并写文件 */
const counter = {};
existing.forEach(q => {
  const m = String(q.id).match(/(\d+)$/);
  const prefix = String(q.id).replace(/-\d+$/, "");
  if (m) counter[prefix] = Math.max(counter[prefix] || 0, Number(m[1]));
});

function pad(n) { return String(n).padStart(2, "0"); }

function fmtString(s) { return JSON.stringify(String(s)); }
function fmtItem(it) {
  const parts = [
    `id: ${fmtString(it.id)}, unit: ${it.unit}, word: ${fmtString(it.word)}, pos: ${fmtString(it.pos)}, level: ${fmtString(it.level)}`,
    `sentence: ${fmtString(it.sentence)}`,
    `options: [${it.options.map(fmtString).join(", ")}]`,
    `answer: ${fmtString(it.answer)}`,
    `meaning: ${fmtString(it.meaning)}`,
    `note: ${fmtString(it.note)}`
  ];
  return "  {\n    " + parts.join(",\n    ") + "\n  }";
}

Object.keys(groups).forEach(file => {
  const { plan, items } = groups[file];
  const out = items.map(it => {
    counter[plan.prefix] = (counter[plan.prefix] || 0) + 1;
    it.id = `${plan.prefix}-${pad(counter[plan.prefix])}`;
    it.unit = plan.unit;
    return fmtItem(it);
  });
  const header = `/* ${plan.title}\n   自动合并生成（build/merge.js），题库共 ${existing.length + totalNew} 题 */\n`;
  const body = `window.QUIZ_BANK = window.QUIZ_BANK || [];\nwindow.QUIZ_BANK.push(\n${out.join(",\n")}\n);\n`;
  fs.writeFileSync(path.join(dataDir, file), header + body, "utf8");
  console.log(`写出 ${file}: ${items.length} 题`);
});

/* 4. 校验最终结果 */
const check = { window: { QUIZ_BANK: [] } };
const cctx = vm.createContext(check);
fs.readdirSync(dataDir).filter(f => f.endsWith(".js")).sort().forEach(f => {
  vm.runInContext(fs.readFileSync(path.join(dataDir, f), "utf8"), cctx, { filename: f });
});
const all = check.window.QUIZ_BANK;
const ids = new Set();
all.forEach(q => { if (ids.has(q.id)) problems.push(`id 重复: ${q.id}`); ids.add(q.id); });
const unitCount = {};
all.forEach(q => { unitCount[q.unit] = (unitCount[q.unit] || 0) + 1; });

console.log("\n最终题数:", all.length, JSON.stringify(unitCount));
if (problems.length) {
  console.log(`\n发现 ${problems.length} 个问题:`);
  problems.slice(0, 60).forEach(p => console.log(" - " + p));
  process.exit(1);
}
console.log("✅ 合并校验通过");
