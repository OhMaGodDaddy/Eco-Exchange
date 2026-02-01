import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ItemDetail({ user }) {
  const { id } = useParams(); 
  const navigate = useNavigate(); // Hook to redirect after deleting
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`https://eco-exchange-api.onrender.com/api/items/${id}`)
      .then(res => {
        setItem(res.data);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setError("Could not find this treasure.");
      });
  }, [id]);

  // 🗑️ Handle Delete Logic
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;

    try {
      // We must send 'withCredentials: true' so the server knows who we are!
      await axios.delete(`https://eco-exchange-api.onrender.com/api/items/${id}`, {
        withCredentials: true 
      });
      alert("Item deleted successfully!");
      navigate('/profile'); // Send user back to profile
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete item. You might not be authorized.");
    }
  };

  if (error) return <div style={{padding: '50px', textAlign: 'center', color: 'white'}}>{error}</div>;
  if (!item) return <div style={{padding: '50px', textAlign: 'center', color: 'white'}}>Loading treasure...</div>;

  // 🔐 Check if the logged-in user matches the item's creator
  const isOwner = user && item.userId === user._id;

  return (
    <div style={styles.container}>
      <Link to="/" style={styles.backLink}>← Back to Community</Link>
      
      <div style={styles.contentWrapper}>
        {/* Left: Image */}
        <div style={styles.imageSection}>
          <img 
            src={item.image || "https://via.placeholder.com/400"} 
            alt={item.title || item.name} 
            style={styles.image} 
          />
        </div>

        {/* Right: Details */}
        <div style={styles.infoSection}>
          <div style={styles.badge}>COMMUNITY GIFT</div>
          
          <h1 style={styles.title}>{item.title || item.name}</h1>
          
          <div style={styles.meta}>
            <p style={styles.metaText}><strong>Category:</strong> {item.category}</p>
            <p style={styles.metaText}><strong>Condition:</strong> {item.condition || 'New'}</p>
            <p style={styles.metaText}><strong>Hub:</strong> {item.hubLocation}</p>
          </div>

          <div style={styles.divider}></div>

          <div>
            <h3 style={{color: '#1B4332', fontSize: '1.2rem', marginBottom: '10px'}}>Description</h3>
            <p style={{color: '#4A5568', lineHeight: '1.6'}}>{item.description || "No description provided."}</p>
          </div>

          {/* 🔘 Conditional Buttons */}
          {isOwner ? (
            <button onClick={handleDelete} style={styles.deleteBtn}>
              🗑 Delete This Listing
            </button>
          ) : (
            <a 
              href={`mailto:${item.userEmail}?subject=EcoExchange: Interested in ${item.title}`}
              style={{ textDecoration: 'none' }}
            >
              <button style={styles.contactBtn}>
                ✉️ Email {item.userName ? item.userName.split(' ')[0] : 'Owner'}
              </button>
            </a>
          )}
          
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1000px', margin: '60px auto', padding: '0 20px' },
  backLink: { display: 'block', marginBottom: '30px', color: '#1B4332', textDecoration: 'none', fontWeight: '600' },
  contentWrapper: { 
    display: 'grid', 
    gridTemplateColumns: '1.2fr 1fr', 
    gap: '50px', 
    backgroundColor: 'white', 
    padding: '50px', 
    borderRadius: '24px', 
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    alignItems: 'start' // Changed to start so text aligns better if descriptions are long
  },
  imageSection: { 
    borderRadius: '16px', 
    overflow: 'hidden', 
    display: 'flex', 
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    border: '1px solid #eee'
  },
  image: { width: '100%', maxHeight: '450px', objectFit: 'contain' },
  infoSection: { display: 'flex', flexDirection: 'column', gap: '20px' },
  badge: { 
    backgroundColor: '#d1e7dd', 
    color: '#0f5132', 
    padding: '6px 14px', 
    borderRadius: '50px', 
    fontWeight: '700', 
    fontSize: '0.75rem', 
    letterSpacing: '0.5px',
    width: 'fit-content'
  },
  title: { fontSize: '2rem', color: '#1A202C', margin: '0', fontWeight: '700' },
  meta: { display: 'flex', flexDirection: 'column', gap: '8px' },
  metaText: { color: '#4A5568', fontSize: '1rem', margin: 0 },
  divider: { height: '1px', backgroundColor: '#E2E8F0', width: '100%' },
  
  contactBtn: { 
    backgroundColor: '#1B4332', 
    color: 'white', 
    border: 'none', 
    padding: '18px', 
    borderRadius: '12px', 
    fontSize: '1rem', 
    fontWeight: '700',
    cursor: 'pointer', 
    marginTop: '10px',
    transition: '0.2s',
    width: '100%'
  },
  // New style for Delete Button
  deleteBtn: {
    backgroundColor: '#e53e3e', // Red color
    color: 'white', 
    border: 'none', 
    padding: '18px', 
    borderRadius: '12px', 
    fontSize: '1rem', 
    fontWeight: '700',
    cursor: 'pointer', 
    marginTop: '10px',
    transition: '0.2s',
    width: '100%'
  }
};

export default ItemDetail;