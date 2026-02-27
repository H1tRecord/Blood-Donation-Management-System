# Blood Donation Management System

A comprehensive web application for managing blood donation processes, appointments, inventory, and donor information.

## 🚀 Tech Stack

- **React 19.2.0** - UI library
- **Vite 7.3.1** - Build tool
- **React Router DOM 7.13.1** - Routing
- **ESLint** - Code linting

## 📁 Project Structure

```
/
├── docs/                           # Documentation
│   ├── Database_Architecture.txt
│   └── SRS_IEEE830_Standard.txt
├── public/                         # Static assets
│   └── vite.svg
├── src/
│   ├── assets/                     # Images, fonts, icons
│   │   └── react.svg
│   ├── components/                 # Reusable UI components
│   │   └── layout/                 # Layout components
│   │       ├── Navbar.jsx
│   │       └── Navbar.css
│   ├── context/                    # React contexts
│   │   └── AuthContext.jsx
│   ├── data/                       # Mock data and constants
│   │   └── mockData.js
│   ├── hooks/                      # Custom React hooks
│   ├── pages/                      # Page components
│   │   ├── AppointmentBooking.jsx
│   │   ├── DonorDashboard.jsx
│   │   ├── DonorSearch.jsx
│   │   ├── InventoryManagement.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── StaffAppointments.jsx
│   │   └── StaffDashboard.jsx
│   ├── services/                   # API services
│   ├── styles/                     # Global styles
│   ├── utils/                      # Utility functions
│   ├── App.jsx                     # Main app component
│   ├── App.css
│   ├── main.jsx                    # Entry point
│   └── index.css
├── eslint.config.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## ✨ Features

- **User Authentication** - Secure login and registration for donors and staff
- **Donor Dashboard** - Personal dashboard for blood donors
- **Staff Dashboard** - Administrative interface for staff members
- **Appointment Booking** - Schedule blood donation appointments
- **Inventory Management** - Track blood inventory levels
- **Donor Search** - Find and manage donor information
- **Role-based Access Control** - Different features for donors and staff

## 🛠️ Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

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

### Adding New Components

- Place reusable components in `src/components/`
- Place page components in `src/pages/`
- Keep component-specific styles with the component

### Adding Custom Hooks

- Place custom hooks in `src/hooks/`
- Follow the `use` prefix convention

### Adding Services

- Place API services in `src/services/`
- Keep data fetching logic separate from components

### Adding Utilities

- Place helper functions in `src/utils/`
- Keep utilities pure and testable

## 🔐 User Roles

- **Donor** - Can book appointments, view donation history
- **Staff/Admin** - Can manage appointments, inventory, and donor information

## 📄 License

This project is for educational purposes.

---

Built with React + Vite
