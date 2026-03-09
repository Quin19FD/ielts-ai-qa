# Báo cáo lỗi UI

- Mã lỗi: UI-001
- Tên lỗi: Submit form đăng nhập rỗng không chặn ở mobile/tablet
- URL trang: https://ielts-ai-startup.vercel.app/login
- Các bước tái hiện:
  1. Mở `/login` trên Tablet (`768x1024`) hoặc Mobile (`375x812`).
  2. Để trống `identity` và `password`.
  3. Bấm nút submit đăng nhập.
- Hành vi mong đợi:
  - Kiểm tra hợp lệ của form phải chặn submit.
  - Phải hiển thị thông báo lỗi rõ ràng cho các trường bắt buộc.
  - URL vẫn là `/login`, không bị lộ tham số rỗng trên query string.
- Hành vi thực tế:
  - Trên Tablet và Mobile, form vẫn submit và URL thành `/login?identity=&password=`.
  - Không có thông báo lỗi hiển thị; các trường không bị đánh dấu invalid (`aria-invalid=false`).
  - Trên Desktop thì hoạt động đúng (có validation), dẫn đến không nhất quán giữa các viewport.
- Mức độ: High
- Đường dẫn ảnh chụp: [ui-login-empty-submit-query-tablet.png](../screenshots/ui/ui-login-empty-submit-query-tablet.png); [ui-login-empty-submit-query-mobile.png](../screenshots/ui/ui-login-empty-submit-query-mobile.png)
- Thời gian ghi nhận: 2026-03-09T04:24:10.2757897+07:00

- Mã lỗi: UI-002
- Tên lỗi: Submit form đăng ký rỗng không chặn ở mobile
- URL trang: https://ielts-ai-startup.vercel.app/register
- Các bước tái hiện:
  1. Mở `/register` trên Mobile (`375x812`).
  2. Để trống `fullName`, `email`, và `password`.
  3. Bấm nút submit đăng ký.
- Hành vi mong đợi:
  - Validation form phải chặn submit và hiển thị lỗi theo từng trường.
  - URL phải giữ `/register`, không bị thêm query params chứa giá trị rỗng.
- Hành vi thực tế:
  - Trên Mobile, form vẫn submit và URL thành `/register?fullName=&email=&password=`.
  - Không có thông báo lỗi hiển thị; input không bị đánh dấu invalid (`aria-invalid=false`).
  - Desktop và Tablet có validation đúng, cho thấy lỗi mang tính hồi quy theo viewport.
- Mức độ: High
- Đường dẫn ảnh chụp: [ui-register-empty-submit-no-msg-mobile.png](../screenshots/ui/ui-register-empty-submit-no-msg-mobile.png)
- Thời gian ghi nhận: 2026-03-09T04:24:10.2757897+07:00
