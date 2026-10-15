import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Building,
  User,
  Home,
  FileSpreadsheet,
  Check,
  FileText,
  CreditCard,
  Calendar,
  PenTool,
  ShieldCheck,
} from 'lucide-react';
import { Invoice } from '../types';
import { PACKAGES } from '../data/constants';
import { UnivisionLogo } from './UnivisionLogo';
import { calculateInvoice, formatCurrency, formatDateToSlash } from '../utils/calculations';

interface InvoicePaperProps {
  invoice: Invoice;
  id?: string;
  className?: string;
  onOpenSignatureModal?: () => void;
  onSelectPackage?: (type: 'regular' | 'premium') => void;
  isInteractive?: boolean;
}

export const InvoicePaper: React.FC<InvoicePaperProps> = ({
  invoice,
  id = 'univision-invoice-sheet',
  className = '',
  onOpenSignatureModal,
  onSelectPackage,
  isInteractive = true,
}) => {
  const calculations = calculateInvoice(invoice);
  const formattedDate = formatDateToSlash(invoice.date);
  const formattedDueDate = invoice.dueDate ? formatDateToSlash(invoice.dueDate) : '';

  return (
    <div
      id={id}
      className={`invoice-paper-sheet bg-white text-slate-800 shadow-xl border border-slate-200 mx-auto w-full max-w-[800px] font-sans p-5 sm:p-6 rounded-none sm:rounded-md transition-all select-text box-border ${className}`}
    >
      {/* 1. TOP HEADER SECTION */}
      <div className="grid grid-cols-12 items-center gap-2 pb-2.5 w-full">
        {/* Brand & Logo (Left, 5 cols) */}
        <div className="col-span-12 sm:col-span-5 shrink-0">
          <UnivisionLogo size="md" />
        </div>

        {/* Company Contact Details (Center, 4 cols) */}
        <div className="col-span-12 sm:col-span-4 flex flex-col text-[10px] sm:text-[10.5px] text-slate-600 gap-0.5 leading-tight px-1">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-medium text-slate-700">{invoice.company.phone}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-medium text-slate-700">{invoice.company.email}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-slate-700 truncate">{invoice.company.address}</span>
          </div>
        </div>

        {/* Right Gold Slogan (Right, 3 cols) */}
        <div className="col-span-12 sm:col-span-3 text-right pr-1">
          <div className="font-slogan italic text-sm sm:text-base font-medium text-[#c27803] leading-tight whitespace-nowrap">
            Build Your
            <br />
            <span className="text-base sm:text-lg font-bold">Vision</span>
            <br />
            With Us
          </div>
        </div>
      </div>

      {/* Decorative hairline */}
      <div className="h-[2px] bg-slate-900 w-full mb-2.5" />

      {/* 2. BLUE BANNER: ARCHITECTURAL SERVICES PACKAGE / INVOICE */}
      <div className="bg-[#0b2341] text-white px-3.5 py-2 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 shadow-xs mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-[#133863] rounded border border-blue-400/30">
            <Building className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-[9.5px] uppercase tracking-[0.2em] text-blue-200 font-semibold leading-none">
              {invoice.company.bannerTitle}
            </div>
            <div className="text-lg md:text-xl font-black tracking-wider text-amber-400 leading-tight">
              INVOICE
            </div>
          </div>
        </div>

        <div className="text-[10px] tracking-[0.2em] uppercase font-semibold text-blue-100 flex items-center gap-2">
          <span>PROFESSIONAL</span>
          <span className="text-amber-400">|</span>
          <span>ACCURATE</span>
          <span className="text-amber-400">|</span>
          <span>RELIABLE</span>
        </div>
      </div>

      {/* 3. CLIENT INFORMATION & PROJECT INFORMATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-2.5">
        {/* Client Box */}
        <div className="border border-slate-300 rounded-sm overflow-hidden flex flex-col bg-slate-50/40">
          <div className="bg-[#0b2341] text-white px-3 py-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
            <User className="w-3 h-3 text-amber-400" />
            <span>CLIENT INFORMATION</span>
          </div>
          <div className="p-2 text-xs space-y-1 flex-1 bg-white">
            <div className="flex items-baseline">
              <span className="w-18 text-slate-500 font-semibold shrink-0 text-[11px]">Name:</span>
              <span className="font-semibold text-slate-900 flex-1 border-b border-slate-200 pb-0.5 min-h-[18px]">
                {invoice.client.name || <span className="text-slate-300 italic">Not specified</span>}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="w-18 text-slate-500 font-semibold shrink-0 text-[11px]">Phone:</span>
              <span className="text-slate-800 flex-1 border-b border-slate-200 pb-0.5 min-h-[18px]">
                {invoice.client.phone || <span className="text-slate-300 italic">--</span>}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="w-18 text-slate-500 font-semibold shrink-0 text-[11px]">Email:</span>
              <span className="text-slate-800 flex-1 border-b border-slate-200 pb-0.5 min-h-[18px] break-all">
                {invoice.client.email || <span className="text-slate-300 italic">--</span>}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="w-18 text-slate-500 font-semibold shrink-0 text-[11px]">Address:</span>
              <span className="text-slate-800 flex-1 border-b border-slate-200 pb-0.5 min-h-[18px]">
                {invoice.client.address || <span className="text-slate-300 italic">--</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Project Box */}
        <div className="border border-slate-300 rounded-sm overflow-hidden flex flex-col bg-slate-50/40">
          <div className="bg-[#0b2341] text-white px-3 py-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
            <Home className="w-3 h-3 text-amber-400" />
            <span>PROJECT INFORMATION</span>
          </div>
          <div className="p-2 text-xs space-y-1 flex-1 bg-white">
            <div className="flex items-baseline">
              <span className="w-24 text-slate-500 font-semibold shrink-0 text-[11px]">Project Address:</span>
              <span className="font-medium text-slate-900 flex-1 border-b border-slate-200 pb-0.5 min-h-[18px]">
                {invoice.project.projectAddress || <span className="text-slate-300 italic">--</span>}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="w-24 text-slate-500 font-semibold shrink-0 text-[11px]">City / Province:</span>
              <span className="text-slate-800 flex-1 border-b border-slate-200 pb-0.5 min-h-[18px]">
                {invoice.project.cityProvince || <span className="text-slate-300 italic">--</span>}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="w-24 text-slate-500 font-semibold shrink-0 text-[11px]">Postal Code:</span>
              <span className="text-slate-800 flex-1 border-b border-slate-200 pb-0.5 min-h-[18px]">
                {invoice.project.postalCode || <span className="text-slate-300 italic">--</span>}
              </span>
            </div>
            <div className="flex items-center gap-3 pt-0.5">
              <div className="flex-1 flex items-baseline border-b border-slate-200 pb-0.5">
                <span className="text-slate-500 font-semibold mr-1 text-[11px]">Date:</span>
                <span className="font-mono font-medium text-slate-900 text-[11px]">
                  {formattedDate}
                </span>
              </div>
              <div className="flex-1 flex items-baseline border-b border-slate-200 pb-0.5">
                <span className="text-slate-500 font-semibold mr-1 text-[11px]">Invoice #:</span>
                <span className="font-mono font-bold text-[#0b2341] text-[11px]">
                  {invoice.invoiceNumber}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ARCHITECTURAL DRAWING PACKAGE TABLE */}
      <div className="border border-slate-300 rounded-sm overflow-hidden mb-2.5 bg-white">
        {/* Table Title Bar with orange tag */}
        <div className="bg-[#c27803] text-white px-3 py-1 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-100" />
            <span>ARCHITECTURAL DRAWING PACKAGE</span>
          </div>
          <span className="text-[10px] tracking-normal font-medium text-amber-100 bg-[#a35e02] px-2 py-0.5 rounded-xs">
            (RATE PER {invoice.unit})
          </span>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 bg-[#0b2341] text-white text-[10.5px] font-bold py-1.5 px-3 uppercase tracking-wider">
          <div className="col-span-4 text-left">FLOOR / AREA</div>
          <div className="col-span-3 text-right">AREA ({invoice.unit})</div>
          <div className="col-span-2 text-right">RATE ({invoice.currency}/{invoice.unit})</div>
          <div className="col-span-3 text-right">AMOUNT ({invoice.currency})</div>
        </div>

        {/* Floor Rows */}
        <div className="divide-y divide-slate-200 text-xs">
          {invoice.floors.map((floor) => {
            const floorRate = floor.customRate ?? invoice.packageRate;
            const floorAmount = (Number(floor.area) || 0) * floorRate;

            return (
              <div
                key={floor.id}
                className="grid grid-cols-12 py-1.5 px-3 items-center hover:bg-slate-50/70 transition-colors text-[11px]"
              >
                <div className="col-span-4 font-medium text-slate-900">
                  {floor.floorName}
                </div>
                <div className="col-span-3 text-right font-mono tabular-nums text-slate-700">
                  {Number(floor.area).toFixed(2)} {invoice.unit}
                </div>
                <div className="col-span-2 text-right font-mono tabular-nums text-slate-600">
                  {floorRate.toLocaleString()}
                </div>
                <div className="col-span-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                  {formatCurrency(floorAmount, invoice.currency)}
                </div>
              </div>
            );
          })}

          {/* Table Sub-sum */}
          <div className="grid grid-cols-12 py-1.5 px-3 bg-slate-50 font-semibold text-xs border-t-2 border-slate-300">
            <div className="col-span-4 text-slate-700 uppercase tracking-wide text-[10.5px]">
              Package Subtotal
            </div>
            <div className="col-span-3 text-right font-mono tabular-nums text-slate-800 text-[11px]">
              {calculations.totalArea.toFixed(2)} {invoice.unit}
            </div>
            <div className="col-span-2 text-right text-slate-400">--</div>
            <div className="col-span-3 text-right font-mono font-bold tabular-nums text-[#0b2341] text-[11.5px]">
              {formatCurrency(calculations.drawingPackageTotal, invoice.currency)}
            </div>
          </div>
        </div>

        {/* Additional notes container */}
        <div className="p-2 border-t border-slate-200 bg-slate-50/50 text-xs">
          <div className="font-semibold text-slate-600 text-[10.5px] uppercase tracking-wide mb-0.5">
            ADDITIONAL NOTES (if any):
          </div>
          <div className="min-h-[20px] text-slate-700 border border-slate-200 bg-white rounded-xs p-1.5 leading-relaxed text-[10.5px]">
            {invoice.additionalNotes || (
              <span className="text-slate-300 italic">No additional notes provided.</span>
            )}
          </div>
        </div>
      </div>

      {/* 5. PACKAGES & TOTAL SUMMARY SECTION (3 COLUMNS) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 mb-2.5">
        {/* Column 1: REGULAR PACKAGE */}
        <div
          className={`col-span-12 md:col-span-4 border rounded-sm overflow-hidden flex flex-col text-xs transition-all ${
            invoice.packageType === 'regular'
              ? 'border-blue-600 shadow-sm ring-1 ring-blue-500'
              : 'border-slate-300 opacity-90'
          }`}
        >
          <div className="bg-[#0b2341] text-white px-2.5 py-1.5 text-center">
            <div className="font-bold text-[10.5px] tracking-wider uppercase">REGULAR PACKAGE</div>
            <div className="text-amber-400 font-extrabold text-xs sm:text-sm tracking-wide">
              {invoice.currency} 75 /{invoice.unit}
            </div>
          </div>
          <div className="p-2 bg-white flex-1 flex flex-col justify-between">
            <div>
              <div className="text-[9.5px] font-bold text-slate-600 uppercase tracking-wide mb-1 pb-0.5 border-b border-slate-100">
                INCLUDES:
              </div>
              <ul className="space-y-0.5 text-[9.5px] text-slate-700">
                {PACKAGES.regular.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-1 leading-tight">
                    <Check className="w-2.5 h-2.5 text-blue-700 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {isInteractive && onSelectPackage && (
              <button
                type="button"
                onClick={() => onSelectPackage('regular')}
                className={`mt-2 w-full py-0.5 text-[9.5px] font-bold rounded-xs transition-colors cursor-pointer ${
                  invoice.packageType === 'regular'
                    ? 'bg-[#0b2341] text-white'
                    : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {invoice.packageType === 'regular' ? 'Selected Package' : 'Select Regular'}
              </button>
            )}
          </div>
        </div>

        {/* Column 2: PREMIUM PACKAGE */}
        <div
          className={`col-span-12 md:col-span-4 border rounded-sm overflow-hidden flex flex-col text-xs transition-all ${
            invoice.packageType === 'premium'
              ? 'border-amber-600 shadow-sm ring-1 ring-amber-500'
              : 'border-slate-300 opacity-90'
          }`}
        >
          <div className="bg-[#c27803] text-white px-2.5 py-1.5 text-center">
            <div className="font-bold text-[10.5px] tracking-wider uppercase">PREMIUM PACKAGE</div>
            <div className="text-white font-extrabold text-xs sm:text-sm tracking-wide">
              {invoice.currency} 100 /{invoice.unit}
            </div>
          </div>
          <div className="p-2 bg-white flex-1 flex flex-col justify-between">
            <div>
              <div className="text-[9.5px] font-bold text-slate-600 uppercase tracking-wide mb-1 pb-0.5 border-b border-slate-100">
                EVERYTHING IN REGULAR PLUS:
              </div>
              <ul className="space-y-0.5 text-[9.5px] text-slate-700">
                {PACKAGES.premium.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-1 leading-tight">
                    <Check className="w-2.5 h-2.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {isInteractive && onSelectPackage && (
              <button
                type="button"
                onClick={() => onSelectPackage('premium')}
                className={`mt-2 w-full py-0.5 text-[9.5px] font-bold rounded-xs transition-colors cursor-pointer ${
                  invoice.packageType === 'premium'
                    ? 'bg-[#c27803] text-white'
                    : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {invoice.packageType === 'premium' ? 'Selected Package' : 'Select Premium'}
              </button>
            )}
          </div>
        </div>

        {/* Column 3: PACKAGE PRICE & SELECTED PACKAGE CARDS */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-2">
          {/* Card A: PACKAGE PRICE */}
          <div className="border border-amber-500 rounded-sm overflow-hidden bg-white shadow-xs">
            <div className="bg-[#c27803] text-white px-2.5 py-0.5 text-center font-bold text-[11px] uppercase tracking-wider">
              PACKAGE PRICE
            </div>
            <div className="p-2 text-center bg-amber-50/30">
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-0.5">
                TOTAL ({invoice.currency})
              </div>
              <div className="font-mono text-lg sm:text-xl font-black text-[#0b2341] tracking-tight tabular-nums">
                {formatCurrency(calculations.grandTotal, invoice.currency)}
              </div>
              {calculations.discountAmount > 0 && (
                <div className="text-[9.5px] text-emerald-700 font-medium mt-0.5">
                  Discount: -{formatCurrency(calculations.discountAmount, invoice.currency)}
                </div>
              )}
            </div>
          </div>

          {/* Card B: SELECTED PACKAGE RADIO */}
          <div className="border border-slate-300 rounded-sm overflow-hidden bg-white flex-1">
            <div className="bg-[#0b2341] text-white px-2.5 py-0.5 text-center font-bold text-[11px] uppercase tracking-wider">
              SELECTED PACKAGE
            </div>
            <div className="p-2 space-y-1.5 text-xs">
              <label
                onClick={() => onSelectPackage?.('regular')}
                className="flex items-center gap-1.5 cursor-pointer group"
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    invoice.packageType === 'regular'
                      ? 'border-[#0b2341] bg-white'
                      : 'border-slate-300'
                  }`}
                >
                  {invoice.packageType === 'regular' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0b2341]" />
                  )}
                </div>
                <span
                  className={`text-[10.5px] font-medium leading-none ${
                    invoice.packageType === 'regular'
                      ? 'text-[#0b2341] font-bold'
                      : 'text-slate-600 group-hover:text-slate-900'
                  }`}
                >
                  Regular ({invoice.currency} 75/{invoice.unit})
                </span>
              </label>

              <label
                onClick={() => onSelectPackage?.('premium')}
                className="flex items-center gap-1.5 cursor-pointer group"
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    invoice.packageType === 'premium'
                      ? 'border-[#c27803] bg-white'
                      : 'border-slate-300'
                  }`}
                >
                  {invoice.packageType === 'premium' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c27803]" />
                  )}
                </div>
                <span
                  className={`text-[10.5px] font-medium leading-none ${
                    invoice.packageType === 'premium'
                      ? 'text-[#c27803] font-bold'
                      : 'text-slate-600 group-hover:text-slate-900'
                  }`}
                >
                  Premium ({invoice.currency} 100/{invoice.unit})
                </span>
              </label>

              {/* Advance Deposit Schedule Indicator */}
              <div className="mt-1.5 pt-1.5 border-t border-slate-100 text-[9.5px] space-y-0.5">
                <div className="flex justify-between text-slate-600">
                  <span>Advance ({invoice.depositPercent}%):</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {formatCurrency(calculations.depositRequiredAmount, invoice.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Balance Due:</span>
                  <span className="font-mono font-semibold text-slate-800 tabular-nums">
                    {invoice.status === 'paid' ? (
                      <span className="text-emerald-700 font-bold">PAID IN FULL</span>
                    ) : (
                      formatCurrency(calculations.balanceDue, invoice.currency)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. ARCHITECTURAL ADD-ONS TABLE (IF APPLICABLE) */}
      {calculations.addonsTotal > 0 && (
        <div className="border border-slate-300 rounded-sm overflow-hidden mb-2.5 bg-white text-xs">
          <div className="bg-slate-800 text-white px-3 py-1 flex items-center justify-between font-bold uppercase tracking-wider text-[10.5px]">
            <span>ADDITIONAL ARCHITECTURAL & ENGINEERING SERVICES</span>
            <span className="font-mono tabular-nums text-amber-300">
              +{formatCurrency(calculations.addonsTotal, invoice.currency)}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {invoice.addons
              .filter((a) => a.enabled)
              .map((addon) => (
                <div key={addon.id} className="py-1 px-3 flex justify-between items-center text-[10.5px]">
                  <div>
                    <span className="font-semibold text-slate-900">{addon.name}</span>
                    <span className="text-slate-500 ml-2 text-[9.5px]">({addon.description})</span>
                  </div>
                  <div className="font-mono font-medium text-slate-800 tabular-nums">
                    {formatCurrency(addon.amount, invoice.currency)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 7. TERMS & CONDITIONS and PAYMENT DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-2.5">
        {/* Terms & Conditions Box */}
        <div className="border border-slate-300 rounded-sm overflow-hidden flex flex-col bg-white">
          <div className="bg-[#0b2341] text-white px-3 py-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
            <FileText className="w-3 h-3 text-amber-400" />
            <span>TERMS & CONDITIONS</span>
          </div>
          <div className="p-2 text-[10px] text-slate-700 leading-normal flex-1">
            <ul className="list-disc pl-3.5 space-y-0.5">
              {invoice.terms.map((term, idx) => (
                <li key={idx} className="marker:text-slate-400">
                  {term}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Details Box */}
        <div className="border border-slate-300 rounded-sm overflow-hidden flex flex-col bg-white">
          <div className="bg-[#0b2341] text-white px-3 py-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
            <CreditCard className="w-3 h-3 text-amber-400" />
            <span>PAYMENT DETAILS</span>
          </div>
          <div className="p-2 text-xs space-y-1 flex-1">
            <div className="flex items-baseline">
              <span className="w-24 text-slate-500 font-semibold shrink-0 text-[11px]">Bank:</span>
              <span className="font-medium text-slate-900 flex-1 border-b border-slate-200 pb-0.5 min-h-[18px] text-[11px]">
                {invoice.paymentDetails.bankName || <span className="text-slate-300 italic">--</span>}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="w-24 text-slate-500 font-semibold shrink-0 text-[11px]">Account Name:</span>
              <span className="text-slate-900 font-medium flex-1 border-b border-slate-200 pb-0.5 min-h-[18px] text-[11px]">
                {invoice.paymentDetails.accountName || <span className="text-slate-300 italic">--</span>}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="w-24 text-slate-500 font-semibold shrink-0 text-[11px]">Account #:</span>
              <span className="font-mono font-bold text-[#0b2341] flex-1 border-b border-slate-200 pb-0.5 min-h-[18px] text-[11px]">
                {invoice.paymentDetails.accountNumber || <span className="text-slate-300 italic">--</span>}
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="w-24 text-slate-500 font-semibold shrink-0 text-[11px]">Reference:</span>
              <span className="font-mono text-slate-800 flex-1 border-b border-slate-200 pb-0.5 min-h-[18px] text-[11px]">
                {invoice.paymentDetails.reference || invoice.invoiceNumber}
              </span>
            </div>
            {invoice.paymentDetails.mobileMoneyNumber && (
              <div className="flex items-baseline pt-0.5 text-[10px]">
                <span className="w-24 text-amber-700 font-semibold shrink-0">Mobile Money:</span>
                <span className="text-slate-700">
                  {invoice.paymentDetails.mobileMoneyProvider}: {invoice.paymentDetails.mobileMoneyNumber}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 8. CLIENT SIGNATURE & DATE */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pb-2 mb-2.5 items-end">
        {/* Signature Area */}
        <div className="sm:col-span-8 flex flex-col">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
            <div className="flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-amber-600" />
              <span>CLIENT SIGNATURE</span>
            </div>
            {isInteractive && (
              <button
                type="button"
                onClick={onOpenSignatureModal}
                className="text-[10px] text-blue-700 hover:text-blue-900 font-medium underline cursor-pointer no-print"
              >
                {invoice.clientSignature ? 'Change signature' : 'Click to sign'}
              </button>
            )}
          </div>

          <div
            onClick={isInteractive ? onOpenSignatureModal : undefined}
            className={`border-b-2 border-slate-800 min-h-[40px] flex items-center justify-center p-1 bg-slate-50/40 ${
              isInteractive ? 'cursor-pointer hover:bg-slate-100/70 transition-colors' : ''
            }`}
          >
            {invoice.clientSignature ? (
              invoice.clientSignatureType === 'draw' ? (
                <img
                  src={invoice.clientSignature}
                  alt="Client Signature"
                  className="max-h-[36px] object-contain"
                />
              ) : (
                <span className="font-signature text-xl text-[#0b2341] tracking-wide">
                  {invoice.clientSignature}
                </span>
              )
            ) : (
              <span className="text-xs text-slate-400 italic">
                Sign here or type name
              </span>
            )}
          </div>
        </div>

        {/* Date Field */}
        <div className="sm:col-span-4 flex flex-col">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>DATE</span>
          </div>
          <div className="border-b-2 border-slate-800 min-h-[40px] flex items-center justify-start px-2 bg-slate-50/40">
            <span className="font-mono text-xs text-slate-800 font-medium">
              {invoice.clientSignDate ? formatDateToSlash(invoice.clientSignDate) : formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* 9. BOTTOM FOOTER BAR */}
      <div className="bg-[#0b2341] text-white px-3.5 py-1.5 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-xs">
        <div className="flex items-center gap-2">
          <UnivisionLogo size="sm" light showSubtitle={true} />
        </div>
        <div className="font-slogan italic text-amber-300 text-xs sm:text-[13px] tracking-wide text-right">
          {invoice.company.footerQuote}
        </div>
      </div>
    </div>
  );
};
