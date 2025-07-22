import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2a10 10 0 1 0 10 10" />
      <path d="M12 18a6 6 0 1 0 0-12v12Z" />
      <path d="M16 16.5A3.5 3.5 0 0 0 18 12h-6v4.5a3.5 3.5 0 0 0 4-4Z" />
    </svg>
  );
}
