import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// We removed { BrowserRouter } from here because it's inside App.jsx
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = "1002059220341-9vj4rqbb1p9808ludct00s0cc2oi5734.apps.googleusercontent.com"; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      {/* BrowserRouter was here. We removed it. */}
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)