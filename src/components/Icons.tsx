import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconFolderOpen(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2 4.5V12a1 1 0 001 1h10a1 1 0 001-1V6.5a1 1 0 00-1-1H7.5L6 4H3a1 1 0 00-1 1z" />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14" />
    </svg>
  );
}

export function IconX(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <svg {...base} {...props} strokeWidth={2}>
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

export function IconSidebar(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="1.5" y="2" width="13" height="12" rx="1.5" />
      <path d="M5.5 2v12" />
    </svg>
  );
}

export function IconMoon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M13.5 8.5a5.5 5.5 0 11-6-6 4.5 4.5 0 006 6z" />
    </svg>
  );
}

export function IconSun(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1.5v1M8 13.5v1M2.7 2.7l.7.7M12.6 12.6l.7.7M1.5 8h1M13.5 8h1M2.7 13.3l.7-.7M12.6 3.4l.7-.7" />
    </svg>
  );
}

export function IconChevronUp(props: IconProps) {
  return (
    <svg {...base} {...props} strokeWidth={2}>
      <path d="M4 10l4-4 4 4" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...base} {...props} strokeWidth={2}>
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

export function IconFile(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 1.5H4a1 1 0 00-1 1v11a1 1 0 001 1h8a1 1 0 001-1V5.5L9 1.5z" />
      <path d="M9 1.5V5.5h4" />
    </svg>
  );
}

export function IconBraces(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5.5 2C4.67 2 4 2.67 4 3.5v2c0 .83-.67 1.5-1.5 1.5.83 0 1.5.67 1.5 1.5v2c0 .83.67 1.5 1.5 1.5" />
      <path d="M10.5 2c.83 0 1.5.67 1.5 1.5v2c0 .83.67 1.5 1.5 1.5-.83 0-1.5.67-1.5 1.5v2c0 .83-.67 1.5-1.5 1.5" />
    </svg>
  );
}

export function IconCode(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 4L1 8l4 4" />
      <path d="M11 4l4 4-4 4" />
    </svg>
  );
}

export function IconText(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 3.5h11M2.5 6.5h8M2.5 9.5h10M2.5 12.5h6" />
    </svg>
  );
}

export function IconTree(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2 3h4M2 8h4M2 13h4" />
      <path d="M8 5h6M8 10h6" />
      <path d="M4 3v10" />
      <path d="M4 5h2M4 10h2" />
    </svg>
  );
}

export function IconSpinner() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" className="animate-spin">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}


export function IconWrap(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 4h11" />
      <path d="M2.5 8h11" />
      <path d="M2.5 12h7" />
      <path d="M9.5 10l2 2-2 2" />
    </svg>
  );
}

export function IconScrollH(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2 8h12" />
      <path d="M2 8l2.5-2.5M2 8l2.5 2.5" />
      <path d="M14 8l-2.5-2.5M14 8l-2.5 2.5" />
    </svg>
  );
}

export function IconExpandAll(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 3v10h10" />
      <path d="M6 6l2 2 2-2" />
      <path d="M6 9l2 2 2-2" />
    </svg>
  );
}

export function IconCollapseAll(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 3v10h10" />
      <path d="M6 8l2-2 2 2" />
      <path d="M6 11l2-2 2 2" />
    </svg>
  );
}

export function IconCopy(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="5" width="8" height="8" rx="1" />
      <path d="M3 11V3.5A.5.5 0 013.5 3H11" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base} {...props} strokeWidth={2}>
      <path d="M3 8.5l3 3 7-7" />
    </svg>
  );
}

export function IconEye(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" />
      <circle cx="8" cy="8" r="2" fill="currentColor" />
    </svg>
  );
}

export function IconEyeOff(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 3.5l9 9" />
      <path d="M10.7 10.7A4.5 4.5 0 015.3 5.3" />
      <path d="M14.5 8s-2.5 4.5-6.5 4.5a6.5 6.5 0 01-2-.3" />
      <path d="M1.5 8s2.5-4.5 6.5-4.5c.7 0 1.4.1 2 .3" />
    </svg>
  );
}

export function IconFormat(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" />
      <path d="M5 5h6M5 8h4M5 11h2" />
    </svg>
  );
}
export function IconPaste(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="2.5" width="8" height="9" rx="1" />
      <path d="M5.5 2.5V1.5a.5.5 0 01.5-.5h4a.5.5 0 01.5.5v1" />
      <path d="M5.5 5.5h5M5.5 8.5h5" />
    </svg>
  );
}

export function IconSplit(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="1.5" y="2" width="5.5" height="12" rx="1" />
      <rect x="9" y="2" width="5.5" height="12" rx="1" />
      <path d="M8 3v10" strokeWidth={2} />
    </svg>
  );
}

export function IconCopyKey(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 5h3v3H3z" />
      <path d="M10 3h3v3h-3z" />
      <path d="M10 8h3v3h-3z" />
      <path d="M3 10h3v3H3z" />
    </svg>
  );
}

export function IconCopyValue(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="5" width="8" height="8" rx="1" />
      <path d="M3 11V3.5A.5.5 0 013.5 3H11" />
    </svg>
  );
}

export function IconCopyAll(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="6" y="6" width="8" height="8" rx="1" />
      <path d="M3 11V3.5A.5.5 0 013.5 3H11" />
    </svg>
  );
}

export function IconOpenJson(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2 4.5V12a1 1 0 001 1h10a1 1 0 001-1V6.5a1 1 0 00-1-1H7.5L6 4H3a1 1 0 00-1 1z" />
      <path d="M8 8l2 2-2 2" />
    </svg>
  );
}
