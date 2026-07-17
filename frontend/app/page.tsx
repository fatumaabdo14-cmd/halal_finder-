"use client";
import { useState, useEffect, ComponentType } from "react";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("./Map"), { ssr: false }) as unknown as ComponentType<{
  restaurants: Restaurant[];
}>;

const API_URL = "https://6b0eilnz2k.execute-api.us-west-1.amazonaws.com/nearby";

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  distanceMiles: number;
  type: string;
  lat: number;
  lng: number;
};

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [status, setStatus] = useState("Getting your location...");
  const [cuisineFilter, setCuisineFilter] = useState<string>("All");

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

  const cuisines = [
    "All",
    ...Array.from(new Set(restaurants.map((r) => r.cuisine))),
  ];

  const filteredRestaurants =
    cuisineFilter === "All"
      ? restaurants
      : restaurants.filter((r) => r.cuisine === cuisineFilter);

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-emerald-900 sm:text-4xl">
            🕌 Halal Spots Near You
          </h1>
          <p className="mt-2 text-sm text-emerald-700">
            Restaurants and food trucks sorted by distance from you
          </p>
        </div>

        {status && (
          <div className="mb-6 rounded-xl bg-emerald-100 px-4 py-3 text-center text-sm font-medium text-emerald-800">
            {status}
          </div>
        )}

        {restaurants.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {cuisines.map((c) => (
              <button
                key={c}
                onClick={() => setCuisineFilter(c)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  cuisineFilter === c
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
<Map restaurants={filteredRestaurants} />
        <ul className="space-y-3">
          {filteredRestaurants.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-gray-900">{r.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {r.cuisine} · {r.address}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                  {r.distanceMiles} mi
                </span>
              </div>
              {r.type === "food_truck" && (
                <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                  Food truck
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
