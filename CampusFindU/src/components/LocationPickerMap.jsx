import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition, onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      onLocationSelect(lat, lng);
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

export default function LocationPickerMap({ onLocationSelect }) {
  const mmsuCenter = { lat: 18.0583, lng: 120.5446 };
  const [position, setPosition] = useState(mmsuCenter);

  return (
    <div style={{ height: "400px", width: "100%", maxWidth: "800px", marginBottom: "15px" }}>
      <MapContainer
        center={mmsuCenter}
        zoom={15}
        minZoom={10}
        style={{ height: "100%", width: "100%", borderRadius: "8px" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          position={position}
          setPosition={setPosition}
          onLocationSelect={onLocationSelect}
        />
      </MapContainer>
      <p style={{ fontSize: "12px", color: "gray", margin: "5px 0" }}>
        Click anywhere on the map to pin the location.
      </p>
    </div>
  );
}
