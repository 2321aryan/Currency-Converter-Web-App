
const API_BASE = "https://api.frankfurter.app";
const fromEl = document.getElementById("from");
const toEl   = document.getElementById("to");
const amountEl = document.getElementById("amount");
const convertBtn = document.getElementById("convertBtn");
const swapBtn = document.getElementById("swapBtn");
const resultEl = document.getElementById("result");
const rateInfoEl = document.getElementById("rateInfo");
const errorEl = document.getElementById("error");

async function fetchSymbols() {
  const res = await fetch(`${API_BASE}/currencies`);
  if (!res.ok) throw new Error("symbols fetch failed");
  const data = await res.json(); // returns object { "USD":"United States Dollar", ... }
  return data;
}

function populate(symbols, from="USD", to="EUR") {
  const entries = Object.entries(symbols).sort((a,b)=>a[0].localeCompare(b[0]));
  for (const [code, name] of entries) {
    const o1 = document.createElement("option");
    o1.value = code; o1.textContent = `${code} — ${name}`;
    fromEl.appendChild(o1);
    const o2 = o1.cloneNode(true);
    toEl.appendChild(o2);
  }
  fromEl.value = symbols[from] ? from : entries[0][0];
  toEl.value   = symbols[to] ? to : entries[1][0];
}

async function convert() {
  errorEl.textContent = "";
  const amount = parseFloat(amountEl.value) || 0;
  const from = fromEl.value;
  const to = toEl.value;
  if (amount <= 0) { errorEl.textContent = "Enter valid amount"; return; }
  if (from === to) {
    resultEl.textContent = `${amount} ${from} = ${amount.toFixed(4)} ${to}`;
    rateInfoEl.textContent = `1 ${from} = 1 ${to}`;
    return;
  }
  resultEl.textContent = "Converting...";
  try {
    // frankfurter has /latest?from=X&to=Y which returns rates object
    const url = `${API_BASE}/latest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("API error");
    const data = await res.json(); // {amount:1, base:..., date:..., rates:{TO: rate}}
    const rate = data.rates && data.rates[to];
    if (!rate) throw new Error("rate not found");
    const converted = amount * rate;
    resultEl.textContent = `${amount} ${from} = ${Number(converted).toFixed(4)} ${to}`;
    rateInfoEl.textContent = `1 ${from} = ${Number(rate).toFixed(6)} ${to} · date: ${data.date}`;
  } catch (err) {
    resultEl.textContent = "Failed to convert.";
    errorEl.textContent = "Network or API error";
  }
}

swapBtn.addEventListener("click", ()=>{ const a = fromEl.value; fromEl.value = toEl.value; toEl.value = a; });
convertBtn.addEventListener("click", convert);

(async function init(){
  try {
    const symbols = await fetchSymbols();
    populate(symbols);
    resultEl.textContent = "Ready — choose currencies and press Convert";
  } catch (e) {
    resultEl.textContent = "Could not load currencies. Check connection.";
    errorEl.textContent = "Symbols load failed";
  }
})();
