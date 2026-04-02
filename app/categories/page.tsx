import Link from 'next/link';
import { CATEGORY_CONFIGS } from '@/lib/category-config';

export default function CategoriesPage() {
  return (
    <div className="mx-auto w-full max-w-350 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <header className="apple-surface apple-card-shadow rounded-[32px] border border-white/10 p-8 sm:p-10">
        <p className="apple-caption mb-2">Browse</p>
        <h1 className="apple-title text-4xl font-semibold sm:text-5xl">Game Categories</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Open a category to explore a focused collection with built-in filters, sort, and search.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORY_CONFIGS.map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="apple-surface rounded-3xl border border-white/10 p-6 transition-all hover:-translate-y-1 hover:border-white/25"
          >
            <p className="apple-caption mb-2">Category</p>
            <h2 className="text-2xl font-semibold tracking-tight">{category.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
