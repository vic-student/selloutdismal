import { BarChart3, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FilterPanel } from "./FilterPanel";

interface DashboardHeaderProps {
  filters: {
    equipe: string;
    vendedor: string;
    mes: string;
    ano: string;
    status: string;
    searchBalconista: string;
    searchRevenda: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export function DashboardHeader({ filters, onFilterChange }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full gradient-hero">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-secondary rounded-lg sm:rounded-xl shadow-glow">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl md:text-2xl font-bold font-display text-primary-foreground leading-tight">
                Sell Out - Energia Premiada
              </h1>
              <p className="text-[10px] sm:text-xs md:text-sm text-primary-foreground/70">
                30/01/2026 às 10:00
              </p>
            </div>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-primary-foreground hover:bg-primary-foreground/10 h-9 w-9 sm:h-10 sm:w-10"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-[320px] p-0 overflow-y-auto">
              <div className="p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold mb-4 font-display">
                  Filtros
                </h2>
                <FilterPanel
                  filters={filters}
                  onFilterChange={onFilterChange}
                  isMobile
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
