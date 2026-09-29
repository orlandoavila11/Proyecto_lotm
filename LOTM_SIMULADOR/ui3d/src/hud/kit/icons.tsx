import type { SVGProps } from 'react';

/**
 * Iconografía de latón grabado: trazo único de 1.5, remates redondos, viewBox 32.
 * Dibujada a mano para el Atlas (no hay emoji ni glifos Unicode haciendo de icono).
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 32, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconBook = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 8.5c4-1.4 8-1 12 1.2 4-2.2 8-2.6 12-1.2v15c-4-1.3-8-.9-12 1.2-4-2.1-8-2.5-12-1.2z" />
    <path d="M16 9.7v15" />
    <path d="M7.5 13c2.2-.4 4.3-.1 6 .7M7.5 16.5c2.2-.4 4.3-.1 6 .7M18.5 13.7c1.7-.8 3.8-1.1 6-.7M18.5 17.2c1.7-.8 3.8-1.1 6-.7" strokeWidth={1.1} />
  </Svg>
);

export const IconGear = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="16" cy="16" r="4" />
    <path d="M16 4.5v3.2M16 24.3v3.2M4.5 16h3.2M24.3 16h3.2M7.9 7.9l2.3 2.3M21.8 21.8l2.3 2.3M7.9 24.1l2.3-2.3M21.8 10.2l2.3-2.3" />
    <circle cx="16" cy="16" r="8.3" />
  </Svg>
);

/** Siluetas góticas de Backlund para el medallón de la ciudad */
export const IconCity = (p: IconProps) => (
  <Svg {...p} strokeWidth={1.1}>
    <path
      d="M3 27h26M5 27v-6l2-2v-3l1.2-3 1.2 3v3l1.6 1.4V27M11 27v-9l2-2.2V11l1.5-5 1.5 5v4.8l2 2.2V27M18 27v-8l1.8-1.6V13l1.4-4 1.4 4v4.4L24.4 19v8M24.4 27v-5l1.6-1.4 1.6 1.4v5"
      fill="currentColor"
      fillOpacity={0.9}
    />
  </Svg>
);

export const IconQuill = (p: IconProps) => (
  <Svg {...p}>
    <path d="M27 4.5c-9.5 1.8-15.8 8.4-18.6 18.4l-2 4.6" />
    <path d="M27 4.5c-.8 6.2-4.3 11.5-10.2 14.3l-6.6 2.1" />
    <path d="M22.4 9.3l-6.7 6.7M19.6 7.4c-.2 2.5.4 4.4 1.8 5.8M14.8 11.3c.3 2.2 1.2 3.8 2.8 4.9" strokeWidth={1.1} />
  </Svg>
);

/** Abrecartas: objetivo "examinar la carta" */
export const IconLetterOpener = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 25.5C9.5 16 15.5 8.5 24.5 6.5c1 7.5-3.5 14-10.5 17.3" />
    <path d="M6 27.5l4.4-4.4M11 21.5l3 3" />
  </Svg>
);

export const IconSeal = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4.5" y="8" width="23" height="16" rx="1" />
    <path d="M4.5 9l11.5 8.5L27.5 9" />
    <circle cx="16" cy="18.5" r="3.4" fill="currentColor" fillOpacity={0.35} />
  </Svg>
);

export const IconMagnifier = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="13.5" cy="13.5" r="7.5" />
    <path d="M19 19l8 8" strokeWidth={2.2} />
  </Svg>
);

export const IconPin = (p: IconProps) => (
  <Svg {...p}>
    <path d="M16 28s8.5-8.2 8.5-14.5a8.5 8.5 0 10-17 0C7.5 19.8 16 28 16 28z" />
    <circle cx="16" cy="13.5" r="3" />
  </Svg>
);

export const IconJournal = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 8.5c4-1.4 8-1 12 1.2 4-2.2 8-2.6 12-1.2v15c-4-1.3-8-.9-12 1.2-4-2.1-8-2.5-12-1.2z" />
    <path d="M16 9.7v15" />
    <path d="M7 12.5h6M7 15.5h6M7 18.5h4.5M19 12.5h6M19 15.5h6M19 18.5h4.5" strokeWidth={1.1} />
  </Svg>
);

export const IconChevronLeft = (p: IconProps) => (
  <Svg {...p} strokeWidth={2}>
    <path d="M20 5L9 16l11 11" />
  </Svg>
);

export const IconChevronRight = (p: IconProps) => (
  <Svg {...p} strokeWidth={2}>
    <path d="M12 5l11 11-11 11" />
  </Svg>
);

export const IconCoins = (p: IconProps) => (
  <Svg {...p}>
    <ellipse cx="13" cy="9" rx="8" ry="3" />
    <path d="M5 9v4c0 1.7 3.6 3 8 3s8-1.3 8-3V9M5 13v4c0 1.7 3.6 3 8 3" />
    <ellipse cx="20" cy="19" rx="7.5" ry="2.8" />
    <path d="M12.5 19v4c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-4" />
  </Svg>
);

export const IconPouch = (p: IconProps) => (
  <Svg {...p}>
    <path d="M11 9.5c-4.5 3-7 7.5-6 12 .8 3.6 4.8 5.5 11 5.5s10.2-1.9 11-5.5c1-4.5-1.5-9-6-12" />
    <path d="M10 6.5c2 1.5 4 2.2 6 2.2s4-.7 6-2.2M11 9.5h10" />
    <path d="M13 17h6M16 14v6" strokeWidth={1.1} />
  </Svg>
);

export const IconBottles = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 5h5M10 5v4.5c-2.5 1-4 3-4 5.5v10.5c0 1 .8 1.5 1.5 1.5h6c.7 0 1.5-.5 1.5-1.5V15c0-2.5-1.5-4.5-4-5.5V5" />
    <path d="M20 11h5M21 11v3c-1.6.6-2.5 2-2.5 3.8v7.7c0 .8.6 1.5 1.3 1.5h3.4c.7 0 1.3-.7 1.3-1.5v-7.7c0-1.8-.9-3.2-2.5-3.8v-3" />
    <path d="M6 18h9M18.5 20h7" strokeWidth={1.1} />
  </Svg>
);

export const IconCart = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 6h3.5l3.4 14h14.1l2.5-10H9" />
    <circle cx="12.5" cy="25" r="1.8" />
    <circle cx="22.5" cy="25" r="1.8" />
    <path d="M13 13h11M14 16.5h9" strokeWidth={1.1} />
  </Svg>
);

export const IconBoot = (p: IconProps) => (
  <Svg {...p}>
    <path d="M11 4.5h7v11.5l6.5 3c2 .9 3 2.4 3 4.5v1.5H6.5l-.5-2.5 5-3z" fill="currentColor" fillOpacity={0.2} />
    <path d="M6.5 25h21M11 9h7M11 12.5h7" strokeWidth={1.1} />
  </Svg>
);

export const IconPistols = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 9l13 7.5 2.5-1.5 5 3-2 3.5-4.5-2.2-1.5 2.5-3.5 5.7-3-1.8 3.4-5.3L4 12.5z" />
    <path d="M28 9L15 16.5M28 12.5l-6.2 3.6" />
  </Svg>
);

export const IconEye = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 16C6 9.8 10.7 7 16 7s10 2.8 13.5 9C26 22.2 21.3 25 16 25S6 22.2 2.5 16z" />
    <circle cx="16" cy="16" r="4.6" />
    <circle cx="16" cy="16" r="1.6" fill="currentColor" />
  </Svg>
);

export const IconFlee = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="20" cy="5.5" r="2.5" fill="currentColor" />
    <path d="M13 12l5-3.5 4.5 3 2.5 4.5 4 .5M18 8.5l-2.5 8.5 5 4-1.5 7M15.5 17l-4 4.5-6 .5M13 12H8.5l-3 3" />
  </Svg>
);

export const IconHourglass = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 4h16M8 28h16M10 4c0 6 6 8.5 6 12s-6 6-6 12M22 4c0 6-6 8.5-6 12s6 6 6 12" />
    <path d="M12.5 25.5c1.2-1.5 2.4-2.3 3.5-2.3s2.3.8 3.5 2.3z" fill="currentColor" />
  </Svg>
);

export const IconCalendar = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5" y="7" width="22" height="20" rx="1.5" />
    <path d="M5 12.5h22M11 4.5v5M21 4.5v5" />
    <path d="M10 17h2M15 17h2M20 17h2M10 21.5h2M15 21.5h2" strokeWidth={2} />
  </Svg>
);

export const IconScroll = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 5h14a3 3 0 013 3v1h-4M9 5a3 3 0 00-3 3v16a3 3 0 003 3h13a3 3 0 003-3V9M9 5a3 3 0 013 3v16a3 3 0 01-3 3" />
    <path d="M15 12h7M15 16h7M15 20h5" strokeWidth={1.1} />
  </Svg>
);

export const IconDocument = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 4h11l6 6v18H8z" />
    <path d="M19 4v6h6M11.5 15h10M11.5 19h10M11.5 23h6" strokeWidth={1.1} />
  </Svg>
);

export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 8l16 16M24 8L8 24" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p} strokeWidth={2}>
    <path d="M7 16.5l6 6L25.5 9" />
  </Svg>
);

export const IconCandle = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 13h8v12h-8zM16 13v-2" />
    <path d="M16 3.5c2 2.4 2.5 4.2 0 6.5-2.5-2.3-2-4.1 0-6.5z" fill="currentColor" fillOpacity={0.4} />
    <path d="M8 25h16c0 2-2 3-3 3H11c-1 0-3-1-3-3z" />
  </Svg>
);

export const IconMask = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 8c3.5-1.5 7.2-1.8 11-.5 3.8-1.3 7.5-1 11 .5-.2 7-2 12.5-5.5 15.5-2 1.7-4 1.4-5.5-.5-1.5 1.9-3.5 2.2-5.5.5C7 20.5 5.2 15 5 8z" />
    <path d="M9.5 13c1.3-.8 2.8-.9 4.5 0M18 13c1.7-.9 3.2-.8 4.5 0" />
  </Svg>
);

export const IconChalice = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 5h16c0 7-3.5 11-8 11S8 12 8 5zM16 16v7M11 27h10M12.5 23h7" />
  </Svg>
);
