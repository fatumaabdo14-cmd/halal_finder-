"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import HalalLogin from "./components/HalalLogin";

const Map = dynamic(() => import("./Map"), { ssr: false });

const API_URL =
  "https://6b0e1lnz2k.execute-api.us-west-1.amazonaws.com/nearby";

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
        try {
          const { latitude, longitude } = position.coords;
          setStatus("Finding nearby halal spots...");

          const res = await fetch(
            `${API_URL}?lat=${latitude}&lng=${longitude}`
          );
          const data = await res.json();
          setRestaurants(data);
          setStatus("");
        } catch (error) {
          console.error('Failed to fetch restaurants:', error);
          setStatus("Could not fetch restaurants. Check your connection.");
        }
      },
      () => setStatus("Location access denied. Please enable it in your browser settings")
    );
  }, []);

  const filteredRestaurants =
    cuisineFilter === "All"
      ? restaurants
      : restaurants.filter((r) => r.cuisine === cuisineFilter);

  const cuisines = [
    "All",
    ...new Set(restaurants.map((r) => r.cuisine)),
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-white px-4 py-10 sm:px-6">
      <HalalLogin />

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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Map restaurants={filteredRestaurants} />
        </div>

        <div className="space-y-4">
          {filteredRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="rounded-lg border border-emerald-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <h3 className="font-semibold text-emerald-900">
                {restaurant.name}
              </h3>
              <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
              <p className="text-sm text-gray-500">{restaurant.address}</p>
              <p className="mt-2 text-sm font-medium text-emerald-600">
                {restaurant.distanceMiles.toFixed(1)} miles away
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
