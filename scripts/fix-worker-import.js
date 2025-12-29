import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "fs";
import path from "path";

const detectRoot = () => {
  const dist = "dist";
  try {
    const entries = readdirSync(dist, { withFileTypes: true });
    const candidates = entries
      .filter((d) => d.isDirectory())
      .map((d) => path.join(dist, d.name))
      .filter((p) => {
        try {
          return statSync(path.join(p, "wrangler.json")).isFile();
        } catch {
          return false;
        }
      });
    if (candidates.length > 0) return candidates[0];
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
