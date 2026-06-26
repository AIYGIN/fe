import { css } from "../../../../../styled-system/css";

export type InvestmentDonutItem = {
  name: string;
  ratio: number;
  color: string;
};

type InvestmentDonutChartProps = {
  items: InvestmentDonutItem[];
  label?: string;
};

export function InvestmentDonutChart({
  items,
  label = "合計 100%",
}: InvestmentDonutChartProps) {
  const background = buildConicGradient(items);

  return (
    <div
      aria-label={label}
      className={chartClass}
      role="img"
      style={{ background }}
    >
      <div className={centerClass}>
        <span>合計</span>
        <strong>100%</strong>
      </div>
    </div>
  );
}

function buildConicGradient(items: InvestmentDonutItem[]): string {
  let start = 0;
  const stops = items.map((item) => {
    const end = start + Math.max(0, item.ratio);
    const stop = `${item.color} ${start}% ${end}%`;
    start = end;
    return stop;
  });

  if (start < 100) {
    stops.push(`#cbd5e1 ${start}% 100%`);
  }

  return `conic-gradient(${stops.join(", ")})`;
}

const chartClass = css({
  aspectRatio: "1 / 1",
  borderRadius: "999px",
  display: "grid",
  flexShrink: 0,
  placeItems: "center",
  position: "relative",
  w: { base: "148px", md: "176px" },
});

const centerClass = css({
  alignItems: "center",
  bg: "white",
  borderRadius: "999px",
  color: "#111827",
  display: "flex",
  flexDir: "column",
  fontSize: "13px",
  fontWeight: 700,
  h: "45%",
  justifyContent: "center",
  lineHeight: 1.25,
  w: "45%",
  "& strong": {
    fontSize: "18px",
    fontWeight: 800,
  },
});
