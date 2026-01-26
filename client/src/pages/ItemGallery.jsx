import { useState, useEffect } from 'react';

const ItemGallery = ({ user }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch("https://eco-exchange-api.onrender.com/api/items");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      const response = await fetch(`https://eco-exchange-api.onrender.com/api/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setItems(items.filter(item => item._id !== itemId));
        alert("Item removed.");
      } else {
        alert("Unauthorized to delete this.");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (loading) return <div style={{ color: 'white', textAlign: 'center' }}>Loading Items...</div>;

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h2>Available Items</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {items.map(item => (
          <div key={item._id} style={{ border: '1px solid #444', padding: '15px', borderRadius: '8px', background: '#222' }}>
            {item.image && <img src={item.image} alt={item.title} style={{ width: '100%', borderRadius: '4px' }} />}
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <p><strong>Location:</strong> {item.hubLocation}</p>
            <p><strong>Posted by:</strong> {item.userName || 'Anonymous'}</p>
            
            {/* 🛡️ SECURITY CHECK: Only show delete if user is Admin OR Owner */}
            {(user.role === 'admin' || user.googleId === item.googleId) && (
              <button 
                onClick={() => handleDelete(item._id)}
                style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '8px', cursor: 'pointer', borderRadius: '4px' }}
              >
                Remove Item
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemGallery;