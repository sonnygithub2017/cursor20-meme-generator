import { useState } from 'react';
import { db } from './lib/db';
import Auth from './components/Auth';
import MemeGenerator from './components/MemeGenerator';
import MemeFeed from './components/MemeFeed';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('feed');
  const { user } = db.useAuth();

  return (
    <div className="container">
      <header>
        <h1>Meme Generator</h1>
      </header>

      {user && (
        <div className="user-info" style={{ maxWidth: '1600px', margin: '0 auto 24px' }}>
          <span>Signed in as: {user.email}</span>
          <button
            className="btn-logout"
            onClick={() => db.auth.signOut()}
          >
            Sign Out
          </button>
        </div>
      )}

      <div className="nav-tabs" style={{ maxWidth: '1600px', margin: '0 auto 32px' }}>
        <button
          className={`nav-tab ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          Meme Feed
        </button>
        <button
          className={`nav-tab ${activeTab === 'generator' ? 'active' : ''}`}
          onClick={() => setActiveTab('generator')}
        >
          Create Meme
        </button>
      </div>

      {activeTab === 'feed' ? (
        <MemeFeed />
      ) : !user ? (
        <Auth />
      ) : (
        <MemeGenerator />
      )}
    </div>
  );
}

export default App;

