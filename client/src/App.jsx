import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
// ⚠️ MAKE SURE THESE PATHS MATCH YOUR FILES
import Login from './pages/Login'; 
import Dashboard from './pages/AdminDashboard'; 

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // 1. We start in "Loading" mode

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 2. We ask the server: "Do I have a cookie?"
        const response = await fetch("https://eco-exchange-api.onrender.com/api/current_user", {
            method: "GET",
            credentials: "include", // 👈 THIS IS CRITICAL. Without it, the cookie stays hidden.
            headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
          const data = await response.json();
          // 3. If the server sends back a user, we save it!
          if (data && data._id) {
            console.log("✅ User found:", data.displayName);
            setUser(data);
          }
        }
      } catch (error) {
        console.error("❌ Error checking login:", error);
      } finally {
        setLoading(false); // 4. Stop loading (whether logged in or not)
      }
    };

    fetchUser();
  }, []);

  // 5. While checking, show a simple Loading text (so it doesn't flash the Login page)
  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '20%' }}>Loading...</div>;
  }

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <div className="app">
        {/* 6. If user exists, show Dashboard. If not, show Login. */}
        {user ? <Dashboard user={user} /> : <Login />}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;