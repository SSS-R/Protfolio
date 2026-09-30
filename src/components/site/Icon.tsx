// Solar icon set by 480 Design, CC BY 4.0 — https://github.com/480-Design/Solar-Icon-Set
// Inlined from the Iconify API (solar:*-linear) so there is no runtime fetch.

const PATHS = {
  'arrow-up-right': <path d="M6 18L18 6M18 15V6H9" />,
  'arrow-down': <path d="M12 4L12 20M6 14L12 20L18 14" />,
  copy: (
    <>
      <path d="M6 11C6 8.17157 6 6.75736 6.87868 5.87868C7.75736 5 9.17157 5 12 5H15C17.8284 5 19.2426 5 20.1213 5.87868C21 6.75736 21 8.17157 21 11V16C21 18.8284 21 20.2426 20.1213 21.1213C19.2426 22 17.8284 22 15 22H12C9.17157 22 7.75736 22 6.87868 21.1213C6 20.2426 6 18.8284 6 16V11Z" />
      <path d="M6 19C4.34315 19 3 17.6569 3 16V10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H15C16.6569 2 18 3.34315 18 5" />
    </>
  ),
  check: <path d="M4 12.9L7.14286 16.5L15 7.5M20 7.5625L11.4283 16.5625L11 16" />,
  close: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M14.5 9.5L9.5 14.5M9.5 9.5L14.5 14.5" />
    </>
  ),
  command: (
    <>
      <path d="M8 8H16V16H8V8Z" />
      <path d="M16 16L19 16C20.6569 16 22 17.3432 22 19C22 20.6569 20.6578 22 19 22C17.3441 22 16 20.6578 16 19V16Z" />
      <path d="M8 16L5 16C3.34411 16 2 17.3432 2 19C2 20.6569 3.34316 22 5 22C6.65687 22 8 20.6578 8 19V16Z" />
      <path d="M16 8L19 8C20.6569 8 22 6.65781 22 5C22 3.34411 20.6578 2 19 2C17.3441 2 16 3.34316 16 5V8Z" />
      <path d="M8 8L5 8C3.34411 8 2 6.65781 2 5C2 3.34411 3.34316 2 5 2C6.65687 2 8 3.34316 8 5V8Z" />
    </>
  ),
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({ name, className = 'size-4' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
