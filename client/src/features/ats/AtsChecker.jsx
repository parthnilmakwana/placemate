import React from "react";
import ResumeScanner from "../tools/ResumeScanner";
import { Activity } from "lucide-react";

function AtsChecker() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-5xl animate-fade-in text-left">
      <div className="flex flex-col gap-1.5 border-b border-brand-border pb-4">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-main tracking-tight flex items-center gap-3">
          <Activity className="text-brand-primary" />
          ATS Checker
        </h2>
        <p className="text-sm text-text-secondary leading-relaxed">
          Upload your resume as a PDF, Word Document, or Image to instantly
          grade its compatibility with modern Applicant Tracking Systems.
        </p>
      </div>

      <div className="w-full py-4">
        <ResumeScanner />
      </div>
    </div>
  );
}

export default AtsChecker;
