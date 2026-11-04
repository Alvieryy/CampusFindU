import { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Search,
  PackageCheck,
  MapPin,
  Clock,
  RefreshCw,
  ArrowRight,
  Layers,
  Tag,
} from "lucide-react";
import apiClient from "../utils/apiClient";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const API_URL = "https://campusfindu-backend.onrender.com/api";

const lostMarkerIcon = L.divIcon({
  className: "custom-map-pin",
  iconSize: [36, 42],
  iconAnchor: [18, 42],
  popupAnchor: [0, -42],
  html: `
    <div style="position:relative; width:36px; height:42px; display:flex; flex-direction:column; align-items:center; filter:drop-shadow(0 4px 6px rgba(225,29,72,0.35)); cursor:pointer;">
      <div style="width:36px; height:36px; border-radius:50%; background:#e11d48; display:flex; align-items:center; justify-content:center; border:2.5px solid #ffffff;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </svg>
      </div>
      <div style="width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:8px solid #e11d48; margin-top:-2px;"></div>
    </div>
  `,
});

const foundMarkerIcon = L.divIcon({
  className: "custom-map-pin",
  iconSize: [36, 42],
  iconAnchor: [18, 42],
  popupAnchor: [0, -42],
  html: `
    <div style="position:relative; width:36px; height:42px; display:flex; flex-direction:column; align-items:center; filter:drop-shadow(0 4px 6px rgba(5,150,105,0.35)); cursor:pointer;">
      <div style="width:36px; height:36px; border-radius:50%; background:#059669; display:flex; align-items:center; justify-content:center; border:2.5px solid #ffffff;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 6 9 17l-5-5"></path>
        </svg>
      </div>
      <div style="width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:8px solid #059669; margin-top:-2px;"></div>
    </div>
  `,
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
  const [activeFilter, setActiveFilter] = useState("all");
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

  const showLost = activeFilter === "all" || activeFilter === "lost";
  const showFound = activeFilter === "all" || activeFilter === "found";

  return (
    <div style={{ width: "100%", minWidth: 0 }}>
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-mmsu-green flex items-center gap-2">
            <MapPin className="w-6 h-6 text-mmsu-green" />
            MMSU Campus Map
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>Active reports refresh automatically every 15 seconds</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setError("");
            fetchingRef.current = false;
            fetchItems();
          }}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 text-gray-500 ${loading ? "animate-spin" : ""}`}
          />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
        <button
          type="button"
          onClick={() =>
            setActiveFilter(activeFilter === "lost" ? "all" : "lost")
          }
          className={`bg-white p-4 rounded-2xl border text-left transition shadow-sm hover:shadow-md cursor-pointer flex items-center justify-between ${
            activeFilter === "lost"
              ? "border-rose-500 ring-2 ring-rose-100"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Lost Items
              </span>
              {activeFilter === "lost" && (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                  Filtered
                </span>
              )}
            </div>
            <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">
              {lostItems.length}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Active reports</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <Search className="w-6 h-6" />
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveFilter(activeFilter === "found" ? "all" : "found")
          }
          className={`bg-white p-4 rounded-2xl border text-left transition shadow-sm hover:shadow-md cursor-pointer flex items-center justify-between ${
            activeFilter === "found"
              ? "border-emerald-500 ring-2 ring-emerald-100"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Found Items
              </span>
              {activeFilter === "found" && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Filtered
                </span>
              )}
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
              {foundItems.length}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Ready for claim</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <PackageCheck className="w-6 h-6" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={`bg-white p-4 rounded-2xl border text-left transition shadow-sm hover:shadow-md cursor-pointer flex items-center justify-between ${
            activeFilter === "all"
              ? "border-mmsu-green ring-2 ring-green-100"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Total Pinned
              </span>
              {activeFilter === "all" && (
                <span className="text-[10px] font-bold text-mmsu-green bg-green-50 px-1.5 py-0.5 rounded">
                  Showing All
                </span>
              )}
            </div>
            <p className="text-2xl sm:text-3xl font-black text-mmsu-green mt-1">
              {lostItems.length + foundItems.length}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Campus locations</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 text-mmsu-green flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
        </button>
      </div>

      {loading && (
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
          <RefreshCw className="w-4 h-4 animate-spin text-mmsu-green" />
          <span>Loading map items...</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-3 flex items-center justify-between rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-sm text-rose-700"
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
            className="ml-4 font-bold text-rose-800 underline hover:no-underline whitespace-nowrap cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {!loading &&
        !error &&
        lostItems.length === 0 &&
        foundItems.length === 0 && (
          <p className="mb-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-sm text-emerald-800">
            No active lost or found reports to display.
          </p>
        )}

      <div
        style={{
          height: "max(360px, calc(100dvh - 300px))",
          width: "100%",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #e5e7eb",
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

          {showLost &&
            lostItems.map((item) => {
              const position = getPosition(item);

              if (!position) return null;

              return (
                <Marker
                  key={`lost-${item.id}`}
                  position={position}
                  icon={lostMarkerIcon}
                >
                  <Popup>
                    <div className="p-1 min-w-[200px] max-w-[260px] font-sans">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <Search className="w-3 h-3 text-rose-600" />
                          Lost Item
                        </span>
                        {item.category && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 font-medium truncate max-w-[110px]">
                            <Tag className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate">{item.category}</span>
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-gray-900 text-sm mb-1.5 line-clamp-1">
                        {item.title}
                      </h4>

                      {item.location_name && (
                        <p className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{item.location_name}</span>
                        </p>
                      )}

                      {item.image_url && (
                        <div className="w-full h-24 mb-2.5 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <Link
                        to={`/items/lost/${item.id}`}
                        className="inline-flex items-center justify-center gap-1.5 w-full rounded-lg bg-mmsu-green px-3 py-1.5 text-xs font-bold text-white hover:bg-mmsu-light-green transition shadow-sm"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

          {showFound &&
            foundItems.map((item) => {
              const position = getPosition(item);

              if (!position) return null;

              return (
                <Marker
                  key={`found-${item.id}`}
                  position={position}
                  icon={foundMarkerIcon}
                >
                  <Popup>
                    <div className="p-1 min-w-[200px] max-w-[260px] font-sans">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <PackageCheck className="w-3 h-3 text-emerald-600" />
                          Found Item
                        </span>
                        {item.category && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 font-medium truncate max-w-[110px]">
                            <Tag className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate">{item.category}</span>
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-gray-900 text-sm mb-1.5 line-clamp-1">
                        {item.title}
                      </h4>

                      {item.location_name && (
                        <p className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{item.location_name}</span>
                        </p>
                      )}

                      {item.image_url && (
                        <div className="w-full h-24 mb-2.5 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <Link
                        to={`/items/found/${item.id}`}
                        className="inline-flex items-center justify-center gap-1.5 w-full rounded-lg bg-mmsu-green px-3 py-1.5 text-xs font-bold text-white hover:bg-mmsu-light-green transition shadow-sm"
                      >
                        <span>View Details & Claim</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>
    </div>
  );
}
