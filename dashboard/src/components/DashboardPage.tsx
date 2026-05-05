"use client";

import { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import FilterBar from "@/components/FilterBar";
import ArticleTable from "@/components/ArticleTable";
import { supabase, Article } from "@/lib/supabase";

function cutoffDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function exportToExcel(data: Article[], filename: string) {
  const rows = data.map((a) => ({
    Date: a.date,
    Title: a.title,
    URL: a.url,
    Publication: a.source,
    Keyword: a.keyword,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Articles");
  XLSX.writeFile(wb, filename);
}

export default function DashboardPage() {
  const [timeDays, setTimeDays] = useState(30);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [selectedPublications, setSelectedPublications] = useState<string[]>([]);

  const [articles, setArticles] = useState<Article[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [publications, setPublications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOptions() {
      const [{ data: kwData }, { data: pubData }] = await Promise.all([
        supabase.from("articles").select("keyword").order("keyword"),
        supabase.from("articles").select("source").order("source"),
      ]);
      setKeywords([...new Set((kwData ?? []).map((r) => r.keyword))]);
      setPublications([...new Set((pubData ?? []).map((r) => r.source))]);
    }
    loadOptions();
  }, []);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("articles")
      .select("date, title, url, source, keyword")
      .gte("date", cutoffDate(timeDays))
      .order("date", { ascending: false });

    if (selectedKeywords.length > 0) query = query.in("keyword", selectedKeywords);
    if (selectedPublications.length > 0) query = query.in("source", selectedPublications);

    const { data, error } = await query;
    if (!error && data) setArticles(data as Article[]);
    setLoading(false);
  }, [timeDays, selectedKeywords, selectedPublications]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleExportSelected = () => {
    exportToExcel(articles, "vgm-selected-articles.xlsx");
  };

  const handleExportAll = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("date, title, url, source, keyword")
      .order("date", { ascending: false });
    if (!error && data) exportToExcel(data as Article[], "vgm-all-articles.xlsx");
  };

  const handleCopy = () => {
    const header = "Date\tTitle\tURL\tPublication\tKeyword";
    const rows = articles.map(
      (a) => `${a.date}\t${a.title}\t${a.url}\t${a.source}\t${a.keyword}`
    );
    navigator.clipboard.writeText([header, ...rows].join("\n"));
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "28px 20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ marginBottom: "22px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#111", margin: "0 0 2px" }}>
          Vaishali Gauba Media
        </h1>
        <p style={{ fontSize: "13px", color: "#999", margin: 0 }}>
          News Research Dashboard
        </p>
      </div>

      <div style={{ borderTop: "1px solid #ddd", marginBottom: "22px" }} />

      <FilterBar
        keywords={keywords}
        publications={publications}
        selectedKeywords={selectedKeywords}
        selectedPublications={selectedPublications}
        timeDays={timeDays}
        onKeywordsChange={setSelectedKeywords}
        onPublicationsChange={setSelectedPublications}
        onTimeDaysChange={setTimeDays}
        count={articles.length}
        onExportAll={handleExportAll}
        onExportSelected={handleExportSelected}
        onCopy={handleCopy}
      />

      <ArticleTable articles={articles} loading={loading} />

      <div style={{ marginTop: "28px", borderTop: "1px solid #e0e0e0", paddingTop: "14px", fontSize: "11px", color: "#bbb" }}>
        Vibe-coded by{" "}
        <a href="https://azdhan.vercel.app" style={{ color: "#bbb", textDecoration: "none" }} target="_blank" rel="noopener noreferrer">
          Azdhan
        </a>
        , for Vaishali Gauba Media
      </div>
    </div>
  );
}
