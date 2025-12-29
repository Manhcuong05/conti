// Convert vsic-2007-raw.json -> vsic-2007-full.json with keywords/isConditional/conditionNote fields
const fs = require("fs");
const path = require("path");

const stripDiacritics = (str) =>
  str.normalize("NFD").replace(/\p{Diacritic}/gu, "");

const buildKeywords = (name) => {
  const noAccent = stripDiacritics(name);
  const tokens = name.split(/[^A-Za-zÀ-ỹ0-9]+/).filter(Boolean);
  const tokenNoAccent = tokens.map(stripDiacritics);
  const set = new Set([
    name.toUpperCase(),
    noAccent.toUpperCase(),
    ...tokens.map((t) => t.toUpperCase()),
    ...tokenNoAccent.map((t) => t.toUpperCase()),
  ]);
  return Array.from(set);
};

const rawPath = path.join(__dirname, "..", "shared", "vsic-2007-raw.json");
const outPath = path.join(__dirname, "..", "shared", "vsic-2007-full.json");
const raw = JSON.parse(fs.readFileSync(rawPath, "utf-8"));

const full = raw.map((item) => ({
  code: item.code,
  name: item.name,
  keywords: buildKeywords(item.name),
  isConditional: false,
  conditionNote: "",
}));

fs.writeFileSync(outPath, JSON.stringify(full, null, 2), "utf-8");
console.log(`✅ Generated ${full.length} items to ${path.relative(process.cwd(), outPath)}`);
