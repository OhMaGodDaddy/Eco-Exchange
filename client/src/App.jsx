import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from './pages/Login'; 
import Home from './pages/Home';
import Navbar from './components/Navbar'; // 👈 1. IMPORT YOUR EXISTING NAVBAR

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("https://eco-exchange-api.onrender.com/api/current_user", {
            method: "GET",
            credentials: "include", 
            headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data._id) {
            setUser(data);
          }
        }
      } catch (error) {
        console.error("Login check failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // 🚨 2. ADD LOGOUT LOGIC
  const handleLogout = () => {
    window.location.href = "https://eco-exchange-api.onrender.com/api/logout";
  };

  if (loading) return <div style={{color:'white', textAlign:'center', marginTop:'20%'}}>Checking Session...</div>;

  return (
    <GoogleOAuthProvider clientId="1002059220341-9vj4rqbb1p9808ludct00s0cc2oi5734.apps.googleusercontent.com">
      <Router>
        <div className="app">
          {/* 👈 3. SHOW NAVBAR TO LOGGED IN USERS */}
          {user && <Navbar user={user} onLogout={handleLogout} />} 
          
          {!user ? (
            <Login />
          ) : (
            <Home user={user} /> 
          )}
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;