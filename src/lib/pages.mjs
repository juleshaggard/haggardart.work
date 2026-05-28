import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const pageDir = pathToFileURL(resolve("src/content/pages") + "/");

export function getPageHtml(slug) {
  const html = readFileSync(new URL(`${slug}.html`, pageDir), "utf8");
  return injectMysticEnhancements(html, slug);
}

export function getProjectPageSlugs() {
  return readdirSync(pageDir)
    .filter((file) => file.endsWith(".html") && file !== "index.html")
    .map((file) => file.replace(/\.html$/, ""))
    .sort();
}

function injectMysticEnhancements(html, slug) {
  const assetPrefix = slug === "index" ? "" : "../";
  const headMarkup = [
    `<link href="${assetPrefix}assets/mystic/mystic.css" rel="stylesheet" type="text/css"/>`,
    `<link rel="preload" href="${assetPrefix}assets/mystic/vendor/gsap.min.js" as="script"/>`,
  ].join("");
  const bodyMarkup = [
    `<script defer src="${assetPrefix}assets/mystic/vendor/gsap.min.js"></script>`,
    `<script defer src="${assetPrefix}assets/mystic/vendor/ScrollTrigger.min.js"></script>`,
    `<script defer src="${assetPrefix}assets/mystic/mystic.js"></script>`,
  ].join("");

  return html.replace("</head>", `${headMarkup}</head>`).replace("</body>", `${bodyMarkup}</body>`);
}
