import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import LoginPage from './Components/Login'
import Mainpage from "./Components/Mainpage";
import AdminPanel from "./Components/AdminPage";
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Mainpage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/administrativo" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
