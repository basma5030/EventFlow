import React, { useState, useEffect } from 'react'; 
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventsAPI } from '../api/events';
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
  status: string;
}

const Homepage = () => {
  const { isLoggedIn, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchVenue, setSearchVenue] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const { notifications, unreadCount, markAllAsRead } = useSignalR();

  // دالة البحث المتقدم
  const performSearch = async () => {
    try {
      setIsSearching(true);
      setLoading(true);
      
      const params: any = {};
      
      // البحث من الـ Search Box العلوي - بنبحث في كل الحقول الممكنة
      if (searchTerm && searchTerm.trim()) {
        params.venue = searchTerm;
        params.category = searchTerm;
        params.title = searchTerm;  // ✅ بنضيف title عشان يبحث في العنوان برضه
      }
      
      // الفلاتر المتقدمة
      if (searchVenue && searchVenue.trim()) params.venue = searchVenue;
      if (searchCategory && searchCategory.trim()) params.category = searchCategory;
      if (searchDate) params.date = searchDate;
      
      console.log('🔍 Searching with params:', JSON.stringify(params, null, 2));
      
      // لو مفيش أي معامل بحث، نجيب كل الفعاليات
      if (Object.keys(params).length === 0) {
        const response = await eventsAPI.getAll();
        setEvents(response.data);
        console.log('📋 Fetched all events:', response.data.length);
      } else {
        const response = await eventsAPI.search(params);
        setEvents(response.data);
        console.log('📋 Search results:', response.data.length);
      }
    } catch (error) {
      console.error('❌ Error searching events:', error);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  // دالة جلب كل الفعاليات
  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getAll();
      setEvents(response.data);
      console.log('📋 Fetched all events on load:', response.data.length);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // عند تحميل الصفحة لأول مرة: نجيب كل الفعاليات
  useEffect(() => {
    fetchAllEvents();
  }, []);

  // البحث التلقائي عند تغيير أي فلتر أو search term
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, searchVenue, searchCategory, searchDate]);

  // مسح كل الفلاتر
  const clearFilters = () => {
    setSearchTerm('');
    setSearchVenue('');
    setSearchCategory('');
    setSearchDate('');
  };

  // البحث عند الضغط على Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getImageUrl = (imageUrl: string | null) => {
    if (imageUrl && imageUrl !== 'null' && imageUrl !== '') {
      return `http://localhost:55643${imageUrl}`;
    }
    return 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800';
  };

  if (loading && !isSearching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1e4e8c] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* NAVBAR */}
      <div className="bg-[#1e4e8c] text-white pb-32 shadow-2xl relative overflow-hidden">
        <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto w-full relative z-10">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl">📅</span>
            <h1 className="text-2xl font-black tracking-tighter uppercase">EventFlow</h1>
          </Link>

          <div className="flex items-center gap-5">
            {isLoggedIn && userRole === 'Organizer' && (
              <div className="flex items-center gap-3">
                <Link to="/organizer-dashboard" className="text-xs font-bold hover:underline">Dashboard</Link>
                <Link to="/create-event" className="bg-[#deff9a] text-[#1e4e8c] px-5 py-2.5 rounded-xl font-bold hover:shadow-lg transition-all text-xs uppercase tracking-tighter">
                  + Create Event
                </Link>
              </div>
            )}

            {isLoggedIn && userRole === 'Admin' && (
              <Link to="/admin" className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-600 transition">
                🛡️ Admin Panel
              </Link>
            )}

            {isLoggedIn && userRole === 'Participant' && (
              <div className="flex items-center gap-4 bg-black/10 p-1.5 rounded-2xl border border-white/5">
                <Link to="/watchlist" className="p-2 hover:bg-white/10 rounded-full transition text-xl">❤️</Link>
                
                {/* Notification Bell */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowNotifications(!showNotifications);
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
                
                <Link to="/my-tickets" className="text-[10px] font-black bg-white text-[#1e4e8c] px-4 py-2.5 rounded-xl uppercase tracking-tighter">My Tickets</Link>
              </div>
            )}

            {!isLoggedIn ? (
              <div className="flex gap-4">
                <Link to="/login" className="font-bold text-xs self-center hover:text-blue-200">Log In</Link>
                <Link to="/register" className="bg-blue-600 px-6 py-2.5 rounded-xl font-black text-xs shadow-lg uppercase">Sign Up</Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 border border-white/30 rounded-full flex items-center justify-center font-black text-xs uppercase shadow-inner">
                  {userRole?.[0]}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* HERO SECTION */}
        <div className="text-center mt-12 px-4 relative z-0">
          <h2 className="text-6xl font-black mb-4 tracking-tighter uppercase italic">Discover Events</h2>
          <p className="text-lg opacity-70 mb-10 text-blue-100 font-medium">Experience the best events happening now</p>
          
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-2 flex items-center border-8 border-white/10">
            <span className="text-gray-400 px-5 text-xl">🔍</span>
            <input 
              type="text" 
              placeholder="Search by event name, category, or venue..." 
              className="w-full py-4 outline-none text-gray-800 font-medium text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 text-[#1e4e8c] font-bold text-sm"
            >
              {showFilters ? '▲' : '▼'} Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="max-w-3xl mx-auto mt-4 bg-gray-800 rounded-2xl p-4 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white mb-1">Venue</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Cairo, London"
                    className="w-full p-2 border rounded-lg text-sm text-gray-900"
                    value={searchVenue}
                    onChange={(e) => setSearchVenue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white mb-1">Category</label>
                  <select 
                    className="w-full p-2 border rounded-lg text-sm text-gray-900"
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option>Entertainment</option>
                    <option>Technology</option>
                    <option>Business</option>
                    <option>Art</option>
                    <option>Food</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white mb-1">Date</label>
                  <input 
                    type="date" 
                    className="w-full p-2 border rounded-lg text-sm text-gray-900"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                  />
                </div>
              </div>
              <button 
                onClick={clearFilters}
                className="mt-3 text-sm text-blue-300 hover:text-blue-100 underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-12 -mt-16 w-full flex-grow relative z-20">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter border-l-8 border-[#1e4e8c] pl-4">
            {events.length} Events Available
          </h3>
        </div>
        
        {loading ? (
          <div className="text-center py-32">
            <div className="w-12 h-12 border-4 border-[#1e4e8c] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {events.map(event => (
              <div key={event.id} className="group bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row transform hover:-translate-y-2 transition-all duration-500">
                <div className="w-full md:w-2/5 h-56 md:h-auto overflow-hidden relative">
                  <img 
                    src={getImageUrl(event.imageUrl)} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <span className="absolute top-5 left-5 bg-white/90 backdrop-blur-md text-[#1e4e8c] text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest shadow-lg">
                    {event.category}
                  </span>
                  <span className={`absolute bottom-5 left-5 px-3 py-1 rounded-full text-[9px] font-black uppercase shadow-lg ${
                    event.availableTickets > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {event.availableTickets > 0 ? `${event.availableTickets} tickets left` : 'Sold Out'}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-grow md:w-3/5 justify-between">
                  <div>
                    <h4 className="font-black text-2xl text-gray-800 leading-tight mb-2">{event.title}</h4>
                    <p className="text-xs text-gray-400 font-medium mb-2">by {event.organizerName}</p>
                    <div className="space-y-2 text-gray-400 text-[11px] font-bold uppercase tracking-wider mt-4">
                      <div className="flex items-center gap-2"> 📅 {new Date(event.eventDate).toLocaleDateString()} </div>
                      <div className="flex items-center gap-2 text-[#1e4e8c]"> 📍 {event.venue} </div>
                    </div>
                  </div>
                  <div className="mt-8 flex items-center justify-between gap-4">
                    <div className="text-3xl font-black text-gray-900">${event.ticketPrice}</div>
                    <Link to={`/event/${event.id}`} className="bg-[#1e4e8c] text-white font-black py-4 px-8 rounded-2xl hover:bg-blue-700 transition-all text-xs uppercase shadow-lg shadow-blue-200">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-4 border-dashed border-gray-100">
            <p className="text-gray-300 text-2xl font-black uppercase italic tracking-widest">No Events Found</p>
            <button onClick={clearFilters} className="mt-4 text-blue-600 font-bold underline">Clear filters</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Homepage;