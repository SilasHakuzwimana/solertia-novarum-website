# Solertia Novarum Ltd - Enterprise Technology Platform

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.22-000000?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

## 🏢 About Solertia Novarum Ltd

Solertia Novarum Ltd is a global technology integration partner specializing in enterprise systems, cross-platform applications, AI pipelines, and IoT frameworks. We empower organizations with high-availability digital infrastructures while training the next generation of software engineers.

## 📋 Project Overview

This full-stack platform serves as the official corporate website and admin dashboard for Solertia Novarum Ltd, featuring:

### 🌐 Public Website
- Corporate landing page with dynamic announcement system
- Enterprise technology services showcase
- Virtual internship pipeline (SOD & NIT tracks)
- Academic support and training programs
- Partnership inquiry portal
- Real-time SLA estimation

### 🔐 Admin Dashboard
- Secure authentication with OTP verification
- Partnership and application management
- Dynamic announcement editor
- Report generation (PDF, Excel, CSV, Word)
- Email notification system
- Analytics and statistics dashboard

## 🚀 Tech Stack

### Frontend
- **React 19** with Hooks
- **TypeScript** for type safety
- **Tailwind CSS 4.0** for styling
- **Vite** for build tooling
- **Lucide React** for icons
- **Motion/Framer Motion** for animations

### Backend
- **Node.js** with Express
- **TypeScript** (server)
- **PostgreSQL** with pg
- **JWT** for authentication
- **Nodemailer** for emails
- **JSPDF, XLSX** for reports

## Note: 
Dependency version can be viewed from 'package.json' file.

## 🏗️ Architecture
```bash
.
├── App.tsx
├── admin.tsx
├── api
│   ├── admin.service.ts
│   ├── auth.service.ts
│   ├── client.ts
│   ├── config.ts
│   ├── hooks.ts
│   ├── index.ts
│   └── services.ts
├── components
│   ├── AdminDashboard.tsx
│   ├── ReportingPanel.tsx
│   └── dashboard
│       ├── AnnouncementEditor.tsx
│       ├── AuthScreen.tsx
│       ├── ConfirmationModal.tsx
│       ├── DashboardHeader.tsx
│       ├── DataTable.tsx
│       ├── ForgotPassword.tsx
│       ├── LoginForm.tsx
│       ├── OTPVerification.tsx
│       ├── RecentActivity.tsx
│       ├── ReplyModal.tsx
│       ├── ResetPassword.tsx
│       ├── StatsCards.tsx
│       └── index.ts
├── controllers
│   ├── announcement.controller.ts
│   ├── application.controller.ts
│   ├── auth.controller.ts
│   ├── partnership.controller.ts
│   ├── password.controller.ts
│   └── stats.controller.ts
├── data.ts
├── index.css
├── main.tsx
├── middleware
│   └── auth.middleware.ts
├── routes
│   ├── announcement.routes.ts
│   ├── application.routes.ts
│   ├── auth.routes.ts
│   ├── partnership.routes.ts
│   └── stats.routes.ts
├── scripts
│   ├── init-db.ts
│   └── schema.sql
├── services
│   ├── announcement.service.ts
│   ├── database.service.ts
│   ├── email.service.ts
│   ├── otp.service.ts
│   └── reporting.service.ts
└── types.ts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- pnpm (recommended) or npm

### Installation

# Clone the repository
```bash
git clone https://github.com/SilasHakuzwimana/solertia-novarum-website.git
cd solertia-novarum-website
```
# Install dependencies
```bash
pnpm install
```
# Set up environment variables
```bash
cp .env
```
# Initialize the database
```bash
pnpm run migrate
```
# Start development server
```bash
pnpm run dev
```
# Start production build
```bash
pnpm run build
```

```bash
pnpm run start
```

## Docker Setup

Remember to request access to docker-compose.yml file, kept for security purpose.

# Build and run with Docker
```bash
docker-compose up -d
```

# Run database migrations
```bash
docker exec solertia-backend node db/migrate.js
```
### 📦 Key Features

## Admin Dashboard
```bash
✅ Secure authentication with OTP
✅ Partnership and application CRUD
✅ Dynamic announcement system
✅ Multi-format report generation
✅ Email notifications
✅ Audit logging
```
## Public Website
```bash
✅ Responsive corporate design
✅ Interactive service showcase
✅ Virtual internship tracks
✅ Training program explorer
✅ Partnership inquiry form
✅ Real-time SLA estimator
```
## 🔒 Security

- JWT-based authentication
- OTP verification for admin access
- Password hashing with bcrypt
- CORS configuration
- Rate limiting
- Secure session management

## 📊 Reporting

The platform supports report generation in:

- PDF - Professional document format
- Excel - Spreadsheet format
- CSV - Data export format
- Word - Document format

## 🐳 Docker Support

The project includes Docker configuration for:

- PostgreSQL database
- Node.js backend
- Auto-migrations on startup

## 🤝 Contributing

- Fork the repository
- Create your feature branch (git checkout -b feature/amazing-feature)
- Commit your changes (git commit -m 'Add amazing feature')
- Push to the branch (git push origin feature/amazing-feature)
- Open a Pull Request

## 📝 License
Copyright © 2026 Solertia Novarum Ltd. All rights reserved.

# 📬 Contact

```bash
Website: solertianovarum.com
Email: enquiry@solertianovarum.com
Location: Bugesera, Mareba & KN 2 Avenue, Kigali, Rwanda
```

Built with ❤️ by the Solertia Novarum Team
