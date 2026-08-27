import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  UploadCloud, 
  RefreshCw, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  FileCheck, 
  AlertTriangle,
  Layers,
  Check,
  Search,
  Sliders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

// Custom SVG Circular Progress with smooth animation & color indicator
const CircularScore = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    if (score === null) return;
    
    let start = 0;
    const duration = 1200;
    const increment = score / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [score]);

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return '#22c55e'; // success green
    if (s >= 50) return '#f59e0b'; // warning amber
    return '#ef4444'; // error red
  };
  
  const color = getColor(animatedScore);

  return (
    <div className="relative flex items-center justify-center animate-scale-in">
      {/* Background Glow */}
      <div 
        className="absolute inset-0 rounded-full blur-2xl opacity-25 transition-colors duration-500" 
        style={{ backgroundColor: color }}
      ></div>
      
      <svg className="w-36 h-36 md:w-44 md:h-44 transform -rotate-90 relative z-10" viewBox="0 0 150 150">
        <circle
          className="text-brand-border"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="75"
          cy="75"
        />
        <circle
          style={{ 
            stroke: color,
            transition: 'stroke-dashoffset 0.15s ease-out, stroke 0.3s ease'
          }}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="75"
          cy="75"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center z-20">
        <span className="text-4xl md:text-5xl font-extrabold tracking-tight font-heading" style={{ color }}>
          {animatedScore}%
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1">
          ATS Score
        </span>
      </div>
    </div>
  );
};

const ResumeScanner = () => {
  const { user } = useAuth();
  
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [scanStep, setScanStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  const extractTextFromFile = async (file) => {
    try {
      setIsParsing(true);
      setScanStep(1);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/api/upload/extract-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response && response.success) {
        handleScan(response.text);
      } else {
        throw new Error(response.error || 'Failed to extract text from document');
      }
    } catch (error) {
      console.error("Error reading file:", error);
      alert(`Upload Error: ${error.message || 'Failed to parse file'}`);
      setIsParsing(false);
    }
  };

  const handleFileUpload = (file) => {
    const validTypes = [
      'application/pdf', 
      'text/plain', 
      'image/png', 
      'image/jpeg', 
      'image/jpg',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.endsWith('.docx')) {
      alert("Please upload a supported format: PDF, DOCX, TXT, or Image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please upload a smaller file.");
      return;
    }

    setFileName(file.name);
    setScore(null);
    extractTextFromFile(file);
  };

  const handleScan = async (extractedText) => {
    if (!extractedText || !extractedText.trim()) {
      setIsParsing(false);
      alert("No readable text found in document. Please upload a standard text PDF or DOCX file.");
      return;
    }
    
    setIsParsing(false);
    setIsScanning(true);
    setScanStep(2);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setScanStep(3);

      const response = await api.post('/api/ats/analyze-public', { text: extractedText });
      if (response && response.success) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setScore(response.data.score);
        setFeedback(response.data.feedback);
      } else {
        throw new Error('Invalid response from ATS scoring engine');
      }
    } catch (error) {
      console.error("Error analyzing resume:", error);
      alert("Failed to analyze resume with ATS servers. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const resetScanner = () => {
    setScore(null);
    setFeedback([]);
    setFileName('');
  };

  // Helper metrics
  const passedCount = feedback.filter(item => item.passed).length;
  const failedCount = feedback.filter(item => !item.passed).length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* State 1: Upload & Scanning View */}
      {score === null && (
        <div className="relative group animate-fade-in">
          {/* Subtle Ambient Backdrop Glow */}
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-brand-primary/40 via-indigo-500/30 to-brand-hover/40 opacity-20 group-hover:opacity-40 transition duration-500 blur-md"></div>
          
          <div className="relative bg-brand-surface border border-brand-border rounded-2xl shadow-xl p-6 sm:p-10 flex flex-col items-center justify-center text-center overflow-hidden">
            
            {/* Background Dot Matrix Accent */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>

            {isParsing || isScanning ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 animate-fade-in z-10 w-full max-w-md">
                
                {/* Spinner Badge */}
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-brand-primary border-r-brand-primary animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-brand-primary">
                    <Sparkles size={24} className="animate-pulse" />
                  </div>
                </div>

                {/* Animated Step Labels */}
                <h3 className="font-heading text-xl md:text-2xl font-bold text-text-main mb-2">
                  {isParsing 
                    ? 'Extracting Document Text...' 
                    : scanStep === 2 
                      ? 'Parsing Section Headings & Contact Info...' 
                      : 'Calculating ATS Readiness Score...'}
                </h3>
                
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  Analyzing document readability against enterprise ATS parsing standards.
                </p>
                
                {/* Multi-step Progress Pills */}
                <div className="flex items-center gap-2 w-full justify-center">
                  <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${scanStep >= 1 ? 'bg-brand-primary' : 'bg-brand-border'}`}></div>
                  <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${scanStep >= 2 ? 'bg-brand-primary' : 'bg-brand-border'}`}></div>
                  <div className={`h-2 flex-1 rounded-full transition-all duration-500 ${scanStep >= 3 ? 'bg-brand-primary' : 'bg-brand-border'}`}></div>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                
                {/* Drop Zone Box */}
                <div 
                  className={`w-full py-10 sm:py-14 px-6 flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer z-10 relative
                    ${isDragging 
                      ? 'border-brand-primary bg-brand-primary/10 scale-[1.01] shadow-lg' 
                      : 'border-brand-border hover:border-brand-primary/60 hover:bg-brand-bg/40'}
                  `}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => document.getElementById('resume-file-upload').click()}
                >
                  <input 
                    id="resume-file-upload" 
                    type="file" 
                    accept=".pdf,.txt,.docx,.png,.jpg,.jpeg" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }} 
                  />
                  
                  {/* Icon Circle */}
                  <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mb-5 text-brand-primary shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <UploadCloud size={32} />
                  </div>
                  
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-text-main mb-2">
                    Upload Your Resume to Check ATS Score
                  </h3>
                  <p className="text-text-secondary max-w-md mx-auto mb-6 text-xs sm:text-sm leading-relaxed">
                    Drag and drop your document here, or click to browse. We'll instantly evaluate its formatting and structural readability.
                  </p>
                  
                  {/* Format Pills */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-6 text-[11px] font-semibold text-text-muted">
                    <span className="px-2.5 py-1 bg-brand-bg border border-brand-border rounded-md">PDF</span>
                    <span className="px-2.5 py-1 bg-brand-bg border border-brand-border rounded-md">DOCX</span>
                    <span className="px-2.5 py-1 bg-brand-bg border border-brand-border rounded-md">TXT</span>
                    <span className="px-2.5 py-1 bg-brand-bg border border-brand-border rounded-md">PNG / JPG</span>
                    <span className="px-2.5 py-1 text-text-muted">Max 5MB</span>
                  </div>

                  <button className="px-6 py-2.5 bg-brand-primary hover:bg-brand-hover text-white rounded-lg font-medium text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer">
                    <FileText size={16} /> Select Resume File
                  </button>
                </div>

                {/* Analytical Best Practices Bar */}
                <div className="mt-8 pt-6 border-t border-brand-border/60 w-full grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-bg/40 border border-brand-border/40">
                    <ShieldCheck size={18} className="text-brand-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-text-main">100% Private</h4>
                      <p className="text-[11px] text-text-secondary mt-0.5">Your files are scanned in memory and never stored permanently.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-bg/40 border border-brand-border/40">
                    <Search size={18} className="text-brand-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-text-main">Heading & Format Analysis</h4>
                      <p className="text-[11px] text-text-secondary mt-0.5">Ensures standard section labels are detected by parsers.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-bg/40 border border-brand-border/40">
                    <FileCheck size={18} className="text-brand-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-text-main">Instant Actionable Feedback</h4>
                      <p className="text-[11px] text-text-secondary mt-0.5">Receive clear recommendations to improve your ATS score.</p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* State 2: Results View */}
      {score !== null && (
        <div className="animate-fade-in flex flex-col gap-6">
          
          {/* Main Hero Score Summary Card */}
          <div className="relative bg-brand-surface border border-brand-border rounded-2xl shadow-xl p-6 sm:p-8 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-left z-10 flex-1">
              
              {/* Document File Name Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-bg border border-brand-border text-xs font-medium text-text-secondary mb-3">
                <FileText size={14} className="text-brand-primary" />
                <span className="truncate max-w-50 sm:max-w-xs">{fileName || 'Resume Document'}</span>
              </div>
              
              {/* Score Headline */}
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-text-main mb-2">
                {score >= 80 
                  ? "Excellent! Your resume is ATS-Ready" 
                  : score >= 50 
                    ? "Moderate Risk: Needs Section Improvements" 
                    : "High ATS Rejection Risk"}
              </h3>
              
              <p className="text-text-secondary text-sm max-w-md mb-6 leading-relaxed">
                {score >= 80 
                  ? "Your resume passes major structural and readability checks required by corporate applicant tracking systems." 
                  : score >= 50 
                    ? "Your resume is missing key standard sections or formatted items that standard ATS parsers look for." 
                    : "Your resume structure may be difficult for ATS parsers to index, which could result in automated rejection."}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                <button 
                  onClick={resetScanner}
                  className="px-4 py-2 bg-brand-bg hover:bg-brand-surface-hover border border-brand-border text-text-main rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw size={14} /> Scan Another File
                </button>

                <Link
                  to="/dashboard/resume/builder"
                  className="px-5 py-2 bg-brand-primary hover:bg-brand-hover text-text-main rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Sliders size={14} /> Fix in Resume Builder
                </Link>
              </div>
            </div>

            {/* Circular Meter */}
            <div className="z-10 shrink-0 flex flex-col items-center">
              <CircularScore score={score} />
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-brand-surface border border-brand-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-status-success/10 text-status-success flex items-center justify-center shrink-0">
                <CheckCircle size={20} />
              </div>
              <div>
                <span className="text-xs text-text-muted block">Passed Checks</span>
                <span className="text-lg font-bold text-text-main font-heading">{passedCount} / {feedback.length}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-brand-surface border border-brand-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-status-error/10 text-status-error flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <span className="text-xs text-text-muted block">Issues Found</span>
                <span className="text-lg font-bold text-text-main font-heading">{failedCount} Item{failedCount !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-brand-surface border border-brand-border flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                <FileCheck size={20} />
              </div>
              <div>
                <span className="text-xs text-text-muted block">Parser Status</span>
                <span className="text-sm font-bold text-text-main font-heading">
                  {score >= 80 ? 'Optimal' : 'Needs Work'}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Feedback List */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-text-muted tracking-widest uppercase px-1">
              Detailed ATS Check Breakdown
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedback.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3
                    ${item.passed 
                      ? 'bg-brand-surface border-brand-border' 
                      : 'bg-status-error/5 border-status-error/20'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      item.passed ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'
                    }`}>
                      {item.passed ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    </div>
                    <div>
                      <h5 className="font-semibold text-text-main text-sm">{item.name}</h5>
                      <p className={`text-xs mt-1 leading-relaxed ${item.passed ? 'text-text-secondary' : 'text-status-error/90 font-medium'}`}>
                        {item.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Builder Integration CTA Banner */}
          <div className="relative overflow-hidden bg-brand-surface border border-brand-border rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 border border-brand-primary/20">
                <Sparkles size={24} />
              </div>
              <div>
                <h4 className="font-heading text-lg font-bold text-text-main">
                  Build an ATS-Perfect Resume in Minutes
                </h4>
                <p className="text-xs text-text-secondary mt-1">
                  Use our live Resume Builder with pre-structured templates that guarantee 100% ATS readability.
                </p>
              </div>
            </div>

            <Link
              to="/dashboard/resume/builder"
              className="px-6 py-3 bg-brand-primary hover:bg-brand-hover text-text-main rounded-lg font-semibold text-xs transition-all shadow-md flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Open Resume Builder</span>
              <ArrowRight size={16} />
            </Link>
          </div>

        </div>
      )}
    </div>
  );
};

export default ResumeScanner;

