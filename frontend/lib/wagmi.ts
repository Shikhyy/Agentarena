import { http, createConfig } from "wagmi";
import { polygon, polygonAmoy, hardhat } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

// WalletConnect project ID - replace with your own for production
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID || "";

export const wagmiConfig = createConfig({
  chains: [polygon, polygonAmoy, hardhat],
  connectors: [
    injected(),
    ...(WC_PROJECT_ID
      ? [walletConnect({ projectId: WC_PROJECT_ID })]
      : []),
  ],
  transports: {
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
