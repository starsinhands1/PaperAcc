"use client";

import { useEffect, useMemo, useState } from "react";
import { notifySessionUpdated } from "@/lib/work-store";

type AuthMode = "login" | "register";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type StoredAccount = {
  phone: string;
  password: string;
  createdAt: string;
};

const ACCOUNTS_KEY = "paper_acc_accounts_v1";
const SESSION_KEY = "paper_acc_session_v1";
const TERMS_URL =
  "https://jcneyh7qlo8i.feishu.cn/wiki/PR8kw4TvwixLzgkI91FchhPWnYg?renamingWikiNode=false";
const FONT =
  "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Sora', system-ui, sans-serif";

function loadAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.phone === "string" &&
        typeof item.password === "string",
    );
  } catch {
    return [];
  }
}

function saveAccounts(accounts: StoredAccount[]) {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function saveSession(phone: string) {
  window.localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      phone,
      loggedInAt: new Date().toISOString(),
    }),
  );
  notifySessionUpdated();
}

function validatePhone(phone: string) {
  return /^1\d{10}$/.test(phone);
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M5.5 4.5h2.1c.45 0 .84.31.95.75l.64 2.56c.09.38-.03.78-.32 1.03l-1.33 1.17a15.1 15.1 0 0 0 6.44 6.44l1.17-1.33c.26-.29.66-.41 1.03-.32l2.56.64c.44.11.75.5.75.95v2.1c0 .55-.45 1-1 1C10.42 20.5 3.5 13.58 3.5 5.5c0-.55.45-1 1-1Z"
        stroke="#9AA9C2"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M7.5 10V8a4.5 4.5 0 1 1 9 0v2M6.5 10h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z"
        stroke="#9AA9C2"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InviteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 8V5.5A1.5 1.5 0 0 1 9.5 4h9A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H16M4 9.5A1.5 1.5 0 0 1 5.5 8h9A1.5 1.5 0 0 1 16 9.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 18.5v-9Z"
        stroke="#9AA9C2"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
        stroke="#9AA9C2"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="2.8" stroke="#9AA9C2" strokeWidth="1.8" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 3l18 18M10.73 5.08A10.9 10.9 0 0 1 12 5c6 0 9.5 7 9.5 7a16.53 16.53 0 0 1-4.06 4.68M6.28 6.3C4.24 7.76 2.5 10 2.5 12c0 0 3.5 7 9.5 7 1.6 0 3.01-.38 4.25-1.01"
        stroke="#9AA9C2"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="#6C7A93"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  icon,
  rightNode,
  helper,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  icon: React.ReactNode;
  rightNode?: React.ReactNode;
  helper?: string;
}) {
  return (
    <label style={{ display: "block" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#24324B",
            fontFamily: FONT,
          }}
        >
          {label}
        </span>
        {helper ? (
          <span
            style={{
              fontSize: 12,
              color: "#8D9BB3",
              fontFamily: FONT,
            }}
          >
            {helper}
          </span>
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          minHeight: 58,
          borderRadius: 16,
          border: "1px solid #DCE5F2",
          background: "#F7FAFF",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.85)",
          padding: "0 16px",
        }}
      >
        <span style={{ flexShrink: 0, display: "inline-flex" }}>{icon}</span>
        <input
          suppressHydrationWarning
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 15,
            color: "#20304A",
            fontFamily: FONT,
          }}
        />
        {rightNode ? <span style={{ flexShrink: 0 }}>{rightNode}</span> : null}
      </div>
    </label>
  );
}

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerCode, setRegisterCode] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setMessage("");
  }, [mode, open]);

  const submitLabel = useMemo(
    () => (mode === "login" ? "登录" : "注册"),
    [mode],
  );

  const legalLinkStyle: React.CSSProperties = {
    color: "#2F6DF6",
    fontWeight: 600,
    textDecoration: "none",
  };

  if (!open) return null;

  const handleLogin = async () => {
    if (!validatePhone(loginPhone)) {
      setMessage("请输入正确的 11 位手机号");
      return;
    }
    if (!loginPassword) {
      setMessage("请输入密码");
      return;
    }

    setSubmitting(true);
    try {
      const accounts = loadAccounts();
      const account = accounts.find((item) => item.phone === loginPhone.trim());

      if (!account || account.password !== loginPassword) {
        setMessage("手机号或密码错误");
        return;
      }

      saveSession(account.phone);
      setMessage("");
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (!validatePhone(registerPhone)) {
      setMessage("请输入正确的 11 位手机号");
      return;
    }
    if (registerPassword.length < 6) {
      setMessage("密码至少 6 位");
      return;
    }
    if (registerPassword !== registerConfirmPassword) {
      setMessage("两次输入的密码不一致");
      return;
    }

    setSubmitting(true);
    try {
      const accounts = loadAccounts();
      const exists = accounts.some((item) => item.phone === registerPhone.trim());

      if (exists) {
        setMessage("该手机号已注册，请直接登录");
        return;
      }

      const nextAccounts = [
        ...accounts,
        {
          phone: registerPhone.trim(),
          password: registerPassword,
          createdAt: new Date().toISOString(),
        },
      ];

      saveAccounts(nextAccounts);
      setLoginPhone(registerPhone.trim());
      setLoginPassword("");
      setRegisterCode("");
      setInviteCode("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");
      setMode("login");
      setMessage("注册成功，请先登录后再进入工作台");
    } finally {
      setSubmitting(false);
    }
  };

  const formBody =
    mode === "login" ? (
      <>
        <Field
          label="手机号"
          placeholder="请输入手机号"
          value={loginPhone}
          onChange={setLoginPhone}
          icon={<PhoneIcon />}
        />
        <div style={{ height: 16 }} />
        <Field
          label="密码"
          placeholder="请输入密码"
          value={loginPassword}
          onChange={setLoginPassword}
          type={showLoginPassword ? "text" : "password"}
          icon={<LockIcon />}
          helper="忘记密码?"
          rightNode={
            <button
              type="button"
              onClick={() => setShowLoginPassword((value) => !value)}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                cursor: "pointer",
                display: "inline-flex",
              }}
            >
              <EyeIcon open={showLoginPassword} />
            </button>
          }
        />
      </>
    ) : (
      <>
        <Field
          label="手机号"
          placeholder="请输入 11 位手机号"
          value={registerPhone}
          onChange={setRegisterPhone}
          icon={<PhoneIcon />}
        />
        <div style={{ height: 16 }} />
        <label style={{ display: "block" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#24324B",
                fontFamily: FONT,
              }}
            >
              验证码
            </span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 12,
                minHeight: 58,
                borderRadius: 16,
                border: "1px solid #DCE5F2",
                background: "#F7FAFF",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.85)",
                padding: "0 16px",
              }}
            >
              <span style={{ flexShrink: 0, display: "inline-flex" }}>
                <LockIcon />
              </span>
              <input
                suppressHydrationWarning
                type="text"
                value={registerCode}
                onChange={(event) => setRegisterCode(event.target.value)}
                placeholder="请输入验证码"
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 15,
                  color: "#20304A",
                  fontFamily: FONT,
                }}
              />
            </div>
            <button
              type="button"
              style={{
                width: 138,
                borderRadius: 16,
                border: "1.5px solid #2F6DF6",
                background: "#F8FBFF",
                color: "#2F6DF6",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: FONT,
                cursor: "not-allowed",
              }}
            >
              发送验证码
            </button>
          </div>
        </label>
        <div style={{ height: 16 }} />
        <Field
          label="设置密码"
          helper="字母+数字，至少 6 位"
          placeholder="设置登录密码"
          value={registerPassword}
          onChange={setRegisterPassword}
          type={showRegisterPassword ? "text" : "password"}
          icon={<LockIcon />}
          rightNode={
            <button
              type="button"
              onClick={() => setShowRegisterPassword((value) => !value)}
              style={{
                border: "none",
                background: "transparent",
                padding: 0,
                cursor: "pointer",
                display: "inline-flex",
              }}
            >
              <EyeIcon open={showRegisterPassword} />
            </button>
          }
        />
        <div style={{ height: 16 }} />
        <Field
          label="确认密码"
          placeholder="再次输入密码"
          value={registerConfirmPassword}
          onChange={setRegisterConfirmPassword}
          type="password"
          icon={<LockIcon />}
        />
        <div style={{ height: 16 }} />
        <Field
          label="邀请码"
          helper="选填"
          placeholder="粘贴好友邀请码（选填）"
          value={inviteCode}
          onChange={setInviteCode}
          icon={<InviteIcon />}
        />
      </>
    );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background:
          "linear-gradient(180deg, rgba(30,39,66,.60), rgba(24,31,53,.72))",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 500,
          maxHeight: "calc(100vh - 48px)",
          overflowY: "auto",
          borderRadius: 28,
          background: "#FFFFFF",
          boxShadow: "0 28px 80px rgba(10, 20, 50, .28)",
          border: "1px solid rgba(255,255,255,.35)",
          position: "relative",
          padding: "16px 22px 22px",
          fontFamily: FONT,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            borderRadius: "28px 28px 0 0",
            background: "linear-gradient(90deg, #5A95FF, #2F6DF6)",
          }}
        />

        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 14,
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "1px solid #E2EAF6",
            background: "#FFFFFF",
            boxShadow: "0 8px 24px rgba(24, 52, 109, .08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <CloseIcon />
        </button>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 28,
          }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 20,
              background:
                "radial-gradient(circle at 50% 50%, #9BD0FF 0%, #447BFF 28%, #0D1B3A 55%, #09142F 100%)",
              boxShadow:
                "0 18px 34px rgba(11, 31, 88, .28), inset 0 1px 0 rgba(255,255,255,.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
              <path
                d="M24 2c1.37 11.9 3.76 18.63 7.05 21.95C34.37 27.24 41.1 29.63 43 31c-11.9 1.37-18.63 3.76-21.95 7.05C17.76 41.37 15.37 48.1 14 50c-1.37-11.9-3.76-18.63-7.05-21.95C3.63 24.76-3.1 22.37-5 21c11.9-1.37 18.63-3.76 21.95-7.05C20.24 10.63 22.63 3.9 24 2Z"
                fill="white"
                transform="translate(5 -2) scale(.8)"
              />
            </svg>
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 20,
              fontWeight: 800,
              color: "#1B2942",
              letterSpacing: "-0.4px",
            }}
          >
            Paper Acc
          </div>
        </div>

        <div
          style={{
            marginTop: 22,
            borderRadius: 16,
            background: "#ECF1F8",
            padding: 4,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 4,
          }}
        >
          {(["login", "register"] as const).map((item) => {
            const active = mode === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                style={{
                  height: 44,
                  borderRadius: 12,
                  border: "none",
                  background: active ? "#FFFFFF" : "transparent",
                  boxShadow: active
                    ? "0 3px 12px rgba(39, 69, 140, .14)"
                    : "none",
                  color: active ? "#2F6DF6" : "#5E6D85",
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  fontFamily: FONT,
                }}
              >
                {item === "login" ? "登录" : "注册"}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 22 }}>{formBody}</div>

        {message ? (
          <div
            style={{
              marginTop: 12,
              fontSize: 12.5,
              color: message.includes("成功") ? "#2F6DF6" : "#E24A4A",
              lineHeight: 1.6,
              fontFamily: FONT,
            }}
          >
            {message}
          </div>
        ) : null}

        <button
          type="button"
          onClick={mode === "login" ? handleLogin : handleRegister}
          disabled={submitting}
          style={{
            width: "100%",
            height: 56,
            border: "none",
            borderRadius: 16,
            marginTop: 18,
            background: "linear-gradient(180deg, #3C73FF, #2E5DE9)",
            color: "#FFFFFF",
            fontSize: 16,
            fontWeight: 700,
            boxShadow: "0 16px 32px rgba(46, 93, 233, .28)",
            cursor: submitting ? "wait" : "pointer",
            fontFamily: FONT,
          }}
        >
          {submitting ? "处理中..." : submitLabel}
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#9AA8BE",
            fontSize: 13,
            marginTop: 18,
            fontFamily: FONT,
          }}
        >
          <div style={{ flex: 1, height: 1, background: "#DEE6F2" }} />
          <span>其他登录方式</span>
          <div style={{ flex: 1, height: 1, background: "#DEE6F2" }} />
        </div>

        <button
          type="button"
          style={{
            width: "100%",
            height: 46,
            borderRadius: 14,
            border: "1px solid #DCE5F2",
            background: "#FFFFFF",
            color: "#24324B",
            fontSize: 14,
            fontWeight: 600,
            marginTop: 14,
            fontFamily: FONT,
            cursor: "not-allowed",
          }}
        >
          验证码登录
        </button>

        {mode === "login" ? (
          <div
            style={{
              marginTop: 14,
              textAlign: "center",
              fontSize: 12.5,
              color: "#9AA8BE",
              lineHeight: 1.7,
              fontFamily: FONT,
            }}
          >
            登录即代表同意
            <a
              href={TERMS_URL}
              target="_blank"
              rel="noreferrer"
              style={legalLinkStyle}
            >
              《服务条款》
            </a>
            和
            <a
              href={TERMS_URL}
              target="_blank"
              rel="noreferrer"
              style={legalLinkStyle}
            >
              《隐私政策》
            </a>
            ，
            <span style={{ color: "#FF9F1C", fontWeight: 700 }}>
              新用户赠送 50 灵感值
            </span>
          </div>
        ) : null}

        {mode === "register" ? (
          <div
            style={{
              marginTop: 14,
              textAlign: "center",
              fontSize: 12.5,
              color: "#9AA8BE",
              lineHeight: 1.7,
              fontFamily: FONT,
            }}
          >
            注册即代表同意
            <a
              href={TERMS_URL}
              target="_blank"
              rel="noreferrer"
              style={legalLinkStyle}
            >
              《服务条款》
            </a>
            ，
            <span style={{ color: "#FF9F1C", fontWeight: 700 }}>
              新用户赠送 50 灵感值
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
