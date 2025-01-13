import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

interface FilterDialogProps {
  isOpen: boolean
  onClose: () => void
  filters: {
    propertyType: string[]
    location: string[]
    minValue: number
    maxValue: number
  }
  onApplyFilters: (filters: FilterDialogProps["filters"]) => void
}

export function FilterDialog({ isOpen, onClose, filters, onApplyFilters }: FilterDialogProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleCheckboxChange = (category: "propertyType" | "location", value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLocalFilters(prev => ({ ...prev, [name]: parseInt(value) }))
  }

  const handleApply = () => {
    onApplyFilters(localFilters)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Properties</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="propertyType">Property Type</Label>
            <div className="flex flex-wrap gap-2">
              {["Residential", "Commercial", "Industrial"].map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={localFilters.propertyType.includes(type)}
                    onCheckedChange={() => handleCheckboxChange("propertyType", type)}
                  />
                  <label htmlFor={type}>{type}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <div className="flex flex-wrap gap-2">
              {["Urban", "Suburban", "Rural"].map(loc => (
                <div key={loc} className="flex items-center space-x-2">
                  <Checkbox
                    id={loc}
                    checked={localFilters.location.includes(loc)}
                    onCheckedChange={() => handleCheckboxChange("location", loc)}
                  />
                  <label htmlFor={loc}>{loc}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="minValue">Minimum Value</Label>
            <Input
              id="minValue"
              name="minValue"
              type="number"
              value={localFilters.minValue}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="maxValue">Maximum Value</Label>
            <Input
              id="maxValue"
              name="maxValue"
              type="number"
              value={localFilters.maxValue}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

