import { css } from "../../../../styled-system/css";
import { IconPath } from "../shared";

export type SideNavigationItem = {
  label: string;
  href: string;
  icon: "portfolio" | "chart" | "shield" | "settings";
};

export function SideNavigation({
  items = defaultItems,
  currentHref = defaultItems[0].href,
}: {
  items?: SideNavigationItem[];
  currentHref?: string;
}) {
  return (
    <nav
      aria-label="サイドメニュー"
      className={css({
        w: "44",
        borderRight: "1px solid token(colors.investment-border)",
        bg: "white",
      })}
    >
      {items.map((item) => {
        const current = item.href === currentHref;

        return (
          <a
            aria-current={current ? "page" : undefined}
            className={css({
              display: "flex",
              alignItems: "center",
              gap: "3",
              px: "5",
              py: "3",
              color: current ? "investment-blue" : "investment-text",
              bg: current ? "#f8fafc" : "white",
              fontSize: "sm",
              fontWeight: "800",
              textDecoration: "none",
            })}
            href={item.href}
            key={item.href}
          >
            <NavIcon name={item.icon} active={current} />
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}

const defaultItems: SideNavigationItem[] = [
  { icon: "portfolio", label: "Portfolio", href: "/portfolio" },
  { icon: "chart", label: "ETF比較", href: "/etf" },
  { icon: "shield", label: "高配当分析", href: "/dividend" },
  { icon: "settings", label: "設定", href: "/settings" },
];

function NavIcon({
  name,
  active,
}: {
  name: SideNavigationItem["icon"];
  active: boolean;
}) {
  const paths: Record<SideNavigationItem["icon"], string> = {
    portfolio:
      "M8 21h8M12 17v4M7 4h10v9a5 5 0 0 1-10 0V4Zm-3 2h3v4H5a2 2 0 0 1-2-2V6Zm14 0h3v2a2 2 0 0 1-2 2h-1V6Z",
    chart: "M4 19V9m5 10V5m5 14v-7m5 7V8",
    shield: "M12 3 5 6v5c0 4.4 2.8 8.3 7 10 4.2-1.7 7-5.6 7-10V6l-7-3Z",
    settings:
      "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-3h2M3 12h2m12.1 5.1 1.4 1.4M5.5 5.5l1.4 1.4m0 10.2-1.4 1.4M18.5 5.5l-1.4 1.4",
  };

  return (
    <span
      className={css({
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        w: "6",
        h: "6",
        rounded: "md",
        bg: active ? "investment-blue" : "transparent",
        color: active ? "white" : "#32405a",
      })}
    >
      <IconPath path={paths[name]} />
    </span>
  );
}
