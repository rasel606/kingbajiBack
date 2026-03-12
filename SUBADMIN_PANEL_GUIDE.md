# Megabaji Application Setup - Complete Guide

## Overview
The Megabaji application consists of 4 separate applications:

1. **Backend Server** (Port: 5000)
2. **CoreUI Admin Panel** (Port: 3000)
3. **My App Frontend** (Port: 3001)
4. **Sub Admin Panel** (Port: 5173) ⭐ NEW

## Quick Start

### Option 1: Run All Applications
```bash
start-all-with-subadmin.bat
```

This will start all 4 applications simultaneously.

### Option 2: Run Individually

#### Backend Server
```bash
start-backend.bat
# Or manually:
cd backend
npm start
```

#### CoreUI Admin Panel
```bash
start-coreui.bat
# Or manually:
cd coreui-free-react-admin-template-main
npm start
```

#### My App Frontend
```bash
start-myapp.bat
# Or manually:
cd my-app
npm start
```

#### Sub Admin Panel ⭐ NEW
```bash
start-subadmin.bat
# Or manually:
cd subadmin-panel
npm start
```

## Application URLs

Once all applications are running, access them at:

- **Backend API**: http://localhost:5000
- **Admin Panel**: http://localhost:3000
- **Frontend App**: http://localhost:5000
- **Sub Admin Panel**: http://localhost:5173

## Sub Admin Panel Features

The Sub Admin Panel provides a streamlined interface for sub-administrators with the following features:

### Dashboard
- Quick stats overview
- Recent activity monitoring
- Real-time updates

### User Management
- View all users
- User details and activity
- User status management

### Transaction Management
- **Deposits**: Approve/reject deposit requests
- **Withdrawals**: Process withdrawal requests  
- **Transaction History**: Complete transaction logs

### Payment Gateways
- Deposit gateway configuration
- Withdrawal gateway settings

### Reports
- User activity reports
- Transaction reports
- Analytics and insights

### Account & Settings
- Sub admin profile management
- Preferences and settings

## First Time Setup

If this is your first time running the sub-admin panel:

1. Install dependencies:
   ```bash
   cd subadmin-panel
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. Start the application:
   ```bash
   npm start
   ```

## Development

### Technology Stack
- **Frontend Framework**: React 19
- **UI Library**: CoreUI 5
- **Build Tool**: Vite 7
- **State Management**: Redux
- **Routing**: React Router DOM v7
- **Styling**: SCSS

### Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Preview production build
- `npm run lint` - Run ESLint

## Troubleshooting

### Port Already in Use
If port 5173 is already in use, you can change it in `vite.config.mjs`:

```javascript
server: {
  port: 5174, // Change to any available port
  // ...
}
```

### Dependencies Error
```bash
cd subadmin-panel
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
Make sure you have Node.js v16 or higher:
```bash
node --version
```

## Production Deployment

### Build for Production
```bash
cd subadmin-panel
npm run build
```

The build files will be created in the `build/` directory.

### Deploy to Vercel
The sub-admin panel includes a `vercel.json` configuration file for easy deployment.

```bash
vercel deploy
```

## Architecture

```
subadmin-panel/
├── public/              # Static files
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable components
│   ├── context/         # React context providers
│   │   ├── AuthContext.js
│   │   ├── ToastContext.js
│   │   └── NotificationContext.js
│   ├── hooks/           # Custom React hooks
│   ├── layout/          # Layout components
│   │   ├── DefaultLayout.js
│   │   ├── AppHeader.js
│   │   ├── AppSidebar.js
│   │   └── AppFooter.js
│   ├── scss/            # Styles
│   ├── service/         # API services
│   ├── views/           # Page components
│   │   ├── dashboard/
│   │   ├── users/
│   │   ├── transactions/
│   │   ├── gateways/
│   │   ├── reports/
│   │   ├── account/
│   │   └── pages/
│   ├── App.js           # Main app component
│   ├── index.js         # Entry point
│   ├── routes.js        # Route definitions
│   ├── _nav.js          # Navigation structure
│   └── store.js         # Redux store
├── .env                 # Environment variables
├── .env.example         # Environment template
├── package.json
├── vite.config.mjs      # Vite configuration
└── README.md

```

## API Integration

The sub-admin panel is configured to proxy API requests to the backend server:

```javascript
// vite.config.mjs
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

All API calls to `/api/*` will be forwarded to `http://localhost:5000/api/*`

## License
MIT
