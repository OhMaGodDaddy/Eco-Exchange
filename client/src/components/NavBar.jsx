import { Link } from 'react-router-dom';
import { FaLeaf, FaPlus, FaShieldAlt, FaEnvelope } from 'react-icons/fa'; // 👈 Added FaEnvelope

// Receives 'user' and 'onLogout' from App.jsx
function NavBar({ user, onLogout }) {
  return (
    <nav style={styles.nav}>
      {/* Logo */}
      <Link to="/" style={styles.logo}>
        <div style={styles.iconContainer}>
            <FaLeaf size={20} color="#fff" />
        </div>
        <span style={styles.logoText}>EcoExchange</span>
      </Link>

      {/* Right Side Actions */}
      <div style={styles.actions}>
        
        {/* --- ADMIN DASHBOARD LINK (Only for Admins) --- */}
        {user && user.role === 'admin' && (
            <Link to="/admin" style={styles.adminLink}>
                <FaShieldAlt style={{ marginRight: '5px' }}/> Admin
            </Link>
        )}

        {/* 👇 NEW MESSAGES LINK 👇 */}
        <Link to="/inbox" style={styles.messageLink} title="My Messages">
            <FaEnvelope size={20} />
        </Link>

        {/* Sell Button */}
        <Link to="/post" style={styles.sellBtn}>
            <FaPlus style={{marginRight: '5px'}}/> Sell
        </Link>

        {/* User Profile Section */}
        <div style={styles.profileSection}>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center' }}>
            <img 
                src={user.picture || user.photos?.[0]?.value || 'https://ui-avatars.com/api/?name=' + user.name} 
                alt="User Profile" 
                style={styles.avatar} 
                />
            </Link>
            <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
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
    fontWeight: '800',
    color: '#1B4332',
    letterSpacing: '-0.5px'
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
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
  // 👇 STYLE FOR MESSAGE ICON
  messageLink: {
    color: '#1B4332',
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    borderRadius: '50%',
    transition: 'background 0.2s',
    textDecoration: 'none'
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
  profileSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
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