# 🐾 Pet Management System

Hệ thống quản lý thú cưng được xây dựng bằng **Spring Boot + MySQL**, hỗ trợ quản lý người dùng, thú cưng, hồ sơ y tế và lịch sử tiêm chủng.

Project được xây dựng theo mô hình **RESTful API**, kết hợp **Spring Data JPA**, **Spring Security** và **JWT Authentication** để xác thực và phân quyền người dùng.

---

## 📌 Features

### 🔐 Authentication & Authorization

* Đăng ký tài khoản
* Đăng nhập bằng username/password
* Xác thực bằng JWT
* Mật khẩu được mã hóa bằng BCrypt
* Phân quyền:

    * `USER`
    * `ADMIN`
* Tài khoản đăng ký mới mặc định có role `USER`
* Người dùng không thể tự thay đổi role

### 👤 User Management

* Admin có thể:

    * Xem danh sách người dùng
    * Xem thông tin người dùng
    * Quản lý người dùng
* User thông thường chỉ có quyền truy cập các tài nguyên của chính mình

### 🐕 Pet Management

Người dùng có thể:

* Thêm thú cưng
* Xem danh sách thú cưng của mình
* Xem thông tin chi tiết thú cưng
* Cập nhật thông tin thú cưng
* Xóa thú cưng

Thông tin thú cưng bao gồm:

* Tên
* Loài
* Giống
* Giới tính
* Ngày sinh
* Cân nặng
* Mô tả
* Chủ sở hữu
* Thời gian tạo
* Thời gian cập nhật

`owner` được xác định dựa trên tài khoản đăng nhập thông qua JWT, không nhận `ownerId` từ request.

### 🏥 Medical Records

Quản lý hồ sơ khám chữa bệnh của thú cưng:

* Thêm hồ sơ y tế
* Xem hồ sơ y tế
* Xem danh sách hồ sơ
* Lưu thông tin:

    * Ngày khám
    * Triệu chứng
    * Chẩn đoán
    * Điều trị
    * Đơn thuốc
    * Ghi chú

### 💉 Vaccination Management

Quản lý lịch sử tiêm chủng:

* Thêm thông tin tiêm chủng
* Xem thông tin tiêm chủng
* Xem danh sách vaccine của thú cưng
* Theo dõi ngày tiêm
* Theo dõi ngày tiêm tiếp theo

---

# 🛠️ Technologies

| Technology        | Purpose                        |
| ----------------- | ------------------------------ |
| Java              | Programming Language           |
| Spring Boot       | Backend Framework              |
| Spring Web        | RESTful API                    |
| Spring Data JPA   | Database Access                |
| Hibernate         | ORM                            |
| Spring Security   | Authentication & Authorization |
| JWT               | Token-based Authentication     |
| MySQL             | Database                       |
| Maven             | Dependency Management          |
| Lombok            | Reduce Boilerplate Code        |
| Bean Validation   | Request Validation             |
| Swagger / OpenAPI | API Documentation              |
| Postman           | API Testing                    |

---

# 🏗️ Project Architecture

Project được tổ chức theo mô hình:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

Cấu trúc project:

```text
src
└── main
    └── java
        └── com.QuanLiPet
            │
            ├── config
            │   └── SecurityConfig
            │
            ├── controller
            │   ├── AuthController
            │   ├── UserController
            │   ├── PetController
            │   ├── MedicalRecordController
            │   └── VaccinationController
            │
            ├── dto
            │   ├── request
            │   │   ├── UserRequest
            │   │   ├── PetRequest
            │   │   ├── MedicalRecordRequest
            │   │   └── VaccinationRequest
            │   │
            │   └── response
            │       ├── UserResponse
            │       ├── PetResponse
            │       ├── MedicalRecordResponse
            │       └── VaccinationResponse
            │
            ├── entity
            │   ├── User
            │   ├── Pet
            │   ├── MedicalRecord
            │   └── Vaccination
            │
            ├── repository
            │   ├── UserRepository
            │   ├── PetRepository
            │   ├── MedicalRecordRepository
            │   └── VaccinationRepository
            │
            ├── service
            │   ├── UserService
            │   ├── PetService
            │   ├── MedicalService
            │   └── VaccinationService
            │
            ├── security
            │   └── CustomUserDetailsService
            │
            ├── exception
            │   ├── ApplicationException
            │   └── ApplicationExceptionCode
            │
            └── ...
```

---

# 🗄️ Database Design

Các entity chính:

```text
User
 │
 └──< Pet
       │
       ├──< MedicalRecord
       │
       └──< Vaccination
```

### User

Lưu thông tin tài khoản:

```text
User
├── id
├── username
├── email
├── password
├── role
├── createdAt
└── updatedAt
```

### Pet

```text
Pet
├── id
├── name
├── species
├── breed
├── gender
├── dateOfBirth
├── weight
├── description
├── owner
├── createdAt
└── updatedAt
```

### MedicalRecord

```text
MedicalRecord
├── id
├── pet
├── visitDate
├── symptoms
├── diagnosis
├── treatment
├── prescription
├── notes
├── createdAt
└── updatedAt
```

### Vaccination

```text
Vaccination
├── id
├── pet
├── vaccineName
├── vaccinationDate
└── nextVaccinationDate
```

---

# 🔑 Authentication Flow

Hệ thống sử dụng JWT để xác thực.

```text
Client
  │
  │ Login
  ▼
/api/auth/login
  │
  ▼
Spring Security
  │
  ▼
Authentication
  │
  ▼
JWT Token
  │
  ▼
Client
```

Khi client gọi API cần authentication:

```text
Authorization: Bearer <JWT_TOKEN>
```

JWT được sử dụng để xác định user hiện tại.

Ví dụ:

```text
POST /api/pets
Authorization: Bearer eyJhbGciOi...
```

Server sẽ lấy username từ JWT và xác định owner của Pet.

---

# 👥 Authorization

Hệ thống có hai role:

```text
USER
ADMIN
```

### USER

Có quyền:

```text
/api/pets/**
```

và các tài nguyên thuộc về tài khoản của mình.

### ADMIN

Có quyền truy cập:

```text
/api/users/**
```

Admin có thể quản lý và xem thông tin người dùng.

---

# 🌐 API Endpoints

## Authentication

### Register

```http
POST /api/auth/register
```

### Login

```http
POST /api/auth/login
```

---

## Users

Các API quản lý user:

```http
GET    /api/users
GET    /api/users/{id}
PUT    /api/users/{id}
DELETE /api/users/{id}
```

Các endpoint `/api/users/**` yêu cầu quyền:

```text
ADMIN
```

---

## Pets

### Create Pet

```http
POST /api/pets
```

### Get My Pets

```http
GET /api/pets
```

### Get Pet By ID

```http
GET /api/pets/{id}
```

### Update Pet

```http
PUT /api/pets/{id}
```

### Delete Pet

```http
DELETE /api/pets/{id}
```

---

## Medical Records

### Create Medical Record

```http
POST /api/pets/{petId}/medical-records
```

### Get All Medical Records

```http
GET /api/medical-records
```

### Get Medical Record By ID

```http
GET /api/medical-records/{id}
```

---

## Vaccinations

### Create Vaccination

```http
POST /api/pets/{petId}/vaccinations
```

### Get All Vaccinations

```http
GET /api/vaccinations
```

### Get Vaccination By ID

```http
GET /api/vaccinations/{id}
```

### Get Vaccinations By Pet

```http
GET /api/pets/{petId}/vaccinations
```

---

# ⚙️ Installation

## 1. Requirements

Cần cài đặt:

* JDK 21
* Maven
* MySQL
* IntelliJ IDEA hoặc IDE tương đương
* Postman

Kiểm tra Java:

```bash
java -version
```

Kiểm tra Maven:

```bash
mvn -version
```

---

# 🗄️ 2. Create MySQL Database

Mở MySQL Workbench hoặc MySQL Command Line và tạo database:

```sql
CREATE DATABASE pet_management;
```

Sau đó kiểm tra:

```sql
SHOW DATABASES;
```

---

# ⚙️ 3. Configure Database

Mở:

```text
src/main/resources/application.properties
```

Cấu hình:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/pet_management
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

Thay:

```text
YOUR_PASSWORD
```

bằng password MySQL của bạn.

---

# ▶️ 4. Run Application

Clone project:

```bash
git clone <your-repository-url>
```

Đi vào project:

```bash
cd pet-management
```

Build project:

```bash
mvn clean install
```

Chạy project:

```bash
mvn spring-boot:run
```

Hoặc chạy trực tiếp class:

```text
QuanLiPetApplication.java
```

---

# 🧪 Testing

Có thể sử dụng **Postman** để test API.

Flow test cơ bản:

```text
1. Register
      ↓
2. Login
      ↓
3. Receive JWT
      ↓
4. Add Authorization Header
      ↓
5. Create Pet
      ↓
6. Get Pets
      ↓
7. Add Medical Record
      ↓
8. Add Vaccination
```

Header:

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# 🔒 Validation

Các request được kiểm tra bằng Bean Validation.

Ví dụ:

```java
@NotBlank
private String name;
```

```java
@Size(max = 100)
private String name;
```

```java
@PastOrPresent
private LocalDate dateOfBirth;
```

```java
@Positive
private Double weight;
```

Nhờ đó server có thể kiểm tra dữ liệu trước khi lưu vào database.

---

# 🧩 Exception Handling

Project sử dụng custom exception:

```java
ApplicationException
```

và enum:

```java
ApplicationExceptionCode
```

Mục đích là chuẩn hóa các lỗi nghiệp vụ, ví dụ:

```text
USER_NOT_FOUND
PET_NOT_FOUND
ACCESS_DENIED
ROLE_NOT_FOUND
...
```

---

# 🔐 Security

Các endpoint được bảo vệ bằng Spring Security.

Ví dụ:

```text
/api/auth/**       → Public
/api/users/**      → ADMIN
/api/pets/**       → Authenticated
```

Password được mã hóa bằng:

```text
BCryptPasswordEncoder
```

JWT được sử dụng để xác thực user thay vì lưu session phía server.

---

# 📚 What I Learned

Thông qua project này, các kiến thức chính được áp dụng:

* Java OOP
* Spring Boot
* Spring MVC
* RESTful API
* Spring Data JPA
* Hibernate
* MySQL
* Entity Relationships
* DTO Pattern
* Service Layer
* Repository Pattern
* Spring Security
* JWT Authentication
* Role-based Authorization
* Password Encryption
* Bean Validation
* Custom Exception
* CRUD
* Postman API Testing
* Database Design

---

# 🚀 Future Improvements

Một số chức năng có thể phát triển thêm:

* [ ] Refresh Token
* [ ] Forgot Password
* [ ] Email Verification
* [ ] Pagination
* [ ] Search & Filter Pet
* [ ] Upload ảnh thú cưng
* [ ] Dashboard cho Admin
* [ ] Thống kê số lượng thú cưng
* [ ] Nhắc lịch tiêm vaccine
* [ ] Audit Log
* [ ] Docker
* [ ] Unit Test
* [ ] Integration Test
* [ ] CI/CD
* [ ] Angular Frontend

---

# 👨‍💻 Author

**Vũ Thành Đạt**

Java Backend Developer

Tech stack:

```text
Java
Spring Boot
Spring Security
JWT
JPA / Hibernate
MySQL
Maven
```

---

# 📄 License

This project is created for learning and portfolio purposes.
