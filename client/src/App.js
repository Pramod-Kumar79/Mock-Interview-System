import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import InterviewPage from './pages/InterviewPage';
import { GlobalProvider } from './components/utils/GlobalState';
import ReviewPage from './pages/ReviewPageNew';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HistoryPage from './pages/HistoryPage';
import RecruiterDashboard from './pages/RecruiterDashboard';
import { ProtectedRoute } from './components/utils/ProtectedRoute';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
      <GlobalProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/" element={
            <ProtectedRoute role="candidate"><HomePage /></ProtectedRoute>
          } />
          <Route path="/interview" element={
            <ProtectedRoute role="candidate"><InterviewPage /></ProtectedRoute>
          } />
          <Route path="/review" element={
            <ProtectedRoute role="candidate"><ReviewPage /></ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute role="candidate"><HistoryPage /></ProtectedRoute>
          } />

          <Route path="/recruiter" element={
            <ProtectedRoute role="recruiter"><RecruiterDashboard /></ProtectedRoute>
          } />
        </Routes>
      </GlobalProvider>
    </Router>
  );
}

export default App;
