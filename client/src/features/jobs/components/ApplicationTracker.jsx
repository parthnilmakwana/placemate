import React, { useState, useEffect } from "react";
import { api } from "../../../services/api";
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  ExternalLink,
  Calendar,
  Search,
  RefreshCw,
} from "lucide-react";
import SkeletonLoader from "../../../components/SkeletonLoader";

function ApplicationTracker() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedOverCol, setDraggedOverCol] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/jobs/history?limit=50");
      setJobs(response.data || []);
    } catch (err) {
      console.error("Failed to load tracking history:", err);
      setError("Could not retrieve your job pipeline history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const updateStatus = async (jobId, newStatus) => {
    const previousJobs = [...jobs];

    setJobs((prev) =>
      prev.map((job) =>
        job._id === jobId ? { ...job, status: newStatus } : job,
      ),
    );

    try {
      await api.patch(`/api/jobs/${jobId}/status`, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status on server:", err);
      setJobs(previousJobs);
      setError("Failed to update job status on server. Please try again.");
    }
  };

  const getAbsoluteUrl = (url) => {
    if (!url) return "#";
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
  };

  const filteredJobs = jobs.filter((job) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      job.title?.toLowerCase().includes(query) ||
      job.company?.toLowerCase().includes(query)
    );
  });

  const columns = {
    matched: {
      id: "matched",
      title: "Discovered",
      color: "border-t-[#727B87] text-text-main",
      bgColor: "bg-surface-primary",
      items: filteredJobs.filter((j) => j.status === "matched" || !j.status),
    },
    applied: {
      id: "applied",
      title: "Applied",
      color: "border-t-[#3B82F6] text-brand-primary",
      bgColor: "bg-surface-primary",
      items: filteredJobs.filter((j) => j.status === "applied"),
    },
    interviewing: {
      id: "interviewing",
      title: "Interviewing",
      color: "border-t-[#F59E0B] text-[#F59E0B]",
      bgColor: "bg-surface-primary",
      items: filteredJobs.filter((j) => j.status === "interviewing"),
    },
    offered: {
      id: "offered",
      title: "Offered",
      color: "border-t-[#10B981] text-[#10B981]",
      bgColor: "bg-surface-primary",
      items: filteredJobs.filter((j) => j.status === "offered"),
    },
    rejected: {
      id: "rejected",
      title: "Archived / Rejected",
      color: "border-t-[#E25555] text-status-error",
      bgColor: "bg-surface-primary",
      items: filteredJobs.filter((j) => j.status === "rejected"),
    },
  };

  return (
    <div className="flex flex-col gap-5 w-full animate-fade-in text-left text-text-main">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pb-3 border-b border-border-subtle">
        <div>
          <h2 className="text-xl font-semibold text-text-main">Application Pipeline</h2>
          <p className="text-xs text-text-secondary mt-0.5">Track active roles and manage candidate workflow status.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder="Filter by title or company..."
              className="w-full pl-9 pr-3 py-1.5 bg-bg-sidebar border border-border-subtle rounded text-xs text-text-main placeholder-text-muted focus:outline-none focus:border-border-strong"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={fetchHistory}
            className="px-3 py-1.5 rounded bg-surface-elevated hover:bg-border-subtle text-text-main border border-border-subtle text-xs font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <RefreshCw size={13} className="text-text-muted" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded text-xs bg-status-error/10 border border-status-error/20 text-status-error">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <SkeletonLoader type="jobs" />
      ) : (
        <div className="flex gap-5 min-h-[480px] overflow-x-auto pb-4 snap-x custom-scrollbar">
          {Object.values(columns).map((col) => {
            const isHovered = draggedOverCol === col.id;
            return (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setDraggedOverCol(col.id)}
                onDragLeave={() => {
                  setDraggedOverCol((prev) => (prev === col.id ? null : prev));
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDraggedOverCol(null);
                  const jobId = e.dataTransfer.getData("text/plain");
                  if (jobId) {
                    updateStatus(jobId, col.id);
                  }
                }}
                className={`flex flex-col rounded border transition-colors ${col.bgColor} overflow-hidden w-[300px] shrink-0 snap-center
                  ${isHovered ? "border-brand-primary bg-brand-primary/5" : "border-border-subtle"}`}
              >
                {/* Column Header */}
                <div
                  className={`p-3 border-b border-border-subtle border-t-2 ${col.color} flex items-center justify-between bg-bg-sidebar`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {col.title}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface-elevated border border-border-subtle text-[10px] font-semibold text-text-secondary">
                    {col.items.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 p-3 flex flex-col gap-3 custom-scrollbar bg-bg-sidebar min-h-[380px] overflow-y-auto">
                  {col.items.length === 0 ? (
                    <div className="m-auto text-center py-8 text-text-muted text-xs">
                      No roles in this column.
                    </div>
                  ) : (
                    col.items.map((job) => (
                      <div
                        key={job._id}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", job._id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        className="structured-panel p-3.5 border border-border-subtle hover:border-border-strong transition-colors flex flex-col gap-2.5 cursor-grab active:cursor-grabbing bg-surface-primary"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex flex-col min-w-0">
                            <h4
                              className="text-xs font-semibold text-text-main truncate"
                              title={job.title}
                            >
                              {job.title}
                            </h4>
                            <span className="text-[11px] text-text-secondary truncate mt-0.5">
                              {job.company}
                            </span>
                          </div>

                          {job.matchScore && (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                                job.matchScore >= 85
                                  ? "bg-status-success/10 text-status-success border border-status-success/20"
                                  : "bg-surface-elevated text-text-secondary border border-border-subtle"
                              }`}
                            >
                              {job.matchScore}%
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between text-[11px] text-text-muted pt-2 border-t border-border-subtle">
                          <span>{job.location || "Remote"}</span>
                          {job.createdAt && (
                            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between gap-2 border-t border-border-subtle pt-2 mt-auto">
                          <a
                            href={getAbsoluteUrl(job.applyUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-primary hover:underline"
                          >
                            <span>Apply Link</span>
                            <ExternalLink size={10} />
                          </a>

                          <select
                            value={job.status || "matched"}
                            onChange={(e) => updateStatus(job._id, e.target.value)}
                            className="text-[11px] bg-bg-sidebar border border-border-subtle rounded px-1.5 py-0.5 text-text-secondary focus:outline-none focus:border-border-strong cursor-pointer"
                          >
                            <option value="matched">Discovered</option>
                            <option value="applied">Applied</option>
                            <option value="interviewing">Interviewing</option>
                            <option value="offered">Offered</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ApplicationTracker;

