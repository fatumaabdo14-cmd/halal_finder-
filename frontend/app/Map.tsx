"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Restaurant } from "./page";

const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function Map({ restaurants }: { restaurants: Restaurant[] }) {
  const center: [number, number] = restaurants.length
    ? [restaurants[0].lat, restaurants[0].lng]
    : [34.05, -118.24];

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: 320, borderRadius: 16 }}
      className="mb-6"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {restaurants.map((r) => (
        <Marker key={r.id} position={[r.lat, r.lng]} icon={icon}>
          <Popup>
            <strong>{r.name}</strong>
            <br />
            {r.cuisine}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
