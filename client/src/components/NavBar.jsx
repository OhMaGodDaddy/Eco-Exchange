import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FaLeaf, FaPlus, FaShieldAlt, FaEnvelope, FaQuestionCircle } from 'react-icons/fa';
import OnboardingTour from './OnBoardingTour'; 

// Receives 'user' and 'onLogout' from App.jsx
function NavBar({ user, onLogout }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  
  // 💡 State to control the tour manually
  const [runTour, setRunTour] = useState(false);

  // 🔴 Poll for unread messages every 3 seconds
  useEffect(() => {
    const checkUnread = async () => {
      if (!user) return; // Don't fetch if not logged in
      try {
        const res = await fetch("https://eco-exchange-api.onrender.com/api/messages/unread", { 
            credentials: 'include' 
        });
        const data = await res.json();
        setUnreadCount(data.count);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    
    checkUnread(); // Run immediately
    const interval = setInterval(checkUnread, 3000); // Repeat every 3s
    
    return () => clearInterval(interval); // Cleanup
  }, [user]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      <nav style={{ ...styles.nav, ...(isMobile ? styles.navMobile : {}) }}>
        {/* Logo */}
        <Link to="/" className="tour-search-bar" style={styles.logo}>
          <div style={styles.iconContainer}>
              <FaLeaf size={20} color="#fff" />
          </div>
          <span style={{ ...styles.logoText, ...(isMobile ? styles.logoTextMobile : {}) }}>EcoExchange</span>
        </Link>

        {/* Right Side Actions */}
        <div style={{ ...styles.actions, ...(isMobile ? styles.actionsMobile : {}) }}>
          
          {/* --- ADMIN DASHBOARD LINK (Only for Admins) --- */}
          {!isMobile && <Link to="/leaderboard" style={styles.adminLink}>Leaderboard</Link>}

          {user && user.role === 'admin' && !isMobile && (
              <Link to="/admin/moderation" style={styles.adminLink}>
                  <FaShieldAlt style={{ marginRight: '5px' }}/> Moderation
              </Link>
          )}

          {/* ❓ HELP ICON TO REPLAY TUTORIAL */}
          <button 
            onClick={() => setRunTour(true)}
            className="tour-help-button" 
            style={styles.helpBtn}
            title="Replay Tutorial"
          >
            <FaQuestionCircle size={20} />
          </button>

          {/* MESSAGES LINK WITH RED DOT */}
          <Link to="/inbox" style={styles.messageLink} title="My Messages">
              <div style={{ position: 'relative', display: 'flex' }}>
                  <FaEnvelope size={20} />
                  
                  {/* 🔴 THE RED DOT BADGE */}
                  {unreadCount > 0 && (
                      <span style={styles.notificationBadge}>
                          {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                  )}
              </div>
          </Link>

          {/* Sell Button */}
          <Link to="/post" className="tour-sell-button" style={{ ...styles.sellBtn, ...(isMobile ? styles.sellBtnMobile : {}) }}>
              <FaPlus style={{marginRight: '5px'}}/> Sell
          </Link>

          {/* User Profile Section */}
          {user && (
              <div className="tour-profile" style={{ ...styles.profileSection, ...(isMobile ? styles.profileSectionMobile : {}) }}>
                  <Link to="/profile" style={{ display: 'flex', alignItems: 'center' }}>
                  <img 
                      src={user.picture || user.photos?.[0]?.value || 'https://ui-avatars.com/api/?name=' + user.name} 
                      alt="User Profile" 
                      style={styles.avatar} 
                      />
                  </Link>
                  {!isMobile && <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>}
              </div>
          )}
        </div>
      </nav>

      {/* 🗺️ THE TOUR COMPONENT MOVED OUTSIDE THE NAV BAR */}
      <OnboardingTour runTour={runTour} setRunTour={setRunTour} />
    </>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    padding: '15px 20px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  navMobile: {
    padding: '12px 10px'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    gap: '10px'
  },
  iconContainer: {
    backgroundColor: '#1B4332',
    padding: '8px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoText: {
    fontSize: '1.2rem',
    fontWeight: '500',
    fontFamily: '"Unbounded", sans-serif',
    color: '#1B4332',
    letterSpacing: '-0.5px'
  },
  logoTextMobile: {
    fontSize: '1rem'
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  actionsMobile: {
    gap: '6px'
  },
  adminLink: {
    display: 'flex',
    alignItems: 'center',
    color: '#d32f2f', 
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    border: '1px solid #d32f2f',
    padding: '6px 12px',
    borderRadius: '8px',
    backgroundColor: '#fff0f0'
  },
  helpBtn: {
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s',
  },
  messageLink: {
    color: '#1B4332',
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    borderRadius: '50%',
    transition: 'background 0.2s',
    textDecoration: 'none'
  },
  notificationBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    backgroundColor: '#e74c3c',
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    borderRadius: '50%',
    minWidth: '16px',
    height: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid white'
  },
  sellBtn: {
    backgroundColor: '#1B4332',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '50px',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    transition: '0.2s'
  },
  sellBtnMobile: {
    padding: '8px 10px',
    fontSize: '0.8rem'
  },
  profileSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  profileSectionMobile: {
    gap: '0'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    cursor: 'pointer',
    border: '2px solid #1B4332',
    objectFit: 'cover',
    display: 'block'
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: '#666',
    fontSize: '0.8rem',
    cursor: 'pointer',
    textDecoration: 'underline'
  }
};

export default NavBar;