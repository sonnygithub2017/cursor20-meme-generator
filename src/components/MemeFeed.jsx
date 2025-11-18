import { useState } from 'react';
import { db } from '../lib/db';
import seedMemes from '../data/seedMemes';
import MemeCard from './MemeCard';

export default function MemeFeed() {
  const [sortBy, setSortBy] = useState('newest'); // 'newest' or 'upvotes'
  const { user } = db.useAuth();

  const query = {
    memes: {},
  };

  const { data, isLoading, error } = db.useQuery(query);

  if (isLoading) {
    return <div className="loading">Loading memes...</div>;
  }

  if (error) {
    console.error('Error loading memes:', error);
    return (
      <div className="error">
        <p>Error loading memes. Please try again.</p>
        <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>
          {error.message || JSON.stringify(error)}
        </p>
      </div>
    );
  }

  const dbMemes = data?.memes || [];
  const existingIds = new Set(dbMemes.map((m) => m.id));
  const hydratedSeedMemes = seedMemes.filter((seed) => !existingIds.has(seed.id));
  const memes = [...hydratedSeedMemes, ...dbMemes];

  // Sort memes client-side
  const sortedMemes = [...memes].sort((a, b) => {
    if (sortBy === 'upvotes') {
      return (b.upvoteCount || 0) - (a.upvoteCount || 0);
    }
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  return (
    <div className="meme-feed">
      <div className="feed-header">
        <h2 style={{ color: '#fff', marginBottom: '0' }}>Meme Feed</h2>
        <div className="feed-sort">
          <button
            className={`sort-btn ${sortBy === 'newest' ? 'active' : ''}`}
            onClick={() => setSortBy('newest')}
          >
            Newest
          </button>
          <button
            className={`sort-btn ${sortBy === 'upvotes' ? 'active' : ''}`}
            onClick={() => setSortBy('upvotes')}
          >
            Most Upvoted
          </button>
        </div>
      </div>

      {sortedMemes.length === 0 ? (
        <div className="loading" style={{ padding: '60px' }}>
          No memes yet. Be the first to post one!
        </div>
      ) : (
        <div className="meme-grid">
          {sortedMemes.map((meme) => (
            <MemeCard key={meme.id} meme={meme} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}

