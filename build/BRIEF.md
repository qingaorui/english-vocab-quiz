# 命题任务说明（英语语境单选题）

你是大学英语四级/六级命题专家，为《大学英语》教材词汇表配套的练习网站出题。
网站每题一句话，挖掉一个词或短语，下面四个选项，只有一个正确答案。

工作目录：`C:\Users\qinga\Desktop\英语二层次\english-vocab-quiz`

## 一、硬性规则

1. **空格**：`sentence` 中必须且只能出现一处 `____`（四个下划线），代表挖掉的词。
2. **句子**：16–34 个词，是一个完整、自然、可独立理解的长句；必须有明确的语境线索（因果、转折、对比、举例、解释、让步等）。
   - 禁止词典式定义句（如 "X refers to..."、"X means..."）。
   - 禁止以 word 的原词在句中出现（否则等于送答案）。
3. **选项**：四个选项必须**同一词性、同一语法形态**（都是动词原形 / 都是过去式 / 都是复数 / 都是形容词 / 都是短语）。
4. **唯一正确**：把四个选项逐一填进空格，只能有一个成立。有第二个也说得通，就必须换掉那个干扰项。
5. **干扰项**要"像"：形近词（adapt/adopt/adept）、同族词（sensitive/sensible）、近义但搭配不同（mitigate/alleviate 用法差异）、同类词（nutrient/vitamin/protein 但语境不合）。不要用一眼就排除的生僻词。
6. `answer` 必须是 `options` 中的一项（原样，大小写一致）；可以是屈折形式（revealed / coping / cannons / went viral），但四个选项要统一。
7. `word` 保持词条原形（如 bring / adapt / go viral），与句子中挖掉的形态无关。
8. 批内句子**不得重复**，句式要多样：不要每句都以 "The..." 开头；空格位置要有变化（句首、句中、句末都出现）。
9. 内容话题：大学生活、学习、饮食健康、社团活动、人际沟通、科技、环境、经济职场、社会文化、心理。避免政治敏感、宗教、暴力、具体真实人名。
10. 每个词条写 1 题；若 spec 里 `perWord` 为 2，则同一词条写 2 题，**两题的语境、句式、搭配必须完全不同**（不能只换主语）。
11. `meaning`：中文，10–25 字，写该词**在本句中的**释义。
12. `note`：中文，30–90 字，说明为什么选它、其他三个为什么不行（要具体到搭配或语义差异，不要写"其他选项不符合语境"这种空话）。
13. `level`：`四级` / `六级` / `更高要求`（按词频与难度判断，六级词标 `六级`，很生僻的标 `更高要求`）。
14. `pos`：`n.` `v.` `adj.` `ad.` `prep.` `conj.` `phr.`（短语用 `phr.`）

## 二、输出格式

JSON 数组，每项形如：

```json
{
  "word": "anticipate",
  "pos": "v.",
  "level": "四级",
  "sentence": "Because the professor rarely follows the syllabus to the letter, students have learned to ____ last-minute changes in the exam schedule.",
  "options": ["anticipate", "accelerate", "participate", "negotiate"],
  "answer": "anticipate",
  "meaning": "预料；预期",
  "note": "anticipate 指预料到某事会发生；accelerate 是加速，participate 需与 in 连用，negotiate 是谈判，都与提前想到无关。"
}
```

短语题的示例：

```json
{
  "word": "go viral",
  "pos": "phr.",
  "level": "六级",
  "sentence": "Rumours about the merger ____ on social media, and within hours the company's name was trending in a dozen countries.",
  "options": ["went viral", "went blank", "went missing", "went bankrupt"],
  "answer": "went viral",
  "meaning": "像病毒一样在网上迅速传播",
  "note": "go viral 指内容在网络上迅速传播；go blank 是脑子一片空白，go missing 是失踪，go bankrupt 是破产。"
}
```

写入 UTF-8（不要 BOM、不要注释、不要 Markdown 代码块包裹）。

## 三、自检（必须做）

写完后运行：

```
node build/validate-batch.js build/batch-NN.json build/batches/NN.json
```

必须看到 `PASS`。若报 `FAIL`，逐条修改后重跑，直到 PASS。WARN 也要人工确认。

## 四、质量自查（每题都过一遍）

- 把 A/B/C/D 逐个代入句子朗读：是否有第二个选项也成立？有 → 换干扰项。
- 四个选项中有没有同义/近义导致两个都对？
- 句子有没有额外泄露答案（如空格前后形成唯一固定搭配，让其他选项一读就知道错）？保留搭配线索，但别过于直白。
- `note` 是否真的解释了干扰项错在哪？
- 句子的英语是否地道（冠词、时态、单复数、介词搭配）？有没有中式英语？
- 空格处填 answer 后，整句语法是否完全正确？

## 五、交付

把最终 JSON 写到指定路径，然后**只回复一行**：`batch-NN: PASS, N 题`。
不要把 JSON 内容回复到消息里。
