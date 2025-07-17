'use client';

import { forwardRef, useImperativeHandle, useState } from 'react';

import { Filter, Save, Trash2 } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@kit/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@kit/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@kit/ui/tooltip';

import type { PropertyFilterParams, SavedFilter } from './types';

export interface PropertyFiltersRef {
  handleClearAllFilters: () => void;
}

interface PropertyFiltersProps {
  onFiltersChange: (filters: PropertyFilterParams) => void;
  defaultFilters?: PropertyFilterParams;
  savedFilters?: SavedFilter[];
  onSaveFilter?: (filter: SavedFilter) => Promise<void>;
  onLoadFilter?: (id: string) => Promise<SavedFilter>;
  onDeleteFilter?: (id: string) => Promise<void>;
}

export const PropertyFilters = forwardRef<PropertyFiltersRef, PropertyFiltersProps>(
  ({ onFiltersChange, defaultFilters = {}, savedFilters = [], onSaveFilter, onLoadFilter, onDeleteFilter }, ref) => {
    const [filters, setFilters] = useState<PropertyFilterParams>(defaultFilters);
    const [isOpen, setIsOpen] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveName, setSaveName] = useState('');

    useImperativeHandle(ref, () => ({
      handleClearAllFilters: () => {
        const clearedFilters: PropertyFilterParams = {};
        setFilters(clearedFilters);
        onFiltersChange(clearedFilters);
      },
    }));

    const updateFilters = (newFilters: PropertyFilterParams) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      onFiltersChange(updatedFilters);
    };

    const handleSaveFilter = async () => {
      if (!onSaveFilter || !saveName.trim()) return;

      try {
        const newFilter: SavedFilter = {
          id: `filter-${Date.now()}`,
          name: saveName,
          filters,
          createdAt: new Date().toISOString(),
        };

        await onSaveFilter(newFilter);
        setShowSaveDialog(false);
        setSaveName('');
      } catch (error) {
        console.error('Error saving filter:', error);
      }
    };

    const handleLoadFilter = async (id: string) => {
      if (!onLoadFilter) return;

      try {
        const filter = await onLoadFilter(id);
        setFilters(filter.filters);
        onFiltersChange(filter.filters);
      } catch (error) {
        console.error('Error loading filter:', error);
      }
    };

    const handleDeleteFilter = async (id: string) => {
      if (!onDeleteFilter) return;

      try {
        await onDeleteFilter(id);
      } catch (error) {
        console.error('Error deleting filter:', error);
      }
    };

    const activeFiltersCount = Object.values(filters).filter(Boolean).length;

    return (
      <>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Property Filters</h4>
                <div className="flex gap-2">
                  {onSaveFilter && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSaveDialog(true)}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const clearedFilters: PropertyFilterParams = {};
                      setFilters(clearedFilters);
                      onFiltersChange(clearedFilters);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Property Type</Label>
                    <Select
                      value={filters.propertyType || ''}
                      onValueChange={(value) =>
                        updateFilters({ propertyType: value || undefined })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All types</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="multifamily">Multifamily</SelectItem>
                        <SelectItem value="hotel">Hotel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={filters.status || ''}
                      onValueChange={(value) =>
                        updateFilters({ status: value || undefined })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="off-market">Off Market</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min Price</Label>
                    <Input
                      type="number"
                      placeholder="Min price"
                      value={filters.minPrice || ''}
                      onChange={(e) =>
                        updateFilters({ minPrice: e.target.value || undefined })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Price</Label>
                    <Input
                      type="number"
                      placeholder="Max price"
                      value={filters.maxPrice || ''}
                      onChange={(e) =>
                        updateFilters({ maxPrice: e.target.value || undefined })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min Square Feet</Label>
                    <Input
                      type="number"
                      placeholder="Min sq ft"
                      value={filters.minSquareFeet || ''}
                      onChange={(e) =>
                        updateFilters({ minSquareFeet: e.target.value || undefined })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Max Square Feet</Label>
                    <Input
                      type="number"
                      placeholder="Max sq ft"
                      value={filters.maxSquareFeet || ''}
                      onChange={(e) =>
                        updateFilters({ maxSquareFeet: e.target.value || undefined })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="City, State, or ZIP"
                    value={filters.location || ''}
                    onChange={(e) =>
                      updateFilters({ location: e.target.value || undefined })
                    }
                  />
                </div>
              </div>

              {savedFilters.length > 0 && (
                <div className="space-y-2">
                  <Label>Saved Filters</Label>
                  <div className="space-y-1">
                    {savedFilters.map((filter) => (
                      <div
                        key={filter.id}
                        className="flex items-center justify-between rounded-md border p-2"
                      >
                        <span className="text-sm">{filter.name}</span>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLoadFilter(filter.id)}
                          >
                            Load
                          </Button>
                          {onDeleteFilter && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteFilter(filter.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete filter</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {showSaveDialog && (
          <Card className="fixed inset-4 z-50 mx-auto max-w-md">
            <CardHeader>
              <CardTitle>Save Filter</CardTitle>
              <CardDescription>
                Save your current filter settings for future use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Filter Name</Label>
                <Input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Enter filter name"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveFilter}>Save Filter</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </>
    );
  },
);

PropertyFilters.displayName = 'PropertyFilters'; 