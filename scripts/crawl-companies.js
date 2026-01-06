/**
 * Node script (ESM) to crawl company search results from:
 * - masothue.com
 * - thuvienphapluat.vn (tra cứu MST DN)
 * - hsctvn.com (có mã ngành)
 *
 * Chạy trên máy có Internet và sau khi đã chấp nhận ToS của từng trang.
 *
 * Ví dụ chạy:
 *   node scripts/crawl-companies.js --input scripts/keywords.txt --out data/masothue.json --sources=masothue --delay=2000
 *
 * Tham số:
 * - --input: file từ khóa (mỗi dòng một keyword). Mặc định scripts/keywords.txt
 * - --out: file JSON kết quả. Mặc định scripts/company-registry.json
 * - --delay: nghỉ giữa các request (ms). Mặc định 2000
 * - --sources: danh sách nguồn, cách nhau bởi dấu phẩy. Mặc định masothue,thuvienphapluat,hsctvn
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import axios from "axios";
import * as cheerio from "cheerio";

const DEFAULT_DELAY = Number(process.env.CRAWL_DELAY_MS ?? "2000");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const argv = new Map();
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (!arg.startsWith("--")) continue;
  const eqIdx = arg.indexOf("=");
  if (eqIdx !== -1) {
    const key = arg.slice(2, eqIdx);
    const val = arg.slice(eqIdx + 1);
    argv.set(key, val || "true");
  } else {
    const key = arg.slice(2);
    const next = args[i + 1];
    if (next && !next.startsWith("--")) {
      argv.set(key, next);
      i++; // skip next
    } else {
      argv.set(key, "true");
    }
  }
}

const inputFile = argv.get("input") || path.join(__dirname, "keywords.txt");
const outFile = argv.get("out") || path.join(__dirname, "company-registry.json");
const delayMs = Number(argv.get("delay") || DEFAULT_DELAY);
const maxPages = Number(argv.get("pages") || "5");
const onlySources = (argv.get("sources") || "masothue,thuvienphapluat,hsctvn")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHtml(url, label) {
  const res = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; bizflow-crawler/1.0; +https://example.com)",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "vi,en;q=0.9",
    },
    timeout: 20000,
  });
  if (typeof res.data !== "string") throw new Error(`Unexpected response for ${label}`);
  return res.data;
}

function parseMasothue(html, keyword) {
  const $ = cheerio.load(html);
  const records = [];
  $("table tbody tr").each((_, el) => {
    const tds = $(el).find("td");
    if (tds.length < 3) return;
    const name = $(tds[0]).text().trim();
    const msdn = $(tds[1]).text().trim();
    const address = $(tds[2]).text().trim();
    if (name && msdn) records.push({ name, msdn, address, source: "masothue" });
  });
  if (records.length === 0) {
    $(".tax-listing .tax-item, .list-tax .tax-item, .search-list .search-item").each((_, el) => {
      const name = $(el).find("h3, .company, .title").first().text().trim();
      const msdnText = $(el).find("p:contains('Mã số thuế'), .mst").text().trim();
      const msdnMatch = msdnText.match(/(\d{8,13})/);
      const address = $(el).find("p:contains('Địa chỉ'), .address").text().trim();
      if (name && msdnMatch) records.push({ name, msdn: msdnMatch[1], address, source: "masothue" });
    });
  }
  return { records, rawHtmlSaved: records.length === 0 ? `masothue-${keyword}.html` : undefined };
}

function parseThuvienPhapLuat(html, keyword) {
  const $ = cheerio.load(html);
  const records = [];
  $("table tbody tr").each((_, el) => {
    const tds = $(el).find("td");
    if (tds.length < 3) return;
    const name = $(tds[0]).text().trim();
    const msdn = $(tds[1]).text().trim();
    const address = $(tds[2]).text().trim();
    if (name && msdn) records.push({ name, msdn, address, source: "thuvienphapluat" });
  });
  if (records.length === 0) {
    $(".result-item, .search-item").each((_, el) => {
      const name = $(el).find("h3, .title").text().trim();
      const meta = $(el).find("p").text();
      const msdnMatch = meta.match(/(\d{8,13})/);
      const address = $(el).find("p:contains('Địa chỉ')").text().trim();
      if (name && msdnMatch) records.push({ name, msdn: msdnMatch[1], address, source: "thuvienphapluat" });
    });
  }
  return { records, rawHtmlSaved: records.length === 0 ? `thuvienphapluat-${keyword}.html` : undefined };
}

function parseHsctvn(html, keyword) {
  const $ = cheerio.load(html);
  const records = [];
  $(".company-item, .result-item, article").each((_, el) => {
    const name = $(el).find("h2, h3, .title").first().text().trim();
    if (!name) return;
    const msdnText = $(el).text();
    const msdnMatch = msdnText.match(/Mã\s*(?:số\s*)?thuế[:\s]*([\d-]{8,14})/i);
    const msnbMatch = msdnText.match(/MSNB[:\s]*([\d-]{6,14})/i);
    const address = $(el).find("p:contains('Địa'), .address").text().trim();
    const industries = [];
    $(el)
      .find("a[href*='nganh'], .industry, .tag")
      .each((_, tag) => {
        const txt = $(tag).text().trim();
        if (txt) industries.push(txt);
      });
    records.push({ name, msdn: msdnMatch?.[1], msnb: msnbMatch?.[1], address, industries: industries.length ? industries : undefined, source: "hsctvn" });
  });
  return { records, rawHtmlSaved: records.length === 0 ? `hsctvn-${keyword}.html` : undefined };
}

async function crawlKeyword(keyword) {
  const trimmed = keyword.trim();
  if (!trimmed) return [];
  const results = [];

  if (onlySources.includes("masothue")) {
    for (let page = 1; page <= maxPages; page++) {
      try {
        const html = await fetchHtml(
          `https://masothue.com/Search?q=${encodeURIComponent(trimmed)}&page=${page}`,
          `masothue ${trimmed} p${page}`
        );
        const pageRecords = parseMasothue(html, trimmed).records;
        if (pageRecords.length === 0) break;
        results.push(...pageRecords);
        await sleep(delayMs);
      } catch (err) {
        console.error("[masothue] error", trimmed, err instanceof Error ? err.message : err);
        break;
      }
    }
  }

  if (onlySources.includes("thuvienphapluat")) {
    for (let page = 1; page <= maxPages; page++) {
      try {
        const html = await fetchHtml(
          `https://thuvienphapluat.vn/ma-so-thue/tra-cuu-ma-so-thue-doanh-nghiep?timtheo=ten-doanh-nghiep&tukhoa=${encodeURIComponent(
            trimmed
          )}&page=${page}`,
          `thuvienphapluat ${trimmed} p${page}`
        );
        const pageRecords = parseThuvienPhapLuat(html, trimmed).records;
        if (pageRecords.length === 0) break;
        results.push(...pageRecords);
        await sleep(delayMs);
      } catch (err) {
        console.error("[thuvienphapluat] error", trimmed, err instanceof Error ? err.message : err);
        break;
      }
    }
  }

  if (onlySources.includes("hsctvn")) {
    for (let page = 1; page <= maxPages; page++) {
      try {
        const html = await fetchHtml(
          `https://hsctvn.com/?s=${encodeURIComponent(trimmed)}&paged=${page}`,
          `hsctvn ${trimmed} p${page}`
        );
        const pageRecords = parseHsctvn(html, trimmed).records;
        if (pageRecords.length === 0) break;
        results.push(...pageRecords);
        await sleep(delayMs);
      } catch (err) {
        console.error("[hsctvn] error", trimmed, err instanceof Error ? err.message : err);
        break;
      }
    }
  }

  return results;
}

async function main() {
  if (!fs.existsSync(inputFile)) {
    console.error(`Input file not found: ${inputFile}`);
    process.exit(1);
  }
  const keywords = fs
    .readFileSync(inputFile, "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  console.log(`Loaded ${keywords.length} keywords from ${inputFile}`);

  const all = [];
  for (const kw of keywords) {
    console.log(`\n▶ Searching: "${kw}"`);
    const res = await crawlKeyword(kw);
    console.log(`  Found ${res.length} records`);
    all.push(...res);
  }

  const dedupMap = new Map();
  for (const r of all) {
    const key = `${r.source}-${(r.msdn || "").trim()}-${r.name.trim().toUpperCase()}`;
    if (!dedupMap.has(key)) dedupMap.set(key, r);
  }
  const deduped = Array.from(dedupMap.values());
  console.log(`\nDone. Total unique records: ${deduped.length}`);

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(deduped, null, 2), "utf8");
  console.log(`Saved to ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
