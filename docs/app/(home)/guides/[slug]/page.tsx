import { notFound } from 'next/navigation';
import Link from 'next/link';
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { guides } from '@/lib/source';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';


export default async function Page(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const page = guides.getPage([params.slug]);

  if (!page) notFound();
  const Mdx = page.data.body;

  return (
    <>
      <div className="container rounded-xl py-12 md:px-8">
        <h1 className="mb-2 text-3xl font-bold">{page.data.title}</h1>
        <p className="mb-2 text-fd-muted-foreground">{page.data.description}</p>
        <p className="mb-4 text-sm text-fd-muted-foreground">
          Written by <span className="font-medium text-white">{page.data.author}</span>
        </p>
        <Link
          href="/guides"
          className={buttonVariants({ size: 'sm', color: 'secondary' })}
        >Back</Link>
      </div>
      <article className="container flex flex-col px-0 py-8 lg:flex-row lg:px-4">
        <div className="prose min-w-0 flex-1 p-4">
          <InlineTOC items={page.data.toc} />
          <Mdx components={defaultMdxComponents} />
        </div>
      </article>
    </>
  );
}

export function generateStaticParams(): { slug: string }[] {
  return guides.getPages().map((page) => ({
    slug: page.slugs[0],
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const page = guides.getPage([params.slug]);

  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
