import { useState, useMemo } from "react";
import { DollarSign, Users, Store, ShoppingCart, Target, Menu } from "lucide-react";
import { salesData, SalesRecord, getUniqueMeses, getUniqueAnos } from "@/data/salesData";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FilterPanel } from "@/components/dashboard/FilterPanel";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesTable } from "@/components/dashboard/SalesTable";
import { TeamChart } from "@/components/dashboard/TeamChart";
import { VendedorChart } from "@/components/dashboard/VendedorChart";
import { TopBalconistas } from "@/components/dashboard/TopBalconistas";
import { SellInDashboard } from "@/components/dashboard/SellInDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Index = () => {
  // Mapeamento de número do mês para nome em português
  const mesesPtBr = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Definir filtros iniciais para mês e ano atuais (fallback para 'all' se não existirem nos dados)
  const availableMeses = getUniqueMeses();
  const availableAnos = getUniqueAnos().map(String);
  
  // Obter mês e ano atuais
  const currentDate = new Date();
  const currentMesNome = mesesPtBr[currentDate.getMonth()];
  const currentAno = String(currentDate.getFullYear());
  
  // Usar mês/ano atual se existirem nos dados, senão usar 'all'
  const defaultMes = availableMeses.includes(currentMesNome) ? currentMesNome : "all";
  const defaultAno = availableAnos.includes(currentAno) ? currentAno : "all";

  const [filters, setFilters] = useState({
    equipe: "all",
    vendedor: "all",
    mes: defaultMes,
    ano: defaultAno,
    status: "all",
    searchBalconista: "",
    searchRevenda: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredData = useMemo(() => {
    return salesData.filter((record: SalesRecord) => {
      const matchEquipe = filters.equipe === "all" || record.equipe === filters.equipe;
      const matchVendedor = filters.vendedor === "all" || record.vendedor === filters.vendedor;
      const matchMes = filters.mes === "all" || record.mes === filters.mes;
      const matchAno = filters.ano === "all" || String(record.ano) === String(filters.ano);
      const matchBalconista = filters.searchBalconista === "" || 
        record.balconista.toLowerCase().includes(filters.searchBalconista.toLowerCase());
      const matchRevenda = filters.searchRevenda === "" || 
        record.revenda.toLowerCase().includes(filters.searchRevenda.toLowerCase());
      const matchStatus = filters.status === "all" || record.status === filters.status;
      
      return matchEquipe && matchVendedor && matchMes && matchAno && matchBalconista && matchRevenda && matchStatus;
    });
  }, [filters]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalSellOut = filteredData.reduce((sum, r) => sum + r.sellOut, 0);
    const totalValor = filteredData.reduce((sum, r) => sum + r.valor, 0);
    const totalBalconistas = filteredData.length;
    const uniqueRevendas = new Set(filteredData.map(r => r.revenda)).size;
    const swileCount = filteredData.filter(r => r.swile).length;
    const activeCount = filteredData.filter(r => r.status === "Ativo").length;
    
    return {
      totalSellOut,
      totalValor,
      totalBalconistas,
      uniqueRevendas,
      swileCount,
      activeCount,
    };
  }, [filteredData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const [activeTab, setActiveTab] = useState("sell-out");

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Tabs */}
      <header className="sticky top-0 z-50 w-full gradient-hero">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="https://i.ibb.co/zVr0SP5p/image-removebg-preview-54.png" 
                alt="Energia Premiada" 
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
              />
              <div>
                <h1 className="text-base sm:text-xl md:text-2xl font-bold font-display text-primary-foreground leading-tight">
                  Energia Premiada - Dismal Matriz
                </h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-primary-foreground/70">
                  Atualizado em 27/02/2026 às 09:30
                </p>
              </div>
            </div>

            {/* Mobile Menu - only for Sell Out */}
            {activeTab === "sell-out" && (
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
                      onFilterChange={handleFilterChange}
                      isMobile
                    />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="container mx-auto px-3 sm:px-4 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
            <TabsTrigger value="sell-out" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Sell Out</span>
              <span className="sm:hidden">Out</span>
            </TabsTrigger>
            <TabsTrigger value="sell-in" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Sell In</span>
              <span className="sm:hidden">In</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sell-out" className="mt-0">
            <div className="space-y-4 sm:space-y-6">
        {/* Desktop Filters */}
        <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <StatCard
            title="Total Sell Out"
            value={stats.totalSellOut}
            subtitle="Baterias vendidas"
            icon={ShoppingCart}
            variant="primary"
          />
          <StatCard
            title="Premiação Total"
            value={formatCurrency(stats.totalValor)}
            subtitle="por bateria"
            icon={DollarSign}
            variant="secondary"
          />
          <StatCard
            title="Balconistas"
            value={stats.totalBalconistas}
            subtitle="no período"
            icon={Users}
            variant="default"
          />
          <StatCard
            title="Revendas"
            value={stats.uniqueRevendas}
            subtitle="ativas"
            icon={Store}
            variant="default"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <TeamChart data={filteredData} />
          <VendedorChart data={filteredData} />
        </div>

        {/* Top Balconistas acima da tabela */}
        <TopBalconistas data={filteredData} />

        {/* Tabela de vendas espaçada */}
        <div className="mt-4 sm:mt-6">
          <SalesTable data={filteredData} />
        </div>
            </div>
          </TabsContent>

          <TabsContent value="sell-in" className="mt-0">
            <SellInDashboard />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-6 sm:mt-8">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 text-center text-xs sm:text-sm text-muted-foreground">
          Não compartilhe esse acesso com terceiros.
        </div>
      </footer>
    </div>
  );
};

export default Index;
