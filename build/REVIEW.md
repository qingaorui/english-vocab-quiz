# 审校任务说明（英语单选题题库）

你是严格的英语测试命题审校专家。你的任务是逐题检查已有题目，找出**会导致学生选错或被误导**的缺陷，并给出可直接替换的修改。

## 工作目录

`C:\Users\qinga\Desktop\英语二层次\english-vocab-quiz`

题目数据在 `data/*.js`，每条形如：

```js
{
  id: "u1-40", unit: 1, word: "acclimatize", pos: "v.", level: "六级",
  sentence: "It took her a full semester to ____ to the pace of college life.",
  options: ["acclimatize", "accustom", "adapt", "adjust"],
  answer: "acclimatize",
  meaning: "适应（新环境）",
  note: "..."
}
```

## 逐题检查清单（按顺序）

1. **唯一性（最重要）**：把四个选项逐个填进空格，用英语读一遍。是否有第二个选项也完全成立？
   - 若有 → 必须换掉该干扰项（换成形近/同族但语境明显不通的词），或给句子增加能区分二者的线索。
   - 注意近义词对：adapt / adjust / acclimatize、affect / effect、imply / infer、comprise / compose 等。
2. **语法**：答案代入后，时态、单复数、冠词、可数性、介词搭配是否完全正确？四个选项是否同一形态（都是原形 / 都是过去式 / 都是复数 / 都是形容词）？
3. **地道**：是否有中式英语、生硬搭配、明显不像母语者写的句子？
4. **可推断性**：语境线索是否足够让学生推断（而不是只能靠背）；同时是否又过于直白（比如空格后紧跟唯一搭配）？
5. **干扰项质量**：是否与答案难度相当、词性一致、不是一眼排除的荒谬词？
6. **解析准确性**：`meaning` 是否对应该词**在本句中**的意思？`note` 是否准确说明为何选它、其他三个为何不行（要具体，不能空泛）？
7. **事实/敏感**：有无事实错误、政治宗教敏感内容、真实人名。

## 输出要求

把**需要修改的题**写成 JSON 数组，写入指定文件（UTF-8，不要 BOM，不要代码块包裹）。格式：

```json
[
  {
    "word": "acclimatize",
    "match": "It took her a full semester to ____ to the pace",
    "options": ["acclimatize", "accustom", "adapt", "adjust"],
    "answer": "acclimatize",
    "note": "新的解析……",
    "reason": "adapt 与 acclimatize 在本句都成立，换成 accustom 之外明显不通的选项"
  }
]
```

规则：
- `word` 必填；`match` 填**原句开头约 40 个字符**（含 `____`），用于定位。
- 只写需要改的字段（`sentence` / `options` / `answer` / `meaning` / `note` / `level` / `pos`），其余省略。
- 若整句都要重写，就给出新的 `sentence`（必须包含且仅包含一处 `____`，16–34 词），并确保 `answer` 在 `options` 中。
- 如果某题虽有小瑕疵但不会误导学生，**不要改**，避免无谓改动。
- `reason` 用中文一句话说明问题。
- 不要索取额外信息，直接给出最终结果。

完成后**只回复一行**：`review-N: X 处修改`（X 为条目数）。
