import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventsAPI } from '../api/events';
import { ticketsAPI } from '../api/tickets';
import { watchlistAPI } from '../api/watchlist';
import { reviewsAPI } from '../api/reviews';
import { useSignalR } from '../hooks/useSignalR';

interface Event {
  id: number;
  organizerName: string;
  title: string;
  description: string;
  venue: string;
  category: string;
  eventDate: string;
  ticketPrice: number;
  totalTickets: number;
  availableTickets: number;
  imageUrl: string | null;
  attachmentUrl: string | null;
  status: string;
}

interface Material {
  id: number;
  filePath: string;
  originalName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
}

interface Review {
  id: number;
  eventId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

interface EventWithMaterials {
  event: Event;
  materials: Material[];
}

const EventDetails = () => {
  const { id } = useParams();
  const { isLoggedIn, userRole } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasPurchasedTicket, setHasPurchasedTicket] = useState(false);

  // SignalR for notifications
  const { notifications, unreadCount, markAllAsRead } = useSignalR();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await eventsAPI.getEventWithMaterials(Number(id));
        const data: EventWithMaterials = response.data;
        setEvent(data.event);
        setMaterials(data.materials);
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Event not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  useEffect(() => {
    if (isLoggedIn && id) {
      checkWatchlistStatus();
    }
  }, [isLoggedIn, id]);

  useEffect(() => {
    if (id) {
      fetchReviews();
      if (isLoggedIn && userRole === 'Participant') {
        checkIfUserPurchased();
      }
    }
  }, [id, isLoggedIn]);

  const deleteMaterial = async (materialId: number) => {
    if (!confirm('Are you sure you want to delete this material?')) return;
    
    try {
      await eventsAPI.deleteMaterial(Number(id), materialId);
      setMaterials(materials.filter(m => m.id !== materialId));
      alert('Material deleted successfully');
    } catch (err) {
      console.error('Error deleting material:', err);
      alert('Failed to delete material');
    }
  };

  const checkWatchlistStatus = async () => {
    try {
      const response = await watchlistAPI.checkStatus(Number(id));
      setIsWatchlisted(response.data.saved);
    } catch (err) {
      console.error('Error checking watchlist status:', err);
    }
  };

  const toggleWatchlist = async () => {
    if (!isLoggedIn) {
      alert('Please login to save events to watchlist');
      return;
    }
    
    setWatchlistLoading(true);
    try {
      if (isWatchlisted) {
        await watchlistAPI.remove(Number(id));
        setIsWatchlisted(false);
        alert('Removed from watchlist');
      } else {
        await watchlistAPI.add(Number(id));
        setIsWatchlisted(true);
        alert('Added to watchlist');
      }
    } catch (err: any) {
      console.error('Error toggling watchlist:', err);
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setWatchlistLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await reviewsAPI.getEventReviews(Number(id));
      setReviews(response.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const checkIfUserPurchased = async () => {
    try {
      const response = await ticketsAPI.getMyTickets();
      const userTickets = response.data;
      const hasTicket = userTickets.some((ticket: any) => ticket.eventId === Number(id));
      setHasPurchasedTicket(hasTicket);
    } catch (err) {
      console.error('Error checking tickets:', err);
    }
  };

  const submitReview = async () => {
    if (!newComment.trim()) {
      alert('Please write a comment');
      return;
    }
    
    setSubmittingReview(true);
    try {
      await reviewsAPI.add(Number(id), {
        rating: newRating,
        comment: newComment
      });
      alert('Review submitted successfully!');
      setShowReviewModal(false);
      setNewComment('');
      setNewRating(5);
      fetchReviews();
    } catch (err: any) {
      console.error('Error submitting review:', err);
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handlePurchase = async () => {
    if (!isLoggedIn) {
      alert('Please login to purchase tickets');
      return;
    }

    setPurchasing(true);
    try {
      const response = await ticketsAPI.purchase(Number(id));
      alert('🎉 Order Confirmed! Check your email for your ticket.');
      
      if (event) {
        setEvent({
          ...event,
          availableTickets: event.availableTickets - 1
        });
      }
      
      setIsModalOpen(false);
      setTimeout(() => {
        checkIfUserPurchased();
      }, 1000);
    } catch (err: any) {
      console.error('Purchase error:', err);
      alert(err.response?.data?.message || 'Failed to purchase ticket');
    } finally {
      setPurchasing(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setNewRating(star)}
            className={`text-2xl ${interactive ? 'cursor-pointer' : 'cursor-default'} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl || imageUrl === 'null' || imageUrl === '' || imageUrl === 'string') {
      return 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800';
    }
    if (imageUrl.startsWith('/uploads')) {
      return `http://localhost:55643${imageUrl}`;
    }
    return imageUrl;
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const shareEvent = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: `Check out this event: ${event?.title}`,
        url: window.location.href,
      }).catch(() => console.log('Share cancelled'));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading event details...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Event not found!</h2>
          <Link to="/" className="text-blue-600 mt-4 inline-block">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <nav className="p-6 border-b flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-[#1e4e8c] font-bold text-2xl">
          📅 EventFlow
        </Link>
        <div className="flex gap-4 items-center">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="text-gray-600 hover:text-black font-medium">Log In</Link>
              <Link to="/register" className="bg-[#1e4e8c] text-white px-6 py-2 rounded-md font-bold">Sign Up</Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {/* Watchlist Heart */}
              {isLoggedIn && userRole === 'Participant' && (
                <Link to="/watchlist" className="text-xl hover:opacity-80 transition">❤️</Link>
              )}
              
              {/* Notification Bell - Only for Participants */}
              {isLoggedIn && userRole === 'Participant' && (
                <div className="relative">
  <button 
    onClick={() => {
      setShowNotifications(!showNotifications);
      // النقطة تختفي أول ما أفتح القائمة
      if (!showNotifications && unreadCount > 0) {
        markAllAsRead();
      }
    }}
    className="p-2 hover:bg-white/10 rounded-full transition text-xl relative"
  >
    🔔
    {unreadCount > 0 && (
      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
    )}
  </button>

  {showNotifications && (
    <div className="absolute left-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[9999] text-gray-800 max-h-96 overflow-y-auto">
      <div className="p-3 bg-gray-50 border-b flex justify-between items-center sticky top-0">
        <span className="text-xs font-bold text-gray-400">
          🔔 Notifications ({notifications.length})
        </span>
        {notifications.length > 0 && (
          <button 
            onClick={() => {
              markAllAsRead();
              // عشان النقطة تروح فوراً
              setShowNotifications(false);
            }}
            className="text-xs text-blue-500 hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div className="p-6 text-center text-gray-400 text-sm">No notifications yet</div>
      ) : (
        notifications.map((notif, idx) => (
          <div 
            key={idx} 
            className={`p-3 border-b hover:bg-blue-50 transition ${!notif.isRead ? 'bg-blue-50/50' : ''}`}
          >
            <p className="text-sm text-gray-800">{notif.message}</p>
            <p className="text-[10px] text-gray-400 mt-1">
              {new Date(notif.createdAt).toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  )}
</div>
              )}
              
              <div className="w-10 h-10 bg-[#1e4e8c] text-white rounded-full flex items-center justify-center font-bold">
                {userRole?.[0]}
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
        <div className="lg:col-span-2">
          <span className="bg-[#1e4e8c] text-white text-xs px-4 py-1.5 rounded-full font-bold mb-4 inline-block">
            {event.category}
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">{event.title}</h2>
          <p className="text-gray-500 mb-8">Organized by {event.organizerName}</p>

          <div className="mb-8 rounded-2xl overflow-hidden">
            <img 
              src={getImageUrl(event.imageUrl)} 
              alt={event.title}
              className="w-full h-96 object-cover rounded-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800';
              }}
            />
          </div>

          <div className="flex flex-wrap gap-8 text-gray-600 mb-10 text-sm border-b pb-8">
            <div className="flex items-center gap-2">📅 {new Date(event.eventDate).toLocaleDateString()}</div>
            <div className="flex items-center gap-2">📍 {event.venue}</div>
            <div className="flex items-center gap-2">
              🎟️ {event.availableTickets} / {event.totalTickets} tickets left
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">About This Event</h3>
            <p className="text-gray-600 leading-relaxed text-lg">{event.description}</p>
          </div>

          {materials && materials.length > 0 && (
            <div className="mb-12 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                📎 Event Materials ({materials.length})
              </h4>
              <div className="space-y-2">
                {materials.map((material) => (
                  <div key={material.id} className="flex items-center justify-between">
                    <a 
                      href={`http://localhost:55643${material.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[#1e4e8c] hover:underline"
                    >
                      📄 {material.originalName}
                    </a>
                    {userRole === 'Organizer' && (
                      <button
                        onClick={() => deleteMaterial(material.id)}
                        className="text-red-500 hover:text-red-700 text-sm px-2"
                        title="Delete material"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-10">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Reviews & Ratings</h3>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(Number(averageRating))}
                    <span className="text-sm text-gray-500">({averageRating} out of 5)</span>
                  </div>
                )}
              </div>
              {isLoggedIn && userRole === 'Participant' && hasPurchasedTicket && (
                <button 
                  onClick={() => setShowReviewModal(true)}
                  className="bg-[#1e4e8c]/10 text-[#1e4e8c] px-6 py-2 rounded-xl font-bold hover:bg-[#1e4e8c] hover:text-white transition"
                >
                  Write a Review
                </button>
              )}
            </div>

            {reviewsLoading ? (
              <div className="text-center py-16">
                <p className="text-gray-400">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                <p className="text-gray-400 text-lg">No reviews yet. Be the first to review this event!</p>
                {!hasPurchasedTicket && isLoggedIn && userRole === 'Participant' && (
                  <p className="text-sm text-gray-400 mt-2">Buy a ticket to leave a review</p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                      {renderStars(review.rating)}
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 shadow-2xl rounded-[32px] p-8 sticky top-10">
            <p className="text-gray-400 text-sm font-medium mb-1">Price</p>
            <h4 className="text-5xl font-extrabold text-gray-900 mb-8">${event.ticketPrice}</h4>
            
            <div className="space-y-4">
              {isLoggedIn && userRole === 'Participant' && event.availableTickets > 0 ? (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-[#1e4e8c] text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-blue-800 transition-all transform active:scale-95"
                >
                  Buy Ticket
                </button>
              ) : (userRole === 'Organizer' || userRole === 'Admin') ? (
                <button 
                  disabled
                  className={`w-full font-bold py-4 rounded-2xl cursor-not-allowed ${
                    event.availableTickets > 0 
                      ? 'bg-blue-100 text-blue-600 border border-blue-200' 
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {event.availableTickets > 0 ? 'On Sale' : 'Sold Out'}
                </button>
              ) : (
                <button 
                  disabled
                  className="w-full bg-gray-300 text-gray-500 font-bold py-4 rounded-2xl cursor-not-allowed"
                >
                  {!isLoggedIn ? 'Login to Purchase' : 'Sold Out'}
                </button>
              )}
              
              {isLoggedIn && userRole === 'Participant' && (
                <button 
                  onClick={toggleWatchlist}
                  disabled={watchlistLoading}
                  className={`w-full flex items-center justify-center gap-2 border font-bold py-4 rounded-2xl transition ${
                    isWatchlisted 
                      ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {watchlistLoading ? 'Loading...' : (isWatchlisted ? '❤️ Saved to Watchlist' : '♡ Add to Wishlist')}
                </button>
              )}
              
              <button 
                onClick={shareEvent}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-50 transition"
              >
                📤 Share Event
              </button>
            </div>

            <div className="mt-8 pt-6 border-t">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">Availability</span>
                <span className={`font-bold text-sm ${event.availableTickets > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {event.availableTickets > 0 ? `${event.availableTickets} tickets left` : 'Sold Out'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-white rounded-[28px] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">Confirm Purchase</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black text-3xl leading-none">&times;</button>
            </div>
            <div className="p-8 space-y-6">
              <p className="text-gray-500 leading-relaxed">
                You are about to purchase a ticket for <span className="font-bold text-gray-800">{event.title}</span>
              </p>
              <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-start gap-4 text-sm">
                  <span className="text-gray-400 font-medium">Event:</span>
                  <span className="font-bold text-right text-gray-800">{event.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Date:</span>
                  <span className="font-bold text-gray-800">{new Date(event.eventDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-medium">Venue:</span>
                  <span className="font-bold text-gray-800">{event.venue}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-4 mt-2">
                  <span className="text-gray-400 font-bold">Price:</span>
                  <span className="font-black text-[#1e4e8c] text-xl">${event.ticketPrice}</span>
                </div>
              </div>
            </div>
            <div className="p-8 bg-gray-50 flex gap-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-200 rounded-2xl transition"
              >
                Cancel
              </button>
              <button 
                onClick={handlePurchase}
                disabled={purchasing}
                className="flex-1 py-4 bg-[#1e4e8c] text-white font-bold rounded-2xl shadow-lg hover:bg-blue-800 transition-all disabled:opacity-50"
              >
                {purchasing ? 'Processing...' : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowReviewModal(false)}
          />
          <div className="relative bg-white rounded-[28px] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-8 border-b">
              <h3 className="text-2xl font-bold text-gray-800">Write a Review</h3>
              <p className="text-gray-500 text-sm mt-1">Share your experience with others</p>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                {renderStars(newRating, true)}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Comment</label>
                <textarea
                  rows={4}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#1e4e8c] outline-none"
                  placeholder="Tell us what you thought about this event..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </div>
            </div>
            <div className="p-8 bg-gray-50 flex gap-4">
              <button 
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-200 rounded-2xl transition"
              >
                Cancel
              </button>
              <button 
                onClick={submitReview}
                disabled={submittingReview}
                className="flex-1 py-4 bg-[#1e4e8c] text-white font-bold rounded-2xl hover:bg-blue-800 transition disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
