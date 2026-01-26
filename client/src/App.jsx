import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router } from 'react-router-dom'; // 👈 ADD THIS
import Login from './pages/Login'; 
import Dashboard from './pages/AdminDashboard'; 
import ItemGallery from './pages/ItemGallery'; // 👈 Ensure this matches your filename

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
    <GoogleOAuthProvider clientId="1002059220341-9vj4rqbb1p9808ludct00s0cc2oi5734.apps.googleusercontent.com">
      <Router>
        <div className="app">
          {!user ? (
            <Login />
          ) : user.role === 'admin' ? (
            <Dashboard user={user} />
          ) : (
            <ItemGallery user={user} /> // 👈 CHANGE THIS FROM UserHome TO ItemGallery
          )}
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;