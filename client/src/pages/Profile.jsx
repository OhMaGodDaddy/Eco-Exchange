import { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaLeaf, FaBoxOpen, FaMapMarkerAlt, FaEdit, FaCheck } from 'react-icons/fa';

const API_BASE = 'https://eco-exchange-api.onrender.com';

function getUserAvatar(user) {
  return user?.image || user?.picture || 'https://placehold.co/240x240?text=Eco';
}

function formatPreferenceNames(preferences) {
  if (!Array.isArray(preferences)) return [];
  return preferences
    .map((pref) => (typeof pref === 'string' ? pref : pref?.name))
    .filter(Boolean);
}

export default function Profile({ user, onUserUpdate }) {
  const [myListings, setMyListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedPreferenceIds, setSelectedPreferenceIds] = useState([]);
  const [editingPreferences, setEditingPreferences] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [preferenceError, setPreferenceError] = useState('');
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/items`, { credentials: 'include' });
        const data = await response.json();
        const items = Array.isArray(data) ? data : [];

        const myItems = items.filter((item) => {
          const itemCreatorId = item.giver_id || item.userId || item.owner || item.user || item.poster;
          return String(itemCreatorId) === String(user?._id);
        });

        setMyListings(myItems);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoadingListings(false);
      }
    };

    if (user?._id) fetchMyItems();
  }, [user]);

  useEffect(() => {
    const loadPreferenceCategories = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/preferences/categories`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to load categories');
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading preference categories:', error);
      }
    };

    loadPreferenceCategories();
  }, []);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/bookmarks`, { credentials: 'include' });
        if (!response.ok) return;
        const data = await response.json();
        setBookmarks(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    };

    if (user?._id) fetchBookmarks();
  }, [user]);

  useEffect(() => {
    if (!Array.isArray(user?.preferences)) {
      setSelectedPreferenceIds([]);
      return;
    }

    const ids = user.preferences
      .map((pref) => (typeof pref === 'string' ? pref : pref?._id))
      .filter(Boolean);

    setSelectedPreferenceIds(ids);
  }, [user]);

  const sharedCount = myListings.length;
  const successfulPoints = user?.successfulTransactionPoints || 0;
  const preferenceNames = useMemo(() => formatPreferenceNames(user?.preferences), [user]);

  const togglePreference = (categoryId) => {
    setSelectedPreferenceIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const handleSavePreferences = async () => {
    if (!selectedPreferenceIds.length) {
      setPreferenceError('Please select at least one category.');
      return;
    }

    setSavingPreferences(true);
    setPreferenceError('');

    try {
      const response = await fetch(`${API_BASE}/api/preferences`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryIds: selectedPreferenceIds }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to save preferences.');
      }

      onUserUpdate?.(result.user);
      setEditingPreferences(false);
    } catch (error) {
      setPreferenceError(error.message);
    } finally {
      setSavingPreferences(false);
    }
  };

  if (!user) {
    return <div className="text-white text-center mt-20">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f6f8f6] px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
        >
          <FaArrowLeft /> Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <aside className="space-y-6 md:col-span-3">
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <img
                    src={getUserAvatar(user)}
                    alt="Profile"
                    className="h-28 w-28 rounded-full border-4 border-emerald-100 object-cover"
                  />
                  <div className="absolute bottom-1 right-1 rounded-full bg-emerald-500 p-2 text-white">
                    <FaEdit size={12} />
                  </div>
                </div>
                <h1 className="mt-4 text-xl font-bold">{user.displayName || user.name}</h1>
                <p className="text-sm text-slate-500">{user.email}</p>
                <div className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <FaMapMarkerAlt /> EcoExchange Member
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 text-sm text-slate-600">
                Passionate about giving pre-loved items a second life and reducing landfill waste.
              </div>

              <div className="mt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Interest Tags</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(preferenceNames.length ? preferenceNames : ['No preferences selected']).map((name) => (
                    <span key={name} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <h3 className="text-sm font-bold">Trust Score</h3>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-emerald-100">
                  <div className="h-full w-[92%] bg-emerald-500" />
                </div>
                <span className="text-sm font-bold">92%</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">Based on your swap activity and successful exchanges.</p>
            </div>
          </aside>

          <section className="space-y-6 md:col-span-6">
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Trust & Activity Dashboard</h2>
                <Link to="/leaderboard" className="text-xs font-semibold text-emerald-700 underline">View leaderboard</Link>
              </div>

              <div className="mb-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-2xl font-bold">{successfulPoints}</div>
                  <div className="text-xs text-slate-500">Successful Transaction Points</div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="text-2xl font-bold">{sharedCount}</div>
                  <div className="text-xs text-slate-500">Items Kept from Landfill</div>
                </div>
              </div>

              <div className="relative flex h-52 items-end gap-2 overflow-hidden rounded-xl bg-slate-50 p-4">
                <div className="absolute left-4 top-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">Impact Over Time</div>
                {[40, 60, 30, 78, 52, 92, 45].map((h, idx) => (
                  <div key={idx} className="flex-1 rounded-t bg-emerald-300" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Preference Settings</h3>
                <button
                  type="button"
                  onClick={() => {
                    setPreferenceError('');
                    setEditingPreferences((prev) => !prev);
                  }}
                  className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                >
                  {editingPreferences ? 'Cancel' : 'Edit Preferences'}
                </button>
              </div>

              <p className="mb-4 text-sm text-slate-600">
                Update your interests to personalize listings and homepage recommendations.
              </p>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const isSelected = selectedPreferenceIds.includes(category._id);
                  return (
                    <button
                      key={category._id}
                      type="button"
                      disabled={!editingPreferences}
                      onClick={() => togglePreference(category._id)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      } ${editingPreferences ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'}`}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>

              {preferenceError && (
                <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{preferenceError}</div>
              )}

              {editingPreferences && (
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  disabled={savingPreferences}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
                >
                  <FaCheck /> {savingPreferences ? 'Saving...' : 'Save Preferences'}
                </button>
              )}
            </div>
          </section>

          <aside className="space-y-6 md:col-span-3">
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold">Active Listings</h3>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  {myListings.length} Active
                </span>
              </div>

              {loadingListings ? (
                <p className="text-sm text-slate-500">Loading your listings...</p>
              ) : myListings.length ? (
                <div className="space-y-4">
                  {myListings.slice(0, 3).map((item) => (
                    <div key={item._id} className="group">
                      <div className="relative mb-2 aspect-video overflow-hidden rounded-lg bg-slate-100">
                        <img
                          src={item.images?.[0] || item.image || 'https://placehold.co/500x320?text=Listing'}
                          alt={item.title || item.name}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                        <div className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-[10px] font-bold uppercase text-white">
                          {item.category || 'Other'}
                        </div>
                      </div>
                      <h4 className="truncate text-sm font-bold">{item.title || item.name}</h4>
                      <p className="text-xs text-slate-500">{item.hubLocation || 'Eco Hub'} • {item.status || 'Available'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">You do not have active listings yet.</p>
              )}

              <Link
                to="/post"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-emerald-200 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50"
              >
                <FaBoxOpen /> Post New Listing
              </Link>
            </div>


            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold">Bookmarks</h3>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{bookmarks.length} Saved</span>
              </div>
              {bookmarks.length ? (
                <div className="space-y-3">
                  {bookmarks.slice(0, 4).map((item) => (
                    <Link key={item._id} to={`/item/${item._id}`} className="block rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                      <div className="text-sm font-semibold">{item.title}</div>
                      <div className="text-xs text-slate-500">{item.city || item.hubLocation || 'Location not set'}</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No saved items yet.</p>
              )}
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-100 p-3 text-emerald-700">
                  <FaLeaf />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Eco Impact Snapshot</h4>
                  <p className="text-xs text-slate-500">Keep sharing to boost your sustainability score.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}