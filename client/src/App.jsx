import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router } from 'react-router-dom'; // 👈 ADD THIS
import Login from './pages/Login'; 
import Dashboard from './pages/AdminDashboard'; 
import ItemGallery from './pages/ItemGallery'; // Import the new file

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

  if (loading) return <div style={{color:'white', textAlign:'center', marginTop:'20%'}}>Checking Session...</div>;

  return (
    <GoogleOAuthProvider clientId="YOUR_CLIENT_ID">
      <Router>
        <div className="app">
          {!user ? (
            <Login />
          ) : user.role === 'admin' ? (
            <Dashboard user={user} />
          ) : (
            <UserHome user={user} /> // 👈 Create a simple UserHome or Redirect
          )}
        </div>
      </Router>
    </GoogleOAuthProvider>
  );

  return (
  <Router>
    <div className="app">
      {!user ? (
        <Login />
      ) : user.role === 'admin' ? (
        <Dashboard user={user} /> // 🛡️ You see the full management view
      ) : (
        <ItemGallery user={user} /> // 📦 Regular users see the item list
      )}
    </div>
  </Router>
);

}

export default App;