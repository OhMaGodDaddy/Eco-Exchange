import { useState } from 'react'; // Add useState
import { FaUserCircle, FaLeaf, FaExchangeAlt, FaBoxOpen } from 'react-icons/fa';

function Profile() {
  const [activeTab, setActiveTab] = useState('listings'); // State for switching tabs

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>My Profile</h2>
      
      {/* Header Card */}
      <div style={styles.headerCard}>
        <FaUserCircle size={60} color="#2E8B57" />
        <div style={{ marginLeft: '15px' }}>
          <h3 style={{ margin: 0 }}>Eco User</h3>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>student@university.edu</p>
          <span style={styles.editBtn} onClick={() => alert("Edit Profile Feature Coming Soon!")}>Edit Profile</span>
        </div>
      </div>

      {/* Stats Row */}
      <div style={styles.statsContainer}>
        <div style={styles.statBox}>
          <h3 style={{ color: '#2E8B57' }}>2</h3>
          <span>Shared</span>
        </div>
        <div style={styles.statBox}>
          <h3 style={{ color: '#2E8B57' }}>5</h3>
          <span>Received</span>
        </div>
        <div style={styles.statBox}>
            <h3 style={{ color: '#2E8B57' }}>7</h3>
            <span>Impact</span>
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
            <div style={{textAlign: 'center', color: '#888', padding: '20px'}}>
                <p>You have 2 active listings.</p>
                {/* Mock Listing Item */}
                <div style={styles.mockItem}>
                    <div style={styles.mockIcon}>💻</div>
                    <div style={{textAlign: 'left'}}>
                        <strong>Old Laptop</strong>
                        <div style={{fontSize: '0.8rem'}}>Listed 2 days ago</div>
                    </div>
                    <div style={styles.statusBadge}>Active</div>
                </div>
            </div>
        ) : (
            <div style={{textAlign: 'center', color: '#888', padding: '20px'}}>
                <FaLeaf size={40} color="#B7E4C7" style={{marginBottom: '10px'}}/>
                <p>You've saved <strong>12kg</strong> of CO2 by reusing items!</p>
            </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  // ... (Keep your existing styles for headerCard, etc.) ...
  
  // Add/Update these:
  menuContainer: {
    marginTop: '25px',
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    borderBottom: '1px solid #f5f5f5',
    cursor: 'pointer',
    opacity: 0.7
  },
  menuItemActive: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px',
    borderBottom: '1px solid #f5f5f5',
    cursor: 'pointer',
    backgroundColor: '#F8F7F4', // Highlight active
    fontWeight: 'bold',
    opacity: 1
  },
  contentArea: {
    marginTop: '20px',
    backgroundColor: 'white',
    borderRadius: '16px',
    minHeight: '150px'
  },
  iconBox: { width: '35px', height: '35px', backgroundColor: '#e6fffa', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E8B57', marginRight: '15px' },
  editBtn: { fontSize: '0.8rem', color: '#2E8B57', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px', display: 'inline-block' },
  statsContainer: { display: 'flex', gap: '15px', marginTop: '20px' },
  statBox: { flex: 1, backgroundColor: 'white', padding: '15px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },
  headerCard: { backgroundColor: 'white', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' },
  // Mock Item Styles
  mockItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', border: '1px solid #eee', borderRadius: '10px', marginTop: '10px' },
  mockIcon: { fontSize: '1.5rem', marginRight: '10px' },
  statusBadge: { backgroundColor: '#B7E4C7', padding: '4px 8px', borderRadius: '5px', fontSize: '0.7rem', color: '#1B4332', fontWeight: 'bold' }
};

export default Profile;