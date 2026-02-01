import { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login'; 
import Home from './pages/Home';
import NavBar from './components/NavBar'; 
import PostItem from './pages/PostItem'; 
import ItemDetail from './pages/ItemDetail'; // 👈 1. IMPORT THE NEW PAGE
import Profile from './pages/Profile';




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
          if (data && data._id) setUser(data);
        }
      } catch (error) {
        console.error("Login check failed:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    window.location.href = "https://eco-exchange-api.onrender.com/api/logout";
  };

  if (loading) return <div style={{color:'white', textAlign:'center', marginTop:'20%'}}>Checking Session...</div>;

  return (
    <GoogleOAuthProvider clientId="1002059220341-9vj4rqbb1p9808ludct00s0cc2oi5734.apps.googleusercontent.com">
      <Router>
        <div className="app">
          {user && <NavBar user={user} onLogout={handleLogout} />} 
          
          <Routes>
            {!user ? (
              <Route path="*" element={<Login />} />
            ) : (
              <>
                <Route path="/" element={<Home user={user} />} />
                <Route path="/post" element={<PostItem user={user} />} />
                {/* 👈 2. ADD THIS DYNAMIC ROUTE FOR INDIVIDUAL ITEMS */}
                <Route path="/item/:id" element={<ItemDetail user={user} />} />
                <Route path="/profile" element={<Profile user={user} />} />
              </>
            )}
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;