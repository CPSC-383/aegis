import { Lightbulb, TriangleAlert, Flame, Info } from "lucide-react";

interface Props {
  variant: "tip" | "caution" | "danger" | "info";
  title: string;
  children: React.ReactNode;
}

export default function Admonition({ variant, title, children }: Props) {
  const iconMap = {
    tip: Lightbulb,
    caution: TriangleAlert,
    danger: Flame,
    info: Info,
  };

  const Icon = iconMap[variant];

  const styleMap = {
    tip: "bg-green-50/50 dark:bg-green-900/20 text-green-700 dark:text-green-200 border-green-200 dark:border-green-700",
    caution:
      "bg-yellow-50/50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700",
    danger:
      "bg-red-50/50 dark:bg-red-900/20 text-red-700 dark:text-red-200 border-red-200 dark:border-red-700",
    info: "bg-sky-50/50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-200 border-sky-200 dark:border-sky-700",
  };

  return (
    <div
      className={`my-4 rounded-lg border px-4 py-3 ${styleMap[variant]} transition-colors`}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <p className="text-base font-semibold leading-none">{title}</p>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {children}
        </div>
      </div>
    </div>
  );
}
