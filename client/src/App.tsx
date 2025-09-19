import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import LoginPage from './pages/Login'
import ExamsPage from './pages/Exams'
import ExamPage from './pages/Exam'
import { AuthProvider, useAuth } from './auth/AuthContext'
import './App.css'

function Protected({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav className="nav">
        <Link to="/exams" className="logo">PrepX</Link>
      </nav>
      {children}
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/exams" element={<Protected><Layout><ExamsPage /></Layout></Protected>} />
      <Route path="/exam/:examId" element={<Protected><Layout><ExamPage /></Layout></Protected>} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
