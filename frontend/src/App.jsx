import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import DoctorDashboard from './components/DoctorDashboard'
import Symptoms from './components/Symptoms'
import Result from './components/Result'
import PastRecords from './components/PastRecords'

function App() {
  return (
    <>
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      <div className="container">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/symptoms" element={<Symptoms />} />
            <Route path="/result" element={<Result />} />
            <Route path="/past-records" element={<PastRecords />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
