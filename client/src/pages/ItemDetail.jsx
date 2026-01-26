import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/items/${id}`)
      .then(res => setItem(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!item) return <div style={{padding: '50px', textAlign: 'center'}}>Loading treasure...</div>;

  return (
    <div style={styles.container}>
      <Link to="/" style={styles.backLink}>← Back to Community</Link>
      
      <div style={styles.contentWrapper}>
        {/* Left: Image */}
        <div style={styles.imageSection}>
          <img 
            src={item.image || "https://via.placeholder.com/400"} 
            alt={item.name} 
            style={styles.image} 
          />
        </div>

        {/* Right: Details */}
        <div style={styles.infoSection}>
          {/* REBRANDED: Shows "GIFT" instead of Price */}
          <div style={styles.badge}>COMMUNITY GIFT</div>
          
          <h1 style={styles.title}>{item.name}</h1>
          <p style={styles.description}>{item.description}</p>
          
          <div style={styles.meta}>
            <p><strong>Category:</strong> {item.category}</p>
            <p><strong>Condition:</strong> {item.condition || 'Good'}</p>
          </div>

          <button style={styles.contactBtn}>Message Giver (Coming Soon)</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' },
  backLink: { display: 'block', marginBottom: '20px', color: '#1B4332', textDecoration: 'none', fontWeight: 'bold' },
  contentWrapper: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  imageSection: { backgroundColor: '#f0f0f0', borderRadius: '12px', overflow: 'hidden', height: '400px' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  infoSection: { display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  badge: { backgroundColor: '#d1e7dd', color: '#0f5132', padding: '5px 12px', borderRadius: '20px', display: 'inline-block', width: 'fit-content', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '15px' },
  title: { fontSize: '2.5rem', margin: '0 0 20px 0', color: '#2D3748' },
  description: { lineHeight: '1.6', color: '#4A5568', marginBottom: '30px' },
  contactBtn: { backgroundColor: '#1B4332', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer', marginTop: 'auto' }
};

export default ItemDetail;