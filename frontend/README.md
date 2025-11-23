# ClinicHub - Clinic Management SaaS MVP

A complete multi-tenant SaaS platform for clinic management built with **Astro + React** (frontend) and **Express.js + SQLite** (backend).

## 🚀 Features

- **Public Clinic Directory** - Search clinics by city, specialty, and services
- **Patient Portal** - View appointments, request/cancel appointments
- **Clinic Dashboard** - Manage patients, appointments, and staff
- **Role-Based Access Control** - Owner, Admin, Doctor, Nurse, Reception, Patient roles
- **JWT Authentication** - Secure authentication with HTTP-only cookies
- **Multi-Tenant** - Each clinic has isolated data

## 📋 Tech Stack

### Frontend
- **Astro** - Static site generator with React islands
- **React** - UI components
- **Tailwind CSS v4** - Styling
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend
- **Express.js** - Web framework
- **SQLite3** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## 🛠️ Installation

### Prerequisites
- Node.js 18+ and npm

### Backend Setup

1. Navigate to backend directory:
\`\`\`bash
cd backend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Environment variables are already set in \`.env\` file (for development)

4. Seed the database with sample data:
\`\`\`bash
npm run seed
\`\`\`

5. Start the backend server:
\`\`\`bash
npm run dev
\`\`\`

Backend will run on **http://localhost:5000**

### Frontend Setup

1. From project root, install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start the frontend dev server:
\`\`\`bash
npm run dev
\`\`\`

Frontend will run on **http://localhost:4321**

## 🔑 Sample Login Credentials

After running \`npm run seed\` in the backend directory, you can use these credentials:

### Clinic Owner
- **Email:** admin@cityhealth.com
- **Password:** password123

### Doctor
- **Email:** sarah@cityhealth.com
- **Password:** password123

### Nurse
- **Email:** emily@cityhealth.com
- **Password:** password123

### Reception
- **Email:** robert@cityhealth.com
- **Password:** password123

### Admin
- **Email:** lisa@cityhealth.com
- **Password:** password123

## 📁 Project Structure

\`\`\`
clinic/
├── backend/                 # Express.js backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth & RBAC middleware
│   ├── routes/             # API routes
│   ├── utils/              # Validators
│   ├── server.js           # Express server
│   └── seed.js             # Database seeding
├── src/                    # Astro frontend
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   └── layout/        # Layout components
│   ├── layouts/           # Astro layouts
│   ├── lib/               # API client & services
│   ├── pages/             # Astro pages
│   │   ├── clinics/       # Public clinic pages
│   │   └── dashboard/     # Dashboard pages
│   └── styles/            # Global styles
└── package.json
\`\`\`

## 🌐 API Endpoints

### Authentication
- \`POST /api/auth/register-clinic\` - Register new clinic
- \`POST /api/auth/login\` - Login
- \`POST /api/auth/logout\` - Logout
- \`GET /api/auth/me\` - Get current user

### Clinics
- \`GET /api/clinics\` - List all clinics (public)
- \`GET /api/clinics/:id\` - Get clinic details (public)
- \`PUT /api/clinics/:id\` - Update clinic (Owner)

### Users
- \`GET /api/users\` - List clinic users (Owner/Admin)
- \`POST /api/users\` - Create user (Owner/Admin)
- \`PUT /api/users/:id\` - Update user (Owner/Admin)
- \`DELETE /api/users/:id\` - Delete user (Owner)

### Patients
- \`GET /api/patients\` - List patients (Staff)
- \`POST /api/patients\` - Create patient (Reception/Admin)
- \`GET /api/patients/:id\` - Get patient (Staff)
- \`PUT /api/patients/:id\` - Update patient (Staff)
- \`DELETE /api/patients/:id\` - Delete patient (Admin/Owner)

### Appointments
- \`GET /api/appointments\` - List appointments (Staff)
- \`POST /api/appointments\` - Create appointment (Reception/Admin)
- \`GET /api/appointments/:id\` - Get appointment (Staff)
- \`PUT /api/appointments/:id\` - Update appointment (Staff)
- \`DELETE /api/appointments/:id\` - Cancel appointment (Reception/Admin)

## 👥 User Roles

- **Super Admin** - Manage all clinics
- **Owner** - Manage clinic, users, view all data
- **Admin** - Manage appointments, patients, reports
- **Doctor** - View/update patient records
- **Nurse** - Add measurements, notes
- **Reception** - CRUD appointments, register patients
- **Patient** - View own data, request/cancel appointments

## 🎨 Pages

### Public Pages
- **/** - Landing page with hero and features
- **/clinics** - Clinic directory with search filters
- **/clinics/[id]** - Clinic profile page
- **/login** - Login page
- **/register** - Clinic registration

### Dashboard Pages (Protected)
- **/dashboard** - Dashboard home with statistics
- **/dashboard/patients** - Patient management (coming soon)
- **/dashboard/appointments** - Appointment management (coming soon)
- **/dashboard/users** - User management (coming soon)

## 🔒 Security

- JWT tokens stored in HTTP-only cookies
- Password hashing with bcryptjs
- RBAC enforced at API level
- Input validation on all endpoints
- CORS configured for frontend URL

## 🚀 Deployment

### Backend (Railway/Render)
1. Create new project
2. Connect repository
3. Set environment variables:
   - \`NODE_ENV=production\`
   - \`JWT_SECRET=<your-secret>\`
   - \`FRONTEND_URL=<your-frontend-url>\`
4. Deploy

### Frontend (Vercel/Netlify)
1. Create new project
2. Connect repository
3. Set build command: \`npm run build\`
4. Set output directory: \`dist\`
5. Set environment variable:
   - \`PUBLIC_API_URL=<your-backend-url>/api\`
6. Deploy

## 📝 MVP Scope

This is an MVP with core features only:
- ✅ Multi-tenant clinic management
- ✅ Patient records
- ✅ Appointment scheduling
- ✅ User management
- ✅ Role-based access control
- ❌ Billing (post-MVP)
- ❌ File uploads (post-MVP)
- ❌ Advanced calendar (post-MVP)
- ❌ Chat/messaging (post-MVP)

## 🤝 Contributing

This is an MVP project. For production use, consider adding:
- Unit and integration tests
- Email notifications
- File upload for patient documents
- Billing and invoicing
- Advanced reporting
- Mobile app

## 📄 License

MIT License - feel free to use this project for learning or as a starting point for your own clinic management system.
