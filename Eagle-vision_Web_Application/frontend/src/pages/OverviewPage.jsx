import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Camera,
  CameraOff,
  Cctv,
  CheckCircle,
  Zap,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { FiRefreshCcw } from "react-icons/fi";
import { FaEdit } from "react-icons/fa";
import StatCard from "../components/common/StatCard";
import AlertOverviewChart from "../components/overview/AlertOverviewChart";
import CategoryDistributionChart from "../components/overview/CategoryDistributionChart";
import SalesChannelChart from "../components/overview/AlertSourcesChart";
import dashboardStats from "../../../backend/data/dashboardStats.json";
import { Player } from "@lottiefiles/react-lottie-player";

const OverviewPage = () => {
  const [stats, setStats] = useState(dashboardStats);
  const [isEditing, setIsEditing] = useState(false);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);    

  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask not detected. Please install it.");
  
    setIsLoading(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const providerInstance = new ethers.BrowserProvider(window.ethereum);
      const balance = await providerInstance.getBalance(accounts[0]);
  
      setAccount(accounts[0]);
      setBalance(ethers.formatEther(balance));
  
      localStorage.setItem("walletAccount", accounts[0]); // Save to localStorage
      localStorage.setItem("walletBalance", ethers.formatEther(balance));
    } catch (err) {
      console.error("Connection error:", err);
      alert("Connection Failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedAccount = localStorage.getItem("walletAccount");
    const savedBalance = localStorage.getItem("walletBalance");
    if (savedAccount) {
      setAccount(savedAccount);
      setBalance(savedBalance);
    }
  }, []);
  

  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Pulse animation for title
  const pulseTitleVariants = {
    initial: { textShadow: "0 0 8px rgba(66, 153, 225, 0)" },
    animate: { 
      textShadow: [
        "0 0 8px rgba(66, 153, 225, 0)",
        "0 0 15px rgba(66, 153, 225, 0.7)",
        "0 0 8px rgba(66, 153, 225, 0)"
      ],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        repeatType: "loop"
      }
    }
  };

  function getFirstFourDecimalDigits(num) {
    let decimalPart = num.toString().split('.')[1] || '0000'; // Get decimal part or default to '0000'
    decimalPart = (decimalPart + '0000').substring(0, 4); // Ensure at least 4 digits
    return `0.${decimalPart}`;
}

  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 min-h-screen">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-60 -left-60 w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-purple-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-64 h-64 bg-cyan-500 opacity-10 rounded-full blur-3xl"></div>
      </div>

      {/* Top Bar */}
      <div className="flex justify-between items-center p-5 bg-gray-800/80 backdrop-blur-sm shadow-lg border-b border-gray-700 sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <motion.div
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="bg-blue-500 p-2 rounded-lg shadow-lg"
          >
            <Cctv className="h-6 w-6 text-white" />
          </motion.div>
          <motion.h1 
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300"
            variants={pulseTitleVariants}
            initial="initial"
            animate="animate"
          >
            Eagle Vision Dashboard
          </motion.h1>
        </div>
        <div className="flex items-center space-x-4">
          {account ? (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-700/90 text-white p-3 rounded-lg border border-gray-600 shadow-xl flex flex-col items-center"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-xs font-semibold text-green-400">Connected</p>
              </div>
              <p className="text-sm">{account.slice(0, 6)}...{account.slice(-4)}</p>
              <p className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-green-300 to-blue-300">
                {getFirstFourDecimalDigits(balance)} EDU
              </p>
            </motion.div>
          ) : (
            <motion.button
              onClick={connectWallet}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg shadow-lg border border-blue-400/30"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <FiRefreshCcw className="h-4 w-4" />
                  </motion.div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <Zap className="mr-2 h-4 w-4" />
                  <span>Connect Wallet</span>
                </div>
              )}
            </motion.button>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8 relative z-10">
        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12 mt-5"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {stats.map((stat, index) => {
            const icons = {
              "Total Alerts Today": Zap,
              "Resolved Alerts": CheckCircle,
              "Pending Alerts": AlertTriangle,
              "Critical Alerts": AlertOctagon,
              "Total Cameras": Cctv,
              "Active Cameras": Camera,
              "Offline Cameras": CameraOff,
              "Cameras with Active Alerts": AlertCircle,
            };

            const Icon = icons[stat.name] || Zap;
            
            // Different colors for different card types
            const getCardStyle = () => {
              if (stat.name.includes("Critical") || stat.name.includes("Offline")) {
                return "bg-gradient-to-br from-gray-700/90 to-gray-800/90 border-red-500/30";
              } else if (stat.name.includes("Resolved") || stat.name.includes("Active")) {
                return "bg-gradient-to-br from-gray-700/90 to-gray-800/90 border-green-500/30";
              } else if (stat.name.includes("Pending")) {
                return "bg-gradient-to-br from-gray-700/90 to-gray-800/90 border-yellow-500/30";
              } else {
                return "bg-gradient-to-br from-gray-700/90 to-gray-800/90 border-blue-500/30";
              }
            };

            return (
              <motion.div
                key={index}
                className={`relative p-5 rounded-xl backdrop-blur-sm shadow-xl border ${getCardStyle()}`}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                  transition: { duration: 0.2 }
                }}
              >
                <StatCard name={stat.name} icon={Icon} value={stat.value} />
                
                {/* Subtle background glow effect */}
                <div className="absolute inset-0 -z-10 rounded-xl overflow-hidden">
                  <div className="absolute -inset-x-1/2 -bottom-1/2 w-full h-40 bg-blue-500/10 blur-3xl"></div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Charts Section with animations */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.div 
            className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl overflow-hidden"
            whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)" }}
          >
            <AlertOverviewChart />
          </motion.div>
          
          <motion.div 
            className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl overflow-hidden"
            whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)" }}
          >
            <CategoryDistributionChart />
          </motion.div>
          
          <motion.div 
            className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl overflow-hidden lg:col-span-2"
            whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)" }}
          >
            <SalesChannelChart />
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default OverviewPage;