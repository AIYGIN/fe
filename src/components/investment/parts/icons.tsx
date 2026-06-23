import { css } from "../../../../styled-system/css";

export function SettingsIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 3.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H1.8a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 3.6 8a1.7 1.7 0 0 0-.34-1.88l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 8 3.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V1.8a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 3.6a1.7 1.7 0 0 0 1.88-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 8c.2.36.55.58 1 .6h.1a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <IconPath path="M21 21l-4.3-4.3m1.3-5.2a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
  );
}

export function CalendarIcon() {
  return (
    <IconPath path="M7 3v4m10-4v4M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
  );
}

export function ChevronIcon() {
  return <IconPath path="m9 18 6-6-6-6" />;
}

export function DownChevronIcon() {
  return <IconPath path="m6 9 6 6 6-6" />;
}

export function AlertIcon() {
  return (
    <IconPath
      path="M12 8v5m0 4h.01M10.3 4.5 2.8 18a1.5 1.5 0 0 0 1.3 2.2h15.8a1.5 1.5 0 0 0 1.3-2.2L13.7 4.5a2 2 0 0 0-3.4 0Z"
      color="#f97316"
    />
  );
}

export function InfoIcon() {
  return (
    <IconPath
      path="M12 17v-5m0-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      color="#2563eb"
    />
  );
}

export function SortIcon() {
  return <IconPath path="M8 6h12M4 6h.01M4 12h.01M4 18h.01M8 12h8M8 18h4" />;
}

export function FilterIcon() {
  return <IconPath path="M3 5h18l-7 8v5l-4 2v-7L3 5Z" />;
}

export function IconPath({
  path,
  color = "currentColor",
}: {
  path: string;
  color?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className={css({ flexShrink: "0" })}
    >
      <path
        d={path}
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
