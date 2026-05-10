import fs from "node:fs/promises";
import path from "node:path";
import type { CSSProperties } from "react";

export const dynamic = "force-dynamic";

const FONT =
  "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Sora', system-ui, sans-serif";
const EXAMPLE_ROOT = path.join(process.cwd(), "example");
const CATEGORY_ORDER = ["文生图", "图生图", "总体框架图", "技术路线图", "PPT"];
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

const CATEGORY_META: Record<string, { icon: string; description: string }> = {
  文生图: {
    icon: "AI",
    description: "展示通过文本提示词生成的样例作品，适合查看风格和构图方向。",
  },
  图生图: {
    icon: "IMG",
    description: "展示上传参考图后生成的结果，可直观看到图像改写与风格迁移效果。",
  },
  总体框架图: {
    icon: "MAP",
    description: "展示论文生图中的总体框架图成果，适合查看论文结构梳理效果。",
  },
  技术路线图: {
    icon: "FLOW",
    description: "展示论文生图中的技术路线图成果，用于查看方法流程与技术路径表达。",
  },
  PPT: {
    icon: "PPT",
    description: "展示论文生 PPT 相关样例文件，支持在线预览 PDF 版本和下载原文件。",
  },
};

type AssetKind = "image" | "pdf" | "file";

type PlazaItem = {
  category: string;
  name: string;
  ext: string;
  kind: AssetKind;
  previewUrl: string;
  downloadUrl: string;
  size: number;
  updatedAt: string;
};

type PlazaGroup = {
  category: string;
  icon: string;
  description: string;
  items: PlazaItem[];
};

export default async function PlazaPage() {
  const groups = await loadExampleGroups();
  const totalItems = groups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div style={pageStyle}>
      <section style={heroStyle}>
        <div style={heroBadgeStyle}>作品广场</div>
        <div style={heroHeaderStyle}>
          <div style={heroTitleWrapStyle}>
            <h1 style={heroTitleStyle}>示例作品展示</h1>
            <p style={heroDescStyle}>
              这里集中展示使用本平台创作的各类优秀样例作品，包含文生图、图生图、总体框架图、技术路线图以及论文
              PPT 等不同类型内容。
            </p>
          </div>
          <div style={heroStatsStyle}>
            <div style={statCardStyle}>
              <div style={statValueStyle}>{groups.length}</div>
              <div style={statLabelStyle}>作品分类</div>
            </div>
            <div style={statCardStyle}>
              <div style={statValueStyle}>{totalItems}</div>
              <div style={statLabelStyle}>样例数量</div>
            </div>
          </div>
        </div>
      </section>

      {groups.length === 0 ? (
        <section style={emptyStyle}>
          <div style={emptyIconStyle}>EMPTY</div>
          <h2 style={emptyTitleStyle}>暂无样例作品</h2>
          <p style={emptyDescStyle}>当前还没有可展示的作品内容。</p>
        </section>
      ) : (
        <div style={groupListStyle}>
          {groups.map((group) => (
            <section key={group.category} style={groupSectionStyle}>
              <div style={groupHeaderStyle}>
                <div style={groupTitleWrapStyle}>
                  <div style={groupIconStyle}>{group.icon}</div>
                  <div>
                    <h2 style={groupTitleStyle}>{group.category}</h2>
                    <p style={groupDescStyle}>{group.description}</p>
                  </div>
                </div>
                <div style={groupCountStyle}>{group.items.length} 个作品</div>
              </div>

              <div style={gridStyle}>
                {group.items.map((item) => (
                  <article key={`${group.category}-${item.name}`} style={cardStyle}>
                    <div style={cardTopStyle}>
                      <span style={chipStyle}>{getKindLabel(item.kind)}</span>
                      <span style={fileMetaStyle}>{formatFileSize(item.size)}</span>
                    </div>

                    {item.kind === "image" ? (
                      <a
                        href={item.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={previewLinkStyle}
                      >
                        <img src={item.previewUrl} alt={item.name} style={imageStyle} />
                      </a>
                    ) : (
                      <div style={filePreviewStyle}>
                        <div style={filePreviewIconStyle}>{item.ext.slice(1).toUpperCase()}</div>
                        <div style={filePreviewTextStyle}>
                          {item.kind === "pdf" ? "支持在线预览与下载" : "支持下载文件"}
                        </div>
                      </div>
                    )}

                    <div style={cardBodyStyle}>
                      <div style={timeStyle}>更新于 {formatTime(item.updatedAt)}</div>
                    </div>

                    <div style={buttonRowStyle}>
                      <a
                        href={item.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={primaryButtonStyle}
                      >
                        {item.kind === "image"
                          ? "查看原图"
                          : item.kind === "pdf"
                            ? "在线预览"
                            : "打开文件"}
                      </a>
                      <a href={item.downloadUrl} style={secondaryButtonStyle}>
                        下载
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

async function loadExampleGroups(): Promise<PlazaGroup[]> {
  try {
    const entries = await fs.readdir(EXAMPLE_ROOT, { withFileTypes: true });
    const categories = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((left, right) => compareCategory(left, right));

    const groups = await Promise.all(
      categories.map(async (category) => {
        const categoryDir = path.join(EXAMPLE_ROOT, category);
        const files = await fs.readdir(categoryDir, { withFileTypes: true });
        const items = await Promise.all(
          files
            .filter((entry) => entry.isFile())
            .sort((left, right) => left.name.localeCompare(right.name, "zh-CN"))
            .map(async (entry) => {
              const filePath = path.join(categoryDir, entry.name);
              const stat = await fs.stat(filePath);
              const ext = path.extname(entry.name).toLowerCase();
              const previewUrl = buildAssetUrl([category, entry.name]);
              return {
                category,
                name: entry.name,
                ext,
                kind: getAssetKind(ext),
                previewUrl,
                downloadUrl: `${previewUrl}?download=1`,
                size: stat.size,
                updatedAt: stat.mtime.toISOString(),
              } satisfies PlazaItem;
            }),
        );

        const meta = CATEGORY_META[category] ?? {
          icon: "FILE",
          description: "展示该分类下的示例作品与文件。",
        };

        return {
          category,
          icon: meta.icon,
          description: meta.description,
          items,
        } satisfies PlazaGroup;
      }),
    );

    return groups.filter((group) => group.items.length > 0);
  } catch {
    return [];
  }
}

function buildAssetUrl(segments: string[]) {
  return `/api/example-assets/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`;
}

function getAssetKind(ext: string): AssetKind {
  if (IMAGE_EXTENSIONS.has(ext)) return "image";
  if (ext === ".pdf") return "pdf";
  return "file";
}

function getKindLabel(kind: AssetKind) {
  if (kind === "image") return "图片";
  if (kind === "pdf") return "PDF";
  return "文件";
}

function compareCategory(left: string, right: string) {
  const leftIndex = CATEGORY_ORDER.indexOf(left);
  const rightIndex = CATEGORY_ORDER.indexOf(right);

  if (leftIndex === -1 && rightIndex === -1) {
    return left.localeCompare(right, "zh-CN");
  }
  if (leftIndex === -1) return 1;
  if (rightIndex === -1) return -1;
  return leftIndex - rightIndex;
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

const pageStyle: CSSProperties = {
  minHeight: "100%",
  background: "#f4f7ff",
  padding: 28,
  fontFamily: FONT,
  display: "grid",
  gap: 22,
};

const heroStyle: CSSProperties = {
  borderRadius: 28,
  border: "1px solid #e4ebf7",
  background:
    "radial-gradient(circle at top left, rgba(85, 126, 255, 0.18), transparent 28%), linear-gradient(135deg, #ffffff, #eef4ff)",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.07)",
  padding: 28,
  display: "grid",
  gap: 18,
};

const heroBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "fit-content",
  padding: "8px 14px",
  borderRadius: 999,
  background: "#dce7ff",
  color: "#2f6df6",
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: "0.08em",
};

const heroHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: 18,
  flexWrap: "wrap",
};

const heroTitleWrapStyle: CSSProperties = {
  display: "grid",
  gap: 12,
  maxWidth: 760,
};

const heroTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 32,
  lineHeight: 1.1,
  fontWeight: 900,
  color: "#0f172a",
};

const heroDescStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.8,
  color: "#64748b",
};

const heroStatsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(120px, 1fr))",
  gap: 14,
  minWidth: 260,
};

const statCardStyle: CSSProperties = {
  borderRadius: 22,
  border: "1px solid #dbe7ff",
  background: "rgba(255, 255, 255, 0.84)",
  padding: "18px 20px",
  display: "grid",
  gap: 6,
};

const statValueStyle: CSSProperties = {
  fontSize: 28,
  fontWeight: 900,
  color: "#0f172a",
};

const statLabelStyle: CSSProperties = {
  fontSize: 13,
  color: "#64748b",
};

const emptyStyle: CSSProperties = {
  minHeight: "52vh",
  borderRadius: 28,
  border: "1px solid #e4ebf7",
  background: "#ffffff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  textAlign: "center",
  padding: 24,
};

const emptyIconStyle: CSSProperties = {
  fontSize: 28,
  fontWeight: 900,
  color: "#94a3b8",
  letterSpacing: "0.12em",
};

const emptyTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 900,
  color: "#0f172a",
};

const emptyDescStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "#64748b",
};

const groupListStyle: CSSProperties = {
  display: "grid",
  gap: 22,
};

const groupSectionStyle: CSSProperties = {
  borderRadius: 28,
  border: "1px solid #e4ebf7",
  background: "#ffffff",
  padding: 22,
  display: "grid",
  gap: 20,
  boxShadow: "0 16px 34px rgba(15, 23, 42, 0.05)",
};

const groupHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  flexWrap: "wrap",
};

const groupTitleWrapStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const groupIconStyle: CSSProperties = {
  width: 52,
  height: 52,
  borderRadius: 16,
  background: "linear-gradient(135deg, #2f6df6, #4cc9f0)",
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 900,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 14px 28px rgba(47, 109, 246, 0.22)",
};

const groupTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 900,
  color: "#0f172a",
};

const groupDescStyle: CSSProperties = {
  margin: "6px 0 0",
  fontSize: 13,
  lineHeight: 1.8,
  color: "#64748b",
};

const groupCountStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "10px 14px",
  borderRadius: 999,
  background: "#eef4ff",
  color: "#2f6df6",
  fontSize: 13,
  fontWeight: 800,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 18,
};

const cardStyle: CSSProperties = {
  borderRadius: 24,
  border: "1px solid #e8eef8",
  background: "#fdfefe",
  padding: 16,
  display: "grid",
  gap: 14,
};

const cardTopStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const chipStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "7px 12px",
  borderRadius: 999,
  background: "#eef4ff",
  color: "#2f6df6",
  fontSize: 12,
  fontWeight: 800,
};

const fileMetaStyle: CSSProperties = {
  fontSize: 12,
  color: "#64748b",
};

const previewLinkStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 8,
  borderRadius: 20,
  border: "1px solid #e8eef8",
  background: "#f8fbff",
  textDecoration: "none",
};

const imageStyle: CSSProperties = {
  width: "100%",
  height: "auto",
  maxHeight: 360,
  objectFit: "contain",
  display: "block",
  borderRadius: 14,
};

const filePreviewStyle: CSSProperties = {
  minHeight: 240,
  borderRadius: 18,
  border: "1px solid #e8eef8",
  background: "linear-gradient(135deg, #eef4ff, #f9fbff)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 12,
  textAlign: "center",
  padding: 20,
};

const filePreviewIconStyle: CSSProperties = {
  minWidth: 84,
  padding: "14px 18px",
  borderRadius: 18,
  background: "#ffffff",
  color: "#2f6df6",
  fontSize: 22,
  fontWeight: 900,
  boxShadow: "0 12px 24px rgba(47, 109, 246, 0.12)",
};

const filePreviewTextStyle: CSSProperties = {
  fontSize: 13,
  lineHeight: 1.7,
  color: "#64748b",
};

const cardBodyStyle: CSSProperties = {
  display: "grid",
  gap: 8,
};

const timeStyle: CSSProperties = {
  fontSize: 12,
  color: "#64748b",
};

const buttonRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
};

const sharedButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 42,
  borderRadius: 14,
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 800,
};

const primaryButtonStyle: CSSProperties = {
  ...sharedButtonStyle,
  background: "#2f6df6",
  color: "#ffffff",
  boxShadow: "0 12px 24px rgba(47, 109, 246, 0.2)",
};

const secondaryButtonStyle: CSSProperties = {
  ...sharedButtonStyle,
  background: "#eef4ff",
  color: "#204ecf",
};
