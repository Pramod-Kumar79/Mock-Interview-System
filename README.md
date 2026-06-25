# 🤖 AI Mock Interview System

An AI-powered mock interview platform that helps users practice technical interviews with AI-generated questions, voice-based responses, emotion analysis, and detailed interview feedback.

## 🚀 Features

* 🔐 User Authentication (Signup & Login)
* 🔑 JWT-based Authentication
* 👤 User Profile Management
* 💾 Database Integration (SQLite, easily upgradeable to PostgreSQL)
* 📝 AI-generated interview questions using Google Gemini
* 🎤 Speech Recognition for answering questions
* 😊 Emotion Analysis
* 👀 Face Detection for suspicious activity monitoring
* 📊 AI-generated interview feedback and performance review
* 📚 Interview History
* 📱 Responsive UI

---

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router
* Axios
* Bootstrap

### Backend

* Python
* Flask
* SQLAlchemy
* Flask-Bcrypt
* JWT
* Google Gemini API

### Database

* SQLite
* PostgreSQL (recommended for deployment)

---

## 📂 Project Structure

```text
client/
    React Frontend

server/
    Flask Backend
```

---

## ⚙️ Environment Variables

### Server (.env)

```env
GEMINI_API_KEY3=your_gemini_api_key
SECRET_KEY=your_secret_key
DATABASE_URL=your_database_url   # Optional if using PostgreSQL
```

### Client (.env)

```env
REACT_APP_SERVER_URL=http://localhost:5000
```

---

## 🚀 Installation

### Clone

```bash
git clone https://github.com/Pramod-Kumar79/Mock-Interview-System.git
```

### Backend

```bash
cd server
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd client
npm install
npm start
```

---

## 📌 Upcoming Improvements

* PostgreSQL Integration
* Cloud Deployment
* User Dashboard
* Resume-based Interview Generation
* Admin Panel
* Email Verification
* Forgot Password
* Interview Analytics

---

## 📄 License

This project is intended for educational and learning purposes.
