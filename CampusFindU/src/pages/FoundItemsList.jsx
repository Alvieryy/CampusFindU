import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function FoundItemsList() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Fetching from the /found-items API!
        const response = await axios.get(
          "https://campusfindu-backend.onrender.com/api/found-items",
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

  const filteredItems = items.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(searchLower)) ||
      (item.description && item.description.toLowerCase().includes(searchLower))
    );
  });

  if (loading) return <div style={{ padding: "20px" }}>Loading items...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Found Items </h2>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {filteredItems.length === 0 ? (
          <p>No found items.</p>
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
              <h3 style={{ margin: "0 0 10px 0", color: "#44aa44" }}>
                {item.title}
              </h3>
              <p style={{ margin: "0 0 5px 0" }}>
                <strong>Category:</strong> {item.category}
              </p>
              <p style={{ margin: "0 0 5px 0" }}>
                <strong>Location Found:</strong> {item.location_name}
              </p>
              <p style={{ margin: "0" }}>
                <em>"{item.description}"</em>
              </p>
              <Link
                to={`/items/found/${item.id}`}
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
