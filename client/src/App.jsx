import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
// Import your pages (adjust these paths to match your project!)
import Login from './pages/Login'; 
import Dashboard from './pages/AdminDashboard'; 

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 👇 THIS IS THE MISSING PIECE!
        const response = await fetch("https://eco-exchange-api.onrender.com/api/current_user", {
            method: "GET",
            credentials: "include", // 👈 MANDATORY: Sends the cookie to the server
            headers: {
              "Content-Type": "application/json"
            }
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data._id) {
            console.log("✅ Logged in as:", data.userName);
            setUser(data);
          }
        }
      } catch (error) {
        console.error("Login check failed:", error);
      } finally {
        setLoading(false); // Stop loading whether we found a user or not
      }
    };

    fetchUser();
  }, []);

  // 1. Show a loader while checking (Optional but looks better)
  if (loading) return <div style={{color:'white', textAlign:'center', marginTop:'20%'}}>Loading...</div>;

  // 2. Main Logic
  return (
    <GoogleOAuthProvider clientId="YOUR_CLIENT_ID">
      <div className="app">
        {user ? (
          // If we have a user, show the Dashboard
          <Dashboard user={user} />
        ) : (
          // If no user, show the Login page
          <Login />
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;