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
    searchBalconista: string;
    searchRevenda: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export function DashboardHeader({ filters, onFilterChange }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full gradient-hero">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary rounded-xl shadow-glow">
              <BarChart3 className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-display text-primary-foreground">
                Sell Out - Energia Premiada
              </h1>
              <p className="text-xs md:text-sm text-primary-foreground/70">
                Última atualização: 12/01/26 às 10:00
              </p>
            </div>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] p-0">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4 font-display">Filtros</h2>
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
