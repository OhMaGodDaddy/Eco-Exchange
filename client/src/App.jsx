import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login'; 
import Dashboard from './pages/AdminDashboard'; 

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 1. Ask the Render server if this browser has a valid session cookie
        const response = await fetch("https://eco-exchange-api.onrender.com/api/current_user", {
            method: "GET",
            credentials: "include", // 👈 CRITICAL: Sends the cookie to the server
            headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
          const data = await response.json();
          // 2. If user data exists, update the state to show the Dashboard
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

  if (loading) return <div style={{color:'white', textAlign:'center', marginTop:'20%'}}>Checking Session...</div>;

  return (
    <GoogleOAuthProvider clientId="YOUR_CLIENT_ID_HERE">
      <div className="app">
        {/* 3. Logic: If user is logged in, show Dashboard. Otherwise, show Login. */}
        {user ? <Dashboard user={user} /> : <Login />}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;