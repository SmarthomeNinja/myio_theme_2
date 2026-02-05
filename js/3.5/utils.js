/* utils.js – Segéd függvények */

const myioNS = "myio." + String((typeof MYIOname !== "undefined" && MYIOname) ? MYIOname : "default")
  .toLowerCase().trim().replace(/\s+/g, "_").replace(/[^\w\-]/g, "");

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => ctx.querySelectorAll(sel);

function el(tag, attrs = {}, children = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k === "html") n.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  for (const c of children) n.appendChild(c);
  return n;
}

const safe = (v, fallback = "-") => (v === null || v === undefined || v === "") ? fallback : v;

function decodeRW(v) {
  let read = 0, write = 0, val = v;
  if (val >= 10000) { read = 1; val -= 10000; }
  if (val >= 1000) { write = 1; val -= 1000; }
  return { read, write, val };
}

function toast(msg) {
  const t = $("#myio-toast");
  if (!t) return;
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(toast._tm);
  toast._tm = setTimeout(() => { t.style.display = "none"; }, 2200);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Export for other modules
window.myioUtils = { myioNS, $, $$, el, safe, decodeRW, toast, escapeHtml };
