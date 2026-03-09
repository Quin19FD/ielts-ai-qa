# Báo cáo lỗi E2E

Thời điểm tạo: 2026-03-09T06:38:53.503Z
Mục tiêu: https://ielts-ai-startup.vercel.app

- Mã lỗi: E2E-001
- Tên lỗi: Đăng nhập với thông tin sai
- URL trang: https://ielts-ai-startup.vercel.app/login
- Các bước tái hiện:
  1. Mở /login trên viewport desktop, tablet, mobile.
  2. Thực hiện bước: Đăng nhập với thông tin sai.
  3. Quan sát hành vi thực tế.
- Hành vi mong đợi: Ở lại /login và hiển thị lỗi rõ ràng.
- Hành vi thực tế: url=https://ielts-ai-startup.vercel.app/login nhưng phản hồi lỗi yếu/không rõ
- Mức độ: Cao
- Đường dẫn ảnh chụp: [e2e-001-invalid-login-attempt-desktop-2026-03-09T06-31-46-775Z.png](../screenshots/e2e/e2e-001-invalid-login-attempt-desktop-2026-03-09T06-31-46-775Z.png); [e2e-001-invalid-login-attempt-tablet-2026-03-09T06-33-39-527Z.png](../screenshots/e2e/e2e-001-invalid-login-attempt-tablet-2026-03-09T06-33-39-527Z.png); [e2e-001-invalid-login-attempt-mobile-2026-03-09T06-35-30-163Z.png](../screenshots/e2e/e2e-001-invalid-login-attempt-mobile-2026-03-09T06-35-30-163Z.png)
- Thời gian ghi nhận: 2026-03-09T06:31:46.816Z
- Loại người dùng: dữ liệu đầu vào không hợp lệ
- Viewport sử dụng: desktop, tablet, mobile
- Nhóm lỗi: auth/validation
- Lần xuất hiện bổ sung: 2026-03-09T06:33:39.572Z; 2026-03-09T06:35:30.188Z

- Mã lỗi: E2E-002
- Tên lỗi: Kiểm tra nội dung cũ /speaking-practice
- URL trang: https://ielts-ai-startup.vercel.app/speaking-practice
- Các bước tái hiện:
  1. Mở /speaking-practice trên viewport desktop, tablet, mobile.
  2. Thực hiện bước: Kiểm tra nội dung cũ /speaking-practice.
  3. Quan sát hành vi thực tế.
- Hành vi mong đợi: Nội dung phải thay đổi sau điều hướng.
- Hành vi thực tế: Dấu hiệu nội dung không thay đổi.
- Mức độ: Trung bình
- Đường dẫn ảnh chụp: [e2e-002-stale-content-check-speaking-practice-desktop-2026-03-09T06-32-05-666Z.png](../screenshots/e2e/e2e-002-stale-content-check-speaking-practice-desktop-2026-03-09T06-32-05-666Z.png); [e2e-002-stale-content-check-speaking-practice-tablet-2026-03-09T06-33-58-730Z.png](../screenshots/e2e/e2e-002-stale-content-check-speaking-practice-tablet-2026-03-09T06-33-58-730Z.png); [e2e-002-stale-content-check-speaking-practice-mobile-2026-03-09T06-37-19-257Z.png](../screenshots/e2e/e2e-002-stale-content-check-speaking-practice-mobile-2026-03-09T06-37-19-257Z.png)
- Thời gian ghi nhận: 2026-03-09T06:32:05.785Z
- Loại người dùng: người dùng hiện có hợp lệ
- Viewport sử dụng: desktop, tablet, mobile
- Nhóm lỗi: navigation/ui
- Lần xuất hiện bổ sung: 2026-03-09T06:33:58.833Z; 2026-03-09T06:37:19.321Z

- Mã lỗi: E2E-003
- Tên lỗi: Kiểm tra nội dung cũ /learning-roadmap
- URL trang: https://ielts-ai-startup.vercel.app/learning-roadmap
- Các bước tái hiện:
  1. Mở /learning-roadmap trên viewport desktop, tablet, mobile.
  2. Thực hiện bước: Kiểm tra nội dung cũ /learning-roadmap.
  3. Quan sát hành vi thực tế.
- Hành vi mong đợi: Nội dung phải thay đổi sau điều hướng.
- Hành vi thực tế: Dấu hiệu nội dung không thay đổi.
- Mức độ: Trung bình
- Đường dẫn ảnh chụp: [e2e-003-stale-content-check-learning-roadmap-desktop-2026-03-09T06-32-08-235Z.png](../screenshots/e2e/e2e-003-stale-content-check-learning-roadmap-desktop-2026-03-09T06-32-08-235Z.png); [e2e-003-stale-content-check-learning-roadmap-tablet-2026-03-09T06-34-01-280Z.png](../screenshots/e2e/e2e-003-stale-content-check-learning-roadmap-tablet-2026-03-09T06-34-01-280Z.png); [e2e-003-stale-content-check-learning-roadmap-mobile-2026-03-09T06-37-51-805Z.png](../screenshots/e2e/e2e-003-stale-content-check-learning-roadmap-mobile-2026-03-09T06-37-51-805Z.png)
- Thời gian ghi nhận: 2026-03-09T06:32:08.303Z
- Loại người dùng: người dùng hiện có hợp lệ
- Viewport sử dụng: desktop, tablet, mobile
- Nhóm lỗi: navigation/ui
- Lần xuất hiện bổ sung: 2026-03-09T06:34:01.341Z; 2026-03-09T06:37:51.870Z

- Mã lỗi: E2E-004
- Tên lỗi: Bắt đầu Quick Test
- URL trang: https://ielts-ai-startup.vercel.app/quick-test
- Các bước tái hiện:
  1. Mở /quick-test trên viewport desktop, tablet, mobile.
  2. Thực hiện bước: Bắt đầu Quick Test.
  3. Quan sát hành vi thực tế.
- Hành vi mong đợi: Mở màn hình làm bài và cho phép trả lời.
- Hành vi thực tế: start=true; url=https://ielts-ai-startup.vercel.app/quick-test
- Mức độ: Cao
- Đường dẫn ảnh chụp: [e2e-004-quick-test-start-desktop-2026-03-09T06-32-15-125Z.png](../screenshots/e2e/e2e-004-quick-test-start-desktop-2026-03-09T06-32-15-125Z.png); [e2e-004-quick-test-start-tablet-2026-03-09T06-34-07-562Z.png](../screenshots/e2e/e2e-004-quick-test-start-tablet-2026-03-09T06-34-07-562Z.png); [e2e-004-quick-test-start-mobile-2026-03-09T06-37-58-296Z.png](../screenshots/e2e/e2e-004-quick-test-start-mobile-2026-03-09T06-37-58-296Z.png)
- Thời gian ghi nhận: 2026-03-09T06:32:15.281Z
- Loại người dùng: người dùng hiện có hợp lệ
- Viewport sử dụng: desktop, tablet, mobile
- Nhóm lỗi: quick-test
- Lần xuất hiện bổ sung: 2026-03-09T06:34:07.688Z; 2026-03-09T06:37:58.355Z

- Mã lỗi: E2E-005
- Tên lỗi: Kiểm tra phản hồi quyền/ghi âm Speaking
- URL trang: https://ielts-ai-startup.vercel.app/speaking-practice
- Các bước tái hiện:
  1. Mở /speaking-practice trên viewport desktop, tablet, mobile.
  2. Thực hiện bước: Kiểm tra phản hồi quyền/ghi âm Speaking.
  3. Quan sát hành vi thực tế.
- Hành vi mong đợi: Bấm ghi âm phải bắt đầu ghi hoặc báo quyền truy cập.
- Hành vi thực tế: Bấm ghi âm không tạo thay đổi trạng thái rõ ràng.
- Mức độ: Trung bình
- Đường dẫn ảnh chụp: [e2e-005-speaking-permission-recording-response-desktop-2026-03-09T06-32-33-007Z.png](../screenshots/e2e/e2e-005-speaking-permission-recording-response-desktop-2026-03-09T06-32-33-007Z.png); [e2e-005-speaking-permission-recording-response-tablet-2026-03-09T06-34-25-709Z.png](../screenshots/e2e/e2e-005-speaking-permission-recording-response-tablet-2026-03-09T06-34-25-709Z.png); [e2e-005-speaking-permission-recording-response-mobile-2026-03-09T06-38-16-835Z.png](../screenshots/e2e/e2e-005-speaking-permission-recording-response-mobile-2026-03-09T06-38-16-835Z.png)
- Thời gian ghi nhận: 2026-03-09T06:32:33.101Z
- Loại người dùng: người dùng hiện có hợp lệ
- Viewport sử dụng: desktop, tablet, mobile
- Nhóm lỗi: speaking/media
- Lần xuất hiện bổ sung: 2026-03-09T06:34:25.770Z; 2026-03-09T06:38:16.887Z

- Mã lỗi: E2E-006
- Tên lỗi: Kiểm tra nội dung cũ /quick-test
- URL trang: https://ielts-ai-startup.vercel.app/quick-test
- Các bước tái hiện:
  1. Mở /quick-test trên viewport tablet.
  2. Thực hiện bước: Kiểm tra nội dung cũ /quick-test.
  3. Quan sát hành vi thực tế.
- Hành vi mong đợi: Nội dung phải thay đổi sau điều hướng.
- Hành vi thực tế: Dấu hiệu nội dung không thay đổi.
- Mức độ: Trung bình
- Đường dẫn ảnh chụp: [e2e-006-stale-content-check-quick-test-tablet-2026-03-09T06-33-53-622Z.png](../screenshots/e2e/e2e-006-stale-content-check-quick-test-tablet-2026-03-09T06-33-53-622Z.png)
- Thời gian ghi nhận: 2026-03-09T06:33:53.739Z
- Loại người dùng: người dùng hiện có hợp lệ
- Viewport sử dụng: tablet
- Nhóm lỗi: navigation/ui

- Mã lỗi: E2E-007
- Tên lỗi: Kiểm tra nội dung cũ /writing-practice
- URL trang: https://ielts-ai-startup.vercel.app/writing-practice
- Các bước tái hiện:
  1. Mở /writing-practice trên viewport tablet, mobile.
  2. Thực hiện bước: Kiểm tra nội dung cũ /writing-practice.
  3. Quan sát hành vi thực tế.
- Hành vi mong đợi: Nội dung phải thay đổi sau điều hướng.
- Hành vi thực tế: Dấu hiệu nội dung không thay đổi.
- Mức độ: Trung bình
- Đường dẫn ảnh chụp: [e2e-007-stale-content-check-writing-practice-tablet-2026-03-09T06-33-56-185Z.png](../screenshots/e2e/e2e-007-stale-content-check-writing-practice-tablet-2026-03-09T06-33-56-185Z.png); [e2e-007-stale-content-check-writing-practice-mobile-2026-03-09T06-36-46-708Z.png](../screenshots/e2e/e2e-007-stale-content-check-writing-practice-mobile-2026-03-09T06-36-46-708Z.png)
- Thời gian ghi nhận: 2026-03-09T06:33:56.283Z
- Loại người dùng: người dùng hiện có hợp lệ
- Viewport sử dụng: tablet, mobile
- Nhóm lỗi: navigation/ui
- Lần xuất hiện bổ sung: 2026-03-09T06:36:46.774Z

- Mã lỗi: E2E-008
- Tên lỗi: Điều hướng dashboard tới /dashboard
- URL trang: https://ielts-ai-startup.vercel.app/dashboard
- Các bước tái hiện:
  1. Mở /dashboard trên viewport mobile.
  2. Thực hiện bước: Điều hướng dashboard tới /dashboard.
  3. Quan sát hành vi thực tế.
- Hành vi mong đợi: Click sidebar phải cập nhật route và nội dung.
- Hành vi thực tế: click=false; url=https://ielts-ai-startup.vercel.app/dashboard
- Mức độ: Cao
- Đường dẫn ảnh chụp: [e2e-008-dashboard-navigation-to-dashboard-mobile-2026-03-09T06-36-11-722Z.png](../screenshots/e2e/e2e-008-dashboard-navigation-to-dashboard-mobile-2026-03-09T06-36-11-722Z.png)
- Thời gian ghi nhận: 2026-03-09T06:36:11.778Z
- Loại người dùng: người dùng hiện có hợp lệ
- Viewport sử dụng: mobile
- Nhóm lỗi: navigation

- Mã lỗi: E2E-009
- Tên lỗi: Điều hướng dashboard tới /writing-practice
- URL trang: https://ielts-ai-startup.vercel.app/writing-practice
- Các bước tái hiện:
  1. Mở /writing-practice trên viewport mobile.
  2. Thực hiện bước: Điều hướng dashboard tới /writing-practice.
  3. Quan sát hành vi thực tế.
- Hành vi mong đợi: Click sidebar phải cập nhật route và nội dung.
- Hành vi thực tế: click=false; url=https://ielts-ai-startup.vercel.app/quick-test
- Mức độ: Cao
- Đường dẫn ảnh chụp: [e2e-009-dashboard-navigation-to-writing-practice-mobile-2026-03-09T06-36-46-644Z.png](../screenshots/e2e/e2e-009-dashboard-navigation-to-writing-practice-mobile-2026-03-09T06-36-46-644Z.png)
- Thời gian ghi nhận: 2026-03-09T06:36:46.708Z
- Loại người dùng: người dùng hiện có hợp lệ
- Viewport sử dụng: mobile
- Nhóm lỗi: navigation

- Mã lỗi: E2E-010
- Tên lỗi: Điều hướng dashboard tới /speaking-practice
- URL trang: https://ielts-ai-startup.vercel.app/speaking-practice
- Các bước tái hiện:
  1. Mở /speaking-practice trên viewport mobile.
  2. Thực hiện bước: Điều hướng dashboard tới /speaking-practice.
  3. Quan sát hành vi thực tế.
- Hành vi mong đợi: Click sidebar phải cập nhật route và nội dung.
- Hành vi thực tế: click=false; url=https://ielts-ai-startup.vercel.app/quick-test
- Mức độ: Cao
- Đường dẫn ảnh chụp: [e2e-010-dashboard-navigation-to-speaking-practice-mobile-2026-03-09T06-37-19-187Z.png](../screenshots/e2e/e2e-010-dashboard-navigation-to-speaking-practice-mobile-2026-03-09T06-37-19-187Z.png)
- Thời gian ghi nhận: 2026-03-09T06:37:19.257Z
- Loại người dùng: người dùng hiện có hợp lệ
- Viewport sử dụng: mobile
- Nhóm lỗi: navigation

- Mã lỗi: E2E-011
- Tên lỗi: Điều hướng dashboard tới /learning-roadmap
- URL trang: https://ielts-ai-startup.vercel.app/learning-roadmap
- Các bước tái hiện:
  1. Mở /learning-roadmap trên viewport mobile.
  2. Thực hiện bước: Điều hướng dashboard tới /learning-roadmap.
  3. Quan sát hành vi thực tế.
- Hành vi mong đợi: Click sidebar phải cập nhật route và nội dung.
- Hành vi thực tế: click=false; url=https://ielts-ai-startup.vercel.app/quick-test
- Mức độ: Cao
- Đường dẫn ảnh chụp: [e2e-011-dashboard-navigation-to-learning-roadmap-mobile-2026-03-09T06-37-51-743Z.png](../screenshots/e2e/e2e-011-dashboard-navigation-to-learning-roadmap-mobile-2026-03-09T06-37-51-743Z.png)
- Thời gian ghi nhận: 2026-03-09T06:37:51.804Z
- Loại người dùng: người dùng hiện có hợp lệ
- Viewport sử dụng: mobile
- Nhóm lỗi: navigation

## Tổng hợp lỗi Runtime

### desktop
- Lỗi/cảnh báo Console: 1
  - error: Failed to generate test: TypeError: Failed to fetch
    at w (https://ielts-ai-startup.vercel.app/_next/static/chunks/c77b6344fe211b32.js:1:76515)
- Lỗi trên trang: 0
- Request thất bại (không tính aborted): 0

### tablet
- Lỗi/cảnh báo Console: 1
  - error: Failed to generate test: TypeError: Failed to fetch
    at w (https://ielts-ai-startup.vercel.app/_next/static/chunks/c77b6344fe211b32.js:1:76515)
- Lỗi trên trang: 0
- Request thất bại (không tính aborted): 0

### mobile
- Lỗi/cảnh báo Console: 1
  - error: Failed to generate test: TypeError: Failed to fetch
    at w (https://ielts-ai-startup.vercel.app/_next/static/chunks/c77b6344fe211b32.js:1:76515)
- Lỗi trên trang: 0
- Request thất bại (không tính aborted): 0


## Hiệu chỉnh sau rà soát lại (2026-03-09)

Nguồn kiểm tra lại:
- Đối chiếu rule trong `qa-testing/tests/e2e/e2e-flow-audit.js`.
- Chạy lại các kiểm tra Playwright theo luồng thật trên website.
- Soát screenshot đã đính kèm trong báo cáo.

Kết quả phân loại lại theo từng mã:
- E2E-001: False positive.
  Lý do: UI có thông báo lỗi rõ (`Tài khoản không tồn tại`), nhưng rule cũ chỉ bắt từ khóa `sai|invalid|error` nên không nhận diện đúng.
- E2E-002: False positive.
  Lý do: Rule stale-content dùng chữ ký `body.slice(0,210)` nên trùng phần header/sidebar giữa các trang.
- E2E-003: False positive.
  Lý do: Cùng nguyên nhân stale-content như E2E-002.
- E2E-004: False positive.
  Lý do: Rule ép URL phải là `/quick-test/runner`; thực tế flow hợp lệ có thể vẫn ở `/quick-test`.
- E2E-005: Chưa đủ bằng chứng để xác nhận lỗi hệ thống.
  Lý do: Kết quả automation không ổn định theo môi trường (phụ thuộc quyền/thiết bị microphone). Cần kiểm thử thủ công có microphone thật để kết luận.
- E2E-006: False positive.
  Lý do: Cùng nguyên nhân stale-content như E2E-002.
- E2E-007: False positive.
  Lý do: Cùng nguyên nhân stale-content như E2E-002.
- E2E-008: False positive.
  Lý do: Case "điều hướng tới /dashboard" khi đang ở `/dashboard` không phải lỗi chức năng.
- E2E-009: False positive.
  Lý do: Trên mobile cần mở menu điều hướng trước; rule cũ click thẳng link ẩn nên báo sai.
- E2E-010: False positive.
  Lý do: Cùng nguyên nhân mobile menu như E2E-009.
- E2E-011: False positive.
  Lý do: Cùng nguyên nhân mobile menu như E2E-009.

Kết luận sau hiệu chỉnh:
- Không có lỗi E2E hệ thống/chức năng đã được xác nhận chắc chắn trong danh sách E2E-001..E2E-011.
- Mục cần kiểm thử thủ công bổ sung: luồng ghi âm Speaking (E2E-005) trên máy có microphone thật và quyền truy cập đầy đủ.
