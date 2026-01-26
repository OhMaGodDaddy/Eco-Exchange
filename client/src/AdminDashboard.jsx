import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Security Check: Kick them out if they aren't an admin
    if (!user || user.role !== 'admin') {
      navigate('/'); 
      return;
    }

    // 2. Fetch Data
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      // You'll need to make sure your backend allows fetching all this
      const usersRes = await axios.get('https://eco-exchange-api.onrender.com/api/users'); 
      const itemsRes = await axios.get('https://eco-exchange-api.onrender.com/api/items');
      setUsers(usersRes.data);
      setItems(itemsRes.data);
    } catch (err) {
      console.error("Admin load error:", err);
    }
  };

  const handleDeleteItem = async (id) => {
    if(window.confirm("Admin: Delete this item?")) {
        await axios.delete(`https://eco-exchange-api.onrender.com/api/items/${id}`);
        fetchData(); // Refresh list
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: '#d32f2f' }}>🛡️ Admin Command Center</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* USERS SECTION */}
        <div style={styles.card}>
            <h2>Users ({users.length})</h2>
            <ul style={styles.list}>
                {users.map(u => (
                    <li key={u._id} style={styles.listItem}>
                        <img src={u.image} style={styles.avatar} alt="avatar" />
                        <div>
                            <strong>{u.displayName}</strong><br/>
                            <small>{u.email}</small>
                            {u.role === 'admin' && <span style={styles.adminBadge}>ADMIN</span>}
                        </div>
                    </li>
                ))}
            </ul>
        </div>

        {/* ITEMS SECTION */}
        <div style={styles.card}>
            <h2>Posted Items ({items.length})</h2>
            <ul style={styles.list}>
                {items.map(item => (
                    <li key={item._id} style={styles.listItem}>
                        <div>
                            <strong>{item.title}</strong>
                            <br/><small>By: {item.userName || 'Unknown'}</small>
                        </div>
                        <button 
                            onClick={() => handleDeleteItem(item._id)}
                            style={styles.deleteBtn}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>

      </div>
    </div>
  );
}

const styles = {
    card: { background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
    list: { listStyle: 'none', padding: 0 },
    listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '10px 0' },
    avatar: { width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' },
    adminBadge: { background: 'gold', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', marginLeft: '5px', fontWeight: 'bold' },
    deleteBtn: { background: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }
};

export default AdminDashboard;