"use client";

import { Article } from "@/lib/supabase";

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

const colStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  fontFamily: "Arial, sans-serif",
  fontSize: "12px",
  borderBottom: "1px solid #e0e0e0",
  verticalAlign: "top",
};

const headerStyle: React.CSSProperties = {
  ...colStyle,
  fontSize: "11px",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "1px",
  color: "#999",
  borderBottom: "1px solid #ddd",
  paddingBottom: "8px",
};

interface ArticleTableProps {
  articles: Article[];
  loading: boolean;
}

export default function ArticleTable({ articles, loading }: ArticleTableProps) {
  if (loading) {
    return (
      <div style={{ color: "#999", fontSize: "13px", padding: "20px 0" }}>
        Loading...
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div style={{ color: "#999", fontSize: "13px", padding: "20px 0" }}>
        No articles found for the selected filters.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ ...headerStyle, whiteSpace: "nowrap", width: "100px" }}>Date</th>
            <th style={headerStyle}>Title</th>
            <th style={{ ...headerStyle, whiteSpace: "nowrap", width: "160px" }}>Publication</th>
            <th style={{ ...headerStyle, whiteSpace: "nowrap", width: "160px" }}>Keyword</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
              <td style={{ ...colStyle, color: "#888", whiteSpace: "nowrap" }}>
                {formatDate(a.date)}
              </td>
              <td style={colStyle}>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#111",
                    fontWeight: "bold",
                    textDecoration: "none",
                    fontSize: "13px",
                  }}
                >
                  {a.title}
                </a>
              </td>
              <td style={{ ...colStyle, color: "#888" }}>{a.source}</td>
              <td style={{ ...colStyle, color: "#888" }}>{a.keyword}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
