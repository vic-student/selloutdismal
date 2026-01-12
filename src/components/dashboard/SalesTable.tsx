import { SalesRecord } from "@/data/salesData";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold font-display">Detalhamento de Vendas</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {data.length} registros encontrados
        </p>
      </div>
      
      <ScrollArea className="h-[400px] md:h-[500px]">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur-sm">
            <TableRow>
              <TableHead className="font-semibold">Balconista</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">Revenda</TableHead>
              <TableHead className="font-semibold text-center">Sell Out</TableHead>
              <TableHead className="font-semibold text-right">Valor</TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">Equipe</TableHead>
              <TableHead className="font-semibold hidden lg:table-cell">Vendedor</TableHead>
              <TableHead className="font-semibold hidden sm:table-cell text-center">Swile</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  Nenhum registro encontrado com os filtros selecionados.
                </TableCell>
              </TableRow>
            ) : (
              data.map((record, index) => (
                <TableRow 
                  key={`${record.balconista}-${index}`}
                  className="hover:bg-accent/50 transition-colors"
                >
                  <TableCell className="font-medium">
                    <div>
                      <p className="truncate max-w-[180px]">{record.balconista}</p>
                      <p className="text-xs text-muted-foreground md:hidden truncate max-w-[180px]">
                        {record.revenda}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="truncate max-w-[200px] text-sm">{record.revenda}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-semibold ${record.sellOut > 0 ? 'text-success' : 'text-muted-foreground'}`}>
                      {record.sellOut}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(record.valor)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant={record.equipe === "Capital" ? "default" : "secondary"}>
                      {record.equipe}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">
                    {record.vendedor}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-center">
                    {record.swile ? (
                      <Badge className="bg-success text-success-foreground">Sim</Badge>
                    ) : (
                      <Badge variant="outline">Não</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
