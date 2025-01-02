import { ReactNode } from "react";

interface ListItem {
  title: string;
  description?: ReactNode;
}

interface Props {
  items: ListItem[];
  type?: "ordered" | "unordered";
}

function List({ items, type = "unordered" }: Props) {
  return (
    <div className="mt-8">
      {items.map((item, index) => (
        <div
          key={index}
          className="relative pl-10 pb-8 border-l border-gray-200 dark:border-gray-800 last:border-l-0"
        >
          <div
            className="absolute left-0 top-0 w-8 h-8 flex items-center justify-center 
                       bg-light-background text-light-primary dark:bg-dark-background dark:text-dark-primary rounded-full -ml-4 font-bold"
          >
            {type === "ordered" ? (
              <span className="text-sm font-bold">{index + 1}</span>
            ) : (
              <div className="w-3 h-3 bg-light-primary dark:bg-dark-primary rounded-full"></div>
            )}
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white">
              {item.title}
            </div>
            {item.description && (
              <div className="text-gray-600 dark:text-gray-300">
                {item.description}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default List;
