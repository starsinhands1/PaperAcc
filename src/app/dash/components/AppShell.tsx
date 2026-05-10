"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppSidebar } from './AppSidebar';
import { AppTopBar } from './AppTopBar';

const FONT = "'Sora', system-ui, sans-serif";

const BOTTOM_NAV = [
  { id: 'idea', icon: '💬', label: '灵感对话' },
  { id: 'ppt', icon: '📊', label: 'PPT 创作' },
  { id: 'files', icon: '📁', label: '我的文件' },
  { id: 'account', icon: '◉', label: '账号中心' },
];

const CSS_BLOCK = `
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}

.fa{animation:fadeUp .28s ease both}
.hov{transition:all .18s ease}
.hov:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(59,110,245,.1)!important;border-color:rgba(59,110,245,.25)!important}
.hov-s{transition:all .15s}
.hov-s:hover{background:rgba(59,110,245,.06)!important}
.nav-i{display:flex;align-items:center;gap:9px;padding:8px 12px;border-radius:8px;cursor:pointer;border:none;width:100%;text-align:left;background:transparent;transition:all .15s;font-family:'Sora',sans-serif;font-size:13px}
.nav-i:hover{background:rgba(59,110,245,.07)!important}
.nav-i.on{background:rgba(59,110,245,.1)!important;color:#3b6ef5!important;font-weight:600}
.inp{background:#fff;border:1.5px solid #e4eaf8;border-radius:10px;padding:10px 14px;font-size:13px;color:#0d1526;width:100%;transition:border-color .2s,box-shadow .2s;line-height:1.6;font-family:'Sora',sans-serif}
.inp:focus{border-color:#3b6ef5;box-shadow:0 0 0 3px rgba(59,110,245,.08)}
.bp{background:#3b6ef5;color:#fff;border:none;border-radius:9px;font-weight:600;font-size:13px;display:inline-flex;align-items:center;justify-content:center;gap:7px;cursor:pointer;transition:all .18s;padding:10px 20px;font-family:'Sora',sans-serif;white-space:nowrap}
.bp:hover{background:#2d5dd4;transform:translateY(-1px);box-shadow:0 6px 20px rgba(59,110,245,.3)}
.bp:disabled{opacity:.4;pointer-events:none;transform:none;box-shadow:none}
.bg_{background:#fff;color:#4a5a7a;border:1.5px solid #e4eaf8;border-radius:9px;font-size:13px;display:inline-flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;transition:all .15s;padding:10px 18px;font-family:'Sora',sans-serif;white-space:nowrap}
.bg_:hover{background:#f0f4ff;border-color:#c0ccf0;color:#3b6ef5}
.card{background:#fff;border:1.5px solid #e8eef8;border-radius:14px}
.tag{display:inline-flex;align-items:center;padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;font-family:'Sora',sans-serif;white-space:nowrap}
`;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const getBottomPath = (id: string) => `/dash/${id}`;
  const isBottomActive = (id: string) => pathname.startsWith(getBottomPath(id));

  if (!isMobile) {
    // Desktop layout
    return (
      <>
        <style>{CSS_BLOCK}</style>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            height: '100vh',
            overflow: 'hidden',
            background: '#f4f7ff',
            fontFamily: FONT,
          }}
        >
          <AppSidebar />
          <main
            style={{
              flex: 1,
              overflowY: 'auto',
              minHeight: 0,
            }}
          >
            {children}
          </main>
        </div>
      </>
    );
  }

  // Mobile layout
  return (
    <>
      <style>{CSS_BLOCK}</style>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          background: '#f4f7ff',
          fontFamily: FONT,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <AppTopBar onMenuClick={() => setDrawerOpen(true)} />

        {/* Main scroll area */}
        <main style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingBottom: 60 }}>
          {children}
        </main>

        {/* Bottom nav */}
        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 56,
            background: '#fff',
            borderTop: '1px solid #e8eef8',
            display: 'flex',
            alignItems: 'stretch',
            zIndex: 100,
          }}
        >
          {BOTTOM_NAV.map((item) => {
            const active = isBottomActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => router.push(getBottomPath(item.id))}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 0',
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: active ? 700 : 400,
                    color: active ? '#3b6ef5' : '#8898c0',
                    fontFamily: FONT,
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Mobile drawer overlay */}
        {drawerOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 200,
              display: 'flex',
            }}
          >
            {/* Backdrop */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(13,21,38,0.35)',
              }}
              onClick={() => setDrawerOpen(false)}
            />
            {/* Drawer */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                width: 240,
                height: '100%',
                background: '#fff',
                overflowY: 'auto',
              }}
            >
              <AppSidebar />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
