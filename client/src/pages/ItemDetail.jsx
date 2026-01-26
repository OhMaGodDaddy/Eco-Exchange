import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ItemDetail() {
  const { id } = useParams(); 
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetches ONLY the specific item by its ID from Render
    axios.get(`https://eco-exchange-api.onrender.com/api/items/${id}`)
      .then(res => {
        setItem(res.data);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setError("Could not find this treasure.");
      });
  }, [id]);

  if (error) return <div style={{padding: '50px', textAlign: 'center', color: 'white'}}>{error}</div>;
  if (!item) return <div style={{padding: '50px', textAlign: 'center', color: 'white'}}>Loading treasure...</div>;

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
          </div>

          <button style={styles.contactBtn}>Message Giver (Coming Soon)</button>
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
    alignItems: 'center'
  },
  imageSection: { 
    borderRadius: '16px', 
    overflow: 'hidden', 
    display: 'flex', 
    justifyContent: 'center',
    backgroundColor: '#fff' 
  },
  image: { width: '100%', maxHeight: '450px', objectFit: 'contain' },
  infoSection: { display: 'flex', flexDirection: 'column', gap: '15px' },
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
  title: { fontSize: '2rem', color: '#1A202C', margin: '10px 0', fontWeight: '700' },
  meta: { marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' },
  metaText: { color: '#4A5568', fontSize: '1rem', margin: 0 },
  contactBtn: { 
    backgroundColor: '#1B4332', 
    color: 'white', 
    border: 'none', 
    padding: '18px', 
    borderRadius: '12px', 
    fontSize: '1rem', 
    fontWeight: '700',
    cursor: 'pointer', 
    marginTop: '30px',
    transition: '0.2s'
  }
};

export default ItemDetail;