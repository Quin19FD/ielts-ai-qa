const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const TARGET = "https://ielts-ai-startup.vercel.app/";
const ALLOWED_HOST = "ielts-ai-startup.vercel.app";
const ROOT_DIR = path.resolve(__dirname, "..", "..");
const SUMMARY_PATH = path.join(ROOT_DIR, "crawl-summary.json");
const BUGS_PATH = path.join(ROOT_DIR, "reports", "crawl-bugs.md");
const SCREENSHOT_DIR = path.join(ROOT_DIR, "screenshots", "crawl");

const VIEWPORTS = [
  { name: "desktop", width: 1366, height: 768 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 812 },
];

const MAX_PAGES = 80;
const NAV_TIMEOUT_MS = 20000;
const RENDER_TIMEOUT_MS = 7000;
const CTA_KEYWORDS = [
  "login",
  "sign in",
  "register",
  "sign up",
  "dashboard",
  "quick test",
  "writing practice",
  "speaking practice",
  "learning roadmap",
  "start",
  "get started",
];

const CRITICAL_ROUTE_KEYWORDS = [
  "register",
  "login",
  "dashboard",
  "quick-test",
  "quicktest",
  "writing",
  "speaking",
  "roadmap",
];

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function normalizeUrl(input, base = TARGET) {
  try {
    const u = new URL(input, base);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    u.hash = "";
    if (u.pathname.length > 1) u.pathname = u.pathname.replace(/\/+$/, "");
    return u.toString();
  } catch {
    return null;
  }
}

function isAllowedInternalUrl(urlString) {
  if (!urlString) return false;
  if (/^(mailto:|tel:)/i.test(urlString)) return false;
  const n = normalizeUrl(urlString);
  if (!n) return false;
  return new URL(n).hostname === ALLOWED_HOST;
}

function shouldIgnoreRequestFailure(url, errorText = "") {
  const u = String(url || "").toLowerCase();
  const e = String(errorText || "").toLowerCase();
  if (e.includes("net::err_aborted")) return true;
  if (u.includes("_rsc")) return true;
  if (u.includes("analytics") || u.includes("gtag") || u.includes("segment") || u.includes("mixpanel")) return true;
  if (u.includes(".woff") || u.includes(".woff2") || u.includes(".ttf") || u.includes("font")) return true;
  if (u.endsWith("/favicon.ico") || u.includes("favicon")) return true;
  if (u.includes("prefetch")) return true;
  return false;
}

function slugFromUrl(u) {
  try {
    const { pathname } = new URL(u);
    const s = pathname.replace(/^\//, "").replace(/\//g, "-");
    return s || "homepage";
  } catch {
    return "page";
  }
}

function isMeaningfulText(text) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  return t.length >= 60;
}

function severityForUrl(url, category) {
  const lower = String(url).toLowerCase();
  const core = ["dashboard", "quick", "writing", "speaking", "roadmap"];
  if (lower === TARGET.toLowerCase() || lower === TARGET.toLowerCase().replace(/\/$/, "") || lower.includes("/login") || lower.includes("/register") || core.some((k) => lower.includes(k))) {
    return category === "page_failed" || category === "broken_link" ? "Critical" : "High";
  }
  return category === "page_degraded" ? "Medium" : "Low";
}

async function extractInternalUrls(page) {
  const raw = await page.evaluate(() => {
    const out = new Set();
    const push = (v) => v && out.add(v);

    document.querySelectorAll("a[href], area[href], [data-href], [data-url], [onclick], button, [role='button'], [role='link']").forEach((el) => {
      const href = el.getAttribute("href");
      const dh = el.getAttribute("data-href");
      const du = el.getAttribute("data-url");
      const oc = el.getAttribute("onclick");
      if (href) push(href);
      if (dh) push(dh);
      if (du) push(du);
      if (oc) {
        const m = oc.match(/(?:location(?:\.href)?|window\.location)\s*=\s*['"]([^'"]+)['"]/i);
        if (m && m[1]) push(m[1]);
      }
    });
    return Array.from(out);
  });

  const normalized = new Set();
  for (const candidate of raw) {
    if (isAllowedInternalUrl(candidate)) {
      normalized.add(normalizeUrl(candidate, page.url()));
    }
  }
  return Array.from(normalized);
}

async function clickForHiddenNavigation(page) {
  const navFound = [];
  const beforeAll = page.url();
  const selectors = ["button", "[role='button']", "[role='link']", "a"];
  for (const sel of selectors) {
    const loc = page.locator(sel);
    const count = Math.min(await loc.count(), 35);
    for (let i = 0; i < count; i++) {
      const node = loc.nth(i);
      const txt = ((await node.textContent()) || "").toLowerCase().trim();
      if (!txt) continue;
      if (!CTA_KEYWORDS.some((k) => txt.includes(k))) continue;
      const href = await node.getAttribute("href");
      if (href && isAllowedInternalUrl(href)) {
        navFound.push(normalizeUrl(href, page.url()));
        continue;
      }
      const before = page.url();
      try {
        await node.click({ timeout: 1200 });
        await page.waitForTimeout(800);
        const after = page.url();
        if (after !== before && isAllowedInternalUrl(after)) {
          navFound.push(normalizeUrl(after));
        }
        if (after !== beforeAll) {
          await page.goBack({ waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS }).catch(() => {});
        }
      } catch {
        // no-op
      }
    }
  }
  return Array.from(new Set(navFound.filter(Boolean)));
}

async function waitForUiReady(page) {
  await Promise.race([
    page.waitForLoadState("domcontentloaded", { timeout: RENDER_TIMEOUT_MS }).catch(() => {}),
    page.locator("main, [role='main'], h1, h2, section, article").first().waitFor({ timeout: RENDER_TIMEOUT_MS }).catch(() => {}),
  ]);
  const bodyText = await page.locator("body").innerText().catch(() => "");
  return isMeaningfulText(bodyText);
}

async function auditSinglePage(context, url, viewportName, screenshotCounter) {
  const page = await context.newPage();
  const runtime = { consoleErrors: [], pageErrors: [], requestFailures: [] };
  page.on("console", (msg) => {
    if (msg.type() === "error") runtime.consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => runtime.pageErrors.push(String(err)));
  page.on("requestfailed", (req) => {
    const failure = req.failure();
    const errorText = failure?.errorText || "";
    const reqUrl = req.url();
    if (!shouldIgnoreRequestFailure(reqUrl, errorText)) {
      runtime.requestFailures.push({ url: reqUrl, errorText });
    }
  });

  let response = null;
  let requested = url;
  let finalUrl = url;
  let status = null;
  let title = "";
  let meaningful = false;
  let links = [];
  let clickDiscovered = [];
  let health = "failed";
  let screenshotPath = "";

  try {
    response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS });
    finalUrl = normalizeUrl(page.url()) || page.url();
    status = response ? response.status() : null;
    title = await page.title();
    meaningful = await waitForUiReady(page);
    links = await extractInternalUrls(page);
    clickDiscovered = await clickForHiddenNavigation(page);

    const hasBlockingException = runtime.pageErrors.length > 0;
    const hasSignals = runtime.consoleErrors.length > 0 || runtime.requestFailures.length > 0 || runtime.pageErrors.length > 0;
    if ((status && status >= 400) || !meaningful || (hasBlockingException && !meaningful)) {
      health = "failed";
    } else if (hasSignals) {
      health = "degraded";
    } else {
      health = "healthy";
    }

    if (health !== "healthy") {
      const shotName = `crawl-${String(screenshotCounter()).padStart(3, "0")}-${slugFromUrl(finalUrl)}-${health}.png`;
      screenshotPath = path.join("screenshots", "crawl", shotName).replace(/\\/g, "/");
      await page.screenshot({ path: path.join(ROOT_DIR, screenshotPath), fullPage: true });
    }
  } catch (err) {
    runtime.pageErrors.push(String(err));
    health = "failed";
    const shotName = `crawl-${String(screenshotCounter()).padStart(3, "0")}-${slugFromUrl(url)}-failed.png`;
    screenshotPath = path.join("screenshots", "crawl", shotName).replace(/\\/g, "/");
    await page.screenshot({ path: path.join(ROOT_DIR, screenshotPath), fullPage: true }).catch(() => {});
  } finally {
    await page.close();
  }

  return {
    requestedUrl: requested,
    finalUrl,
    redirected: normalizeUrl(requested) !== normalizeUrl(finalUrl),
    status,
    title,
    meaningful,
    links,
    clickDiscovered,
    runtime,
    health,
    screenshotPath,
    viewport: viewportName,
  };
}

function parseExistingBugs(content) {
  const rows = [];
  const chunks = String(content || "").split(/\n(?=- Bug ID:)/g);
  for (const c of chunks) {
    const url = (c.match(/- Page URL:\s*(.+)/) || [])[1]?.trim();
    const actual = (c.match(/- Actual behavior:\s*(.+)/) || [])[1]?.trim();
    if (url && actual) rows.push({ url, actual, raw: c });
  }
  return rows;
}

function buildBugEntry(bugId, issue) {
  const steps = `1. Open ${TARGET}\n2. Navigate to ${issue.url}\n3. Observe runtime/load behavior`;
  return [
    `- Bug ID: ${bugId}`,
    `- Page URL: ${issue.url}`,
    `- Steps to reproduce:`,
    steps,
    `- Expected behavior: Page renders meaningful content without blocking technical failures.`,
    `- Actual behavior: ${issue.summary}`,
    `- Severity: ${issue.severity}`,
    `- Screenshot path: ${issue.screenshotPath || "N/A"}`,
    `- Timestamp: ${issue.timestamp}`,
  ].join("\n");
}

function issueKey(issue) {
  return `${issue.url}__${issue.summary}`.toLowerCase();
}

async function run() {
  ensureDir(SCREENSHOT_DIR);
  ensureDir(path.dirname(BUGS_PATH));

  const browser = await chromium.launch({ headless: true });
  const now = new Date().toISOString();
  let shotCounter = 1;
  const nextShot = () => shotCounter++;

  const discoveredDesktop = new Set([normalizeUrl(TARGET)]);
  const queue = [normalizeUrl(TARGET)];
  const visited = new Set();
  const parentMap = new Map();
  const desktopResults = [];

  const desktopCtx = await browser.newContext({ viewport: { width: VIEWPORTS[0].width, height: VIEWPORTS[0].height } });
  while (queue.length && visited.size < MAX_PAGES) {
    const url = queue.shift();
    if (!url || visited.has(url)) continue;
    visited.add(url);
    const result = await auditSinglePage(desktopCtx, url, "desktop", nextShot);
    desktopResults.push(result);

    const merged = [...result.links, ...result.clickDiscovered].filter(Boolean);
    for (const link of merged) {
      const norm = normalizeUrl(link);
      if (!norm || !isAllowedInternalUrl(norm)) continue;
      if (!discoveredDesktop.has(norm)) discoveredDesktop.add(norm);
      if (!visited.has(norm) && !queue.includes(norm)) {
        queue.push(norm);
        parentMap.set(norm, result.finalUrl);
      }
    }
  }
  await desktopCtx.close();

  const criticalDiscovered = Array.from(discoveredDesktop).filter((u) =>
    CRITICAL_ROUTE_KEYWORDS.some((k) => u.toLowerCase().includes(k))
  );
  const criticalToValidate = Array.from(new Set([normalizeUrl(TARGET), ...criticalDiscovered]));

  const parityResults = [];
  for (const vp of VIEWPORTS.slice(1)) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    for (const u of criticalToValidate) {
      const r = await auditSinglePage(ctx, u, vp.name, nextShot);
      parityResults.push(r);
    }
    await ctx.close();
  }
  await browser.close();

  const allResults = [...desktopResults, ...parityResults];
  const issues = [];
  const issueMap = new Map();

  for (const r of allResults) {
    const baseIssue = {
      url: r.finalUrl || r.requestedUrl,
      status: r.status ?? null,
      screenshotPath: r.screenshotPath || "",
      timestamp: now,
    };

    if (r.health === "failed") {
      const statusText = r.status ? `HTTP ${r.status}` : "render/runtime failure";
      const summary = `Page failed to load in ${r.viewport} viewport (${statusText}).`;
      const i = {
        ...baseIssue,
        category: r.status && r.status >= 400 ? "broken_link" : "page_failed",
        severity: severityForUrl(baseIssue.url, r.status && r.status >= 400 ? "broken_link" : "page_failed"),
        summary,
      };
      issueMap.set(issueKey(i), i);
    }

    if (r.health === "degraded") {
      const summary = `Page loaded with technical degradation in ${r.viewport} viewport (console/page/request errors detected).`;
      const i = {
        ...baseIssue,
        category: "page_degraded",
        severity: severityForUrl(baseIssue.url, "page_degraded"),
        summary,
      };
      issueMap.set(issueKey(i), i);
    }

    if (r.runtime.pageErrors.length > 0) {
      const i = {
        ...baseIssue,
        category: "js_runtime_exception",
        severity: severityForUrl(baseIssue.url, "js_runtime_exception"),
        summary: `Unhandled JavaScript runtime exception observed (${r.runtime.pageErrors[0].slice(0, 180)}).`,
      };
      issueMap.set(issueKey(i), i);
    }

    if (r.runtime.requestFailures.length > 0) {
      const i = {
        ...baseIssue,
        category: "failed_request",
        severity: severityForUrl(baseIssue.url, "failed_request"),
        summary: `Required request failed (${r.runtime.requestFailures[0].url}).`,
      };
      issueMap.set(issueKey(i), i);
    }
  }

  for (const v of issueMap.values()) issues.push(v);

  const summary = {
    target: TARGET,
    timestamp: now,
    viewports: VIEWPORTS.map((v) => v.name),
    pagesScanned: allResults.length,
    successCount: allResults.filter((r) => r.health === "healthy").length,
    failureCount: allResults.filter((r) => r.health === "failed").length,
    skippedCount: 0,
    discoveredUrls: Array.from(discoveredDesktop).sort(),
    issues: issues.map((i) => ({
      url: i.url,
      category: i.category,
      severity: i.severity,
      status: i.status,
      summary: i.summary,
    })),
  };
  fs.writeFileSync(SUMMARY_PATH, JSON.stringify(summary, null, 2) + "\n", "utf8");

  const existing = fs.existsSync(BUGS_PATH) ? fs.readFileSync(BUGS_PATH, "utf8") : "";
  const parsedExisting = parseExistingBugs(existing);
  let nextId = 1;
  for (const m of existing.matchAll(/- Bug ID:\s*CRAWL-(\d+)/g)) {
    const n = Number(m[1]);
    if (Number.isFinite(n)) nextId = Math.max(nextId, n + 1);
  }

  const blocks = [];
  if (!existing.includes("# Crawl Bugs")) blocks.push("# Crawl Bugs");
  for (const issue of issues) {
    const duplicate = parsedExisting.find((b) => b.url === issue.url && b.actual === issue.summary);
    if (duplicate) {
      blocks.push(`\n- Additional occurrence: ${issue.timestamp} | ${issue.screenshotPath || "N/A"} | ${issue.url}`);
      continue;
    }
    const bugId = `CRAWL-${String(nextId).padStart(3, "0")}`;
    nextId += 1;
    blocks.push("\n" + buildBugEntry(bugId, issue));
  }

  if (!issues.length) {
    blocks.push("\nNo confirmed crawl defects found in this run.");
  }

  const finalReport = [existing.trim(), blocks.join("\n")].filter(Boolean).join("\n\n").trim() + "\n";
  fs.writeFileSync(BUGS_PATH, finalReport, "utf8");

  console.log(
    JSON.stringify(
      {
        message: "crawl audit completed",
        pagesScanned: summary.pagesScanned,
        issues: summary.issues.length,
        summaryPath: SUMMARY_PATH,
        bugsPath: BUGS_PATH,
      },
      null,
      2
    )
  );
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
