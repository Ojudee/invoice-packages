import React, { useState } from 'react';
import {
  Building2,
  User,
  MapPin,
  Calendar,
  Layers,
  Plus,
  Trash2,
  DollarSign,
  Percent,
  Sparkles,
  CreditCard,
  FileText,
  PenTool,
  CheckCircle2,
  Sliders,
  ShieldAlert,
  Save,
  FileDown,
  Printer,
  Check,
  ExternalLink,
  Edit3,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Invoice,
  FloorItem,
  AddonService,
  CurrencyCode,
  MeasurementUnit,
  InvoiceStatus,
  PackageType,
  PackageSelectionMap,
  InvoicePackagesConfig,
} from '../types';
import {
  PACKAGES,
  STRUCTURAL_PACKAGES,
  BOQ_PACKAGES,
  SITE_INSPECTION_PACKAGE,
  BANK_PRESETS,
  ARCHITECTURAL_ADDONS_PRESETS,
  DEFAULT_TERMS,
  getBOQPackageFee,
} from '../data/constants';
import {
  getInvoicePackagesConfig,
  getPackageSummaries,
  PACKAGE_PRESETS,
} from '../utils/packageManager';
import { usePackageServices, PackageCategory } from '../services/packageServicesStorage';
import { ServicePackageEditorModal } from './ServicePackageEditorModal';
import { calculateInvoice, formatCurrency } from '../utils/calculations';

interface InvoiceEditorProps {
  invoice: Invoice;
  onChange: (updatedInvoice: Invoice) => void;
  onOpenSignatureModal: () => void;
  onSave?: () => void;
  onDownloadPDF?: () => void;
  onPrint?: () => void;
  onPrintPreview?: (filter?: PackageSelectionMap) => void;
  saveStatusMessage?: string;
  onOpenArchitecturalPortal?: () => void;
  onOpenStructuralPortal?: () => void;
  onOpenBOQPortal?: () => void;
  onOpenPackagesPortal?: () => void;
}

export const InvoiceEditor: React.FC<InvoiceEditorProps> = ({
  invoice,
  onChange,
  onOpenSignatureModal,
  onSave,
  onDownloadPDF,
  onPrint,
  onPrintPreview,
  saveStatusMessage = 'Auto-saved locally',
  onOpenArchitecturalPortal,
  onOpenStructuralPortal,
  onOpenBOQPortal,
  onOpenPackagesPortal,
}) => {
  const [activeTab, setActiveTab] = useState<'project' | 'floors' | 'packages' | 'financials' | 'payment' | 'terms'>('floors');
  const [servicesModalCategory, setServicesModalCategory] = useState<PackageCategory | null>(null);

  const { regularServices, premiumExtraServices } = usePackageServices('boq');
  const { regularServices: archReg, premiumAllServices: archPremAll } = usePackageServices('architectural');
  const calculations = calculateInvoice(invoice);

  // Separate Packages Configuration & Summaries
  const pkgConfig = getInvoicePackagesConfig(invoice);
  const pkgSummaries = getPackageSummaries(invoice);

  // Multi-package combination selector for printing
  const [combineSelection, setCombineSelection] = useState<PackageSelectionMap>({
    architectural: true,
    structural: true,
    boq: false,
    inspection: false,
    addons: false,
  });

  const updatePkgConfig = (updater: (prev: InvoicePackagesConfig) => InvoicePackagesConfig) => {
    const updated = updater(pkgConfig);
    onChange({
      ...invoice,
      packagesConfig: updated,
      packageType: updated.architectural.tier,
      packageRate: updated.architectural.rate,
    });
  };

  const handleTogglePackageInCombine = (key: keyof PackageSelectionMap) => {
    setCombineSelection((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const combineGrandTotal = (Object.keys(combineSelection) as (keyof PackageSelectionMap)[]).reduce(
    (sum, k) => (combineSelection[k] ? sum + pkgSummaries.packages[k].subtotal : sum),
    0
  );
  const combineActiveCount = Object.values(combineSelection).filter(Boolean).length;

  // Field updaters
  const updateClient = (field: keyof Invoice['client'], value: string) => {
    onChange({
      ...invoice,
      client: { ...invoice.client, [field]: value },
    });
  };

  const updateProject = (field: keyof Invoice['project'], value: string) => {
    onChange({
      ...invoice,
      project: { ...invoice.project, [field]: value },
    });
  };

  const updateCompany = (field: keyof Invoice['company'], value: string) => {
    onChange({
      ...invoice,
      company: { ...invoice.company, [field]: value },
    });
  };

  const updatePaymentDetails = (field: keyof Invoice['paymentDetails'], value: string) => {
    onChange({
      ...invoice,
      paymentDetails: { ...invoice.paymentDetails, [field]: value },
    });
  };

  // Floors manager
  const addFloor = () => {
    const newFloor: FloorItem = {
      id: `floor-${Date.now()}`,
      floorName: `Floor Level ${invoice.floors.length + 1}`,
      area: 120,
    };
    onChange({
      ...invoice,
      floors: [...invoice.floors, newFloor],
    });
  };

  const updateFloor = (id: string, updates: Partial<FloorItem>) => {
    onChange({
      ...invoice,
      floors: invoice.floors.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    });
  };

  const deleteFloor = (id: string) => {
    if (invoice.floors.length <= 1) return; // Keep at least one floor
    onChange({
      ...invoice,
      floors: invoice.floors.filter((f) => f.id !== id),
    });
  };

  // Preset layouts
  const applyFloorPreset = (type: 'duplex' | 'commercial' | 'bungalow' | 'villa') => {
    let newFloors: FloorItem[] = [];
    if (type === 'duplex') {
      newFloors = [
        { id: `fl-${Date.now()}-1`, floorName: 'Ground Floor Living & Kitchen', area: 160 },
        { id: `fl-${Date.now()}-2`, floorName: 'First Floor Bedrooms', area: 140 },
        { id: `fl-${Date.now()}-3`, floorName: 'Outbuilding / Boys Quarters', area: 40 },
      ];
    } else if (type === 'commercial') {
      newFloors = [
        { id: `fl-${Date.now()}-1`, floorName: 'Ground Floor Retail & Banking', area: 280 },
        { id: `fl-${Date.now()}-2`, floorName: 'First Floor Professional Suites', area: 280 },
        { id: `fl-${Date.now()}-3`, floorName: 'Second Floor Corporate Offices', area: 250 },
        { id: `fl-${Date.now()}-4`, floorName: 'Rooftop Terrace & Mechanical', area: 120 },
      ];
    } else if (type === 'bungalow') {
      newFloors = [
        { id: `fl-${Date.now()}-1`, floorName: 'Ground Floor Residential', area: 175 },
        { id: `fl-${Date.now()}-2`, floorName: 'Covered Veranda & Carport', area: 35 },
      ];
    } else {
      // Villa
      newFloors = [
        { id: `fl-${Date.now()}-1`, floorName: 'Ground Floor (Atrium & Living)', area: 195 },
        { id: `fl-${Date.now()}-2`, floorName: 'Upper Floor (Suites & Family Lounge)', area: 165 },
        { id: `fl-${Date.now()}-3`, floorName: 'Penthouse Deck & Pergola', area: 55 },
      ];
    }

    onChange({
      ...invoice,
      floors: newFloors,
    });
  };

  // Package Switcher
  const selectPackage = (type: PackageType) => {
    const rate = type === 'regular' ? 75 : type === 'premium' ? 100 : invoice.packageRate;
    onChange({
      ...invoice,
      packageType: type,
      packageRate: rate,
    });
  };

  // Addon Toggler
  const toggleAddon = (addonId: string) => {
    const existing = invoice.addons.find((a) => a.id === addonId);
    if (existing) {
      onChange({
        ...invoice,
        addons: invoice.addons.map((a) =>
          a.id === addonId ? { ...a, enabled: !a.enabled } : a
        ),
      });
    } else {
      const preset = ARCHITECTURAL_ADDONS_PRESETS.find((p) => p.id === addonId);
      if (preset) {
        onChange({
          ...invoice,
          addons: [...invoice.addons, { ...preset, enabled: true }],
        });
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col text-slate-100">
      {/* Editor Header Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0b2341] rounded-lg border border-blue-500/30 text-amber-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Invoice Studio: {invoice.invoiceNumber}
            </h2>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>{invoice.client.name || 'Unassigned Client'}</span>
              <span>·</span>
              <span className="font-mono tabular-nums text-amber-400 font-semibold">
                {formatCurrency(calculations.grandTotal, invoice.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Save Status Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
            <Check className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>{saveStatusMessage}</span>
          </div>

          {/* Status Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Status:</span>
            <select
              value={invoice.status}
              onChange={(e) => {
                const nextStatus = e.target.value as InvoiceStatus;
                let nextPaid = invoice.depositPaidAmount;
                if (nextStatus === 'paid') {
                  nextPaid = calculations.grandTotal;
                } else if (nextStatus === 'deposit_paid' && nextPaid === 0) {
                  nextPaid = calculations.depositRequiredAmount;
                }
                onChange({ ...invoice, status: nextStatus, depositPaidAmount: nextPaid });
              }}
              className="px-2 py-1 text-xs font-semibold bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            >
              <option value="draft">Draft</option>
              <option value="issued">Issued / Pending</option>
              <option value="deposit_paid">Deposit Paid</option>
              <option value="paid">Paid in Full</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Explicit Save Button */}
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="px-3 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Save invoice to storage"
            >
              <Save className="w-3.5 h-3.5" />
              Save
            </button>
          )}

          {/* Direct PDF Download */}
          {onDownloadPDF && (
            <button
              type="button"
              onClick={onDownloadPDF}
              className="px-2.5 py-1 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Download PDF document directly"
            >
              <FileDown className="w-3.5 h-3.5" />
              PDF
            </button>
          )}

          {/* Print Preview Button */}
          {onPrintPreview && (
            <button
              type="button"
              onClick={() => onPrintPreview()}
              className="px-2.5 py-1 text-xs font-semibold bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-600/50 rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Open Print Preview with centered A4 margins"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              Print Preview
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 p-2 bg-slate-950 border-b border-slate-800 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('floors')}
          className={`px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'floors'
              ? 'bg-[#0b2341] text-amber-400 border border-blue-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Floors & Schedule
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('packages')}
          className={`px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'packages'
              ? 'bg-[#0b2341] text-amber-400 border border-blue-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Packages & Print</span>
          <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded-full font-bold ml-0.5">
            {pkgSummaries.activeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('project')}
          className={`px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'project'
              ? 'bg-[#0b2341] text-amber-400 border border-blue-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Client & Project
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('financials')}
          className={`px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'financials'
              ? 'bg-[#0b2341] text-amber-400 border border-blue-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Advance & Pricing
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payment')}
          className={`px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'payment'
              ? 'bg-[#0b2341] text-amber-400 border border-blue-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          Payment Details
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('terms')}
          className={`px-3 py-1.5 font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'terms'
              ? 'bg-[#0b2341] text-amber-400 border border-blue-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Terms & Sign
        </button>
      </div>

      {/* Main Tab Panels */}
      <div className="p-5 overflow-y-auto max-h-[640px] space-y-6">
        {/* ================= TAB 1: FLOORS & SCHEDULE ================= */}
        {activeTab === 'floors' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Architectural Drawing Package Schedule
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Input floor dimensions in {invoice.unit}. Rate is automatically multiplied to calculate total.
                </p>
              </div>

              {/* Quick Preset Layouts */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyFloorPreset('villa')}
                  className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                >
                  Villa (3-Lvl)
                </button>
                <button
                  type="button"
                  onClick={() => applyFloorPreset('duplex')}
                  className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                >
                  Duplex + BQ
                </button>
                <button
                  type="button"
                  onClick={() => applyFloorPreset('commercial')}
                  className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                >
                  Commercial Plaza
                </button>
                <button
                  type="button"
                  onClick={() => applyFloorPreset('bungalow')}
                  className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors"
                >
                  Bungalow
                </button>
              </div>
            </div>

            {/* Floor Items Table / List */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                <div className="col-span-5">Floor / Area Name</div>
                <div className="col-span-3 text-right">Area ({invoice.unit})</div>
                <div className="col-span-2 text-right">Rate ({invoice.currency})</div>
                <div className="col-span-2 text-right">Action</div>
              </div>

              {invoice.floors.map((floor, index) => {
                const floorRate = floor.customRate ?? invoice.packageRate;
                const floorTotal = (Number(floor.area) || 0) * floorRate;

                return (
                  <div
                    key={floor.id}
                    className="grid grid-cols-12 gap-2 items-center bg-slate-800/80 border border-slate-700 p-2.5 rounded-lg hover:border-slate-600 transition-colors"
                  >
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={floor.floorName}
                        onChange={(e) => updateFloor(floor.id, { floorName: e.target.value })}
                        placeholder="e.g. Ground Floor, Upper Floor..."
                        className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500"
                      />
                    </div>

                    <div className="col-span-3">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={floor.area}
                          onChange={(e) => updateFloor(floor.id, { area: parseFloat(e.target.value) || 0 })}
                          className="w-full text-right px-2.5 py-1.5 text-xs font-mono tabular-nums bg-slate-900 border border-slate-700 rounded text-amber-300 focus:outline-hidden focus:border-amber-500"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-slate-500 pointer-events-none">
                          {invoice.unit}
                        </span>
                      </div>
                    </div>

                    <div className="col-span-2 text-right">
                      <div className="text-xs font-mono text-slate-300 tabular-nums">
                        {floorRate}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono tabular-nums">
                        ={formatCurrency(floorTotal, invoice.currency)}
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => deleteFloor(floor.id)}
                        disabled={invoice.floors.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/60 rounded disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                        title="Remove floor level"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add New Floor Button */}
              <button
                type="button"
                onClick={addFloor}
                className="w-full py-2 border border-dashed border-slate-700 hover:border-amber-500/60 hover:bg-slate-800/40 text-slate-300 hover:text-amber-400 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Floor Level / Area Section
              </button>
            </div>

            {/* Schedule Totals Bar */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
              <div className="text-slate-400">
                Total Covered Area:{' '}
                <span className="font-mono font-bold text-white text-sm tabular-nums">
                  {calculations.totalArea.toFixed(2)} {invoice.unit}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[11px] block">Drawing Package Cost:</span>
                <span className="font-mono font-bold text-amber-400 text-sm tabular-nums">
                  {formatCurrency(calculations.drawingPackageTotal, invoice.currency)}
                </span>
              </div>
            </div>

            {/* Additional Notes input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                Additional Notes (Architectural Specifications)
              </label>
              <textarea
                rows={3}
                value={invoice.additionalNotes}
                onChange={(e) => onChange({ ...invoice, additionalNotes: e.target.value })}
                placeholder="Specific client instructions, structural notes, swimming pool or roof pergola details..."
                className="w-full p-2.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-hidden focus:border-amber-500 leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* ================= TAB 2: SEPARATE PACKAGES & PRINT HUB ================= */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            {/* Header info */}
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Separate Invoice Packages & Multi-Print Studio
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage each package independently. Configure tiers, print only ONE package at a time, or combine any two or more into a consolidated invoice.
              </p>
            </div>

            {/* 1. MASTER PRINT HUB (DIRECT SINGLE-PACKAGE & COMBINED PRINTING) */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#0b2341] border border-blue-500/40 rounded-xl p-4 shadow-xl space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-400/10 rounded border border-amber-500/30 text-amber-400">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Print One Package at a Time (1-Click Standalone)
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Instantly opens Print Preview with that single package isolated, its exact fee, 50% advance deposit, and terms.
                    </p>
                  </div>
                </div>

                {onPrintPreview && (
                  <button
                    type="button"
                    onClick={() => onPrintPreview(PACKAGE_PRESETS.all)}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print All Active Packages ({pkgSummaries.activeCount})</span>
                  </button>
                )}
              </div>

              {/* Direct Standalone Print Preset Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => onPrintPreview?.(PACKAGE_PRESETS.architectural)}
                  className="p-2.5 bg-slate-900/90 hover:bg-blue-950/80 border border-blue-500/40 hover:border-blue-400 rounded-lg text-left transition cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-300 group-hover:text-white flex items-center gap-1">
                      <span>🏛️ Architectural</span>
                    </span>
                    <Printer className="w-3 h-3 text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Print Only Architectural ({pkgConfig.architectural.tier.toUpperCase()})
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                    {formatCurrency(pkgSummaries.packages.architectural.subtotal, invoice.currency)}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onPrintPreview?.(PACKAGE_PRESETS.structural)}
                  className="p-2.5 bg-slate-900/90 hover:bg-indigo-950/80 border border-indigo-500/40 hover:border-indigo-400 rounded-lg text-left transition cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 group-hover:text-white flex items-center gap-1">
                      <span>🏗️ Structural</span>
                    </span>
                    <Printer className="w-3 h-3 text-indigo-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Print Only Structural ({pkgConfig.structural.tier.toUpperCase()})
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                    {formatCurrency(pkgSummaries.packages.structural.subtotal, invoice.currency)}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onPrintPreview?.(PACKAGE_PRESETS.boq)}
                  className="p-2.5 bg-slate-900/90 hover:bg-emerald-950/80 border border-emerald-500/40 hover:border-emerald-400 rounded-lg text-left transition cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 group-hover:text-white flex items-center gap-1">
                      <span>📊 BOQ Package</span>
                    </span>
                    <Printer className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Print Only BOQ ({pkgConfig.boq.tier.toUpperCase()})
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                    {formatCurrency(pkgSummaries.packages.boq.subtotal, invoice.currency)}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onPrintPreview?.(PACKAGE_PRESETS.inspection)}
                  className="p-2.5 bg-slate-900/90 hover:bg-amber-950/80 border border-amber-500/40 hover:border-amber-400 rounded-lg text-left transition cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 group-hover:text-white flex items-center gap-1">
                      <span>🔍 Site Inspection</span>
                    </span>
                    <Printer className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Print Only Site Inspection
                  </div>
                  <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                    {formatCurrency(pkgSummaries.packages.inspection.subtotal, invoice.currency)}
                  </div>
                </button>
              </div>

              {/* 2. CUSTOM COMBINATION TOOL (COMBINE ANY TWO OR MORE) */}
              <div className="bg-slate-950/80 border border-purple-500/30 rounded-lg p-3 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                    Combine Any Two or Three Packages to Print
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setCombineSelection({
                          architectural: true,
                          structural: true,
                          boq: false,
                          inspection: false,
                          addons: false,
                        })
                      }
                      className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded cursor-pointer"
                    >
                      Arch + Structural
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCombineSelection({
                          architectural: true,
                          structural: false,
                          boq: true,
                          inspection: false,
                          addons: false,
                        })
                      }
                      className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded cursor-pointer"
                    >
                      Arch + BOQ
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCombineSelection({
                          architectural: false,
                          structural: true,
                          boq: true,
                          inspection: false,
                          addons: false,
                        })
                      }
                      className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded cursor-pointer"
                    >
                      Structural + BOQ
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <label
                    className={`flex items-start gap-2 p-2 rounded border cursor-pointer transition ${
                      combineSelection.architectural
                        ? 'bg-blue-950/60 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={combineSelection.architectural}
                      onChange={() => handleTogglePackageInCombine('architectural')}
                      className="mt-0.5 rounded border-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-xs font-semibold">🏛️ Arch</div>
                      <div className="text-[10px] text-slate-400">
                        {formatCurrency(pkgSummaries.packages.architectural.subtotal, invoice.currency)}
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2 p-2 rounded border cursor-pointer transition ${
                      combineSelection.structural
                        ? 'bg-indigo-950/60 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={combineSelection.structural}
                      onChange={() => handleTogglePackageInCombine('structural')}
                      className="mt-0.5 rounded border-slate-700 text-indigo-500 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="text-xs font-semibold">🏗️ Struct</div>
                      <div className="text-[10px] text-slate-400">
                        {formatCurrency(pkgSummaries.packages.structural.subtotal, invoice.currency)}
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2 p-2 rounded border cursor-pointer transition ${
                      combineSelection.boq
                        ? 'bg-emerald-950/60 border-emerald-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={combineSelection.boq}
                      onChange={() => handleTogglePackageInCombine('boq')}
                      className="mt-0.5 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-semibold">📊 BOQ</div>
                      <div className="text-[10px] text-slate-400">
                        {formatCurrency(pkgSummaries.packages.boq.subtotal, invoice.currency)}
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2 p-2 rounded border cursor-pointer transition ${
                      combineSelection.inspection
                        ? 'bg-amber-950/60 border-amber-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={combineSelection.inspection}
                      onChange={() => handleTogglePackageInCombine('inspection')}
                      className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                    />
                    <div>
                      <div className="text-xs font-semibold">🔍 Site Insp</div>
                      <div className="text-[10px] text-slate-400">
                        {formatCurrency(pkgSummaries.packages.inspection.subtotal, invoice.currency)}
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2 p-2 rounded border cursor-pointer transition ${
                      combineSelection.addons
                        ? 'bg-purple-950/60 border-purple-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={combineSelection.addons}
                      onChange={() => handleTogglePackageInCombine('addons')}
                      className="mt-0.5 rounded border-slate-700 text-purple-500 focus:ring-purple-500"
                    />
                    <div>
                      <div className="text-xs font-semibold">⚡ Add-ons</div>
                      <div className="text-[10px] text-slate-400">
                        {formatCurrency(pkgSummaries.packages.addons.subtotal, invoice.currency)}
                      </div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-300">
                    Combined ({combineActiveCount} packages):{' '}
                    <strong className="text-amber-400 font-mono">
                      {formatCurrency(combineGrandTotal, invoice.currency)}
                    </strong>
                  </span>

                  {onPrintPreview && (
                    <button
                      type="button"
                      onClick={() => onPrintPreview(combineSelection)}
                      disabled={combineActiveCount === 0}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print This Combination</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ================= SEPARATE PACKAGE CARDS ================= */}

            {/* PACKAGE 1: ARCHITECTURAL DRAWING PACKAGE */}
            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-3.5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-950/80 border border-blue-500/40 rounded-lg text-blue-400 font-bold">
                    🏛️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        01 Architectural Drawing Package
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-600/40">
                        {pkgConfig.architectural.tier.toUpperCase()} TIER
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Concept design, floor plans, 3D exterior visualizer, sections & municipal building approval set.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                    {formatCurrency(pkgSummaries.packages.architectural.subtotal, invoice.currency)}
                  </span>
                  {onPrintPreview && (
                    <button
                      type="button"
                      onClick={() => onPrintPreview(PACKAGE_PRESETS.architectural)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded flex items-center gap-1 transition cursor-pointer"
                      title="Print only this Architectural package"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print Only</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Architectural Tier Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => selectPackage('regular')}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    pkgConfig.architectural.tier === 'regular'
                      ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500/50'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-blue-400">REGULAR PACKAGE</span>
                    <span className="text-xs font-mono font-bold text-white bg-blue-900/50 px-2 py-0.5 rounded">
                      {invoice.currency} 75 /{invoice.unit}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Floor plans, elevations, sections, roof plan, door/window schedule & permit PDF.
                  </p>
                </div>

                <div
                  onClick={() => selectPackage('premium')}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    pkgConfig.architectural.tier === 'premium'
                      ? 'border-amber-500 bg-amber-950/20 ring-1 ring-amber-500/50'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-amber-400">PREMIUM PACKAGE</span>
                    <span className="text-xs font-mono font-bold text-amber-300 bg-amber-900/40 px-2 py-0.5 rounded">
                      {invoice.currency} 100 /{invoice.unit}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Includes Regular plus 3D walkthrough, joinery, interior design layouts & ceiling plans.
                  </p>
                </div>
              </div>

              {/* Architectural Custom Rate */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-300">
                  Floor Area: <strong className="text-white font-mono">{pkgSummaries.totalArea} {invoice.unit}</strong> (from Floors schedule)
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Rate Override:</span>
                  <input
                    type="number"
                    min="1"
                    value={pkgConfig.architectural.rate}
                    onChange={(e) => {
                      const r = parseFloat(e.target.value) || 0;
                      updatePkgConfig((c) => ({
                        ...c,
                        architectural: { ...c.architectural, tier: 'custom', rate: r },
                      }));
                    }}
                    className="w-20 px-2 py-1 text-xs font-mono text-right bg-slate-800 border border-slate-700 rounded text-amber-300 focus:outline-hidden"
                  />
                  <span className="text-slate-400">{invoice.currency}/{invoice.unit}</span>
                </div>
              </div>
            </div>

            {/* PACKAGE 2: STRUCTURAL ENGINEERING PACKAGE */}
            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-3.5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-950/80 border border-indigo-500/40 rounded-lg text-indigo-400 font-bold">
                    🏗️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        02 Structural Engineering Package
                      </h4>
                      <label className="flex items-center gap-1.5 cursor-pointer ml-1">
                        <input
                          type="checkbox"
                          checked={pkgConfig.structural.enabled}
                          onChange={() =>
                            updatePkgConfig((c) => ({
                              ...c,
                              structural: { ...c.structural, enabled: !c.structural.enabled },
                            }))
                          }
                          className="rounded border-slate-700 text-indigo-500 focus:ring-indigo-500"
                        />
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          pkgConfig.structural.enabled
                            ? 'bg-indigo-900/60 text-indigo-200 border-indigo-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {pkgConfig.structural.enabled ? 'INCLUDED' : 'DISABLED'}
                        </span>
                      </label>
                    </div>
                    <p className="text-xs text-slate-400">
                      Foundation engineering, column/beam schedules, slab design, Bar Bending Schedule (BBS) & calculations.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                    {formatCurrency(pkgSummaries.packages.structural.subtotal, invoice.currency)}
                  </span>
                  {onPrintPreview && (
                    <button
                      type="button"
                      onClick={() => onPrintPreview(PACKAGE_PRESETS.structural)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded flex items-center gap-1 transition cursor-pointer"
                      title="Print only this Structural package"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print Only</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Structural Tiers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() =>
                    updatePkgConfig((c) => ({
                      ...c,
                      structural: { ...c.structural, enabled: true, tier: 'regular', rate: 65 },
                    }))
                  }
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    pkgConfig.structural.tier === 'regular'
                      ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500/50'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-indigo-400">REGULAR STRUCTURAL</span>
                    <span className="text-xs font-mono font-bold text-white bg-indigo-900/50 px-2 py-0.5 rounded">
                      {invoice.currency} 65 /{invoice.unit}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Foundation design, column layout, beam layout, slab layout, roof structure & structural notes.
                  </p>
                </div>

                <div
                  onClick={() =>
                    updatePkgConfig((c) => ({
                      ...c,
                      structural: { ...c.structural, enabled: true, tier: 'premium', rate: 85 },
                    }))
                  }
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    pkgConfig.structural.tier === 'premium'
                      ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500/50'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-emerald-400">PREMIUM STRUCTURAL</span>
                    <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded">
                      {invoice.currency} 85 /{invoice.unit}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Includes Regular plus Bar Bending Schedule (BBS), structural calculations report & stair reinforcement.
                  </p>
                </div>
              </div>

              {/* Structural Scope Area & Rate Override */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Structural Scope Area:</span>
                  <input
                    type="number"
                    min="1"
                    value={pkgConfig.structural.area ?? pkgSummaries.totalArea}
                    onChange={(e) => {
                      const a = parseFloat(e.target.value) || 0;
                      updatePkgConfig((c) => ({
                        ...c,
                        structural: { ...c.structural, area: a },
                      }));
                    }}
                    className="w-20 px-2 py-1 text-xs font-mono text-right bg-slate-800 border border-slate-700 rounded text-indigo-300 focus:outline-hidden"
                  />
                  <span className="text-slate-400">{invoice.unit}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Rate:</span>
                  <input
                    type="number"
                    min="1"
                    value={pkgConfig.structural.rate}
                    onChange={(e) => {
                      const r = parseFloat(e.target.value) || 0;
                      updatePkgConfig((c) => ({
                        ...c,
                        structural: { ...c.structural, tier: 'custom', rate: r },
                      }));
                    }}
                    className="w-20 px-2 py-1 text-xs font-mono text-right bg-slate-800 border border-slate-700 rounded text-amber-300 focus:outline-hidden"
                  />
                  <span className="text-slate-400">{invoice.currency}/{invoice.unit}</span>
                </div>
              </div>
            </div>

            {/* PACKAGE 3: BILLS OF QUANTITIES (BOQ) PACKAGE */}
            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-3.5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-950/80 border border-emerald-500/40 rounded-lg text-emerald-400 font-bold">
                    📊
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        03 Bills of Quantities (BOQ) Package
                      </h4>
                      <label className="flex items-center gap-1.5 cursor-pointer ml-1">
                        <input
                          type="checkbox"
                          checked={pkgConfig.boq.enabled}
                          onChange={() =>
                            updatePkgConfig((c) => ({
                              ...c,
                              boq: { ...c.boq, enabled: !c.boq.enabled },
                            }))
                          }
                          className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          pkgConfig.boq.enabled
                            ? 'bg-emerald-900/60 text-emerald-200 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {pkgConfig.boq.enabled ? 'INCLUDED' : 'DISABLED'}
                        </span>
                      </label>
                    </div>
                    <p className="text-xs text-slate-400">
                      Material takeoff, labor cost breakdown, trade pricing, cashflow & tender documentation.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                    {formatCurrency(pkgSummaries.packages.boq.subtotal, invoice.currency)}
                  </span>
                  {onPrintPreview && (
                    <button
                      type="button"
                      onClick={() => onPrintPreview(PACKAGE_PRESETS.boq)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded flex items-center gap-1 transition cursor-pointer"
                      title="Print only this BOQ package"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print Only</span>
                    </button>
                  )}
                </div>
              </div>

              {/* BOQ Tiers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => {
                    const fee = getBOQPackageFee(pkgSummaries.totalArea, 'regular');
                    updatePkgConfig((c) => ({
                      ...c,
                      boq: { ...c.boq, enabled: true, tier: 'regular', fee },
                    }));
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    pkgConfig.boq.tier === 'regular'
                      ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500/50'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-blue-400">REGULAR BOQ</span>
                    <span className="text-xs font-mono font-bold text-white bg-blue-900/50 px-2 py-0.5 rounded">
                      GMD 18k – 25k
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Quantity takeoff, material & labor summary, detailed trade BOQ & report.
                  </p>
                </div>

                <div
                  onClick={() => {
                    const fee = getBOQPackageFee(pkgSummaries.totalArea, 'premium');
                    updatePkgConfig((c) => ({
                      ...c,
                      boq: { ...c.boq, enabled: true, tier: 'premium', fee },
                    }));
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    pkgConfig.boq.tier === 'premium'
                      ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500/50'
                      : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-emerald-400">PREMIUM BOQ</span>
                    <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded">
                      GMD 30k – 65k
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Comprehensive quantity surveying, procurement schedule, tender docs & quality control.
                  </p>
                </div>
              </div>

              {/* BOQ Fee Input */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-400">
                  Tier Bracket: 100-500 m² (18k/30k) • 500-1,000 m² (20k/45k) • 1,000+ m² (25k/65k)
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Agreed Fee:</span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={pkgConfig.boq.fee}
                    onChange={(e) => {
                      const f = parseFloat(e.target.value) || 0;
                      updatePkgConfig((c) => ({
                        ...c,
                        boq: { ...c.boq, tier: 'custom', fee: f },
                      }));
                    }}
                    className="w-28 px-2 py-1 text-xs font-mono text-right bg-slate-800 border border-slate-700 rounded text-amber-300 focus:outline-hidden"
                  />
                  <span className="text-slate-400">{invoice.currency}</span>
                </div>
              </div>
            </div>

            {/* PACKAGE 4: SITE INSPECTION & REPORTS PACKAGE */}
            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-3.5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-950/80 border border-amber-500/40 rounded-lg text-amber-400 font-bold">
                    🔍
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        04 Site Inspection & Reports Package
                      </h4>
                      <label className="flex items-center gap-1.5 cursor-pointer ml-1">
                        <input
                          type="checkbox"
                          checked={pkgConfig.inspection.enabled}
                          onChange={() =>
                            updatePkgConfig((c) => ({
                              ...c,
                              inspection: { ...c.inspection, enabled: !c.inspection.enabled },
                            }))
                          }
                          className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                        />
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          pkgConfig.inspection.enabled
                            ? 'bg-amber-900/60 text-amber-200 border-amber-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {pkgConfig.inspection.enabled ? 'INCLUDED' : 'DISABLED'}
                        </span>
                      </label>
                    </div>
                    <p className="text-xs text-slate-400">
                      On-site inspection, boundary & terrain sketch plans, professional consultation & certified report.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                    {formatCurrency(pkgSummaries.packages.inspection.subtotal, invoice.currency)}
                  </span>
                  {onPrintPreview && (
                    <button
                      type="button"
                      onClick={() => onPrintPreview(PACKAGE_PRESETS.inspection)}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded flex items-center gap-1 transition cursor-pointer"
                      title="Print only this Site Inspection package"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print Only</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Inspection Fee input */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-300">
                  Official Standard Flyer Rate: <strong>GMD 3,500 Fixed</strong>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Inspection Fee:</span>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    value={pkgConfig.inspection.fee}
                    onChange={(e) => {
                      const f = parseFloat(e.target.value) || 0;
                      updatePkgConfig((c) => ({
                        ...c,
                        inspection: { ...c.inspection, fee: f },
                      }));
                    }}
                    className="w-24 px-2 py-1 text-xs font-mono text-right bg-slate-800 border border-slate-700 rounded text-amber-300 focus:outline-hidden"
                  />
                  <span className="text-slate-400">{invoice.currency}</span>
                </div>
              </div>
            </div>

            {/* PACKAGE 5: ADDITIONAL DELIVERABLES & ADD-ONS */}
            <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Additional Engineering & Architectural Deliverables
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    +{formatCurrency(pkgSummaries.packages.addons.subtotal, invoice.currency)}
                  </span>
                  {onPrintPreview && pkgSummaries.packages.addons.subtotal > 0 && (
                    <button
                      type="button"
                      onClick={() => onPrintPreview(PACKAGE_PRESETS.addons)}
                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded flex items-center gap-1 transition cursor-pointer"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print Addons</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {ARCHITECTURAL_ADDONS_PRESETS.map((addon) => {
                  const isEnabled = invoice.addons.some((a) => a.id === addon.id && a.enabled);
                  return (
                    <label
                      key={addon.id}
                      className={`flex items-start justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        isEnabled
                          ? 'border-amber-500/60 bg-amber-950/20'
                          : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => toggleAddon(addon.id)}
                          className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                        />
                        <div>
                          <div className="text-xs font-semibold text-white">{addon.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{addon.description}</div>
                        </div>
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-200 shrink-0 ml-3">
                        {formatCurrency(addon.amount, invoice.currency)}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Flyer Portals Launcher */}
            <div className="bg-gradient-to-r from-slate-900 to-[#0b2341] border border-blue-500/40 rounded-xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Official Flyer Portals (Interactive Calculators)
                  </span>
                </div>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded border border-blue-400/30">
                  SEPARATE PORTALS
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Launch full-page standalone portals with live matrixes, rate tables, and official specifications.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {onOpenArchitecturalPortal && (
                  <button
                    type="button"
                    onClick={onOpenArchitecturalPortal}
                    className="flex items-center justify-between px-3 py-2 bg-indigo-900/60 hover:bg-indigo-800/80 border border-indigo-500/50 rounded-lg text-xs font-semibold text-indigo-200 transition shadow-sm cursor-pointer"
                  >
                    <span>🏛️ Architectural</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                {onOpenStructuralPortal && (
                  <button
                    type="button"
                    onClick={onOpenStructuralPortal}
                    className="flex items-center justify-between px-3 py-2 bg-blue-900/60 hover:bg-blue-800/80 border border-blue-500/50 rounded-lg text-xs font-semibold text-blue-200 transition shadow-sm cursor-pointer"
                  >
                    <span>🏗️ Structural</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                {onOpenBOQPortal && (
                  <button
                    type="button"
                    onClick={onOpenBOQPortal}
                    className="flex items-center justify-between px-3 py-2 bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-500/50 rounded-lg text-xs font-semibold text-emerald-200 transition shadow-sm cursor-pointer"
                  >
                    <span>📊 BOQ Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                {onOpenPackagesPortal && (
                  <button
                    type="button"
                    onClick={onOpenPackagesPortal}
                    className="flex items-center justify-between px-3 py-2 bg-amber-900/60 hover:bg-amber-800/80 border border-amber-500/50 rounded-lg text-xs font-semibold text-amber-200 transition shadow-sm cursor-pointer"
                  >
                    <span>🏷️ Packages Hub</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: CLIENT & PROJECT ================= */}
        {activeTab === 'project' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-amber-400" />
                Client & Project Identification
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Matches the Client Information and Project Information boxes on the official Univision invoice.
              </p>
            </div>

            {/* Client Info Section */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Client Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Client Full Name</label>
                  <input
                    type="text"
                    value={invoice.client.name}
                    onChange={(e) => updateClient('name', e.target.value)}
                    placeholder="e.g. Amadou Lamin Jallow"
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={invoice.client.phone}
                    onChange={(e) => updateClient('phone', e.target.value)}
                    placeholder="e.g. +220 7891234"
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={invoice.client.email}
                    onChange={(e) => updateClient('email', e.target.value)}
                    placeholder="e.g. amadou.jallow@example.gm"
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Client Physical Address</label>
                  <input
                    type="text"
                    value={invoice.client.address}
                    onChange={(e) => updateClient('address', e.target.value)}
                    placeholder="e.g. Brufut Heights, Layout Phase 2"
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Project Info Section */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Project Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">Project Name / Description</label>
                  <input
                    type="text"
                    value={invoice.project.projectName}
                    onChange={(e) => updateProject('projectName', e.target.value)}
                    placeholder="e.g. Modern 5-Bedroom Residential Villa"
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">Project Site Address</label>
                  <input
                    type="text"
                    value={invoice.project.projectAddress}
                    onChange={(e) => updateProject('projectAddress', e.target.value)}
                    placeholder="e.g. Plot 42, Sukuta Dalaba Extension"
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">City / Province / Region</label>
                  <input
                    type="text"
                    value={invoice.project.cityProvince}
                    onChange={(e) => updateProject('cityProvince', e.target.value)}
                    placeholder="e.g. West Coast Region"
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={invoice.project.postalCode}
                    onChange={(e) => updateProject('postalCode', e.target.value)}
                    placeholder="e.g. WCR-SKT"
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Invoice Meta Numbers */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={(e) => onChange({ ...invoice, invoiceNumber: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-slate-900 border border-slate-700 rounded text-amber-400 focus:outline-hidden focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Issue Date</label>
                <input
                  type="date"
                  value={invoice.date}
                  onChange={(e) => onChange({ ...invoice, date: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={invoice.dueDate || ''}
                  onChange={(e) => onChange({ ...invoice, dueDate: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: ADVANCE & PRICING ================= */}
        {activeTab === 'financials' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                Advance Deposit & Financial Breakdown
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure advance deposit requirements, commercial discounts, VAT, and currency units.
              </p>
            </div>

            {/* Currency & Unit Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-950 border border-slate-800 rounded-lg">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Currency</label>
                <select
                  value={invoice.currency}
                  onChange={(e) =>
                    onChange({ ...invoice, currency: e.target.value as CurrencyCode })
                  }
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500 font-mono"
                >
                  <option value="GMD">GMD - Gambian Dalasi (Official)</option>
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                  <option value="XOF">XOF - West African CFA Franc</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Measurement Unit</label>
                <select
                  value={invoice.unit}
                  onChange={(e) =>
                    onChange({ ...invoice, unit: e.target.value as MeasurementUnit })
                  }
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500 font-mono"
                >
                  <option value="m²">Square Metres (m²) - Standard</option>
                  <option value="sq ft">Square Feet (sq ft)</option>
                </select>
              </div>
            </div>

            {/* Advance Deposit Section */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Advance Commencement Deposit
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Univision work commences upon receipt of agreed advance deposit (Standard: 50%).
                  </p>
                </div>
                <div className="font-mono font-bold text-amber-400 text-sm tabular-nums">
                  {formatCurrency(calculations.depositRequiredAmount, invoice.currency)}
                </div>
              </div>

              {/* Deposit Quick Buttons */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                {[30, 50, 60, 70, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => onChange({ ...invoice, depositPercent: pct })}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      invoice.depositPercent === pct
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {pct}% Deposit
                  </button>
                ))}
              </div>

              {/* Advance Deposit Percentage Custom Control */}
              <div className="flex items-center justify-between text-xs bg-slate-900/60 px-3 py-1.5 rounded-md border border-slate-800/80">
                <span className="text-[11px] text-slate-400">
                  Agreed Advance Rate: <strong className="text-amber-400 font-mono">{invoice.depositPercent}%</strong>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">Custom Rate:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={invoice.depositPercent}
                    onChange={(e) =>
                      onChange({
                        ...invoice,
                        depositPercent: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                      })
                    }
                    className="w-16 px-2 py-0.5 text-xs font-mono tabular-nums text-right bg-slate-950 border border-slate-700 rounded text-amber-400 focus:outline-hidden focus:border-amber-500"
                  />
                  <span className="text-xs text-slate-400 font-semibold">%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-400">
                      Deposit Already Received Amount
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...invoice,
                          depositPaidAmount: calculations.depositRequiredAmount,
                          status: invoice.status === 'draft' || invoice.status === 'issued' ? 'deposit_paid' : invoice.status,
                        })
                      }
                      className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
                      title="Set deposit paid to the required advance deposit"
                    >
                      Fill Advance ({invoice.depositPercent}%)
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={invoice.depositPaidAmount}
                    onChange={(e) =>
                      onChange({
                        ...invoice,
                        depositPaidAmount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs font-mono tabular-nums bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-400">
                      Remaining Balance on Delivery
                    </label>
                    <span className="text-[10px] text-slate-400">
                      ({100 - invoice.depositPercent}% of Total)
                    </span>
                  </div>
                  <div className="px-3 py-1.5 text-xs font-mono font-bold text-emerald-400 bg-slate-900 border border-slate-800 rounded tabular-nums flex items-center justify-between">
                    <span>{formatCurrency(calculations.balanceDue, invoice.currency)}</span>
                    <span className="text-[10px] font-sans text-slate-400 font-normal">
                      Total: {formatCurrency(calculations.grandTotal, invoice.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Discount & Tax / VAT */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Discount Percentage (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={invoice.discountPercent}
                    onChange={(e) =>
                      onChange({
                        ...invoice,
                        discountPercent: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500"
                  />
                  <span className="text-xs text-slate-400">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tax / VAT Percentage (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={invoice.taxPercent}
                    onChange={(e) =>
                      onChange({
                        ...invoice,
                        taxPercent: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500"
                  />
                  <span className="text-xs text-slate-400">%</span>
                </div>
              </div>
            </div>

            {/* Final Calculation Summary */}
            <div className="p-4 bg-[#0b2341] border border-blue-500/30 rounded-lg space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Drawing Package ({calculations.totalArea} {invoice.unit}):</span>
                <span className="font-mono tabular-nums">
                  {formatCurrency(calculations.drawingPackageTotal, invoice.currency)}
                </span>
              </div>
              {calculations.addonsTotal > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>Additional Services:</span>
                  <span className="font-mono tabular-nums">
                    +{formatCurrency(calculations.addonsTotal, invoice.currency)}
                  </span>
                </div>
              )}
              {calculations.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({invoice.discountPercent}%):</span>
                  <span className="font-mono tabular-nums">
                    -{formatCurrency(calculations.discountAmount, invoice.currency)}
                  </span>
                </div>
              )}
              {calculations.taxAmount > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>Tax ({invoice.taxPercent}%):</span>
                  <span className="font-mono tabular-nums">
                    +{formatCurrency(calculations.taxAmount, invoice.currency)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-blue-400/30 flex justify-between items-center text-sm font-bold text-white">
                <span className="uppercase tracking-wider">Total Amount:</span>
                <span className="text-amber-400 font-mono text-base tabular-nums">
                  {formatCurrency(calculations.grandTotal, invoice.currency)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: PAYMENT DETAILS ================= */}
        {activeTab === 'payment' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                Banking & Payment Instructions
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Displays the payment box on the bottom right of the PDF invoice.
              </p>
            </div>

            {/* Quick Bank Presets */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1.5 uppercase font-bold tracking-wider">
                Select Company Account Preset (The Gambia)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {BANK_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...invoice,
                        paymentDetails: {
                          ...preset,
                          reference: invoice.paymentDetails.reference || invoice.invoiceNumber,
                        },
                      })
                    }
                    className={`p-2.5 text-left rounded-lg border text-xs transition-all ${
                      invoice.paymentDetails.bankName === preset.bankName
                        ? 'border-amber-500 bg-amber-950/20 text-white'
                        : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-semibold">{preset.bankName}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {preset.accountNumber}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Fields */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={invoice.paymentDetails.bankName}
                    onChange={(e) => updatePaymentDetails('bankName', e.target.value)}
                    placeholder="e.g. Trust Bank Ltd"
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={invoice.paymentDetails.accountName}
                    onChange={(e) => updatePaymentDetails('accountName', e.target.value)}
                    placeholder="UNIVISION DESIGN AND CONSTRUCTION LTD"
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={invoice.paymentDetails.accountNumber}
                    onChange={(e) => updatePaymentDetails('accountNumber', e.target.value)}
                    placeholder="110-384920-01"
                    className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-slate-900 border border-slate-700 rounded text-amber-400 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Payment Reference</label>
                  <input
                    type="text"
                    value={invoice.paymentDetails.reference}
                    onChange={(e) => updatePaymentDetails('reference', e.target.value)}
                    placeholder="INV-2026-084 / Project Name"
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Mobile Money Provider</label>
                  <input
                    type="text"
                    value={invoice.paymentDetails.mobileMoneyProvider || ''}
                    onChange={(e) => updatePaymentDetails('mobileMoneyProvider', e.target.value)}
                    placeholder="Wave / QMoney / Afrimoney"
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Mobile Money Number</label>
                  <input
                    type="text"
                    value={invoice.paymentDetails.mobileMoneyNumber || ''}
                    onChange={(e) => updatePaymentDetails('mobileMoneyNumber', e.target.value)}
                    placeholder="+220 872104724"
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: TERMS & SIGNATURE ================= */}
        {activeTab === 'terms' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Terms & Conditions and Digital Signing
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage legal terms and collect authenticated digital signatures.
              </p>
            </div>

            {/* Terms List */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Terms & Conditions Clauses
                </h4>
                <button
                  type="button"
                  onClick={() => onChange({ ...invoice, terms: [...DEFAULT_TERMS] })}
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  Reset to Univision Defaults
                </button>
              </div>

              <div className="space-y-2">
                {invoice.terms.map((term, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono w-4">{idx + 1}.</span>
                    <input
                      type="text"
                      value={term}
                      onChange={(e) => {
                        const newTerms = [...invoice.terms];
                        newTerms[idx] = e.target.value;
                        onChange({ ...invoice, terms: newTerms });
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-hidden focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newTerms = invoice.terms.filter((_, i) => i !== idx);
                        onChange({ ...invoice, terms: newTerms });
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...invoice,
                      terms: [...invoice.terms, 'New architectural agreement clause.'],
                    })
                  }
                  className="mt-2 text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Condition Clause
                </button>
              </div>
            </div>

            {/* Client Signature Manager */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <PenTool className="w-3.5 h-3.5 text-amber-400" />
                Client Digital Signature & Signer Date
              </h4>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <div className="flex-1">
                  <div className="text-xs text-slate-400 mb-1">Current Signature on File:</div>
                  {invoice.clientSignature ? (
                    invoice.clientSignatureType === 'draw' ? (
                      <div className="bg-white p-2 rounded max-w-xs">
                        <img
                          src={invoice.clientSignature}
                          alt="Signature"
                          className="max-h-12 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="font-signature text-2xl text-amber-400">
                        {invoice.clientSignature}
                      </div>
                    )
                  ) : (
                    <span className="text-xs text-slate-500 italic">No signature recorded yet.</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onOpenSignatureModal}
                    className="px-4 py-2 text-xs font-bold bg-[#0b2341] hover:bg-[#133863] text-amber-400 border border-blue-500/40 rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    {invoice.clientSignature ? 'Update Signature' : 'Open Signature Pad'}
                  </button>

                  {invoice.clientSignature && (
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          ...invoice,
                          clientSignature: '',
                          clientSignatureType: 'none',
                        })
                      }
                      className="px-3 py-2 text-xs text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Client Signature Date (mm/dd/yyyy)
                </label>
                <input
                  type="date"
                  value={invoice.clientSignDate || invoice.date}
                  onChange={(e) => onChange({ ...invoice, clientSignDate: e.target.value })}
                  className="w-full sm:w-64 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded text-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <ServicePackageEditorModal
        isOpen={servicesModalCategory !== null}
        onClose={() => setServicesModalCategory(null)}
        initialCategory={servicesModalCategory || 'architectural'}
      />
    </div>
  );
};
