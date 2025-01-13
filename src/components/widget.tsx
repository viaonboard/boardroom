import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, LineChart, PieChart, DollarSign, TrendingUp, TrendingDown, Percent, AreaChart, X, Maximize, Minimize, Settings } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"

interface WidgetProps {
  id: string
  title: string
  type: "bar" | "line" | "pie" | "metric" | "table" | "area" | "donut"
  data: any
  options?: {
    colors?: string[]
    showLegend?: boolean
    showGrid?: boolean
    stacked?: boolean
    curved?: boolean
    fillOpacity?: number
  }
  size: "1/3" | "2/3" | "full"
  onCustomize: (id: string, updates: Partial<WidgetProps>) => void
  onRemove: (id: string) => void
  onResize: (id: string, newSize: "1/3" | "2/3" | "full") => void
  isCustomizing: boolean
}

export function Widget({ id, title, type, data, options, size, onCustomize, onRemove, onResize, isCustomizing }: WidgetProps) {
  const [localOptions, setLocalOptions] = useState(options || {})
  const [isEditing, setIsEditing] = useState(false)

  const updateOptions = (newOptions: Partial<typeof localOptions>) => {
    const updatedOptions = { ...localOptions, ...newOptions }
    setLocalOptions(updatedOptions)
  }

  const saveChanges = () => {
    onCustomize(id, { options: localOptions, type })
    setIsEditing(false)
  }

  const renderChart = () => {
    const getColor = (index: number) => {
      return localOptions.colors?.[index] || `hsl(${index * 60}, 70%, 50%)`
    }

    switch (type) {
      case "bar":
        return (
          <div className="h-full w-full bg-muted flex items-end justify-around p-2">
            {Object.entries(data).map(([key, value]: [string, number], index) => (
              <div key={key}
                className="w-8 cursor-pointer transition-all hover:opacity-80"
                style={{
                  height: `${(value / Math.max(...Object.values(data))) * 100}%`,
                  backgroundColor: getColor(index),
                }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div/>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{key}</p>
                      <p>{value.toLocaleString()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
        )
      case "line":
      case "area":
        return (
          <div className="h-full w-full bg-muted flex items-center justify-center p-2">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              {Object.entries(data).map(([key, value]: [string, number], index, array) => {
                const x = (index / (array.length - 1)) * 100
                const y = 100 - (value / Math.max(...Object.values(data))) * 100
                return (
                  <g key={key}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <circle cx={x} cy={y} r="3" fill={getColor(0)} className="cursor-pointer hover:r-4 transition-all" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">{key}</p>
                        <p>{value.toLocaleString()}</p>
                      </TooltipContent>
                    </Tooltip>
                    {index < array.length - 1 && (
                      <>
                        <line
                          x1={x}
                          y1={y}
                          x2={(index + 1) / (array.length - 1) * 100}
                          y2={100 - (array[index + 1][1] / Math.max(...Object.values(data))) * 100}
                          stroke={getColor(0)}
                          strokeWidth="2"
                          strokeLinecap="round"
                          style={{ vectorEffect: 'non-scaling-stroke' }}
                        />
                        {type === "area" && (
                          <path
                            d={`
                              M ${x} ${y}
                              L ${(index + 1) / (array.length - 1) * 100} ${100 - (array[index + 1][1] / Math.max(...Object.values(data))) * 100}
                              V 100
                              H ${x}
                              Z
                            `}
                            fill={getColor(0)}
                            fillOpacity={localOptions.fillOpacity || 0.2}
                          />
                        )}
                      </>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>
        )
      case "pie":
      case "donut":
        return (
          <div className="h-full w-full bg-muted flex items-center justify-center p-2">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {Object.entries(data).reduce((acc: JSX.Element[], [key, value]: [string, number], index, array) => {
                const total = array.reduce((sum, [, val]) => sum + val, 0)
                const startAngle = acc.length ? acc[acc.length - 1].props.endAngle : 0
                const endAngle = startAngle + (value / total) * 360
                const innerRadius = type === "donut" ? 30 : 0

                acc.push(
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <path
                        d={`
                          M ${50 + innerRadius * Math.cos(startAngle * Math.PI / 180)} ${50 + innerRadius * Math.sin(startAngle * Math.PI / 180)}
                          L ${50 + 45 * Math.cos(startAngle * Math.PI / 180)} ${50 + 45 * Math.sin(startAngle * Math.PI / 180)}
                          A 45 45 0 ${endAngle - startAngle > 180 ? 1 : 0} 1 ${50 + 45 * Math.cos(endAngle * Math.PI / 180)} ${50 + 45 * Math.sin(endAngle * Math.PI / 180)}
                          L ${50 + innerRadius * Math.cos(endAngle * Math.PI / 180)} ${50 + innerRadius * Math.sin(endAngle * Math.PI / 180)}
                          A ${innerRadius} ${innerRadius} 0 ${endAngle - startAngle > 180 ? 1 : 0} 0 ${50 + innerRadius * Math.cos(startAngle * Math.PI / 180)} ${50 + innerRadius * Math.sin(startAngle * Math.PI / 180)}
                        `}
                        fill={getColor(index)}
                        className="cursor-pointer hover:opacity-80 transition-all"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{key}</p>
                      <p>{value.toLocaleString()} ({((value / total) * 100).toFixed(1)}%)</p>
                    </TooltipContent>
                  </Tooltip>
                )
                return acc
              }, [])}
            </svg>
          </div>
        )
      case "table":
        return (
          <div className="h-full w-full bg-muted p-2">
            <div className="h-full overflow-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="p-2 text-left">Property</th>
                    <th className="p-2 text-left">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data).map(([key, value]) => (
                    <tr key={key}>
                      <td className="p-2">{key}</td>
                      <td className="p-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help border-b border-dotted border-gray-400">
                              {value}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{key}: {value}</p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const renderMetric = () => {
    const value = typeof data === 'object' ? data.value : data
    const change = typeof data === 'object' ? data.change : 0
    const isPositive = change >= 0

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-4xl font-bold mb-2">{value}</div>
            <p className="text-sm text-muted-foreground flex items-center">
              {isPositive ? (
                <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-4 w-4 text-red-500" />
              )}
              {change}% from last month
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Current value: {value}</p>
          <p>Change: {change}%</p>
          <p>Trend: {isPositive ? "Increasing" : "Decreasing"}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  const getIcon = () => {
    switch (type) {
      case "bar":
        return <BarChart className="h-4 w-4 text-muted-foreground" />
      case "line":
        return <LineChart className="h-4 w-4 text-muted-foreground" />
      case "pie":
      case "donut":
        return <PieChart className="h-4 w-4 text-muted-foreground" />
      case "metric":
        return <DollarSign className="h-4 w-4 text-muted-foreground" />
      case "table":
        return <Percent className="h-4 w-4 text-muted-foreground" />
      case "area":
        return <AreaChart className="h-4 w-4 text-muted-foreground" />
      default:
        return null
    }
  }

  const renderResizeIcons = () => {
    return (
      <div className="flex space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onResize(id, "1/3")}
              disabled={size === "1/3"}
            >
              <Minimize className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>1/3 Width</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onResize(id, "2/3")}
              disabled={size === "2/3"}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>2/3 Width</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onResize(id, "full")}
              disabled={size === "full"}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Full Width</TooltipContent>
        </Tooltip>
      </div>
    )
  }

  const renderEditForm = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${id}-type`}>Chart Type</Label>
          <Select
            value={type}
            onValueChange={(value: any) => onCustomize(id, { type: value })}
          >
            <SelectTrigger id={`${id}-type`}>
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="area">Area Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="donut">Donut Chart</SelectItem>
              <SelectItem value="metric">Metric</SelectItem>
              <SelectItem value="table">Table</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(type === "bar" || type === "line" || type === "area") && (
          <>
            <div className="flex items-center space-x-2">
              <Switch
                id={`${id}-show-grid`}
                checked={localOptions.showGrid}
                onCheckedChange={(checked) => updateOptions({ showGrid: checked })}
              />
              <Label htmlFor={`${id}-show-grid`}>Show Grid</Label>
            </div>
            {type === "bar" && (
              <div className="flex items-center space-x-2">
                <Switch
                  id={`${id}-stacked`}
                  checked={localOptions.stacked}
                  onCheckedChange={(checked) => updateOptions({ stacked: checked })}
                />
                <Label htmlFor={`${id}-stacked`}>Stacked</Label>
              </div>
            )}
            {(type === "line" || type === "area") && (
              <div className="flex items-center space-x-2">
                <Switch
                  id={`${id}-curved`}
                  checked={localOptions.curved}
                  onCheckedChange={(checked) => updateOptions({ curved: checked })}
                />
                <Label htmlFor={`${id}-curved`}>Curved</Label>
              </div>
            )}
          </>
        )}
        {type === "area" && (
          <div className="space-y-2">
            <Label htmlFor={`${id}-fill-opacity`}>Fill Opacity</Label>
            <Slider
              id={`${id}-fill-opacity`}
              min={0}
              max={1}
              step={0.1}
              value={[localOptions.fillOpacity || 0.2]}
              onValueChange={([value]) => updateOptions({ fillOpacity: value })}
            />
          </div>
        )}
        <div className="space-y-2">
          <Label>Colors</Label>
          <div className="flex flex-wrap gap-2">
            {(localOptions.colors || []).map((color, index) => (
              <Popover key={index}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-8 h-8 p-0"
                    style={{ backgroundColor: color }}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-2">
                    <Label htmlFor={`${id}-color-${index}`}>Color {index + 1}</Label>
                    <Input
                      id={`${id}-color-${index}`}
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...(localOptions.colors || [])]
                        newColors[index] = e.target.value
                        updateOptions({ colors: newColors })
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            ))}
            <Button
              variant="outline"
              className="w-8 h-8 p-0"
              onClick={() => updateOptions({ colors: [...(localOptions.colors || []), '#000000'] })}
            >
              +
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id={`${id}-show-legend`}
            checked={localOptions.showLegend}
            onCheckedChange={(checked) => updateOptions({ showLegend: checked })}
          />
          <Label htmlFor={`${id}-show-legend`}>Show Legend</Label>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4"
          onClick={saveChanges}
        >
          Done
        </Button>
      </div>
    )
  }

  return (
    <TooltipProvider>
    <Card className={`h-[400px] flex flex-col rounded-lg ${
      size === "1/3" ? "col-span-1" : 
      size === "2/3" ? "col-span-2" : 
      "col-span-3"
    } ${isCustomizing ? 'shadow-sm hover:shadow-md transition-shadow duration-200' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center space-x-2">
          {getIcon()}
          {isCustomizing && renderResizeIcons()}
          {isCustomizing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
              className="h-6 w-6 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
          {isCustomizing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(id)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-3">
        <div className="h-full overflow-y-auto p-2 space-y-4">
          {isEditing ? renderEditForm() : (type === "metric" ? renderMetric() : renderChart())}
        </div>
      </CardContent>
    </Card>
    </TooltipProvider>
  )
}

