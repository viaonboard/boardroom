'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@kit/ui/alert-dialog';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Checkbox } from '@kit/ui/checkbox';
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
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@kit/ui/sheet';
import { Filter, ListCheck, Save, X } from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '../lib/utils';
import type { FilterConfig, FilterValues, SavedFilter } from '../types';

interface ConfigurableFiltersProps {
  filterConfigs: FilterConfig[];
  currentFilters: FilterValues;
  savedFilters: SavedFilter[];
  onFiltersChange: (filters: FilterValues) => void;
  onSaveFilter?: (name: string, filters: FilterValues, type: string) => Promise<SavedFilter>;
  onLoadSavedFilter?: (filter: SavedFilter) => void;
  onDeleteFilter?: (id: string) => Promise<void>;
  className?: string;
}

export const ConfigurableFilters: React.FC<ConfigurableFiltersProps> = ({
  filterConfigs,
  currentFilters,
  savedFilters,
  onFiltersChange,
  onSaveFilter,
  onLoadSavedFilter,
  onDeleteFilter,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterValues>(currentFilters);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [selectedFilterId, setSelectedFilterId] = useState<string>('');
  const [deleteFilterId, setDeleteFilterId] = useState<string | null>(null);

  const activeFiltersCount = Object.values(currentFilters).filter((f) => {
    if (Array.isArray(f)) {
      return f.length > 0;
    }
    return f !== null && f !== undefined && f !== '';
  }).length;

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempFilters(currentFilters);
    setIsOpen(false);
  };

  const handleClearAll = () => {
    setTempFilters({});
    onFiltersChange({});
  };

  const handleSaveFilter = async () => {
    if (!onSaveFilter || !filterName.trim()) return;
    
    try {
      await onSaveFilter(filterName, tempFilters, 'custom');
      setIsSaveModalOpen(false);
      setFilterName('');
    } catch (error) {
      console.error('Failed to save filter:', error);
    }
  };

  const handleLoadFilter = (filter: SavedFilter) => {
    setTempFilters(filter.filters);
    setSelectedFilterId(filter.id);
    if (onLoadSavedFilter) {
      onLoadSavedFilter(filter);
    }
  };

  const handleDeleteFilter = async (id: string) => {
    if (!onDeleteFilter) return;
    
    try {
      await onDeleteFilter(id);
      if (selectedFilterId === id) {
        setSelectedFilterId('');
      }
      setDeleteFilterId(null);
    } catch (error) {
      console.error('Failed to delete filter:', error);
    }
  };

  const renderFilterField = (field: any, config: FilterConfig) => {
    const value = tempFilters[field.id];
    
    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label>{field.label}</Label>
            <Input
              value={value || ''}
              onChange={(e) => setTempFilters(prev => ({ ...prev, [field.id]: e.target.value }))}
              placeholder={field.placeholder}
            />
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label>{field.label}</Label>
            <Input
              type="number"
              value={value || ''}
              onChange={(e) => setTempFilters(prev => ({ ...prev, [field.id]: e.target.value }))}
              placeholder={field.placeholder}
              min={field.validation?.min}
              max={field.validation?.max}
            />
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label>{field.label}</Label>
            <Select
              value={value || ''}
              onValueChange={(val) => setTempFilters(prev => ({ ...prev, [field.id]: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'multiselect':
        return (
          <div key={field.id} className="space-y-2">
            <Label>{field.label}</Label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option.value}`}
                    checked={Array.isArray(value) ? value.includes(option.value) : false}
                    onCheckedChange={(checked) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      const newValues = checked
                        ? [...currentValues, option.value]
                        : currentValues.filter(v => v !== option.value);
                      setTempFilters(prev => ({ ...prev, [field.id]: newValues }));
                    }}
                  />
                  <Label htmlFor={`${field.id}-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={!!value}
              onCheckedChange={(checked) => setTempFilters(prev => ({ ...prev, [field.id]: checked }))}
            />
            <Label htmlFor={field.id} className="text-sm">
              {field.label}
            </Label>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className={cn("h-8 border-dashed", className)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[500px] sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Filter data by criteria</SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-4">
              {filterConfigs.map((config) => (
                <div key={config.id} className="space-y-3">
                  <h3 className="font-medium">{config.name}</h3>
                  <div className="space-y-3">
                    {config.fields.map((field) => renderFilterField(field, config))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SheetFooter className="border-t pt-4">
            <div className="flex w-full items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {onSaveFilter && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 gap-1">
                        <ListCheck className="h-3.5 w-3.5" />
                        <span>Saved Filters</span>
                        {selectedFilterId && (
                          <Badge variant="secondary" className="ml-1 rounded-sm px-1 font-normal">
                            1
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-2" align="start">
                      {savedFilters.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          <Select
                            value={selectedFilterId}
                            onValueChange={(value) => {
                              const filter = savedFilters.find(f => f.id === value);
                              if (filter) {
                                handleLoadFilter(filter);
                              }
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Select a filter..." />
                            </SelectTrigger>
                            <SelectContent>
                              {savedFilters.map((filter) => (
                                <div key={filter.id} className="flex items-center justify-between px-2 py-1.5">
                                  <SelectItem value={filter.id} className="flex-1">
                                    {filter.name}
                                  </SelectItem>
                                  {onDeleteFilter && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteFilterId(filter.id);
                                      }}
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </SelectContent>
                          </Select>

                          <div className="flex items-center gap-2">
                            {selectedFilterId ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 flex-1"
                                  onClick={() => setIsSaveModalOpen(true)}
                                >
                                  <Save className="mr-2 h-3.5 w-3.5" />
                                  Update
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 flex-1"
                                  onClick={() => {
                                    setSelectedFilterId('');
                                    setIsSaveModalOpen(true);
                                  }}
                                >
                                  <Save className="mr-2 h-3.5 w-3.5" />
                                  Save As...
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-full"
                                onClick={() => setIsSaveModalOpen(true)}
                              >
                                <Save className="mr-2 h-3.5 w-3.5" />
                                Save Current...
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="px-1 py-2 text-sm text-muted-foreground">
                            No saved filters yet
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => setIsSaveModalOpen(true)}
                          >
                            <Save className="mr-2 h-3.5 w-3.5" />
                            Save Current...
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleClearAll} className="h-8">
                  Clear all
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8">
                  Cancel
                </Button>
                <Button size="sm" onClick={handleApplyFilters} className="h-8">
                  Apply
                </Button>
              </div>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Save Filter Modal */}
      <AlertDialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Filter</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a name for this filter set
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Filter name"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsSaveModalOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveFilter}>
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Filter Confirmation */}
      <AlertDialog open={!!deleteFilterId} onOpenChange={(open) => !open && setDeleteFilterId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Saved Filter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this saved filter? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteFilterId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteFilterId && handleDeleteFilter(deleteFilterId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}; 