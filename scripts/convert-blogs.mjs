// RTF blog dosyalarını temiz markdown + meta alanlara çevirir → scripts/blogs.json
// Kaynak: kullanıcının Downloads klasöründeki 10 RTF. Bir kez çalıştırılır, çıktı repoda saklanır.
// Çalıştırma: node scripts/convert-blogs.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOWNLOADS = "C:/Users/Direncinho/Downloads";

// Sıra = sitede gösterim sırası
const FILES = [
  "anlaşmalı evlilik sitesi.rtf",
  "anlaşmalı evlilik nedir.rtf",
  "anlasmalı evlilik.rtf",
  "anlaşmalı evlilik yasal mı.rtf",
  "evlilik patneri bul.rtf",
  "tayin için evlilik.rtf",
  "sözleşmeli evlilik.rtf",
  "mantık evliliği.rtf",
  "kağıt üstünde evlilik.rtf",
  "formalite evlilik.rtf",
];

// CP1252/CP1254 farklı olan baytlar (Türkçe ş/Ş dahil)
const BYTE_MAP = {
  0xba: "ş", 0xaa: "Ş",
  0xfc: "ü", 0xdc: "Ü",
  0xf6: "ö", 0xd6: "Ö",
  0xe7: "ç", 0xc7: "Ç",
  0xe2: "â", 0xc2: "Â",
  0xee: "î", 0xce: "Î",
  0xfb: "û", 0xdb: "Û",
  0xef: "ï",
};

const IGNORE_DEST = new Set([
  "fonttbl", "colortbl", "stylesheet", "generator", "info", "pict",
  "datastore", "themedata", "colorschememapping", "latentstyles",
]);

function decodeRtf(rtf) {
  let out = "";
  let i = 0;
  const n = rtf.length;
  let ucSkip = 1;
  const stack = [{ ignore: false }];
  const cur = () => stack[stack.length - 1];

  while (i < n) {
    const c = rtf[i];
    if (c === "{") {
      stack.push({ ignore: cur().ignore });
      i++;
      continue;
    }
    if (c === "}") {
      if (stack.length > 1) stack.pop();
      i++;
      continue;
    }
    if (c === "\\") {
      const nx = rtf[i + 1];
      if (nx === "\\" || nx === "{" || nx === "}") {
        if (!cur().ignore) out += nx;
        i += 2;
        continue;
      }
      if (nx === "*") {
        cur().ignore = true;
        i += 2;
        continue;
      }
      if (nx === "'") {
        const code = parseInt(rtf.substr(i + 2, 2), 16);
        if (!cur().ignore && !Number.isNaN(code)) {
          out += BYTE_MAP[code] ?? String.fromCharCode(code);
        }
        i += 4;
        continue;
      }
      // kontrol kelimesi
      let j = i + 1;
      let word = "";
      while (j < n && /[a-zA-Z]/.test(rtf[j])) { word += rtf[j]; j++; }
      let num = "";
      if (rtf[j] === "-") { num += "-"; j++; }
      while (j < n && /[0-9]/.test(rtf[j])) { num += rtf[j]; j++; }
      if (rtf[j] === " ") j++;
      i = j;

      if (IGNORE_DEST.has(word)) { cur().ignore = true; continue; }
      if (cur().ignore) continue;

      switch (word) {
        case "par": case "line": case "sect": out += "\n"; break;
        case "tab": out += "\t"; break;
        case "ldblquote": case "rdblquote": out += '"'; break;
        case "lquote": case "rquote": out += "'"; break;
        case "endash": case "emdash": out += "–"; break;
        case "bullet": out += "•"; break;
        case "uc": ucSkip = parseInt(num || "1", 10); break;
        case "u": {
          let code = parseInt(num, 10);
          if (!Number.isNaN(code)) {
            if (code < 0) code += 65536;
            if (code > 0) out += String.fromCharCode(code);
          }
          let k = 0;
          while (k < ucSkip && i < n) { i++; k++; }
          break;
        }
        default: break;
      }
      continue;
    }
    if (c === "\r" || c === "\n") { i++; continue; }
    if (!cur().ignore) out += c;
    i++;
  }
  return out;
}

// C0 kontrol karakterlerini at (\t ve \n hariç)
function stripControl(s) {
  let r = "";
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    if (code === 9 || code === 10) { r += ch; continue; }
    if (code < 32) continue;
    r += ch;
  }
  return r;
}

function isHeading(line) {
  if (/^[*•]/.test(line)) return false;
  if (/^\d+\.\s/.test(line)) return false;
  const last = line.slice(-1);
  if (last === "?") return true;
  if (".:,;!".includes(last)) return false;
  return line.length <= 70;
}

function toMarkdown(bodyLines) {
  const md = [];
  for (const line of bodyLines) {
    if (!line) continue;
    if (/^[*•]\s*/.test(line)) {
      const item = line.replace(/^[*•]\s*/, "").trim();
      if (item) md.push("- " + item);
    } else if (/^\d+\.\s+/.test(line)) {
      md.push("### " + line);
    } else if (isHeading(line)) {
      md.push("## " + line);
    } else {
      md.push(line);
    }
  }
  return md.join("\n");
}

function valueAfter(lines, label) {
  const idx = lines.findIndex((l) => l.toLowerCase() === label.toLowerCase());
  return idx >= 0 ? (lines[idx + 1] ?? "") : "";
}

const result = [];
for (let idx = 0; idx < FILES.length; idx++) {
  const file = FILES[idx];
  const full = path.join(DOWNLOADS, file);
  const raw = fs.readFileSync(full, "latin1"); // baytları ham al, decoder kendi çözer
  const decoded = stripControl(decodeRtf(raw));
  const lines = decoded.split("\n").map((s) => s.trim()).filter(Boolean);

  const keyword = valueAfter(lines, "Keyword");
  const seoTitle = valueAfter(lines, "SEO Title");
  const metaTitle = valueAfter(lines, "Meta Title");
  const metaDescription = valueAfter(lines, "Meta Description");
  const slug = valueAfter(lines, "URL Slug").replace(/^\/+/, "").trim();

  const makaleIdx = lines.findIndex((l) => l.toLowerCase() === "makale");
  let body = makaleIdx >= 0 ? lines.slice(makaleIdx + 1) : [];
  // İlk satır H1 başlığının tekrarı → at
  if (body.length) body = body.slice(1);

  const content = toMarkdown(body);

  result.push({
    slug,
    title: seoTitle,
    metaTitle,
    metaDescription,
    keyword,
    excerpt: metaDescription,
    content,
    order: idx,
  });
}

const outPath = path.join(__dirname, "blogs.json");
fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
console.log(`✓ ${result.length} blog yazısı → ${outPath}`);
for (const b of result) {
  const h2 = b.content.split("\n").filter((l) => l.startsWith("## ")).length;
  console.log(`  - ${b.slug}  (${b.content.length} kr, ${h2} H2)  title="${b.title.slice(0, 40)}..."`);
}
