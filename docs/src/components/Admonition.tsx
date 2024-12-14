import React from "react";
import {
  Info,
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

type AdmonitionType = "info" | "tip" | "warning" | "danger" | "success";

interface Props {
  type: AdmonitionType;
  title?: string;
  children: React.ReactNode;
}

function Admonition({ type, title, children }: Props) {
  const baseStyles = "border-l-4 p-4 rounded-md mb-4 shadow-sm flex flex-col";

  const typeStyles = {
    info: {
      border: "border-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/30",
      text: "text-blue-800 dark:text-blue-200",
      iconBg: "bg-blue-100 dark:bg-blue-800",
      iconColor: "text-blue-500 dark:text-blue-400",
    },
    tip: {
      border: "border-green-500",
      bg: "bg-green-50 dark:bg-green-900/30",
      text: "text-green-800 dark:text-green-200",
      iconBg: "bg-green-100 dark:bg-green-800",
      iconColor: "text-green-500 dark:text-green-400",
    },
    warning: {
      border: "border-yellow-500",
      bg: "bg-yellow-50 dark:bg-yellow-900/30",
      text: "text-yellow-800 dark:text-yellow-200",
      iconBg: "bg-yellow-100 dark:bg-yellow-800",
      iconColor: "text-yellow-500 dark:text-yellow-400",
    },
    danger: {
      border: "border-red-500",
      bg: "bg-red-50 dark:bg-red-900/30",
      text: "text-red-800 dark:text-red-200",
      iconBg: "bg-red-100 dark:bg-red-800",
      iconColor: "text-red-500 dark:text-red-400",
    },
    success: {
      border: "border-teal-500",
      bg: "bg-teal-50 dark:bg-teal-900/30",
      text: "text-teal-800 dark:text-teal-200",
      iconBg: "bg-teal-100 dark:bg-teal-800",
      iconColor: "text-teal-500 dark:text-teal-400",
    },
  };

  const icons = {
    info: <Info className={`w-5 h-5 ${typeStyles[type].iconColor}`} />,
    tip: <Lightbulb className={`w-5 h-5 ${typeStyles[type].iconColor}`} />,
    warning: (
      <AlertTriangle className={`w-5 h-5 ${typeStyles[type].iconColor}`} />
    ),
    danger: <AlertCircle className={`w-5 h-5 ${typeStyles[type].iconColor}`} />,
    success: (
      <CheckCircle className={`w-5 h-5 ${typeStyles[type].iconColor}`} />
    ),
  };

  const { border, bg, text, iconBg } = typeStyles[type];

  return (
    <div className={`${baseStyles} ${border} ${bg} ${text}`}>
      <div className="flex items-center">
        <div className={`p-2 rounded-full mr-3 ${iconBg}`}>{icons[type]}</div>
        {title && <h3 className="font-semibold">{title}</h3>}
      </div>
      <div className="text-sm mt-2 pl-11">{children}</div>
    </div>
  );
}

export default Admonition;
