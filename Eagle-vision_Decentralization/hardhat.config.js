require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const EDUCHAIN_RPC_URL = process.env.EDUCHAIN_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.19",
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
        },
        educhain: {
            url: EDUCHAIN_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 656476,
        },
    },
    etherscan: {
        apiKey: {
            sepolia: ETHERSCAN_KEY,
        },
    },
}
