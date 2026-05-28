import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const pageDir = pathToFileURL(resolve("src/content/pages") + "/");

export function getPageHtml(slug) {
  return readFileSync(new URL(`${slug}.html`, pageDir), "utf8");
}

export function getProjectPageSlugs() {
  return readdirSync(pageDir)
    .filter((file) => file.endsWith(".html") && file !== "index.html")
    .map((file) => file.replace(/\.html$/, ""))
    .sort();
}
