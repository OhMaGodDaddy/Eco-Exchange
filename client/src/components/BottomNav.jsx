// client/src/components/BottomNav.jsx
import { FaHome, FaRegCommentDots, FaUser } from 'react-icons/fa';
import { IoMdAddCircle } from 'react-icons/io';
import { Link, useLocation } from 'react-router-dom';

function BottomNav() {
  const location = useLocation();
  const activeColor = "#2E8B57"; // SeaGreen (Matches your eco theme)
  const inactiveColor = "#888";

  // Helper to check if link is active
  const isActive = (path) => location.pathname === path ? activeColor : inactiveColor;

  return (
    <div style={styles.navContainer}>
      {/* Home Button */}
      <Link to="/" style={{...styles.navItem, color: isActive('/')}}>
        <FaHome size={24} />
        <span style={styles.label}>Home</span>
      </Link>

      {/* Post Button (The Big Plus) */}
      <Link to="/post" style={{...styles.navItem, color: isActive('/post')}}>
        <IoMdAddCircle size={50} style={styles.plusIcon} />
      </Link>

      {/* Messages Button */}
      <Link to="/messages" style={{...styles.navItem, color: isActive('/messages')}}>
        <FaRegCommentDots size={24} />
        <span style={styles.label}>Messages</span>
      </Link>

      {/* Profile Button */}
      <Link to="/profile" style={{...styles.navItem, color: isActive('/profile')}}>
        <FaUser size={24} />
        <span style={styles.label}>Profile</span>
      </Link>
    </div>
  );
}

const styles = {
  navContainer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '70px',
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTop: '1px solid #eee',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
    zIndex: 1000,
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textDecoration: 'none',
    fontSize: '12px',
    marginTop: '5px'
  },
  plusIcon: {
    color: '#2E8B57',
    marginTop: '-25px', // Pops it up slightly
    backgroundColor: 'white',
    borderRadius: '50%',
  },
  label: {
    marginTop: '4px'
  }
};

export default BottomNav;