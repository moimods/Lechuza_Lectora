const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "public");
const outputList = path.resolve(__dirname, "..", "bash_mojibake.log");
const outputCount = path.resolve(__dirname, "..", "bash_mojibake_count.txt");

const suspectRegex = /[\u00c2\u00c3]/;

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, out);
    } else if (entry.isFile() && fullPath.toLowerCase().endsWith(".html")) {
      const content = fs.readFileSync(fullPath, "utf8");
      if (suspectRegex.test(content)) {
        out.push(path.relative(path.resolve(__dirname, ".."), fullPath));
      }
    }
  }
  return out;
}

const files = walk(root).sort();
fs.writeFileSync(outputList, files.join("\n"), "utf8");
fs.writeFileSync(outputCount, `${files.length}\n`, "utf8");

console.log(`HTML con posible mojibake: ${files.length}`);
