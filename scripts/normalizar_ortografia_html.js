const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "public");

const replacements = [
  ["Ã¡", "á"],
  ["Ã©", "é"],
  ["Ã­", "í"],
  ["Ã³", "ó"],
  ["Ãº", "ú"],
  ["Ã±", "ñ"],
  ["Ã", "Á"],
  ["Ã‰", "É"],
  ["Ã", "Í"],
  ["Ã“", "Ó"],
  ["Ãš", "Ú"],
  ["Ã‘", "Ñ"],
  ["Â¿", "¿"],
  ["Â¡", "¡"],
  ["Â©", "©"],
  ["â€¢", "•"],
  ["âš ï¸", "⚠️"],
  ["âŒ", "❌"],
  ["â­", "⭐"],
  ["Â", ""]
];

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, out);
    } else if (entry.isFile() && fullPath.toLowerCase().endsWith(".html")) {
      out.push(fullPath);
    }
  }
  return out;
}

const htmlFiles = walk(root);
let changed = 0;

for (const file of htmlFiles) {
  const original = fs.readFileSync(file, "utf8");
  let updated = original;

  for (const [bad, good] of replacements) {
    updated = updated.split(bad).join(good);
  }

  if (updated !== original) {
    fs.writeFileSync(file, updated, "utf8");
    changed += 1;
  }
}

console.log(`Archivos HTML corregidos: ${changed}`);
