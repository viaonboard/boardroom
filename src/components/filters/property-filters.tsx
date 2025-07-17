'use client';

import * as React from 'react';
import { useImperativeHandle, useState } from 'react';

import { Check, ChevronDown, Filter, X } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Checkbox } from '@kit/ui/checkbox';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@kit/ui/collapsible';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@kit/ui/sheet';

import type { PropertyFilterParams } from '../../types';

export const PROPERTY_TYPES = [
  'Office',
  'Retail',
  'Industrial',
  'Multifamily',
  'Hospitality',
  'Mixed-Use',
  'Land',
  'Commercial',
  'Other',
] as const;

export const PROPERTY_CLASSES = [
  'A+',
  'A',
  'A-',
  'B+',
  'B',
  'B-',
  'C+',
  'C',
  'C-',
] as const;

export const ZONING_TYPES = [
  'Commercial',
  'Residential',
  'Industrial',
  'Mixed-Use',
  'Agricultural',
  'Other',
] as const;

const AMENITIES = [
  'Parking',
  'Elevators',
  'Gym',
  'HVAC',
  'Loading Docks',
  'Security System',
  'Lobby',
  'Conference Rooms',
  'Bike Storage',
  'Shower Facilities',
  'Rooftop Access',
  'On-site Management',
] as const;

const DEAL_TYPES = [
  'For Sale',
  'For Lease',
  'Sublease',
  'Investment',
  'Joint Venture',
] as const;

const LEASE_TYPES = [
  'Triple Net',
  'Full-Service Gross',
  'Modified Gross',
] as const;

const LEASE_TERM_TYPES = ['Short-term', 'Long-term', 'Flexible'] as const;

const PURCHASE_TYPES = ['Cash', 'Financed', 'Owner-carry'] as const;

const INVESTMENT_TYPES = [
  'Core',
  'Core Plus',
  'Value-Add',
  'Opportunistic',
] as const;

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'MX', label: 'Mexico' },
] as const;

const STATE_CODES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
] as const;

type PropertyType = (typeof PROPERTY_TYPES)[number];
type PropertyClass = (typeof PROPERTY_CLASSES)[number];
type ZoningType = (typeof ZONING_TYPES)[number];
type Amenity = (typeof AMENITIES)[number];
type DealType = (typeof DEAL_TYPES)[number];
type LeaseType = (typeof LEASE_TYPES)[number];
type LeaseTermType = (typeof LEASE_TERM_TYPES)[number];
type PurchaseType = (typeof PURCHASE_TYPES)[number];
type InvestmentType = (typeof INVESTMENT_TYPES)[number];
type CountryCode = (typeof COUNTRIES)[number]['value'];
type StateCode = (typeof STATE_CODES)[number];

// Add missing type definition for component props
type PropertyFiltersProps = {
  onFiltersChange?: (filters: PropertyFilterParams) => void;
  defaultFilters?: PropertyFilterParams;
  dashboardType?: 'property' | 'contact';
};

// Helper type for filter metrics
type FilterMetric = {
  label: string;
  min: keyof Pick<PropertyFilterParams, 
    | 'minRoi' | 'maxRoi'
    | 'minOperatingExpenses' | 'maxOperatingExpenses'
    | 'minPricePerSqFt' | 'maxPricePerSqFt'
    | 'minIrr' | 'maxIrr'
    | 'minDscr' | 'maxDscr'
    | 'minLtv' | 'maxLtv'
    | 'minCapRate' | 'maxCapRate'
    | 'minEquityRequired' | 'maxEquityRequired'
    | 'minAppraisalValue' | 'maxAppraisalValue'
    | 'minEffectiveGrossIncome' | 'maxEffectiveGrossIncome'
    | 'minGrossOperatingIncome' | 'maxGrossOperatingIncome'
    | 'minOccupancy' | 'maxOccupancy'
    | 'minVacancy' | 'maxVacancy'
    | 'minDistributionYield' | 'maxDistributionYield'
    | 'minInvestorReturnVolatility' | 'maxInvestorReturnVolatility'
    | 'minNetCashFlowYield' | 'maxNetCashFlowYield'
    | 'minDiscountedCashFlow' | 'maxDiscountedCashFlow'
    | 'minProfitMargin' | 'maxProfitMargin'
    | 'minExitCapRate' | 'maxExitCapRate'
    | 'minTenantRetentionRate' | 'maxTenantRetentionRate'
    | 'minLeasingActivity' | 'maxLeasingActivity'
    | 'minRentCollectionRate' | 'maxRentCollectionRate'
    | 'minLeasingVelocity' | 'maxLeasingVelocity'
    | 'minRenewalRate' | 'maxRenewalRate'
    | 'minEffectiveRentGrowth' | 'maxEffectiveRentGrowth'
    | 'minPreLeaseRate' | 'maxPreLeaseRate'
    | 'minSpaceUtilizationRate' | 'maxSpaceUtilizationRate'
    | 'minLeaseEscalatorAverage' | 'maxLeaseEscalatorAverage'
    | 'minCamRecoveryRate' | 'maxCamRecoveryRate'
    | 'minCamReconciliationAccuracy' | 'maxCamReconciliationAccuracy'
    | 'minCamCostPerSqft' | 'maxCamCostPerSqft'
    | 'minCamChargesPercentOfRent' | 'maxCamChargesPercentOfRent'
    | 'minPropertyConditionIndex' | 'maxPropertyConditionIndex'
    | 'minCapitalExpenditureRatio' | 'maxCapitalExpenditureRatio'
    | 'minMaintenanceCostPerSqft' | 'maxMaintenanceCostPerSqft'
    | 'minMarketRentGrowth' | 'maxMarketRentGrowth'
    | 'minComparableSalesAnalysis' | 'maxComparableSalesAnalysis'
    | 'minAbsorptionRate' | 'maxAbsorptionRate'
    | 'minPortfolioDiversificationRatio' | 'maxPortfolioDiversificationRatio'
    | 'minPropertyTurnoverRate' | 'maxPropertyTurnoverRate'
    | 'minAssetTurnoverRatio' | 'maxAssetTurnoverRatio'
    | 'minTenantConcentrationRisk' | 'maxTenantConcentrationRisk'
    | 'minPropertyValuationGrowth' | 'maxPropertyValuationGrowth'
  >;
  max: keyof Pick<PropertyFilterParams, 
    | 'minRoi' | 'maxRoi'
    | 'minOperatingExpenses' | 'maxOperatingExpenses'
    | 'minPricePerSqFt' | 'maxPricePerSqFt'
    | 'minIrr' | 'maxIrr'
    | 'minDscr' | 'maxDscr'
    | 'minLtv' | 'maxLtv'
    | 'minCapRate' | 'maxCapRate'
    | 'minEquityRequired' | 'maxEquityRequired'
    | 'minAppraisalValue' | 'maxAppraisalValue'
    | 'minEffectiveGrossIncome' | 'maxEffectiveGrossIncome'
    | 'minGrossOperatingIncome' | 'maxGrossOperatingIncome'
    | 'minOccupancy' | 'maxOccupancy'
    | 'minVacancy' | 'maxVacancy'
    | 'minDistributionYield' | 'maxDistributionYield'
    | 'minInvestorReturnVolatility' | 'maxInvestorReturnVolatility'
    | 'minNetCashFlowYield' | 'maxNetCashFlowYield'
    | 'minDiscountedCashFlow' | 'maxDiscountedCashFlow'
    | 'minProfitMargin' | 'maxProfitMargin'
    | 'minExitCapRate' | 'maxExitCapRate'
    | 'minTenantRetentionRate' | 'maxTenantRetentionRate'
    | 'minLeasingActivity' | 'maxLeasingActivity'
    | 'minRentCollectionRate' | 'maxRentCollectionRate'
    | 'minLeasingVelocity' | 'maxLeasingVelocity'
    | 'minRenewalRate' | 'maxRenewalRate'
    | 'minEffectiveRentGrowth' | 'maxEffectiveRentGrowth'
    | 'minPreLeaseRate' | 'maxPreLeaseRate'
    | 'minSpaceUtilizationRate' | 'maxSpaceUtilizationRate'
    | 'minLeaseEscalatorAverage' | 'maxLeaseEscalatorAverage'
    | 'minCamRecoveryRate' | 'maxCamRecoveryRate'
    | 'minCamReconciliationAccuracy' | 'maxCamReconciliationAccuracy'
    | 'minCamCostPerSqft' | 'maxCamCostPerSqft'
    | 'minCamChargesPercentOfRent' | 'maxCamChargesPercentOfRent'
    | 'minPropertyConditionIndex' | 'maxPropertyConditionIndex'
    | 'minCapitalExpenditureRatio' | 'maxCapitalExpenditureRatio'
    | 'minMaintenanceCostPerSqft' | 'maxMaintenanceCostPerSqft'
    | 'minMarketRentGrowth' | 'maxMarketRentGrowth'
    | 'minComparableSalesAnalysis' | 'maxComparableSalesAnalysis'
    | 'minAbsorptionRate' | 'maxAbsorptionRate'
    | 'minPortfolioDiversificationRatio' | 'maxPortfolioDiversificationRatio'
    | 'minPropertyTurnoverRate' | 'maxPropertyTurnoverRate'
    | 'minAssetTurnoverRatio' | 'maxAssetTurnoverRatio'
    | 'minTenantConcentrationRisk' | 'maxTenantConcentrationRisk'
    | 'minPropertyValuationGrowth' | 'maxPropertyValuationGrowth'
  >;
};

// Constants with proper typing
const FINANCIAL_METRICS: FilterMetric[] = [
  {
    label: 'Operating Expenses',
    min: 'minOperatingExpenses',
    max: 'maxOperatingExpenses',
  },
  {
    label: 'Price per SqFt',
    min: 'minPricePerSqFt',
    max: 'maxPricePerSqFt',
  },
  {
    label: 'IRR',
    min: 'minIrr',
    max: 'maxIrr',
  },
  {
    label: 'DSCR',
    min: 'minDscr',
    max: 'maxDscr',
  },
  {
    label: 'LTV',
    min: 'minLtv',
    max: 'maxLtv',
  },
  {
    label: 'ROI',
    min: 'minRoi',
    max: 'maxRoi',
  },
  {
    label: 'Equity Required',
    min: 'minEquityRequired',
    max: 'maxEquityRequired',
  },
  {
    label: 'Appraisal Value',
    min: 'minAppraisalValue',
    max: 'maxAppraisalValue',
  },
];

const LEASING_METRICS: FilterMetric[] = [
  { label: 'Tenant Retention Rate (%)', min: 'minTenantRetentionRate', max: 'maxTenantRetentionRate' },
  { label: 'Leasing Activity (%)', min: 'minLeasingActivity', max: 'maxLeasingActivity' },
  { label: 'Rent Collection Rate (%)', min: 'minRentCollectionRate', max: 'maxRentCollectionRate' },
  { label: 'Leasing Velocity (%)', min: 'minLeasingVelocity', max: 'maxLeasingVelocity' },
  { label: 'Renewal Rate (%)', min: 'minRenewalRate', max: 'maxRenewalRate' },
  { label: 'Effective Rent Growth (%)', min: 'minEffectiveRentGrowth', max: 'maxEffectiveRentGrowth' },
  { label: 'Pre-Lease Rate (%)', min: 'minPreLeaseRate', max: 'maxPreLeaseRate' },
  { label: 'Space Utilization Rate (%)', min: 'minSpaceUtilizationRate', max: 'maxSpaceUtilizationRate' },
  { label: 'Lease Escalator Average (%)', min: 'minLeaseEscalatorAverage', max: 'maxLeaseEscalatorAverage' },
];

const CAM_OPERATING_METRICS: FilterMetric[] = [
  {
    label: 'CAM Recovery Rate',
    min: 'minCamRecoveryRate',
    max: 'maxCamRecoveryRate',
  },
  {
    label: 'CAM Reconciliation Accuracy',
    min: 'minCamReconciliationAccuracy',
    max: 'maxCamReconciliationAccuracy',
  },
  {
    label: 'CAM Cost per SqFt',
    min: 'minCamCostPerSqft',
    max: 'maxCamCostPerSqft',
  },
  {
    label: 'CAM Charges % of Rent',
    min: 'minCamChargesPercentOfRent',
    max: 'maxCamChargesPercentOfRent',
  },
  {
    label: 'Property Condition Index',
    min: 'minPropertyConditionIndex',
    max: 'maxPropertyConditionIndex',
  },
  {
    label: 'Capital Expenditure Ratio',
    min: 'minCapitalExpenditureRatio',
    max: 'maxCapitalExpenditureRatio',
  },
  {
    label: 'Maintenance Cost per SqFt',
    min: 'minMaintenanceCostPerSqft',
    max: 'maxMaintenanceCostPerSqft',
  },
];

const MARKET_ANALYSIS_METRICS: FilterMetric[] = [
  {
    label: 'Market Rent Growth',
    min: 'minMarketRentGrowth',
    max: 'maxMarketRentGrowth',
  },
  {
    label: 'Comparable Sales Analysis',
    min: 'minComparableSalesAnalysis',
    max: 'maxComparableSalesAnalysis',
  },
  {
    label: 'Absorption Rate',
    min: 'minAbsorptionRate',
    max: 'maxAbsorptionRate',
  },
  {
    label: 'Portfolio Diversification Ratio',
    min: 'minPortfolioDiversificationRatio',
    max: 'maxPortfolioDiversificationRatio',
  },
  {
    label: 'Property Turnover Rate',
    min: 'minPropertyTurnoverRate',
    max: 'maxPropertyTurnoverRate',
  },
  {
    label: 'Asset Turnover Ratio',
    min: 'minAssetTurnoverRatio',
    max: 'maxAssetTurnoverRatio',
  },
  {
    label: 'Tenant Concentration Risk',
    min: 'minTenantConcentrationRisk',
    max: 'maxTenantConcentrationRisk',
  },
  {
    label: 'Property Valuation Growth',
    min: 'minPropertyValuationGrowth',
    max: 'maxPropertyValuationGrowth',
  },
];

// Helper function to count active filters in a metric group
const countMetricFilters = (
  filters: PropertyFilterParams,
  metrics: FilterMetric[]
): number => {
  return metrics.reduce((count, metric) => {
    return (
      count +
      (filters[metric.min] !== undefined ? 1 : 0) +
      (filters[metric.max] !== undefined ? 1 : 0)
    );
  }, 0);
};

function FilterSection({
  title,
  count,
  children,
  onClear,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  onClear: () => void;
}) {
  const [isOpen, setIsOpen] = React.useState(count > 0);

  // Update isOpen when count changes
  React.useEffect(() => {
    if (count > 0) {
      setIsOpen(true);
    }
  }, [count]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between rounded-lg border bg-white p-3 transition-colors hover:bg-accent hover:text-accent-foreground">
          <div className="flex flex-1 items-center gap-2">
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
            <div className="flex items-center gap-2">
              <span className="font-medium">{title}</span>
              {count > 0 && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {count}
                </Badge>
              )}
            </div>
          </div>
          {count > 0 && (
            <div
              className="flex h-7 w-7 items-center justify-center rounded-md opacity-70 ring-offset-background transition-opacity hover:bg-accent-foreground/10 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
            >
              <X className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3">{children}</CollapsibleContent>
    </Collapsible>
  );
}

const FilterSelect = <T extends string>({
  label,
  value = [],
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value?: T[];
  onChange: (value: T[]) => void;
  options: { label: string; value: T }[];
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const listRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const filteredOptions = search
    ? options.filter((option) =>
      option.label.toLowerCase().includes(search.toLowerCase()),
    )
    : options;

  // Calculate dropdown position
  React.useEffect(() => {
    if (!open || !dropdownRef.current || !buttonRef.current) return;

    const updatePosition = () => {
      const buttonRect = buttonRef.current?.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      if (!buttonRect) return;

      // Space below the button
      const spaceBelow = viewportHeight - buttonRect.bottom;
      // Space above the button
      const spaceAbove = buttonRect.top;
      // Minimum space needed for dropdown (adjust as needed)
      const minDropdownHeight = 200;

      // Check if there's more space below or above
      const openBelow = spaceBelow >= minDropdownHeight || spaceBelow >= spaceAbove;

      if (dropdownRef.current) {
        dropdownRef.current.style.position = 'fixed';
        dropdownRef.current.style.width = `${buttonRect.width}px`;
        dropdownRef.current.style.left = `${buttonRect.left}px`;
        dropdownRef.current.style.maxHeight = 'none'; // Reset maxHeight

        const headerHeight = 76; // Height of search + actions (adjust if needed)
        const maxContentHeight = Math.min(300, openBelow ? spaceBelow - 16 : spaceAbove - 16);

        if (openBelow) {
          dropdownRef.current.style.top = `${buttonRect.bottom + 4}px`;
          dropdownRef.current.style.bottom = 'auto';
        } else {
          dropdownRef.current.style.bottom = `${viewportHeight - buttonRect.top + 4}px`;
          dropdownRef.current.style.top = 'auto';
        }

        // Set the max height for the options container
        if (listRef.current) {
          listRef.current.style.maxHeight = `${maxContentHeight - headerHeight}px`;
        }
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  // Handle scrolling with capture phase to ensure we get the events first
  React.useEffect(() => {
    if (!open || !listRef.current) return;

    const handleWheel = (e: WheelEvent) => {
      const list = listRef.current;
      if (!list) return;

      const { deltaY } = e;
      const { scrollTop, scrollHeight, clientHeight } = list;

      // Check if scroll is at the top or bottom
      const isAtTop = scrollTop === 0 && deltaY < 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight && deltaY > 0;

      // Only prevent default if we're not at the boundaries
      if (!isAtTop && !isAtBottom) {
        e.preventDefault();
        e.stopPropagation();
        list.scrollTop += deltaY;
      }
    };

    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (listElement) {
        listElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, [open]);

  // Click outside handling
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen(!open)}
          className={`flex w-full items-center justify-between rounded-md border border-solid border-input px-3 py-2 text-sm ${value.length > 0 ? 'bg-primary/5' : 'bg-white'}`}
        >
          <span className="truncate">
            {value.length > 0 ? (
              <span className="flex items-center gap-1">
                <span className="font-medium">{value.length}</span>
                <span>selected</span>
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>

        {open && (
          <div
            ref={dropdownRef}
            className="z-50 flex flex-col rounded-md border bg-white shadow-md animate-in fade-in-80"
          >
            <div className="flex flex-col border-b">
              <div className="p-1.5">
                <Input
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-7 border-none px-2 py-0 shadow-none placeholder-shown:text-ellipsis"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex items-center justify-between border-t bg-background px-2 py-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(options.map((opt) => opt.value));
                  }}
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange([]);
                  }}
                >
                  Clear All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                  }}
                >
                  OK
                </Button>
              </div>
            </div>

            <div
              ref={listRef}
              className="scrollbar-thin overflow-y-auto overflow-x-hidden"
            >
              {filteredOptions.length === 0 ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No results found.
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className="mx-1 flex h-8 cursor-pointer items-center justify-between rounded-sm px-2 hover:bg-muted/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (value.includes(option.value)) {
                        onChange(value.filter((v) => v !== option.value));
                      } else {
                        onChange([...value, option.value]);
                      }
                    }}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <div className="flex h-4 w-4 items-center justify-center">
                        {value.includes(option.value) && (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        )}
                      </div>
                      <span className="truncate text-sm">{option.label}</span>
                    </div>
                    {value.includes(option.value) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-5 w-5 flex-shrink-0 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange(value.filter((v) => v !== option.value));
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {value.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {value.map((selectedValue) => {
            const option = options.find((opt) => opt.value === selectedValue);
            return (
              <Badge
                key={selectedValue}
                variant="default"
                className="flex items-center gap-1 bg-primary text-primary-foreground"
              >
                <span className="max-w-[200px] truncate text-xs">{option?.label}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3.5 w-3.5 flex-shrink-0 p-0 hover:bg-primary/20"
                  onClick={() =>
                    onChange(value.filter((v) => v !== selectedValue))
                  }
                >
                  <X className="h-2.5 w-2.5" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Add type guard function
function areValidStateCodes(states: string[] | undefined): states is StateCode[] {
  if (!states) return false;
  return states.every(state => {
    const stateCode = state.toUpperCase();
    return STATE_CODES.includes(stateCode as StateCode);
  });
}

// Modify the component to use forwardRef
export const PropertyFilters = React.forwardRef<
  { handleClearAllFilters: () => void },
  PropertyFiltersProps
>(({ onFiltersChange, defaultFilters, dashboardType }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tempFilters, setTempFilters] = React.useState<PropertyFilterParams>(() => {
    const baseFilters: PropertyFilterParams = {
      accountSlug: defaultFilters?.accountSlug || 'demo',
      // Basic filters
      propertyType: defaultFilters?.propertyType ?? undefined,
      propertyClass: defaultFilters?.propertyClass ?? undefined,
      minSize: defaultFilters?.minSize ?? undefined,
      maxSize: defaultFilters?.maxSize ?? undefined,
      minPrice: defaultFilters?.minPrice ?? undefined,
      maxPrice: defaultFilters?.maxPrice ?? undefined,
      minOccupancy: defaultFilters?.minOccupancy ?? undefined,
      maxOccupancy: defaultFilters?.maxOccupancy ?? undefined,
      // Location filters
      city: defaultFilters?.city ?? undefined,
      state: defaultFilters?.state ?? undefined,
      zipCode: defaultFilters?.zipCode ?? undefined,
      country: defaultFilters?.country ?? undefined,
      // Financial filters
      minRoi: defaultFilters?.minRoi ?? undefined,
      maxRoi: defaultFilters?.maxRoi ?? undefined,
      minOperatingExpenses: defaultFilters?.minOperatingExpenses ?? undefined,
      maxOperatingExpenses: defaultFilters?.maxOperatingExpenses ?? undefined,
      minPricePerSqFt: defaultFilters?.minPricePerSqFt ?? undefined,
      maxPricePerSqFt: defaultFilters?.maxPricePerSqFt ?? undefined,
      minIrr: defaultFilters?.minIrr ?? undefined,
      maxIrr: defaultFilters?.maxIrr ?? undefined,
      minDscr: defaultFilters?.minDscr ?? undefined,
      maxDscr: defaultFilters?.maxDscr ?? undefined,
      minLtv: defaultFilters?.minLtv ?? undefined,
      maxLtv: defaultFilters?.maxLtv ?? undefined,
      // Add zoning filter
      zoning: defaultFilters?.zoning ?? undefined,
      amenities: defaultFilters?.amenities ?? [],
    };
    return baseFilters;
  });

  const activeFiltersCount = Object.values(tempFilters).filter((f) => {
    if (Array.isArray(f)) {
      return f.length > 0;
    }
    return f !== null && f !== undefined && f !== '';
  }).length;

  const handleApplyFilters = () => {
    onFiltersChange?.(tempFilters);
    setIsOpen(false); // Close the panel after applying filters
  };

  const handleCancel = () => {
    setTempFilters({
      accountSlug: tempFilters.accountSlug,
    });
    setIsOpen(false);
  };

  // Calculate filter counts for each section
  const getFilterCount = (section: string): number => {
    switch (section) {
      case 'basic':
        return [
          tempFilters.propertyType?.length ? 1 : 0,
          tempFilters.propertyClass?.length ? 1 : 0,
          tempFilters.minSize || tempFilters.maxSize ? 1 : 0,
          tempFilters.zoning?.length ? 1 : 0,
        ].reduce((sum, count) => sum + count, 0);
      case 'location':
        return [
          tempFilters.city ? 1 : 0,
          tempFilters.state?.length ? 1 : 0,
          tempFilters.zipCode ? 1 : 0,
          tempFilters.country?.length ? 1 : 0,
        ].reduce((sum, count) => sum + count, 0);
      case 'financial':
        return [
          tempFilters.minRoi || tempFilters.maxRoi ? 1 : 0,
          tempFilters.minOperatingExpenses || tempFilters.maxOperatingExpenses ? 1 : 0,
          tempFilters.minPricePerSqFt || tempFilters.maxPricePerSqFt ? 1 : 0,
          tempFilters.minIrr || tempFilters.maxIrr ? 1 : 0,
          tempFilters.minDscr || tempFilters.maxDscr ? 1 : 0,
          tempFilters.minLtv || tempFilters.maxLtv ? 1 : 0,
        ].reduce((sum, count) => sum + count, 0);
      case 'features':
        return tempFilters.amenities?.length ?? 0;
      default:
        return 0;
    }
  };

  // Update the clearSectionFilters function
  const clearSectionFilters = (section: string) => {
    switch (section) {
      case 'location':
        setTempFilters(prev => ({
          ...prev,
          city: undefined,
          state: undefined,
          zipCode: undefined,
          country: undefined,
        }));
        break;
      case 'basic':
        setTempFilters(prev => ({
          ...prev,
          propertyType: undefined,
          propertyClass: undefined,
          minSize: undefined,
          maxSize: undefined,
          zoning: undefined,
        }));
        break;
      case 'financial':
        setTempFilters(prev => ({
          ...prev,
          minRoi: undefined,
          maxRoi: undefined,
          minOperatingExpenses: undefined,
          maxOperatingExpenses: undefined,
          minPricePerSqFt: undefined,
          maxPricePerSqFt: undefined,
          minIrr: undefined,
          maxIrr: undefined,
          minDscr: undefined,
          maxDscr: undefined,
          minLtv: undefined,
          maxLtv: undefined,
        }));
        break;
      case 'features':
        setTempFilters(prev => ({
          ...prev,
          amenities: [],
        }));
        break;
      default:
        break;
    }
  };

  // Add handleClearAllFilters function
  const handleClearAllFilters = () => {
    // Reset temp filters
    setTempFilters({
      accountSlug: tempFilters.accountSlug,
    });

    // Notify parent component
    onFiltersChange?.({
      accountSlug: tempFilters.accountSlug,
    });
  };

  // Add useImperativeHandle to expose the handleClearAllFilters method
  useImperativeHandle(ref, () => ({
    handleClearAllFilters: () => {
      handleClearAllFilters();
    },
  }));

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 rounded-sm px-1 font-normal"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[500px] sm:max-w-[500px] bg-white p-4">
        <div className="flex h-[calc(100vh-100px)] flex-col">
          {/* Fixed Header */}
          <SheetHeader className="pb-4">
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Filter properties by criteria</SheetDescription>
          </SheetHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pb-16">
            <div className="space-y-4">
              <FilterSection
                title="Basic"
                count={getFilterCount('basic')}
                onClear={() => clearSectionFilters('basic')}
              >
                <div className="grid grid-cols-2 gap-3 rounded-lg p-3">
                  <FilterSelect<PropertyType>
                    label="Property Type"
                    value={tempFilters.propertyType}
                    onChange={(value) =>
                      setTempFilters((prev) => ({
                        ...prev,
                        propertyType: value,
                      }))
                    }
                    options={PROPERTY_TYPES.map((type) => ({
                      label: type,
                      value: type,
                    }))}
                    placeholder="Select property types"
                  />

                  <FilterSelect<PropertyClass>
                    label="Property Class"
                    value={tempFilters.propertyClass}
                    onChange={(value) =>
                      setTempFilters((prev) => ({
                        ...prev,
                        propertyClass: value,
                      }))
                    }
                    options={PROPERTY_CLASSES.map((classType) => ({
                      label: classType,
                      value: classType,
                    }))}
                    placeholder="Select property classes"
                  />

                  <FilterSelect<ZoningType>
                    label="Zoning"
                    value={tempFilters.zoning}
                    onChange={(value) =>
                      setTempFilters((prev) => ({
                        ...prev,
                        zoning: value,
                      }))
                    }
                    options={ZONING_TYPES.map((type) => ({
                      label: type,
                      value: type,
                    }))}
                    placeholder="Select zoning types"
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Size Range (sq ft)</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        className="w-full"
                        value={tempFilters.minSize ?? ''}
                        onChange={(e) =>
                          setTempFilters((prev) => ({
                            ...prev,
                            minSize: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          }))
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        className="w-full"
                        value={tempFilters.maxSize ?? ''}
                        onChange={(e) =>
                          setTempFilters((prev) => ({
                            ...prev,
                            maxSize: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </FilterSection>

              <FilterSection
                title="Location"
                count={getFilterCount('location')}
                onClear={() => clearSectionFilters('location')}
              >
                <div className="rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        placeholder="Enter city"
                        value={tempFilters.city ?? ''}
                        onChange={(e) =>
                          setTempFilters((prev) => ({
                            ...prev,
                            city: e.target.value || undefined,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>ZIP Code</Label>
                      <Input
                        placeholder="Enter ZIP code"
                        value={tempFilters.zipCode ?? ''}
                        onChange={(e) =>
                          setTempFilters((prev) => ({
                            ...prev,
                            zipCode: e.target.value || undefined,
                          }))
                        }
                      />
                    </div>

                    <FilterSelect<StateCode>
                      label="State"
                      value={tempFilters.state}
                      onChange={(value) =>
                        setTempFilters((prev) => ({
                          ...prev,
                          state: value,
                        }))
                      }
                      options={STATE_CODES.map((state) => ({
                        label: state,
                        value: state,
                      }))}
                      placeholder="Select states"
                    />

                    <FilterSelect<CountryCode>
                      label="Country"
                      value={tempFilters.country}
                      onChange={(value) =>
                        setTempFilters((prev) => ({
                          ...prev,
                          country: value,
                        }))
                      }
                      options={COUNTRIES}
                      placeholder="Select countries"
                    />
                  </div>
                </div>
              </FilterSection>

              <FilterSection
                title="Financials"
                count={getFilterCount('financial')}
                onClear={() => clearSectionFilters('financial')}
              >
                <div className="grid grid-cols-2 gap-3 rounded-lg p-3">
                  {FINANCIAL_METRICS.map((metric) => (
                    <div key={metric.min} className="space-y-2">
                      <label className="text-sm font-medium">{metric.label}</label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={tempFilters[metric.min] ?? ''}
                          onChange={(e) =>
                            setTempFilters((prev) => ({
                              ...prev,
                              [metric.min]: e.target.value ? parseFloat(e.target.value) : undefined,
                            }))
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={tempFilters[metric.max] ?? ''}
                          onChange={(e) =>
                            setTempFilters((prev) => ({
                              ...prev,
                              [metric.max]: e.target.value ? parseFloat(e.target.value) : undefined,
                            }))
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </FilterSection>

              <FilterSection
                title="Features"
                count={getFilterCount('features')}
                onClear={() => clearSectionFilters('features')}
              >
                <div className="space-y-3 rounded-lg p-3">
                  <label className="text-sm font-medium">Amenities</label>
                  <div className="grid grid-cols-2 gap-3">
                    {AMENITIES.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={amenity}
                          checked={
                            tempFilters.amenities?.includes(amenity) ?? false
                          }
                          onCheckedChange={(checked) => {
                            setTempFilters((prev: PropertyFilterParams) => {
                              const currentAmenities = prev.amenities ?? [];
                              return {
                                ...prev,
                                amenities: checked
                                  ? [...currentAmenities, amenity]
                                  : currentAmenities.filter(
                                    (a) => a !== amenity,
                                  ),
                              };
                            });
                          }}
                        />
                        <label
                          htmlFor={amenity}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </FilterSection>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Toolbar */}
        <SheetFooter className="border border-border bg-background/50 shadow-md p-3 rounded-lg">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAllFilters}
                className="h-8"
              >
                Clear all
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApplyFilters}
                className="h-8"
              >
                Apply
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}); 