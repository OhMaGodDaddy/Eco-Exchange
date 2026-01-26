import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/NavBar'; 
import Home from './pages/Home';
import PostItem from './PostItem'; 
import Login from './pages/Login'; 
import Profile from './pages/Profile'; 
import ItemDetail from './pages/ItemDetail'; 

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (decodedUser) => {
    setUser(decodedUser);
    localStorage.setItem('user', JSON.stringify(decodedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // 1. Login Page (No Router needed here)
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // 2. Authenticated App (With Router and ALL Routes)
  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post" element={<PostItem />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* ✅ THIS IS THE CRITICAL LINE THAT STOPS THE REFRESH/BOUNCE */}
        <Route path="/item/:id" element={<ItemDetail />} />
        
        {/* This catches bad URLs and sends them Home. 
            Since we added the line above, /item/:id is no longer considered "bad". */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;