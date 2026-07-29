import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './app/App';
import { AuthProvider } from './context/AuthContext';
import './styles/variables.css';
import './styles/global.css';

// Browser ki auto scroll-restoration band karo — warna kisi page se wapas
// aate waqt purani scroll position wapas aa jaati hai, jabki list top se
// fresh (sirf pehla page) render hoti hai. Mismatch ki wajah se infinite
// scroll ka sentinel turant viewport mein aa jaata hai aur loop mein saara
// data load kar deta hai.
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);