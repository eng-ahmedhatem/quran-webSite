import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const configuredHost = process.env.VITE_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
const siteUrl = configuredHost
  ? `${configuredHost.startsWith("http") ? configuredHost : `https://${configuredHost}`}`.replace(/\/$/, "")
  : "https://quran-website-app.netlify.app";
const routes = ["/", "/read/1", "/listen", "/adhkar", "/bookmarks", "/radio", "/tv", "/timings"];
const escaped = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url><loc>${escaped(`${siteUrl}${route}`)}</loc></url>`).join("\n")}
</urlset>
`;
const robots = `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`;
const outputDirectory = resolve("dist");
const indexPath = resolve(outputDirectory, "index.html");

await mkdir(outputDirectory, { recursive: true });
const indexHtml = (await readFile(indexPath, "utf8"))
  .replace('content="/quranApp.png"', `content="${siteUrl}/quranApp.png"`)
  .replace("</head>", `  <meta property="og:url" content="${siteUrl}/" />\n  <link rel="canonical" href="${siteUrl}/" />\n</head>`);
await Promise.all([
  writeFile(resolve(outputDirectory, "sitemap.xml"), sitemap, "utf8"),
  writeFile(resolve(outputDirectory, "robots.txt"), robots, "utf8"),
  writeFile(indexPath, indexHtml, "utf8"),
]);

console.log(`Generated SEO files for ${siteUrl}`);
