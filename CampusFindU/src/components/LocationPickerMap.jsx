import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polygon,
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

const mmsuPolygon = [
  [18.0673, 120.537],
  [18.0675, 120.54],
  [18.058, 120.551],
  [18.0535, 120.548],
  [18.055, 120.533],
  [18.062, 120.535],
];

function isPointInPolygon(point, vs) {
  let x = point[0],
    y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i][0],
      yi = vs[i][1];
    let xj = vs[j][0],
      yj = vs[j][1];
    let intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function LocationMarker({ position, setPosition, onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const isInside = isPointInPolygon([lat, lng], mmsuPolygon);

      if (!isInside) {
        alert("⚠️ Please drop the pin inside the MMSU Campus bounds!");
        return;
      }

      setPosition(e.latlng);
      onLocationSelect(lat, lng);
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

export default function LocationPickerMap({ onLocationSelect }) {
  const mmsuCenter = { lat: 18.0583, lng: 120.5446 };
  const [position, setPosition] = useState(mmsuCenter);

  const campusBounds = [
    [18.045, 120.53],
    [18.075, 120.56],
  ];

  return (
    <div style={{ height: "400px", width: "800px", marginBottom: "15px" }}>
      <MapContainer
        center={mmsuCenter}
        zoom={15}
        minZoom={15}
        maxBounds={campusBounds}
        maxBoundsViscosity={1.0}
        style={{ height: "100%", width: "100%", borderRadius: "8px" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polygon
          positions={mmsuPolygon}
          pathOptions={{ color: "black", weight: 3, fillOpacity: 0.1 }}
        />
        <LocationMarker
          position={position}
          setPosition={setPosition}
          onLocationSelect={onLocationSelect}
        />
      </MapContainer>
      <p style={{ fontSize: "12px", color: "gray", margin: "5px 0" }}>
        Click inside the black border to pin the location.
      </p>
    </div>
  );
}
