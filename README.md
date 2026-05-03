# KaziLink - The Ultimate Short-term Gig Economy Platform

Think "Uber for Jobs": an employer posts a task, nearby workers apply instantly, the employer picks the best match, and the platform manages the transaction securely.

## 🚀 Technology Stack
- **Frontend**: Mobile-first React, Tailwind CSS, Vite.
- **Backend**: Node.js, Express, strict JWT Authentication.
- **Database**: PostgreSQL connected via Prisma ORM v5.

## 📦 Setup Instructions

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL Database running locally or via Docker

### 2. Database & Backend Configuration
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables:
   Rename `.env.example` to `.env` and provide your actual `DATABASE_URL` and `JWT_SECRET`.
4. Migrate the database schema:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Seed the default Admin user (Password: *admin123*, Email: *admin@kazilink.com*):
   ```bash
   npm run seed
   ```
6. Start the Express API Server:
   ```bash
   npm run dev
   ```
   *The API runs at `http://localhost:5000` focusing strongly on rate-limits, helmet security, CORS and IDOR protection middleware.*

### 3. Frontend Configuration
1. In a separate terminal, navigate to the `scratch/` (Frontend) directory:
   ```bash
   npm install
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The UI runs at `http://localhost:5173`. Tailwind is pre-configured.*

## 🛡️ Security Measures
- **Role-Based Access Control**: `EMPLOYER`, `WORKER`, and `ADMIN` routes are strictly delineated.
- **IDOR Prevention**: Employers only retrieve jobs matching their `req.user.id`.
- **Bot Mitigation**: Uses `express-rate-limit` on all API endpoints.
- **Header Hardening**: Implemented via `helmet`.
- **Encryption**: Standard BCrypt (10 rounds salt).

## ✨ Admin Note
Do **NOT** use dummy data generator scripts. Real production data flow triggers should be used to simulate platform economy accurately.
