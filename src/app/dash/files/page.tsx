export default function FilesPage() {
  return (
    <div
      style={{
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: 16,
        fontFamily: "'Sora', system-ui, sans-serif",
        background: "#f4f7ff",
      }}
    >
      <div style={{ fontSize: 48 }}>📁</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0d1526", margin: 0 }}>我的文件</h2>
      <p style={{ fontSize: 14, color: "#8898c0", textAlign: "center", margin: 0 }}>
        集中查看上传和 AI 生成文件
      </p>
      <div
        style={{
          padding: "10px 20px",
          background: "#eef2ff",
          color: "#3b6ef5",
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        功能完整版仅在正式平台可用
      </div>
    </div>
  );
}
