import { SalesRecord } from "@/data/salesData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

interface TeamChartProps {
  data: SalesRecord[];
}

export function TeamChart({ data }: TeamChartProps) {
  // Aggregate by team
  const teamData = data.reduce((acc, record) => {
    const existing = acc.find(t => t.equipe === record.equipe);
    if (existing) {
      existing.sellOut += record.sellOut;
      existing.valor += record.valor;
      existing.count += 1;
    } else {
      acc.push({
        equipe: record.equipe,
        sellOut: record.sellOut,
        valor: record.valor,
        count: 1
      });
    }
    return acc;
  }, [] as { equipe: string; sellOut: number; valor: number; count: number }[]);

  const colors = {
    sellOut: "hsl(215, 80%, 25%)",
    valor: "hsl(45, 100%, 51%)"
  };

  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 p-5 animate-fade-in">
      <h3 className="text-lg font-semibold font-display mb-4">Performance por Equipe</h3>
      
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={teamData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" vertical={false} />
            <XAxis 
              dataKey="equipe" 
              tick={{ fill: "hsl(215, 15%, 45%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(214, 20%, 90%)" }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fill: "hsl(215, 15%, 45%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(214, 20%, 90%)" }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fill: "hsl(215, 15%, 45%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(214, 20%, 90%)" }}
              tickFormatter={(value) => `R$${value}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(214, 20%, 90%)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
              }}
              formatter={(value: number, name: string) => [
                name === "sellOut" ? value : `R$ ${value.toFixed(2)}`,
                name === "sellOut" ? "Sell Out" : "Premiação por Bateria"
              ]}
            />
            <Legend 
              formatter={(value) => value === "sellOut" ? "Sell Out" : "Premiação por Bateria"}
            />
            <Bar yAxisId="left" dataKey="sellOut" name="sellOut" fill={colors.sellOut} radius={[6, 6, 0, 0]} />
            <Bar yAxisId="right" dataKey="valor" name="valor" fill={colors.valor} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
        {teamData.map((team) => (
          <div key={team.equipe} className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: colors.sellOut }}
              />
              <span className="text-sm text-muted-foreground">
                {team.equipe}: <span className="font-semibold text-foreground">{team.sellOut}</span> vendas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: colors.valor }}
              />
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">R$ {team.valor.toFixed(2)}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}