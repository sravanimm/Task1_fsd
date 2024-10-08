import React, { useEffect, useState, useRef, useCallback } from 'react';
import ArticleCard from '../components/ArticleCard';
import LoadingSpinner from '../components/LoadingSpinner';

const JewelryFeed = () => {
  const [articles, setArticles] = useState([]);
  const [after, setAfter] = useState(''); // Reddit pagination uses 'after' for paging
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const fetchArticles = useCallback(async () => {
    if (loading) return; // Prevent multiple fetches
    setLoading(true);
    console.log('Fetching Reddit jewelry posts...');

    try {
      const url = `https://www.reddit.com/r/jewelry.json?limit=10&after=${after}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.data) {
        const newArticles = data.data.children.map((child) => ({
          title: child.data.title,
          description: child.data.selftext || 'No description available.',
          url: child.data.url,
        }));

        setArticles((prevArticles) => [...prevArticles, ...newArticles]);
        setAfter(data.data.after); // Update 'after' for pagination
        setHasMore(data.data.after !== null); // If 'after' is null, no more posts
      } else {
        setHasMore(false);
        console.error('Error fetching data from Reddit:', data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [after, loading]);

  useEffect(() => {
    if (hasMore) {
      fetchArticles();
    }
  }, [fetchArticles, hasMore]);

  const lastArticleElementRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          console.log('Last element in view, loading more...');
          setAfter((prevAfter) => prevAfter); // Trigger fetching next set of posts
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <div className="jewelry-feed">
      {articles.map((article, index) => {
        if (articles.length === index + 1) {
          return (
            <div ref={lastArticleElementRef} key={article.url}>
              <ArticleCard
                title={article.title}
                description={article.description}
              />
            </div>
          );
        } else {
          return (
            <ArticleCard
              key={article.url}
              title={article.title}
              description={article.description}
            />
          );
        }
      })}
      {loading && <LoadingSpinner />}
      {!hasMore && <div>No more posts to load.</div>}
    </div>
  );
};

export default JewelryFeed;