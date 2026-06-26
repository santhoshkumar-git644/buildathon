# ✨ ShearCity - AI Salon Assistant & Booking Platform

ShearCity is a premium, AI-powered web application that revolutionizes how users discover, compare, and book salon appointments. Built for a seamless and luxurious user experience, it features an intelligent Gemini AI Chatbot that helps users find the perfect salon based on their location, budget, and hairstyle preferences.

---

## 🌟 Key Features

- **🤖 AI-Powered Stylist (Gemini)**: Upload a photo of a hairstyle or ask for recommendations, and our AI will analyze your request and match you with the best local salons.
- **📍 Location-Aware Search**: Automatically detects your current location to recommend the closest top-rated salons when you ask for "nearby" spots.
- **💅 Premium UI/UX**: Built with modern, glassmorphism design principles, dynamic CSS animations, and a responsive layout for that "extraordinary" feel.
- **📅 Instant Booking**: Browse salon services, staff, and pricing, then securely book appointments in just a few clicks.
- **🔐 User Profiles & Authentication**: Secure JWT-based login system for managing your bookings, saving favorite salons, and tracking past appointments.
- **📱 Responsive Layout**: Fully responsive interface that looks beautiful on both desktop and mobile devices.

---

## 🛠️ Technology Stack

### Frontend (User Interface)
- **Framework**: React.js (with Vite)
- **Styling**: Pure vanilla CSS with advanced keyframe animations, glassmorphism, and responsive grid layouts.
- **Routing**: React Router DOM
- **Icons/Avatars**: Native styling & CSS

### Backend (Server & API)
- **Environment**: Node.js & Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT) & bcrypt for password hashing
- **AI Integration**: Google Gen AI SDK (`@google/genai`)

---

## 🚀 Getting Started

Follow these steps to get the project up and running on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or local MongoDB server)
- A [Google Gemini API Key](https://aistudio.google.com/)

### 1. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
```

Install the dependencies:
```bash
npm install
```

Create a `.env` file in the `backend` directory (if not already present) with the following structure:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend server:
```bash
npm start
# or for development:
npm run dev (if nodemon is configured)
```

### 2. Frontend Setup
Open a new terminal window and navigate to the `frontend` directory:
```bash
cd frontend
```

Install the dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```

Your application should now be running! The frontend usually runs on `http://localhost:5173` and the backend on `http://localhost:5000`.

---

## 🎨 Design Philosophy
The UI was meticulously crafted to evoke a sense of luxury and professionalism. Instead of relying on heavy CSS frameworks, ShearCity uses custom CSS to achieve:
- **Shimmering Card Sweeps**
- **Liquid Button Hover States**
- **Dynamic Gradient Typography**
- **Scissor-cutting Micro-animations**

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! 
Feel free to check the [issues page](#) if you want to contribute.

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
