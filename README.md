# 大学英语核心词汇 · 语境单选练习

一个纯静态的英语单选题网页应用：每题给出一个完整语境句，挖去其中一个词，要求从四个同词性、易混淆的选项中选出最恰当的一项。

题库共 **139 题**，词条主要取自《大学英语》教材 Module 1–2 的 **Words and Phrases** 词汇表（Unit 1–4，p.184–189），另补充四六级高频词。句子按语境重写，不是课文原句的直接摘录。

## 功能

- **按单元练习**：Unit 1 新生挑战 / Unit 2 健康饮食 / Unit 3 课外活动 / Unit 4 人际关系 / 四六级拓展 / 全部题库
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
index.html          页面骨架（首页 / 答题页 / 成绩页）
styles.css          全部样式
app.js              答题逻辑、计分、错题本、成绩页
data/unit1.js       题库分片：Unit 1（39 题）
data/unit2.js       题库分片：Unit 2（38 题）
data/unit3.js       题库分片：Unit 3（30 题）
data/unit4.js       题库分片：Unit 4（12 题）
data/extra.js       题库分片：四六级拓展（20 题）
scripts/check.js    题库自检（题号、选项、空格标记、字段完整性）
scripts/dom-check.js  DOM 引用与脚本路径自检
```

## 本地运行

直接双击 `index.html` 即可；或起一个静态服务器：

```bash
# 任选其一
npx serve .
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
  id: "u1-01",            // 唯一编号，同时作为错题本的键
  unit: 1,                // 1–4 对应四个单元，5 为四六级拓展
  word: "anticipate",     // 被挖空的词（原形）
  pos: "v.",              // 词性
  level: "四级",           // 四级 / 六级 / 更高要求
  sentence: "Because ..., students have learned to ____ last-minute changes.", // 用四个下划线占位
  options: ["anticipate", "accelerate", "participate", "negotiate"],
  answer: "anticipate",   // 必须是 options 中的一项；页面会随机打乱顺序
  meaning: "预料；预期；准备",
  note: "解析：为什么选它，其他选项为什么不合适"
}
```

新增题目时，把对象追加到对应 `data/*.js` 的 `window.QUIZ_BANK.push(...)` 中，然后运行：

```bash
node scripts/check.js
node scripts/dom-check.js
```

## 校验

```bash
node scripts/check.js      # 题号唯一、四个选项不重复、answer 在选项内、句子恰有一个空格、字段齐全
node scripts/dom-check.js  # app.js 引用的 DOM id 与脚本路径都存在
```

## 词汇来源与标记

- 依据教材词汇表的标记体系：四级词汇无标记；六级词汇 ★；更高要求词汇 *
- 应用中的 `level` 字段对应：四级 / 六级 / 更高要求；四六级拓展部分统一标注其词频层级
- 短语类词条（如 trial and error、go viral）未单独出题，其搭配以解析形式出现在相关词条下

## 部署

纯静态站点，已托管在 GitHub Pages：仓库根目录即站点根目录，无需构建。
