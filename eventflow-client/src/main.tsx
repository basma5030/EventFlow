import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

import Homepage from './pages/Homepage' 
import EventDetails from './pages/EventDetails'
import CreateEvent from './pages/CreateEvent'
import EditEvent from './pages/EditEvent'
import AdminDashboard from './pages/AdminDashboard'
import MyTickets from './pages/MyTickets'
import Watchlist from './pages/Watchlist'
import OrganizerDashboard from './pages/OrganizerDashboard'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/create-event" element={
            <ProtectedRoute allowedRoles={['Organizer']}>
              <CreateEvent />
            </ProtectedRoute>
          } />
          <Route path="/edit-event/:id" element={
            <ProtectedRoute allowedRoles={['Organizer']}>
              <EditEvent />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/my-tickets" element={
            <ProtectedRoute allowedRoles={['Participant']}>
              <MyTickets />
            </ProtectedRoute>
          } />
          <Route path="/watchlist" element={
            <ProtectedRoute allowedRoles={['Participant']}>
              <Watchlist />
            </ProtectedRoute>
          } />
          <Route path="/organizer-dashboard" element={
            <ProtectedRoute allowedRoles={['Organizer']}>
              <OrganizerDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)