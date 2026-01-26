import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function ItemDetail() {
  const { id } = useParams(); // Gets the ID from the URL (/item/123)
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 👈 FIXED: Fetch ONLY the specific item by its ID
    axios.get(`https://eco-exchange-api.onrender.com/api/items/${id}`)
      .then(res => {
        setItem(res.data);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setError("Could not find this treasure.");
      });
  }, [id]);

  if (error) return <div style={{padding: '50px', textAlign: 'center'}}>{error}</div>;
  if (!item) return <div style={{padding: '50px', textAlign: 'center'}}>Loading treasure...</div>;

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
          
          {/* 👈 FIXED: Use item.title if that's what your DB uses */}
          <h1 style={styles.title}>{item.title || item.name}</h1>
          <p style={styles.description}>{item.description}</p>
          
          <div style={styles.meta}>
            <p><strong>Category:</strong> {item.category}</p>
            <p><strong>Condition:</strong> {item.condition || 'New'}</p>
            {/* Added Location since it's in your card view */}
            <p><strong>Location:</strong> {item.location || 'Campus'}</p>
          </div>

          <button style={styles.contactBtn}>Message Giver (Coming Soon)</button>
        </div>
      </div>
    </div>
  );
}

// ... styles remain the same as you provided ...
export default ItemDetail;