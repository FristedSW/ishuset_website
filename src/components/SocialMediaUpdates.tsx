import React, { useEffect, useState } from 'react';
import { Expand, X } from 'lucide-react';
import { mediaAPI, MediaPost, Locale, resolveMediaUrl } from '../services/api';
import { translate } from '../lib/site';

interface SocialMediaUpdatesProps {
  locale: Locale;
  textLookup: Record<string, Record<string, string>>;
}

function getInitialVisibleCount() {
  if (typeof window === 'undefined') return 6;
  return window.innerWidth >= 1024 ? 6 : 3;
}

export default function SocialMediaUpdates({ locale, textLookup }: SocialMediaUpdatesProps) {
  const [posts, setPosts] = useState<MediaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<MediaPost | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [initialVisibleCount, setInitialVisibleCount] = useState(getInitialVisibleCount);

  useEffect(() => {
    mediaAPI
      .getAll({ platform: 'news', published: true })
      .then((items) => {
        const safeItems = Array.isArray(items) ? items : [];
        setPosts(
          safeItems
            .filter((post) => post.is_published && post.is_featured)
            .sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime())
        );
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleResize = () => setInitialVisibleCount(getInitialVisibleCount());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading || posts.length === 0) {
    return null;
  }

  const visiblePosts = showAll ? posts : posts.slice(0, initialVisibleCount);
  const toggleCopy =
    locale === 'da'
      ? { more: 'Se flere opdateringer', less: 'Vis færre opdateringer' }
      : locale === 'de'
        ? { more: 'Mehr Updates anzeigen', less: 'Weniger Updates anzeigen' }
        : { more: 'See more updates', less: 'Show fewer updates' };

  return (
    <>
      <section className="bg-amber-50 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-serif text-4xl font-bold text-stone-900">
            {translate(textLookup, locale, 'news_title', 'Nyheder og opdateringer')}
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {visiblePosts.map((post) => (
              <article
                key={post.id}
                className={`group overflow-hidden rounded-[2rem] bg-white shadow-sm transition duration-200 ${
                  post.image_url ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : ''
                }`}
                onClick={() => {
                  if (post.image_url) {
                    setSelectedPost(post);
                  }
                }}
              >
                {post.image_url && (
                  <div className="relative h-44 overflow-hidden bg-stone-100">
                    <img
                      src={resolveMediaUrl(post.image_url)}
                      alt={post.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-stone-700 shadow-sm transition group-hover:bg-white">
                      <Expand className="h-4 w-4" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/55 to-transparent px-4 py-3 text-xs font-medium tracking-[0.15em] text-white/90">
                      {translate(textLookup, locale, 'news_expand_hint', 'Klik for at se billedet')}
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <div className="text-xs uppercase tracking-[0.2em] text-stone-400">
                    {new Date(post.publish_date).toLocaleDateString()}
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-stone-900">{post.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-stone-600">{post.content}</p>
                </div>
              </article>
            ))}
          </div>
          {posts.length > initialVisibleCount && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setShowAll((current) => !current)}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-stone-700 shadow-sm"
              >
                {showAll ? toggleCopy.less : toggleCopy.more}
              </button>
            </div>
          )}
        </div>
      </section>

      {selectedPost?.image_url && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/80 px-4 py-8"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative max-h-full w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-stone-700 shadow-sm"
              aria-label="Close image preview"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={resolveMediaUrl(selectedPost.image_url)}
              alt={selectedPost.title}
              className="max-h-[75vh] w-full object-contain bg-stone-100"
            />
            <div className="border-t border-stone-200 px-6 py-5">
              <div className="text-xs uppercase tracking-[0.2em] text-stone-400">
                {new Date(selectedPost.publish_date).toLocaleDateString()}
              </div>
              <h3 className="mt-2 text-2xl font-semibold text-stone-900">{selectedPost.title}</h3>
              <p className="mt-3 text-sm leading-7 text-stone-600">{selectedPost.content}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
