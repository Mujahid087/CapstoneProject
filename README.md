# 🍕 PizzaHub — Full-Stack Food Ordering Application

A full-stack web application for online pizza ordering, built with **React** (frontend) and **Node.js + Express + MongoDB** (backend). Supports customer ordering with cart, checkout, payments, and a full admin dashboard for managing menu, orders, revenue, and notifications.

---

## 📑 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [Running Tests](#-running-tests)
- [API Endpoints](#-api-endpoints)
- [Environment Variables](#-environment-variables)
- [Architecture Overview](#-architecture-overview)

---

## ✨ Features

### Customer Features
- 🏠 **Landing Page** — Browse menu and categories without login
- 🔐 **Authentication** — Register, login, and logout with JWT
- 📋 **Menu Browsing** — View items by category with images and prices
- 🛒 **Cart Management** — Add, update quantity, and remove items
- 🧾 **Checkout** — Select delivery address, view order summary with discount/tax
- 💳 **Payments** — Pay via Card, UPI, or Cash on Delivery
- 📦 **Order Tracking** — View order history, cancel pending orders, reorder
- 🔔 **Real-Time Notifications** — Receive order status updates via Socket.IO
- 👤 **Profile Management** — Update name, email, phone, password
- 📍 **Address Management** — Add, edit, delete, set default delivery addresses
- 🧾 **Bill Generation** — View and print detailed order bills

### Admin Features
- 📊 **Dashboard** — Order trends, revenue charts, KPI metrics
- 🍕 **Menu Management** — Create, update, delete menu items
- 📁 **Category Management** — Create and manage food categories
- 📦 **Order Management** — View all orders, update order status
- 💰 **Revenue Analytics** — Monthly revenue breakdown with charts
- 💬 **Messaging** — Send messages to customers about their orders
- 🔔 **Real-Time Notifications** — Instant alerts for new orders, payments, cancellations
- 👥 **User Management** — View all registered users

### Additional Features
- ✅ **Client-Side Validation** — Formik + Yup on all forms
- 📱 **Responsive Design** — Works on desktop, tablet, and mobile
- 🔄 **Real-Time Updates** — Socket.IO for instant notifications
- 🏷️ **Auto Discount** — 5% discount on orders above ₹1000
- 🧪 **Component & E2E Tests** — Jest + Supertest test suites

---

## 🛠 Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **Vite** | Build tool & dev server |
| **React Router v7** | Client-side routing |
| **Redux Toolkit** | State management |
| **React Bootstrap** | UI components |
| **Formik + Yup** | Form handling & validation |
| **Axios** | HTTP client |
| **Socket.IO Client** | Real-time communication |
| **React Toastify** | Toast notifications |
| **Recharts** | Charts & data visualization |
| **Jest + React Testing Library** | Component testing |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime |
| **Express 5** | Web framework |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT (jsonwebtoken)** | Authentication |
| **bcryptjs** | Password hashing |
| **Socket.IO** | Real-time events |
| **Mocha + Chai + Supertest** | API & E2E testing |

---
---

## 📋 Prerequisites

Make sure you have the following installed:

- **Node.js** (v18 or later) — [Download](https://nodejs.org/)
- **MongoDB** (local or cloud via MongoDB Atlas) — [Download](https://www.mongodb.com/)
- **npm** (comes with Node.js)
- **Git** — [Download](https://git-scm.com/)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
MONGO_URI=mongodb:your_mongodb_uri
JWT_SECRET=your_jwt_secret_key
PORT=your_port_number
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

---

## ▶️ Running the Application

### Start the Backend Server

```bash
cd backend
npm start
```

The backend server starts on `http://localhost:5000`

### Start the Frontend Dev Server

```bash
cd frontend
npm run dev
```

The frontend starts on `http://localhost:5180`

### Access the Application

| URL | Description |
|---|---|
| `http://localhost:5180` | Landing Page (public) |
| `http://localhost:5180/login` | Customer / Admin Login |
| `http://localhost:5180/register` | Customer Registration |
| `http://localhost:5180/admin/dashboard` | Admin Dashboard (requires admin login) |
| `http://localhost:5000` | Backend API Health Check |

---

## 🧪 Running Tests

### Frontend Component Tests (Jest)

```bash
cd frontend
npm test
```

Runs **25 tests** across 4 test suites:
- `Loader.test.jsx` — Spinner component tests
- `LoginPage.test.jsx` — Login form, validation, error display
- `RegisterPage.test.jsx` — Registration form, Yup validation
- `LandingPage.test.jsx` — Hero section, menu items, categories

### Backend API & E2E Tests (Mocha)

```bash
cd backend
npm test
```

Runs **38 tests** across 7 test suites:
- `auth.test.js` — Registration & login API
- `cart.test.js` — Cart CRUD with auth
- `menu.test.js` — Public menu access
- `orders.test.js` — Order placement
- `revenue.test.js` — Admin revenue/dashboard
- `e2e.workflow.test.js` — Full user journey (register → login → cart → order → cancel)
- `e2e.auth.test.js` — Auth validation & protected route access

---

## 📡 API Endpoints

### User Routes (`/api/user`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | ❌ | Register new user |
| `POST` | `/login` | ❌ | Login & get JWT token |
| `POST` | `/logout` | ✅ | Logout user |
| `GET` | `/profile` | ✅ | Get user profile |
| `PUT` | `/profile` | ✅ | Update user profile |
| `GET` | `/categories` | ❌ | Get all food categories |
| `GET` | `/menu/:categoryId` | ❌ | Get menu items by category |
| `POST` | `/cart` | ✅ | Add item to cart |
| `GET` | `/cart/:userId` | ✅ | Get user's cart |
| `PUT` | `/cart/:userId/:itemId` | ✅ | Update cart item quantity |
| `DELETE` | `/cart/:userId/:itemId` | ✅ | Remove item from cart |
| `DELETE` | `/cart/:userId` | ✅ | Clear entire cart |
| `POST` | `/order` | ✅ | Place a new order |
| `GET` | `/orders/:userId` | ✅ | Get user's orders |
| `GET` | `/order/:id` | ✅ | Get single order details |
| `PUT` | `/order/cancel/:id` | ✅ | Cancel an order |
| `POST` | `/payment` | ✅ | Process payment |
| `GET` | `/messages/:userId` | ✅ | Get user notifications |
| `PUT` | `/messages/:id/read` | ✅ | Mark notification as read |
| `POST` | `/address` | ✅ | Add delivery address |
| `GET` | `/address/:userId` | ✅ | Get user's addresses |
| `PUT` | `/address/:id` | ✅ | Update address |
| `DELETE` | `/address/:id` | ✅ | Delete address |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/login` | ❌ | Admin login |
| `POST` | `/logout` | ✅ | Admin logout |
| `GET` | `/users` | ✅ | Get all registered users |
| `POST` | `/menu` | ✅ | Create menu item |
| `GET` | `/menu` | ✅ | Get all menu items |
| `PUT` | `/menu/:id` | ✅ | Update menu item |
| `DELETE` | `/menu/:id` | ✅ | Delete menu item |
| `POST` | `/category` | ✅ | Create food category |
| `GET` | `/orders` | ✅ | Get all orders |
| `PUT` | `/orders/:id` | ✅ | Update order status |
| `GET` | `/notifications` | ✅ | Get admin notifications |
| `PUT` | `/notifications/read` | ✅ | Mark notifications as read |
| `POST` | `/message` | ✅ | Send message to user |
| `GET` | `/bill/:orderId` | ✅ | Generate order bill |
| `GET` | `/revenue` | ✅ | Monthly revenue stats |
| `GET` | `/dashboard` | ✅ | Dashboard analytics |

---

## 🔐 Environment Variables

| Variable | Description | Example |
|---|---|---|
| `MONGO_URI` | MongoDB connection string | `your_mongo_uri` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key_here` |
| `PORT` | Backend server port | `your port number` |


---

## 🏗 Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                     Frontend (React)                      │
│                                                          │
│  Pages ──→ Redux Slices ──→ Axios (api.js) ──→ Backend   │
│                                                          │
│  Socket.IO Client ←──────────────────── Real-time Events │
└──────────────────────────┬───────────────────────────────┘
                           │ HTTP / WebSocket
┌──────────────────────────▼───────────────────────────────┐
│                  Backend (Node.js + Express)              │
│                                                          │
│  Routes ──→ AuthMiddleware ──→ Controllers ──→ Models    │
│                                                          │
│  Socket.IO Server ──────────────────→ Real-time Events   │
└──────────────────────────┬───────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────┐
│                    MongoDB Database                       │
│                                                          │
│  Users │ Categories │ MenuItems │ Cart │ Orders           │
│  Payments │ Messages │ Addresses │ AdminNotifications     │
└──────────────────────────────────────────────────────────┘
```

### Key Design Patterns

- **Redux Toolkit** for centralized state management with async thunks
- **JWT Authentication** with middleware-protected routes
- **Role-Based Access Control** — `customer` and `admin` roles
- **Socket.IO Rooms** — Separate rooms for user and admin notifications
- **Formik + Yup** for declarative form validation
- **Axios Interceptors** for auto-attaching tokens and handling 401 errors



---


## Live Deployment

- Frontend (Firebase Hosting): https://pizzeria-c9055.web.app
- Backend (Render): https://capstoneproject-1--0g2z.onrender.com/


---

## 👨‍💻 Author

**Mujahid Mahedi**

