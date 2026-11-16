/* DOM 引用检查：node scripts/dom-check.js */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");

const ids = [...js.matchAll(/\$\("([^"]+)"\)/g)].map(m => m[1]);
const uniq = [...new Set(ids)];
const missing = uniq.filter(id => !html.includes('id="' + id + '"'));

// 反向检查：html 中定义了却从未使用的 id（仅提示）
const htmlIds = [...html.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
const unused = htmlIds.filter(id => !uniq.includes(id));

console.log("app.js 引用 id 数:", uniq.length);
console.log("index.html 定义 id 数:", htmlIds.length);
console.log("缺失的 id:", missing);
console.log("未被 app.js 直接引用的 id:", unused);

const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
const badScripts = scripts.filter(s => !fs.existsSync(path.join(root, s)));
console.log("脚本引用:", scripts, "缺失:", badScripts);

process.exit(missing.length || badScripts.length ? 1 : 0);
