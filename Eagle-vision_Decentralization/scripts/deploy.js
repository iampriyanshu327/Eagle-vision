// scripts/deploy.js
const hre = require("hardhat")

async function main() {
    const [deployer] = await hre.ethers.getSigners()

    console.log(
        "🚀 Deploying contracts with account:",
        await deployer.getAddress(),
    )

    const CrimeLifeCycle = await hre.ethers.getContractFactory("CrimeLifeCycle")
    const contract = await CrimeLifeCycle.deploy()
    await contract.waitForDeployment()

    console.log("✅ Contract deployed at:", await contract.getAddress())

    // === Call testLog() function
    const message = await contract.testLog()
    console.log("📝 testLog() says:", message)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error)
        process.exit(1)
    })
