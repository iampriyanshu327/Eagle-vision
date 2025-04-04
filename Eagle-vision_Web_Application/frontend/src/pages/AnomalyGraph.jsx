import React, { useState } from "react";
import AnimatedGraph from "./AnimatedGraph"; // Assuming it's saved as AnimatedGraph.js
import { motion } from "framer-motion";
import { FiRefreshCcw } from "react-icons/fi";

const AnomalyGraph = () => {
  const [showGraph, setShowGraph] = useState(false);

  const toggleGraphDisplay = () => {
    setShowGraph(!showGraph);
  };

  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 min-h-screen">
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Your Content Here */}
          <motion.button
            onClick={toggleGraphDisplay}
            className="bg-blue-500 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition duration-300"
            whileHover={{ scale: 1.1 }}
          >
            <FiRefreshCcw size={24} />
            {showGraph ? "Hide Graph" : "Show Graph"}
          </motion.button>

          {showGraph && <AnimatedGraph />}
        </motion.div>
      </main>
    </div>
  );
};

export default AnomalyGraph;
