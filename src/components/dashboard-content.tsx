"use client"

import { useState, useEffect, useRef } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd"
import { Widget } from "@/components/widget"
import { WidgetSideboard } from "@/components/widget-sideboard"
import { Button } from "@/components/ui/button"
import { Filter, LayoutGrid, LayoutTemplate } from 'lucide-react'
import { DateRangePicker } from "@/components/date-range-picker"
import { FilterDialog } from "@/components/filter-dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { TooltipProvider } from "@/components/ui/tooltip"

const initialWidgets = [
  { 
    id: "noi-1", 
    title: "Net Operating Income", 
    type: "bar", 
    data: { Q1: 100000, Q2: 120000, Q3: 110000, Q4: 130000 },
    options: { colors: ['#4CAF50', '#2196F3', '#FFC107', '#F44336'], showLegend: true, showGrid: true },
    size: "1/3" as const,
  },
  { 
    id: "cash-flow-1", 
    title: "Cash Flow", 
    type: "line", 
    data: { Jan: 50000, Feb: 55000, Mar: 60000, Apr: 58000, May: 62000 },
    options: { colors: ['#2196F3'], showLegend: false, showGrid: true, curved: true },
    size: "1/3" as const,
  },
  { 
    id: "cap-rate-1", 
    title: "Cap Rate", 
    type: "metric", 
    data: { value: "5.8%", change: 0.3 },
    size: "1/3" as const,
  },
  { 
    id: "irr-1", 
    title: "Internal Rate of Return", 
    type: "metric", 
    data: { value: "12.5%", change: -0.5 },
    size: "1/3" as const,
  },
]

export function DashboardContent() {
  const [widgets, setWidgets] = useState(initialWidgets)
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [dateRange, setDateRange] = useState({ from: new Date(2023, 0, 1), to: new Date() })
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    propertyType: [],
    location: [],
    minValue: 0,
    maxValue: 1000000000,
  })
  const [isBentoLayout, setIsBentoLayout] = useState(false)
  const [draggedItemSize, setDraggedItemSize] = useState<"1/3" | "2/3" | "full" | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [placeholderProps, setPlaceholderProps] = useState<{
    clientY: number;
    clientX: number;
    clientHeight: number;
    clientWidth: number;
  } | null>(null);

  const generateUniqueId = (baseId: string) => {
    const existingIds = widgets.map(w => w.id);
    let newId = baseId;
    let counter = 1;
    while (existingIds.includes(newId)) {
      counter++;
      newId = `${baseId}-${counter}`;
    }
    return newId;
  }

  const onDragEnd = (result: DropResult) => {
    setDraggedItemSize(null);
    setPlaceholderProps(null);
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newWidgets = Array.from(widgets);
    const [reorderedItem] = newWidgets.splice(source.index, 1);
    newWidgets.splice(destination.index, 0, reorderedItem);

    setWidgets(newWidgets);
  };

  const onDragStart = (start: any) => {
    document.body.style.cursor = 'grabbing';
    const draggedWidget = widgets.find(w => w.id === start.draggableId);
    setDraggedItemSize(draggedWidget?.size || null);
    
    if (start.source.index !== null) {
      const draggedDOM = getDraggedDom(start.draggableId);
      if (draggedDOM) {
        const { clientHeight, clientWidth } = draggedDOM;
        const sourceIndex = start.source.index;
        const clientY = parseFloat(draggedDOM.style.top);
        const clientX = parseFloat(draggedDOM.style.left);
        setPlaceholderProps({
          clientHeight,
          clientWidth,
          clientY,
          clientX,
        });
      }
    }
  };

  const getDraggedDom = (draggableId: string) => {
    const domQuery = `[data-rbd-draggable-id='${draggableId}']`;
    const draggedDOM = document.querySelector(domQuery);
    return draggedDOM as HTMLElement;
  };

  const onDragUpdate = (update: any) => {
    if (!gridRef.current || !update.destination) {
      setPlaceholderProps(null);
      return;
    }

    const gridRect = gridRef.current.getBoundingClientRect();
    const columns = isBentoLayout ? 3 : Math.floor(gridRect.width / (gridRect.width / 3));
    const cellWidth = gridRect.width / columns;
    const cellHeight = 400; // Assuming fixed height for simplicity
    const gap = 24; // Assuming a gap of 24px between items

    const destinationIndex = update.destination.index;
    const rowIndex = Math.floor(destinationIndex / columns);
    const colIndex = destinationIndex % columns;

    let width = cellWidth - gap;
    if (draggedItemSize === "2/3") width = (cellWidth * 2) - gap;
    if (draggedItemSize === "full") width = (cellWidth * 3) - gap;

    // Adjust for last position in a row
    const isLastInRow = (colIndex + (draggedItemSize === "2/3" ? 2 : draggedItemSize === "full" ? 3 : 1)) > columns;
    if (isLastInRow) {
      const remainingWidth = gridRect.width - (colIndex * cellWidth);
      width = Math.min(width, remainingWidth - gap);
    }

    const totalHeight = cellHeight - gap;
    const top = gridRect.top + rowIndex * cellHeight + gap / 2;
    const left = gridRect.left + colIndex * cellWidth + gap / 2;

    // Ensure all values are numbers before setting placeholderProps
    if (
      !isNaN(top) && 
      !isNaN(left) && 
      !isNaN(totalHeight) && 
      !isNaN(width)
    ) {
      setPlaceholderProps({
        clientHeight: totalHeight,
        clientWidth: width,
        clientY: top,
        clientX: left,
      });
    } else {
      setPlaceholderProps(null);
    }
  };

  const handleCustomize = (id: string, updates: Partial<typeof initialWidgets[0]>) => {
    setWidgets(widgets.map(widget => 
      widget.id === id ? { ...widget, ...updates } : widget
    ))
  }

  const handleResize = (id: string, newSize: "1/3" | "2/3" | "full") => {
    setWidgets(widgets.map(widget =>
      widget.id === id ? { ...widget, size: newSize } : widget
    ))
  }

  const addWidget = (newWidget: { id: string, title: string, type: string }) => {
    const uniqueId = generateUniqueId(newWidget.id);
    const widgetData = {
      ...newWidget,
      id: uniqueId,
      data: generateMockData(newWidget.type),
      options: generateDefaultOptions(newWidget.type),
      size: "1/3" as const,
    }
    setWidgets([...widgets, widgetData])
  }

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(widget => widget.id !== id))
  }

  const generateMockData = (type: string) => {
    switch (type) {
      case "bar":
      case "line":
      case "area":
        return { Jan: 50000, Feb: 55000, Mar: 60000, Apr: 58000, May: 62000 }
      case "pie":
      case "donut":
        return { Segment1: 30, Segment2: 25, Segment3: 20, Segment4: 15, Segment5: 10 }
      case "metric":
        return { value: "10.5%", change: 1.2 }
      default:
        return {}
    }
  }

  const generateDefaultOptions = (type: string) => {
    const defaultOptions = {
      colors: ['#4CAF50', '#2196F3', '#FFC107', '#F44336', '#9C27B0'],
      showLegend: true,
      showGrid: true,
    }

    switch (type) {
      case "line":
      case "area":
        return { ...defaultOptions, curved: true, fillOpacity: 0.3 }
      case "bar":
        return { ...defaultOptions, stacked: false }
      default:
        return defaultOptions
    }
  }

  const applyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setIsFilterOpen(false)
    // Here you would typically fetch new data based on the filters
    console.log("Applying filters:", newFilters)
  }

  const getBentoLayoutClass = (index: number) => {
    const bentoClasses = [
      "md:col-span-2 md:row-span-1", // Wide rectangle
      "md:col-span-1 md:row-span-1", // Small square
      "md:col-span-1 md:row-span-1", // Small square
      "md:col-span-2 md:row-span-1", // Wide rectangle
    ]
    return bentoClasses[index % bentoClasses.length]
  }

  const getWidgetSize = (widget: typeof initialWidgets[0]) => {
    if (isBentoLayout) {
      return widget.size === "full" ? "md:col-span-3" :
             widget.size === "2/3" ? "md:col-span-2" :
             "md:col-span-1";
    } else {
      return widget.size === "full" ? "col-span-3" :
             widget.size === "2/3" ? "col-span-2" :
             "col-span-1";
    }
  };

  useEffect(() => {
    // Reset cursor when customization mode is turned off
    if (!isCustomizing) {
      document.body.style.cursor = 'default';
    }
  }, [isCustomizing]);


  return (
    <TooltipProvider>
    <div className="container py-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <DateRangePicker date={dateRange} setDate={setDateRange} />
          <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button onClick={() => setIsCustomizing(!isCustomizing)}>
            {isCustomizing ? "Save Layout" : "Customize Dashboard"}
          </Button>
          <div className="flex items-center space-x-2">
            <Switch
              id="bento-layout"
              checked={isBentoLayout}
              onCheckedChange={setIsBentoLayout}
            />
            <Label htmlFor="bento-layout" className="flex items-center cursor-pointer">
              {isBentoLayout ? (
                <LayoutTemplate className="h-4 w-4 mr-2" />
              ) : (
                <LayoutGrid className="h-4 w-4 mr-2" />
              )}
              {isBentoLayout ? "Bento Layout" : "Grid Layout"}
            </Label>
          </div>
        </div>
      </div>
      {isCustomizing && (
        <WidgetSideboard onAddWidget={addWidget} />
      )}
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart} onDragUpdate={onDragUpdate}>
        <Droppable droppableId="dashboard">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={(el) => {
                provided.innerRef(el);
                gridRef.current = el;
              }}
              className={`grid gap-6 ${
                isBentoLayout
                  ? "md:grid-cols-3 md:auto-rows-[400px]"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              } ${snapshot.isDraggingOver ? 'bg-muted/50' : ''}`}
            >
              {widgets.map((widget, index) => (
                <Draggable key={widget.id} draggableId={widget.id} index={index} isDragDisabled={!isCustomizing}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`
                        ${isBentoLayout ? getBentoLayoutClass(index) : getWidgetSize(widget)}
                        ${isCustomizing ? 'hover:ring-4 hover:ring-primary/20 rounded-lg' : ''}
                        ${snapshot.isDragging ? 'shadow-lg ring-4 ring-primary/20 rounded-lg z-10' : ''}
                        transition-all duration-200 ease-in-out
                      `}
                      style={{
                        ...provided.draggableProps.style,
                        transform: snapshot.isDragging
                          ? `${provided.draggableProps.style?.transform}`
                          : 'none',
                      }}
                    >
                      <Widget
                        {...widget}
                        onCustomize={handleCustomize}
                        onRemove={removeWidget}
                        onResize={handleResize}
                        isCustomizing={isCustomizing}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {placeholderProps && snapshot.isDraggingOver && (
                <div
                  className="absolute bg-muted/50 border-4 border-dashed border-muted-foreground/50 rounded-lg"
                  style={{
                    top: `${placeholderProps.clientY}px`,
                    left: `${placeholderProps.clientX}px`,
                    height: `${placeholderProps.clientHeight}px`,
                    width: `${placeholderProps.clientWidth}px`,
                  }}
                />
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <FilterDialog
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApplyFilters={applyFilters}
      />
    </div>
    </TooltipProvider>
  )
}

