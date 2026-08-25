import fs from "fs";
import path from "path";

const SITE_URL = "https://firstrose.co.ke";

function formatDate(d) {
  return d.toISOString().split("T")[0];
}

async function main() {
  const outDir = path.join(process.cwd(), "public");
  const villasPath = path.join(process.cwd(), "src", "data", "villas.json");
  let villas = [];
  try {
    villas = JSON.parse(fs.readFileSync(villasPath, "utf-8"));
  } catch (e) {
    console.warn("Could not read villas.json, continuing with static routes only.");
  }

  const staticRoutes = ["/", "/villas", "/about", "/contact"];

  const urls = [...staticRoutes, ...villas.map((v) => `/villas/${v.id}`)];

  const lastmod = formatDate(new Date());

  const items = urls
    .map(
      (u) => `  <url>\n    <loc>${SITE_URL}${u}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>`;

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "sitemap.xml"), xml, "utf-8");
  console.log("sitemap.xml written to public/sitemap.xml");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
