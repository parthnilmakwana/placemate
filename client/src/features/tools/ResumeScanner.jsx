import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, ArrowRight, Activity, UploadCloud } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { useAuth } from '../../context/AuthContext';

// Configure the PDF.js worker to run in the background (Performance Optimization)
// We use a CDN to fetch the exact version worker without complex bundler configuration.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const ResumeScanner = () => {
  const { user } = useAuth();
  
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  // Extract text completely in the browser (Privacy & Performance)
  const extractTextFromFile = async (file) => {
    try {
      setIsParsing(true);
      
      if (file.type === 'text/plain') {
        const text = await file.text();
        handleScan(text);
      } else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        
        // Parse the PDF
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        
        // Iterate through all pages and extract text blocks
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + ' ';
        }
        
        handleScan(fullText);
      }
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Failed to read the file. It might be corrupted or protected.");
      setIsParsing(false);
    }
  };

  const handleFileUpload = (file) => {
    // Validate file type
    if (file.type !== 'application/pdf' && file.type !== 'text/plain') {
      alert("Please upload a .pdf or .txt file.");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Please upload a file smaller than 5MB.");
      return;
    }

    setFileName(file.name);
    setScore(null);
    extractTextFromFile(file);
  };

  const handleScan = (extractedText) => {
    if (!extractedText || !extractedText.trim()) {
      setIsParsing(false);
      alert("No text could be extracted from this file. It might be an image-based PDF.");
      return;
    }
    
    setIsParsing(false);
    setIsScanning(true);
    
    // Simulate network delay for UX effect (makes it feel authoritative)
    setTimeout(() => {
      const text = extractedText.toLowerCase();
      
      // Regex logic to check for critical ATS sections
      const criteria = [
        { name: 'Education Section', regex: /\b(education|university|college|degree)\b/i, weight: 20 },
        { name: 'Experience Section', regex: /\b(experience|employment|work history|career)\b/i, weight: 30 },
        { name: 'Skills Section', regex: /\b(skills|technologies|proficiencies|tools)\b/i, weight: 20 },
        { name: 'Projects Section', regex: /\b(projects|portfolio|personal work)\b/i, weight: 15 },
        { name: 'Contact Info', regex: /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|phone|email|linkedin|github)\b/i, weight: 15 },
      ];

      let currentScore = 0;
      const newFeedback = [];

      criteria.forEach(item => {
        const passed = item.regex.test(text);
        if (passed) {
          currentScore += item.weight;
          newFeedback.push({ name: item.name, passed: true, message: 'Found' });
        } else {
          newFeedback.push({ name: item.name, passed: false, message: 'Missing' });
        }
      });

      setScore(currentScore);
      setFeedback(newFeedback);
      setIsScanning(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
          
          <div className="mb-2">
            <label className="block text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
              <UploadCloud size={18} />
              Upload Your Resume
            </label>
            
            {/* Professional Drag and Drop Zone */}
            <div 
              className={`relative w-full h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden
                ${isDragging ? 'border-brand-primary bg-brand-primary/10 scale-[1.02]' : 'border-white/20 bg-[#090d16] hover:border-white/40 hover:bg-white/5'}
                ${(isParsing || isScanning) ? 'opacity-80 pointer-events-none' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input 
                id="file-upload" 
                type="file" 
                accept=".pdf,.txt" 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }} 
              />
              
              {isParsing || isScanning ? (
                <div className="flex flex-col items-center gap-4 text-brand-primary animate-fade-in">
                  <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
                  <span className="font-bold text-lg">
                    {isParsing ? 'Extracting Text...' : 'Scanning for ATS Keywords...'}
                  </span>
                </div>
              ) : fileName && score !== null ? (
                <div className="flex flex-col items-center gap-3 text-emerald-400 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                    <CheckCircle size={32} />
                  </div>
                  <span className="font-bold text-lg">{fileName}</span>
                  <span className="text-xs text-slate-400">Click or drop a different file to re-scan</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-slate-400 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2 border border-white/10 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-colors">
                    <UploadCloud size={32} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-white mb-1 text-lg">Click to upload or drag and drop</p>
                    <p className="text-sm">PDF or TXT files only (Max 5MB)</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          {score !== null && (
            <div className="mt-10 pt-10 border-t border-white/10 animate-fade-in">
              <div className="text-center mb-8">
                <h3 className="font-heading text-2xl font-bold text-white mb-2">Your ATS Match Score</h3>
                <div className={`text-6xl font-black ${score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {score}%
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {feedback.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-[#090d16] border border-white/5 hover:border-white/10 transition-colors">
                    <span className="text-slate-300 font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                      {item.passed ? (
                        <>
                          <span className="text-emerald-500 text-sm font-bold">{item.message}</span>
                          <CheckCircle size={18} className="text-emerald-500" />
                        </>
                      ) : (
                        <>
                          <span className="text-rose-500 text-sm font-bold">{item.message}</span>
                          <XCircle size={18} className="text-rose-500" />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* High-Converting CTA */}
              <div className="bg-gradient-to-br from-brand-primary/20 to-brand-primary/5 border border-brand-primary/30 rounded-2xl p-6 md:p-8 text-center shadow-lg">
                <h4 className="font-heading text-xl font-bold text-white mb-3">Want to reach 100% instantly?</h4>
                <p className="text-slate-300 mb-6">
                  Don't let formatting errors cost you the interview. Let our AI rewrite and reformat your resume to bypass ATS filters automatically.
                </p>
                {user ? (
                  <Link to="/dashboard/profile" className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-4 rounded-xl font-medium transition-transform transform hover:scale-105 shadow-lg shadow-brand-primary/20">
                    Fill profile to fix resume
                    <ArrowRight size={20} />
                  </Link>
                ) : (
                  <Link to="/register" className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white px-8 py-4 rounded-xl font-medium transition-transform transform hover:scale-105 shadow-lg shadow-brand-primary/20">
                    Fix my resume with AI
                    <ArrowRight size={20} />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default ResumeScanner;
