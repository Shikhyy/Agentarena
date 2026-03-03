require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: "0.8.28",
        settings: {
            evmVersion: "cancun",
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        hardhat: {},
        polygon: {
            url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
            accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : [],
            chainId: 137,
        },
        polygonAmoy: {
            url: process.env.POLYGON_AMOY_RPC || "https://rpc-amoy.polygon.technology",
            accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : [],
            chainId: 80002,
        },
    },
    etherscan: {
        apiKey: process.env.POLYGONSCAN_KEY || "",
    },
};
