# E-Commerce Website for Electronics

## Overview

This is a full-stack e-commerce web application designed for selling electronics such as phones, laptops, and accessories. The platform provides a user-friendly shopping experience along with a powerful admin dashboard for managing the system.

## Tech Stack

* Backend: Node.js and Express
* Database: MongoDB
* Security: Helmet, express-rate-limit, express-session
* Password Hashing: bcryptjs

## Live website

* Website: https://compet.mahmoud-work.online/
* Admin Panel: https://compet.mahmoud-work.online/admin

### Admin Access

To access the admin panel, use the following credentials:

* Username: admin
* Password: admin123

## Security

The application includes several security measures:

* Password hashing using bcryptjs
* HTTP security headers using Helmet
* Rate limiting using express-rate-limit
* Session management using express-session

## Role System

* Owner: Has access to all categories and system features
* Order Manager: Has access to all orders
* Stock Manager: Has access to stock management

## Data Management

All data  products, categories, orders, contacts, and user visits are stored in MongoDB in the `models` folder.
Order data is handled and managed through the backend API in `routers/order.js`.

## Features

* Browse products by name and category using the search bar
* View detailed product information
* Add items to the cart
* Responsive UI for mobile and desktop devices
* Sold-out system (products become unavailable when stock is 0 or manually disabled)
* AJAX functionality for the admin panel
* Performance optimization with fast loading using static files

## User Pages

* Home
* Product Details
* Cart
* Checkout
* Contact
* About

## Admin Pages

* Login
* Messages
* Dashboard
* Categories
* Products
* Orders
* Users
* Stock

## How to Run the Project

The project is deployed on a single server.
1. You need to configure the .env file
2. Build the frontend:
   npm run build

3. Copy the generated `dist` folder (static files) into the backend directory.

4. Run the backend server:
   node server.js
