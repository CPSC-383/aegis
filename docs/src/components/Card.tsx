import { Link } from "react-router";

interface Props {
  title: string;
  description: string;
  link: string;
  icon?: React.ComponentType<{ className?: string }>;
}
function Card({ title, description, link, icon: Icon }: Props) {
  return (
    <Link
      to={link}
      className="block w-full cursor-pointer border border-gray-950/10 dark:border-white/10 hover:border-light-primary dark:hover:border-dark-primary rounded-xl"
    >
      <div className="p-6">
        {Icon && (
          <Icon className="text-light-primary dark:text-dark-primary h-6 w-6" />
        )}
        <div>
          <h2 className="mt-4 font-semibold text-gray-800 dark:text-white">
            {title}
          </h2>
          <div className="mt-1 text-sm font-normal">
            <p>{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default Card;
