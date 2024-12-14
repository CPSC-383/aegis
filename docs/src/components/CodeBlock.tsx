import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  nord,
  materialLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Clipboard, Check } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

interface Props {
  language: string;
  children: string;
}

function CodeBlock({ language, children }: Props) {
  const { isDarkMode } = useTheme();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setIsCopied(true);

      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="relative group">
      <SyntaxHighlighter
        language={language}
        style={isDarkMode ? nord : materialLight}
        customStyle={{
          background: isDarkMode ? "#0F1117" : "#f3f4f6",
          border: "none",
          padding: "1rem",
          paddingRight: "3rem",
        }}
        codeTagProps={{
          style: {
            color: isDarkMode ? "#ECEFF4" : "#2E3440",
            fontSize: "0.875rem",
          },
        }}
      >
        {children}
      </SyntaxHighlighter>
      <button
        onClick={handleCopy}
        className={`absolute top-2 right-2 p-1 rounded-md transition-all duration-200 ${
          isDarkMode
            ? isCopied
              ? "bg-green-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 opacity-0 group-hover:opacity-100"
            : isCopied
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300 opacity-0 group-hover:opacity-100"
        }`}
      >
        {isCopied ? <Check size={16} /> : <Clipboard size={16} />}
      </button>
    </div>
  );
}

export default CodeBlock;
