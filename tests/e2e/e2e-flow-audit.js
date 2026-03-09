const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const BASE_URL = "https://ielts-ai-startup.vercel.app";
const ROOT = path.resolve(__dirname, "..", "..");
const REPORT = path.join(ROOT, "reports", "e2e-bugs.md");
const SHOT_DIR = path.join(ROOT, "screenshots", "e2e");

const VIEWPORTS = [
  { name: "desktop", width: 1366, height: 768 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 812 },
];

const bugs = [];
const logsByViewport = {};
let bugNo = 1;

function now() {
  return new Date().toISOString();
}

function norm(v) {
  return String(v || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u0111\u0110]/g, "d")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function slug(v) {
  return norm(v).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72);
}

async function wait(page, ms) {
  await page.waitForTimeout(ms);
}

async function goto(page, route) {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle", timeout: 60000 });
}

async function bodyNorm(page) {
  const text = await page.evaluate(() => document.body.innerText || "");
  return norm(text);
}

async function takeShot(page, bugId, step, viewport) {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const file = `${bugId.toLowerCase()}-${slug(step)}-${viewport}-${ts}.png`;
  const abs = path.join(SHOT_DIR, file);
  await page.screenshot({ path: abs, fullPage: true });
  return `screenshots/e2e/${file}`;
}

async function addBug(page, data) {
  const key = `${data.route}|${norm(data.step)}|${norm(data.actual).slice(0, 220)}`;
  const existing = bugs.find((b) => b.key === key);
  if (existing) {
    const ss = await takeShot(page, existing.id, data.step, data.viewport);
    if (!existing.viewports.includes(data.viewport)) existing.viewports.push(data.viewport);
    existing.occurrences.push(now());
    existing.screenshots.push(ss);
    return;
  }
  const id = `E2E-${String(bugNo).padStart(3, "0")}`;
  bugNo += 1;
  const ss = await takeShot(page, id, data.step, data.viewport);
  bugs.push({
    key,
    id,
    url: `${BASE_URL}${data.route}`,
    route: data.route,
    step: data.step,
    expected: data.expected,
    actual: data.actual,
    severity: data.severity,
    category: data.category,
    userType: data.userType,
    viewports: [data.viewport],
    screenshots: [ss],
    timestamp: now(),
    occurrences: [],
  });
}

function attachLogs(context, viewportName) {
  logsByViewport[viewportName] = logsByViewport[viewportName] || {
    console: new Set(),
    page: new Set(),
    request: new Set(),
  };
  const store = logsByViewport[viewportName];
  const onPage = (page) => {
    page.on("console", (m) => {
      if (m.type() === "error" || m.type() === "warning") store.console.add(`${m.type()}: ${m.text()}`);
    });
    page.on("pageerror", (e) => store.page.add(String(e.message || e)));
    page.on("requestfailed", (r) => {
      const err = r.failure() ? r.failure().errorText : "";
      if (!err || /ERR_ABORTED/i.test(err)) return;
      store.request.add(`${r.method()} ${r.url()} :: ${err}`);
    });
  };
  context.on("page", onPage);
  context.pages().forEach(onPage);
}

async function findIdx(page, selector, phrases) {
  return await page.$$eval(
    selector,
    (els, p) => {
      const n = (v) =>
        String(v || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[\u0111\u0110]/g, "d")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();
      const tg = p.map(n);
      const visible = (el) => {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return s.display !== "none" && s.visibility !== "hidden" && r.width > 1 && r.height > 1;
      };
      for (let i = 0; i < els.length; i += 1) {
        const el = els[i];
        if (!visible(el)) continue;
        if (el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") continue;
        const t = n(el.innerText || el.textContent || "");
        if (!t) continue;
        if (tg.some((x) => t.includes(x))) return i;
      }
      return -1;
    },
    phrases
  );
}

async function clickText(page, phrases, selector = "button") {
  const idx = await findIdx(page, selector, phrases);
  if (idx < 0) return false;
  await page.locator(selector).nth(idx).click({ timeout: 12000 }).catch(() => {});
  return true;
}

async function runViewport(browser, vp) {
  const state = { creds: null, authed: false };
  console.log(`[RUN] ${vp.name}`);

  const regCtx = await browser.newContext({ viewport: vp });
  attachLogs(regCtx, vp.name);
  const reg = await regCtx.newPage();

  await goto(reg, "/register");
  await reg.click('form button[type="submit"]');
  await wait(reg, 1000);
  const empty = await reg.evaluate(() => {
    const f = document.querySelector('input[name="fullName"]');
    const e = document.querySelector('input[name="email"]');
    const p = document.querySelector('input[name="password"]');
    const required = [f, e, p].filter(Boolean);
    const nativeInvalid = required.filter((x) => !x.checkValidity()).length;
    const ariaInvalid = required.filter((x) => x.getAttribute("aria-invalid") === "true").length;

    const vis = (el) => {
      if (!el) return false;
      const s = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return s.display !== "none" && s.visibility !== "hidden" && r.width > 1 && r.height > 1;
    };
    const normText = (v) =>
      String(v || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\u0111\u0110]/g, "d")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();

    const warningSelectors = [
      '[role="alert"]',
      '[aria-live]',
      ".error",
      ".form-error",
      ".field-error",
      '[data-testid*="error"]',
      '[class*="error"]',
      '[class*="invalid"]',
    ];
    const warningNodes = [...document.querySelectorAll(warningSelectors.join(","))].filter(vis);
    const warningText = warningNodes.map((n) => n.innerText || n.textContent || "").join(" ");
    const bodyText = document.body ? document.body.innerText || "" : "";
    const t = normText(`${warningText} ${bodyText}`);
    const hasWarningText = [
      "bat buoc",
      "khong duoc de trong",
      "vui long nhap",
      "required",
      "invalid",
      "khong hop le",
      "loi",
      "error",
    ].some((k) => t.includes(k));

    const u = new URL(location.href);
    const requiredKeys = ["fullName", "email", "password"];
    const hasRequiredQuery = requiredKeys.some((k) => u.searchParams.has(k));
    const allRequiredEmpty = requiredKeys.every((k) => u.searchParams.has(k) && !u.searchParams.get(k));
    const badQuery = hasRequiredQuery && allRequiredEmpty;

    const hasVisibleWarning = hasWarningText || ariaInvalid > 0 || warningNodes.length > 0 || nativeInvalid > 0;
    return { url: location.href, path: location.pathname, nativeInvalid, ariaInvalid, hasVisibleWarning, badQuery };
  });
  const badUrlState = !empty.path.endsWith("/register") || empty.badQuery;
  const missingWarning = !empty.hasVisibleWarning;
  if (missingWarning && badUrlState) {
    await addBug(reg, {
      route: "/register",
      step: "Empty register submit",
      expected: "Block empty submit with visible validation and clean URL.",
      actual: `url=${empty.url}; nativeInvalid=${empty.nativeInvalid}; ariaInvalid=${empty.ariaInvalid}; hasVisibleWarning=${empty.hasVisibleWarning}; badQuery=${empty.badQuery}`,
      severity: "High",
      category: "auth/ui",
      userType: "new user",
      viewport: vp.name,
    });
  }

  await goto(reg, "/register");
  await reg.fill('input[name="fullName"]', "QA Student");
  await reg.fill('input[name="email"]', "invalid@@mail");
  await reg.fill('input[name="password"]', "ValidPass123!");
  await reg.click('form button[type="submit"]');
  await wait(reg, 1200);
  const invalidEmail = await reg.evaluate(() => {
    const e = document.querySelector('input[name="email"]');
    return { path: location.pathname, ok: e ? !e.checkValidity() : false };
  });
  if (!invalidEmail.path.endsWith("/register") || !invalidEmail.ok) {
    await addBug(reg, { route: "/register", step: "Invalid email register submit", expected: "Reject malformed email.", actual: `path=${invalidEmail.path}; emailInvalid=${invalidEmail.ok}`, severity: "High", category: "auth/validation", userType: "invalid input", viewport: vp.name });
  }

  await goto(reg, "/register");
  await reg.fill('input[name="fullName"]', "LongName".repeat(180));
  await reg.fill('input[name="email"]', `qa.long.${Date.now()}@example.com`);
  await reg.fill('input[name="password"]', "LongPass123!".repeat(40));
  await reg.click('form button[type="submit"]');
  await wait(reg, 2500);
  const longLen = await reg.evaluate(() => (document.body.innerText || "").trim().length);
  if (longLen < 80) {
    await addBug(reg, { route: "/register", step: "Long input register submit", expected: "Handle extreme inputs safely.", actual: `body length dropped to ${longLen}`, severity: "Medium", category: "ui/stability", userType: "invalid input", viewport: vp.name });
  }

  await goto(reg, "/register");
  const email = `qa_e2e_${vp.name}_${Date.now()}@example.com`;
  const password = "ValidPass123!";
  await reg.fill('input[name="fullName"]', `QA ${vp.name}`);
  await reg.fill('input[name="email"]', email);
  await reg.fill('input[name="password"]', password);
  await reg.click('form button[type="submit"]');
  await wait(reg, 6500);
  if (!/\/dashboard|\/login/.test(reg.url())) {
    await addBug(reg, { route: "/register", step: "Valid register submit", expected: "Route to success step.", actual: `unexpected URL ${reg.url()}`, severity: "Critical", category: "auth", userType: "new user", viewport: vp.name });
  }
  state.creds = { email, password };
  await regCtx.close();

  const ctx = await browser.newContext({ viewport: vp });
  attachLogs(ctx, vp.name);
  const page = await ctx.newPage();

  await goto(page, "/login");
  await page.fill('input[name="identity"]', `notfound_${Date.now()}@example.com`);
  await page.fill('input[name="password"]', "WrongPass123!");
  await page.click('form button[type="submit"]');
  await wait(page, 2500);
  const badText = await bodyNorm(page);
  if (!/\/login/.test(page.url()) || !(badText.includes("sai") || badText.includes("invalid") || badText.includes("error"))) {
    await addBug(page, { route: "/login", step: "Invalid login attempt", expected: "Stay on /login with visible error.", actual: `url=${page.url()} with weak/no feedback`, severity: "High", category: "auth/validation", userType: "invalid input", viewport: vp.name });
  }

  await goto(page, "/login");
  await page.fill('input[name="identity"]', state.creds.email);
  await page.fill('input[name="password"]', state.creds.password);
  await page.click('form button[type="submit"]');
  await wait(page, 7000);
  state.authed = /\/dashboard/.test(page.url()) && !(await bodyNorm(page)).includes("ban can dang nhap de xem noi dung nay");
  if (!state.authed) {
    await addBug(page, { route: "/login", step: "Valid login attempt", expected: "Enter authenticated dashboard.", actual: `did not reach authenticated dashboard, URL=${page.url()}`, severity: "Critical", category: "auth", userType: "existing valid user", viewport: vp.name });
    await ctx.close();
    return;
  }

  const nav = [
    ["/dashboard", ["hom nay chi can 1 viec chinh", "tao lo trinh hoc dau tien"]],
    ["/quick-test", ["kiem tra nhanh", "chon ky nang can kiem tra"]],
    ["/writing-practice", ["luyen viet", "chon dang bai"]],
    ["/speaking-practice", ["luyen noi", "chon phan thi"]],
    ["/learning-roadmap", ["lo trinh hoc tap", "tao lo trinh"]],
  ];
  let sig = "";
  for (const [route, keys] of nav) {
    const okClick = await page.locator(`a[href="${route}"]`).first().click().then(() => true).catch(() => false);
    await wait(page, 2400);
    const bn = await bodyNorm(page);
    if (!okClick || !page.url().includes(route) || !keys.some((k) => bn.includes(k))) {
      await addBug(page, { route, step: `Dashboard navigation to ${route}`, expected: "Sidebar click updates route and content panel.", actual: `click=${okClick}; url=${page.url()}`, severity: "High", category: "navigation", userType: "existing valid user", viewport: vp.name });
    }
    const s = bn.slice(0, 210);
    if (sig && s === sig && route !== "/dashboard") {
      await addBug(page, { route, step: `Stale content check ${route}`, expected: "Content should change after navigation.", actual: "content signature unchanged", severity: "Medium", category: "navigation/ui", userType: "existing valid user", viewport: vp.name });
    }
    sig = s;
  }

  await goto(page, "/quick-test");
  const startedQT = await clickText(page, ["bat dau lam bai", "bat dau"], "button");
  await wait(page, 4000);
  if (!startedQT || !/\/quick-test\/runner/.test(page.url())) {
    await addBug(page, { route: "/quick-test", step: "Quick Test start", expected: "Open runner and allow answering.", actual: `start=${startedQT}; url=${page.url()}`, severity: "High", category: "quick-test", userType: "existing valid user", viewport: vp.name });
  } else {
    let result = false;
    for (let i = 0; i < 22; i += 1) {
      const b = await bodyNorm(page);
      if (b.includes("ket qua") || b.includes("diem hien tai") || b.includes("goi y lo trinh") || b.includes("band hien tai")) {
        result = true;
        break;
      }
      const opt = await page.$$eval("button", (btns) => {
        const v = (e) => { const s = getComputedStyle(e); const r = e.getBoundingClientRect(); return s.display !== "none" && s.visibility !== "hidden" && r.width > 1 && r.height > 1; };
        for (let i = 0; i < btns.length; i += 1) {
          const t = (btns[i].innerText || btns[i].textContent || "").replace(/\s+/g, " ").trim();
          if (v(btns[i]) && /^[A-D]\.\s/.test(t)) return i;
        }
        return -1;
      });
      if (opt >= 0) await page.locator("button").nth(opt).click().catch(() => {});
      if (!(await clickText(page, ["tiep theo"], "button"))) await clickText(page, ["nop bai", "xem ket qua", "hoan thanh"], "button");
      await wait(page, 1000);
    }
    if (!result) {
      await addBug(page, { route: "/quick-test", step: "Quick Test complete+submit", expected: "Finish and see result feedback.", actual: "could not reach result state after answer/submit attempts", severity: "High", category: "quick-test", userType: "existing valid user", viewport: vp.name });
    }
  }

  await goto(page, "/writing-practice");
  const startedW = await clickText(page, ["tao de va bat dau viet", "tao de"], "button");
  await wait(page, 3500);
  if (!startedW) {
    await addBug(page, { route: "/writing-practice", step: "Writing start", expected: "Generate prompt and editor.", actual: "cannot trigger writing start action", severity: "High", category: "writing/ui", userType: "existing valid user", viewport: vp.name });
  } else {
    const ta = await page.$$eval("textarea", (areas) => {
      const n = (v) => String(v || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\u0111\u0110]/g, "d").toLowerCase();
      const vis = (el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return s.display !== "none" && s.visibility !== "hidden" && r.width > 1 && r.height > 1; };
      for (let i = 0; i < areas.length; i += 1) {
        if (!vis(areas[i])) continue;
        const ph = n(areas[i].getAttribute("placeholder") || "");
        if (ph.includes("vi du") && ph.includes("toi nen hoc gi truoc")) continue;
        return i;
      }
      return -1;
    });
    if (ta < 0) {
      await addBug(page, { route: "/writing-practice", step: "Writing editor availability", expected: "Visible essay textarea after start.", actual: "no visible essay textarea found", severity: "High", category: "writing/ui", userType: "existing valid user", viewport: vp.name });
    } else {
      const essay = ("Technology and education should be integrated with careful policy and digital literacy support. ").repeat(55);
      await page.locator("textarea").nth(ta).fill(essay);
      const len = await page.locator("textarea").nth(ta).inputValue().then((v) => v.length).catch(() => 0);
      if (len < 1200) {
        await addBug(page, { route: "/writing-practice", step: "Writing long input", expected: "Accept realistic and long essays.", actual: `editor stored only ${len} chars`, severity: "Medium", category: "writing/input", userType: "existing valid user", viewport: vp.name });
      }
      const submitted = await clickText(page, ["nop bai", "ai cham", "submit"], "button");
      if (!submitted) {
        await addBug(page, { route: "/writing-practice", step: "Writing submit action", expected: "User can submit essay to AI.", actual: "submit button not found/clickable", severity: "High", category: "writing/ui", userType: "existing valid user", viewport: vp.name });
      } else {
        let fb = false;
        for (let i = 0; i < 35; i += 1) {
          await wait(page, 2000);
          const b = await bodyNorm(page);
          if (["feedback", "nhan xet", "goi y", "lexical", "coherence", "task response", "band", "diem"].some((k) => b.includes(k))) { fb = true; break; }
        }
        if (!fb) {
          await addBug(page, { route: "/writing-practice", step: "Writing AI feedback rendering", expected: "Non-empty AI feedback appears.", actual: "no feedback/result after submit wait window", severity: "High", category: "writing/ai", userType: "existing valid user", viewport: vp.name });
        }
      }
    }
  }

  await goto(page, "/speaking-practice");
  const startedS = await clickText(page, ["tao de bai", "bat dau luyen", "tao de"], "button");
  await wait(page, 4000);
  if (!startedS) {
    await addBug(page, { route: "/speaking-practice", step: "Speaking start", expected: "Generate speaking task flow.", actual: "cannot trigger speaking start action", severity: "High", category: "speaking/ui", userType: "existing valid user", viewport: vp.name });
  } else {
    const hasRec = (await findIdx(page, "button", ["ghi am", "bat dau ghi", "record"])) >= 0;
    const hasUp = (await page.locator('input[type="file"]').count()) > 0 || (await findIdx(page, "button", ["tai len", "upload"])) >= 0;
    if (!hasRec && !hasUp) {
      await addBug(page, { route: "/speaking-practice", step: "Speaking media controls", expected: "Show recording or upload path.", actual: "no recording/upload controls after start", severity: "High", category: "speaking", userType: "existing valid user", viewport: vp.name });
    } else {
      if (hasRec) {
        await clickText(page, ["ghi am", "bat dau ghi", "record"], "button");
        await wait(page, 2500);
        const b = await bodyNorm(page);
        const okState = b.includes("microphone") || b.includes("permission") || b.includes("quyen") || (await findIdx(page, "button", ["dung ghi", "stop"])) >= 0;
        if (!okState) {
          await addBug(page, { route: "/speaking-practice", step: "Speaking permission/recording response", expected: "Record click should start recording or show permission message.", actual: "record click produced no clear state change", severity: "Medium", category: "speaking/media", userType: "existing valid user", viewport: vp.name });
        }
      }
      const sub = await clickText(page, ["nop bai", "xem ket qua", "cham bai", "hoan thanh"], "button");
      if (sub) {
        await wait(page, 5000);
        const b = await bodyNorm(page);
        if (!(b.includes("feedback") || b.includes("nhan xet") || b.includes("band") || b.includes("diem"))) {
          await addBug(page, { route: "/speaking-practice", step: "Speaking score/feedback rendering", expected: "Show speaking result after submit.", actual: "no score/feedback after submission attempt", severity: "High", category: "speaking/ai", userType: "existing valid user", viewport: vp.name });
        }
      }
    }
  }

  await goto(page, "/learning-roadmap");
  const openRoad = await clickText(page, ["tao lo trinh ngay", "tao lo trinh"], "button");
  await wait(page, 2200);
  if (!openRoad || (await page.locator('[role="dialog"]').count()) === 0) {
    await addBug(page, { route: "/learning-roadmap", step: "Roadmap open/create dialog", expected: "Open roadmap creation dialog.", actual: `open=${openRoad}; dialog=${(await page.locator('[role=\"dialog\"]').count()) > 0}`, severity: "High", category: "roadmap/ui", userType: "existing valid user", viewport: vp.name });
  } else {
    const cb = page.locator('[role="dialog"] input[type="checkbox"]').first();
    if ((await cb.count()) > 0) await cb.click().catch(() => {});
    const create = (await clickText(page, ["tao lo trinh"], '[role="dialog"] button')) || (await clickText(page, ["tao lo trinh"], "button"));
    if (!create) {
      await addBug(page, { route: "/learning-roadmap", step: "Roadmap submit action", expected: "Submit roadmap request.", actual: "cannot click create roadmap button", severity: "High", category: "roadmap/ui", userType: "existing valid user", viewport: vp.name });
    } else {
      let updated = false;
      for (let i = 0; i < 30; i += 1) {
        await wait(page, 2000);
        const b = await bodyNorm(page);
        if (!b.includes("chua co lo trinh hoc tap") || b.includes("tuan 1") || b.includes("bai hoc")) { updated = true; break; }
      }
      if (!updated) {
        await addBug(page, { route: "/learning-roadmap", step: "Roadmap content update", expected: "Roadmap updates after submit.", actual: "roadmap remained empty after submission", severity: "High", category: "roadmap/ai", userType: "existing valid user", viewport: vp.name });
      }
    }
  }

  await clickText(page, ["dang xuat"], "button");
  await ctx.close();
}

function renderReport() {
  const formatScreenshotLinks = (paths) => {
    return paths
      .map((p) => {
        const normalized = String(p || "").replace(/\\/g, "/");
        const rel = normalized.startsWith("screenshots/") ? `../${normalized}` : normalized;
        const name = rel.split("/").pop() || rel;
        return `[${name}](${rel})`;
      })
      .join("; ");
  };

  const stepVi = {
    "Empty register submit": "Gửi form đăng ký rỗng",
    "Invalid email register submit": "Gửi form đăng ký với email sai định dạng",
    "Long input register submit": "Gửi form đăng ký với dữ liệu quá dài",
    "Valid register submit": "Gửi form đăng ký hợp lệ",
    "Invalid login attempt": "Đăng nhập với thông tin sai",
    "Valid login attempt": "Đăng nhập với thông tin hợp lệ",
    "Quick Test start": "Bắt đầu Quick Test",
    "Quick Test complete+submit": "Hoàn thành và nộp Quick Test",
    "Writing start": "Bắt đầu Writing",
    "Writing editor availability": "Kiểm tra editor Writing",
    "Writing long input": "Nhập bài Writing dài",
    "Writing submit action": "Nộp bài Writing",
    "Writing AI feedback rendering": "Kiểm tra phản hồi AI cho Writing",
    "Speaking start": "Bắt đầu Speaking",
    "Speaking media controls": "Kiểm tra control ghi âm/upload Speaking",
    "Speaking permission/recording response": "Kiểm tra phản hồi quyền/ghi âm Speaking",
    "Speaking score/feedback rendering": "Kiểm tra điểm/feedback Speaking",
    "Roadmap open/create dialog": "Mở dialog tạo lộ trình",
    "Roadmap submit action": "Gửi yêu cầu tạo lộ trình",
    "Roadmap content update": "Kiểm tra cập nhật nội dung lộ trình",
  };

  const expectedVi = {
    "Block empty submit with visible validation and clean URL.": "Chặn submit rỗng, hiển thị cảnh báo hợp lệ và giữ URL sạch.",
    "Reject malformed email.": "Từ chối email sai định dạng.",
    "Handle extreme inputs safely.": "Xử lý dữ liệu cực đoan an toàn.",
    "Route to success step.": "Điều hướng đến bước thành công.",
    "Stay on /login with visible error.": "Ở lại /login và hiển thị lỗi rõ ràng.",
    "Enter authenticated dashboard.": "Vào dashboard đã xác thực.",
    "Sidebar click updates route and content panel.": "Click sidebar phải cập nhật route và nội dung.",
    "Content should change after navigation.": "Nội dung phải thay đổi sau điều hướng.",
    "Open runner and allow answering.": "Mở màn hình làm bài và cho phép trả lời.",
    "Finish and see result feedback.": "Hoàn thành và thấy kết quả/phản hồi.",
    "Generate prompt and editor.": "Tạo đề và mở editor.",
    "Visible essay textarea after start.": "Hiển thị textarea viết bài sau khi bắt đầu.",
    "Accept realistic and long essays.": "Chấp nhận bài viết dài hợp lệ.",
    "User can submit essay to AI.": "Người dùng có thể nộp bài cho AI.",
    "Non-empty AI feedback appears.": "Hiển thị phản hồi AI không rỗng.",
    "Generate speaking task flow.": "Tạo flow bài Speaking.",
    "Show recording or upload path.": "Hiển thị lựa chọn ghi âm hoặc tải lên.",
    "Record click should start recording or show permission message.": "Bấm ghi âm phải bắt đầu ghi hoặc báo quyền truy cập.",
    "Show speaking result after submit.": "Hiển thị kết quả Speaking sau khi nộp.",
    "Open roadmap creation dialog.": "Mở dialog tạo lộ trình.",
    "Submit roadmap request.": "Gửi yêu cầu tạo lộ trình.",
    "Roadmap updates after submit.": "Lộ trình được cập nhật sau khi gửi.",
  };

  const userTypeVi = {
    "new user": "người dùng mới",
    "invalid input": "dữ liệu đầu vào không hợp lệ",
    "existing valid user": "người dùng hiện có hợp lệ",
  };

  const severityVi = {
    Critical: "Nghiêm trọng",
    High: "Cao",
    Medium: "Trung bình",
    Low: "Thấp",
  };

  const actualVi = (text) => {
    const s = String(text || "");
    if (s === "content signature unchanged") return "Dấu hiệu nội dung không thay đổi.";
    if (s === "record click produced no clear state change") return "Bấm ghi âm không tạo thay đổi trạng thái rõ ràng.";
    if (s === "cannot trigger writing start action") return "Không kích hoạt được hành động bắt đầu Writing.";
    if (s === "no visible essay textarea found") return "Không tìm thấy textarea viết bài hiển thị.";
    if (s === "submit button not found/clickable") return "Không tìm thấy hoặc không bấm được nút nộp bài.";
    if (s === "no feedback/result after submit wait window") return "Không có phản hồi/kết quả trong thời gian chờ sau khi nộp.";
    if (s === "cannot trigger speaking start action") return "Không kích hoạt được hành động bắt đầu Speaking.";
    if (s === "no recording/upload controls after start") return "Không có control ghi âm/tải lên sau khi bắt đầu.";
    if (s === "no score/feedback after submission attempt") return "Không có điểm/phản hồi sau khi thử nộp.";
    if (s === "cannot click create roadmap button") return "Không bấm được nút tạo lộ trình.";
    if (s === "roadmap remained empty after submission") return "Lộ trình vẫn rỗng sau khi gửi.";
    return s.replace("with weak/no feedback", "nhưng phản hồi lỗi yếu/không rõ");
  };

  const stepTextVi = (step) => {
    const s = String(step || "");
    if (stepVi[s]) return stepVi[s];
    if (s.startsWith("Stale content check ")) {
      const route = s.slice("Stale content check ".length);
      return `Kiểm tra nội dung cũ ${route}`;
    }
    if (s.startsWith("Dashboard navigation to ")) {
      const route = s.slice("Dashboard navigation to ".length);
      return `Điều hướng dashboard tới ${route}`;
    }
    return s;
  };

  const lines = [];
  lines.push("# Báo cáo lỗi E2E", "", `Thời điểm tạo: ${now()}`, `Mục tiêu: ${BASE_URL}`, "");
  if (!bugs.length) lines.push("Không ghi nhận lỗi E2E đã xác nhận trong lần chạy này.", "");
  for (const b of bugs) {
    const bugName = stepTextVi(b.step);
    lines.push(`- Mã lỗi: ${b.id}`);
    lines.push(`- Tên lỗi: ${bugName}`);
    lines.push(`- URL trang: ${b.url}`);
    lines.push("- Các bước tái hiện:");
    lines.push(`  1. Mở ${b.route} trên viewport ${b.viewports.join(", ")}.`);
    lines.push(`  2. Thực hiện bước: ${bugName}.`);
    lines.push("  3. Quan sát hành vi thực tế.");
    lines.push(`- Hành vi mong đợi: ${expectedVi[b.expected] || b.expected}`);
    lines.push(`- Hành vi thực tế: ${actualVi(b.actual)}`);
    lines.push(`- Mức độ: ${severityVi[b.severity] || b.severity}`);
    lines.push(`- Đường dẫn ảnh chụp: ${formatScreenshotLinks(b.screenshots)}`);
    lines.push(`- Thời gian ghi nhận: ${b.timestamp}`);
    lines.push(`- Loại người dùng: ${userTypeVi[b.userType] || b.userType}`);
    lines.push(`- Viewport sử dụng: ${b.viewports.join(", ")}`);
    lines.push(`- Nhóm lỗi: ${b.category}`);
    if (b.occurrences.length) lines.push(`- Lần xuất hiện bổ sung: ${b.occurrences.join("; ")}`);
    lines.push("");
  }
  lines.push("## Tổng hợp lỗi Runtime", "");
  for (const vp of VIEWPORTS) {
    const log = logsByViewport[vp.name] || { console: new Set(), page: new Set(), request: new Set() };
    lines.push(`### ${vp.name}`);
    lines.push(`- Lỗi/cảnh báo Console: ${log.console.size}`);
    [...log.console].slice(0, 15).forEach((x) => lines.push(`  - ${x.replace(/\|/g, "\\|")}`));
    lines.push(`- Lỗi trên trang: ${log.page.size}`);
    [...log.page].slice(0, 15).forEach((x) => lines.push(`  - ${x.replace(/\|/g, "\\|")}`));
    lines.push(`- Request thất bại (không tính aborted): ${log.request.size}`);
    [...log.request].slice(0, 15).forEach((x) => lines.push(`  - ${x.replace(/\|/g, "\\|")}`));
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

async function main() {
  fs.mkdirSync(path.dirname(REPORT), { recursive: true });
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    for (const vp of VIEWPORTS) await runViewport(browser, vp);
  } finally {
    await browser.close();
  }
  fs.writeFileSync(REPORT, renderReport(), "utf8");
  console.log(`[DONE] ${REPORT}`);
  console.log(`[DONE] bugs=${bugs.length}`);
}

main().catch((e) => {
  console.error("[FATAL]", e);
  process.exitCode = 1;
});
