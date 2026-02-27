import { useState, useMemo, useRef, useEffect } from "react";
import { Target, TrendingUp, CheckCircle2, XCircle, AlertTriangle, Battery, Trophy, Search, Filter, DollarSign, Store, X, Menu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { StatCard } from "./StatCard";
import { 
  sellInData, 
  getUniqueEquipes, 
  getUniqueVendedores,
  getUniqueMeses,
  getUniqueCiclos,
  getRevendaQuarterlyData,
  RevendaQuarterlyData 
} from "@/data/sellInData";

export function SellInDashboard() {
  const ciclos = getUniqueCiclos();
  const defaultCiclo = ciclos.length > 0 ? ciclos[0] : "all";
  
  const [filters, setFilters] = useState({
    ciclo: defaultCiclo,
    equipe: "all",
    vendedor: "all",
    searchRevenda: "",
    statusElegibilidade: "all",
  });
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters = filters.ciclo !== defaultCiclo || filters.equipe !== "all" || filters.vendedor !== "all" || 
    filters.searchRevenda !== "" || filters.statusElegibilidade !== "all";

  const clearFilters = () => {
    setFilters({
      ciclo: defaultCiclo,
      equipe: "all",
      vendedor: "all",
      searchRevenda: "",
      statusElegibilidade: "all",
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allRevendas = useMemo(() => getRevendaQuarterlyData(filters.ciclo), [filters.ciclo]);

  // Filter suggestions based on search
  const suggestions = useMemo(() => {
    if (!filters.searchRevenda || filters.searchRevenda.length < 2) return [];
    return allRevendas
      .filter(r => 
        r.razaoSocial.toLowerCase().includes(filters.searchRevenda.toLowerCase()) ||
        r.cnpj.includes(filters.searchRevenda)
      )
      .slice(0, 5);
  }, [filters.searchRevenda, allRevendas]);

  const revendasData = useMemo(() => {
    return allRevendas.filter((revenda: RevendaQuarterlyData) => {
      const matchEquipe = filters.equipe === "all" || revenda.equipeVendas === filters.equipe;
      const matchVendedor = filters.vendedor === "all" || revenda.vendedor === filters.vendedor;
      const matchRevenda = filters.searchRevenda === "" || 
        revenda.razaoSocial.toLowerCase().includes(filters.searchRevenda.toLowerCase()) ||
        revenda.cnpj.includes(filters.searchRevenda);
      
      let matchStatus = true;
      if (filters.statusElegibilidade === "elegivel") {
        matchStatus = revenda.elegivel;
      } else if (filters.statusElegibilidade === "falta-incremental") {
        // Atingiu meta mas não tem incrementais em 2+ meses
        matchStatus = revenda.atingiuMeta && !revenda.elegivel;
      } else if (filters.statusElegibilidade === "nao-elegivel") {
        // Não atingiu meta
        matchStatus = !revenda.atingiuMeta;
      }
      
      return matchEquipe && matchVendedor && matchRevenda && matchStatus;
    });
  }, [filters, allRevendas]);

  const stats = useMemo(() => {
    const total = revendasData.length;
    const elegiveis = revendasData.filter(r => r.elegivel).length;
    const atingiramMeta = revendasData.filter(r => r.atingiuMeta).length;
    const totalMeta = revendasData.reduce((sum, r) => sum + r.totalMeta, 0);
    const totalReal = revendasData.reduce((sum, r) => sum + r.totalReal, 0);
    
    // Incrementais: soma somente dos clientes elegíveis (real - meta de cada elegível)
    const elegiveisData = revendasData.filter(r => r.elegivel);
    const totalMetaElegiveis = elegiveisData.reduce((sum, r) => sum + r.totalMeta, 0);
    const totalRealElegiveis = elegiveisData.reduce((sum, r) => sum + r.totalReal, 0);
    const totalIncrementais = totalRealElegiveis - totalMetaElegiveis;
    
    // Premiação máxima de R$400 por cliente - só soma clientes elegíveis
    const totalPremiacao = revendasData.reduce((sum, r) => {
      if (!r.elegivel) return sum;
      const premiacaoCliente = Math.min(r.totalIncrementais * 20, 400);
      return sum + premiacaoCliente;
    }, 0);
    
    return {
      total,
      elegiveis,
      atingiramMeta,
      totalMeta,
      totalReal,
      totalIncrementais,
      totalPremiacao,
      percentualAtingimento: totalMeta > 0 ? Math.round((totalReal / totalMeta) * 100) : 0,
    };
  }, [revendasData]);

  // Team performance data
  const teamPerformance = useMemo(() => {
    const teamMap = new Map<string, { equipe: string; meta: number; real: number; incrementais: number }>();
    
    revendasData.forEach(revenda => {
      const key = revenda.equipeVendas;
      if (!teamMap.has(key)) {
        teamMap.set(key, { equipe: key, meta: 0, real: 0, incrementais: 0 });
      }
      const team = teamMap.get(key)!;
      team.meta += revenda.totalMeta;
      team.real += revenda.totalReal;
      team.incrementais += revenda.totalIncrementais;
    });
    
    return Array.from(teamMap.values());
  }, [revendasData]);

  // Vendedor performance data
  const vendedorPerformance = useMemo(() => {
    const vendedorMap = new Map<string, { vendedor: string; meta: number; real: number; incrementais: number }>();
    
    revendasData.forEach(revenda => {
      const key = revenda.vendedor;
      if (!vendedorMap.has(key)) {
        vendedorMap.set(key, { vendedor: key, meta: 0, real: 0, incrementais: 0 });
      }
      const v = vendedorMap.get(key)!;
      v.meta += revenda.totalMeta;
      v.real += revenda.totalReal;
      v.incrementais += revenda.totalIncrementais;
    });
    
    return Array.from(vendedorMap.values()).sort((a, b) => b.real - a.real);
  }, [revendasData]);

  // Top revendas
  const topRevendas = useMemo(() => {
    return [...revendasData]
      .filter(r => r.totalReal > 0)
      .sort((a, b) => b.totalReal - a.totalReal)
      .slice(0, 4);
  }, [revendasData]);

  const equipes = getUniqueEquipes();
  const vendedores = getUniqueVendedores();

  const colors = {
    meta: "hsl(215, 80%, 25%)",
    real: "hsl(45, 100%, 51%)",
    incrementais: "hsl(280, 70%, 50%)"
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0:
        return "bg-yellow-500/10 border-yellow-500/30";
      case 1:
        return "bg-gray-300/20 border-gray-400/30";
      case 2:
        return "bg-orange-400/10 border-orange-400/30";
      default:
        return "bg-background border-border";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filters - Compact like Sell Out */}
      <div className="hidden lg:flex flex-wrap items-center gap-3 p-4 bg-card rounded-xl shadow-card border border-border/50">
        <div className="flex items-center gap-2 text-primary font-medium">
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filtros</span>
        </div>

        {/* Ciclo filter */}
        <Select value={filters.ciclo} onValueChange={(v) => handleFilterChange("ciclo", v)}>
          <SelectTrigger className="w-[140px] bg-background">
            <SelectValue placeholder="Ciclo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Ciclos</SelectItem>
            {ciclos.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search with suggestions */}
        <div className="relative flex-1 min-w-[180px]" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <Input
            placeholder="Buscar revenda ou CNPJ..."
            value={filters.searchRevenda}
            onChange={(e) => {
              handleFilterChange("searchRevenda", e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="pl-9 bg-background"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
              {suggestions.map((revenda) => (
                <button
                  key={revenda.cnpj}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                  onClick={() => {
                    handleFilterChange("searchRevenda", revenda.razaoSocial);
                    setShowSuggestions(false);
                  }}
                >
                  <p className="font-medium truncate">{revenda.razaoSocial}</p>
                  <p className="text-xs text-muted-foreground">CNPJ: {revenda.cnpj}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <Select value={filters.equipe} onValueChange={(v) => handleFilterChange("equipe", v)}>
          <SelectTrigger className="w-[140px] bg-background">
            <SelectValue placeholder="Equipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Equipes</SelectItem>
                {equipes.map(eq => (
                  <SelectItem key={eq} value={eq}>{eq}</SelectItem>
                ))}
          </SelectContent>
        </Select>

        <Select value={filters.vendedor} onValueChange={(v) => handleFilterChange("vendedor", v)}>
          <SelectTrigger className="w-[140px] bg-background">
            <SelectValue placeholder="Vendedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Vendedores</SelectItem>
            {vendedores.map(v => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.statusElegibilidade} onValueChange={(v) => handleFilterChange("statusElegibilidade", v)}>
          <SelectTrigger className="w-[150px] bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="elegivel">Elegível</SelectItem>
            <SelectItem value="falta-incremental">Falta Incremental</SelectItem>
            <SelectItem value="nao-elegivel">Não Elegível</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  !
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] max-w-[320px] p-0 overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-4">
              <h2 className="text-base sm:text-lg font-semibold font-display">
                Filtros
              </h2>
              
              {/* Ciclo */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Ciclo</label>
                <Select value={filters.ciclo} onValueChange={(v) => handleFilterChange("ciclo", v)}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Ciclo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Ciclos</SelectItem>
                    {ciclos.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Equipe */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Equipe</label>
                <Select value={filters.equipe} onValueChange={(v) => handleFilterChange("equipe", v)}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Equipes</SelectItem>
                    {equipes.map(eq => (
                      <SelectItem key={eq} value={eq}>{eq}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Vendedor */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Vendedor</label>
                <Select value={filters.vendedor} onValueChange={(v) => handleFilterChange("vendedor", v)}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Vendedores</SelectItem>
                    {vendedores.map(v => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.statusElegibilidade} onValueChange={(v) => handleFilterChange("statusElegibilidade", v)}>
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="elegivel">Elegível</SelectItem>
                    <SelectItem value="falta-incremental">Falta Incremental</SelectItem>
                    <SelectItem value="nao-elegivel">Não Elegível</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Buscar Revenda */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar Revenda</label>
                <Input
                  placeholder="Nome ou CNPJ..."
                  value={filters.searchRevenda}
                  onChange={(e) => handleFilterChange("searchRevenda", e.target.value)}
                  className="w-full bg-background"
                />
              </div>

              {/* Limpar Filtros */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearFilters}
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Stats Grid - Always in a single horizontal row */}
      <div className="flex flex-wrap lg:flex-nowrap gap-2 sm:gap-3">
        <div className="flex-1 min-w-[140px]">
          <StatCard
            title="Meta Total"
            value={stats.totalMeta}
            subtitle="baterias"
            icon={Target}
            variant="primary"
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <StatCard
            title="Realizado"
            value={`${stats.totalReal} (${stats.percentualAtingimento}%)`}
            subtitle="da meta"
            icon={TrendingUp}
            variant="secondary"
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <StatCard
            title="Incrementais"
            value={stats.totalIncrementais}
            subtitle="baterias extras"
            icon={Battery}
            variant="default"
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <StatCard
            title="Premiação"
            value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(stats.totalPremiacao)}
            subtitle="R$20/incremental"
            icon={DollarSign}
            variant="default"
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <StatCard
            title="Elegíveis"
            value={`${stats.elegiveis}/${stats.total}`}
            subtitle="revendas"
            icon={Store}
            variant="default"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Team Performance Chart */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-3 sm:p-5 animate-fade-in">
          <h3 className="text-base sm:text-lg font-semibold font-display mb-3 sm:mb-4">Performance por Equipe</h3>
          <div className="h-[220px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamPerformance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
                <XAxis 
                  dataKey="equipe" 
                  tick={{ fill: "hsl(215, 15%, 45%)", fontSize: 10 }}
                  axisLine={{ stroke: "hsl(214, 20%, 90%)" }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fill: "hsl(215, 15%, 45%)", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(214, 20%, 90%)" }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(214, 20%, 90%)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                  }}
                  formatter={(value: number, name: string) => [
                    value,
                    name === "meta" ? "Meta" : name === "real" ? "Realizado" : "Incrementais"
                  ]}
                />
                <Legend formatter={(value) => value === "meta" ? "Meta" : value === "real" ? "Realizado" : "Incrementais"} />
                <Bar dataKey="meta" name="meta" fill={colors.meta} radius={[6, 6, 0, 0]} />
                <Bar dataKey="real" name="real" fill={colors.real} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendedor Performance Chart */}
        <div className="bg-card rounded-xl shadow-card border border-border/50 p-3 sm:p-5 animate-fade-in">
          <h3 className="text-base sm:text-lg font-semibold font-display mb-3 sm:mb-4">Performance por Vendedor</h3>
          <div className="h-[220px] sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={vendedorPerformance} 
                layout="vertical"
                margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" horizontal={false} />
                <XAxis 
                  type="number"
                  tick={{ fill: "hsl(215, 15%, 45%)", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(214, 20%, 90%)" }}
                />
                <YAxis 
                  dataKey="vendedor" 
                  type="category"
                  width={80}
                  tick={{ fill: "hsl(215, 15%, 45%)", fontSize: 11 }}
                  axisLine={{ stroke: "hsl(214, 20%, 90%)" }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(214, 20%, 90%)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                  }}
                  formatter={(value: number, name: string) => [
                    value,
                    name === "meta" ? "Meta" : name === "real" ? "Realizado" : "Incrementais"
                  ]}
                />
                <Legend formatter={(value) => value === "meta" ? "Meta" : value === "real" ? "Realizado" : "Incrementais"} />
                <Bar dataKey="meta" name="meta" fill={colors.meta} radius={[0, 6, 6, 0]} />
                <Bar dataKey="real" name="real" fill={colors.real} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Revendas - Same pattern as Top Balconistas */}
      <div className="bg-white rounded-xl shadow-md border border-border/30 p-3 sm:p-4 animate-fade-in w-full">
        <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
          <h3 className="text-base sm:text-xl font-bold font-display tracking-tight text-blue-900">Top Revendas</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 px-1 sm:px-2 py-1 sm:py-2 w-full">
          {topRevendas.length === 0 ? (
            <p className="text-center text-muted-foreground py-2 w-full col-span-4">
              Nenhum registro com vendas encontrado.
            </p>
          ) : (
            topRevendas.map((revenda, index) => (
              <div 
                key={revenda.cnpj}
                className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 bg-white rounded-lg border px-2 sm:px-3 py-2 shadow-sm transition-all hover:scale-[1.03] ${getRankBg(index)}`}
              >
                <div className="flex-1 min-w-0 text-center w-full">
                  <p className="font-semibold text-xs sm:text-sm leading-tight truncate" title={revenda.razaoSocial}>
                    {revenda.razaoSocial.substring(0, 30)}{revenda.razaoSocial.length > 30 ? "..." : ""}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{revenda.vendedor}</p>
                </div>
                <div className="flex flex-col items-center justify-center mt-0.5 sm:mt-1">
                  <span className="font-extrabold text-xl sm:text-2xl text-primary leading-tight">{revenda.totalReal}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold">baterias</span>
                </div>
                {revenda.elegivel && (
                  <Badge className="bg-green-500/20 text-green-700 border-green-500/30 text-[9px] sm:text-[10px] mt-1">
                    Elegível
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Revendas List with Accordion */}
      <Card className="border-border/40 bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Acompanhamento por Revenda
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4">
          <Accordion type="multiple" className="w-full space-y-2">
            {revendasData.map((revenda) => (
              <AccordionItem 
                key={revenda.cnpj} 
                value={revenda.cnpj}
                className="border rounded-lg px-3 sm:px-4 bg-background/50"
              >
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left w-full pr-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{revenda.razaoSocial}</p>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                        <span>CNPJ: {revenda.cnpj}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{revenda.vendedor}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden md:inline">{revenda.equipeVendas}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {revenda.elegivel ? (
                        <Badge className="bg-green-500/20 text-green-700 border-green-500/30 text-[10px] sm:text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Elegível
                        </Badge>
                      ) : revenda.atingiuMeta ? (
                        <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30 text-[10px] sm:text-xs">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Falta Incremental
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-700 border-red-500/30 text-[10px] sm:text-xs">
                          <XCircle className="w-3 h-3 mr-1" />
                          Não Elegível
                        </Badge>
                      )}
                      {!revenda.elegivel && revenda.bateriasParaElegibilidade > 0 && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          Faltam {revenda.bateriasParaElegibilidade} bat.
                        </Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2 pb-4 space-y-4">
                    {/* Progress Summary - Horizontal */}
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-muted-foreground">Meta Total:</span>
                        <span className="text-sm sm:text-lg font-bold">{revenda.totalMeta}</span>
                      </div>
                      <span className="text-muted-foreground">|</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-muted-foreground">Real:</span>
                        <span className="text-sm sm:text-lg font-bold">{revenda.totalReal}</span>
                      </div>
                      <span className="text-muted-foreground">|</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-muted-foreground">Incremental:</span>
                        <span className="text-sm sm:text-lg font-bold text-green-600">{revenda.totalIncrementais}</span>
                      </div>
                      <span className="text-muted-foreground">|</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-muted-foreground">Premiação:</span>
                        <span className="text-sm sm:text-lg font-bold text-secondary">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.min(revenda.totalIncrementais * 20, 400))}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progresso da Meta</span>
                        <span>{Math.min(100, Math.round((revenda.totalReal / revenda.totalMeta) * 100))}%</span>
                      </div>
                      <Progress 
                        value={Math.min(100, (revenda.totalReal / revenda.totalMeta) * 100)} 
                        className="h-2"
                      />
                    </div>

                    {/* Monthly Breakdown */}
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Mês</TableHead>
                            <TableHead className="text-xs text-center">Meta</TableHead>
                            <TableHead className="text-xs text-center">Real</TableHead>
                            <TableHead className="text-xs text-center">Incrementais</TableHead>
                            <TableHead className="text-xs text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {revenda.meses.map((mes) => (
                            <TableRow key={mes.mes}>
                              <TableCell className="text-xs sm:text-sm font-medium">{mes.mes}</TableCell>
                              <TableCell className="text-xs sm:text-sm text-center">{mes.meta}</TableCell>
                              <TableCell className="text-xs sm:text-sm text-center">{mes.real}</TableCell>
                              <TableCell className="text-xs sm:text-sm text-center">
                                {mes.real > mes.meta && mes.bateriasIncrementais > 0 ? (
                                  <span className="text-green-600">+{mes.bateriasIncrementais}</span>
                                ) : (
                                  <span className="text-muted-foreground">0</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {mes.real >= mes.meta ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-500 mx-auto" />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Eligibility Message */}
                    {!revenda.elegivel && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <p className="text-xs sm:text-sm text-amber-700">
                          <AlertTriangle className="w-4 h-4 inline mr-1" />
                          {revenda.atingiuMeta 
                            ? "Esta revenda atingiu a meta, mas precisa de pelo menos 1 bateria incremental para ser elegível."
                            : `Esta revenda precisa comprar mais ${revenda.bateriasParaElegibilidade} bateria(s) para estar elegível à premiação.`
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {revendasData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>Nenhuma revenda encontrada com os filtros selecionados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
