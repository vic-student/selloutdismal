import { SalesRecord } from "@/data/salesData";
import { Trophy, Medal, Award } from "lucide-react";

interface TopBalconistasProps {
  data: SalesRecord[];
}

export function TopBalconistas({ data }: TopBalconistasProps) {
  // Agrupa vendas por balconista e soma o sellOut de todos os meses
  const salesByBalconista: { [balconista: string]: { revenda: string; sellOut: number } } = {};
  data.forEach(record => {
    if (!salesByBalconista[record.balconista]) {
      salesByBalconista[record.balconista] = {
        revenda: record.revenda,
        sellOut: 0
      };
    }
    salesByBalconista[record.balconista].sellOut += record.sellOut;
  });

  // Cria array dos balconistas com somatório e ordena
  const topBalconistas = Object.entries(salesByBalconista)
    .map(([balconista, info]) => ({ balconista, revenda: info.revenda, sellOut: info.sellOut }))
    .filter(d => d.sellOut > 0)
    .sort((a, b) => b.sellOut - a.sellOut)
    .slice(0, 4);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-secondary" />;
      case 1:
        return <Medal className="w-5 h-5 text-muted-foreground" />;
      case 2:
        return <Award className="w-5 h-5 text-warning" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{index + 1}</span>;
    }
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0:
        return "bg-secondary/10 border-secondary/30";
      case 1:
        return "bg-muted border-muted-foreground/20";
      case 2:
        return "bg-warning/10 border-warning/30";
      default:
        return "bg-background border-border";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-border/30 p-3 sm:p-4 animate-fade-in w-full">
      <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
        <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
        <h3 className="text-base sm:text-xl font-bold font-display tracking-tight text-blue-900">Top Balconistas</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 px-1 sm:px-2 py-1 sm:py-2 w-full">
        {topBalconistas.length === 0 ? (
          <p className="text-center text-muted-foreground py-2 w-full">
            Nenhum registro com vendas encontrado.
          </p>
        ) : (
          topBalconistas.map((record, index) => (
            <div 
              key={`${record.balconista}-${index}`}
              className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 bg-white rounded-lg border border-border px-2 sm:px-3 py-2 shadow-sm transition-all hover:scale-[1.03] ${getRankBg(index)}`}
            >
              {/* ...removed ranking number... */}
              <div className="flex-1 min-w-0 text-center w-full">
                <p className="font-semibold text-xs sm:text-sm leading-tight truncate" title={record.balconista}>{record.balconista}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight truncate" title={record.revenda}>{record.revenda}</p>
              </div>
              <div className="flex flex-col items-center justify-center mt-0.5 sm:mt-1">
                <span className="font-extrabold text-xl sm:text-2xl text-primary leading-tight">{record.sellOut}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-semibold">vendas</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
