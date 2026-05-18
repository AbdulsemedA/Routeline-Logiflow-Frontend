import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";
import { Card } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <AppShell requireRole="admin">
      <Inner />
    </AppShell>
  );
}

function Inner() {
  const { data } = useQuery({
    queryKey: ["analytics", "series"],
    queryFn: () => analyticsApi.series(),
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Operational performance over the last two weeks.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Deliveries per day" subtitle="14-day trend">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data?.perDay ?? []}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="deliveries"
                stroke="#3b82f6"
                fill="url(#g1)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Average delivery time" subtitle="minutes per delivery">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data?.perDay ?? []}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="avgMinutes"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Peak demand hours" subtitle="orders by hour of day">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.peakHours ?? []}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="demand" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Driver efficiency" subtitle="on-time score (top 8)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.driverEfficiency ?? []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={70} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="score" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Delivery activity heatmap" subtitle="hour × day of week">
        <Heatmap />
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="mb-3">
        <div className="text-sm font-medium">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      {children}
    </Card>
  );
}

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Heatmap() {
  // deterministic-ish pattern
  const data = DAYS.map((d, di) =>
    Array.from({ length: 24 }, (_, h) => {
      const base = Math.abs(Math.sin((h - 7) / 3)) * 60;
      const lunch = h >= 11 && h <= 13 ? 25 : 0;
      const dinner = h >= 17 && h <= 20 ? 35 : 0;
      const weekend = di >= 5 ? 15 : 0;
      const v = Math.min(100, base + lunch + dinner + weekend + (di * 3 + h) % 8);
      return Math.round(v);
    }),
  );
  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="grid grid-cols-[40px_repeat(24,_minmax(18px,1fr))] gap-1 text-[10px] text-muted-foreground">
          <div></div>
          {Array.from({ length: 24 }).map((_, h) => (
            <div key={h} className="text-center">
              {h % 3 === 0 ? h : ""}
            </div>
          ))}
          {data.map((row, di) => (
            <>
              <div key={`d${di}`} className="text-right pr-2 self-center">
                {DAYS[di]}
              </div>
              {row.map((v, h) => (
                <div
                  key={`${di}-${h}`}
                  className="h-5 rounded-sm"
                  title={`${DAYS[di]} ${h}:00 — ${v}`}
                  style={{
                    background: `rgba(59,130,246, ${0.08 + (v / 100) * 0.9})`,
                  }}
                />
              ))}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
