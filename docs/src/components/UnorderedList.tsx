import { ReactNode } from "react";

interface OrderedListItem {
  title: string;
  description?: ReactNode;
}

interface Props {
  items: OrderedListItem[];
}

function UnorderedList({ items }: Props) {
  return (
    <ol className="mt-8">
      {items.map((item, index) => (
        <li
          key={index}
          className="relative pl-10 pb-8 border-l border-gray-200 dark:border-gray-800 last:border-l-0"
        >
          <div
            className="absolute left-0 top-0 w-8 h-8 flex items-center justify-center 
                       bg-light-background text-light-primary dark:bg-dark-background dark:text-dark-primary rounded-full -ml-4 font-bold"
          >
            <div className="w-2.5 h-2.5 bg-light-primary dark:bg-dark-primary rounded-full"></div>
          </div>
          <div className="text-lg font-semibold text-gray-800 dark:text-white">
            {item.title}
          </div>
          <div className="text-gray-600 dark:text-gray-300">
            {item.description && item.description}
          </div>
        </li>
      ))}
    </ol>
  );
}

export default UnorderedList;
