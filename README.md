# 🏥 Hospital Management System

A **web-based Hospital Management System** built to manage hospital operations such as doctors, staff, patients, appointments, and billing using **role-based access control**.

This project focuses on simplicity, security, and usability while demonstrating core **DBMS and full-stack web development concepts**.

---

## 🧠 Overview

The Hospital Management System is a lightweight web application developed using **HTML, JavaScript, Node.js, and Express**, with data stored in a **JSON file (`data.json`)**.

It is designed for **small-scale hospital administration and academic learning**, providing a clear understanding of backend logic, data handling, and access control without using a traditional database.

---

## 🎯 Key Objectives

- Build a secure **role-based authentication system**
- Enable **Admins** to perform full CRUD operations
- Allow **Doctors** to view their assigned data (read-only)
- Prevent **Staff login** to ensure data security
- Use **JSON-based storage** as a lightweight DBMS alternative
- Maintain data consistency and simplicity

---

## 🚀 Features

### 🔐 Authentication & Authorization
- Admin login with full access
- Doctor login with view-only access
- Staff login strictly restricted

### 🗂️ Admin Capabilities
- Manage doctors and staff
- Maintain patient records
- Schedule appointments
- Handle billing and payments
- Full Create, Read, Update, Delete (CRUD) support

### 👨‍⚕️ Doctor Capabilities
- View personal profile and assigned staff
- Read-only access (no data modification)

### 💻 User Interface
- Dynamic tables and forms
- Client-side validation
- Clean and intuitive layout
- Real-time updates after CRUD operations

---

## 🛠️ Tech Stack

| Layer | Technology |
|-----|-----------|
| Frontend | HTML, JavaScript |
| Backend | Node.js, Express |
| Database | JSON (`data.json`) |
| Tools | VS Code, npm |
| Platform | Web Browser |

---

## 🧱 System Architecture

- **Client Layer:** HTML pages with JavaScript for interaction
- **Server Layer:** Node.js with Express handling REST APIs
- **Data Layer:** JSON file acting as a lightweight database

Frontend communicates with backend using the **Fetch API**.

---

## 🗃️ Data Model

The system manages the following entities:

- **Users** – Authentication and role management
- **Doctors** – Doctor details and assigned staff
- **Staff** – Staff details and assigned doctors
- **Patients** – Patient records and medical history
- **Appointments** – Scheduling between doctors and patients
- **Billing** – Financial records and payment details

Entity relationships are maintained using unique IDs to ensure consistency.

---

## 🧪 Testing & Validation

- Login authentication tested for all roles
- Role-based access verified
- CRUD operations tested for all entities
- Staff access restriction validated
- Input validation and error handling tested
- Performance tested on local server

---

## 📊 Performance

- Fast login and data loading (< 1 second)
- Efficient read/write operations for small datasets
- Smooth UI interactions with minimal latency

---

## ⚠️ Limitations

- JSON file storage is not suitable for large-scale systems
- No support for concurrent users
- Passwords stored in plain text (for learning purposes)
- No advanced search or analytics features

---

## 🔮 Future Enhancements

- Migrate to **MySQL or MongoDB**
- Implement **password hashing (bcrypt)**
- Add search and filter functionality
- Introduce reporting and analytics
- Add proper session management
- Implement automatic data backups

---

## ✅ Conclusion

This project demonstrates a complete **end-to-end web application** with authentication, role-based access, and structured data management. It effectively showcases backend development, data handling, and system design concepts suitable for academic and entry-level professional use.

---

⭐ If you find this project useful, consider starring the repository!
