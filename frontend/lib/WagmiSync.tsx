"use client";

/**
 * WagmiSync — bridges wagmi connection state into the Zustand walletStore
 * so that BalanceBar, and other non-wagmi components stay in sync.
 */

import { useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { useWalletStore } from "@/lib/stores/walletStore";

export function WagmiSync() {
  const { address, isConnected, isConnecting, chainId } = useAccount();
  const { setConnected, setDisconnected, setConnecting, setBalances } =
    useWalletStore();

  const { data: nativeBalance } = useBalance({
    address: isConnected ? address : undefined,
  });

  // Sync connection state
  useEffect(() => {
    if (isConnected && address && chainId) {
      setConnected(address, chainId);
    } else if (!isConnected && !isConnecting) {
      setDisconnected();
    }
  }, [isConnected, isConnecting, address, chainId, setConnected, setDisconnected]);

  // Sync connecting flag
  useEffect(() => {
    setConnecting(isConnecting);
  }, [isConnecting, setConnecting]);

  // Sync native balance
  useEffect(() => {
    if (nativeBalance) {
      const formatted = (
        Number(nativeBalance.value) / 10 ** nativeBalance.decimals
      ).toFixed(4);
      // Polygon uses MATIC; other chains use ETH
      if (chainId === 137 || chainId === 80002) {
        setBalances({ matic: formatted });
      } else {
        setBalances({ eth: formatted });
      }
    }
  }, [nativeBalance, chainId, setBalances]);

  return null;
}
