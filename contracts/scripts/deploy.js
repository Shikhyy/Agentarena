const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("🏟️  Deploying AgentArena contracts with:", deployer.address);
    console.log("   Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

    // 1. Deploy $ARENA Token
    console.log("1️⃣  Deploying ArenaToken...");
    const arenaToken = await hre.ethers.deployContract("ArenaToken", [deployer.address, deployer.address, deployer.address]);
    await arenaToken.waitForDeployment();
    console.log("   ✅ ArenaToken:", await arenaToken.getAddress());

    // 2. Deploy Agent NFT
    console.log("2️⃣  Deploying AgentNFT...");
    const agentNFT = await hre.ethers.deployContract("AgentNFT");
    await agentNFT.waitForDeployment();
    console.log("   ✅ AgentNFT:", await agentNFT.getAddress());

    // 3. Deploy Skill NFT
    console.log("3️⃣  Deploying SkillNFT...");
    const skillNFT = await hre.ethers.deployContract("SkillNFT");
    await skillNFT.waitForDeployment();
    console.log("   ✅ SkillNFT:", await skillNFT.getAddress());

    // 4. Deploy Betting Pool
    console.log("4️⃣  Deploying BettingPool...");
    const bettingPool = await hre.ethers.deployContract("BettingPool", [deployer.address]);
    await bettingPool.waitForDeployment();
    console.log("   ✅ BettingPool:", await bettingPool.getAddress());

    // 5. Configure
    console.log("\n🔗 Configuring...");
    await agentNFT.setGameEngine(await bettingPool.getAddress());
    await bettingPool.setGameResolver(deployer.address);

    console.log("\n🏟️  All contracts deployed successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
