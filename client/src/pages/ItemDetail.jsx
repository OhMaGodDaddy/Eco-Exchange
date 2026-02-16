import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function ItemDetail({ user }) {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  
  // 🤖 NEW: State to hold our AI recommendations
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // 1. Fetch the main item
    axios.get(`https://eco-exchange-api.onrender.com/api/items/${id}`)
      .then(res => {
        setItem(res.data);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setError("Could not find this treasure.");
      });

    // 2. 🤖 NEW: Fetch AI Recommendations for this specific item
    axios.get(`https://eco-exchange-api.onrender.com/api/items/${id}/recommendations`)
      .then(res => {
        setRecommendations(res.data);
      })
      .catch(err => {
        console.error("Recommendations error:", err);
        // We don't set an error state here because if recs fail, 
        // we still want the user to be able to see the main item!
      });
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;

    try {
      await axios.delete(`https://eco-exchange-api.onrender.com/api/items/${id}`, {
        withCredentials: true 
      });
      alert("Item deleted successfully!");
      navigate('/profile'); 
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete item. You might not be authorized.");
    }
  };

  if (error) return <div style={{padding: '50px', textAlign: 'center', color: 'white'}}>{error}</div>;
  if (!item) return <div style={{padding: '50px', textAlign: 'center', color: 'white'}}>Loading treasure...</div>;

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
            <button 
              onClick={() => navigate(`/chat/${item.userId}`)} 
              style={styles.contactBtn}
            >
              💬 Chat with Owner
            </button>
          )}
        </div>
      </div>

      {/* 🤖 NEW: RECOMMENDATIONS SECTION */}
      {recommendations.length > 0 && (
        <div style={styles.recommendationsContainer}>
          <h2 style={styles.recsTitle}>✨ Similar Items You Might Like</h2>
          <div style={styles.recsGrid}>
            {recommendations.map(rec => (
              <div 
                key={rec._id} 
                style={styles.recCard} 
                // When clicked, navigate to this new item!
                onClick={() => navigate(`/item/${rec._id}`)}
              >
                <img 
                  src={rec.image || "https://via.placeholder.com/150"} 
                  alt={rec.title || rec.name} 
                  style={styles.recImage} 
                />
                <div style={styles.recCardInfo}>
                  <h4 style={styles.recCardTitle}>{rec.title || rec.name}</h4>
                  <p style={styles.recCardCategory}>{rec.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
    alignItems: 'start',
    marginBottom: '40px' // Added some breathing room below the main card
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
  deleteBtn: {
    backgroundColor: '#e53e3e',
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
  
  // 🤖 NEW: Styles for the Recommendations Section
  recommendationsContainer: {
    marginTop: '20px',
    padding: '20px 0',
  },
  recsTitle: {
    color: '#1B4332',
    fontSize: '1.5rem',
    marginBottom: '20px',
    fontWeight: 'bold',
  },
  recsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
  },
  recCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    border: '1px solid #eee'
  },
  recImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
  },
  recCardInfo: {
    padding: '15px',
  },
  recCardTitle: {
    margin: '0 0 5px 0',
    color: '#1A202C',
    fontSize: '1rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  recCardCategory: {
    margin: 0,
    color: '#718096',
    fontSize: '0.85rem'
  }
};

export default ItemDetail;