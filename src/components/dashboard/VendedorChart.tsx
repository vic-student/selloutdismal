import { SalesRecord } from "@/data/salesData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface VendedorChartProps {
  data: SalesRecord[];
}

export function VendedorChart({ data }: VendedorChartProps) {
  // Aggregate by vendedor
  const vendedorData = data.reduce((acc, record) => {
    const existing = acc.find(v => v.vendedor === record.vendedor);
    if (existing) {
      existing.sellOut += record.sellOut;
      existing.valor += record.valor;
      existing.count += 1;
    } else {
      acc.push({
        vendedor: record.vendedor,
        sellOut: record.sellOut,
        valor: record.valor,
        count: 1
      });
    }
    return acc;
  }, [] as { vendedor: string; sellOut: number; valor: number; count: number }[]);

  // Sort by sellOut descending
  vendedorData.sort((a, b) => b.sellOut - a.sellOut);

  const colors = {
    sellOut: "hsl(215, 80%, 25%)",
    valor: "hsl(45, 100%, 51%)"
  };

  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 p-5 animate-fade-in">
      <h3 className="text-lg font-semibold font-display mb-4">Performance por Vendedor</h3>
      
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={vendedorData} 
            layout="vertical"
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
              width={100}
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
                name === "sellOut" ? value : `R$ ${value.toFixed(2)}`,
                name === "sellOut" ? "Sell Out" : "Premiação por Bateria"
              ]}
            />
            <Legend 
              formatter={(value) => value === "sellOut" ? "Sell Out" : "Premiação por Bateria"}
            />
            <Bar dataKey="sellOut" name="sellOut" fill={colors.sellOut} radius={[0, 6, 6, 0]} />
            <Bar dataKey="valor" name="valor" fill={colors.valor} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}