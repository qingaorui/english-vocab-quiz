# 大学英语核心词汇 · 语境单选练习

在线体验：<https://qingaorui.github.io/english-vocab-quiz/>

一个纯静态的英语单选题网页应用：每题给出一个完整语境句，挖去其中一个词，要求从四个同词性、易混淆的选项中选出最恰当的一项。

题库共 **500 题**，词条以《大学英语》教材 Module 1–2 的 **Words and Phrases** 词汇表（Unit 1–4，p.184–189）为主干，另补充四六级高频词与教材固定搭配。句子按语境重写，不是课文原句的直接摘录。

## 题库构成

| 分类 | 内容 | 题数 |
|---|---|---|
| Unit 1 | 新生挑战（教材词汇 + 校园适应与心理延伸） | 79 |
| Unit 2 | 健康饮食（教材词汇 + 饮食营养延伸） | 78 |
| Unit 3 | 课外活动（教材词汇 + 社团、艺术与运动延伸） | 63 |
| Unit 4 | 人际关系（教材词汇 + 人际沟通延伸） | 42 |
| 四六级拓展 | 科技、环境、经济、职场、社会、心理六大主题 | 188 |
| 短语搭配 | 教材词组 25 个 × 2 题 | 50 |

难度分布：四级 257 题、六级 211 题、更高要求 32 题（按教材标记体系判定）。

## 功能

- **按题库练习**：全部 / Unit 1–4 / 四六级拓展 / 短语搭配，每个分类显示题数
- **难度筛选**：不限 / 四级 / 六级 / 更高要求，可与题库叠加
- **题量可选**：10 / 20 / 30 / 全部；出题顺序可选随机或按单元
- **即时反馈**：选完立刻判定对错，显示正确答案、词性、中文释义与搭配解析（干扰项为什么不行）
- **提示**：可查看首字母、字母数与词性
- **错题本**：答错自动收录，答对后自动移出；可单独练习错题
- **成绩页**：正确率环形图、答对/答错/得分/用时、逐题回顾
- **本地记录**：累计作答数、累计正确率、单组最佳成绩保存在浏览器 localStorage
- **快捷键**：`1`–`4` 或 `A`–`D` 选择，`Enter` 下一题，`H` 提示
- 响应式布局，桌面与手机均可使用；无任何后端与第三方依赖

## 目录结构

```
index.html              页面骨架（首页 / 答题页 / 成绩页）
styles.css              全部样式
app.js                  答题逻辑、筛选、计分、错题本、成绩页
data/unit1.js           教材 Unit 1（39 题）
data/unit1-extension.js Unit 1 延伸（40 题）
data/unit2.js           教材 Unit 2（38 题）
data/unit2-extension.js Unit 2 延伸（40 题）
data/unit3.js           教材 Unit 3（30 题）
data/unit3-extension.js Unit 3 延伸（33 题）
data/unit4.js           教材 Unit 4（12 题）
data/unit4-extension.js Unit 4 延伸（30 题）
data/extra.js           四六级拓展·第一辑（20 题）
data/cet-1.js           四六级拓展·科技与环境（80 题）
data/cet-2.js           四六级拓展·经济、职场、社会、心理（88 题）
data/phrases.js         教材短语固定搭配（50 题）
scripts/check.js        题库自检（题号、选项、空格标记、字段完整性）
scripts/dom-check.js    DOM 引用与脚本路径自检
build/                  出题流水线（词表 → 批次 JSON → 校验 → 合并）
```

## 本地运行

直接双击 `index.html` 即可；或起一个静态服务器：

```bash
npx serve .
# 或
python -m http.server 8080
```

预览模式（便于截图或演示，不属于正式功能）：

- `index.html?demo=1` 直接进入答题页
- `index.html?demo=feedback` 进入答题页并自动作答一题，停在解析状态
- `index.html?demo=answer` 作答一题后进入下一题
- `index.html?demo=result` 自动完成两题，展示成绩页

## 题库格式

每题一个对象，字段如下：

```js
{
  id: "u1-40",            // 唯一编号，同时作为错题本的键
  unit: 1,                // 1–4 对应四个单元，5 为四六级拓展，6 为短语搭配
  word: "acclimatize",    // 被挖空的词（原形）
  pos: "v.",              // 词性
  level: "六级",           // 四级 / 六级 / 更高要求
  sentence: "... to ____ to the pace of college life.", // 用四个下划线占位
  options: ["acclimatize", "accustom", "adapt", "adjust"],
  answer: "acclimatize",  // 必须是 options 中的一项；页面会随机打乱顺序
  meaning: "适应（新环境）",
  note: "解析：为什么选它，其他选项为什么不合适"
}
```

## 扩充题库的流水线

1. 在 `build/batches/NN.json` 中列出词表（`kind` 为 `word` 或 `phrase`，`perWord` 为每条词的题数）。
2. 按 `build/BRIEF.md` 的规范写题，输出 `build/batch-NN.json`（JSON 数组）。
3. 校验单批：`node build/validate-batch.js build/batch-NN.json build/batches/NN.json`
4. 合并进 `data/`：`node build/merge.js`（幂等，只读基础文件，扩展文件每次重新生成）
5. 审校意见可写成 `build/fixes-N.json`，用 `node build/patch.js build/fixes-1.json` 应用后重新合并。
6. 全量自检：`node scripts/check.js && node scripts/dom-check.js`

## 词汇来源与标记

- 依据教材词汇表的标记体系：四级词汇无标记；六级词汇 ★；更高要求词汇 *
- 应用中的 `level` 字段对应：四级 / 六级 / 更高要求
- 短语题覆盖教材词组：check in on、go viral、grow on sb、hammer out、trial and error、turn on、couple ... with、fit into、interfere with、comic strip、stick figure、speech bubble、felt-tip pen、factor in、on the spot、be inclined to、hang out、at the helm、be taken with、branch out、have sth in common、sleep in、check out、figure out、narrow down

## 部署

纯静态站点，托管在 GitHub Pages：仓库根目录即站点根目录，无需构建。
