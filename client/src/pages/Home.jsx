import React, { useState, useEffect } from 'react';

export default function Home() {
  // --- 1. STATE ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for functionality
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { name: 'All Items', icon: 'grid_view' },
    { name: 'Furniture', icon: 'chair' },
    { name: 'Clothing', icon: 'checkroom' },
    { name: 'Electronics', icon: 'devices' },
    { name: 'Books', icon: 'menu_book' },
    { name: 'Garden', icon: 'local_florist' },
  ];

  // --- 2. DATA FETCHING ---
  useEffect(() => {
    const fetchItems = async () => {
      try {
        // ⚠️ IMPORTANT: Update this URL to match your actual deployed API URL or relative route!
        // If your frontend and backend are deployed together, it might just be '/api/items'
        // If you are using a separate backend on Render/Heroku, paste that full URL here.
        const response = await fetch('http://localhost:3000/api/items'); 
        
        if (!response.ok) throw new Error('Failed to fetch items');
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);
        // For testing purposes right now, let's load some fake data if the fetch fails 
        // so you can at least test the search and filter functionality!
        setItems([
          { _id: '1', name: 'John Cena Armband', category: 'Clothing', location: 'Main Campus', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
          { _id: '2', name: 'Razer Gaming Mouse', category: 'Electronics', location: 'Main Campus', imageUrl: 'https://images.unsplash.com/photo-1527219525722-f9767a7af8c8?w=400' },
          { _id: '3', name: 'Black Couch', category: 'Furniture', location: 'Main Campus', imageUrl: 'https://images.unsplash.com/photo-1506898667547-42e22a46e125?w=400' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // --- 3. FILTERING LOGIC ---
  // This magically filters your items whenever you type in the search bar OR click a category
  const filteredItems = items.filter((item) => {
    const itemName = (item.title || item.name || '').toLowerCase();
    const matchesSearch = itemName.includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'All Items' || item.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    // Added pt-8 to give some breathing room below your global NavBar
    <div className="min-h-screen bg-background-light font-display pb-20 pt-8">
      
      {/* Main Layout Area */}
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar */}
        <aside className="w-full md:w-56 flex-shrink-0 flex flex-col gap-8">
          
          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 mb-3 tracking-wider">CATEGORIES</h3>
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <button 
                    onClick={() => setActiveCategory(cat.name)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeCategory === cat.name 
                        ? 'bg-primary text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Map Button */}
          <button className="hidden md:flex bg-green-50 rounded-xl p-6 flex-col items-center justify-center text-green-800 hover:bg-green-100 transition-colors">
            <span className="material-symbols-outlined text-3xl mb-2 text-primary">location_on</span>
            <span className="text-xs font-bold tracking-wider">OPEN MAP</span>
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          
          {/* Header & Functional Search Bar Row */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Discover Near You</h2>
              <p className="text-gray-500 text-sm mt-1">Showing {filteredItems.length} eco-friendly finds</p>
            </div>
            
            {/* Functional Search Bar */}
            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400">search</span>
              <input 
                type="text" 
                placeholder="Search items..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 rounded-full py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredItems.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">search_off</span>
                <p>No items found for "{searchQuery}" in {activeCategory}.</p>
             </div>
          ) : (
            /* Grid mapping over your FILTERED data */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div key={item._id || item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow relative">
                  
                  {/* Image & Category Badge */}
                  <div className="h-48 relative overflow-hidden bg-gray-100">
                    <img 
                      src={item.image || item.imageUrl || 'https://via.placeholder.com/400'} 
                      alt={item.title || item.name} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute bottom-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
                      {item.category || 'Item'}
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-1">
                      {item.title || item.name}
                    </h3>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1 text-gray-500">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        <span className="text-xs font-medium">{item.location || 'Main Campus'}</span>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}