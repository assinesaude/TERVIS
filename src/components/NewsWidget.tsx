import { useEffect, useState } from "react";

interface NewsItem {
  title: string;
  description: string;
  link: string;
  date: string;
}

export default function NewsWidget() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/latest-healthnews`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      }
    })
      .then(r => r.json())
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl shadow-md p-6 border border-gray-200 mt-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-100 rounded"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
            <div className="h-20 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!items.length) return null;

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-6 border border-gray-200 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Últimas notícias de saúde
        </h2>
        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          HealthNews.Today
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-lg border border-gray-100 hover:bg-sky-50 hover:border-sky-200 transition-all duration-200"
          >
            <p className="font-semibold text-gray-800 mb-1 line-clamp-2">
              {item.title}
            </p>
            <p className="text-gray-600 text-sm line-clamp-2">
              {item.description}
            </p>
          </a>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-center text-xs text-gray-500">
          Conteúdo atualizado automaticamente via{" "}
          <a
            href="https://www.healthnews.today"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-600 hover:text-sky-700 font-medium"
          >
            HealthNews.Today
          </a>
        </p>
      </div>
    </div>
  );
}
