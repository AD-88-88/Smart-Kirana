# SmartKirana — Phase 1 🛒

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Admin-orange.svg)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

A robust, real-time inventory management and POS billing platform tailored for small-to-medium retail businesses. Designed to provide high-performance operations, stock management, and seamless transactions.

---

## 🚀 Key Features

*   **⚡ Real-time Inventory:** Instant product catalog management with live listeners.
*   **💳 POS Billing:** Seamless transaction flow with support for Cash, UPI, and Udhar (credit) modes.
*   **📊 Insights Dashboard:** Sales tracking, rate lookups, and stock alerts at a glance.
*   **👥 User Roles:** Owner-level control with staff-restricted functionalities (e.g., hidden purchase prices for staff).
*   **📱 Modern UI:** PWA-ready interface built for mobile, tablet, and desktop usage.

---

## 🛠 Tech Stack

*   **Frontend:** React (Vite), Tailwind CSS, Firebase Client SDK.
*   **Backend:** Node.js, Express, Firebase Admin SDK.
*   **Database:** Firestore (Transactions, Real-time updates).

---

## 📦 Project Structure

```text
smartkirana/
├── backend/     # Node.js + Express API
├── frontend/    # React + Tailwind PWA
├── firestore.rules
└── firestore.indexes.json
```

---

## ⚙️ Quick Start

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Firebase CLI](https://firebase.google.com/docs/cli)

### 2. Setup

```bash
# Clone the repository
git clone https://github.com/AD-88-88/Smart-Kirana.git
cd Smart-Kirana

# Backend setup
cd backend
npm install
cp .env.example .env
# Configure your Firebase Admin credentials in backend/config/serviceAccountKey.json

# Frontend setup
cd ../frontend
npm install
cp .env.example .env
# Configure your Firebase web credentials in frontend/.env

# Start development
# Start backend on one terminal, frontend on another
```

*See [Documentation](#) (optional) for detailed deployment instructions.*

---

## 📝 Roadmap (Phase 2/3)

- [ ] Bulk CSV import for inventory
- [ ] Comprehensive Udhar aging reports
- [ ] WhatsApp payment reminders
- [ ] Public customer-facing catalog

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

Made with ❤️ by [Your Name/Team]
