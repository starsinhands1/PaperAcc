"use client";

import { useRouter } from 'next/navigation';

const FONT = "'Sora', system-ui, sans-serif";
const MOCK_USER = { name: "7553 用户", credits: 1200 };

function HamburgerIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1" y="4" width="16" height="1.5" rx="0.75" fill="#0d1526" />
      <rect x="1" y="8.25" width="16" height="1.5" rx="0.75" fill="#0d1526" />
      <rect x="1" y="12.5" width="16" height="1.5" rx="0.75" fill="#0d1526" />
    </svg>
  );
}

interface AppTopBarProps {
  onMenuClick?: () => void;
}

export function AppTopBar({ onMenuClick }: AppTopBarProps) {
  const router = useRouter();

  return (
    <header
      style={{
        height: 52,
        background: '#fff',
        borderBottom: '1px solid #e8eef8',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Left: hamburger + brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={onMenuClick}
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="open menu"
        >
          <HamburgerIcon />
        </button>
        <span
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: '#0d1526',
            letterSpacing: '-0.4px',
            fontFamily: FONT,
            cursor: 'pointer',
          }}
          onClick={() => router.push('/dash')}
        >
          Paper Acc
        </span>
      </div>

      {/* Right: credits + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            fontSize: 12,
            color: '#f59e0b',
            fontWeight: 600,
            fontFamily: FONT,
          }}
        >
          ◆ {MOCK_USER.credits} 灵感值
        </span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#3b6ef5,#14b8a6)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: FONT,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {MOCK_USER.name[0]}
        </div>
      </div>
    </header>
  );
}
