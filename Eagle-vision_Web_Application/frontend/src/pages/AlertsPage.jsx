import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiMapPin, FiCamera, FiBell, FiTrash2, FiX, FiAlertCircle } from "react-icons/fi";
import Header from "../components/common/Header";
import { useNavigate } from "react-router-dom";
import { Player } from "@lottiefiles/react-lottie-player";
import { ChartNetworkIcon, Network } from "lucide-react";

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [showFootage, setShowFootage] = useState(false);
  const [videoSrc, setVideoSrc] = useState(null);

  const navigate = useNavigate();

  const fetchAlerts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/alerts/fetch-alerts");
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const handleLocateAnomaly = (alert) => {
    if (!alert.coordinates) {
      alert("Coordinates not available for this alert.");
      return;
    }
    const [lat, lng] = alert.coordinates.split(",").map(Number);
    if (isNaN(lat) || isNaN(lng)) {
      alert("Invalid coordinates format.");
      return;
    }
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    setSelectedAlert({ ...alert, googleMapsUrl });
    setShowMap(true);
  };

  const handleViewNearestCCTV = (coordinates, locality) => {
    navigate("/nearest-cctvs", {
      state: { coordinates, locality },
    });
  };


  const handleDeleteAlert = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/alerts/delete-alerts/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert._id !== id));
        alert("Alert deleted successfully");
        setShowPopup(false);
      } else {
        alert("Failed to delete alert");
      }
    } catch (error) {
      console.error("Error deleting alert:", error);
    }
  };

  const handlePopupOpen = (alert) => {
    setSelectedAlert(alert);
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setSelectedAlert(null);
    setShowMap(false);
    setShowFootage(false);
  };

  const handleFootageView = (footageUrl) => {
    if (footageUrl) {
      setVideoSrc(footageUrl);
      setShowFootage(true);
    } else {
      alert("Footage URL is not available.");
    }
  };
  // const handleFootageView = async (footageUrl) => {
  //   try {
  //     // Make a request to Flask to fetch the video stream using the footage URL
  //     const response = await fetch(`http://127.0.0.1:5000/stream/${footageUrl}`);
  //     if (response.ok) {
  //       // Get the video blob from the response
  //       const videoBlob = await response.blob();
  //       // Create a URL for the video blob
  //       const videoUrl = URL.createObjectURL(videoBlob);
  //       // Update state with the new video URL
  //       setVideoSrc(videoUrl);
  //       setShowFootage(true);
  //     } else {
  //       alert("Failed to fetch footage.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching footage:", error);
  //   }
  // };
  

  return (
    <div className="flex-1 overflow-auto relative bg-gradient-to-br from-gray-800 via-gray-900 to-black text-gray-100 min-h-screen">
      <Header title="Alerts" />
      <div className="flex flex-col items-center justify-center py-10">
        <Player autoplay loop src="Emergency.json" className="w-48 h-48" />
        <p className="text-center text-gray-300 text-lg max-w-xl mt-4">
          The vulnerability detected through our S3R Deep Learning Model is displayed here. The Alerts are encrypted through Blockchain and decrypted to showcast here.  Click on an alert to view details.
        </p>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {alerts.length === 0 ? (
          <p className="text-center text-gray-300">No alerts available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {alerts.map((alert) => (
              <div
                key={alert._id}
                className="relative bg-red-600 p-5 rounded-lg shadow-lg hover:shadow-2xl hover:bg-red-500 transition-all transform hover:scale-105 cursor-pointer"
                onClick={() => handlePopupOpen(alert)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-transparent opacity-40 rounded-lg blur-md"></div>
                <div className="relative z-10 flex items-center">
                  <FiAlertCircle size={28} className="text-white mr-4" />
                  <h3 className="text-white font-bold">Alert Received at {alert.anomalyTime}</h3>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default AlertsPage;
