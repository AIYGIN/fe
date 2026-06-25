"use client";

import { useEffect } from "react";
import { PortfolioHoldingsTemplate } from "@/components/templates/PortfolioHoldings";
import { usePortfolio } from "@/hooks/portfolio/usePortfolio";

export function PortfolioHoldingsPage() {
  const portfolio = usePortfolio();

  useEffect(() => {
    void portfolio.load();
  }, [portfolio.load]);

  return (
    <PortfolioHoldingsTemplate onRetry={portfolio.load} state={portfolio} />
  );
}
