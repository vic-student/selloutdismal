import { useState, useMemo } from "react";
import { DollarSign, Users, Store, ShoppingCart } from "lucide-react";
import { salesData, SalesRecord, getUniqueMeses, getUniqueAnos } from "@/data/salesData";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FilterPanel } from "@/components/dashboard/FilterPanel";
import { StatCard } from "@/components/dashboard/StatCard";
import { SalesTable } from "@/components/dashboard/SalesTable";
import { TeamChart } from "@/components/dashboard/TeamChart";
import { VendedorChart } from "@/components/dashboard/VendedorChart";
import { TopBalconistas } from "@/components/dashboard/TopBalconistas";

const Index = () => {
  // Definir filtros iniciais para mês e ano atuais (fallback para 'all' se não existirem nos dados)
  const monthsPt = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
  ];
  const now = new Date();
  const candidateMes = monthsPt[now.getMonth()];
  const candidateAno = String(now.getFullYear());
  const availableMeses = getUniqueMeses();
  const availableAnos = getUniqueAnos().map(String);
  const defaultMes = availableMeses.includes(candidateMes) ? candidateMes : "all";
  const defaultAno = availableAnos.includes(candidateAno) ? candidateAno : "all";

  const [filters, setFilters] = useState({
    equipe: "all",
    vendedor: "all",
    mes: defaultMes,
    ano: defaultAno,
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
      const matchAno = filters.ano === "all" || String(record.ano) === filters.ano;
      const matchBalconista = filters.searchBalconista === "" || 
        record.balconista.toLowerCase().includes(filters.searchBalconista.toLowerCase());
      const matchRevenda = filters.searchRevenda === "" || 
        record.revenda.toLowerCase().includes(filters.searchRevenda.toLowerCase());
      
      return matchEquipe && matchVendedor && matchMes && matchAno && matchBalconista && matchRevenda;
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader filters={filters} onFilterChange={handleFilterChange} />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Desktop Filters */}
        <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TeamChart data={filteredData} />
          <VendedorChart data={filteredData} />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SalesTable data={filteredData} />
          </div>
          <TopBalconistas data={filteredData} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          Não compartilhe esse acesso com terceiros.
        </div>
      </footer>
    </div>
  );
};

export default Index;
