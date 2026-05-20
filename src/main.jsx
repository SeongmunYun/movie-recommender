import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminPage from './pages/AdminPage.jsx'

const { pathname, hash } = window.location
const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/') || hash === '#admin'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? <AdminPage /> : <App />}
  </StrictMode>,
)
