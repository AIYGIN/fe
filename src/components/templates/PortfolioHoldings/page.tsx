"use client";

import { useEffect } from "react";

import { usePortfolio } from "@/hooks/portfolio/usePortfolio";
import { PortfolioStoreProvider } from "@/stores/portfolio/provider";

import { PortfolioHoldingsTemplate } from ".";

export function PortfolioHoldingsPage() {
  return (
    <PortfolioStoreProvider>
      <PortfolioHoldingsPageContent />
    </PortfolioStoreProvider>
  );
}

function PortfolioHoldingsPageContent() {
  const portfolio = usePortfolio();
  const load = usePortfolio((state) => state.load);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <PortfolioHoldingsTemplate onRetry={portfolio.load} state={portfolio} />
  );
}
