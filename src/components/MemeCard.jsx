import { useState } from 'react';
import { db, tx, id } from '../lib/db';

export default function MemeCard({ meme, user }) {
  const [isUpvoting, setIsUpvoting] = useState(false);
  const isSeedMeme = Boolean(meme.isSeed);
  const shouldCheckUpvotes = user && !isSeedMeme;
  const userUpvotes = db.useQuery(
    shouldCheckUpvotes
      ? {
          upvotes: {
            $: {
              where: {
                memeId: meme.id,
                userId: user.id,
              },
            },
          },
        }
      : null
  );

  const hasUpvoted = Boolean(
    shouldCheckUpvotes && userUpvotes.data?.upvotes?.length > 0
  );
  const isOwnMeme = Boolean(!isSeedMeme && user && meme.userId === user.id);

  const handleUpvote = async () => {
    if (!user || hasUpvoted || isOwnMeme || isUpvoting || isSeedMeme) return;

    setIsUpvoting(true);
    try {
      await db.transact([
        tx.upvotes[id()].update({
          memeId: meme.id,
          userId: user.id,
        }),
        tx.memes[meme.id].update({
          upvoteCount: (meme.upvoteCount || 0) + 1,
        }),
      ]);
    } catch (error) {
      console.error('Error upvoting:', error);
    } finally {
      setIsUpvoting(false);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="meme-card">
      <img src={meme.imageUrl} alt="Meme" />
      <div className="meme-card-info">
        <div className="meme-card-meta">
          {formatDate(meme.createdAt)}
          {isSeedMeme && (
            <span className="meme-card-meta-pill">Sample</span>
          )}
        </div>
        <div className="upvote-section">
          <button
            className={`upvote-btn ${hasUpvoted ? 'upvoted' : ''}`}
            onClick={handleUpvote}
            disabled={!user || hasUpvoted || isOwnMeme || isUpvoting || isSeedMeme}
            title={
              isSeedMeme
                ? 'Sample memes are read-only'
                : !user
                ? 'Sign in to upvote'
                : undefined
            }
          >
            {hasUpvoted ? '✓' : '▲'} {isUpvoting ? '...' : ''}
          </button>
          <span className="upvote-count">{meme.upvoteCount || 0}</span>
        </div>
      </div>
    </div>
  );
}

