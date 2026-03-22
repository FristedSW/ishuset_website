import React, { useEffect, useState } from 'react';
import { mediaAPI, MediaPost, Locale } from '../services/api';
import { translate } from '../lib/site';

interface SocialMediaUpdatesProps {
  locale: Locale;
  textLookup: Record<string, Record<string, string>>;
}

export default function SocialMediaUpdates({ locale, textLookup }: SocialMediaUpdatesProps) {
  const [posts, setPosts] = useState<MediaPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mediaAPI
      .getAll({ platform: 'news', published: true })
      .then((items) => {
        const safeItems = Array.isArray(items) ? items : [];
        setPosts(
          safeItems
            .filter((post) => post.is_published && post.is_featured)
            .sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime())
            .slice(0, 3)
        );
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || posts.length === 0) {
    return null;
  }

  return (
    <section className="bg-amber-50 px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-serif text-4xl font-bold text-stone-900">
          {translate(textLookup, locale, 'news_title', 'Nyheder og opdateringer')}
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="rounded-[2rem] bg-white p-6 shadow-sm">
              <div className="text-xs uppercase tracking-[0.2em] text-stone-400">
                {new Date(post.publish_date).toLocaleDateString()}
              </div>
              <h3 className="mt-3 text-xl font-semibold text-stone-900">{post.title}</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">{post.content}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
