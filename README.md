# ShopSphere 🛍️

**ShopSphere** is a full-stack e-commerce marketplace built with the
**MERN stack**. It provides a complete shopping experience for customers
along with dedicated management features for sellers/hosts and
administrators.

## 🔗 Project Links

-   **GitHub Repository:** https://github.com/KumarYash07/ShopSphere
-   **Live Demo:** https://shop-sphere-ashy.vercel.app/

------------------------------------------------------------------------

## ✨ Features

### 👤 Customer

-   User registration with email OTP verification
-   Email/password login
-   Google Sign-In / Sign-Up
-   JWT-based authentication
-   Editable profile information
-   Email change with OTP verification
-   Password creation/update and password security settings
-   Saved addresses
-   Product browsing and search
-   Product categories
-   Product details
-   Wishlist
-   Shopping cart
-   Order placement
-   Order history
-   Order status tracking
-   Payment flow
-   Responsive marketplace interface

### 🏪 Seller / Host

-   Seller/host registration
-   Admin approval workflow
-   Seller profile
-   Store creation and management
-   Product management
-   Product catalog management
-   Store operational status
-   Host order management
-   Order status updates

### 🛡️ Admin

-   Admin dashboard
-   Platform overview and system metrics
-   Category management
-   Host/seller management
-   Host approval and account moderation
-   Store management
-   Product overview/moderation
-   Orders and revenue management
-   Order status management
-   Customer/order information
-   Store operational controls

------------------------------------------------------------------------

## 🔐 Authentication & Authorization

ShopSphere supports multiple authentication methods:

-   **Local authentication:** Email + password
-   **Google authentication:** Google OAuth
-   **JWT:** Used to authenticate protected API requests
-   **Role-based access:** `user`, `host`, and `admin`
-   **Email verification:** OTP-based verification
-   **Host approval:** Host accounts require administrator approval
    before login

Protected routes use JWT authentication and role-specific middleware.

------------------------------------------------------------------------

## 🛠️ Tech Stack

### Frontend

-   React
-   Vite
-   React Router
-   Axios
-   Bootstrap
-   React Bootstrap
-   Framer Motion
-   React Icons

### Backend

-   Node.js
-   Express.js
-   MongoDB
-   Mongoose
-   JWT
-   bcryptjs
-   Google Auth Library
-   Nodemailer
-   Multer
-   Cloudinary
-   CORS
-   dotenv

### Deployment

-   Vercel
-   MongoDB Atlas
-   Cloudinary
-   Google Cloud OAuth

------------------------------------------------------------------------

## 📁 Project Structure

``` text
ShopSphere/
│
├── api/
│   └── index.js
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── ...
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── package.json
├── vercel.json
└── README.md
```

------------------------------------------------------------------------

## 🚀 Local Installation

### 1. Clone the repository

``` bash
git clone https://github.com/KumarYash07/ShopSphere.git
cd ShopSphere
```

### 2. Install frontend dependencies

``` bash
cd client
npm install
```

### 3. Install backend dependencies

Open another terminal:

``` bash
cd server
npm install
```

### 4. Configure environment variables

Create:

``` text
client/.env
server/.env
```

Do not commit these files to GitHub.

------------------------------------------------------------------------

## ⚙️ Environment Variables

### Frontend

The frontend uses Vite environment variables.

Example:

``` env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

For the deployed version, the API can use the same Vercel domain
through:

``` env
VITE_API_URL=/api
```

### Backend

The backend requires the environment variables used by the
authentication, database, email, Google authentication, payment, and
Cloudinary services configured in the project.

Typical variables include:

``` env
PORT=5000

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
```

> Never commit real credentials, API keys, passwords, JWT secrets, or
> OAuth secrets to GitHub.

------------------------------------------------------------------------

## ▶️ Run the Application Locally

### Start backend

``` bash
cd server
npm run dev
```

Backend runs on:

``` text
http://localhost:5000
```

### Start frontend

In another terminal:

``` bash
cd client
npm run dev
```

Frontend normally runs on the Vite development URL shown in the
terminal.

------------------------------------------------------------------------

## 🔌 API Structure

The Express backend exposes the following main API groups:

``` text
/api/auth
/api/users
/api/admin
/api/stores
/api/categories
/api/products
/api/cart
/api/addresses
/api/orders
/api/payments
/api/admin/orders
/api/host/orders
/api/wishlist
```

Authentication-protected endpoints use the JWT token supplied through
the request `Authorization` header.

------------------------------------------------------------------------

## ☁️ Vercel Deployment

The project is configured to use **one Vercel project** for both the
React frontend and Express API.

Production architecture:

``` text
                    Vercel
                      │
             ┌────────┴────────┐
             │                 │
        React Frontend      Express API
        client/dist        api/index.js
                                │
                           server/app.js
                                │
                          MongoDB / Services
```

### Deployment Steps

1.  Push the latest code to GitHub.
2.  Import the repository into Vercel.
3.  Keep the project root as the repository root.
4.  Add all required environment variables in: **Vercel → Project →
    Settings → Environment Variables**
5.  Deploy the project.
6.  Update Google OAuth authorized origins/redirect settings with the
    production domain where required.
7.  Test authentication, products, cart, wishlist, orders, payments, and
    admin/seller functionality.

The frontend uses `/api` for production API requests so the frontend and
backend can run under the same Vercel domain.

------------------------------------------------------------------------

## 🗄️ Database

ShopSphere uses **MongoDB** with **Mongoose**.

The backend connects using:

``` env
MONGO_URI=your_mongodb_connection_string
```

For production, MongoDB Atlas should allow connections from the deployed
backend environment.

------------------------------------------------------------------------

## ☁️ Image Storage

Product and profile images can be handled through **Cloudinary**.

Required Cloudinary credentials should be stored only in environment
variables.

------------------------------------------------------------------------

## 📧 Email & OTP

Email verification uses OTP-based authentication.

The backend uses:

-   Nodemailer for sending emails
-   bcryptjs for secure OTP hashing
-   Expiration and attempt limits for OTP verification

------------------------------------------------------------------------

## 🔑 Security

Security-related implementations include:

-   Password hashing with bcrypt
-   JWT authentication
-   Protected API routes
-   Role-based authorization
-   Email verification
-   OTP expiration
-   OTP attempt limits
-   Blocked-account checks
-   Host approval checks
-   Environment-based secret management
-   No sensitive credentials stored in source code

------------------------------------------------------------------------

## 🧪 Testing Checklist

Before deployment, verify:

-   [ ] User registration
-   [ ] Email OTP verification
-   [ ] Email/password login
-   [ ] Google Sign-In
-   [ ] Google Sign-Up
-   [ ] Profile update
-   [ ] Email change + OTP verification
-   [ ] Password update
-   [ ] Product browsing
-   [ ] Search and categories
-   [ ] Add/remove wishlist items
-   [ ] Wishlist persistence for authenticated users
-   [ ] Add/remove cart items
-   [ ] Checkout/payment flow
-   [ ] Order creation
-   [ ] Order history
-   [ ] Order status updates
-   [ ] Seller/host registration
-   [ ] Admin host approval
-   [ ] Store management
-   [ ] Product management
-   [ ] Admin order management
-   [ ] Admin revenue dashboard
-   [ ] Image upload
-   [ ] Logout/login persistence
-   [ ] Responsive UI
-   [ ] Production API requests

------------------------------------------------------------------------

## 🎨 UI Highlights

ShopSphere provides a modern marketplace interface with:

-   Responsive navigation
-   Product cards
-   Category navigation
-   Search interface
-   Wishlist and cart controls
-   Account/profile dashboard
-   Seller/host management
-   Admin control panel
-   Order management
-   Animated interactions using Framer Motion
-   Responsive layouts for different screen sizes

------------------------------------------------------------------------

## 📸 Screenshots

### Customer Marketplace

*Add screenshot here after final deployment.*

### Product / Shopping Experience

*Add screenshot here after final deployment.*

### Wishlist

*Add screenshot here after final deployment.*

### Seller / Host Dashboard

*Add screenshot here after final deployment.*

### Admin Dashboard

*Add screenshot here after final deployment.*

------------------------------------------------------------------------

## 👨‍💻 Author

**Yash Kumar**

GitHub:\
https://github.com/KumarYash07

------------------------------------------------------------------------

## 📄 License

This project is currently intended for learning, portfolio, and
demonstration purposes.

If you plan to distribute or deploy it commercially, add an appropriate
license and review the licensing requirements of all third-party
services and dependencies.
