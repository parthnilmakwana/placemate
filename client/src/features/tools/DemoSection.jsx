import React, { useState } from "react";
import { Activity, Layout } from "lucide-react";
import ResumeScanner from "./ResumeScanner";
import PortfolioDemo from "./PortfolioDemo";
import Button from "../../components/Button";

function DemoSection() {
  const [activeTab, setActiveTab] = useState("ats"); // 'ats' or 'portfolio'

  return (
    <section
      id="demos"
      className="max-w-6xl mx-auto w-full px-6 py-24 border-t border-brand-border z-10 flex flex-col gap-12 font-body text-left"
    >
      {/* Section Header & Tabs */}
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-surface-primary border border-border-subtle text-text-secondary text-xs font-semibold">
          <Activity size={14} className="text-brand-primary" />
          <span>Interactive Preview</span>
        </div>

        <h2 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-text-main">
          Try our tools before you sign up
        </h2>

        {/* Tab Toggle */}
        <div className="bg-surface-primary border border-border-subtle p-1 rounded-lg flex items-center justify-center w-full max-w-sm mx-auto">
          <Button
            onClick={() => setActiveTab("ats")}
            variant={activeTab === "ats" ? "primary" : "ghost"}
            className="flex-1"
          >
            <Activity size={14} className="mr-2" />
            ATS Checker
          </Button>
          <Button
            onClick={() => setActiveTab("portfolio")}
            variant={activeTab === "portfolio" ? "primary" : "ghost"}
            className="flex-1"
          >
            <Layout size={14} className="mr-2" />
            Portfolio Builder
          </Button>
        </div>
      </div>

      {/* Demo Content Container */}
      <div className="w-full">
        {activeTab === "ats" && (
          <div className="animate-fade-in">
            <ResumeScanner />
          </div>
        )}

        {activeTab === "portfolio" && (
          <div className="animate-fade-in">
            <PortfolioDemo />
          </div>
        )}
      </div>
    </section>
  );
}

export default DemoSection;
