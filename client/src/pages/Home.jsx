import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaTrash,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";

// API
const API_BASE = "https://eco-exchange-api.onrender.com";

// Sidebar categories (match your screenshot style)
const CATEGORIES = [
  { key: "", label: "All Items" },
  { key: "Furniture", label: "Furniture" },
  { key: "Clothing", label: "Clothing" },
  { key: "Electronics", label: "Electronics" },
  { key: "Books", label: "Books" },
  { key: "Garden", label: "Garden" },
  { key: "Appliances", label: "Appliances" },
  { key: "Toys", label: "Toys" },
  { key: "Tools", label: "Tools" },
  { key: "Other", label: "Other" },
];

const LOCATIONS = ["", "Manila", "Quezon City", "Makati", "Taguig", "Cebu", "Davao", "Pasig", "Other"];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getDisplayImage(item) {
  if (item?.images?.length) return item.images[0];
  if (item?.image) return item.image;
  return "https://placehold.co/900x700?text=No+Image";
}

function safeText(s) {
  return (s ?? "").toString();
}

function normalizeItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function sameCategory(itemCategory, selectedCategory) {
  if (!selectedCategory) return true;
  return safeText(itemCategory).trim().toLowerCase() === selectedCategory.trim().toLowerCase();
}

export default function Home({ user }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters / search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedHub, setSelectedHub] = useState("");

  // Sort
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | az | za

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Local favorites UI only (optional)
  const [favorites, setFavorites] = useState(() => new Set());

  const toggleFav = (e, itemId) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const fetchItems = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = { page: pageNum };
      if (selectedCategory) params.category = selectedCategory;
      if (selectedHub) params.hub = selectedHub;

      const res = await axios.get(`${API_BASE}/api/items`, {
        params,
        withCredentials: true,
      });

      const fetched = normalizeItems(res.data);

      // Fallback: some deployments return empty when category is "All Items" with page query.
      // Retry without pagination so "All Items" still renders listings.
      if (pageNum === 1 && !selectedCategory && fetched.length === 0) {
        const fallbackRes = await axios.get(`${API_BASE}/api/items`, {
          params: selectedHub ? { hub: selectedHub } : undefined,
          withCredentials: true,
        });
        const fallbackItems = normalizeItems(fallbackRes.data);
        setItems(fallbackItems);
        setHasMore(fallbackItems.length >= 20);
        return;
      }

      if (pageNum === 1) setItems(fetched);
      else setItems((prev) => [...prev, ...fetched]);

      // if backend page size is 20 like your code expects:
      setHasMore(fetched.length >= 20);
    } catch (err) {
      console.error("Error fetching items:", err);
      // keep current items, just stop load more
      if (pageNum === 1) setItems([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // When sidebar filters change: reset to page 1
  useEffect(() => {
    setPage(1);
    fetchItems(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedHub]);

  const handleDelete = async (e, itemId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to remove this item?")) return;

    try {
      const response = await axios.delete(`${API_BASE}/api/items/${itemId}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setItems((prev) => prev.filter((it) => it._id !== itemId));
        alert("Item removed successfully.");
      }
    } catch (err) {
      alert("Error: You might not have permission to delete this.");
      console.error(err);
    }
  };

  // Client-side search + sort (keeps it functional even if backend doesn't support search/sort)
  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    const categoryFiltered = items.filter((item) =>
      sameCategory(item.category, selectedCategory)
    );

    const searched = categoryFiltered.filter((item) => {
      const title = safeText(item.title || item.name).toLowerCase();
      const desc = safeText(item.description).toLowerCase();
      const hub = safeText(item.hubLocation).toLowerCase();
      const cat = safeText(item.category).toLowerCase();
      if (!q) return true;
      return (
        title.includes(q) ||
        desc.includes(q) ||
        hub.includes(q) ||
        cat.includes(q)
      );
    });

    const sorted = [...searched].sort((a, b) => {
      const aTitle = safeText(a.title || a.name).toLowerCase();
      const bTitle = safeText(b.title || b.name).toLowerCase();

      // createdAt might exist in your DB; if not, fallback keeps stable
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      switch (sortBy) {
        case "oldest":
          return aDate - bDate;
        case "az":
          return aTitle.localeCompare(bTitle);
        case "za":
          return bTitle.localeCompare(aTitle);
        case "newest":
        default:
          return bDate - aDate;
      }
    });

    return sorted;
  }, [items, searchTerm, selectedCategory, sortBy]);

  const activeCategoryLabel =
    CATEGORIES.find((c) => c.key === selectedCategory)?.label || "All Items";

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Layout wrapper */}
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 lg:sticky lg:top-6 lg:h-[calc(100vh-48px)]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/20 grid place-items-center">
                <span className="text-emerald-600 font-bold">E</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-900">Categories</div>
                <div className="text-xs text-zinc-500">Filter listings</div>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {CATEGORIES.map((cat) => {
                const active = cat.key === selectedCategory;
                return (
                  <button
                    key={cat.label}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={cn(
                      "w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition",
                      active
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "text-zinc-700 hover:bg-zinc-100"
                    )}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Location dropdown */}
            <div className="mt-6">
              <div className="mb-2 text-xs font-semibold text-zinc-500">Location</div>
              <div className="relative">
                <FaMapMarkerAlt className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <select
                  value={selectedHub}
                  onChange={(e) => setSelectedHub(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-9 py-2 text-sm text-zinc-800 outline-none transition focus:ring-2 focus:ring-emerald-500/40"
                >
                  <option value="">All locations</option>
                  {LOCATIONS.filter(Boolean).map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">
                  ▼
                </span>
              </div>
            </div>

            {/* Open map card (UI only) */}
            <button
              type="button"
              className="mt-6 w-full rounded-2xl bg-emerald-500/10 p-5 text-center ring-1 ring-emerald-500/20 hover:bg-emerald-500/15 transition"
              onClick={() => alert("Map UI coming soon (hook this to your map drawer).")}
            >
              <div className="mx-auto mb-2 h-10 w-10 rounded-2xl bg-white ring-1 ring-emerald-500/20 grid place-items-center">
                <FaMapMarkerAlt className="text-emerald-600" />
              </div>
              <div className="text-sm font-semibold text-zinc-900">Open Map</div>
              <div className="text-xs text-zinc-500">View nearby listings</div>
            </button>

            {/* Clear filters */}
            {(selectedCategory || selectedHub || searchTerm) && (
              <button
                className="mt-5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-100 transition"
                onClick={() => {
                  setSelectedCategory("");
                  setSelectedHub("");
                  setSearchTerm("");
                }}
              >
                Clear filters
              </button>
            )}
          </aside>

          {/* Main content */}
          <main>
            {/* Top bar: Search + Sort */}
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500 grid place-items-center shadow-sm">
                  <FaSearch className="text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-zinc-900">Discover Near You</div>
                  <div className="text-sm text-zinc-500">
                    Browsing: <span className="font-semibold text-zinc-800">{activeCategoryLabel}</span>
                    {selectedHub ? (
                      <>
                        {" "}
                        • <span className="font-semibold text-zinc-800">{selectedHub}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end md:gap-4">
                {/* Search input */}
                <div className="relative w-full md:w-[420px]">
                  <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Find sustainable goods near you…"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-9 py-2 text-sm text-zinc-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none rounded-xl border border-zinc-200 bg-white px-4 py-2 pr-10 text-sm font-semibold text-zinc-800 outline-none transition hover:bg-zinc-50 focus:ring-2 focus:ring-emerald-500/40"
                  >
                    <option value="newest">Sort by: Newest</option>
                    <option value="oldest">Sort by: Oldest</option>
                    <option value="az">Sort by: A–Z</option>
                    <option value="za">Sort by: Z–A</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">
                    ▼
                  </span>
                </div>
              </div>
            </div>

            {/* States */}
            {loading && page === 1 ? (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[330px] animate-pulse rounded-2xl bg-white p-4 shadow-sm ring-1 ring-zinc-200"
                  >
                    <div className="h-44 rounded-xl bg-zinc-100" />
                    <div className="mt-4 h-4 w-2/3 rounded bg-zinc-100" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-zinc-100" />
                    <div className="mt-6 h-10 w-full rounded-xl bg-zinc-100" />
                  </div>
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-zinc-200">
                <div className="text-lg font-bold text-zinc-900">No items found</div>
                <div className="mt-2 text-sm text-zinc-500">
                  Try a different keyword or clear your filters.
                </div>
                <button
                  className="mt-5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedHub("");
                    setSearchTerm("");
                  }}
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <>
                {/* Grid */}
                <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredItems.map((item) => {
                    const displayImage = getDisplayImage(item);
                    const title = item.title || item.name || "Untitled";
                    const hub = item.hubLocation || "Unknown";
                    const category = item.category || "General";

                    const canDelete =
                      user &&
                      (user.role === "admin" || user.googleId === item.googleId);

                    const isFav = favorites.has(item._id);

                    return (
                      <Link
                        to={`/item/${item._id}`}
                        key={item._id}
                        className="group rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        {/* Image */}
                        <div className="relative overflow-hidden rounded-t-2xl">
                          <img
                            src={displayImage}
                            alt={title}
                            className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://placehold.co/900x700?text=Error";
                            }}
                          />

                          {/* Category badge */}
                          <div className="absolute left-4 top-4">
                            <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                              {category.toUpperCase()}
                            </span>
                          </div>

                          {/* Heart */}
                          <button
                            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-zinc-800 shadow-sm ring-1 ring-zinc-200 hover:bg-white"
                            onClick={(e) => toggleFav(e, item._id)}
                            aria-label="Toggle favorite"
                            title="Save"
                          >
                            {isFav ? (
                              <FaHeart className="text-emerald-600" />
                            ) : (
                              <FaRegHeart className="text-zinc-700" />
                            )}
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-base font-bold text-zinc-900">
                                {title}
                              </div>
                              <div className="mt-1 line-clamp-2 text-sm text-zinc-500">
                                {item.description
                                  ? item.description
                                  : "Looking to trade or give away sustainably."}
                              </div>
                            </div>

                            {/* IMPORTANT: No pricing here. Removed. */}
                          </div>

                          {/* Footer row */}
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-zinc-600">
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-700">
                                {(item.ownerName || item.owner || "U")[0]?.toUpperCase()}
                              </span>
                              <span className="truncate max-w-[160px]">
                                {item.ownerName || item.owner || "Community Member"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                              <FaMapMarkerAlt className="text-zinc-400" />
                              <span className="truncate max-w-[140px]">{hub}</span>
                            </div>
                          </div>

                          {/* Delete row (only if allowed) */}
                          {canDelete && (
                            <div className="mt-4 flex justify-end border-t border-zinc-100 pt-3">
                              <button
                                onClick={(e) => handleDelete(e, item._id)}
                                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
                              >
                                <FaTrash />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Load more */}
                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => {
                        const next = page + 1;
                        setPage(next);
                        fetchItems(next);
                      }}
                      disabled={loading}
                      className={cn(
                        "rounded-xl px-5 py-3 text-sm font-bold transition",
                        loading
                          ? "cursor-not-allowed bg-zinc-200 text-zinc-500"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      )}
                    >
                      {loading ? "Loading…" : "Show More Results"}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}