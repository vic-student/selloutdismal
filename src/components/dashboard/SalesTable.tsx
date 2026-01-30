import { SalesRecord } from "@/data/salesData";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SalesTableProps {
  data: SalesRecord[];
}

export function SalesTable({ data }: SalesTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formato compacto de moeda para mobile
  const formatCurrencyCompact = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden animate-fade-in">
      <div className="p-3 sm:p-4 border-b border-border">
        <h3 className="text-base sm:text-lg font-semibold font-display">Detalhamento de Vendas</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          {data.length} registros encontrados
        </p>
      </div>
      
      {/* Mobile: Scroll horizontal + vertical */}
      <ScrollArea className="h-[350px] sm:h-[400px] md:h-[500px]">
        <div className="min-w-[500px] sm:min-w-0">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
              <TableRow>
                <TableHead className="font-semibold text-left text-[11px] sm:text-xs md:text-sm px-2 sm:px-3 py-2 sm:py-3 min-w-[120px] sm:min-w-[150px]">
                  Balconista
                </TableHead>
                <TableHead className="font-semibold text-left text-[11px] sm:text-xs md:text-sm px-2 sm:px-3 py-2 sm:py-3 min-w-[100px] sm:min-w-[130px]">
                  Revenda
                </TableHead>
                <TableHead className="font-semibold text-center text-[11px] sm:text-xs md:text-sm px-1 sm:px-3 py-2 sm:py-3 whitespace-nowrap min-w-[50px] sm:min-w-[70px]">
                  Sell Out
                </TableHead>
                <TableHead className="font-semibold text-center text-[11px] sm:text-xs md:text-sm px-1 sm:px-3 py-2 sm:py-3 min-w-[70px] sm:min-w-[90px]">
                  Valor
                </TableHead>
                <TableHead className="font-semibold text-center text-[11px] sm:text-xs md:text-sm px-1 sm:px-3 py-2 sm:py-3 min-w-[90px]">
                  Vendedor
                </TableHead>
                <TableHead className="font-semibold text-center text-[11px] sm:text-xs md:text-sm px-1 sm:px-3 py-2 sm:py-3 min-w-[70px]">
                  Equipe
                </TableHead>
                <TableHead className="font-semibold text-center text-[11px] sm:text-xs md:text-sm px-1 sm:px-3 py-2 sm:py-3 min-w-[60px] sm:min-w-[80px]">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-center text-[11px] sm:text-xs md:text-sm px-1 sm:px-3 py-2 sm:py-3 min-w-[50px] sm:min-w-[70px]">
                  Mês
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 sm:py-12 text-muted-foreground text-sm">
                    Nenhum registro encontrado com os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((record, index) => (
                  <TableRow 
                    key={`${record.balconista}-${index}`}
                    className="hover:bg-accent/50 transition-colors"
                  >
                    {/* Balconista */}
                    <TableCell className="font-medium text-left px-2 sm:px-3 py-2 sm:py-3">
                      <p className="text-xs sm:text-sm font-semibold leading-tight line-clamp-2">
                        {record.balconista}
                      </p>
                    </TableCell>
                    
                    {/* Revenda */}
                    <TableCell className="text-left px-2 sm:px-3 py-2 sm:py-3">
                      <p className="text-[11px] sm:text-sm text-muted-foreground leading-tight line-clamp-2">
                        {record.revenda}
                      </p>
                    </TableCell>
                    
                    {/* Sell Out */}
                    <TableCell className="text-center px-1 sm:px-3 py-2 sm:py-3">
                      <span className={`text-sm sm:text-base font-bold ${record.sellOut > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                        {record.sellOut}
                      </span>
                    </TableCell>
                    
                    {/* Valor */}
                    <TableCell className="text-center px-1 sm:px-3 py-2 sm:py-3">
                      <span className="text-[11px] sm:text-sm font-medium whitespace-nowrap">
                        <span className="sm:hidden">{formatCurrencyCompact(record.valor)}</span>
                        <span className="hidden sm:inline">{formatCurrency(record.valor)}</span>
                      </span>
                    </TableCell>
                    
                    {/* Vendedor */}
                    <TableCell className="text-center px-1 sm:px-3 py-2 sm:py-3">
                      <span className="text-[11px] sm:text-sm">{record.vendedor}</span>
                    </TableCell>
                    
                    {/* Equipe */}
                    <TableCell className="text-center px-1 sm:px-3 py-2 sm:py-3">
                      <Badge className="bg-blue-900 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">{record.equipe}</Badge>
                    </TableCell>
                    
                    {/* Status */}
                    <TableCell className="text-center px-1 sm:px-3 py-2 sm:py-3">
                      {record.status === "Bloqueado" ? (
                        <Badge className="bg-orange-400 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                          <span className="sm:hidden">Bloq</span>
                          <span className="hidden sm:inline">Bloqueado</span>
                        </Badge>
                      ) : (
                        <Badge className="bg-green-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                          Ativo
                        </Badge>
                      )}
                    </TableCell>
                    
                    {/* Mês */}
                    <TableCell className="text-center px-1 sm:px-3 py-2 sm:py-3">
                      <span className="text-[11px] sm:text-sm text-muted-foreground font-medium">
                        <span className="sm:hidden">{record.mes.slice(0, 3)}</span>
                        <span className="hidden sm:inline">{record.mes}</span>
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
