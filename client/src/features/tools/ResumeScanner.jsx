import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, ArrowRight, UploadCloud, RefreshCw, Sparkles, Zap, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

// Custom SVG Circular Progress
const CircularScore = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    if (score === null) return;
    
    // Animate score from 0 to actual score
    let start = 0;
    const duration = 1500;
    const increment = score / (duration / 16); // 60fps
    
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

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return '#10b981'; // success
    if (s >= 50) return '#f59e0b'; // warning
    return '#ef4444'; // error
  };
  
  const color = getColor(animatedScore);

  return (
    <div className="relative flex items-center justify-center animate-scale-in drop-shadow-xl">
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full blur-xl opacity-30" 
        style={{ backgroundColor: color }}
      ></div>
      
      <svg className="w-32 h-32 md:w-40 md:h-40 transform -rotate-90 relative z-10" viewBox="0 0 140 140">
        <circle
          className="text-brand-border"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="70"
          cy="70"
        />
        <circle
          style={{ 
            stroke: color,
            transition: 'stroke-dashoffset 0.1s ease-out'
          }}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="70"
          cy="70"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center z-20">
        <span className="text-4xl font-black tracking-tighter" style={{ color }}>
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
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  const extractTextFromFile = async (file) => {
    try {
      setIsParsing(true);
      
      // We now send the file directly to the backend to support OCR (images) and DOCX
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
        throw new Error(response.error || 'Failed to extract text');
      }
    } catch (error) {
      console.error("Error reading file:", error);
      alert(`Debug Error: ${error.message} | Server: ${error.response?.data?.error || 'N/A'} | Status: ${error.status || 'N/A'}`);
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
      alert("Please upload a PDF, DOCX, TXT, or Image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Please upload a file smaller than 5MB.");
      return;
    }

    setFileName(file.name);
    setScore(null);
    extractTextFromFile(file);
  };

  const handleScan = async (extractedText) => {
    if (!extractedText || !extractedText.trim()) {
      setIsParsing(false);
      alert("No text could be extracted from this file. It might be an image-based PDF.");
      return;
    }
    
    setIsParsing(false);
    setIsScanning(true);
    
    try {
      // Simulate network delay for that dramatic "scanning" UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await api.post('/api/ats/analyze-public', { text: extractedText });
      if (response && response.success) {
        setScore(response.data.score);
        setFeedback(response.data.feedback);
      } else {
        throw new Error('Invalid response from ATS engine');
      }
    } catch (error) {
      console.error("Error analyzing resume:", error);
      alert("Failed to analyze resume with our servers. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const resetScanner = () => {
    setScore(null);
    setFeedback([]);
    setFileName('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Upload & Analyzing View */}
      {score === null && (
        <div className="relative group animate-fade-in">
          {/* Animated decorative gradient border */}
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-brand-primary via-indigo-500 to-brand-secondary opacity-30 group-hover:opacity-70 transition duration-500 blur-sm"></div>
          
          <div className="relative bg-brand-surface border border-brand-border rounded-2xl shadow-2xl p-6 md:p-12 flex flex-col items-center justify-center text-center overflow-hidden">
            
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            
            {isParsing || isScanning ? (
              <div className="flex flex-col items-center justify-center py-10 animate-fade-in z-10 w-full">
                <div className="relative w-24 h-24 mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-brand-primary border-l-brand-primary animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-brand-primary">
                    <Sparkles size={24} className="animate-pulse" />
                  </div>
                </div>
                <h3 className="font-heading text-xl md:text-2xl font-bold text-text-main mb-2">
                  {isParsing ? 'Extracting Resume Text...' : 'Running ATS Algorithms...'}
                </h3>
                <p className="text-text-muted text-sm max-w-md mx-auto">
                  Our system is analyzing your resume against standard ATS parsers to ensure perfect readability.
                </p>
                
                {/* Fake progress bar for UX */}
                <div className="w-full max-w-xs h-1.5 bg-brand-bg rounded-full overflow-hidden mt-8">
                  <div className="h-full bg-brand-primary rounded-full animate-progress-indeterminate"></div>
                </div>
              </div>
            ) : (
              <div 
                className={`w-full py-8 md:py-12 px-4 md:px-6 flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all cursor-pointer z-10
                  ${isDragging ? 'border-brand-primary bg-brand-primary/5 scale-[1.02]' : 'border-border-strong hover:border-brand-primary/50 hover:bg-brand-bg/50'}
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
                
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-primary/10 to-brand-primary/30 flex items-center justify-center mb-6 shadow-inner text-brand-primary">
                  <UploadCloud size={36} />
                </div>
                
                <h3 className="font-heading text-xl md:text-2xl font-bold text-text-main mb-2 md:mb-3">Upload your Resume</h3>
                <p className="text-text-secondary max-w-md mx-auto mb-6 text-sm leading-relaxed">
                  Drag and drop your PDF, DOCX, or Image file here. We'll instantly extract the text and scan it for ATS compatibility.
                </p>
                
                <button className="px-6 py-2.5 bg-brand-primary text-white rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-brand-primary/30 transition-all flex items-center gap-2">
                  <FileText size={16} /> Browse Files
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results View */}
      {score !== null && (
        <div className="animate-fade-in flex flex-col gap-8">
          
          {/* Hero Score Card */}
          <div className="relative bg-brand-surface border border-brand-border rounded-2xl shadow-xl p-6 md:p-8 overflow-hidden flex flex-col md:flex-row items-center gap-6 md:gap-12 justify-center">
             <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 75%, currentColor 75%, currentColor), linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 75%, currentColor 75%, currentColor)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}></div>
            
            <div className="z-10 flex flex-col items-center md:items-start text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-elevated border border-border-strong text-xs font-semibold text-text-secondary mb-4 uppercase tracking-widest shadow-sm">
                <FileText size={12} className="text-brand-primary" /> {fileName}
              </span>
              <h2 className="font-heading text-2xl md:text-4xl font-bold text-text-main mb-2 md:mb-3">
                Your ATS Score
              </h2>
              <p className="text-text-secondary text-sm max-w-sm mb-6 leading-relaxed">
                {score >= 80 
                  ? "Great job! Your resume is highly readable by ATS systems and contains essential sections." 
                  : score >= 50 
                    ? "Your resume is missing some crucial standard sections that ATS systems look for." 
                    : "Your resume failed the basic ATS checks. It may be discarded before a human reads it."}
              </p>
              
              <button 
                onClick={resetScanner}
                className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-brand-primary transition-colors cursor-pointer"
              >
                <RefreshCw size={14} /> Scan another resume
              </button>
            </div>
            
            <div className="z-10 shrink-0">
              <CircularScore score={score} />
            </div>
          </div>

          {/* Feedback Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedback.map((item, idx) => (
              <div 
                key={idx} 
                className="group flex items-center justify-between p-4 md:p-5 rounded-xl bg-brand-surface border border-brand-border shadow-sm hover:border-brand-primary/40 hover:shadow-md transition-all duration-300"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                    item.passed ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'
                  }`}>
                    {item.passed ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-main text-sm mb-0.5">{item.name}</h4>
                    <p className={`text-xs font-medium ${item.passed ? 'text-status-success/80' : 'text-status-error/80'}`}>
                      {item.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Upsell / Call to Action */}
          <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl shadow-xl p-8 md:p-10 text-center text-white mt-4">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-20 transform rotate-12">
              <Zap size={200} />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <h4 className="font-heading text-2xl font-bold mb-3 shadow-black/10">Bypass the ATS instantly.</h4>
              <p className="text-white/80 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
                Don't let formatting errors or missing keywords cost you the interview. Let our AI completely rewrite and optimize your resume to guarantee a 100% ATS match.
              </p>
              {user ? (
                <Link to="/dashboard/profile" className="inline-flex items-center gap-2 bg-white text-brand-primary hover:bg-slate-50 px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  Fix my resume in the Dashboard
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <Link to="/register" className="inline-flex items-center gap-2 bg-white text-brand-primary hover:bg-slate-50 px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  Create Account to Fix Resume
                  <ArrowRight size={18} />
                </Link>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ResumeScanner;
