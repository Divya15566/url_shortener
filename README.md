# URL Shortener

A full-stack URL shortener application that allows users to create, manage, and analyze shortened URLs. The application includes user authentication, analytics, and a dashboard for managing links.

## Features
- User authentication (login/logout)
- Create shortened URLs with optional custom aliases
- View and manage your links in a dashboard
- Analytics for tracking clicks and user activity
- Expiration dates for links
- Responsive design

## Tech Stack
### Frontend
- React
- Redux Toolkit
- Tailwind CSS

### Backend
- Node.js
- Express
- MongoDB

## Prerequisites
- Node.js (v14 or later)
- MongoDB (local or cloud instance)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd url-shortener
```

### 2. Install Dependencies
#### Install server dependencies:
```bash
cd server
npm install
```

#### Install client dependencies:
```bash
cd ../client
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the `server` directory with the following variables:
```
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
BASE_URL=http://localhost:5000
```

### 4. Start the Application
#### Start the backend server:
```bash
cd server
npm start
```

#### Start the frontend development server:
```bash
cd ../client
npm start
```

### 5. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```
