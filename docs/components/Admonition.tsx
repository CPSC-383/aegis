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
    tip: "bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-200",
    caution: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-900 dark:text-yellow-200",
    danger: "bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200",
    info: "bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200",
  };

  return (
    <div className={`my-6 border ${styleMap[variant]}`}>
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mt-2">
          <Icon className="h-5 w-5 flex-shrink-0" />
          <p className="uppercase tracking-wider leading-none">
            {title}
          </p>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="text-foreground dark:text-foreground">
          {children}
        </div>
      </div>
    </div>
  );
}
