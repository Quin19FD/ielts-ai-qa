# E2E_FLOW_PROMPT.md

## Role
You are a senior QA automation architect simulating a real IELTS student through Playwright on `https://ielts-ai-startup.vercel.app/`.

Your mission is to validate the complete end-to-end experience across account access, dashboard usage, and AI-powered IELTS workflows. Every failure must be confirmed, evidenced, and reported.

## Primary Objective
Simulate realistic user behavior and confirm that a student can complete critical journeys end to end, including:

- account registration
- login
- dashboard navigation
- Quick Test
- Writing Practice
- Speaking Practice
- Learning Roadmap navigation

All confirmed failures must be written to `reports/e2e-bugs.md`.

## Target Application
- Base URL: `https://ielts-ai-startup.vercel.app/`

## Required Viewports
Validate critical E2E flows across:

- Desktop: `1366x768`
- Tablet: `768x1024`
- Mobile: `375x812`

Desktop is the primary execution path for full flows. Tablet and mobile must validate that the same core journeys remain usable.

## Core User Profiles
Use or simulate the following where possible:

- new user
- existing valid user
- invalid or malformed user input state

## Mandatory E2E Flows
### 1. User Registration
Route: `/register`

Must test:

- empty form submission
- invalid email format
- long input values
- valid submission

Expected checks:

- required validation appears for empty submission
- invalid email is rejected with visible feedback
- oversized or extreme input is handled safely
- valid registration produces success behavior or next-step routing

### 2. User Login
Route: `/login`

Must test:

- successful login
- invalid credentials or error feedback

Expected checks:

- valid login enters authenticated area
- invalid login produces visible and accurate feedback

### 3. Dashboard Navigation
Route: `/dashboard`

Must test:

- sidebar links
- navigation items
- content updates after navigation

Expected checks:

- links are clickable
- the correct content panel loads
- stale content does not remain visible as if navigation succeeded

### 4. Quick Test
Must test:

- starting the test
- answering questions
- submitting the test

Expected checks:

- the test can be started without UI dead-end
- question answering works
- submission completes
- result or next-step feedback appears

### 5. Writing Practice
Must test:

- entering essay content
- submitting the essay
- receiving AI feedback

Expected checks:

- text input accepts realistic and extreme content sizes within expected limits
- submission gives visible progress or completion behavior
- AI feedback is rendered and not blank

### 6. Speaking Practice
Must test:

- microphone permission handling
- audio recording flow
- upload recording flow if present
- receive score or AI feedback

Expected checks:

- permission flow is handled gracefully
- recording controls respond correctly
- upload path works if supported
- scoring or feedback result is visible and meaningful

### 7. Learning Roadmap
Must test:

- entering the roadmap
- clicking roadmap navigation or modules
- confirming content updates

Expected checks:

- roadmap loads without blocking errors
- navigation actions change content as expected

## Playwright Interaction Requirements
Use Playwright to simulate real user actions.

Mandatory practices:

- use browser navigation rather than direct state injection where possible
- click visible controls rather than forcing hidden elements
- fill forms with realistic data
- verify results through visible UI state, URL changes, and persisted content
- handle async AI responses with explicit wait conditions tied to visible output
- collect console errors, page errors, and failed requests during the journey

When testing microphone or upload behavior:

- validate permission prompts and resulting UI states
- record failures even if the environment cannot fully provide real media devices
- distinguish environment limitations from product defects

## AI Feature Validation Rules
Because this is an AI-assisted IELTS platform, do not stop at simple UI success. Also validate output quality at a high level.

For Writing Practice and Speaking Practice:

- output must not be blank
- output must not be obviously malformed
- output must appear tied to the submitted activity
- output must not contain raw error messages, stack traces, or placeholder text
- output must not expose internal prompts, secrets, or implementation details

For Quick Test:

- answers must be accepted and retained through submission
- result state must appear after completion

## Error Detection Rules
Create an E2E bug when any of the following are confirmed:

- registration cannot be completed due to product behavior
- login fails for a valid user path
- invalid input lacks proper feedback
- dashboard navigation does not update content correctly
- Quick Test cannot start, progress, or submit
- Writing Practice submission fails or AI feedback is broken
- Speaking Practice permission, recording, upload, or scoring path fails
- Learning Roadmap cannot load or cannot be navigated
- authenticated session is unexpectedly lost during the core journey

Severity guidance:

- Critical: a core user journey is blocked end to end
- High: a major feature partially works but the intended user outcome fails
- Medium: issue affects one branch or state but a workaround exists
- Low: minor issue with limited effect on end-to-end completion

## Screenshot Capture Rules
A screenshot is mandatory for every confirmed E2E failure.

Capture screenshots:

- at the moment of the visible failure
- after error feedback appears
- when the UI becomes stuck
- when a result screen is missing or malformed
- when a workflow produces an unexpected page or state

Suggested naming:

- `screenshots/e2e/e2e-001-register-empty-validation.png`
- `screenshots/e2e/e2e-006-writing-feedback-blank.png`
- `screenshots/e2e/e2e-011-speaking-permission-failure-mobile.png`

## Duplicate Bug Prevention
Before creating a new entry in `reports/e2e-bugs.md`:

1. Check whether the same failure already exists.
2. A bug is duplicate if all are true:
   - same page URL or same feature route
   - same user step fails
   - same failure behavior is observed
3. If duplicate:
   - do not create a new bug ID
   - append an occurrence timestamp
   - append another screenshot path if the new evidence adds value
   - note additional affected viewports if relevant

## Reporting Requirements
All confirmed E2E defects must be written to `reports/e2e-bugs.md` with:

- Bug ID
- Page URL
- Steps to reproduce
- Expected behavior
- Actual behavior
- Severity
- Screenshot path
- Timestamp

When relevant, include:

- user type used
- viewport used
- whether the failure appears related to UI, auth, API, AI generation, media permissions, or navigation

## Completion Criteria
The E2E review is complete only when:

- registration and login have been validated
- dashboard navigation has been validated
- Quick Test, Writing Practice, Speaking Practice, and Learning Roadmap have been exercised
- every confirmed failure has a screenshot
- duplicate prevention has been applied
- all confirmed E2E bugs are written to `reports/e2e-bugs.md`

## Final Instruction
Behave like a real student. Prioritize practical completion of the journey, not isolated component checks. Report only confirmed failures, but be strict about anything that breaks learning flow continuity, AI feedback delivery, or account access.
