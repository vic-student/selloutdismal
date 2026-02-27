import { useState, useRef, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  getUniqueEquipes, 
  getUniqueVendedores, 
  getVendedoresByEquipe,
  getUniqueMeses, 
  getUniqueAnos,
  getUniqueBalconistas,
  getUniqueRevendas
} from "@/data/salesData";

interface FilterPanelProps {
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
  isMobile?: boolean;}

export function FilterPanel({ filters, onFilterChange, isMobile = false }: FilterPanelProps) {
  const equipes = getUniqueEquipes();
  const vendedores = getVendedoresByEquipe(filters.equipe);
  const meses = getUniqueMeses();
  const anos = getUniqueAnos();
  const allBalconistas = getUniqueBalconistas();
  const allRevendas = getUniqueRevendas();

  const [showBalconistaSuggestions, setShowBalconistaSuggestions] = useState(false);
  const [showRevendaSuggestions, setShowRevendaSuggestions] = useState(false);
  const balconistaRef = useRef<HTMLDivElement>(null);
  const revendaRef = useRef<HTMLDivElement>(null);

  const hasActiveFilters = Object.values(filters).some(v => v !== "" && v !== "all");

  const clearFilters = () => {
    onFilterChange("equipe", "all");
    onFilterChange("vendedor", "all");
    onFilterChange("mes", "all");
    onFilterChange("ano", "all");
    onFilterChange("status", "all");
    onFilterChange("searchBalconista", "");
    onFilterChange("searchRevenda", "");
  };

  // Filter suggestions based on input
  const balconistaSuggestions = filters.searchBalconista.length >= 2
    ? allBalconistas.filter(b => 
        b.toLowerCase().includes(filters.searchBalconista.toLowerCase())
      ).slice(0, 5)
    : [];

  const revendaSuggestions = filters.searchRevenda.length >= 2
    ? allRevendas.filter(r => 
        r.toLowerCase().includes(filters.searchRevenda.toLowerCase())
      ).slice(0, 5)
    : [];

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (balconistaRef.current && !balconistaRef.current.contains(event.target as Node)) {
        setShowBalconistaSuggestions(false);
      }
      if (revendaRef.current && !revendaRef.current.contains(event.target as Node)) {
        setShowRevendaSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const containerClass = isMobile 
    ? "flex flex-col gap-3 text-sm" 
    : "hidden lg:flex flex-wrap items-center gap-3 p-4 bg-card rounded-xl shadow-card border border-border/50";

  return (
    <div className={containerClass}>
      {!isMobile && (
        <div className="flex items-center gap-2 text-primary font-medium">
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filtros</span>
        </div>
      )}

      {/* Search by Balconista with autocomplete */}
      <div className="relative flex-1 min-w-[180px]" ref={balconistaRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <Input
          placeholder="Buscar balconista..."
          value={filters.searchBalconista}
          onChange={(e) => {
            onFilterChange("searchBalconista", e.target.value);
            setShowBalconistaSuggestions(true);
          }}
          onFocus={() => setShowBalconistaSuggestions(true)}
          className="pl-9 bg-background"
        />
        {showBalconistaSuggestions && balconistaSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
            {balconistaSuggestions.map((name, index) => (
              <button
                key={index}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                onClick={() => {
                  onFilterChange("searchBalconista", name);
                  setShowBalconistaSuggestions(false);
                }}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search by Revenda with autocomplete */}
      <div className="relative flex-1 min-w-[180px]" ref={revendaRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <Input
          placeholder="Buscar revenda..."
          value={filters.searchRevenda}
          onChange={(e) => {
            onFilterChange("searchRevenda", e.target.value);
            setShowRevendaSuggestions(true);
          }}
          onFocus={() => setShowRevendaSuggestions(true)}
          className="pl-9 bg-background"
        />
        {showRevendaSuggestions && revendaSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
            {revendaSuggestions.map((name, index) => (
              <button
                key={index}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                onClick={() => {
                  onFilterChange("searchRevenda", name);
                  setShowRevendaSuggestions(false);
                }}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Equipe Filter */}
      <Select value={filters.equipe} onValueChange={(v) => {
        onFilterChange("equipe", v);
        // Resetar vendedor quando mudar a equipe
        onFilterChange("vendedor", "all");
      }}>
        <SelectTrigger className="w-full lg:w-[140px] bg-background">
          <SelectValue placeholder="Equipe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas Equipes</SelectItem>
          {equipes.map((e) => (
            <SelectItem key={e} value={e}>{e}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Vendedor Filter */}
      <Select value={filters.vendedor} onValueChange={(v) => onFilterChange("vendedor", v)}>
        <SelectTrigger className="w-full lg:w-[160px] bg-background">
          <SelectValue placeholder="Vendedor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos Vendedores</SelectItem>
          {vendedores.map((v) => (
            <SelectItem key={v} value={v}>{v}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Mês Filter */}
      <Select value={filters.mes} onValueChange={(v) => onFilterChange("mes", v)}>
        <SelectTrigger className="w-full lg:w-[130px] bg-background">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos Meses</SelectItem>
          {meses.map((m) => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Ano Filter */}
      <Select value={filters.ano} onValueChange={(v) => onFilterChange("ano", v)}>
        <SelectTrigger className="w-full lg:w-[100px] bg-background">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos Anos</SelectItem>
          {anos.map((a) => (
            <SelectItem key={a} value={String(a)}>{a}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={filters.status} onValueChange={(v) => onFilterChange("status", v)}>
        <SelectTrigger className="w-full lg:w-[120px] bg-background">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos Status</SelectItem>
          <SelectItem value="Ativo">Ativo</SelectItem>
          <SelectItem value="Bloqueado">Bloqueado</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
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
  );
}