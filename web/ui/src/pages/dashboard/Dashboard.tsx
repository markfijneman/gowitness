import { useEffect, useState } from "react";
import { WideSkeleton } from "@/components/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseIcon, FileTextIcon, ServerIcon, NetworkIcon, TerminalIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import * as apitypes from "@/lib/api/types";
import { getData } from "./data";

const chartConfig = {
  count: {
    label: "Total",
    color: "hsl(var(--chart-5))",
  },
  code: {
    label: "HTTP Status Code",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const getStatusGraphColor = (code: number) => {
  if (code >= 200 && code < 300) return "rgb(34 197 94)"; // bg-green-500
  if (code >= 400 && code < 500) return "rgb(234 179 8)"; // bg-yellow-500
  if (code >= 500) return "rgb(239 68 68)"; // bg-red-500
  return "rgb(107 114 128)"; // bg-gray-500
};

const StatCard = ({ title, value, icon: Icon }: { title: string; value: number | string; icon: React.ElementType; }) => (
  <Card className="overflow-hidden transition-all">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<apitypes.statistics>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getData(setLoading, setStats);
  }, []);

  if (loading) return <WideSkeleton />;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Database Size"
          value={`${stats ? (stats.dbsize / (1024 * 1024)).toFixed(1) : 0} MB`}
          icon={DatabaseIcon}
        />
        <StatCard
          title="Total Results"
          value={stats ? stats.results : 0}
          icon={FileTextIcon}
        />
        <StatCard
          title="Headers"
          value={stats ? stats.headers : 0}
          icon={ServerIcon}
        />
        <StatCard
          title="Network Logs"
          value={stats ? stats.networklogs : 0}
          icon={NetworkIcon}
        />
        <StatCard
          title="Console Logs"
          value={stats ? stats.consolelogs : 0}
          icon={TerminalIcon}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>HTTP Status Code Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.response_code_stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="code"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel indicator="line" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stats?.response_code_stats.map((entry, _) => (
                    <Cell fill={getStatusGraphColor(entry.code)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}