const { ethers } = require("ethers");
const Alert = require("../models/Alert");
const crypto = require("crypto");

// Replace with your actual provider URL (Infura, Alchemy, or a local node)
const provider = new ethers.JsonRpcProvider("https://open-campus-codex-sepolia.drpc.org");

// Replace with your deployed contract address and ABI
const contractAddress = "0x8B726b227cA85476739C9FB3105441C7425EB830";
const contractABI = [
  "function createCase(string,string,string) public",
];

// Use a wallet with signing capabilities (private key must be securely stored)
const wallet = new ethers.Wallet("f6139f06404e7d9412393021143327953af37436f972f4ab2fb9815819991188", provider);
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

const generateVideoHash = (url) => {
  return crypto.createHash("sha256").update(url).digest("hex");
};

const createCase = async (alert) => {
  if (alert.createdContract === "false") {
    const videoHash = generateVideoHash(alert.footageUrl);
    const dateTimeString = `${alert.anomalyDate} ${alert.anomalyTime}`;

    try {
      console.log("🚨 Creating a new case on the blockchain...");
      const tx = await contract.createCase(alert.location, videoHash, dateTimeString);
      await tx.wait(); // Wait for transaction to be mined
      console.log("✅ Case created successfully!");

      // Update the alert to mark it as processed
      await Alert.updateOne({ _id: alert._id }, { createdContract: true });
    } catch (error) {
      console.error("❌ Error creating case on blockchain:", error);
    }
  }
};

const checkAlerts = async () => {
  try {
    const latestAlert = await Alert.findOne({ createdContract: false }).sort({ createdAt: -1 });
    if (latestAlert) {
      await createCase(latestAlert);
    }
  } catch (error) {
    console.error("Error checking alerts:", error);
  }
};

module.exports = { checkAlerts };
