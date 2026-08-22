import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api, BASE_URL } from "../../services/api";
import {
  Briefcase,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Check,
  Calendar,
  Search,
  Filter,
  MapPin,
  RefreshCw,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import ApplicationTracker from "./components/ApplicationTracker";

function JobDashboardTab() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  // Tab-level states
  const [viewMode, setViewMode] = useState(
    tabParam === "tracker" ? "tracker" : "discover"
  );
  const [mainTab, setMainTab] = useState("recommendations"); // 'recommendations' | 'search'

  useEffect(() => {
    if (tabParam === "tracker" || tabParam === "discover") {
      setViewMode(tabParam);
    }
  }, [tabParam]);

  const handleSwitchViewMode = (mode) => {
    setViewMode(mode);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (mode === "tracker") {
        next.set("tab", "tracker");
      } else {
        next.delete("tab");
      }
      return next;
    });
  };

  // Recommendations state
  const [recJobs, setRecJobs] = useState([]);
  const [recDay, setRecDay] = useState("today"); // 'today' | 'yesterday' | '2days'
  const [recLoading, setRecLoading] = useState(false);
  const [recGeneratedAt, setRecGeneratedAt] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchHasSearched, setSearchHasSearched] = useState(false);

  // Shared state
  const [error, setError] = useState("");

  const fetchRecommendations = useCallback(async (dayParam = "today") => {
    setRecLoading(true);
    setError("");
    try {
      const response = await api.get(
        `/api/jobs/recommendations?day=${dayParam}`,
      );
      setRecJobs(response.data || []);
      setRecGeneratedAt(response.generatedAt);
    } catch (err) {
      console.error("Failed to load recommendations:", err);
      setError("Could not load your recommended jobs.");
    } finally {
      setRecLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mainTab === "recommendations") {
      fetchRecommendations(recDay);
    }
  }, [mainTab, recDay, fetchRecommendations]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setSearchLoading(true);
    setError("");
    setSearchHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (searchCategory) params.append("category", searchCategory);
      if (searchLocation) params.append("location", searchLocation);

      const response = await api.get(`/api/jobs/search?${params.toString()}`);
      setSearchResults(response.data || []);
      setSearchTotal(response.total || 0);
    } catch (err) {
      console.error("Search failed:", err);
      setError("Search failed. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleMarkApplied = async (jobId, currentStatus) => {
    const nextStatus = currentStatus === "applied" ? "matched" : "applied";

    if (mainTab === "recommendations") {
      setRecJobs((prev) =>
        prev.map((job) =>
          job.jobId === jobId ? { ...job, status: nextStatus } : job,
        ),
      );
    } else {
      setSearchResults((prev) =>
        prev.map((job) =>
          job._id === jobId ? { ...job, status: nextStatus } : job,
        ),
      );
    }

    try {
      await api.patch(`/api/jobs/${jobId}/status`, { status: nextStatus });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const getAbsoluteUrl = (url) => {
    if (!url) return "#";
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
  };

  const renderJobCard = (job, isSearch) => {
    const id = isSearch ? job._id : job.jobId;
    const title = job.title;
    const company = job.company;
    const location = job.location || "Remote";
    const skills = job.skills || [];
    const applyLink = isSearch ? job.applyLink : job.applyUrl;
    const status = job.status || "matched";
    const isApplied = status === "applied";

    const matchScore = !isSearch ? job.matchScore : null;
    const matchReasons = !isSearch ? job.matchReasons : null;

    return (
      <div
        key={id}
        className={`structured-panel p-5 transition-colors relative overflow-hidden flex flex-col gap-4
          ${isApplied ? "border-status-success/30 bg-status-success/5" : "hover:border-border-strong"}`}
      >
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <h4 className="font-semibold text-base text-text-main">
              {title}
            </h4>
            <span className="text-xs text-text-secondary font-medium">
              {company} • {location}
            </span>
          </div>

          {!isSearch && matchScore && (
            <div
              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold tracking-wide border
              ${
                matchScore >= 85
                  ? "bg-status-success/10 border-status-success/30 text-status-success"
                  : matchScore >= 60
                    ? "bg-brand-primary/10 border-brand-primary/30 text-brand-primary"
                    : "bg-surface-elevated border-border-subtle text-text-muted"
              }`}
            >
              {matchScore}% Match
            </div>
          )}
        </div>

        {!isSearch && matchReasons && matchReasons.length > 0 && (
          <div className="bg-bg-sidebar rounded p-3 text-xs text-text-secondary leading-relaxed border border-border-subtle">
            <strong className="text-text-main">Match Reason:</strong> {matchReasons.join(" • ")}
          </div>
        )}

        {skills && skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {skills.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 rounded bg-surface-elevated text-text-secondary text-[11px] border border-border-subtle font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center gap-4 pt-3 border-t border-border-subtle flex-wrap">
          <button
            onClick={() => handleMarkApplied(id, status)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors border
              ${
                isApplied
                  ? "bg-status-success/10 border-status-success/30 text-status-success hover:bg-status-success/20"
                  : "bg-surface-elevated border-border-subtle text-text-secondary hover:text-text-main hover:bg-border-subtle"
              }`}
          >
            {isApplied ? <CheckCircle size={14} /> : <Check size={14} />}
            <span>{isApplied ? "Applied" : "Mark Applied"}</span>
          </button>

          <a
            href={getAbsoluteUrl(applyLink)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center px-4 py-1.5 rounded text-xs font-semibold bg-brand-primary hover:bg-brand-hover text-text-main cursor-pointer transition-colors gap-1.5"
          >
            <span>Apply Now</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in text-left text-text-main">
      {/* Header & Sub-navigation */}
      <div className="flex flex-col gap-4 border-b border-border-subtle pb-3">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-text-main">
              Job Discovery & Tracking
            </h1>
            <p className="text-sm text-text-secondary">
              Explore personalized matches, query role listings, and manage your application pipeline.
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-6 text-xs font-medium select-none">
          <button
            type="button"
            onClick={() => handleSwitchViewMode("discover")}
            className={`pb-2 transition-colors cursor-pointer border-b-2 ${
              viewMode === "discover"
                ? "border-brand-primary text-text-main font-semibold"
                : "border-transparent text-text-muted hover:text-text-secondary"
            }`}
          >
            Discover Feed
          </button>
          <button
            type="button"
            onClick={() => handleSwitchViewMode("tracker")}
            className={`pb-2 transition-colors cursor-pointer border-b-2 ${
              viewMode === "tracker"
                ? "border-brand-primary text-text-main font-semibold"
                : "border-transparent text-text-muted hover:text-text-secondary"
            }`}
          >
            Application Pipeline
          </button>
        </div>
      </div>

      {viewMode === "discover" ? (
        <div className="flex flex-col gap-6 animate-fade-in">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded text-xs bg-status-error/10 border border-status-error/20 text-status-error">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Main Mode Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setMainTab("recommendations")}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold transition-colors cursor-pointer border ${
                mainTab === "recommendations"
                  ? "bg-brand-primary text-text-main border-brand-primary"
                  : "bg-surface-primary border-border-subtle text-text-secondary hover:text-text-main hover:bg-surface-elevated"
              }`}
            >
              <Sparkles size={14} />
              <span>Daily Recommendations</span>
            </button>
            <button
              onClick={() => setMainTab("search")}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-semibold transition-colors cursor-pointer border ${
                mainTab === "search"
                  ? "bg-brand-primary text-text-main border-brand-primary"
                  : "bg-surface-primary border-border-subtle text-text-secondary hover:text-text-main hover:bg-surface-elevated"
              }`}
            >
              <Search size={14} />
              <span>Search Database</span>
            </button>
          </div>

          {/* Recommendations View */}
          {mainTab === "recommendations" && (
            <div className="flex flex-col gap-5 text-left animate-fade-in">
              <div className="flex justify-between items-center structured-panel p-4">
                <div className="flex items-center gap-3">
                  <Briefcase size={18} className="text-brand-primary shrink-0" />
                  <div className="text-xs text-text-secondary">
                    <strong className="text-text-main">Personalized Feed:</strong> 5 targeted roles daily.
                    {recGeneratedAt && (
                      <span className="block mt-0.5 text-[11px] text-text-muted">
                        Updated: {new Date(recGeneratedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => fetchRecommendations(recDay)}
                  className="p-1.5 bg-surface-elevated hover:bg-border-subtle rounded border border-border-subtle text-text-muted hover:text-text-main transition-colors cursor-pointer"
                  title="Refresh matches"
                >
                  <RefreshCw size={14} />
                </button>
              </div>

              {/* Day filter tabs */}
              <div className="flex gap-2 border-b border-border-subtle pb-3">
                {["today", "yesterday", "2days"].map((day) => (
                  <button
                    key={day}
                    onClick={() => setRecDay(day)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer border ${
                      recDay === day
                        ? "bg-surface-elevated text-text-main border border-border-strong"
                        : "bg-transparent border-transparent text-text-muted hover:text-text-secondary"
                    }`}
                  >
                    <Calendar size={13} />
                    {day === "today"
                      ? "Today"
                      : day === "yesterday"
                        ? "Yesterday"
                        : "2 Days Ago"}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                {recLoading ? (
                  <div className="flex flex-col items-center gap-2 py-12 text-text-muted">
                    <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs">Evaluating matched listings...</span>
                  </div>
                ) : recJobs.length > 0 ? (
                  recJobs.map((job) => renderJobCard(job, false))
                ) : (
                  <div className="structured-panel p-10 flex flex-col items-center justify-center text-center gap-2">
                    <p className="text-sm font-semibold text-text-main">
                      No recommendations found for this period.
                    </p>
                    <p className="text-xs text-text-muted max-w-sm">
                      Ensure your bio and engineering skills are up to date in your candidate profile.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search View */}
          {mainTab === "search" && (
            <div className="flex flex-col gap-5 text-left animate-fade-in">
              <form
                onSubmit={handleSearch}
                className="structured-panel p-5 rounded flex flex-col gap-3"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-grow flex items-center bg-bg-sidebar border border-border-subtle rounded focus-within:border-border-strong">
                    <Search className="ml-3 text-text-muted" size={15} />
                    <input
                      type="text"
                      placeholder="Title, keywords, or company..."
                      className="w-full bg-transparent border-none py-2 px-3 text-xs text-text-main placeholder-text-muted focus:outline-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="sm:w-44 flex items-center bg-bg-sidebar border border-border-subtle rounded">
                    <Filter className="ml-3 text-text-muted" size={15} />
                    <select
                      className="w-full bg-transparent border-none py-2 px-2 text-xs text-text-main focus:outline-none cursor-pointer"
                      value={searchCategory}
                      onChange={(e) => setSearchCategory(e.target.value)}
                    >
                      <option value="" className="bg-bg-sidebar">All Categories</option>
                      <option value="Frontend" className="bg-bg-sidebar">Frontend</option>
                      <option value="Backend" className="bg-bg-sidebar">Backend</option>
                      <option value="Full Stack" className="bg-bg-sidebar">Full Stack</option>
                      <option value="Android" className="bg-bg-sidebar">Android</option>
                      <option value="DevOps" className="bg-bg-sidebar">DevOps</option>
                    </select>
                  </div>

                  <div className="sm:w-44 flex items-center bg-bg-sidebar border border-border-subtle rounded">
                    <MapPin className="ml-3 text-text-muted" size={15} />
                    <input
                      type="text"
                      placeholder="Location"
                      className="w-full bg-transparent border-none py-2 px-3 text-xs text-text-main placeholder-text-muted focus:outline-none"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={searchLoading}
                    className="bg-brand-primary hover:bg-brand-hover text-text-main px-5 py-2 rounded text-xs font-semibold cursor-pointer disabled:opacity-50 transition-colors shrink-0"
                  >
                    {searchLoading ? "Searching..." : "Search"}
                  </button>
                </div>
              </form>

              <div className="flex flex-col gap-3">
                {searchHasSearched && !searchLoading && (
                  <div className="text-xs text-text-muted">
                    Found {searchTotal} role listings
                  </div>
                )}

                {searchLoading ? (
                  <div className="flex flex-col items-center gap-2 py-12 text-text-muted">
                    <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs">Querying database...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((job) => renderJobCard(job, true))
                ) : searchHasSearched ? (
                  <div className="structured-panel p-10 flex flex-col items-center justify-center text-center gap-2">
                    <p className="text-sm font-semibold text-text-main">
                      No roles matched your search parameters.
                    </p>
                    <p className="text-xs text-text-muted">
                      Try clearing specific filters to widen your search.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      ) : (
        <ApplicationTracker />
      )}
    </div>
  );
}

export default JobDashboardTab;

