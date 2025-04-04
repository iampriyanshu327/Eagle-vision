import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import localities from '../constants/localities';
import { Player } from "@lottiefiles/react-lottie-player";

const ContentWithLottie = () => {
  return (
    <div className="flex items-center justify-center mb-8 space-x-8">
      {/* Lottie Animation */}
      <Player
        autoplay
        loop
        src="CCTV.json" // Replace with the actual path to your Lottie JSON file
        className="w-34 h-32"
      />

      {/* Content */}
      <div className="flex flex-col items-center text-center">


        {/* Paragraph */}
        <p className="text-gray-300 text-lg max-w-2xl mt-1">
        We showcast the video footage of nearest 6 CCTV Cameras to the Location of Vulnerability detected by using Eucledian Algorithm.
        </p>
      </div>
    </div>
  );
};

const NearestCCTVs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const { coordinates, locality } = state || { coordinates: null, locality: null };

  const parseCoordinates = (coordsString) => {
    if (coordsString) {
      return coordsString.split(",").map((coord) => parseFloat(coord.trim()));
    }
    return null;
  };

  const parsedCoordinates = parseCoordinates(coordinates);
  const locations = localities;

  const [nearestLocations, setNearestLocations] = useState([]);

  // YouTube video links
  const youtubeVideos = [
    "https://www.youtube.com/embed/5_XSYlAfJZM",
    "https://www.youtube.com/embed/1fiF7B6VkCk",
    "https://www.youtube.com/embed/B0YjuKbVZ5w",
    "https://www.youtube.com/embed/3LXQWU67Ufk",
    "https://www.youtube.com/embed/p0Qhe4vhYLQ",
    "https://www.youtube.com/embed/HpZAez2oYsA",
  ];

  useEffect(() => {
    if (!state || !parsedCoordinates || !locality) {
      console.error("Invalid state or missing data. Redirecting...");
      navigate("/");
    } else {
      const calculateDistance = ([lat1, lon1], [lat2, lon2]) => {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371; // Radius of Earth in kilometers
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      const sortedLocations = locations
        .map((loc) => ({
          ...loc,
          distance: calculateDistance(parsedCoordinates, loc.coordinates),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 6);

      setNearestLocations(sortedLocations);
    }
  }, [state, parsedCoordinates, locality, navigate]);

  if (!parsedCoordinates || !locality) {
    return <div className="text-center text-red-500 mt-10">Invalid or Missing Data</div>;
  }

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen">
      <header className="bg-gray-800 text-white text-center py-4 shadow-md">
        <h1 className="text-2xl font-bold">Nearest CCTV Access found at {locality || "Unknown Locality"}</h1>
        <p className="text-sm mt-2">
          Coordinates: {parsedCoordinates ? `${parsedCoordinates[0].toFixed(4)}, ${parsedCoordinates[1].toFixed(4)}` : "N/A"}
        </p>
      </header>

      <ContentWithLottie/>

      <div className="grid grid-cols-3 gap-6 p-4">
        {nearestLocations.map((location, index) => (
          <div
            key={location.locality}
            className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center"
          >
            <h3 className="text-lg font-semibold mb-2">{location.locality}</h3>
            <p className="text-sm mb-4">
              Coordinates: {location.coordinates[0].toFixed(4)}, {location.coordinates[1].toFixed(4)}
            </p>
            <div className="relative w-full h-64 bg-black">
            <iframe
  src={`${youtubeVideos[index]}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&modestbranding=1&rel=0`}
  className="object-cover w-full h-full"
  frameBorder="0"
  allow="autoplay; encrypted-media"
  allowFullScreen
  title={`video-${index}`}
></iframe>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NearestCCTVs;
