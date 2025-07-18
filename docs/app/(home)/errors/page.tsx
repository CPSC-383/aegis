import Link from 'next/link';
import { errors } from '@/lib/source';

export default function Home() {
  const posts = errors.getPages();

  const postsByCategory = posts.reduce((acc, post) => {
    const slug = post.slugs;
    const category = slug[0] || 'uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(post);
    return acc;
  }, {} as Record<string, typeof posts>);

  return (
    <main className="grow container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Common Errors</h1>

      {Object.entries(postsByCategory).map(([category, posts]) => (
        <section key={category} className="mb-12">
          <h2 className="text-2xl font-bold mb-4 capitalize">{category}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.url}
                href={post.url}
                className="block bg-fd-secondary rounded-lg shadow-md overflow-hidden p-6"
              >
                <h3 className="text-xl font-semibold mb-2">{post.data.title}</h3>
                <p className="mb-4">{post.data.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
