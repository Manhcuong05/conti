import { readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";

const ROOT = "dist/bizflow_b7855qf63nk7591rimhyr";

const patch = (path, replacements) => {
  const p = `${ROOT}/${path}`;
  let src = readFileSync(p, "utf8");
  let next = src;
  for (const [from, to] of replacements) {
    next = next.replace(from, to);
  }
  if (src !== next) writeFileSync(p, next);
};

// Ensure dynamic import includes .js extension
patch("index.js", [[/\.\/user-routes"/g, "./user-routes.js\""]]);

// Fix relative/shared imports for worker modules
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

// Emit dataset as JS module so Cloudflare can load it as a module
const dataSrc = "data/thuvienphapluat.json";
const dataOutDir = path.join(ROOT, "data");
mkdirSync(dataOutDir, { recursive: true });
const dataOut = path.join(dataOutDir, "thuvienphapluat.js");
writeFileSync(dataOut, `export default ${readFileSync(dataSrc, "utf8")};\n`);
patch("shared/company-registry.js", [[/\.\.\/data\/thuvienphapluat\.json\b/g, "../data/thuvienphapluat.js"]]);
