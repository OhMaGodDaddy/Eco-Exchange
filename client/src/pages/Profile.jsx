import { useState, useEffect } from 'react';
import { FaUserCircle, FaLeaf, FaBoxOpen, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Profile({ user }) {
  const [activeTab, setActiveTab] = useState('listings');
  const [myListings, setMyListings] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        const response = await fetch("https://eco-exchange-api.onrender.com/api/items");
        const data = await response.json();
        
        // 🔍 DEBUGGING: INSPECT THE NEWEST ITEM
        // This prints the "Banana" you just posted so we can see the correct field name
        if (data.length > 0) {
            const newestItem = data[data.length - 1]; 
            console.log("---------------- INSPECTING NEWEST ITEM ----------------");
            console.log("1. Newest Item Name:", newestItem.name);
            console.log("2. WE ARE LOOKING FOR THIS USER ID:", user._id);
            console.log("3. FULL ITEM DATA (Open this to see field names):", newestItem);
            console.log("--------------------------------------------------------");
        }

        // 🧠 SMART FILTER: Checks common names for the ID
        const myItems = data.filter(item => {
            // Check all likely field names
            const itemCreatorId = item.giver_id || item.userId || item.owner || item.poster || item.user;
            return itemCreatorId === user._id;
        });
        
        setMyListings(myItems);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchMyItems();
  }, [user]);

  // Stats
  const sharedCount = myListings.length;
  const impactScore = sharedCount * 12; 

  if (!user) return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <Link to="/" style={styles.backLink}>
        <FaArrowLeft style={{ marginRight: '8px' }} /> Back to Marketplace
      </Link>

      <h2 style={{ marginBottom: '20px', color: 'white' }}>My Profile</h2>
      
      {/* Header Card */}
      <div style={styles.headerCard}>
        {user.picture ? (
            <img src={user.picture} alt="Profile" style={styles.profileImg} />
        ) : (
            <FaUserCircle size={60} color="#2E8B57" />
        )}
        <div style={{ marginLeft: '15px' }}>
          <h3 style={{ margin: 0, color: '#1A202C' }}>{user.displayName || user.name}</h3>
          <p style={{ color: '#666', fontSize: '0.9rem', margin: '4px 0' }}>{user.email}</p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={styles.statsContainer}>
        <div style={styles.statBox}>
          <h3 style={{ color: '#2E8B57', margin: '0 0 5px 0' }}>{sharedCount}</h3>
          <span style={{ fontSize: '0.85rem', color: '#4A5568' }}>Shared</span>
        </div>
        <div style={styles.statBox}>
          <h3 style={{ color: '#2E8B57', margin: '0 0 5px 0' }}>0</h3>
          <span style={{ fontSize: '0.85rem', color: '#4A5568' }}>Received</span>
        </div>
        <div style={styles.statBox}>
          <h3 style={{ color: '#2E8B57', margin: '0 0 5px 0' }}>{impactScore}kg</h3>
          <span style={{ fontSize: '0.85rem', color: '#4A5568' }}>CO2 Saved</span>
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
            <div style={{ padding: '20px' }}>
                {myListings.length > 0 ? (
                    myListings.map(item => (
                        <div key={item._id} style={styles.itemRow}>
                            <div style={styles.itemIcon}>🍌</div>
                            <div>
                                <strong>{item.name}</strong>
                                <div style={{fontSize: '0.8rem', color: '#666'}}>{item.category || 'Item'}</div>
                            </div>
                            <span style={styles.badge}>Active</span>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', color: '#888' }}>
                        <p>You haven't listed anything yet.</p>
                        <Link to="/post"><button style={styles.postBtn}>Post an Item</button></Link>
                    </div>
                )}
            </div>
        ) : (
            <div style={{ textAlign: 'center', color: '#888', padding: '30px' }}>
                <FaLeaf size={40} color="#B7E4C7" style={{ marginBottom: '10px' }}/>
                <p>You have saved <strong>{impactScore}kg</strong> of CO2!</p>
                <p style={{fontSize: '0.8rem'}}>Based on {sharedCount} items shared.</p>
            </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  backLink: { display: 'flex', alignItems: 'center', color: '#B7E4C7', textDecoration: 'none', marginBottom: '20px', fontSize: '0.9rem' },
  headerCard: { backgroundColor: 'white', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  profileImg: { width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2E8B57' },
  statsContainer: { display: 'flex', gap: '15px', marginTop: '20px' },
  statBox: { flex: 1, backgroundColor: 'white', padding: '15px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  menuContainer: { marginTop: '25px', backgroundColor: 'white', borderRadius: '16px', padding: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' },
  menuItem: { display: 'flex', alignItems: 'center', padding: '12px 15px', cursor: 'pointer', opacity: 0.6, borderRadius: '10px' },
  menuItemActive: { display: 'flex', alignItems: 'center', padding: '12px 15px', cursor: 'pointer', backgroundColor: '#F0FFF4', fontWeight: 'bold', color: '#2E8B57', borderRadius: '10px' },
  iconBox: { width: '32px', height: '32px', backgroundColor: '#E6FFFA', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' },
  contentArea: { marginTop: '20px', backgroundColor: 'white', borderRadius: '16px', minHeight: '150px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' },
  postBtn: { backgroundColor: '#2E8B57', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' },
  itemRow: { display: 'flex', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee', gap: '15px' },
  itemIcon: { fontSize: '1.5rem' },
  badge: { marginLeft: 'auto', backgroundColor: '#e6fffa', color: '#2E8B57', padding: '4px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold' }
};

export default Profile;