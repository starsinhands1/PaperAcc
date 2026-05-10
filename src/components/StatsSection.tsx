"use client";

const stats = [
  { display: "1,500+", label: "科研人在用" },
  { display: "9,800+", label: "次科研绘图生成" },
  { display: "~3 min", label: "平均完成时间" },
];

export function StatsSection() {
  return (
    <div
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        position: "relative",
        zIndex: 10,
        padding: "0 72px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          background: "#fff",
          border: "1px solid rgba(55, 98, 255, .13)",
          borderRadius: 24,
          boxShadow: "0 18px 44px rgba(55, 98, 255, .08)",
          overflow: "hidden",
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              padding: "28px 24px 24px",
              textAlign: "center",
              position: "relative",
            }}
          >
            {i > 0 && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: 0,
                  top: "20%",
                  height: "60%",
                  width: 1,
                  background: "rgba(55, 98, 255, .1)",
                  display: "block",
                }}
              />
            )}
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#3762FF",
                letterSpacing: "-1px",
              }}
            >
              {stat.display}
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "#94A3B8",
                marginTop: 3,
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
