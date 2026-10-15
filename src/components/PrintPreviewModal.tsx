import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Printer,
  FileDown,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  Loader2,
  FileCode,
  MoveHorizontal,
} from 'lucide-react';
import { Invoice } from '../types';
import { InvoicePaper } from './InvoicePaper';
import { downloadInvoicePDF, downloadPrintableHTML } from '../utils/pdfExport';
import { printInvoiceElement } from '../utils/printHelper';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  const [scale, setScale] = useState<number>(0.65);
  const [fitMode, setFitMode] = useState<'page' | 'width' | 'custom'>('page');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printNotice, setPrintNotice] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [showMargins, setShowMargins] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Auto-calculate scale to fit the entire A4 page or width
  const updateFitScale = useCallback((mode: 'page' | 'width') => {
    if (!viewportRef.current) return;
    const vw = viewportRef.current.clientWidth - 48; // padding margin
    const vh = viewportRef.current.clientHeight - 48;
    const paperW = 800;
    const paperH = 1130;

    if (mode === 'page') {
      const calculatedScale = Math.min(vw / paperW, vh / paperH);
      const clamped = Math.min(1.2, Math.max(0.35, Math.round(calculatedScale * 100) / 100));
      setScale(clamped);
      setFitMode('page');
    } else if (mode === 'width') {
      const calculatedScale = vw / paperW;
      const clamped = Math.min(1.5, Math.max(0.4, Math.round(calculatedScale * 100) / 100));
      setScale(clamped);
      setFitMode('width');
    }
  }, []);

  // Update on open or window resize
  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure modal is rendered and dimensions are available
    const timer = setTimeout(() => {
      updateFitScale('page');
    }, 50);

    const handleResize = () => {
      if (fitMode === 'page') {
        updateFitScale('page');
      } else if (fitMode === 'width') {
        updateFitScale('width');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, fitMode, updateFitScale]);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    setStatusMessage('Compiling centered A4 PDF...');

    const success = await downloadInvoicePDF(invoice, {
      filename: `${invoice.invoiceNumber}_Univision_Invoice.pdf`,
      onProgress: (msg) => setStatusMessage(msg),
    });

    setIsGeneratingPDF(false);
    setStatusMessage(success ? 'PDF downloaded!' : 'Download failed');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleSystemPrint = async () => {
    setIsPrinting(true);
    setStatusMessage('Preparing print copy & opening printer dialog...');

    // 1. Trigger isolated iframe print (renders exact styled document)
    try {
      printInvoiceElement('univision-invoice-preview-sheet');
    } catch (e) {
      console.warn('Iframe print error', e);
    }

    // 2. Also attempt window.print() after small delay
    setTimeout(() => {
      try {
        window.print();
      } catch (err) {
        console.warn('System window.print blocked', err);
      }
    }, 200);

    // 3. Immediately compile and download high-resolution centered A4 PDF
    // to guarantee the user has the exact printable document ready in any browser environment
    try {
      setStatusMessage('Saving centered A4 PDF print file...');
      const success = await downloadInvoicePDF(invoice, {
        filename: `${invoice.invoiceNumber}_Univision_Invoice.pdf`,
        onProgress: (msg) => setStatusMessage(msg),
      });

      if (success) {
        setStatusMessage('Print command sent & A4 PDF downloaded!');
        setPrintNotice(
          'Print dialog triggered! A centered high-resolution A4 PDF has also been saved to your downloads for direct printing.'
        );
      } else {
        setStatusMessage('Print command sent');
      }
    } catch (err) {
      console.error('Error generating PDF during print', err);
      setStatusMessage('Print command sent');
    } finally {
      setIsPrinting(false);
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  const handleDownloadHTML = () => {
    downloadPrintableHTML(invoice);
    setStatusMessage('Standalone HTML downloaded!');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleZoomIn = () => {
    setFitMode('custom');
    setScale((s) => Math.min(1.5, Math.round((s + 0.1) * 10) / 10));
  };

  const handleZoomOut = () => {
    setFitMode('custom');
    setScale((s) => Math.max(0.35, Math.round((s - 0.1) * 10) / 10));
  };

  const handleActualSize = () => {
    setFitMode('custom');
    setScale(1.0);
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md overflow-hidden animate-fade-in">
      {/* 
        =======================================================================
        TOP CONTROLS & ACTION BAR
        =======================================================================
      */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-lg">
        {/* Left: Title & Page Specs */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0b2341] rounded-lg border border-blue-500/30 text-amber-400 shrink-0">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Print Preview: {invoice.invoiceNumber}
              </h3>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                A4 (210 × 297 mm)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Review centered paper alignment, page fit, and margins before printing.
            </p>
          </div>
        </div>

        {/* Center: Zoom & Fit Controls */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-lg border border-slate-700/70 text-xs">
          {/* Fit to Page Button */}
          <button
            type="button"
            onClick={() => updateFitScale('page')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors flex items-center gap-1 cursor-pointer ${
              fitMode === 'page'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Fit entire A4 page on screen without scrolling"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Fit Page</span>
          </button>

          {/* Fit to Width Button */}
          <button
            type="button"
            onClick={() => updateFitScale('width')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors flex items-center gap-1 cursor-pointer ${
              fitMode === 'width'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Fit paper width to screen"
          >
            <MoveHorizontal className="w-3.5 h-3.5" />
            <span>Fit Width</span>
          </button>

          {/* 100% Actual Size */}
          <button
            type="button"
            onClick={handleActualSize}
            className={`px-2 py-1 text-[11px] font-mono rounded transition-colors cursor-pointer ${
              scale === 1.0 && fitMode === 'custom'
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
            title="Actual 1:1 scale"
          >
            100%
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="font-mono text-[11px] px-1.5 text-slate-200 tabular-nums min-w-[42px] text-center">
            {Math.round(scale * 100)}%
          </span>

          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

          {/* Margin Guide Toggle */}
          <button
            type="button"
            onClick={() => setShowMargins((m) => !m)}
            className={`px-2 py-1 text-[11px] rounded transition-colors cursor-pointer ${
              showMargins
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle 8mm page print boundary guide"
          >
            Margins
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Status Message */}
          {statusMessage && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 animate-fade-in mr-2">
              <Check className="w-3.5 h-3.5" />
              {statusMessage}
            </span>
          )}

          {/* Download Standalone HTML */}
          <button
            type="button"
            onClick={handleDownloadHTML}
            className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download standalone HTML with embedded print script"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">HTML Print</span>
          </button>

          {/* Download Exact PDF */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            title="Download centered A4 PDF document"
          >
            {isGeneratingPDF ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            <span>Download A4 PDF</span>
          </button>

          {/* System Print */}
          <button
            type="button"
            onClick={handleSystemPrint}
            disabled={isPrinting || isGeneratingPDF}
            className="px-4 py-1.5 text-xs font-bold text-white bg-[#0b2341] hover:bg-[#133863] border border-blue-500/50 hover:border-amber-400/60 disabled:opacity-60 rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            title="Send directly to printer or system print dialog"
          >
            {isPrinting ? (
              <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            ) : (
              <Printer className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{isPrinting ? 'Printing...' : 'Print Now'}</span>
          </button>

          {/* Close Modal */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2 cursor-pointer"
            title="Close Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Print Notice Banner */}
      {printNotice && (
        <div className="bg-emerald-950/95 border-b border-emerald-500/50 px-4 md:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-200 shrink-0 shadow-md">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{printNotice}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadHTML}
              className="text-emerald-300 hover:text-white underline text-xs cursor-pointer font-semibold"
            >
              HTML Print
            </button>
            <button
              type="button"
              onClick={() => setPrintNotice(null)}
              className="text-emerald-400 hover:text-white px-2 py-0.5 rounded bg-emerald-900/60 hover:bg-emerald-800 text-[11px] cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 
        =======================================================================
        PAGE VIEWPORT / SCROLL CANVAS
        Renders the centered A4 paper sheet with photorealistic margins
        =======================================================================
      */}
      <main
        ref={viewportRef}
        className="flex-1 overflow-auto p-4 sm:p-6 flex justify-center items-start bg-slate-950/90 w-full min-h-0"
      >
        <div
          style={{
            width: `${Math.round(800 * scale)}px`,
            height: `${Math.round(1130 * scale)}px`,
            transition: 'width 150ms ease-out, height 150ms ease-out',
          }}
          className="relative shrink-0 my-auto mx-auto"
        >
          {/* Simulated A4 Paper (Standard 210mm x 297mm proportions) */}
          <div
            className={`absolute top-0 left-0 origin-top-left bg-white text-slate-900 shadow-2xl rounded-xs overflow-hidden transition-all ${
              showMargins ? 'ring-2 ring-dashed ring-amber-400/80 ring-offset-4 ring-offset-slate-950' : ''
            }`}
            style={{
              width: '800px', // Standard desktop A4 pixel render width
              height: '1130px', // A4 aspect ratio 1 : 1.4142 (800 * 1.4142 ≈ 1131px)
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              boxSizing: 'border-box',
            }}
          >
            {/* 8mm Margin Guide Indicator */}
            {showMargins && (
              <div
                className="absolute inset-[30px] border border-dashed border-amber-500/60 pointer-events-none z-10 flex items-start justify-end p-2 text-[9px] font-mono text-amber-600"
                aria-hidden="true"
              >
                <span>8mm Print Safety Boundary</span>
              </div>
            )}

            {/* The Live Invoice Paper */}
            <div className="w-full flex justify-center h-full">
              <InvoicePaper
                id="univision-invoice-preview-sheet"
                invoice={invoice}
                isInteractive={false}
                className="shadow-none border-0"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom helper footer */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-2 flex items-center justify-between text-xs text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span>Centered Page Layout</span>
          <span>·</span>
          <span>Margins Balanced (Left & Right)</span>
          <span>·</span>
          <span>Resolution: 300 DPI</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white underline cursor-pointer"
          >
            Return to Editor
          </button>
        </div>
      </footer>
    </div>
  );
};
