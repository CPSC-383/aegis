import { allCommonErrors } from "content-collections";
import { notFound } from "next/navigation";
import { Mdx } from "@/mdx-components";
import { getHeadings } from "@/lib/toc";
import TableOfContent from "@/components/TableOfContent";

interface Props {
  params: Promise<{
    slug: string[];
  }>;
}

async function getDocFromParams({ params }: Props) {
  const { slug } = await params;

  const entry = allCommonErrors.find((entry) => {
    return entry.slug === slug.join("/");
  });

  if (!entry) {
    return null;
  }
  return entry;
}

export function generateStaticParams(): { slug: string[] }[] {
  return allCommonErrors.map((entry) => ({
    slug: entry.slug.split("/"),
  }));
}

export default async function Page({ params }: Props) {
  const entry = await getDocFromParams({ params });

  if (!entry) {
    return notFound();
  }

  const headings = getHeadings(entry.content);
  const filteredHeadings = headings.filter((heading) => heading.level !== 3);

  return (
    <main className="flex overflow-hidden">
      <div className="flex-1 overflow-auto no-scrollbar">
        <div className="mt-8 sm:mt-12 sm:font-light">
          <h1 className="flex items-center text-[clamp(1.875rem,5vw,2.25rem)] font-bold">
            {entry.title}
          </h1>
          <h3 className="mt-2 max-sm:text-sm">{entry.description}</h3>
        </div>

        <div className="mt-8 h-[2px] w-full bg-gradient-to-r dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 from-zinc-100 via-zinc-200 to-zinc-100"></div>
        <div className="flex gap-16">
          <div className="pb-12 pt-8">
            <Mdx code={entry.mdx} />
          </div>
          <div className="w-60 shrink-0 max-lg:hidden mt-8">
            <TableOfContent
              headings={filteredHeadings}
              className="sticky top-8"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
