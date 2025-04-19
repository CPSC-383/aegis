import { allGettingStarteds } from "content-collections";
import { notFound } from "next/navigation";
import { Mdx } from "@/mdx-components";
import Sidebar from "@/components/Sidebar";
import { navConfig } from "@/config/nav";
import TableOfContent from "@/components/TableOfContent";
import { isAssignment1 } from "@/lib/utils";
import MobileNavigation from "@/components/MobileNavigation";

interface Props {
  params: Promise<{
    slug: string[];
  }>;
}

async function getDocFromParams({ params }: Props) {
  const { slug } = await params;

  const entry = allGettingStarteds.find((entry) => {
    return entry.slug === slug.join("/");
  });

  if (!entry) {
    return null;
  }
  return entry;
}

export function generateStaticParams(): { slug: string[] }[] {
  return allGettingStarteds.map((entry) => ({
    slug: entry.slug.split("/"),
  }));
}

export default async function Page({ params }: Props) {
  const entry = await getDocFromParams({ params });

  if (
    !entry ||
    (entry.assignment == "a3" && isAssignment1()) ||
    (entry.assignment == "a1" && !isAssignment1())
  ) {
    return notFound();
  }

  return (
    <>
      <MobileNavigation sidebarItems={navConfig.gettingStartedNav} />

      <div className="flex overflow-hidden gap-8 max-w-full">
        <div className="hidden lg-custom:block">
          <Sidebar items={navConfig.gettingStartedNav} />
        </div>

        <div className="flex-1 flex flex-col overflow-auto overflow-x-hidden no-scrollbar px-4 lg-custom:px-0 mt-4 lg-custom:mt-0">
          <div className="mt-6 sm:mt-12 sm:font-light">
            <h1 className="flex items-center text-2xl sm:text-[clamp(1.875rem,5vw,2.25rem)] font-bold">
              {entry.title}
            </h1>
            <h3 className="mt-2 text-sm sm:text-base">{entry.description}</h3>
          </div>
          <div className="flex gap-6 lg:gap-16">
            <div className="pb-12 pt-8 w-full">
              <Mdx code={entry.mdx} />
            </div>
            <div className="w-60 shrink-0 max-lg:hidden mt-8">
              <TableOfContent
                content={entry.content}
                className="sticky top-8"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
