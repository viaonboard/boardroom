import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/src/lib/utils"
import { LayoutDashboard, PieChart, DollarSign, TrendingUp, Users, Settings } from 'lucide-react'
import Link from "next/link"
import { usePathname } from "next/navigation"

const sidebarItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Financial Performance", icon: PieChart, href: "/financial-performance" },
  { name: "Cash Flow", icon: DollarSign, href: "/cash-flow" },
  { name: "Investment Returns", icon: TrendingUp, href: "/investment-returns" },
  { name: "Investor Relations", icon: Users, href: "/investor-relations" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden border-r bg-muted/40 lg:block dark:bg-gray-800/40">
      <div className="flex h-full w-60 flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <Link className="flex items-center gap-2 font-semibold" href="/">
            <PieChart className="h-6 w-6" />
            <span className="">CRE Dashboard</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            {sidebarItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                  "hover:bg-muted/50 dark:hover:bg-gray-800",
                  pathname === item.href && "bg-muted text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </ScrollArea>
        <div className="mt-auto p-4">
          <Button variant="outline" className="w-full" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  )
}

