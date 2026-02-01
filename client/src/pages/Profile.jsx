import { useState } from 'react';
import { FaUserCircle, FaLeaf, FaBoxOpen, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Profile({ user }) { // 👈 Accepts 'user' prop from App.jsx
  const [activeTab, setActiveTab] = useState('listings');

  // Loading state if user data hasn't arrived from the API yet
  if (!user) {
    return (
      <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>
        Checking Session...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Navigation Back */}
      <Link to="/" style={styles.backLink}>
        <FaArrowLeft style={{ marginRight: '8px' }} /> Back to Marketplace
      </Link>

      <h2 style={{ marginBottom: '20px', color: 'white' }}>My Profile</h2>
      
      {/* Header Card - Using REAL Data now */}
      <div style={styles.headerCard}>
        {user.picture ? (
          <img src={user.picture} alt="Profile" style={styles.profileImg} />
        ) : (
          <FaUserCircle size={60} color="#2E8B57" />
        )}
        <div style={{ marginLeft: '15px' }}>
          <h3 style={{ margin: 0, color: '#1A202C' }}>{user.displayName || user.name}</h3>
          <p style={{ color: '#666', fontSize: '0.9rem', margin: '4px 0' }}>{user.email}</p>
          <span style={styles.editBtn} onClick={() => alert("Edit Feature Coming Soon!")}>
            Edit Profile
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div style={styles.statsContainer}>
        <div style={styles.statBox}>
          <h3 style={{ color: '#2E8B57', margin: '0 0 5px 0' }}>0</h3>
          <span style={{ fontSize: '0.85rem', color: '#4A5568' }}>Shared</span>
        </div>
        <div style={styles.statBox}>
          <h3 style={{ color: '#2E8B57', margin: '0 0 5px 0' }}>0</h3>
          <span style={{ fontSize: '0.85rem', color: '#4A5568' }}>Received</span>
        </div>
        <div style={styles.statBox}>
          <h3 style={{ color: '#2E8B57', margin: '0 0 5px 0' }}>0</h3>
          <span style={{ fontSize: '0.85rem', color: '#4A5568' }}>Impact</span>
        </div>
      </div>

      {/* Menu / Tabs */}
      <div style={styles.menuContainer}>
        <div 
          style={activeTab === 'listings' ? styles.menuItemActive : styles.menuItem}
          onClick={() => setActiveTab('listings')}
        >
          <div style={styles.iconBox}><FaBoxOpen /></div>
          <span>My Listings</span>
        </div>
        <div 
          style={activeTab === 'impact' ? styles.menuItemActive : styles.menuItem}
          onClick={() => setActiveTab('impact')}
        >
          <div style={styles.iconBox}><FaLeaf /></div>
          <span>Eco Impact</span>
        </div>
      </div>

      {/* Dynamic Content Area */}
      <div style={styles.contentArea}>
        {activeTab === 'listings' ? (
          <div style={{ textAlign: 'center', color: '#888', padding: '30px' }}>
            <p>You haven't listed anything yet.</p>
            <Link to="/post">
              <button style={styles.postBtn}>Post an Item</button>
            </Link>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: '#888', padding: '30px' }}>
            <FaLeaf size={40} color="#B7E4C7" style={{ marginBottom: '10px' }}/>
            <p>Start sharing to see your CO2 impact savings!</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  backLink: { 
    display: 'flex', 
    alignItems: 'center', 
    color: '#B7E4C7', 
    textDecoration: 'none', 
    marginBottom: '20px',
    fontSize: '0.9rem' 
  },
  headerCard: { 
    backgroundColor: 'white', 
    padding: '20px', 
    borderRadius: '16px', 
    display: 'flex', 
    alignItems: 'center', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
  },
  profileImg: { 
    width: '60px', 
    height: '60px', 
    borderRadius: '50%', 
    objectFit: 'cover', 
    border: '2px solid #2E8B57' 
  },
  editBtn: { 
    fontSize: '0.8rem', 
    color: '#2E8B57', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    marginTop: '5px', 
    display: 'inline-block' 
  },
  statsContainer: { display: 'flex', gap: '15px', marginTop: '20px' },
  statBox: { 
    flex: 1, 
    backgroundColor: 'white', 
    padding: '15px', 
    borderRadius: '12px', 
    textAlign: 'center', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
  },
  menuContainer: { 
    marginTop: '25px', 
    backgroundColor: 'white', 
    borderRadius: '16px', 
    padding: '8px', 
    boxShadow: '0 2px 10px rgba(0,0,0,0.03)' 
  },
  menuItem: { 
    display: 'flex', 
    alignItems: 'center', 
    padding: '12px 15px', 
    cursor: 'pointer', 
    opacity: 0.6,
    borderRadius: '10px'
  },
  menuItemActive: { 
    display: 'flex', 
    alignItems: 'center', 
    padding: '12px 15px', 
    cursor: 'pointer', 
    backgroundColor: '#F0FFF4', 
    fontWeight: 'bold', 
    color: '#2E8B57',
    borderRadius: '10px'
  },
  iconBox: { 
    width: '32px', 
    height: '32px', 
    backgroundColor: '#E6FFFA', 
    borderRadius: '50%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: '12px' 
  },
  contentArea: { 
    marginTop: '20px', 
    backgroundColor: 'white', 
    borderRadius: '16px', 
    minHeight: '150px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.03)' 
  },
  postBtn: {
    backgroundColor: '#2E8B57',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px',
    fontWeight: 'bold'
  }
};

export default Profile;