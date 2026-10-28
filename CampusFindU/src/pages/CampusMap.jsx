import { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import apiClient from "../utils/apiClient";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const API_URL = "https://campusfindu-backend.onrender.com/api";

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

function getPosition(item) {
  if (
    item.latitude == null ||
    item.longitude == null ||
    String(item.latitude).trim() === "" ||
    String(item.longitude).trim() === ""
  ) {
    return null;
  }

  const latitude = Number(item.latitude);
  const longitude = Number(item.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return [latitude, longitude];
}

function getActiveItems(items, status) {
  return items.filter(
    (item) =>
      String(item.status || "")
        .trim()
        .toLowerCase() === status,
  );
}

export default function CampusMap() {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchingRef = useRef(false);

  const fetchItems = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const [lostData, foundData] = await Promise.all([
        apiClient.get(`${API_URL}/lost-items`),
        apiClient.get(`${API_URL}/found-items`),
      ]);

      if (!Array.isArray(lostData) || !Array.isArray(foundData)) {
        throw new Error("Unexpected item response.");
      }

      setLostItems(getActiveItems(lostData, "lost"));
      setFoundItems(getActiveItems(foundData, "found"));
      setError("");
    } catch (requestError) {
      if (
        axios.isCancel(requestError) ||
        requestError?.code === "ERR_CANCELED" ||
        requestError?.name === "CanceledError" ||
        requestError?.name === "AbortError"
      ) {
        return;
      }

      console.error("CampusMap fetch error:", requestError);
      const detail =
        requestError.response?.data?.error ||
        requestError.message ||
        "Network Error";
      setError(
        `Unable to load map items (${detail}). The server may still be waking up.`,
      );
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    fetchItems();

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible" && mounted) {
        fetchItems();
      }
    };

    const intervalId = window.setInterval(refreshWhenVisible, 15000);

    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [fetchItems]);

  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-mmsu-green">MMSU Campus Map</h2>

        <p className="mt-1 text-sm font-bold">
          🔴 Lost Items ({lostItems.length}) | 🟢 Found Items (
          {foundItems.length})
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Active reports refresh automatically every 15 seconds.
        </p>
      </div>

      {loading && (
        <p role="status" className="mb-3 text-sm text-gray-500">
          Loading map items...
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="mb-3 flex items-center justify-between rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError("");
              fetchingRef.current = false;
              fetchItems();
            }}
            className="ml-4 font-bold text-red-800 underline hover:no-underline whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      )}

      {!loading &&
        !error &&
        lostItems.length === 0 &&
        foundItems.length === 0 && (
          <p className="mb-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">
            No active lost or found reports to display.
          </p>
        )}

      <div
        style={{
          height: "max(360px, calc(100dvh - 220px))",
          width: "100%",
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid #d1d5db",
          isolation: "isolate",
        }}
      >
        <MapContainer
          center={[18.0583, 120.5446]}
          zoom={15}
          minZoom={10}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {lostItems.map((item) => {
            const position = getPosition(item);

            if (!position) return null;

            return (
              <Marker
                key={`lost-${item.id}`}
                position={position}
                icon={redIcon}
              >
                <Popup>
                  <strong>{item.title}</strong>
                  <br />
                  <span style={{ color: "red" }}>Status: Lost</span>
                  <br />
                  <Link to={`/items/lost/${item.id}`}>View Details</Link>
                </Popup>
              </Marker>
            );
          })}

          {foundItems.map((item) => {
            const position = getPosition(item);

            if (!position) return null;

            return (
              <Marker
                key={`found-${item.id}`}
                position={position}
                icon={greenIcon}
              >
                <Popup>
                  <strong>{item.title}</strong>
                  <br />
                  <span style={{ color: "green" }}>Status: Found</span>
                  <br />
                  <Link to={`/items/found/${item.id}`}>View Details</Link>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
