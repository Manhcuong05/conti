const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const URL =
  "https://thuvienphapluat.vn/phap-luat-doanh-nghiep/ma-nganh-nghe-kinh-doanh.html";

async function crawlVSIC() {
  console.log("⏳ Fetching HTML...");

  const response = await axios.get(URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120",
      "Accept-Language": "vi-VN,vi;q=0.9",
    },
  });

  const html = response.data;
  console.log("HTML length:", html.length);

  const $ = cheerio.load(html);

  console.log("Paragraph count:", $("p").length);

  const results = [];

  console.log("🔍 Parsing industries...");

  $("p").each((_, el) => {
    const strong = $(el).find("strong").first();
    if (!strong.length) return;

    const code = strong.text().trim();
    const fullText = $(el).text().trim();
    const name = fullText.replace(code, "").trim();

    // Mã ngành thường là số, dài 2–5 ký tự
    if (/^\d{2,5}$/.test(code) && name.length > 2) {
      results.push({
        code,
        name,
      });
    }
  });

  console.log(`✅ Found ${results.length} industries`);

  fs.writeFileSync(
    "vsic-raw.json",
    JSON.stringify(results, null, 2),
    "utf-8"
  );

  console.log("📦 Saved to vsic-raw.json");
}

crawlVSIC().catch(err => {
  console.error("❌ Crawl failed:", err);
});
