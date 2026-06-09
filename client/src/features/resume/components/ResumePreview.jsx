import React, { useEffect, useState, useRef, useMemo } from 'react';
import { BlobProvider, PDFDownloadLink } from '@react-pdf/renderer';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { registerFonts } from '../utils/fonts';
import ModernProfessionalTheme from '../templates/ModernProfessional';
import MinimalCleanTheme from '../templates/MinimalClean';
import ExecutiveCorporateTheme from '../templates/ExecutiveCorporate';
import SoftwareEngineerTheme from '../templates/SoftwareEngineer';
import { Download, Loader2, ZoomIn, ZoomOut, Maximize, Expand, RefreshCcw } from 'lucide-react';

// Setup pdf.js worker dynamically matching the installed API version to prevent mismatches
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Create a map of available themes
const themes = {
  modern: ModernProfessionalTheme,
  minimal: MinimalCleanTheme,
  executive: ExecutiveCorporateTheme,
  software: SoftwareEngineerTheme,
};

const A4_ASPECT_RATIO = 210 / 297; // standard A4 ratio

const ResumePreview = ({ user, profile, settings, optimize }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [pdfError, setPdfError] = useState(null);

  useEffect(() => {
    // Register fonts on mount before rendering the PDF
    try {
      registerFonts();
      setFontsLoaded(true);
    } catch (err) {
      console.error('Error loading fonts:', err);
      setFontsLoaded(true); 
    }
  }, []);

  // Track container size
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Fit Width Logic (assuming standard A4 width is around ~600px internally rendered by react-pdf)
  // Actually, react-pdf renders A4 at 595.28px width by default.
  const handleFitWidth = () => {
    if (containerDimensions.width) {
      // Subtracting some padding (e.g., 64px total for nice margins)
      const targetWidth = containerDimensions.width - 64;
      const newScale = targetWidth / 595.28;
      setScale(Math.max(0.5, Math.min(newScale, 3))); // Cap between 0.5 and 3
    }
  };

  // Fit Page Logic
  const handleFitPage = () => {
    if (containerDimensions.height && containerDimensions.width) {
      // Target height minus some toolbar/padding space
      const targetHeight = containerDimensions.height - 120;
      const targetWidth = containerDimensions.width - 64;
      
      const scaleByHeight = targetHeight / 841.89; // A4 height at 72dpi
      const scaleByWidth = targetWidth / 595.28;
      
      // Use the smaller scale so the whole page is visible
      const newScale = Math.min(scaleByHeight, scaleByWidth);
      setScale(Math.max(0.3, Math.min(newScale, 3)));
    }
  };

  // Initial fit page when container loads
  useEffect(() => {
    if (containerDimensions.height > 0 && scale === 1) {
      handleFitPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerDimensions.height > 0]);

  const zoomIn = () => setScale(s => Math.min(s + 0.25, 3));
  const zoomOut = () => setScale(s => Math.max(s - 0.25, 0.5));
  const resetZoom = () => setScale(1);

  const SelectedTheme = themes[settings.themeId] || ModernProfessionalTheme;

  const PDFDocument = useMemo(() => (
    <SelectedTheme user={user} profile={profile} settings={settings} optimize={optimize} />
  ), [SelectedTheme, user, profile, settings, optimize]);

  if (!fontsLoaded) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-slate-950/20 rounded-2xl border border-white/5 shadow-xl min-h-[600px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-secondary animate-spin" />
          <span className="text-sm text-slate-400 font-medium">Loading document renderer...</span>
        </div>
      </div>
    );
  }

  const fileName = `${user?.name ? user.name.replace(/\s+/g, '_') : 'My'}_Resume.pdf`;

  return (
    <div className="flex flex-col w-full h-full bg-slate-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative">
      
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-slate-800/90 backdrop-blur-md border-b border-white/10 shadow-sm">
        
        <div className="flex items-center gap-1 bg-slate-900/50 p-1 rounded-lg border border-white/5">
          <button onClick={zoomOut} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Zoom Out">
            <ZoomOut size={16} />
          </button>
          <div className="px-2 text-xs font-medium text-slate-300 min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </div>
          <button onClick={zoomIn} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Zoom In">
            <ZoomIn size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={resetZoom} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium" title="100% Zoom">
            <RefreshCcw size={14} /> <span className="hidden sm:inline">100%</span>
          </button>
          <button onClick={handleFitWidth} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium" title="Fit Width">
            <Maximize size={14} /> <span className="hidden sm:inline">Width</span>
          </button>
          <button onClick={handleFitPage} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium" title="Fit Page">
            <Expand size={14} /> <span className="hidden sm:inline">Page</span>
          </button>
          <div className="w-px h-4 bg-white/10 mx-1"></div>
          
          <PDFDownloadLink document={PDFDocument} fileName={fileName}>
            {({ loading }) => (
              <button
                disabled={loading}
                className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md font-bold text-xs cursor-pointer transition-all duration-200 bg-brand-primary hover:bg-brand-primary-hover text-white disabled:opacity-75"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                <span className="hidden sm:inline">{loading ? 'Generating...' : 'Download'}</span>
              </button>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      {/* Preview Scroll Area */}
      <div 
        className="flex-1 overflow-auto bg-slate-950/50 p-4 sm:p-8 flex flex-col"
        ref={containerRef}
      >
        <BlobProvider document={PDFDocument}>
          {({ blob, url, loading, error }) => {
            if (error) {
              return <div className="text-red-400 m-auto text-sm">Error generating document: {error.message}</div>;
            }
            if (loading || !url) {
              return (
                <div className="m-auto flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-brand-secondary animate-spin" />
                  <span className="text-sm text-slate-400 font-medium">Generating Exact PDF Preview...</span>
                </div>
              );
            }

            if (pdfError) {
              return (
                <div className="w-full h-full flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl">
                  <div className="bg-amber-500/10 text-amber-500 p-2 text-[10px] text-center border-b border-amber-500/20 font-medium">
                    Viewer fallback active: {pdfError}
                  </div>
                  <iframe src={`${url}#toolbar=0&view=FitH`} className="w-full flex-1 border-none bg-white" title="Resume Preview" />
                </div>
              );
            }

            return (
              <Document
                file={url} // Using url as blob fallback can sometimes fail depending on browser memory limits
                onLoadError={(error) => {
                  console.error('react-pdf error:', error);
                  setPdfError(error.message || 'Unknown error');
                }}
                onSourceError={(error) => {
                  console.error('react-pdf source error:', error);
                  setPdfError(error.message || 'Invalid PDF source');
                }}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                loading={
                  <div className="m-auto flex flex-col items-center gap-3 pt-10">
                    <Loader2 className="w-6 h-6 text-brand-secondary animate-spin" />
                    <span className="text-sm text-slate-400">Rendering pages...</span>
                  </div>
                }
                className="flex flex-col gap-6 mx-auto w-fit"
              >
                {Array.from(new Array(numPages || 0), (el, index) => (
                  <div key={`page_${index + 1}`} className="shadow-2xl ring-1 ring-black/10 rounded-sm overflow-hidden bg-white mx-auto">
                    <Page 
                      pageNumber={index + 1} 
                      scale={scale} 
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      loading={<div className="bg-white/10 animate-pulse w-[595px] h-[841px] max-w-full"></div>}
                    />
                  </div>
                ))}
              </Document>
            );
          }}
        </BlobProvider>
      </div>

    </div>
  );
};

export default ResumePreview;
