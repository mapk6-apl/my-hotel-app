# Break-Away Hotels

A full-stack hotel booking application that allows users to discover accommodation, manage their accounts, save favourite hotels, and make reservations through an intuitive online platform.

🚀 **Live Link:** [Click here to explore Break-Away Hotels!](https://my-hotel-app-gamma.vercel.app/)

---

## 📖 About The App

> Break-Away Hotels is a hotel booking application designed to make finding and booking accommodation easier. Users can register or log in using email and password or Google authentication, explore available hotels, view individual hotel details, and make reservations. The application also includes user account functionality, favourites, and an administrative dashboard for managing hotel information and bookings. Paystack is integrated to support the payment process.

---

## 📸 App Screenshots

*Screenshots coming soon!*

---

## ✨ Cool Features I Built

- **User Authentication:** Users can create accounts and securely log in using email and password or Google sign-in.
- **Hotel Discovery:** Browse available hotels and explore accommodation options.
- **Hotel Details:** View individual hotel information and property images before making a booking.
- **Hotel Reservations:** Users can make hotel reservations through the application.
- **Favourites:** Save preferred hotels for easier access later.
- **Online Payments:** Paystack integration supports the application's payment process, with test-mode payments used during development.
- **Admin Dashboard:** Provides administrative functionality for viewing booking statistics, managing reservations, updating booking statuses, and managing hotel branches.
- **Responsive Interface:** Designed to provide an accessible experience across different screen sizes.

---

## 🛠️ Tools Used to Build It

- **React:** Used to build the frontend and reusable user interface components.
- **TypeScript:** Provides type safety and helps maintain a structured codebase.
- **Vite:** Powers the frontend development environment and production build.
- **Node.js:** Provides the JavaScript runtime for the backend.
- **Express.js:** Handles backend routes, API requests, and application logic.
- **PostgreSQL:** Relational database used to store application data, including users, hotels, and bookings.
- **Neon:** Provides the hosted PostgreSQL database for the deployed application.
- **Paystack API:** Integrates payment functionality.
- **Google OAuth:** Enables users to authenticate using their Google accounts.
- **REST APIs:** Connect the frontend to backend services.
- **CSS:** Used to style the application and create its responsive interface.
- **Vercel:** Hosts the deployed application and serverless API endpoints.

---

## 🗄️ Database

The application uses **PostgreSQL** as its relational database, with **Neon** providing the cloud-hosted database for the deployed application.

The database stores and manages information such as:

- User accounts and authentication details.
- Hotel and accommodation information.
- Booking and reservation records.
- Favourite hotels.
- Google authentication codes.

The backend communicates with the database to retrieve, create, and update application records.

---

## 👤 Admin Access

The application includes an administrative account with access to the admin dashboard.

**Admin Login Credentials:**

- **Email:** `admin@breakawayhotels.com`
- **Password:** `admin.123`

Administrators can access administrative functionality for viewing booking statistics, managing reservations, updating booking statuses, and managing hotel branches.

---

## ⚙️ How to Run It on Your Computer

This project contains a React frontend and an Express backend. Both need to be configured for the application to work locally.

### 1. Clone the repository

```bash
git clone https://github.com/mapk6-apl/my-hotel-app.git
cd my-hotel-app
```

### 2. Install dependencies

Install the project dependencies:

```bash
npm install
```

If the frontend and backend have separate package files, install their dependencies in their respective directories as well.

### 3. Configure environment variables

Create a `.env` file inside the `server` directory and configure the required environment variables.

Example:

```env
DATABASE_URL=your_postgresql_connection_string
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=your_google_callback_url
PAYSTACK_SECRET_KEY=your_paystack_test_secret_key
```

Make sure to use your own credentials and keep sensitive environment variables out of version control.

### 4. Start the application

From the project root, run:

```bash
npm run dev
```

Open the local frontend URL displayed in your terminal to access the application.

---

## 🔐 Authentication and Security

The application uses server-side authentication to protect user accounts and restricted routes. Passwords are securely handled, while authenticated requests use tokens to verify user access. Google OAuth provides an alternative sign-in method. Administrative routes also require authentication and appropriate administrator privileges.

---

## 💳 Payment Integration

Paystack is integrated to support online payments within the hotel booking process. The application uses Paystack's test environment during development to allow payment functionality to be tested without processing real transactions.

---

## 📝 Credits

Copyright © 2026 Break-Away Hotels. All rights reserved.
