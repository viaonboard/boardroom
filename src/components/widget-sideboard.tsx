import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { PlusCircle } from 'lucide-react'

const availableWidgets = [
  { id: "noi", title: "Net Operating Income", type: "bar" },
  { id: "cash-flow", title: "Cash Flow", type: "line" },
  { id: "cap-rate", title: "Cap Rate", type: "metric" },
  { id: "irr", title: "Internal Rate of Return", type: "metric" },
  { id: "ltv", title: "Loan-to-Value Ratio", type: "donut" },
  { id: "occupancy", title: "Occupancy Rate", type: "area" },
  { id: "expense-ratio", title: "Expense Ratio", type: "pie" },
  { id: "roi", title: "Return on Investment", type: "metric" },
  { id: "debt-service-coverage", title: "Debt Service Coverage Ratio", type: "metric" },
  { id: "gross-operating-income", title: "Gross Operating Income", type: "bar" },
  { id: "net-cash-flow", title: "Net Cash Flow", type: "line" },
  { id: "cash-on-cash-return", title: "Cash on Cash Return", type: "metric" },
  { id: "equity-multiple", title: "Equity Multiple", type: "metric" },
  { id: "gross-rent-multiplier", title: "Gross Rent Multiplier", type: "metric" },
]

interface WidgetSideboardProps {
  onAddWidget: (widget: typeof availableWidgets[0]) => void
}

export function WidgetSideboard({ onAddWidget }: WidgetSideboardProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">Available Widgets</h2>
        <ScrollArea className="h-[200px]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableWidgets.map((widget) => (
              <Button
                key={widget.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => onAddWidget(widget)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {widget.title}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

