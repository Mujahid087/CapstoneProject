# PizzaHub

PizzaHub is a full-stack food ordering application built with React on the frontend and Node.js, Express, and MongoDB on the backend. It supports customer ordering, OTP-based registration flow, password reset by email, real-time notifications, favorites, and an admin dashboard for operations and reporting.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Available Scripts](#available-scripts)
- [Routes](#routes)
- [API Endpoints](#api-endpoints)
- [Architecture Overview](#architecture-overview)
- [Live Deployment](#live-deployment)
- [Author](#author)

## Features

### Customer

- Public landing page with categories and menu previews
- Registration and login with JWT authentication
- OTP verification and OTP resend flow
- Forgot-password and reset-password flow with email delivery
- Browse menu by category and view all menu items
- Cart add, update, remove, and clear actions
- Favorites add/remove flow
- Address management for delivery
- Checkout, payment, order placement, cancellation, and reorder support
- Profile management with avatar-based navbar dropdown
- Real-time user notifications and messaging
- Bill viewing/printing for orders

### Admin

- Admin login and protected dashboard routes
- Menu item CRUD
- Category creation
- User listing
- Order management and status updates
- Revenue analytics and dashboard summaries
- Customer messaging
- Admin notification center
- Bill generation endpoint

### General

- Responsive React Bootstrap UI
- Redux Toolkit state management
- Axios API client with interceptors
- Socket.IO for real-time events
- Frontend and backend test suites included

## Technology Stack

### Frontend

| Technology | Purpose |
| --- | --- |
| React 19 | UI layer |
| Vite | Development server and build tool |
| React Router 7 | Client-side routing |
| Redux Toolkit | State management |
| React Bootstrap + Bootstrap 5 | UI components and styling |
| Formik + Yup | Forms and validation |
| Axios | API communication |
| Socket.IO Client | Real-time updates |
| React Toastify | Notifications |
| Recharts | Charts |
| Jest + React Testing Library | Frontend tests |

### Backend

| Technology | Purpose |
| --- | --- |
| Node.js | Runtime |
| Express 5 | HTTP server |
| MongoDB + Mongoose | Database and ODM |
| JSON Web Token | Authentication |
| bcrypt | Password hashing |
| Socket.IO | Real-time messaging |
| Mocha + Chai + Supertest | Backend and API tests |
| Brevo API | Transactional email delivery |

## Project Structure

```text
PizzaHub/
|- frontend/
|  |- src/
|  |  |- components/
|  |  |- layouts/
|  |  |- pages/
|  |  |- redux/
|  |  |- routes/
|  |  |- services/
|  |  |- theme/
|  |- .env.example
|  |- package.json
|- backend/
|  |- config/
|  |- controllers/
|  |- middlewares/
|  |- models/
|  |- routes/
|  |- services/
|  |- tests/
|  |- .env.example
|  |- package.json
|- README.md
```

## Prerequisites

- Node.js 18 or later
- npm
- MongoDB local instance or MongoDB Atlas
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd MujahidMahediCapstoneProject
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Create environment files

Copy the example files and fill in real values:

```bash
cd ../backend
copy .env.example .env

cd ../frontend
copy .env.example .env
```

On macOS/Linux, use `cp` instead of `copy`.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `PORT` | No | Backend server port | `5000` |
| `MONGO_URI` | Yes | MongoDB connection string | `mongodb://127.0.0.1:27017/pizzahub` |
| `JWT_SECRET` | Yes | JWT signing secret | `replace_with_strong_secret` |
| `BREVO_API_KEY` | For email flows | Brevo API key for OTP/reset emails | `xkeysib-...` |
| `EMAIL_FROM` | For email flows | Verified sender email or `Name <email>` | `PizzaHub <noreply@example.com>` |
| `FRONTEND_URL` | Recommended | Base URL used in password reset links | `http://localhost:5173` |
| `NODE_ENV` | No | Runtime environment | `development` |

### Frontend (`frontend/.env`)

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `VITE_API_URL` | Recommended | Backend API base URL | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Recommended | Backend Socket.IO server URL | `http://localhost:5000` |

## Running the Application

Start the backend:

```bash
cd backend
npm start
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend app: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Backend health route: `GET http://localhost:5000/`

## Available Scripts

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run preview
npm run lint
npm test
```

### Backend

```bash
cd backend
npm start
npm test
```

## Routes

### Frontend routes

| Route | Access | Description |
| --- | --- | --- |
| `/` | Public | Landing page or redirect for logged-in users |
| `/login` | Public | Customer/admin login |
| `/register` | Public | Customer registration |
| `/verify-otp` | Public | OTP verification after registration |
| `/forgot-password` | Public | Request password reset email |
| `/reset-password/:token` | Public | Reset password with email token |
| `/menu` | Customer | Browse menu |
| `/cart` | Customer | View and manage cart |
| `/checkout` | Customer | Review order before payment |
| `/payment/:orderId` | Customer | Complete payment |
| `/orders` | Customer | View order history |
| `/favorites` | Customer | View favorite menu items |
| `/messages` | Customer | View messages and notifications |
| `/profile` | Customer | View and edit profile |
| `/admin/dashboard` | Admin | Dashboard summary |
| `/admin/categories` | Admin | Manage categories |
| `/admin/menu` | Admin | Manage menu items |
| `/admin/users` | Admin | View users |
| `/admin/orders` | Admin | Manage orders |
| `/admin/revenue` | Admin | Revenue reporting |
| `/admin/notifications` | Admin | Admin notifications |

## API Endpoints

### User routes (`/api/user`)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/register` | No | Register a user |
| `POST` | `/login` | No | Login and receive JWT |
| `POST` | `/verify-otp` | No | Verify registration OTP |
| `POST` | `/resend-otp` | No | Resend registration OTP |
| `POST` | `/forgot-password` | No | Send password reset email |
| `POST` | `/reset-password/:token` | No | Reset password using token |
| `POST` | `/logout` | Yes | Logout user |
| `GET` | `/profile` | Yes | Get current profile |
| `PUT` | `/profile` | Yes | Update current profile |
| `GET` | `/categories` | No | Get all categories |
| `GET` | `/menu` | No | Get all menu items |
| `GET` | `/menu/:categoryId` | No | Get menu items by category |
| `POST` | `/cart` | Yes | Add item to cart |
| `GET` | `/cart/:userId` | Yes | Get cart by user |
| `PUT` | `/cart/:userId/:itemId` | Yes | Update cart quantity |
| `DELETE` | `/cart/:userId/:itemId` | Yes | Remove one cart item |
| `DELETE` | `/cart/:userId` | Yes | Clear cart |
| `GET` | `/favorites` | Yes | Get favorite items |
| `POST` | `/favorites/:itemId` | Yes | Add favorite |
| `DELETE` | `/favorites/:itemId` | Yes | Remove favorite |
| `POST` | `/order` | Yes | Place order |
| `PUT` | `/order/cancel/:id` | Yes | Cancel order |
| `GET` | `/orders/:userId` | Yes | Get user orders |
| `GET` | `/order/:id` | Yes | Get one order |
| `POST` | `/payment` | Yes | Submit payment |
| `GET` | `/messages/:userId` | Yes | Get user messages |
| `PUT` | `/messages/:id/read` | Yes | Mark message as read |
| `POST` | `/address` | Yes | Add address |
| `GET` | `/address/:userId` | Yes | Get user addresses |
| `PUT` | `/address/:id` | Yes | Update address |
| `DELETE` | `/address/:id` | Yes | Delete address |

### Admin routes (`/api/admin`)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/login` | No | Admin login |
| `POST` | `/logout` | Yes | Admin logout |
| `GET` | `/users` | Yes | List users |
| `POST` | `/menu` | Yes | Create menu item |
| `GET` | `/menu` | Yes | List all menu items |
| `PUT` | `/menu/:id` | Yes | Update menu item |
| `DELETE` | `/menu/:id` | Yes | Delete menu item |
| `POST` | `/category` | Yes | Create category |
| `GET` | `/orders` | Yes | List all orders |
| `PUT` | `/orders/:id` | Yes | Update order status |
| `GET` | `/notifications` | Yes | Get admin notifications |
| `PUT` | `/notifications/read` | Yes | Mark admin notifications as read |
| `POST` | `/message` | Yes | Send a message to a user |
| `GET` | `/bill/:orderId` | Yes | Generate order bill |
| `GET` | `/revenue` | Yes | Revenue summary |
| `GET` | `/dashboard` | Yes | Dashboard analytics |

## Architecture Overview

```text
Frontend (React + Redux + React Router)
  -> Axios API client
  -> Socket.IO client
  -> Protected customer/admin layouts

Backend (Express + Mongoose)
  -> Route layer
  -> Auth middleware
  -> Controllers
  -> MongoDB models
  -> Socket.IO server

External services
  -> MongoDB
  -> Brevo email API
```

### Key implementation patterns

- JWT-based auth with role-aware protected routes
- Redux Toolkit async thunks for API workflows
- Axios interceptors for attaching tokens
- Socket.IO rooms for user-specific and admin-specific notifications
- Formik and Yup for validated forms
- Modular controller and route separation on the backend

## Live Deployment

- Frontend: https://pizzeria-c9055.web.app
- Backend: https://capstoneproject-1--0g2z.onrender.com/

## Author

Mujahid Mahedi
