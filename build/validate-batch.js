/* 批次校验器：node build/validate-batch.js build/batch-01.json build/batches/01.json */
const fs = require("fs");
const path = require("path");

const LEVELS = ["四级", "六级", "更高要求"];
const POS = ["n.", "v.", "adj.", "ad.", "adv.", "prep.", "conj.", "phr.", "pron.", "num."];
const CJK = /[\u4e00-\u9fff]/;

function validate(batch, spec) {
  const errors = [];
  const warnings = [];
  const perWord = spec.perWord || 1;

  if (!Array.isArray(batch)) return { errors: ["顶层必须是数组"], warnings };

  const expected = spec.words.length * perWord;
  if (batch.length !== expected) errors.push(`题数 ${batch.length}，应为 ${expected}`);

  // 词表覆盖
  const countByWord = {};
  batch.forEach((it, i) => {
    const w = String(it.word || "").toLowerCase().trim();
    countByWord[w] = (countByWord[w] || 0) + 1;
  });
  spec.words.forEach(w => {
    const key = w.toLowerCase().trim();
    const n = countByWord[key] || 0;
    if (n !== perWord) errors.push(`词条 "${w}" 出现 ${n} 次，应为 ${perWord}`);
  });
  Object.keys(countByWord).forEach(w => {
    if (!spec.words.some(x => x.toLowerCase().trim() === w)) errors.push(`出现了词表之外的词 "${w}"`);
  });

  const sentences = new Set();
  batch.forEach((it, i) => {
    const at = `#${i + 1}(${it.word || "?"})`;
    ["word", "pos", "level", "sentence", "options", "answer", "meaning", "note"].forEach(k => {
      if (!(k in it)) errors.push(`${at} 缺少字段 ${k}`);
    });
    if (!it.word) errors.push(`${at} word 为空`);
    if (!POS.includes(it.pos)) errors.push(`${at} pos 非法: ${it.pos}`);
    if (!LEVELS.includes(it.level)) errors.push(`${at} level 非法: ${it.level}`);

    const s = String(it.sentence || "");
    const blanks = (s.match(/____/g) || []).length;
    if (blanks !== 1) errors.push(`${at} 空格标记 ${blanks} 处，应为 1 处`);
    if (/_{3,}[^_]|_{5,}/.test(s.replace(/____/g, ""))) errors.push(`${at} 句中出现多余下划线`);
    const words = s.replace(/____/g, " X ").split(/\s+/).filter(Boolean).length;
    if (words < 12 || words > 40) errors.push(`${at} 句子长度 ${words} 词（要求 12–40）`);
    if (!/[.?!]"?$/.test(s.trim())) errors.push(`${at} 句子结尾标点异常`);
    if (CJK.test(s)) errors.push(`${at} 句子中出现中文`);
    if (sentences.has(s.toLowerCase())) errors.push(`${at} 句子重复`);
    sentences.add(s.toLowerCase());

    const opts = it.options;
    if (!Array.isArray(opts) || opts.length !== 4) errors.push(`${at} 选项数不为 4`);
    else {
      const low = opts.map(o => String(o).toLowerCase().trim());
      if (new Set(low).size !== 4) errors.push(`${at} 选项重复`);
      if (low.some(o => !o)) errors.push(`${at} 存在空选项`);
      if (low.some(o => o.length > 45)) errors.push(`${at} 存在过长选项`);
      if (!low.includes(String(it.answer).toLowerCase().trim())) errors.push(`${at} answer 不在选项中`);
      const sameForm = opts.every(o => String(o).split(/\s+/).length === String(it.answer).split(/\s+/).length);
      if (spec.kind === "phrase" && !sameForm) errors.push(`${at} 短语选项词数不一致`);
    }

    if (!CJK.test(String(it.meaning || ""))) errors.push(`${at} meaning 缺少中文`);
    if (!CJK.test(String(it.note || ""))) errors.push(`${at} note 缺少中文`);
    const noteLen = String(it.note || "").length;
    if (noteLen < 20) errors.push(`${at} note 过短(${noteLen})`);
    if (noteLen > 200) errors.push(`${at} note 过长(${noteLen})`);

    if (String(it.answer).toLowerCase().trim() === String(it.meaning).toLowerCase().trim()) {
      errors.push(`${at} answer 与 meaning 相同`);
    }
    // answer 与目标词的词形一致性
    const ans = String(it.answer).toLowerCase().trim();
    const w = String(it.word).toLowerCase().trim();
    if (spec.kind === "word") {
      const stem = w.slice(0, Math.max(3, w.length - 2));
      if (!ans.startsWith(stem)) warnings.push(`${at} answer "${ans}" 与词条 "${w}" 词形差异较大（请人工确认）`);
    } else {
      const core = w.split(/\s+/).filter(x => x !== "sb" && x !== "sth" && x !== "...").pop();
      if (!ans.includes(core.slice(0, Math.max(3, core.length)))) {
        errors.push(`${at} answer "${ans}" 不含短语核心词 "${core}"`);
      }
    }

    // 噪音检查
    if (/\?\?|【|】|（手写/.test(s)) errors.push(`${at} 句子含可疑字符`);
  });

  return { errors, warnings };
}

module.exports = { validate };

if (require.main === module) {
  const [batchFile, specFile] = process.argv.slice(2);
  if (!batchFile || !specFile) {
    console.error("用法: node build/validate-batch.js <batch.json> <spec.json>");
    process.exit(2);
  }
  const batch = JSON.parse(fs.readFileSync(batchFile, "utf8"));
  const spec = JSON.parse(fs.readFileSync(specFile, "utf8"));
  const { errors, warnings } = validate(batch, spec);
  if (warnings.length) {
    console.log("WARN:");
    warnings.forEach(w => console.log("  - " + w));
  }
  if (errors.length) {
    console.log(`FAIL: ${errors.length} 个问题`);
    errors.forEach(e => console.log("  ✗ " + e));
    process.exit(1);
  }
  console.log(`PASS: ${batch.length} 题 / ${spec.words.length} 个词条`);
}
