import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaSearch, FaTag, FaTrash, FaFilter, FaMapMarkerAlt } from 'react-icons/fa';

function Home({ user }) { 
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // 1. NEW FILTER STATES
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedHub, setSelectedHub] = useState('');

  // 2. FETCH WHEN FILTERS CHANGE
  useEffect(() => {
    fetchItems();
  }, [selectedCategory, selectedHub]); // Re-run when these change

  const fetchItems = () => {
    setLoading(true);
    
    // Build the query string
    const params = new URLSearchParams();
    if (selectedCategory) params.append("category", selectedCategory);
    if (selectedHub) params.append("hub", selectedHub);

    let url = 'https://eco-exchange-api.onrender.com/api/items';
    if (params.toString()) url += `?${params.toString()}`;

    axios.get(url)
      .then(res => {
        setItems(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching items:", err);
        setLoading(false);
      });
  };

  // DELETE HANDLER
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

  const filteredItems = items.filter(item => {
    const itemName = item.name || item.title || ""; 
    return itemName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div style={styles.pageContainer}>
        <div style={styles.heroSection}>
            <div style={styles.heroContent}>
                <h1 style={styles.heroTitle}>Marketplace</h1>
                <p style={styles.heroSubtitle}>Discover sustainable treasures in your community.</p>
                
                <div style={styles.searchWrapper}>
                    <FaSearch style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search for lamps, chairs, plants..."
                        style={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* 3. NEW FILTER CONTROLS */}
                <div style={styles.filterContainer}>
                  <div style={styles.selectWrapper}>
                    <FaFilter style={styles.filterIcon} />
                    <select 
                      value={selectedCategory} 
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      style={styles.selectInput}
                    >
                      <option value="">All Categories</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Books">Books</option>
                      <option value="Plants">Plants</option>
                      <option value="Kitchen">Kitchen</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div style={styles.selectWrapper}>
                    <FaMapMarkerAlt style={styles.filterIcon} />
                    <select 
                      value={selectedHub} 
                      onChange={(e) => setSelectedHub(e.target.value)}
                      style={styles.selectInput}
                    >
                      <option value="">All Locations</option>
                      <option value="Main Campus">Main Campus</option>
                      <option value="Science Block">Science Block</option>
                      <option value="Student Dorm A">Student Dorm A</option>
                      <option value="Main Cafeteria">Main Cafeteria</option>
                    </select>
                  </div>
                </div>

            </div>
        </div>

        <div style={styles.mainContent}>
            <div style={styles.gridHeader}>
                <h2 style={styles.sectionTitle}>
                  {selectedCategory || 'Fresh'} Listings
                  {selectedHub && <span style={{fontSize:'0.8em', fontWeight:'normal'}}> near {selectedHub}</span>}
                </h2>
                <span style={styles.resultCount}>{filteredItems.length} items found</span>
            </div>

            {loading ? (
                <div style={styles.loadingState}>Loading ecosystem...</div>
            ) : filteredItems.length === 0 ? (
                <div style={styles.emptyState}>
                  <h3>No items found here.</h3>
                  <button onClick={() => {setSelectedCategory(''); setSelectedHub('')}} style={styles.clearBtn}>
                    Clear Filters
                  </button>
                </div>
            ) : (
                <div style={styles.grid}>
                    {filteredItems.map(item => {
                        const safeName = item.name || item.title || "Untitled Item";
                        const safeDesc = item.description || "No description provided.";
                        const safeImage = item.image || "https://via.placeholder.com/300?text=No+Image";
                        
                        const canDelete = user && (user.role === 'admin' || user.googleId === item.googleId);

                        return (
                            <div key={item._id} style={styles.cardWrapper}>
                                <Link to={`/item/${item._id}`} style={styles.cardLink}>
                                    <div style={styles.card}>
                                        <div style={styles.imageContainer}>
                                            <img src={safeImage} alt={safeName} style={styles.cardImage} />
                                        </div>
                                        <div style={styles.cardBody}>
                                            <h3 style={styles.cardTitle}>{safeName}</h3>
                                            <p style={styles.cardDesc}>
                                                {safeDesc.length > 60 ? safeDesc.substring(0, 60) + "..." : safeDesc}
                                            </p>
                                            <div style={styles.cardFooter}>
                                                <div style={styles.categoryBadge}>
                                                    <FaTag size={10} /> 
                                                    <span>{item.category || 'General'}</span>
                                                </div>
                                                
                                                {canDelete && (
                                                    <button 
                                                        onClick={(e) => handleDelete(e, item._id)}
                                                        style={styles.deleteBtn}
                                                        title="Delete Item"
                                                    >
                                                        <FaTrash size={12} />
                                                        {user.role === 'admin' ? " Admin" : ""}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
  );
}

const styles = {
  pageContainer: { minHeight: '100vh', backgroundColor: '#F7F9FC', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", paddingBottom: '60px' },
  heroSection: { backgroundColor: '#1B4332', color: 'white', padding: '60px 20px', textAlign: 'center', marginBottom: '40px' },
  heroContent: { maxWidth: '800px', margin: '0 auto' },
  heroTitle: { fontSize: '2.5rem', fontWeight: '700', marginBottom: '10px', letterSpacing: '-1px' },
  heroSubtitle: { fontSize: '1.1rem', opacity: 0.9, marginBottom: '30px', fontWeight: '300' },
  
  searchWrapper: { display: 'flex', alignItems: 'center', backgroundColor: 'white', borderRadius: '50px', padding: '12px 24px', maxWidth: '500px', margin: '0 auto 20px auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
  searchIcon: { color: '#A0AEC0', marginRight: '12px' },
  searchInput: { border: 'none', outline: 'none', width: '100%', fontSize: '1rem', color: '#2D3748' },

  // 👇 STYLES FOR FILTERS
  filterContainer: { display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' },
  selectWrapper: { display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', border: '1px solid rgba(255,255,255,0.2)' },
  filterIcon: { color: '#8FBC8F', marginRight: '8px' },
  selectInput: { background: 'transparent', border: 'none', color: 'white', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' },
  
  mainContent: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px' },
  gridHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' },
  sectionTitle: { fontSize: '1.5rem', fontWeight: '700', color: '#2D3748' },
  resultCount: { color: '#718096', fontSize: '0.9rem', fontWeight: '500' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' },
  cardWrapper: { position: 'relative', height: '100%' },
  cardLink: { textDecoration: 'none', color: 'inherit' },
  card: { backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #E2E8F0', transition: 'transform 0.2s ease, box-shadow 0.2s ease', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer' },
  
  imageContainer: { height: '200px', width: '100%', backgroundColor: '#EDF2F7', position: 'relative' },
  cardImage: { width: '100%', height: '100%', objectFit: 'cover' },
  cardBody: { padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 },
  cardTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1A202C', marginBottom: '8px', marginTop: 0 },
  cardDesc: { fontSize: '0.9rem', color: '#718096', lineHeight: '1.5', marginBottom: '16px', flexGrow: 1 },
  cardFooter: { marginTop: 'auto', borderTop: '1px solid #F7FAFC', paddingTop: '12px', display: 'flex', alignItems: 'center' },
  categoryBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#F0FFF4', color: '#276749', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' },
  
  deleteBtn: {
    backgroundColor: '#FED7D7', color: '#C53030', border: 'none', borderRadius: '6px', padding: '6px 10px', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold', transition: 'background-color 0.2s', marginLeft: 'auto'
  },
  
  loadingState: { textAlign: 'center', color: '#718096', marginTop: '50px', fontSize: '1.2rem' },
  emptyState: { textAlign: 'center', padding: '60px', color: '#A0AEC0' },
  clearBtn: { marginTop:'10px', padding:'8px 16px', backgroundColor:'#CBD5E0', border:'none', borderRadius:'5px', cursor:'pointer' }
};

export default Home;