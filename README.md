# InteractHub
## Giới thiệu

**InteractHub** là một nền tảng mạng xã hội đầy đủ tính năng được phát triển theo mô hình **Full-Stack**. Dự án kết hợp **React + TypeScript** ở phía Frontend và **ASP.NET Core Web API** ở phía Backend.

Ứng dụng cho phép người dùng:
- Đăng ký / Đăng nhập (JWT Authentication)
- Đăng bài viết (có hình ảnh)
- Thích, bình luận, chia sẻ bài viết
- Gửi lời mời kết bạn
- Đăng Story (nội dung tạm thời)
- Nhận thông báo thời gian thực (SignalR)
- Quản lý profile cá nhân
- Tìm kiếm và khám phá nội dung
- Báo cáo nội dung vi phạm (quản trị viên)

#Công nghệ sử dụng
### Frontend
- **React 18** + **TypeScript** (strict mode)
- **Tailwind CSS** (mobile-first, responsive)
- **React Router v6** (Routing & Protected Routes)
- **React Hook Form** + Zod/Yup (Form & Validation)
- **Axios** + **React Query** / Context API (State Management)
- **SignalR Client** (Real-time notifications)

### Backend
- **ASP.NET Core 8.0 Web API**
- **Entity Framework Core 8** (Code-First + Migrations)
- **ASP.NET Core Identity** + **JWT Authentication**
- **SQL Server**
- **Repository + Service Layer** (Clean Architecture)
- **Swagger / OpenAPI**
- **SignalR** (Real-time)
- **Azure Blob Storage** (Upload hình ảnh)

## Các tính năng chính của InteractHub

### Tính năng Người dùng (User Features)

- **Xác thực & Quản lý tài khoản**
- Đăng ký tài khoản mới
- Đăng nhập / Đăng xuất
- Chỉnh sửa thông tin cá nhân & avatar

- **Trang chủ **
- Xem feed bài viết của bạn bè, cá nhân, cộng đồng
- Infinite Scroll (cuộn vô hạn)
- Tìm kiếm bài viết và người dùng

- **Đăng bài & Tương tác**
- Đăng bài viết kèm hình ảnh, video, hashtag, emoji
- Chỉnh sửa / Xóa bài viết của chính mình
- Thích (Like) bài viết
- Bình luận bài viết
- Chia sẻ bài viết lên trang cá nhân/ qua tin nhắn

- **Kết bạn **
- Gửi / Nhận lời mời kết bạn
- Chấp nhận / Từ chối lời mời
- Xem danh sách bạn bè
- Tìm kiếm mọi người dùng

- **Story**
- Đăng / Xóa Story (nội dung tạm thời 24h)
- Xem Story của bạn bè

- **Thông báo**
- Nhận thông báo thời gian thực (Real-time)
- Thông báo Like, Comment, Friend Request, Report

- **Report bài viết**
- Báo cáo bài viết vi phạm

- **Message**
- Gửi / Nhận tin nhắn (Real-time)


### Tính năng Người quản trị (AdminFeatures)

- **Xác thực & Quản lý tài khoản**
- Đăng ký tài khoản mới
- Đăng nhập / Đăng xuất
- Chỉnh sửa thông tin cá nhân & avatar

- **Dashboard**
- Xem tổng người dùng, bài viết, report, hashtag
- Biểu đồ trực quan

- **Quản lý người dùng**
- Xem toàn bộ những tài khoản người dùng của hệ thống
- Ẩn / Xóa người dùng bất kì

- **Quản lý bài viết**
- Xem toàn bộ bài viết của hệ thống cùng với like, comment chi tiết
- Ẩn / Xóa bài viết bất kì( gửi thông báo đến người dùng)
- Ẩn / Xóa bài comment bài viết

- **Quản lý report**
- Xem toàn bộ những report từ người dùng phản hồi
- Xử lý report từ người dùng( Ẩn / Xóa bài viết nếu phát hiện lỗi)

## Hướng dẫn cài đặt và chạy Local

### 1. Yêu cầu hệ thống
- **.NET 8.0 SDK**
- **Node.js 18+** và npm/yarn
- **SQL Server** (LocalDB hoặc Full SQL Server)
- Visual Studio 2022 hoặc VS Code

### 2. Chạy Database (SQL Server trên Docker)

```bash
# Tạo và chạy SQL Server container
docker run -e "ACCEPT_EULA=Y" \
        -e "MSSQL_SA_PASSWORD=YourStrongPassword123" \
        -p 1433:1433 \
        --name interacthub-db \
        -d 
        
        mcr.microsoft.com/mssql/server:2022-latest


### 3. Chạy Backend

cd InteractHub.API

# Cập nhật Connection String trong appsettings.json
-"ConnectionStrings": {
"DefaultConnection": "Server=localhost,1433;Database=InteractHubDB;User Id=sa;Password=YourStrongPassword123;TrustServerCertificate=True;MultipleActiveResultSets=true;"
}

dotnet ed migrations add (Tên tùy ý)
dotnet ef database update
dotnet run --launch-profile https


### 4. Chạy Frontend

cd InteractHub.Client

npm install
npm run dev