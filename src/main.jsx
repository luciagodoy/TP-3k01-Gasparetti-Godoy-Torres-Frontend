import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

const RELOAD_KEY = 'chunk-reload-at'
window.addEventListener('vite:preloadError', (event) => {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY))
    if (Date.now() - last < 10_000) return
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    return
  }
  event.preventDefault()
  window.location.reload()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
