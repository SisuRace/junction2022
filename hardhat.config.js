require("hardhat-circom");
require("@nomiclabs/hardhat-waffle");
require("hardhat-abi-exporter");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.6.11",
      },
      {
        version: "0.8.9",
      },
    ],
  },

  abiExporter: [
    {
      path: "./abi/pretty",
      pretty: true,
    },
    {
      path: "./abi/ugly",
      pretty: false,
    },
  ],
  circom: {
    inputBasePath: "./circuits",
    ptau: "https://hermezptau.blob.core.windows.net/ptau/powersOfTau28_hez_final_15.ptau",
    circuits: [
      // {
      //   name: "division",
      //   // No protocol, so it defaults to groth16
      // },
      // {
      //   name: "simple-polynomial",
      //   // Generate PLONK
      //   protocol: "plonk",
      // },
      // {
      //   name: "hash",
      //   // Explicitly generate groth16
      //   protocol: "groth16",
      // },
      {
        name: "challenge",
        // Explicitly generate groth16
        protocol: "groth16",
        wasm: "../server/lib/challenge.wasm",
        zkey: "../server/lib/challenge.zkey",
      },
    ],
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP || null,
    enabled: true,
  },
  networks: {
    hardhat: {
      chainId: 1337, // We set 1337 to make interacting with MetaMask simpler
    },
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/0AUUSGOu4aDcc_rM7GpLf7SBijwUOamc",
      chainId: 5,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },
};
