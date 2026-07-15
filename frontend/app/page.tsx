"use client";
import { useState, useEffect } from "react";

const API_URL = "https://6b0eilnz2k.execute-api.us-west-1.amazonaws.com/nearby";

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  distanceMiles: number;
  type: string;
};

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [status, setStatus] = useState("Getting your location...");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setStatus("Finding nearby halal spots...");

        const res = await fetch(`${API_URL}?lat=${latitude}&lng=${longitude}`);
        const data = await res.json();
        setRestaurants(data);
        setStatus("");
      },
      () => setStatus("Location access denied. Please enable it in your browser settings.")
    );
  }, []);

  return (
    <main style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>Halal Spots Near You</h1>
      {status && <p>{status}</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {restaurants.map((r) => (
          <li
            key={r.id}
            style={{
              padding: "12px",
              marginBottom: "8px",
              border: "1px solid #ddd",
              borderRadius: "8px",
            }}
          >
            <strong>{r.name}</strong> — {r.distanceMiles} mi
            <br />
            <span style={{ color: "#666" }}>{r.cuisine} · {r.address}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}