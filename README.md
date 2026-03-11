# Blood Donation Management System

An web application for managing blood donation processes, appointments, inventory, and donor information. Built with React, Vite, and Firebase Realtime Database.

demo: blood-donation-management-system-r1cq7rov5-hitrecords-projects.vercel.app

## 🚀 Tech Stack

- **React 19.2.0** — UI library
- **Vite 7.3.1** — Build tool
- **React Router DOM 7.13.1** — Routing
- **Firebase** — Authentication & Realtime Database
- **ESLint** — Code linting

## 📁 Project Structure

```
├── docs/                # Documentation (diagrams, SRS, architecture)
├── public/              # Static assets
├── scripts/             # Data seeding scripts
├── src/
│   ├── assets/          # Images, icons
│   ├── components/      # Reusable UI components (Navbar, etc.)
│   ├── context/         # React Contexts (AuthContext)
│   ├── data/            # App config, helpers, data access
│   ├── firebase/        # Firebase config
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Main app pages (Dashboards, Booking, etc.)
│   ├── App.jsx          # Main app component
│   ├── App.css
│   ├── main.jsx         # Entry point
│   └── index.css
├── eslint.config.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## ✨ Features

- **User Authentication** — Secure login/registration for donors, staff, and admin
- **Role-based Dashboards** — Donor, Staff, and Admin dashboards with tailored features
- **Appointment Booking** — Book, view, and manage donation appointments
- **Inventory Management** — Track and update blood inventory by type and expiry
- **Donor Search** — Search/filter donors by blood type and eligibility
- **Admin Account Management** — Create, edit, and manage user accounts
- **Eligibility Checks** — Automated eligibility and deferral period logic
- **Firebase Integration** — Real-time data sync and authentication

## 🛠️ Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (or yarn)

### Installation & Usage

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 📝 Development Guidelines

- Place reusable UI components in `src/components/`
- Page components go in `src/pages/`
- React Contexts in `src/context/`
- App config, helpers, and data access in `src/data/`
- Firebase config in `src/firebase/`
- Custom hooks in `src/hooks/`

## 🔐 User Roles

- **Donor** — Book appointments, view donation history, update profile
- **Staff** — Manage appointments, update inventory, search donors
- **Admin** — Manage user accounts, view all data

## 📄 License

This project is for educational purposes only.

---

Built with React, Vite, and Firebase
