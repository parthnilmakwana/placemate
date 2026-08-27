import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { BlobProvider, PDFDownloadLink } from '@react-pdf/renderer';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { registerFonts } from '../utils/fonts';
import ModernProfessionalTheme from '../templates/ModernProfessional';
import MinimalCleanTheme from '../templates/MinimalClean';
import ExecutiveCorporateTheme from '../templates/ExecutiveCorporate';
import SoftwareEngineerTheme from '../templates/SoftwareEngineer';
import { Download, Loader2, ZoomIn, ZoomOut, Maximize, Expand, RefreshCcw, ChevronLeft, ChevronRight, Layers, FileText } from 'lucide-react';

// Setup pdf.js worker dynamically matching the installed API version to prevent mismatches
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Create a map of available themes
const themes = {
  modern: ModernProfessionalTheme,
  minimal: MinimalCleanTheme,
  executive: ExecutiveCorporateTheme,
  software: SoftwareEngineerTheme,
};

const ResumePreview = ({ user, profile, settings, optimize }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [numPages, setNumPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'single'
  const [scale, setScale] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 0.5;
    }
    return 0.9;
  });
  const containerRef = useRef(null);
  const pageRefs = useRef({});
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [pdfError, setPdfError] = useState(null);
  const isInitialSet = useRef(false);

  useEffect(() => {
    try {
      registerFonts();
      setFontsLoaded(true);
    } catch (err) {
      console.error('Error loading fonts:', err);
      setFontsLoaded(true); 
    }
  }, []);

  // Track container dimensions with ResizeObserver
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

  // Calculate Fit Width Scale based on container width
  const calculateFitWidthScale = useCallback(() => {
    if (!containerDimensions.width) return 0.9;
    const padding = containerDimensions.width < 500 ? 24 : 48;
    const availableWidth = containerDimensions.width - padding;
    const computedScale = availableWidth / 595.28;
    return Math.max(0.4, Math.min(computedScale, 2.2));
  }, [containerDimensions.width]);

  // Calculate Fit Page Scale based on container width & height
  const calculateFitPageScale = useCallback(() => {
    if (!containerDimensions.height || !containerDimensions.width) return 0.7;
    const paddingY = 64;
    const paddingX = containerDimensions.width < 500 ? 24 : 48;
    const availableHeight = containerDimensions.height - paddingY;
    const availableWidth = containerDimensions.width - paddingX;

    const scaleByHeight = availableHeight / 841.89;
    const scaleByWidth = availableWidth / 595.28;

    const computedScale = Math.min(scaleByHeight, scaleByWidth);
    const minFloor = containerDimensions.width < 500 ? 0.2 : 0.65;
    return Math.max(minFloor, Math.min(computedScale, 2.2));
  }, [containerDimensions.width, containerDimensions.height]);

  // Handle Fit Width Button click
  const handleFitWidth = () => {
    setScale(calculateFitWidthScale());
  };

  // Handle Fit Page Button click
  const handleFitPage = () => {
    setScale(calculateFitPageScale());
  };

  const isMobileRef = useRef(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  // Responsive default scale logic: 50% for mobile view (<768px), 90% for laptop view (>=768px)
  useEffect(() => {
    if (containerDimensions.width > 0) {
      const isMobile = (typeof window !== 'undefined' && window.innerWidth < 768) || containerDimensions.width < 768;
      if (!isInitialSet.current) {
        isInitialSet.current = true;
        isMobileRef.current = isMobile;
        setScale(isMobile ? 0.5 : 0.9);
      } else if (isMobileRef.current !== isMobile) {
        isMobileRef.current = isMobile;
        setScale(isMobile ? 0.5 : 0.9);
      }
    }
  }, [containerDimensions.width]);

  const displayPercentage = Math.round(scale * 100);

  const zoomIn = () => setScale(s => Math.min(s + 0.1, 2.5));
  const zoomOut = () => setScale(s => Math.max(s - 0.1, 0.25));
  const resetZoom = () => setScale(1.0);

  // Page Navigation Handlers
  const handlePrevPage = () => {
    setCurrentPage(p => {
      const next = Math.max(1, p - 1);
      if (viewMode === 'all' && pageRefs.current[next]) {
        pageRefs.current[next].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return next;
    });
  };

  const handleNextPage = () => {
    setCurrentPage(p => {
      const next = Math.min(numPages || 1, p + 1);
      if (viewMode === 'all' && pageRefs.current[next]) {
        pageRefs.current[next].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return next;
    });
  };

  const SelectedTheme = themes[settings.themeId] || ModernProfessionalTheme;

  const PDFDocument = useMemo(() => (
    <SelectedTheme user={user} profile={profile} settings={settings} optimize={optimize} />
  ), [SelectedTheme, user, profile, settings, optimize]);

  if (!fontsLoaded) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-slate-950/20 rounded-2xl border border-white/5 shadow-xl min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
          <span className="text-sm text-text-muted font-medium">Loading document renderer...</span>
        </div>
      </div>
    );
  }

  const displayName = profile?.fullName || user?.name;
  const fileName = `${displayName ? displayName.replace(/\s+/g, '_') : 'My'}_Resume.pdf`;
  const highDpiRatio = typeof window !== 'undefined' ? Math.max(2, window.devicePixelRatio || 1) : 2;

  return (
    <div className="flex flex-col w-full h-full bg-bg-sidebar rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative">
      
      {/* Sticky Controls Header */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-slate-800/95 backdrop-blur-md border-b border-white/10 shadow-sm text-xs select-none">
        
        {/* Left: Page Navigation Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-lg border border-white/5">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1 text-text-muted hover:text-text-main hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-[11px] font-semibold text-text-main px-1.5 whitespace-nowrap">
            Page {currentPage} of {numPages || 1}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= (numPages || 1)}
            className="p-1 text-text-muted hover:text-text-main hover:bg-white/10 rounded disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-colors"
            title="Next Page"
          >
            <ChevronRight size={15} />
          </button>
          
          <div className="w-px h-3.5 bg-white/10 mx-1"></div>

          <button
            onClick={() => setViewMode(v => v === 'all' ? 'single' : 'all')}
            className={`p-1 rounded text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              viewMode === 'single' ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30' : 'text-text-muted hover:text-text-main hover:bg-white/10'
            }`}
            title={viewMode === 'all' ? 'Switch to Single Page view' : 'Switch to Continuous scroll'}
          >
            {viewMode === 'all' ? <Layers size={13} /> : <FileText size={13} />}
            <span className="hidden md:inline">{viewMode === 'all' ? 'All Pages' : 'Single Page'}</span>
          </button>
        </div>

        {/* Center: Zoom Controls & Presets */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-white/5">
            <button onClick={zoomOut} className="p-1 text-text-muted hover:text-text-main hover:bg-white/10 rounded cursor-pointer transition-colors" title="Zoom Out">
              <ZoomOut size={14} />
            </button>
            <span className="px-1.5 text-[11px] font-bold text-text-main min-w-[2.5rem] text-center">
              {displayPercentage}%
            </span>
            <button onClick={zoomIn} className="p-1 text-text-muted hover:text-text-main hover:bg-white/10 rounded cursor-pointer transition-colors" title="Zoom In">
              <ZoomIn size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setScale(0.5)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                displayPercentage === 50 ? 'bg-brand-primary text-text-main' : 'text-text-muted hover:text-text-main hover:bg-white/10'
              }`}
            >
              50%
            </button>
            <button
              onClick={() => setScale(0.75)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                displayPercentage === 75 ? 'bg-brand-primary text-text-main' : 'text-text-muted hover:text-text-main hover:bg-white/10'
              }`}
            >
              75%
            </button>
            <button
              onClick={() => setScale(0.9)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                displayPercentage === 90 ? 'bg-brand-primary text-text-main' : 'text-text-muted hover:text-text-main hover:bg-white/10'
              }`}
            >
              90%
            </button>
            <button
              onClick={resetZoom}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                displayPercentage === 100 ? 'bg-brand-primary text-text-main' : 'text-text-muted hover:text-text-main hover:bg-white/10'
              }`}
            >
              100%
            </button>
          </div>

          <div className="w-px h-4 bg-white/10 mx-0.5 hidden sm:block"></div>

          {/* Width & Fit Controls */}
          <button
            onClick={handleFitWidth}
            className="p-1.5 sm:px-2 sm:py-1 text-text-muted hover:text-text-main hover:bg-white/10 rounded transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
            title="Fit Page to Width"
          >
            <Maximize size={13} /> <span className="hidden sm:inline">Fit Width</span>
          </button>
          <button
            onClick={handleFitPage}
            className="p-1.5 sm:px-2 sm:py-1 text-text-muted hover:text-text-main hover:bg-white/10 rounded transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
            title="Fit Full Page"
          >
            <Expand size={13} /> <span className="hidden sm:inline">Fit Page</span>
          </button>
        </div>

      </div>

      {/* Preview Scroll Viewport */}
      <div 
        className="flex-1 overflow-auto bg-slate-950/60 p-4 sm:p-6 custom-scrollbar relative"
        ref={containerRef}
      >
        <BlobProvider document={PDFDocument}>
          {({ blob, url, loading, error }) => {
            if (error) {
              return (
                <div className="m-auto p-6 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-xs text-center max-w-md">
                  Error generating resume document: {error.message}
                </div>
              );
            }
            if (loading || !url) {
              return (
                <div className="m-auto flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                  <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
                    Rendering PDF Preview…
                  </span>
                </div>
              );
            }

            if (pdfError) {
              return (
                <div className="w-full h-full flex flex-col bg-white rounded-xl overflow-hidden shadow-2xl">
                  <div className="bg-amber-500/10 text-status-warning p-2 text-[10px] text-center border-b border-amber-500/20 font-medium">
                    Native Renderer Fallback: {pdfError}
                  </div>
                  <iframe src={`${url}#toolbar=0&view=FitH`} className="w-full flex-1 border-none bg-white" title="Resume Preview" />
                </div>
              );
            }

            // Determine which page index(es) to display
            const pagesToRender = viewMode === 'single'
              ? [currentPage]
              : Array.from(new Array(numPages || 1), (_, i) => i + 1);

            return (
              <Document
                file={url}
                onLoadError={(err) => {
                  console.error('react-pdf error:', err);
                  setPdfError(err.message || 'Unknown error');
                }}
                onSourceError={(err) => {
                  console.error('react-pdf source error:', err);
                  setPdfError(err.message || 'Invalid PDF source');
                }}
                onLoadSuccess={({ numPages: count }) => {
                  setNumPages(count);
                  if (currentPage > count) setCurrentPage(1);
                }}
                loading={
                  <div className="mx-auto flex flex-col items-center gap-3 pt-10">
                    <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
                    <span className="text-xs text-text-muted">Loading pages...</span>
                  </div>
                }
                className="flex flex-col gap-6 items-center mx-auto w-fit"
              >
                {pagesToRender.map((pageNum) => (
                  <div
                    key={`page_${pageNum}`}
                    ref={(el) => (pageRefs.current[pageNum] = el)}
                    className="shadow-2xl ring-1 ring-black/15 rounded-sm overflow-hidden bg-white transition-transform duration-150"
                  >
                    <Page 
                      pageNumber={pageNum} 
                      scale={scale} 
                      devicePixelRatio={highDpiRatio}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      loading={
                        <div
                          style={{
                            width: `${595.28 * scale}px`,
                            height: `${841.89 * scale}px`,
                          }}
                          className="bg-white/10 animate-pulse flex items-center justify-center text-text-muted text-xs font-mono"
                        >
                          Rendering Page {pageNum}...
                        </div>
                      }
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
