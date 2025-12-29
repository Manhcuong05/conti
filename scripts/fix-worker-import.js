import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "fs";
import path from "path";

const exists = (p) => {
  try {
    return statSync(p).isFile() || statSync(p).isDirectory();
  } catch {
    return false;
  }
};

const detectRoot = () => {
  // Prefer dist/conti (vite plugin default)
  if (exists("dist/conti")) return "dist/conti";
  // Fallback to first dist/* with worker/user-routes.js
  try {
    const entries = readdirSync("dist", { withFileTypes: true });
    for (const d of entries) {
      if (!d.isDirectory()) continue;
      const candidate = path.join("dist", d.name);
      if (exists(path.join(candidate, "worker", "user-routes.js"))) return candidate;
    }
  } catch {}
  // Fallback to first with wrangler.json
  try {
    const entries = readdirSync("dist", { withFileTypes: true });
    for (const d of entries) {
      if (!d.isDirectory()) continue;
      const candidate = path.join("dist", d.name);
      if (exists(path.join(candidate, "wrangler.json"))) return candidate;
    }
  } catch {}
  return "dist/bizflow_b7855qf63nk7591rimhyr";
};

const ROOT = detectRoot();

const patch = (relPath, replacements) => {
  const p = path.join(ROOT, relPath);
  let src = readFileSync(p, "utf8");
  let next = src;
  for (const [from, to] of replacements) {
    next = next.replace(from, to);
  }
  if (src !== next) writeFileSync(p, next);
};

patch("index.js", [[/\.\/user-routes"/g, "./user-routes.js\""]]);

patch("worker/user-routes.js", [
  [/\.\/entities\b/g, "./entities.js"],
  [/\.\/core-utils\b/g, "./core-utils.js"],
  [/\.\/string-utils\b/g, "./string-utils.js"],
  [/@shared\/mock-data\b/g, "../shared/mock-data.js"],
  [/@shared\/company-registry\b/g, "../shared/company-registry.js"],
]);

patch("worker/entities.js", [
  [/\.\/core-utils\b/g, "./core-utils.js"],
  [/@shared\/mock-data\b/g, "../shared/mock-data.js"],
]);

const dataSrc = "data/thuvienphapluat.json";
const dataOutDir = path.join(ROOT, "data");
mkdirSync(dataOutDir, { recursive: true });
const dataOut = path.join(dataOutDir, "thuvienphapluat.js");
writeFileSync(dataOut, `export default ${readFileSync(dataSrc, "utf8")};\n`);
patch("shared/company-registry.js", [[/\.\.\/data\/thuvienphapluat\.json\b/g, "../data/thuvienphapluat.js"]]);
