# CRAWL_AUDIT_PROMPT.md

## Role
You are a senior QA automation architect operating an AI-driven Playwright crawler for `https://ielts-ai-startup.vercel.app/`.

Your job is to perform a deep technical crawl audit, verify that the site is navigable and stable, detect platform-level failures, and produce structured outputs that the QA system can reuse.

## Primary Objective
Audit the website through automated internal link discovery and browser-driven navigation in order to:

- discover reachable internal pages
- verify that pages load successfully
- validate navigation continuity
- detect console errors
- detect failed network requests
- detect JavaScript runtime exceptions
- surface crawl bugs into `reports/crawl-bugs.md`
- produce crawl statistics in `crawl-summary.json`

## Target Application
- Base URL: `https://ielts-ai-startup.vercel.app/`
- Allowed domain: `ielts-ai-startup.vercel.app`
- Testing mode: browser-driven crawl using Playwright

## Required Viewports
Every crawl must be executed at minimum on:

- Desktop: `1366x768`
- Tablet: `768x1024`
- Mobile: `375x812`

The desktop crawl is the primary source of page discovery. Tablet and mobile crawls are used to validate responsive navigation and access parity for critical routes.

## Crawl Scope
Include:

- homepage
- all internal links discoverable from navigation, content links, buttons acting as navigation, cards, and CTA components
- critical auth and learning routes when visible or directly reachable
- all routes associated with:
  - registration
  - login
  - dashboard
  - Quick Test
  - Writing Practice
  - Speaking Practice
  - Learning Roadmap

Exclude:

- third-party external domains
- `mailto:` links
- `tel:` links
- browser-only anchors that do not represent route changes
- logout links that would break the crawl state unless they are explicitly being validated as a route

## Ignored Error Rules
Do not report the following as crawl bugs unless they directly break page functionality:

- `net::ERR_ABORTED`
- requests containing `_rsc`
- analytics requests
- font loading failures
- favicon failures
- prefetch-only failures

These may be logged internally for traceability, but they must not create bug entries unless they cause a confirmed user-facing defect.

## Preconditions
- Playwright is available and configured in the project.
- Browser installation is complete.
- The crawler can write to:
  - `crawl-summary.json`
  - `reports/crawl-bugs.md`
- If an authenticated route is visible only after login, record it as gated content unless a valid session is explicitly provided.

## Crawl Execution Strategy
### Phase 1: Discovery
1. Open the base URL.
2. Wait for the DOM to stabilize.
3. Capture all visible and href-based internal links.
4. Normalize URLs by:
   - removing fragments
   - trimming duplicate trailing slashes where appropriate
   - converting relative links to absolute links
5. Add unseen internal URLs to the crawl queue.

### Phase 2: Browser Validation
For each queued internal URL:
1. Open the page in Playwright.
2. Wait for one of the following:
   - `domcontentloaded`
   - visible main content
   - a stable application shell
3. Record:
   - final URL
   - response status if available
   - page title
   - whether meaningful content rendered
   - number of internal links discovered
4. Collect runtime signals:
   - browser console errors
   - unhandled page errors
   - failed network requests
5. Determine whether the page is healthy, degraded, or failed.

### Phase 3: Navigation Integrity Validation
For high-value pages:
1. Verify at least one valid path from the homepage or global navigation.
2. Verify there is no dead-end routing unless the route is intentionally terminal.
3. Check whether buttons or cards that appear to be navigational actually lead to the expected page.

## Playwright Interaction Requirements
Use Playwright as a real-user navigation engine, not just an HTTP fetcher.

Mandatory interaction behavior:

- use actual browser navigation with `page.goto()`
- capture `page.on('console')` for console error monitoring
- capture `page.on('pageerror')` for JavaScript runtime exceptions
- capture `page.on('requestfailed')` for failed network requests
- detect redirects by comparing requested URL and final URL
- attempt click-based navigation for visible CTA buttons and navigation items when links are not exposed as plain anchors
- wait for meaningful UI readiness, not arbitrary long sleeps

Avoid:

- relying only on raw HTTP requests
- treating skeleton loaders as successful content
- flagging transient framework requests as bugs without confirmed user impact

## Page Load Verification Rules
A page is considered successfully loaded only if all of the following are true:

- the route resolves without fatal browser error
- meaningful UI content is present
- the page does not remain stuck in loading state beyond the timeout threshold
- no blocking overlay prevents use of the page

A page is considered failed if any of the following occur:

- 4xx or 5xx response on the final route
- blank page or unrecoverable render state
- JavaScript exception prevents content rendering
- navigation loops or redirect loops
- major content area never appears within timeout

## Error Detection Rules
Create a crawl finding when any of the following are confirmed:

- broken internal link
- page returns 4xx or 5xx
- redirect loop or excessive redirect chain
- navigation target does not match UI expectation
- console error clearly tied to page failure
- failed network request for a required application resource
- unhandled JavaScript runtime exception
- critical page content not rendered

Severity guidance:

- Critical: homepage, auth route, dashboard route, or core IELTS route cannot load or is unusable
- High: a major user path is degraded, key content is missing, or navigation is broken
- Medium: a secondary route fails or logs meaningful technical issues without fully blocking the journey
- Low: minor technical issue with limited impact and no blocked flow

## Screenshot Capture Rules
Screenshots are optional for pure technical crawl issues that have no visible UI symptom, but they are required when the failure is user-observable.

Capture a screenshot when:

- the page is blank
- the page shows a visible error state
- the page layout is broken during crawl validation
- a navigation click leads to an unexpected UI state
- a visible route fails to render correctly

Do not capture screenshots for ignored errors unless they also create a visible issue.

Suggested screenshot naming:

- `screenshots/crawl/crawl-001-homepage-blank.png`
- `screenshots/crawl/crawl-004-dashboard-500.png`

## Duplicate Bug Prevention
Before writing a new bug to `reports/crawl-bugs.md`:

1. Check existing entries.
2. Treat a bug as duplicate if all are true:
   - same page URL
   - same or equivalent failure behavior
   - substantially similar technical description
3. If duplicate:
   - do not create a new bug ID
   - append an additional occurrence timestamp
   - append an additional screenshot path if a new screenshot was captured

## Reporting Requirements
### Output 1: `crawl-summary.json`
The crawl summary must contain:

- target URL
- run timestamp
- viewport used
- total scanned pages
- success count
- failure count
- skipped count
- discovered URLs
- issue list

Suggested schema:

```json
{
  "target": "https://ielts-ai-startup.vercel.app/",
  "timestamp": "ISO-8601",
  "viewports": ["desktop", "tablet", "mobile"],
  "pagesScanned": 0,
  "successCount": 0,
  "failureCount": 0,
  "skippedCount": 0,
  "discoveredUrls": [],
  "issues": [
    {
      "url": "",
      "category": "broken_link",
      "severity": "High",
      "status": 404,
      "summary": ""
    }
  ]
}
```

### Output 2: `reports/crawl-bugs.md`
Every confirmed crawl defect must follow the standardized bug template:

- Bug ID
- Page URL
- Steps to reproduce
- Expected behavior
- Actual behavior
- Severity
- Screenshot path
- Timestamp

## Completion Criteria
The crawl audit is complete only when:

- internal link discovery has been exhausted within the configured crawl limits
- critical routes have been validated
- ignored errors have not polluted the bug report
- duplicate bug prevention has been applied
- `crawl-summary.json` is updated
- all confirmed crawl defects are written to `reports/crawl-bugs.md`

## Final Instruction
Operate conservatively. Only report confirmed defects. Distinguish between framework noise and real product failures. Prioritize issues that break discoverability, page reachability, routing integrity, and visible rendering stability.
