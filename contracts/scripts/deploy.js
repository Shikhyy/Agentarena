const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("🏟️  Deploying AgentArena Phase 2 contracts with:", deployer.address);
    console.log("   Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

    // 1. Deploy $ARENA Token
    console.log("1️⃣  Deploying ArenaToken...");
    const arenaToken = await hre.ethers.deployContract("ArenaToken", [deployer.address, deployer.address, deployer.address]);
    await arenaToken.waitForDeployment();
    const arenaTokenAddr = await arenaToken.getAddress();
    console.log("   ✅ ArenaToken:", arenaTokenAddr);

    // 2. Deploy Agent NFT
    console.log("2️⃣  Deploying AgentNFT...");
    const agentNFT = await hre.ethers.deployContract("AgentNFT");
    await agentNFT.waitForDeployment();
    const agentNFTAddr = await agentNFT.getAddress();
    console.log("   ✅ AgentNFT:", agentNFTAddr);

    // 3. Deploy Skill NFT
    console.log("3️⃣  Deploying SkillNFT...");
    const skillNFT = await hre.ethers.deployContract("SkillNFT");
    await skillNFT.waitForDeployment();
    const skillNFTAddr = await skillNFT.getAddress();
    console.log("   ✅ SkillNFT:", skillNFTAddr);

    // 4. Deploy ZKBettingPool (new: dual-token, Noir proof support)
    console.log("4️⃣  Deploying ZKBettingPool...");
    const zkBettingPool = await hre.ethers.deployContract("ZKBettingPool", [arenaTokenAddr, deployer.address]);
    await zkBettingPool.waitForDeployment();
    const zkBettingPoolAddr = await zkBettingPool.getAddress();
    console.log("   ✅ ZKBettingPool:", zkBettingPoolAddr);

    // 5. Deploy ResultOracle
    console.log("5️⃣  Deploying ResultOracle...");
    const oracle = await hre.ethers.deployContract("ResultOracle");
    await oracle.waitForDeployment();
    const oracleAddr = await oracle.getAddress();
    console.log("   ✅ ResultOracle:", oracleAddr);

    // 6. Wire up contracts
    console.log("\n🔗 Wiring up contracts...");

    // Oracle → BettingPool callback
    await oracle.setBettingPool(zkBettingPoolAddr);
    console.log("   ✅ ResultOracle.bettingPool =", zkBettingPoolAddr);

    // Register deployer as trusted judge for testing
    await oracle.setJudge(deployer.address, true);
    console.log("   ✅ Deployer set as trusted judge");

    // BettingPool resolver = ResultOracle
    await zkBettingPool.setGameResolver(oracleAddr);
    console.log("   ✅ ZKBettingPool.resolver = ResultOracle");

    // AgentNFT game engine = ZKBettingPool (for stats updates)
    await agentNFT.setGameEngine(zkBettingPoolAddr);
    console.log("   ✅ AgentNFT.gameEngine = ZKBettingPool");

    // Seed ZKBettingPool with ARENA tokens so it can pay out in ARENA
    const seedAmount = hre.ethers.parseEther("100000"); // 100k ARENA
    await arenaToken.transfer(zkBettingPoolAddr, seedAmount);
    console.log("   ✅ Seeded ZKBettingPool with 100,000 ARENA");

    console.log("\n🏟️  All Phase 2 contracts deployed and configured!");
    console.log("\n📋 Contract Addresses:");
    console.log("   ArenaToken:    ", arenaTokenAddr);
    console.log("   AgentNFT:      ", agentNFTAddr);
    console.log("   SkillNFT:      ", skillNFTAddr);
    console.log("   ZKBettingPool: ", zkBettingPoolAddr);
    console.log("   ResultOracle:  ", oracleAddr);

    // Export addresses for backend config
    const fs = require("fs");
    const addresses = {
        arenaToken: arenaTokenAddr,
        agentNFT: agentNFTAddr,
        skillNFT: skillNFTAddr,
        zkBettingPool: zkBettingPoolAddr,
        resultOracle: oracleAddr,
        network: hre.network.name,
        chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
        deployedAt: new Date().toISOString(),
    };
    fs.writeFileSync("./artifacts/deployed.json", JSON.stringify(addresses, null, 2));
    console.log("\n   📄 addresses saved to artifacts/deployed.json");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
