import { allGettingStarteds } from "content-collections";
import { navConfig } from "@/config/nav";
import { notFound } from "next/navigation";
import { Mdx } from "@/mdx-components";
import Sidebar from "@/components/Sidebar";

interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

async function getDocFromParams({ params }: DocPageProps) {
  const { slug } = await params;

  const doc = allGettingStarteds.find((doc) => {
    return doc.slug === slug.join("/");
  });

  if (!doc) {
    return null;
  }
  return doc;
}

export function generateStaticParams(): { slug: string[] }[] {
  return allGettingStarteds.map((doc) => ({
    slug: doc.slug.split("/"),
  }));
}

export default async function DocPage({ params }: DocPageProps) {
  const doc = await getDocFromParams({ params });

  if (!doc) {
    return notFound();
  }

  return (
    <main className="flex overflow-hidden">
      <Sidebar items={navConfig.gettingStartedNav} />
      <div className="flex-1 overflow-auto no-scrollbar">
        <div className="mt-8 sm:mt-12 sm:font-light">
          <h1 className="flex items-center text-[clamp(1.875rem,5vw,2.25rem)] font-bold">
            {doc.title}
          </h1>
          <h3 className="mt-2 max-sm:text-sm">{doc.description}</h3>
        </div>

        <div className="mt-8 h-[2px] w-full bg-gradient-to-r dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 from-zinc-100 via-zinc-200 to-zinc-100"></div>
        <div className="pb-12 pt-8">
          <Mdx code={doc.mdx} />
        </div>
      </div>
    </main>
  );
}
