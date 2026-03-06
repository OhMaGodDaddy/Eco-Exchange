import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://eco-exchange-api.onrender.com";

export default function PreferenceSelection({ user, onComplete }) {
  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/preferences/categories`, {
          withCredentials: true,
        });
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError("Unable to load categories right now. Please refresh and try again.");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((currentId) => currentId !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!selectedIds.length) {
      setError("Please pick at least one interest.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_BASE}/api/preferences`,
        { categoryIds: selectedIds },
        { withCredentials: true }
      );

      onComplete(response.data?.user || { ...user, preferenceSelectionCompleted: true });
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading your interest options...</div>;
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>What are you interested in?</h1>
        <p style={styles.subtitle}>
          Select categories so EcoExchange can recommend more relevant listings on your homepage.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.tags}>
          {categories.map((category) => {
            const active = selectedIds.includes(category._id);
            return (
              <button
                key={category._id}
                onClick={() => toggleSelection(category._id)}
                style={{
                  ...styles.tag,
                  ...(active ? styles.tagActive : {}),
                }}
              >
                {category.name}
              </button>
            );
          })}
        </div>

        <button style={styles.saveButton} onClick={handleSave} disabled={saving || !categories.length}>
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)",
  },
  card: {
    width: "100%",
    maxWidth: "760px",
    background: "white",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 16px 42px rgba(6, 78, 59, 0.15)",
  },
  title: {
    margin: 0,
    fontSize: "2rem",
    color: "#064E3B",
  },
  subtitle: {
    marginTop: "10px",
    color: "#374151",
    lineHeight: 1.5,
  },
  tags: {
    marginTop: "24px",
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  tag: {
    border: "1px solid #86EFAC",
    borderRadius: "999px",
    padding: "10px 16px",
    background: "#ECFDF5",
    color: "#065F46",
    fontWeight: 600,
    cursor: "pointer",
  },
  tagActive: {
    background: "#10B981",
    borderColor: "#10B981",
    color: "white",
  },
  saveButton: {
    marginTop: "28px",
    border: "none",
    borderRadius: "12px",
    padding: "12px 20px",
    background: "#065F46",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  error: {
    marginTop: "16px",
    color: "#B91C1C",
    background: "#FEE2E2",
    borderRadius: "10px",
    padding: "10px 12px",
  },
  loading: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    color: "white",
  },
};
