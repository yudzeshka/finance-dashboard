import type React from "react";

type SvgIcon = React.FC<React.SVGProps<SVGSVGElement>>;

const food: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 2v20" />
    <path d="M17 2v20" />
    <path d="M7 8h10" />
    <path d="M7 14h10" />
    <path d="M3 6l1 16h16l1-16" />
  </svg>
);

const salary: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v12" />
    <path d="M8 10c0-1.5 1.5-2 4-2s4 .5 4 2-1.5 2-4 2" />
    <path d="M16 14c0 1.5-1.5 2-4 2s-4-.5-4-2" />
  </svg>
);

const transport: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="1" y="6" width="22" height="12" rx="2" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
    <path d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
  </svg>
);

const entertainment: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M8 12l5-3v6z" />
  </svg>
);

const health: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const education: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 3h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H2z" />
    <path d="M22 3h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z" />
    <path d="M12 7l2 2-2 2" />
  </svg>
);

const utilities: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 12h16" />
    <path d="M4 18h16" />
    <path d="M10 4l-4 8h12l-4-8" />
    <circle cx="12" cy="22" r="1" />
    <circle cx="4" cy="22" r="1" />
    <circle cx="20" cy="22" r="1" />
  </svg>
);

const rent: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    <rect x="9" y="13" width="6" height="8" rx="0" />
    <path d="M9 17h6" />
    <circle cx="12" cy="16" r="1" />
  </svg>
);

const mortgage: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    <path d="M8 14c0-1.5 1.5-2 4-2s4 .5 4 2-1.5 2-4 2" />
    <path d="M12 12v8" />
  </svg>
);

const credit_card: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <path d="M1 10h22" />
    <path d="M6 16h3" />
    <path d="M12 16h4" />
  </svg>
);

const taxes: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M8 7h8" />
    <path d="M8 11h8" />
    <path d="M8 15h4" />
    <path d="M18 7l-5 5" />
    <path d="M18 12V7h-5" />
  </svg>
);

const shopping: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const gifts: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="8" width="18" height="14" rx="1" />
    <path d="M12 8V22" />
    <path d="M19 8V6a2 2 0 0 0-2-2h-2M5 8V6a2 2 0 0 1 2-2h2" />
    <path d="M7 4c.5-1 1.5-2 3-1.5" />
    <path d="M17 4c-.5-1-1.5-2-3-1.5" />
    <path d="M12 2l-1 4h2l-1 4" />
  </svg>
);

const travel: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17.8 19.2L22 22v-4.2l-4.2 1.4z" />
    <path d="M6.2 4.8L2 2v4.2l4.2-1.4z" />
    <path d="M10 10l6.2 2.2-1.9 5.6-5-2.9-3.1 1.8-2.7-4.5 4.5-2.1L10 10z" />
    <path d="M10 2v8" />
  </svg>
);

const sports: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 9V4h6v5" />
    <path d="M19 9V4h-6v5" />
    <path d="M12 9v2" />
    <path d="M7 11v10h10V11" />
    <path d="M6 17h2" />
    <path d="M16 17h2" />
  </svg>
);

const pets: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="8" cy="8" r="2" />
    <circle cx="16" cy="8" r="2" />
    <path d="M6 12c0-1 1-2 2-2h8c1 0 2 1 2 2" />
    <ellipse cx="12" cy="14" rx="4" ry="3" />
    <path d="M12 17v2" />
    <path d="M8 19l2-1" />
    <path d="M16 19l-2-1" />
  </svg>
);

const subscriptions: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

const coffee: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="4" y="5" width="14" height="12" rx="2" />
    <path d="M18 10h1a3 3 0 0 1 0 6h-1" />
    <path d="M4 5h14v-2H4z" />
    <path d="M7 13v1" />
    <path d="M11 11v3" />
  </svg>
);

const electronics: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <path d="M12 18h.01" />
    <path d="M8 6h8" />
  </svg>
);

const home: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

const kids: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="9" cy="9" r="3" />
    <circle cx="15" cy="9" r="3" />
    <path d="M4 16c0-2 2-3 3.5-4h9c1.5 1 3.5 2 3.5 4" />
    <path d="M12 7v5" />
    <path d="M8 12l8 3" />
    <path d="M16 12l-8 3" />
  </svg>
);

const business: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="7" width="18" height="14" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M12 12v.01" />
    <path d="M12 16v.01" />
    <path d="M12 14v.01" />
  </svg>
);

const other: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="7" r="1.5" />
    <path d="M12 10v7" />
  </svg>
);

const income: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8" />
    <path d="M9 12l3-4 3 4" />
  </svg>
);

const expense: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8" />
    <path d="M9 12l3 4 3-4" />
  </svg>
);

const warning: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <path d="M12 9v4" />
    <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const edit: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const deleteIcon: SvgIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

export const categoryIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  food,
  salary,
  transport,
  entertainment,
  health,
  education,
  utilities,
  rent,
  mortgage,
  credit_card,
  taxes,
  shopping,
  gifts,
  travel,
  sports,
  pets,
  subscriptions,
  coffee,
  electronics,
  home,
  kids,
  business,
  other,
  income,
  expense,
  warning,
  edit,
  delete: deleteIcon,
};
