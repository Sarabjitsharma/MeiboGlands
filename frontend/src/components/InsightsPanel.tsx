import { Activity, Droplet, Stethoscope, TrendingUp } from "lucide-react";

interface InsightsPanelProps {
  loading: boolean;
}

const metrics = [
  {
    icon: Activity,
    label: "Gland Visibility Score",
    value: "82",
    unit: "/100",
    delta: "Healthy range",
    tone: "success" as const,
    bar: 82,
  },
  {
    icon: Droplet,
    label: "Dropout Percentage",
    value: "13.6",
    unit: "%",
    delta: "Mild atrophy",
    tone: "warning" as const,
    bar: 14,
  },
  {
    icon: TrendingUp,
    label: "Tortuosity Index",
    value: "0.21",
    unit: "",
    delta: "Within normal",
    tone: "primary" as const,
    bar: 21,
  },
];

export const InsightsPanel = ({ loading }: InsightsPanelProps) => {
  return (
    <section className="mt-8 animate-fade-up">
      <div className="mb-5">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          Step 3 — Clinical insights
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Analysis Insights
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Quantitative metrics derived from gland segmentation.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} loading={loading} />
        ))}
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-gradient-card p-6 shadow-card">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft">
            <Stethoscope className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">
              Preliminary Observation
            </h3>
            {loading ? (
              <div className="mt-2 space-y-2">
                <div className="h-3 w-full animate-pulse-soft rounded bg-muted" />
                <div className="h-3 w-5/6 animate-pulse-soft rounded bg-muted" />
                <div className="h-3 w-2/3 animate-pulse-soft rounded bg-muted" />
              </div>
            ) : (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Gland morphology appears largely preserved with{" "}
                <span className="font-semibold text-foreground">mild focal dropout</span>{" "}
                in the temporal region. Visibility score is within healthy clinical
                range. Consider routine follow-up in 6 months and monitor for symptoms
                of evaporative dry eye.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit: string;
  delta: string;
  tone: "success" | "warning" | "primary";
  bar: number;
  loading: boolean;
}

const toneMap = {
  success: { text: "text-success", bg: "bg-success", soft: "bg-success/10" },
  warning: { text: "text-warning", bg: "bg-warning", soft: "bg-warning/10" },
  primary: { text: "text-primary", bg: "bg-primary", soft: "bg-primary-soft" },
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
  unit,
  delta,
  tone,
  bar,
  loading,
}: MetricCardProps) => {
  const t = toneMap[tone];
  return (
    <div className="rounded-3xl border border-border bg-gradient-card p-5 shadow-card transition-shadow hover:shadow-elevated">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.soft}`}>
          <Icon className={`h-5 w-5 ${t.text}`} />
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${t.soft} ${t.text}`}>
          {delta}
        </span>
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 flex items-baseline gap-1">
        {loading ? (
          <div className="h-8 w-20 animate-pulse-soft rounded bg-muted" />
        ) : (
          <>
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </span>
            <span className="text-sm font-medium text-muted-foreground">{unit}</span>
          </>
        )}
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full ${t.bg} transition-all duration-700`}
          style={{ width: loading ? "0%" : `${bar}%` }}
        />
      </div>
    </div>
  );
};
