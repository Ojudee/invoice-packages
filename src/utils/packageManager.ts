import {
  Invoice,
  InvoicePackagesConfig,
  PackageSelectionMap,
  PackageFilterPreset,
  FloorItem,
  AddonService,
} from '../types';
import {
  ARCHITECTURAL_PACKAGES,
  STRUCTURAL_PACKAGES,
  BOQ_PACKAGES,
  SITE_INSPECTION_PACKAGE,
  getBOQPackageFee,
} from '../data/constants';

/**
 * Standard Presets for printing one package or combining any two or all
 */
export const PACKAGE_PRESETS: Record<PackageFilterPreset, PackageSelectionMap> = {
  all: {
    architectural: true,
    structural: true,
    boq: true,
    inspection: true,
    addons: true,
  },
  architectural: {
    architectural: true,
    structural: false,
    boq: false,
    inspection: false,
    addons: false,
  },
  structural: {
    architectural: false,
    structural: true,
    boq: false,
    inspection: false,
    addons: false,
  },
  boq: {
    architectural: false,
    structural: false,
    boq: true,
    inspection: false,
    addons: false,
  },
  inspection: {
    architectural: false,
    structural: false,
    boq: false,
    inspection: true,
    addons: false,
  },
  addons: {
    architectural: false,
    structural: false,
    boq: false,
    inspection: false,
    addons: true,
  },
  arch_structural: {
    architectural: true,
    structural: true,
    boq: false,
    inspection: false,
    addons: false,
  },
  arch_boq: {
    architectural: true,
    structural: false,
    boq: true,
    inspection: false,
    addons: false,
  },
  structural_boq: {
    architectural: false,
    structural: true,
    boq: true,
    inspection: false,
    addons: false,
  },
  custom: {
    architectural: true,
    structural: false,
    boq: false,
    inspection: false,
    addons: false,
  },
};

/**
 * Extracts or synthesizes a complete InvoicePackagesConfig for any invoice
 */
export function getInvoicePackagesConfig(invoice: Invoice): InvoicePackagesConfig {
  const totalFloorArea = (invoice.floors || []).reduce((sum, f) => sum + (Number(f.area) || 0), 0) || 150;

  // Check if existing config is present
  if (invoice.packagesConfig) {
    return {
      architectural: {
        enabled: invoice.packagesConfig.architectural?.enabled ?? true,
        tier: invoice.packagesConfig.architectural?.tier ?? invoice.packageType ?? 'premium',
        rate: invoice.packagesConfig.architectural?.rate ?? invoice.packageRate ?? 100,
        area: invoice.packagesConfig.architectural?.area ?? totalFloorArea,
        notes: invoice.packagesConfig.architectural?.notes ?? '',
      },
      structural: {
        enabled: invoice.packagesConfig.structural?.enabled ?? false,
        tier: invoice.packagesConfig.structural?.tier ?? 'premium',
        rate: invoice.packagesConfig.structural?.rate ?? 85,
        area: invoice.packagesConfig.structural?.area ?? totalFloorArea,
        notes: invoice.packagesConfig.structural?.notes ?? '',
      },
      boq: {
        enabled: invoice.packagesConfig.boq?.enabled ?? false,
        tier: invoice.packagesConfig.boq?.tier ?? 'regular',
        fee: invoice.packagesConfig.boq?.fee ?? getBOQPackageFee(totalFloorArea, 'regular'),
        notes: invoice.packagesConfig.boq?.notes ?? '',
      },
      inspection: {
        enabled: invoice.packagesConfig.inspection?.enabled ?? false,
        fee: invoice.packagesConfig.inspection?.fee ?? SITE_INSPECTION_PACKAGE.fixedFee,
        notes: invoice.packagesConfig.inspection?.notes ?? '',
      },
    };
  }

  // Auto-detect packages from floors & addons if legacy invoice
  const hasStructuralFloor = (invoice.floors || []).some((f) =>
    f.floorName.toLowerCase().includes('structural')
  );
  const boqAddon = (invoice.addons || []).find(
    (a) => a.enabled && (a.name.toLowerCase().includes('boq') || a.name.toLowerCase().includes('quantities'))
  );
  const inspectionAddon = (invoice.addons || []).find(
    (a) => a.enabled && a.name.toLowerCase().includes('inspection')
  );

  return {
    architectural: {
      enabled: true,
      tier: invoice.packageType || 'premium',
      rate: invoice.packageRate || 100,
      area: totalFloorArea,
      notes: '',
    },
    structural: {
      enabled: hasStructuralFloor,
      tier: 'premium',
      rate: 85,
      area: totalFloorArea,
      notes: '',
    },
    boq: {
      enabled: !!boqAddon,
      tier: 'regular',
      fee: boqAddon ? boqAddon.amount : getBOQPackageFee(totalFloorArea, 'regular'),
      notes: '',
    },
    inspection: {
      enabled: !!inspectionAddon,
      fee: inspectionAddon ? inspectionAddon.amount : SITE_INSPECTION_PACKAGE.fixedFee,
      notes: '',
    },
  };
}

export interface PackageSummary {
  key: keyof PackageSelectionMap;
  title: string;
  icon: string;
  enabled: boolean;
  tier?: string;
  rateOrFeeLabel: string;
  areaOrQtyLabel?: string;
  subtotal: number;
  badge: string;
  deliverables: string[];
}

/**
 * Calculates current values and subtotals for each package in the invoice
 */
export function getPackageSummaries(invoice: Invoice): {
  packages: Record<keyof PackageSelectionMap, PackageSummary>;
  activeCount: number;
  grandTotal: number;
  totalArea: number;
} {
  const config = getInvoicePackagesConfig(invoice);
  const totalFloorArea = (invoice.floors || []).reduce((sum, f) => sum + (Number(f.area) || 0), 0) || 150;

  // Architectural
  const archArea = config.architectural.area ?? totalFloorArea;
  const archRate = config.architectural.rate || 100;
  const archSubtotal = config.architectural.enabled ? Math.round(archArea * archRate) : 0;
  const archFeatures =
    config.architectural.tier === 'regular'
      ? ARCHITECTURAL_PACKAGES.regular.features
      : ARCHITECTURAL_PACKAGES.premium.features;

  // Structural
  const structArea = config.structural.area ?? totalFloorArea;
  const structRate = config.structural.rate || 85;
  const structSubtotal = config.structural.enabled ? Math.round(structArea * structRate) : 0;
  const structFeatures =
    config.structural.tier === 'regular'
      ? STRUCTURAL_PACKAGES.regular.features
      : STRUCTURAL_PACKAGES.premium.features;

  // BOQ
  const boqFee = config.boq.fee || getBOQPackageFee(totalFloorArea, config.boq.tier === 'premium' ? 'premium' : 'regular');
  const boqSubtotal = config.boq.enabled ? boqFee : 0;
  const boqFeatures =
    config.boq.tier === 'premium'
      ? BOQ_PACKAGES.premium.features
      : BOQ_PACKAGES.regular.features;

  // Inspection
  const inspectionFee = config.inspection.fee || SITE_INSPECTION_PACKAGE.fixedFee;
  const inspectionSubtotal = config.inspection.enabled ? inspectionFee : 0;
  const inspectionFeatures = SITE_INSPECTION_PACKAGE.includes;

  // Addons (excluding boq & inspection if configured separately)
  const otherAddons = (invoice.addons || []).filter((a) => {
    if (!a.enabled) return false;
    const n = a.name.toLowerCase();
    if (n.includes('boq') || n.includes('quantities')) return false;
    if (n.includes('inspection')) return false;
    return true;
  });
  const addonsSubtotal = otherAddons.reduce((s, a) => s + (Number(a.amount) || 0), 0);

  const summaries: Record<keyof PackageSelectionMap, PackageSummary> = {
    architectural: {
      key: 'architectural',
      title: 'Architectural Drawing Package',
      icon: '🏛️',
      enabled: config.architectural.enabled,
      tier: config.architectural.tier.toUpperCase(),
      rateOrFeeLabel: `${invoice.currency} ${archRate} / ${invoice.unit}`,
      areaOrQtyLabel: `${archArea.toFixed(1)} ${invoice.unit}`,
      subtotal: archSubtotal,
      badge: `${config.architectural.tier.toUpperCase()} TIER`,
      deliverables: archFeatures,
    },
    structural: {
      key: 'structural',
      title: 'Structural Engineering Package',
      icon: '🏗️',
      enabled: config.structural.enabled,
      tier: config.structural.tier.toUpperCase(),
      rateOrFeeLabel: `${invoice.currency} ${structRate} / ${invoice.unit}`,
      areaOrQtyLabel: `${structArea.toFixed(1)} ${invoice.unit}`,
      subtotal: structSubtotal,
      badge: `${config.structural.tier.toUpperCase()} TIER`,
      deliverables: structFeatures,
    },
    boq: {
      key: 'boq',
      title: 'Bills of Quantities (BOQ) Package',
      icon: '📊',
      enabled: config.boq.enabled,
      tier: config.boq.tier.toUpperCase(),
      rateOrFeeLabel: `${invoice.currency} ${boqFee.toLocaleString()}`,
      areaOrQtyLabel: `${totalFloorArea.toFixed(1)} ${invoice.unit} Scope`,
      subtotal: boqSubtotal,
      badge: `${config.boq.tier.toUpperCase()} PACKAGE`,
      deliverables: boqFeatures,
    },
    inspection: {
      key: 'inspection',
      title: 'Site Inspection & Reports Package',
      icon: '🔍',
      enabled: config.inspection.enabled,
      rateOrFeeLabel: `${invoice.currency} ${inspectionFee.toLocaleString()}`,
      areaOrQtyLabel: 'Site Assessment & Consultation',
      subtotal: inspectionSubtotal,
      badge: 'FIXED RATE',
      deliverables: inspectionFeatures,
    },
    addons: {
      key: 'addons',
      title: 'Additional Deliverables & Add-ons',
      icon: '⚡',
      enabled: otherAddons.length > 0,
      rateOrFeeLabel: `${invoice.currency} ${addonsSubtotal.toLocaleString()}`,
      areaOrQtyLabel: `${otherAddons.length} item(s)`,
      subtotal: addonsSubtotal,
      badge: 'CUSTOM ADD-ONS',
      deliverables: otherAddons.map((a) => a.name),
    },
  };

  const activeCount = Object.values(summaries).filter((s) => s.enabled).length;
  const grandTotal =
    archSubtotal + structSubtotal + boqSubtotal + inspectionSubtotal + addonsSubtotal;

  return {
    packages: summaries,
    activeCount,
    grandTotal,
    totalArea: totalFloorArea,
  };
}

/**
 * Filter an invoice to ONLY the selected package(s) for viewing, printing, or PDF export.
 * Dynamically computes line items, banner titles, and totals.
 */
export function filterInvoiceForPackages(
  invoice: Invoice,
  selection: PackageSelectionMap
): {
  filteredInvoice: Invoice;
  bannerTitle: string;
  selectedNames: string[];
  isSinglePackage: boolean;
  singlePackageKey?: keyof PackageSelectionMap;
} {
  const config = getInvoicePackagesConfig(invoice);
  const { packages, totalArea } = getPackageSummaries(invoice);

  const selectedKeys = (Object.keys(selection) as (keyof PackageSelectionMap)[]).filter(
    (k) => selection[k]
  );

  const isSinglePackage = selectedKeys.length === 1;
  const singlePackageKey = isSinglePackage ? selectedKeys[0] : undefined;
  const selectedNames = selectedKeys.map((k) => packages[k].title);

  // Determine banner title
  let bannerTitle = invoice.company.bannerTitle || 'ARCHITECTURAL & ENGINEERING SERVICES';
  if (isSinglePackage) {
    if (singlePackageKey === 'architectural') {
      bannerTitle = 'ARCHITECTURAL DRAWING PACKAGE';
    } else if (singlePackageKey === 'structural') {
      bannerTitle = 'STRUCTURAL ENGINEERING DRAWING PACKAGE';
    } else if (singlePackageKey === 'boq') {
      bannerTitle = 'BILLS OF QUANTITIES (BOQ) PACKAGE';
    } else if (singlePackageKey === 'inspection') {
      bannerTitle = 'SITE INSPECTION & REPORTS PACKAGE';
    } else if (singlePackageKey === 'addons') {
      bannerTitle = 'ADDITIONAL ENGINEERING DELIVERABLES';
    }
  } else if (selectedKeys.length === 2) {
    if (selection.architectural && selection.structural) {
      bannerTitle = 'ARCHITECTURAL & STRUCTURAL ENGINEERING SERVICES';
    } else if (selection.architectural && selection.boq) {
      bannerTitle = 'ARCHITECTURAL DESIGN & BOQ SERVICES';
    } else if (selection.structural && selection.boq) {
      bannerTitle = 'STRUCTURAL ENGINEERING & BOQ SERVICES';
    } else {
      bannerTitle = `${packages[selectedKeys[0]].title.split(' ')[0]} & ${packages[selectedKeys[1]].title.split(' ')[0]} SERVICES`;
    }
  } else if (selectedKeys.length > 2) {
    bannerTitle = 'UNIVISION COMPREHENSIVE DESIGN & ENGINEERING PACKAGES';
  }

  // Build floors table for selected packages
  const newFloors: FloorItem[] = [];

  // 1. Architectural floors
  if (selection.architectural) {
    const archFloors = (invoice.floors || []).filter(
      (f) => !f.floorName.toLowerCase().includes('structural')
    );

    if (archFloors.length > 0) {
      archFloors.forEach((f) => {
        newFloors.push({
          id: f.id,
          floorName: selectedKeys.length > 1 ? `[Architectural] ${f.floorName}` : f.floorName,
          area: Number(f.area) || 0,
          customRate: f.customRate ?? config.architectural.rate,
        });
      });
    } else {
      newFloors.push({
        id: 'arch-default-floor',
        floorName: selectedKeys.length > 1 ? '[Architectural] Covered Floor Area' : 'Architectural Floor Design Scope',
        area: totalArea,
        customRate: config.architectural.rate,
      });
    }
  }

  // 2. Structural floors
  if (selection.structural) {
    const structArea = config.structural.area ?? totalArea;
    const structRate = config.structural.rate || 85;

    // Check if original invoice had detailed structural floors
    const existingStructFloors = (invoice.floors || []).filter((f) =>
      f.floorName.toLowerCase().includes('structural')
    );

    if (existingStructFloors.length > 0) {
      existingStructFloors.forEach((f) => {
        newFloors.push({
          id: f.id,
          floorName: selectedKeys.length > 1 ? `[Structural] ${f.floorName}` : f.floorName,
          area: Number(f.area) || structArea,
          customRate: f.customRate ?? structRate,
        });
      });
    } else {
      newFloors.push({
        id: 'struct-scope-floor',
        floorName:
          selectedKeys.length > 1
            ? `[Structural Engineering] Layouts, Foundation, Columns, Beams & BBS (${config.structural.tier.toUpperCase()})`
            : `Structural Engineering Scope - Foundation, Beams, Columns, Slabs & BBS (${config.structural.tier.toUpperCase()})`,
        area: structArea,
        customRate: structRate,
      });
    }
  }

  // 3. BOQ Line Item (if selected and represented as floor or addon)
  const newAddons: AddonService[] = [];

  if (selection.boq) {
    const boqFee = config.boq.fee || getBOQPackageFee(totalArea, config.boq.tier === 'premium' ? 'premium' : 'regular');
    if (isSinglePackage && newFloors.length === 0) {
      // Put directly in floors table for single package view
      newFloors.push({
        id: 'boq-single-item',
        floorName: `Bills of Quantities (BOQ) - ${config.boq.tier.toUpperCase()} PACKAGE (Quantity Takeoff & Cost Report)`,
        area: totalArea,
        customRate: Math.round(boqFee / (totalArea || 1)),
      });
    } else {
      newAddons.push({
        id: 'boq-package-addon',
        name: `Bills of Quantities (BOQ) - ${config.boq.tier.toUpperCase()} PACKAGE`,
        description: `Measured trade material takeoff, labor schedules & cost consultancy for ${totalArea} m²`,
        amount: boqFee,
        enabled: true,
      });
    }
  }

  // 4. Site Inspection Line Item
  if (selection.inspection) {
    const fee = config.inspection.fee || SITE_INSPECTION_PACKAGE.fixedFee;
    if (isSinglePackage && newFloors.length === 0) {
      newFloors.push({
        id: 'inspect-single-item',
        floorName: 'Site Inspection & Engineering Assessment (Field Visit, Technical Inspection & Official Report)',
        area: 1,
        customRate: fee,
      });
    } else {
      newAddons.push({
        id: 'inspect-package-addon',
        name: SITE_INSPECTION_PACKAGE.name,
        description: SITE_INSPECTION_PACKAGE.includes.join(' • '),
        amount: fee,
        enabled: true,
      });
    }
  }

  // 5. Other Addon services
  if (selection.addons) {
    const otherAddons = (invoice.addons || []).filter((a) => {
      if (!a.enabled) return false;
      const n = a.name.toLowerCase();
      if (n.includes('boq') || n.includes('quantities')) return false;
      if (n.includes('inspection')) return false;
      return true;
    });

    otherAddons.forEach((a) => {
      newAddons.push({ ...a });
    });
  }

  // Ensure at least one line item exists
  if (newFloors.length === 0 && newAddons.length === 0) {
    newFloors.push({
      id: 'empty-scope',
      floorName: 'No packages selected for this invoice view',
      area: 0,
      customRate: 0,
    });
  }

  // Primary rate & type for single package view
  const primaryRate =
    singlePackageKey === 'structural'
      ? config.structural.rate
      : singlePackageKey === 'architectural'
      ? config.architectural.rate
      : invoice.packageRate;

  const primaryType =
    singlePackageKey === 'structural'
      ? config.structural.tier
      : singlePackageKey === 'architectural'
      ? config.architectural.tier
      : invoice.packageType;

  // Custom notes tailored to selected packages
  let notes = invoice.additionalNotes || '';
  if (isSinglePackage) {
    if (singlePackageKey === 'architectural') {
      notes =
        config.architectural.notes ||
        `Architectural Drawing Package (${config.architectural.tier.toUpperCase()}). Includes 3D Exterior Visualization, floor plans, elevations, sections, and permit-ready municipal drawing sets.`;
    } else if (singlePackageKey === 'structural') {
      notes =
        config.structural.notes ||
        `Structural Engineering Package (${config.structural.tier.toUpperCase()}). Includes foundation design, column/beam schedules, structural calculations, and Bar Bending Schedule (BBS).`;
    } else if (singlePackageKey === 'boq') {
      notes =
        config.boq.notes ||
        `Bills of Quantities (BOQ) - ${config.boq.tier.toUpperCase()} Package. Includes quantity takeoff, material breakdown, labor cost estimates, and municipal tender schedules.`;
    } else if (singlePackageKey === 'inspection') {
      notes =
        config.inspection.notes ||
        'Site Inspection & Technical Consultation. Includes on-site field assessment, soil/site notes, sketch plans, and formal engineering report.';
    }
  }

  const filteredInvoice: Invoice = {
    ...invoice,
    company: {
      ...invoice.company,
      bannerTitle,
    },
    floors: newFloors,
    addons: newAddons,
    packageRate: primaryRate,
    packageType: primaryType,
    additionalNotes: notes,
  };

  return {
    filteredInvoice,
    bannerTitle,
    selectedNames,
    isSinglePackage,
    singlePackageKey,
  };
}
