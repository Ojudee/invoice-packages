import React, { useState } from 'react';
import {
  Search,
  Plus,
  Copy,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '../types';
import { calculateInvoice, formatCurrency, formatDateToSlash } from '../utils/calculations';

interface InvoiceListProps {
  invoices: Invoice[];
  activeInvoiceId: string;
  onSelectInvoice: (id: string) => void;
  onCreateNewInvoice: () => void;
  onDuplicateInvoice: (id: string) => void;
  onDeleteInvoice: (id: string) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  activeInvoiceId,
  onSelectInvoice,
  onCreateNewInvoice,
  onDuplicateInvoice,
  onDeleteInvoice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');

  // Filtered invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.project.projectAddress.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Aggregate stats
  const totalInvoiced = invoices.reduce(
    (sum, inv) => sum + calculateInvoice(inv).grandTotal,
    0
  );
  const totalDeposits = invoices.reduce(
    (sum, inv) => sum + (Number(inv.depositPaidAmount) || 0),
    0
  );
  const pendingBalance = totalInvoiced - totalDeposits;

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Paid Full
          </span>
        );
      case 'deposit_paid':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Clock className="w-3 h-3" /> Deposit Paid
          </span>
        );
      case 'issued':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" /> Issued
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
            <AlertCircle className="w-3 h-3" /> Overdue
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-semibold bg-slate-700/50 text-slate-400 border border-slate-600">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col text-slate-100">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-slate-800 border-b border-slate-800">
        <div className="bg-slate-900/90 p-4">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Total Architectural Billings
          </div>
          <div className="font-mono text-lg font-bold text-white mt-1 tabular-nums">
            {formatCurrency(totalInvoiced, 'GMD')}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{invoices.length} Registered Invoices</div>
        </div>

        <div className="bg-slate-900/90 p-4">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Advance Deposits Collected
          </div>
          <div className="font-mono text-lg font-bold text-amber-400 mt-1 tabular-nums">
            {formatCurrency(totalDeposits, 'GMD')}
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Work authorized & started</div>
        </div>

        <div className="bg-slate-900/90 p-4">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Outstanding on Delivery
          </div>
          <div className="font-mono text-lg font-bold text-blue-400 mt-1 tabular-nums">
            {formatCurrency(pendingBalance, 'GMD')}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Payable upon final drawing approval</div>
        </div>
      </div>

      {/* Control Bar: Search, Filters, New Invoice */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice #, client, address..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          {(['all', 'draft', 'issued', 'deposit_paid', 'paid'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap capitalize ${
                statusFilter === st
                  ? 'bg-[#0b2341] text-amber-400 border border-blue-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {st === 'deposit_paid' ? 'Deposit' : st}
            </button>
          ))}
        </div>

        {/* Create Button */}
        <button
          type="button"
          onClick={onCreateNewInvoice}
          className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      {/* Invoices List */}
      <div className="divide-y divide-slate-800 max-h-[550px] overflow-y-auto">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium">No invoices match your query.</p>
            <p className="text-xs text-slate-500 mt-1">
              Create a new invoice or adjust your search filter.
            </p>
          </div>
        ) : (
          filteredInvoices.map((inv) => {
            const calcs = calculateInvoice(inv);
            const isSelected = inv.id === activeInvoiceId;

            return (
              <div
                key={inv.id}
                onClick={() => onSelectInvoice(inv.id)}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-950/20 border-l-4 border-l-amber-400'
                    : 'hover:bg-slate-800/50'
                }`}
              >
                {/* Left info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-bold text-sm text-white">
                      {inv.invoiceNumber}
                    </span>
                    {getStatusBadge(inv.status)}
                    <span className="text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                      {inv.packageType} ({inv.packageRate} {inv.currency}/{inv.unit})
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-slate-200 mt-1 truncate">
                    {inv.client.name || 'Unnamed Client'}
                    {inv.project.projectName && (
                      <span className="text-slate-400 font-normal ml-2">
                        · {inv.project.projectName}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {formatDateToSlash(inv.date)}
                    </span>
                    <span>·</span>
                    <span>
                      {calcs.totalArea} {inv.unit} ({inv.floors.length} levels)
                    </span>
                    {inv.project.cityProvince && (
                      <>
                        <span>·</span>
                        <span>{inv.project.cityProvince}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right financial & actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <div className="font-mono font-black text-base text-amber-400 tabular-nums">
                      {formatCurrency(calcs.grandTotal, inv.currency)}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Dep: {formatCurrency(calcs.depositRequiredAmount, inv.currency)}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onDuplicateInvoice(inv.id)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                      title="Duplicate this invoice"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteInvoice(inv.id)}
                      disabled={invoices.length <= 1}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors disabled:opacity-20"
                      title="Delete invoice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectInvoice(inv.id)}
                      className="p-1.5 text-amber-400 hover:text-amber-300"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
