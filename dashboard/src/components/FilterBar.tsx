"use client";

import { useEffect, useRef, useState } from "react";

export const TIME_PERIODS = [
  { label: "1 week", days: 7 },
  { label: "1 month", days: 30 },
  { label: "60 days", days: 60 },
  { label: "90 days", days: 90 },
  { label: "180 days", days: 180 },
];

const btnBase: React.CSSProperties = {
  fontFamily: "Arial, sans-serif",
  fontSize: "12px",
  color: "#111",
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: "3px",
  padding: "5px 10px",
  cursor: "pointer",
};

interface MultiDropdownProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}

function MultiDropdown({ label, options, selected, onChange }: MultiDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggle = (val: string) => {
    onChange(
      selected.includes(val) ? selected.filter((s) => s !== val) : [...selected, val]
    );
  };

  const filtered = search
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const buttonLabel =
    selected.length === 0
      ? `${label}: All`
      : selected.length === 1
      ? selected[0]
      : `${selected.length} selected`;

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ ...btnBase, minWidth: "140px", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}
      >
        <span>{buttonLabel}</span>
        <span style={{ color: "#999", fontSize: "10px" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: "3px",
            zIndex: 100,
            minWidth: "200px",
            maxHeight: "280px",
            overflowY: "auto",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}...`}
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "block",
              width: "100%",
              padding: "6px 10px",
              fontFamily: "Arial, sans-serif",
              fontSize: "12px",
              border: "none",
              borderBottom: "1px solid #e0e0e0",
              outline: "none",
              boxSizing: "border-box",
              color: "#111",
            }}
          />
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "6px 10px",
                fontFamily: "Arial, sans-serif",
                fontSize: "11px",
                color: "#888",
                background: "none",
                border: "none",
                borderBottom: "1px solid #e0e0e0",
                cursor: "pointer",
              }}
            >
              Clear all
            </button>
          )}
          {filtered.map((opt) => (
            <label
              key={opt}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 10px",
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                color: "#111",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                style={{ accentColor: "#111" }}
              />
              {opt}
            </label>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: "8px 10px", fontSize: "12px", color: "#999" }}>
              No matches
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface FilterBarProps {
  keywords: string[];
  publications: string[];
  selectedKeywords: string[];
  selectedPublications: string[];
  timeDays: number;
  onKeywordsChange: (v: string[]) => void;
  onPublicationsChange: (v: string[]) => void;
  onTimeDaysChange: (v: number) => void;
  count: number;
  onExportAll: () => void;
  onExportSelected: () => void;
  onCopy: () => void;
}

export default function FilterBar({
  keywords,
  publications,
  selectedKeywords,
  selectedPublications,
  timeDays,
  onKeywordsChange,
  onPublicationsChange,
  onTimeDaysChange,
  count,
  onExportAll,
  onExportSelected,
  onCopy,
}: FilterBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ borderBottom: "1px solid #ddd", paddingBottom: "14px", marginBottom: "22px" }}>
      <div style={{ fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", color: "#999", marginBottom: "8px" }}>
        Filters
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "12px", color: "#888" }}>Period:</span>
          <select
            value={timeDays}
            onChange={(e) => onTimeDaysChange(Number(e.target.value))}
            style={{ ...btnBase, padding: "5px 8px" }}
          >
            {TIME_PERIODS.map((p) => (
              <option key={p.days} value={p.days}>{p.label}</option>
            ))}
          </select>
        </div>

        <MultiDropdown label="Keyword" options={keywords} selected={selectedKeywords} onChange={onKeywordsChange} />
        <MultiDropdown label="Publication" options={publications} selected={selectedPublications} onChange={onPublicationsChange} />

        <span style={{ fontSize: "12px", color: "#bbb", marginLeft: "4px" }}>
          {count} {count === 1 ? "result" : "results"}
        </span>

        <div style={{ marginLeft: "auto", display: "flex", gap: "6px", alignItems: "center" }}>
          <button onClick={handleCopy} style={btnBase}>
            {copied ? "Copied!" : "Copy"}
          </button>
          <button onClick={onExportSelected} style={btnBase}>
            Export Selected
          </button>
          <button onClick={onExportAll} style={btnBase}>
            Export All
          </button>
        </div>
      </div>
    </div>
  );
}
