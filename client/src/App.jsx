import { useState, useEffect } from 'react';
import Login from './pages/Login'; // Adjust path if needed
import Dashboard from './pages/AdminDashboard'; // Or whatever your main page is
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const [user, setUser] = useState(null);

  // 🌟 THIS IS THE MISSING PIECE 🌟
  // When the app loads, check if we are already logged in
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // We ask the backend: "Who is the current user?"
        // Note: We MUST include 'credentials: include' to send the cookie!
        const response = await fetch("https://eco-exchange-api.onrender.com/api/current_user", {
            method: "GET",
            credentials: "include" // 👈 THIS IS MANDATORY. If missing, it will always fail.
        });

        if (response.ok) {
          const data = await response.json();
          // If data is not empty, we are logged in!
          if (data && data._id) {
            console.log("✅ User found:", data);
            setUser(data);
          }
        }
      } catch (error) {
        console.log("Not logged in yet");
      }
    };

    fetchUser();
  }, []);

  // If we have a user, show the Dashboard. Otherwise, show Login.
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <div className="app">
        {user ? (
          <Dashboard user={user} />
        ) : (
          <Login />
        )}
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;