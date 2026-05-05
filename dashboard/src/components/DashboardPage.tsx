"use client";

import { useCallback, useEffect, useState } from "react";
import FilterBar from "@/components/FilterBar";
import ArticleTable from "@/components/ArticleTable";
import { supabase, Article } from "@/lib/supabase";

function cutoffDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
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

    if (selectedKeywords.length > 0) {
      query = query.in("keyword", selectedKeywords);
    }
    if (selectedPublications.length > 0) {
      query = query.in("source", selectedPublications);
    }

    const { data, error } = await query;
    if (!error && data) setArticles(data as Article[]);
    setLoading(false);
  }, [timeDays, selectedKeywords, selectedPublications]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "28px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ marginBottom: "22px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#111", margin: "0 0 2px" }}>
          News Research Dashboard
        </h1>
        <p style={{ fontSize: "13px", color: "#999", margin: 0 }}>
          Vaishali Gauba Media
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
      />

      <ArticleTable articles={articles} loading={loading} />

      <div
        style={{
          marginTop: "28px",
          borderTop: "1px solid #e0e0e0",
          paddingTop: "14px",
          fontSize: "11px",
          color: "#bbb",
        }}
      >
        Scored by Claude AI · Built for{" "}
        <a
          href="https://vaishaliGauba.com"
          style={{ color: "#bbb", textDecoration: "none" }}
          target="_blank"
          rel="noopener noreferrer"
        >
          Vaishali Gauba Media
        </a>
      </div>
    </div>
  );
}
