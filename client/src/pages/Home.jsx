import React, { useState, useEffect } from 'react';

export default function Home() {
  // 1. State for your REAL data
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All Items');

  const categories = [
    { name: 'All Items', icon: 'grid_view' },
    { name: 'Furniture', icon: 'chair' },
    { name: 'Clothing', icon: 'checkroom' },
    { name: 'Electronics', icon: 'devices' },
    { name: 'Books', icon: 'menu_book' },
    { name: 'Garden', icon: 'local_florist' },
  ];

  // 2. Fetch your real data from your backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        // NOTE: Update this URL if your backend route is different!
        const response = await fetch('http://localhost:3000/api/items'); 
        if (!response.ok) throw new Error('Failed to fetch items');
        
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <div className="min-h-screen bg-background-light font-display pb-20">
      
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl">eco</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Eco-exchange</h1>
        </div>

        <div className="flex-1 max-w-xl px-8">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400">search</span>
            <input 
              type="text" 
              placeholder="Find sustainable goods near you..." 
              className="w-full bg-green-50 text-green-900 placeholder-green-600/50 rounded-full py-2.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm font-medium">
          <button className="text-primary">Discover</button>
          <button className="text-gray-500 hover:text-gray-900">Messages</button>
          <button className="text-gray-500 hover:text-gray-900">Saved</button>
          <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center">
             <span className="material-symbols-outlined text-gray-500">person</span>
          </div>
        </div>
      </nav>

      {/* Main Layout Area */}
      <div className="max-w-7xl mx-auto px-8 flex gap-8">
        
        {/* Left Sidebar */}
        <aside className="w-56 flex-shrink-0 flex flex-col gap-8">
          
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
          <button className="mt-4 bg-green-50 rounded-xl p-6 flex flex-col items-center justify-center text-green-800 hover:bg-green-100 transition-colors">
            <span className="material-symbols-outlined text-3xl mb-2 text-primary">location_on</span>
            <span className="text-xs font-bold tracking-wider">OPEN MAP</span>
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          
          {/* Header Row */}
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Discover Near You</h2>
              <p className="text-gray-500 text-sm mt-1">Showing eco-friendly finds in your community</p>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500 font-medium">Loading items...</p>
            </div>
          ) : (
            /* Grid mapping over your REAL data */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
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

                  {/* Card Info (No Prices!) */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-base mb-2 line-clamp-1">
                      {item.title || item.name}
                    </h3>
                    
                    {/* Location / Meta Info matching your old UI */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1 text-gray-500">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        <span className="text-xs font-medium">{item.location || 'Main Campus'}</span>
                      </div>
                      
                      {/* Optional Delete Button from your old UI (Uncomment if needed) */}
                      {/* <button className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                        Delete
                      </button> */}
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