import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaTag, FaTrash } from 'react-icons/fa';

// 1. HARDCODED LISTS
const LOCATIONS = [
  "Manila", "Quezon City", "Makati", "Taguig", "Cebu", "Davao", "Pasig", "Other"
];

const CATEGORIES = [
  "Electronics", "Furniture", "Clothing", "Books", "Appliances", "Toys", "Tools", "Other"
];

function Home({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedHub, setSelectedHub] = useState("");

  // 2. FETCH ITEMS
  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedHub) params.hub = selectedHub;
      
      const res = await axios.get("https://eco-exchange-api.onrender.com/api/items", {
        params: params,
        withCredentials: true
      });
      
      setItems(res.data);
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, selectedHub]);

  // 3. DELETE HANDLER
  const handleDelete = async (e, itemId) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to remove this item?")) return;

    try {
      const response = await axios.delete(`https://eco-exchange-api.onrender.com/api/items/${itemId}`, {
        withCredentials: true 
      });
      if (response.status === 200) {
        setItems(items.filter(item => item._id !== itemId));
        alert("Item removed successfully.");
      }
    } catch (err) {
      alert("Error: You might not have permission to delete this.");
      console.error(err);
    }
  };

  // Client-side Text Search
  const filteredItems = items.filter(item => {
    const title = item.title || item.name || "";
    const desc = item.description || "";
    return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           desc.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div style={styles.container}>
      
      {/* --- HERO SECTION --- */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Exchange Hub</h1>
        <p style={styles.heroSubtitle}>Discover sustainable treasures in your community.</p>

        {/* Search Bar */}
        <div style={styles.searchContainer}>
            {/* 🎯 HERE IS THE STICKY NOTE: className="tour-search-bar" added below! */}
            <div className="tour-search-bar" style={styles.searchWrapper}>
                <FaSearch style={styles.searchIcon} />
                <input 
                    type="text" 
                    placeholder="Search for lamps, chairs, plants..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
            </div>
        </div>

        {/* Filter Bar */}
        <div style={styles.filterBar}>
            {/* Category */}
            <div style={styles.selectWrapper}>
                <FaTag style={styles.selectIcon} />
                <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={styles.select}
                >
                    <option value="" style={{ color: 'black' }}>All Categories</option>
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat} style={{ color: 'black' }}>{cat}</option>
                    ))}
                </select>
                <div style={styles.dropdownArrow}>▼</div>
            </div>

            {/* Location */}
            <div style={styles.selectWrapper}>
                <FaMapMarkerAlt style={styles.selectIcon} />
                <select 
                    value={selectedHub} 
                    onChange={(e) => setSelectedHub(e.target.value)}
                    style={styles.select}
                >
                    <option value="" style={{ color: 'black' }}>All Locations</option>
                    {LOCATIONS.map(loc => (
                        <option key={loc} value={loc} style={{ color: 'black' }}>{loc}</option>
                    ))}
                </select>
                <div style={styles.dropdownArrow}>▼</div>
            </div>

            {/* Clear Button */}
            {(selectedCategory || selectedHub) && (
                <button 
                    onClick={() => { setSelectedCategory(""); setSelectedHub(""); }}
                    style={styles.clearBtn}
                >
                    Clear Filters
                </button>
            )}
        </div>
      </div>

      {/* --- LISTINGS GRID --- */}
      <div style={styles.listingsSection}>
        <h2 style={styles.sectionTitle}>
            {selectedCategory || selectedHub ? 'Filtered Results' : 'Fresh Listings'}
        </h2>
        
        {loading ? (
           <p style={{textAlign: 'center', marginTop: '40px', color: '#666'}}>Loading items...</p>
        ) : filteredItems.length === 0 ? (
           <div style={styles.emptyState}>
              <p>No items found matching your criteria.</p>
              <button onClick={() => {setSearchTerm(""); setSelectedCategory(""); setSelectedHub("")}} style={styles.resetBtn}>
                 Reset All Filters
              </button>
           </div>
        ) : (
          <div style={styles.grid}>
            {filteredItems.map(item => {
                // Determine Image
                const displayImage = item.images && item.images.length > 0 
                    ? item.images[0] 
                    : (item.image || "https://placehold.co/400x300?text=No+Image");

                // Determine if User Can Delete
                const canDelete = user && (user.role === 'admin' || user.googleId === item.googleId);

                return (
                  <Link to={`/item/${item._id}`} key={item._id} style={styles.cardLink}>
                    <div style={styles.card}>
                      <div style={styles.imageWrapper}>
                        <img 
                          src={displayImage}
                          alt={item.title} 
                          style={styles.cardImage}
                          onError={(e) => { e.target.src = "https://placehold.co/400x300?text=Error"; }} 
                        />
                      </div>
                      
                      <div style={styles.cardContent}>
                        <h3 style={styles.cardTitle}>{item.title || item.name}</h3>
                        
                        <div style={styles.cardMeta}>
                            <span>📍 {item.hubLocation || "Unknown"}</span>
                            <span>🏷️ {item.category || "General"}</span>
                        </div>

                        {/* DELETE BUTTON (Conditionally Rendered) */}
                        {canDelete && (
                            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee', textAlign: 'right' }}>
                                <button 
                                    onClick={(e) => handleDelete(e, item._id)}
                                    style={styles.deleteBtn}
                                >
                                    <FaTrash style={{ marginRight: '5px' }} /> Delete
                                </button>
                            </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// --- STYLES ---
const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f4f6f8', paddingBottom: '50px' },
  hero: { 
    backgroundColor: '#1B4332', 
    color: 'white', 
    padding: '60px 20px 80px', 
    textAlign: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)' 
  },
  heroTitle: { fontSize: '3rem', margin: '0 0 10px', fontWeight: '800' },
  heroSubtitle: { fontSize: '1.1rem', opacity: 0.9, marginBottom: '30px' },
  
  searchContainer: { display: 'flex', justifyContent: 'center', marginBottom: '20px' },
  searchWrapper: { 
    position: 'relative', width: '100%', maxWidth: '600px', display: 'flex', alignItems: 'center' 
  },
  searchIcon: { position: 'absolute', left: '20px', color: '#1B4332', fontSize: '1.2rem', zIndex: 1 },
  searchInput: { 
    width: '100%', padding: '16px 20px 16px 50px', borderRadius: '50px', border: 'none', 
    fontSize: '1rem', outline: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' 
  },

  filterBar: { 
    display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginTop: '10px' 
  },
  selectWrapper: {
    position: 'relative', display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)', borderRadius: '30px', padding: '0 15px', border: '1px solid rgba(255,255,255,0.3)'
  },
  selectIcon: { color: 'white', marginRight: '8px', fontSize: '0.9rem' },
  select: {
    appearance: 'none', backgroundColor: 'transparent', border: 'none', color: 'white',
    padding: '12px 25px 12px 5px', fontSize: '0.95rem', cursor: 'pointer', outline: 'none', fontWeight: '500'
  },
  dropdownArrow: {
    position: 'absolute', right: '15px', color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', pointerEvents: 'none'
  },
  clearBtn: {
    backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.5)', color: 'white',
    padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem'
  },

  listingsSection: { 
    maxWidth: '1200px', 
    margin: '30px auto', 
    padding: '0 20px' 
  },
  sectionTitle: { fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '25px', color: '#2D3748' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px' },
  
  cardLink: { textDecoration: 'none', color: 'inherit' },
  card: { 
    backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex', flexDirection: 'column', height: '100%'
  },
  imageWrapper: { position: 'relative', height: '200px', backgroundColor: '#eee' },
  cardImage: { width: '100%', height: '100%', objectFit: 'cover' },
  
  cardContent: { padding: '15px', display: 'flex', flexDirection: 'column', flexGrow: 1 },
  cardTitle: { fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px', color: '#2d3748', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  cardMeta: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#718096', marginBottom: 'auto' }, 
  
  deleteBtn: {
    backgroundColor: '#fff5f5', color: '#e53e3e', border: '1px solid #fed7d7',
    borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 'bold',
    cursor: 'pointer', display: 'inline-flex', alignItems: 'center'
  },
  
  emptyState: { textAlign: 'center', padding: '60px', color: '#666' },
  resetBtn: {
      marginTop: '15px', backgroundColor: '#1B4332', color: 'white', border: 'none',
      padding: '10px 20px', borderRadius: '8px', cursor: 'pointer'
  }
};

export default Home;