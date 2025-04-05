import { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Sidebar from "./components/common/Sidebar";
import OverviewPage from "./pages/OverviewPage";
import AlertsPage from "./pages/AlertsPage";
import UsersPage from "./pages/UsersPage";
import SettingsPage from "./pages/SettingsPage";
import NearestCCTVs from "./pages/NearestCCTVs";
import NotifyPage from "./pages/NotifyPage";
import ChatBotPage from "./pages/ChatBotPage";
import AnomalyGraph from "./pages/AnomalyGraph";
import CaseMapPage from "./pages/CaseMapPage";
import Testing from "./pages/Testing";

function App() {
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    // Remove the animation after 3 seconds
    const timer = setTimeout(() => setShowAnimation(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {showAnimation ? (
        <div className="flex items-center justify-center w-full h-full bg-gray-800 text-gray-200">
          <div className="text-center animate-fade-in">
            {/* Logo */}
            <img
              src="etherium.png" // Replace with your logo path
              alt="Program Logo"

              className="w-60 h-60 mx-auto mb-4"
            />
            {/* Glowing Text */}
            <h1 className="text-5xl font-bold mb-2 text-white animate-highlight">
              Eagle Vision
            </h1>
            <h2 className="text-2xl font-semibold text-green-300 animate-slide-in-delay">
            Decentralized Gen-AI based CCTV Surveillance and Protection
            </h2>
          </div>
        </div>
      ) : (
        <>
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/case-statistics" element={<UsersPage />} />
              <Route path="/notify" element={<NotifyPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/nearest-cctvs" element={<NearestCCTVs />} />
              <Route path="/chatbot" element={<ChatBotPage />} />
              <Route path="/anomalygraph" element={<AnomalyGraph />} />
              <Route path="/casemap" element={<CaseMapPage />} />
              <Route path="/testing" element={<Testing />} />
            </Routes>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
