import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { watchlistAPI } from '../api/watchlist';
import { useAuth } from '../context/AuthContext';

interface WatchlistEvent {
  id: number;
  title: string;
  venue: string;
  eventDate: string;
  ticketPrice: number;
  imageUrl: string | null;
  organizerName: string;
}

const Watchlist = () => {
  const { isLoggedIn } = useAuth();
  const [events, setEvents] = useState<WatchlistEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      fetchWatchlist();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const response = await watchlistAPI.getMyWatchlist();
      setEvents(response.data);
    } catch (err: any) {
      console.error('Error fetching watchlist:', err);
      setError(err.response?.data?.message || 'Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (eventId: number) => {
    try {
      await watchlistAPI.remove(eventId);
      setEvents(events.filter(e => e.id !== eventId));
      alert('Removed from watchlist');
    } catch (err: any) {
      console.error('Error removing from watchlist:', err);
      alert(err.response?.data?.message || 'Failed to remove');
    }
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (imageUrl && imageUrl !== 'null' && imageUrl !== '') {
      return `http://localhost:55643${imageUrl}`;
    }
    return 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading your watchlist...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <nav className="p-6 bg-[#1e4e8c] text-white flex justify-between items-center mb-10">
        <Link to="/" className="font-bold text-2xl">📅 EventFlow</Link>
        <Link to="/" className="text-sm bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition">
          Back to Explore
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-4xl font-black text-gray-900 mb-8 uppercase tracking-tighter italic">
          My Watchlist ❤️
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-600 rounded-xl">
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-gray-100">
            <p className="text-gray-400 text-xl font-medium italic">
              Your watchlist is empty. Go find some events!
            </p>
            <Link to="/" className="text-[#1e4e8c] font-bold underline mt-4 inline-block">
              Explore Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden flex transform hover:scale-[1.02] transition-all">
                <img 
                  src={getImageUrl(event.imageUrl)} 
                  className="w-1/3 object-cover" 
                  alt={event.title}
                />
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <h4 className="font-bold text-xl text-gray-800 mb-1">{event.title}</h4>
                    <p className="text-xs text-gray-400 font-bold mb-2">by {event.organizerName}</p>
                    <p className="text-xs text-gray-500">📍 {event.venue}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      📅 {new Date(event.eventDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-black text-[#1e4e8c] text-lg">${event.ticketPrice}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => removeFromWatchlist(event.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold"
                      >
                        Remove
                      </button>
                      <Link 
                        to={`/event/${event.id}`} 
                        className="text-blue-600 font-bold text-sm hover:underline"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;