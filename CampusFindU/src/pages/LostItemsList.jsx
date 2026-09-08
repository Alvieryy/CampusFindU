import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function LostItemsList() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // New State for our Filters!
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(
          "https://campusfindu-backend.onrender.com/api/lost-items",
        );
        setItems(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Step 6 & 7: Search AND Filter Logic
  const filteredItems = items.filter((item) => {
    const searchLower = searchTerm.toLowerCase();

    // Check if it matches the text search (including location now!)
    const matchesSearch =
      (item.title && item.title.toLowerCase().includes(searchLower)) ||
      (item.description &&
        item.description.toLowerCase().includes(searchLower)) ||
      (item.location_name &&
        item.location_name.toLowerCase().includes(searchLower));

    // Check if it matches the dropdown filters
    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;
    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) return <div style={{ padding: "20px" }}>Loading items...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Lost Items 🔎</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Search name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: "8px" }}
        />

        {/* Category Dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: "8px" }}
        >
          <option value="All">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Wallets">Wallets & IDs</option>
          <option value="Clothing">Clothing</option>
          <option value="Other">Other</option>
        </select>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "8px" }}
        >
          <option value="All">All Statuses</option>
          <option value="lost">Lost</option>
          <option value="recovered">Recovered</option>
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {filteredItems.length === 0 ? (
          <p>No lost items match your filters.</p>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                borderRadius: "5px",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#ff4444" }}>
                {item.title}
              </h3>
              <p style={{ margin: "0 0 5px 0" }}>
                <strong>Category:</strong> {item.category} |{" "}
                <strong>Status:</strong> {item.status}
              </p>
              <p style={{ margin: "0 0 5px 0" }}>
                <strong>Location:</strong> {item.location_name}
              </p>
              <p style={{ margin: "0 0 10px 0" }}>
                <em>"{item.description}"</em>
              </p>
              <Link
                to={`/items/lost/${item.id}`}
                style={{ textDecoration: "none", color: "blue" }}
              >
                View Full Details →
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
