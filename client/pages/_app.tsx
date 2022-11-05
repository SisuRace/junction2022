import {
  connectorsForWallets,
  getDefaultWallets,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import type { AppProps } from "next/app";
import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import BackTop from "../components/BackTop";
import "../styles/globals.css";

const { chains, provider, webSocketProvider } = configureChains(
  [chain.goerli, chain.localhost],
  [
    alchemyProvider({
      apiKey: "0AUUSGOu4aDcc_rM7GpLf7SBijwUOamc",
    }),
    publicProvider(),
  ]
);

const { wallets } = getDefaultWallets({
  appName: "[Junction2022] SBT Mint Demo",
  chains,
});

const demoAppInfo = {
  appName: "[Junction2022] SBT Mint Demo",
};

const connectors = connectorsForWallets([...wallets]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider appInfo={demoAppInfo} chains={chains}>
        <Component {...pageProps} />
        <BackTop />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
