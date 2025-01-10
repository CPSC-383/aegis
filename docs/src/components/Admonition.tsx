import { Lightbulb, TriangleAlert, Flame, Info } from "lucide-react";

interface Props {
  variant: "tip" | "caution" | "danger" | "info";
  title?: string;
  children: React.ReactNode;
}

export default function Admonition({ variant, title, children }: Props) {
  const iconMap: Record<
    string,
    React.ComponentType<React.SVGProps<SVGSVGElement>>
  > = {
    tip: Lightbulb,
    caution: TriangleAlert,
    danger: Flame,
    info: Info,
  };

  const IconComponent = iconMap[variant];

  const alertClasses = {
    tip: "border-green-400 dark:bg-green-900/30 dark:text-green-200 bg-green-50 text-green-600",
    caution:
      "border-yellow-400 dark:bg-yellow-900/30 dark:text-yellow-200 bg-yellow-50 text-yellow-600",
    danger:
      "border-red-400 dark:bg-red-900/30 dark:text-red-200 bg-red-50 text-red-600",
    info: "border-sky-400 dark:bg-sky-900/30 dark:text-sky-200 bg-sky-50 text-sky-600",
  };

  return (
    <div
      className={`my-3 rounded-md border-l-4 px-4 py-3 prose-p:my-0 ${alertClasses[variant]}`}
    >
      <div className="flex items-center gap-2 pb-2">
        <IconComponent className="h-5 w-5" aria-hidden="true" />
        <p className="text-sm font-bold">
          {title ? title.toUpperCase() : variant.toUpperCase()}
        </p>
      </div>
      <div>{children}</div>
    </div>
  );
}
