import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaSearch, FaTag } from 'react-icons/fa';

function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Fetch items from your backend
    axios.get('http://localhost:5000/api/items')
      .then(res => {
        setItems(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching items:", err);
        setLoading(false);
      });
  }, []);

  // --- FIXED: Safe Filter Logic ---
  // This prevents crashes if an item has no name
  const filteredItems = items.filter(item => {
    // Look for name OR title. If both missing, use empty text.
    const itemName = item.name || item.title || ""; 
    return itemName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div style={styles.pageContainer}>
        {/* --- SECTION 1: HERO & SEARCH --- */}
        <div style={styles.heroSection}>
            <div style={styles.heroContent}>
                <h1 style={styles.heroTitle}>Marketplace</h1>
                <p style={styles.heroSubtitle}>Discover sustainable treasures in your community.</p>
                
                {/* Modern Search Bar */}
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
            </div>
        </div>

        {/* --- SECTION 2: LISTINGS GRID --- */}
        <div style={styles.mainContent}>
            {/* Section Header */}
            <div style={styles.gridHeader}>
                <h2 style={styles.sectionTitle}>Fresh Listings</h2>
                <span style={styles.resultCount}>{filteredItems.length} items found</span>
            </div>

            {loading ? (
                <div style={styles.loadingState}>Loading ecosystem...</div>
            ) : (
                <div style={styles.grid}>
                    {/* --- FIXED: Safe Map Logic --- */}
                    {filteredItems.map(item => {
                        // Define safe variables to prevent "undefined" crashes
                        const safeName = item.name || item.title || "Untitled Item";
                        const safeDesc = item.description || "No description provided.";
                        const safePrice = item.price || "0";
                        const safeImage = item.image || "https://via.placeholder.com/300?text=No+Image";
                        
                        return (
                            <Link to={`/item/${item._id}`} key={item._id} style={styles.cardLink}>
                                <div style={styles.card}>
                                    {/* Image Area */}
                                    <div style={styles.imageContainer}>
                                        <img 
                                            src={safeImage} 
                                            alt={safeName} 
                                            style={styles.cardImage} 
                                        />
                                    </div>
                                    
                                    {/* Content Area */}
                                    <div style={styles.cardBody}>
                                        <h3 style={styles.cardTitle}>{safeName}</h3>
                                        <p style={styles.cardDesc}>
                                            {safeDesc.length > 60 
                                                ? safeDesc.substring(0, 60) + "..." 
                                                : safeDesc}
                                        </p>
                                        
                                        <div style={styles.cardFooter}>
                                            <div style={styles.categoryBadge}>
                                                <FaTag size={10} /> 
                                                <span>{item.category || 'General'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredItems.length === 0 && (
                <div style={styles.emptyState}>
                    <h3>No items found</h3>
                    <p>Try a different search term or be the first to sell this item!</p>
                </div>
            )}
        </div>
    </div>
  );
}

// --- PROFESSIONAL STYLES ---
const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#F7F9FC', // Very light grey-blue (Clean look)
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    paddingBottom: '60px'
  },
  heroSection: {
    backgroundColor: '#1B4332', // Your Brand Color
    color: 'white',
    padding: '60px 20px',
    textAlign: 'center',
    marginBottom: '40px'
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  heroTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '10px',
    letterSpacing: '-1px'
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    opacity: 0.9,
    marginBottom: '30px',
    fontWeight: '300'
  },
  searchWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: '50px', // Pill shape
    padding: '12px 24px',
    maxWidth: '500px',
    margin: '0 auto',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)' // Soft floaty shadow
  },
  searchIcon: {
    color: '#A0AEC0',
    marginRight: '12px'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    width: '100%',
    fontSize: '1rem',
    color: '#2D3748'
  },
  mainContent: {
    maxWidth: '1200px', // Keeps content from stretching too wide on big screens
    margin: '0 auto',
    padding: '0 20px'
  },
  gridHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    borderBottom: '1px solid #E2E8F0',
    paddingBottom: '10px'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#2D3748'
  },
  resultCount: {
    color: '#718096',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  grid: {
    display: 'grid',
    // This magic line creates a responsive grid automatically
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '30px'
  },
  cardLink: {
    textDecoration: 'none',
    color: 'inherit'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.02)', // Very subtle shadow
    border: '1px solid #E2E8F0',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    cursor: 'pointer'
  },
  imageContainer: {
    height: '200px',
    width: '100%',
    backgroundColor: '#EDF2F7',
    position: 'relative'
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' // Prevents image distortion
  },
  /*
  priceTag: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    backgroundColor: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontWeight: '700',
    color: '#1B4332',
    fontSize: '0.9rem',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  */
  cardBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: '8px',
    marginTop: 0
  },
  cardDesc: {
    fontSize: '0.9rem',
    color: '#718096',
    lineHeight: '1.5',
    marginBottom: '16px',
    flexGrow: 1 // Pushes the footer to the bottom
  },
  cardFooter: {
    marginTop: 'auto',
    borderTop: '1px solid #F7FAFC',
    paddingTop: '12px'
  },
  categoryBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#F0FFF4', // Light green bg
    color: '#276749', // Darker green text
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  loadingState: {
    textAlign: 'center',
    color: '#718096',
    marginTop: '50px',
    fontSize: '1.2rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    color: '#A0AEC0'
  }
};

export default Home;