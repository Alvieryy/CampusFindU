import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function CampusMap() {
  const mmsuCenter = { lat: 18.0583, lng: 120.5446 };
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);

  useEffect(() => {
    axios
      .get("https://campusfindu-backend.onrender.com/api/lost-items")
      .then((res) => setLostItems(res.data));
    axios
      .get("https://campusfindu-backend.onrender.com/api/found-items")
      .then((res) => setFoundItems(res.data));
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h2>MMSU Campus Map</h2>
      <p style={{ fontWeight: "bold" }}>🔴 Lost Items | 🟢 Found Items</p>

      <div
        style={{
          height: "600px",
          width: "100%",
          borderRadius: "8px",
          overflow: "hidden",
          border: "2px solid #ccc",
        }}
      >
        <MapContainer
          center={mmsuCenter}
          zoom={15}
          minZoom={10}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {lostItems.map(
            (item) =>
              item.latitude &&
              item.longitude && (
                <Marker
                  key={`lost-${item.id}`}
                  position={[item.latitude, item.longitude]}
                  icon={redIcon}
                >
                  <Popup>
                    <strong>{item.title}</strong> <br />
                    <span style={{ color: "red" }}>Status: Lost</span> <br />
                    <Link to={`/items/lost/${item.id}`}>View Details</Link>
                  </Popup>
                </Marker>
              ),
          )}

          {foundItems.map(
            (item) =>
              item.latitude &&
              item.longitude && (
                <Marker
                  key={`found-${item.id}`}
                  position={[item.latitude, item.longitude]}
                  icon={greenIcon}
                >
                  <Popup>
                    <strong>{item.title}</strong> <br />
                    <span style={{ color: "green" }}>Status: Found</span> <br />
                    <Link to={`/items/found/${item.id}`}>View Details</Link>
                  </Popup>
                </Marker>
              ),
          )}
        </MapContainer>
      </div>
    </div>
  );
}
