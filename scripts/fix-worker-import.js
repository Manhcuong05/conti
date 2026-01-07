import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "fs";
import path from "path";

const exists = (p) => {
  try {
    statSync(p);
    return true;
  } catch {
    return false;
  }
};

const distRoots = () => {
  const roots = [];
  if (!exists("dist")) return roots;
  for (const entry of readdirSync("dist", { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    roots.push(path.join("dist", entry.name));
  }
  return roots;
};

const patchFile = (absPath, replacements) => {
  if (!exists(absPath)) return;
  let src = readFileSync(absPath, "utf8");
  let next = src;
  for (const [from, to] of replacements) next = next.replace(from, to);
  if (src !== next) writeFileSync(absPath, next);
};

const roots = distRoots();
if (roots.length === 0) process.exit(0);

for (const root of roots) {
  // If wrangler.json is missing here, copy from another dist root (CI may emit it elsewhere)
  if (!exists(path.join(root, "wrangler.json"))) {
    const fallback = roots
      .map((r) => path.join(r, "wrangler.json"))
      .find((p) => exists(p));
    if (fallback) {
      mkdirSync(root, { recursive: true });
      writeFileSync(path.join(root, "wrangler.json"), readFileSync(fallback));
    }
  }

  // Fix dynamic import in index.js if present
  patchFile(path.join(root, "index.js"), [[/\.\/user-routes"/g, "./user-routes.js\""]]);
  patchFile(path.join(root, "worker", "index.js"), [
    [/\.\/user-routes`/g, "./user-routes.js`"],
    [/\.\/user-routes"/g, "./user-routes.js\""],
    [/\.\/user-routes'/g, "./user-routes.js'"],
  ]);

  // Worker routes and entities
  patchFile(path.join(root, "worker", "user-routes.js"), [
    [/\.\/entities\b/g, "./entities.js"],
    [/\.\/core-utils\b/g, "./core-utils.js"],
    [/\.\/string-utils\b/g, "./string-utils.js"],
    [/@shared\/mock-data\b/g, "../shared/mock-data.js"],
    [/@shared\/company-registry\b/g, "../shared/company-registry.js"],
  ]);

  patchFile(path.join(root, "worker", "entities.js"), [
    [/\.\/core-utils\b/g, "./core-utils.js"],
    [/@shared\/mock-data\b/g, "../shared/mock-data.js"],
  ]);

  // Dataset -> JS module if shared/company-registry.js exists in this root
  const companyRegistryPath = path.join(root, "shared", "company-registry.js");
  if (exists(companyRegistryPath)) {
    const dataOutDir = path.join(root, "data");
    if (!exists(dataOutDir)) {
      mkdirSync(dataOutDir, { recursive: true });
    }
    const dataOut = path.join(dataOutDir, "thuvienphapluat.js");
    writeFileSync(dataOut, `export default ${readFileSync("data/thuvienphapluat.json", "utf8")};\n`);
    patchFile(companyRegistryPath, [[/\.\.\/data\/thuvienphapluat\.json\b/g, "../data/thuvienphapluat.js"]]);
  }
}
