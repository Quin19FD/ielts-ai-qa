# QA Testing - Huong Dan File

Tai lieu nay giai thich ten file va muc dich su dung trong du an `qa-testing`.

## 1) File goc

- `package.json`: Thong tin project Node.js va dependency (Playwright, @types/node).
- `package-lock.json`: Khoa phien ban dependency de cai dat nhat quan.
- `playwright.config.ts`: Cau hinh Playwright (thu muc test, reporter, `baseURL`, cac viewport desktop/tablet/mobile).
- `crawl-summary.json`: Ket qua tong hop sau khi chay script crawl audit.

## 2) Thu muc `reports/`

- `reports/e2e-bugs.md`: Bao cao loi E2E (luong dang ky, dang nhap, dashboard, quick test, writing, speaking, roadmap).
- `reports/ui-bugs.md`: Bao cao loi UI/validation theo viewport.
- `reports/crawl-bugs.md`: Bao cao loi crawl va mau thong tin bug crawl.

## 3) Thu muc `tests/`

### `tests/e2e/`

- `tests/e2e/authentication.spec.ts`: Test E2E cho dang ky/dang nhap.
- `tests/e2e/quick-test.spec.ts`: Test E2E cho trang quick-test.
- `tests/e2e/speaking-practice.spec.ts`: Test E2E cho speaking-practice.
- `tests/e2e/writing-practice.spec.ts`: Test E2E cho writing-practice.
- `tests/e2e/e2e-flow-audit.js`: Script audit E2E tong hop, ghi ket qua ra `reports/e2e-bugs.md` va chup anh loi vao `screenshots/e2e/`.

### `tests/crawl/`

- `tests/crawl/navigation.spec.ts`: Test route integrity/navigation cho cac route chinh.
- `tests/crawl/crawl-audit.js`: Script crawl website, ghi tong hop vao `crawl-summary.json` va bug vao `reports/crawl-bugs.md`.

### `tests/ui/`

- `tests/ui/ui-components.spec.ts`: Test UI component quan trong (skip link, search input, CTA route).

## 4) Thu muc `screenshots/`

- `screenshots/e2e/`: Anh chup loi phat sinh tu E2E tests/audit.
- `screenshots/ui/`: Anh chup loi UI tests.
- `screenshots/crawl/`: Anh chup loi crawl/navigation.

## 5) Thu muc `prompts/`

- `prompts/BUG_REPORT_PROMPT.md`: Mau prompt viet tong hop bug report.
- `prompts/CRAWL_AUDIT_PROMPT.md`: Mau prompt cho quy trinh crawl audit.
- `prompts/E2E_FLOW_PROMPT.md`: Mau prompt cho luong E2E audit.
- `prompts/TESTCASE_GENERATOR_PROMPT.md`: Mau prompt sinh test case.
- `prompts/UI_REVIEW_PROMPT.md`: Mau prompt review loi UI.

## 6) Quy uoc dat ten file

- `*-bugs.md`: File bao cao loi theo nhom.
- `*.spec.ts`: Test case Playwright.
- `*-audit.js`: Script audit tong hop, tao report va screenshot.
- `screenshots/<nhom>/<bug-id>-<mo-ta>-<viewport>-<timestamp>.png`: Anh bang chung loi.
