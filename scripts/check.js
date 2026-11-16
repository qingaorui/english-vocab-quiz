/* 题库自检：node scripts/check.js */
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "data");
const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));
const sandbox = { window: {} };
const vm = require("vm");
const ctx = vm.createContext(sandbox);

for (const f of files) {
  const code = fs.readFileSync(path.join(dir, f), "utf8");
  vm.runInContext(code, ctx, { filename: f });
}

const bank = sandbox.window.QUIZ_BANK || [];
const problems = [];
const seen = new Set();
const words = new Map();

bank.forEach((q, i) => {
  const at = `${q.id || "#" + i}`;
  if (!q.id) problems.push(`${at}: 缺少 id`);
  if (seen.has(q.id)) problems.push(`${at}: id 重复`);
  seen.add(q.id);

  if (![1, 2, 3, 4, 5].includes(q.unit)) problems.push(`${at}: unit 非法 (${q.unit})`);
  if (!q.word) problems.push(`${at}: 缺少 word`);
  if (!q.pos) problems.push(`${at}: 缺少 pos`);
  if (!q.meaning) problems.push(`${at}: 缺少 meaning`);
  if (!q.note) problems.push(`${at}: 缺少 note`);
  if (!q.level) problems.push(`${at}: 缺少 level`);

  const blankCount = (q.sentence.match(/____/g) || []).length;
  if (blankCount !== 1) problems.push(`${at}: 空格标记数量=${blankCount}`);
  if (/\?\?|＿{2,}/.test(q.sentence)) problems.push(`${at}: 句子含可疑占位符`);

  if (!Array.isArray(q.options) || q.options.length !== 4) problems.push(`${at}: 选项数=${q.options && q.options.length}`);
  else {
    if (new Set(q.options.map(o => o.toLowerCase())).size !== 4) problems.push(`${at}: 选项重复 ${q.options}`);
    if (!q.options.includes(q.answer)) problems.push(`${at}: answer 不在选项中`);
    if (q.options.some(o => typeof o !== "string" || !o.trim())) problems.push(`${at}: 存在空选项`);
  }
  if (!q.sentence.toLowerCase().includes(q.word.toLowerCase().slice(0, 3))) {
    // 仅提示，不算错误（答案可能为屈折形式）
  }
  const key = q.word.toLowerCase();
  words.set(key, (words.get(key) || 0) + 1);
});

const byUnit = {};
bank.forEach(q => { byUnit[q.unit] = (byUnit[q.unit] || 0) + 1; });

console.log("总题数:", bank.length);
console.log("按单元:", JSON.stringify(byUnit));
console.log("不同词条:", words.size);
const multi = [...words.entries()].filter(([, n]) => n > 2);
if (multi.length) console.log("同一词出现 3 次以上:", multi);
if (problems.length) {
  console.log("\n发现 " + problems.length + " 个问题:");
  problems.forEach(p => console.log(" -", p));
  process.exit(1);
} else {
  console.log("\n✅ 题库校验通过");
}
