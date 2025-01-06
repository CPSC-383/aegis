import { allDocs } from "content-collections";
import { notFound } from "next/navigation";
import { Mdx } from "@/mdx-components";
import ThemeToggle from "@/components/ThemeToggle";

interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

async function getDocFromParams({ params }: DocPageProps) {
  const { slug } = await params;
  const slicedSlug = slug.slice(1).join("/") || "";

  const doc = allDocs.find((doc) => {
    return doc._meta.path === slicedSlug;
  });

  if (!doc) {
    return null;
  }
  return doc;
}

export function generateStaticParams(): { slug: string[] }[] {
  return allDocs.map((doc) => ({
    slug: doc._meta.path.split("/"),
  }));
}

export default async function DocPage({ params }: DocPageProps) {
  const doc = await getDocFromParams({ params });

  if (!doc) {
    return notFound();
  }

  return (
    <main>
      <ThemeToggle />
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
    </main>
  );
}
