import { SalesRecord } from "@/data/salesData";
import { Trophy, Medal, Award } from "lucide-react";

interface TopBalconistasProps {
  data: SalesRecord[];
}

export function TopBalconistas({ data }: TopBalconistasProps) {
  // Sort by sellOut descending and get top 5
  const topBalconistas = [...data]
    .filter(d => d.sellOut > 0)
    .sort((a, b) => b.sellOut - a.sellOut)
    .slice(0, 5);

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
    <div className="bg-card rounded-xl shadow-card border border-border/50 p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-secondary" />
        <h3 className="text-lg font-semibold font-display">Top Balconistas</h3>
      </div>
      
      <div className="space-y-3">
        {topBalconistas.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum registro com vendas encontrado.
          </p>
        ) : (
          topBalconistas.map((record, index) => (
            <div 
              key={`${record.balconista}-${index}`}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-md ${getRankBg(index)}`}
            >
              <div className="flex-shrink-0">
                {getRankIcon(index)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{record.balconista}</p>
                <p className="text-xs text-muted-foreground truncate">{record.revenda}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-primary">{record.sellOut}</p>
                <p className="text-xs text-muted-foreground">vendas</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
