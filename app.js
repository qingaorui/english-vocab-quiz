/* ============================================================
   Vocabulary in Context — 应用逻辑
   ============================================================ */
(function () {
  "use strict";

  var BANK = Array.isArray(window.QUIZ_BANK) ? window.QUIZ_BANK : [];

  var UNIT_META = {
    1: { name: "Unit 1", topic: "新生挑战" },
    2: { name: "Unit 2", topic: "健康饮食" },
    3: { name: "Unit 3", topic: "课外活动" },
    4: { name: "Unit 4", topic: "人际关系" },
    5: { name: "四六级", topic: "拓展词汇" }
  };

  var LETTERS = ["A", "B", "C", "D"];
  var STORE_STATS = "evq.stats.v1";
  var STORE_WRONG = "evq.wrong.v1";

  /* ---------- 本地存储 ---------- */
  function load(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  var stats = load(STORE_STATS, { done: 0, right: 0, best: null });
  var wrongIds = load(STORE_WRONG, []);

  function saveStats() { save(STORE_STATS, stats); }
  function saveWrong() { save(STORE_WRONG, wrongIds); }

  /* ---------- DOM ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var screens = {
    home: $("screen-home"),
    quiz: $("screen-quiz"),
    result: $("screen-result")
  };

  function showScreen(name) {
    Object.keys(screens).forEach(function (k) {
      screens[k].classList.toggle("is-active", k === name);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- 状态 ---------- */
  var config = { bank: "all", count: 10, order: "shuffle" };
  var session = null;

  /* ---------- 工具 ---------- */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function poolFor(bank) {
    if (bank === "all") return BANK.slice();
    var u = Number(bank);
    return BANK.filter(function (q) { return q.unit === u; });
  }

  function unitLabel(q) {
    var m = UNIT_META[q.unit] || { name: "拓展", topic: "" };
    return m.name + " · " + m.topic;
  }

  function blankHtml(text, filledHtml) {
    var parts = text.split("____");
    var inner = filledHtml || '<span class="blank">word</span>';
    var out = "";
    for (var i = 0; i < parts.length; i++) {
      out += parts[i];
      if (i < parts.length - 1) out += inner;
    }
    return out;
  }

  /* ---------- 首页统计 ---------- */
  function refreshHome() {
    $("stat-total").textContent = BANK.length;
    $("footer-total").textContent = BANK.length;
    $("bank-count-all").textContent = BANK.length;

    $("stat-done").textContent = stats.done;
    $("stat-acc").textContent = stats.done ? Math.round((stats.right / stats.done) * 100) + "%" : "—";
    $("stat-best").textContent = stats.best === null ? "—" : stats.best + "分";
    $("stat-wrong").textContent = wrongIds.length;
    $("nav-wrong-count").textContent = wrongIds.length;

    var wrongBtn = $("start-wrong-btn");
    wrongBtn.hidden = wrongIds.length === 0;
    $("wrong-btn-count").textContent = wrongIds.length;
  }

  /* ---------- 开始练习 ---------- */
  function startSession(items, label) {
    if (!items.length) return;
    session = {
      items: items,
      idx: 0,
      answers: [],
      right: 0,
      label: label || "",
      startedAt: Date.now()
    };
    showScreen("quiz");
    renderQuestion();
  }

  function startFromConfig() {
    var pool = poolFor(config.bank);
    if (!pool.length) return;
    var items;
    if (config.order === "shuffle") {
      items = shuffle(pool);
    } else {
      items = pool.slice().sort(function (a, b) {
        if (a.unit !== b.unit) return a.unit - b.unit;
        return String(a.id).localeCompare(String(b.id));
      });
    }
    if (config.count > 0) items = items.slice(0, config.count);
    var label = config.bank === "all" ? "全部题库" : (UNIT_META[Number(config.bank)] || {}).name;
    startSession(items, label);
  }

  function startWrongBook() {
    var items = shuffle(BANK.filter(function (q) { return wrongIds.indexOf(q.id) !== -1; }));
    if (!items.length) return;
    startSession(items, "错题本");
  }

  /* ---------- 渲染题目 ---------- */
  function currentItem() {
    return session.items[session.idx];
  }

  function renderQuestion() {
    var q = currentItem();
    var answered = session.answers[session.idx] !== undefined;
    var total = session.items.length;

    $("q-index-label").textContent = "第 " + (session.idx + 1) + " / " + total + " 题";
    $("q-acc").textContent = session.idx === 0
      ? "正确率 —"
      : "正确率 " + Math.round((session.right / session.idx) * 100) + "%";
    $("progress-fill").style.width = ((session.idx) / total) * 100 + "%";
    $("q-score").textContent = Math.round((session.right / total) * 100);

    $("q-unit").textContent = unitLabel(q);
    $("q-pos").textContent = q.pos || "—";
    $("q-level").textContent = q.level || "四级";

    $("q-sentence").innerHTML = blankHtml(q.sentence);
    $("hint-line").hidden = true;

    var wrap = $("options");
    wrap.innerHTML = "";
    var opts = shuffle(q.options);
    opts.forEach(function (word, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option";
      btn.dataset.word = word;
      btn.innerHTML = '<span class="key">' + LETTERS[i] + '</span><span class="word"></span>';
      btn.querySelector(".word").textContent = word;
      btn.addEventListener("click", function () { choose(word); });
      wrap.appendChild(btn);
    });

    var fb = $("feedback");
    fb.hidden = true;
    fb.className = "feedback";
    $("next-btn").disabled = true;
    $("next-text").textContent = session.idx === total - 1 ? "查看成绩" : "下一题";

    if (answered) {
      var choice = session.answers[session.idx];
      revealAnswer(choice);
    }

    var card = $("question-card");
    card.style.animation = "none";
    void card.offsetWidth;
    card.style.animation = "";
  }

  function choose(word) {
    if (session.answers[session.idx] !== undefined) return;
    session.answers[session.idx] = word;
    revealAnswer(word);
  }

  function revealAnswer(word) {
    var q = currentItem();
    var correct = q.answer;
    var isRight = word === correct;

    Array.prototype.forEach.call($("options").querySelectorAll(".option"), function (btn) {
      var w = btn.dataset.word;
      btn.disabled = true;
      if (w === correct) btn.classList.add("is-correct");
      else if (w === word) btn.classList.add("is-wrong");
      else btn.classList.add("is-dim");
    });

    if (isRight) {
      session.right += 1;
      if (wrongIds.indexOf(q.id) !== -1) {
        wrongIds = wrongIds.filter(function (id) { return id !== q.id; });
        saveWrong();
      }
    } else if (wrongIds.indexOf(q.id) === -1) {
      wrongIds.push(q.id);
      saveWrong();
    }
    $("nav-wrong-count").textContent = wrongIds.length;

    stats.done += 1;
    if (isRight) stats.right += 1;
    saveStats();

    var fb = $("feedback");
    fb.hidden = false;
    fb.className = "feedback " + (isRight ? "is-right" : "is-wrong");
    $("verdict").textContent = isRight ? "回答正确" : "答错了";
    $("feedback-word").textContent = q.word;
    $("feedback-meaning").innerHTML =
      '<span class="tag" style="margin-right:8px">' + (q.pos || "") + "</span>" +
      escapeHtml(q.meaning || "");
    $("feedback-note").textContent = q.note || "";

    $("next-btn").disabled = false;
    $("q-acc").textContent = "正确率 " + Math.round((session.right / (session.idx + 1)) * 100) + "%";
    $("progress-fill").style.width = ((session.idx + 1) / session.items.length) * 100 + "%";
    $("q-score").textContent = Math.round((session.right / session.items.length) * 100);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function nextQuestion() {
    if (session.idx < session.items.length - 1) {
      session.idx += 1;
      renderQuestion();
    } else {
      showResult();
    }
  }

  /* ---------- 成绩 ---------- */
  function showResult() {
    var total = session.items.length;
    var wrong = session.answers.filter(function (a, i) { return a !== session.items[i].answer; }).length;
    var right = total - wrong;
    var pct = Math.round((right / total) * 100);
    var seconds = Math.max(1, Math.round((Date.now() - session.startedAt) / 1000));
    var mm = Math.floor(seconds / 60);
    var ss = seconds % 60;

    if (stats.best === null || pct > stats.best) stats.best = pct;
    saveStats();

    $("score-num").textContent = pct + "%";
    $("score-sub").textContent = "正确率";
    $("score-ring").style.background =
      "conic-gradient(var(--indigo) 0deg, var(--cyan) " + (pct * 3.6) + "deg, rgba(255,255,255,0.07) " + (pct * 3.6) + "deg)";

    $("res-right").textContent = right;
    $("res-wrong").textContent = wrong;
    $("res-score").textContent = pct;
    $("res-time").textContent = mm + ":" + (ss < 10 ? "0" + ss : ss);

    var comment;
    if (pct >= 95) comment = "几乎满分 —— 词义、词性与搭配都拿捏得很稳，可以直接挑战更长的篇章填空了。";
    else if (pct >= 80) comment = "表现不错。把答错的几道读一遍解析，尤其是干扰项为什么不行，下次会更稳。";
    else if (pct >= 60) comment = "基础可以，但易混词还需要再辨一辨：重点看解析里的搭配提示。";
    else comment = "别急，这类题靠的是搭配感。先把错题本的解析读完，隔一天再来一轮，效果会明显不同。";
    $("result-comment").textContent = comment;
    $("result-title").textContent = session.label ? session.label + " · 练习完成" : "练习完成";

    var wrongCount = session.items.filter(function (q, i) {
      return session.answers[i] !== q.answer;
    }).length;
    var againWrong = $("again-wrong-btn");
    againWrong.hidden = wrongCount === 0;
    $("again-wrong-count").textContent = wrongCount;

    var list = $("review-list");
    list.innerHTML = "";
    session.items.forEach(function (q, i) {
      var user = session.answers[i];
      var ok = user === q.answer;
      var el = document.createElement("article");
      el.className = "review-item" + (ok ? "" : " is-wrong");
      var sentence = blankHtml(q.sentence, "<em>" + escapeHtml(q.answer) + "</em>");
      el.innerHTML =
        '<p class="rv-sentence">' + sentence + "</p>" +
        '<div class="rv-meta">' +
        "<span><b>" + escapeHtml(q.word) + "</b> " + escapeHtml(q.meaning || "") + "</span>" +
        (ok ? '<span style="color:var(--green)">✓ 你答对了</span>'
            : '<span class="rv-your">你的选择：' + escapeHtml(user || "未作答") + "</span>") +
        "</div>";
      list.appendChild(el);
    });

    refreshHome();
    showScreen("result");
  }

  /* ---------- 事件绑定 ---------- */
  function bindSegment(container, attr, onChange) {
    container.addEventListener("click", function (e) {
      var btn = e.target.closest(".seg");
      if (!btn) return;
      Array.prototype.forEach.call(container.querySelectorAll(".seg"), function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      onChange(btn.dataset[attr]);
    });
  }

  bindSegment($("bank-picker"), "bank", function (v) { config.bank = v; });
  bindSegment($("count-picker"), "count", function (v) { config.count = Number(v); });
  bindSegment($("order-picker"), "order", function (v) { config.order = v; });

  $("start-btn").addEventListener("click", startFromConfig);
  $("start-wrong-btn").addEventListener("click", startWrongBook);
  $("nav-wrong").addEventListener("click", function () {
    if (wrongIds.length) startWrongBook();
    else alert("错题本还是空的，先练一组吧。");
  });
  $("nav-home").addEventListener("click", function () { showScreen("home"); refreshHome(); });

  $("quit-btn").addEventListener("click", function () {
    if (session && session.answers.some(function (a) { return a !== undefined; })) {
      if (!confirm("确定要退出本组练习吗？已答题目会被保留在错题本中。")) return;
    }
    session = null;
    refreshHome();
    showScreen("home");
  });

  $("next-btn").addEventListener("click", nextQuestion);

  $("hint-btn").addEventListener("click", function () {
    var q = currentItem();
    if (!q) return;
    var shown = $("hint-line");
    shown.hidden = false;
    shown.textContent = "提示：首字母 " + q.word.charAt(0) + "，共 " + q.word.replace(/[^a-z]/gi, "").length + " 个字母，词性 " + (q.pos || "—");
  });

  $("again-btn").addEventListener("click", function () {
    if (BANK.length) startFromConfig();
  });

  $("again-wrong-btn").addEventListener("click", function () {
    var wrong = session.items.filter(function (q, i) { return session.answers[i] !== q.answer; });
    startSession(shuffle(wrong), "本组错题");
  });

  $("back-home-btn").addEventListener("click", function () { refreshHome(); showScreen("home"); });

  document.addEventListener("keydown", function (e) {
    if (!screens.quiz.classList.contains("is-active") || !session) return;
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea") return;

    var key = e.key.toLowerCase();
    if (key === "enter" && !$("next-btn").disabled) { e.preventDefault(); nextQuestion(); return; }
    if (key === "h") { $("hint-btn").click(); return; }

    var idx = -1;
    if (key >= "1" && key <= "4") idx = Number(key) - 1;
    else if (key === "a" || key === "b" || key === "c" || key === "d") idx = key.charCodeAt(0) - 97;

    if (idx >= 0) {
      var btns = $("options").querySelectorAll(".option");
      if (btns[idx] && !btns[idx].disabled) btns[idx].click();
    }
  });

  /* ---------- 启动 ---------- */
  refreshHome();
  if (!BANK.length) {
    $("start-btn").disabled = true;
    $("start-btn").querySelector("span").textContent = "题库加载中…";
  }

  /* 预览模式（便于截图/演示）：index.html?demo=1 | ?demo=feedback | ?demo=answer | ?demo=result */
  var demo = new URLSearchParams(window.location.search).get("demo");
  if (demo) {
    if (demo === "result") config.count = 2;
    setTimeout(function () {
      startFromConfig();
      if (demo === "answer" || demo === "feedback" || demo === "result") {
        var steps = demo === "result" ? 2 : 1;
        var done = 0;
        (function step() {
          var opt = document.querySelector("#options .option");
          if (opt && !opt.disabled) opt.click();
          setTimeout(function () {
            if (demo !== "feedback") {
              var nb = $("next-btn");
              if (nb && !nb.disabled) nb.click();
            }
            done += 1;
            if (done < steps) setTimeout(step, 40);
          }, 40);
        })();
      }
    }, 60);
  }
})();
