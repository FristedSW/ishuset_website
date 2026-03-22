import React, { useEffect, useState } from 'react';
import { mediaAPI, MediaPost } from '../services/api';

export default function NewsFeed() {
  const [posts, setPosts] = useState<MediaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        // Only fetch posts with platform 'news'
        const data = await mediaAPI.getAll({ platform: 'news', published: true });
        setPosts(data.filter(post => post.is_published));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  return (
    <section className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Nyheder & Opdateringer</h2>
      {loading && <div>Indlæser...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && posts.length === 0 && <div>Ingen opdateringer endnu.</div>}
      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded shadow p-4">
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-lg">{post.title}</h3>
              <div className="text-sm text-gray-500">{new Date(post.publish_date).toLocaleString()}</div>
              <div>{post.content}</div>
              {post.image_url && (
                <img src={post.image_url} alt="Billede" className="mt-2 max-h-64 rounded" />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 