import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../api/events';
import { useAuth } from '../context/AuthContext';

interface Event {
  id: number;
  title: string;
  description: string;
  venue: string;
  category: string;
  eventDate: string;
  ticketPrice: number;
  totalTickets: number;
  availableTickets: number;
  status: string;
  imageUrl: string | null;
  rejectionReason?: string;
}

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalSold: 0,
    totalRevenue: 0,
  });

  // Upload Materials States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getMyEvents();
      const events = response.data;
      setMyEvents(events);
      
      let sold = 0;
      let revenue = 0;
      
      events.forEach((event: Event) => {
        const ticketsSold = event.totalTickets - event.availableTickets;
        sold += ticketsSold;
        revenue += ticketsSold * event.ticketPrice;
      });
      
      setStats({
        totalEvents: events.length,
        totalSold: sold,
        totalRevenue: revenue,
      });
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await eventsAPI.delete(id);
        setMyEvents(myEvents.filter(ev => ev.id !== id));
        alert('Event deleted successfully');
      } catch (err: any) {
        console.error('Error deleting event:', err);
        alert(err.response?.data?.message || 'Failed to delete event');
      }
    }
  };

  const openUploadModal = (eventId: number) => {
    setSelectedEventId(eventId);
    setAttachmentFile(null);
    setShowUploadModal(true);
  };

  const uploadMaterial = async () => {
    if (!selectedEventId || !attachmentFile) {
      alert('Please select an event and a file');
      return;
    }
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('attachment', attachmentFile);
      
      // using the right method to upload materials
      
      await eventsAPI.uploadMaterial(selectedEventId, formData);
      alert('Material uploaded successfully!');
      setShowUploadModal(false);
      setAttachmentFile(null);
      // Refresh the events list
      fetchMyEvents();
    } catch (err: any) {
      console.error('Error uploading material:', err);
      alert(err.response?.data?.message || 'Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-72 bg-[#1e4e8c] text-white p-8 flex flex-col">
        <h2 className="text-2xl font-black mb-10 tracking-tighter uppercase italic">Organizer Pro</h2>
        <nav className="space-y-4 flex-grow">
          <button className="w-full text-left bg-white/20 p-4 rounded-2xl font-bold border-l-4 border-[#deff9a]">📊 Overview</button>
          <Link to="/create-event" className="block w-full text-left hover:bg-white/10 p-4 rounded-2xl font-medium transition">➕ Create New</Link>
          
        </nav>
        <div className="mt-auto pt-6 border-t border-white/10">
          <p className="text-xs text-blue-200">Logged in as:</p>
          <p className="font-bold">{user?.username || 'Organizer'}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 md:p-12">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Event Analytics</h1>
            <p className="text-gray-400 font-medium">Real-time performance of your events</p>
          </div>
          <Link to="/" className="text-[#1e4e8c] font-bold border-2 border-[#1e4e8c] px-6 py-2 rounded-xl hover:bg-[#1e4e8c] hover:text-white transition">
            Exit to Site
          </Link>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Total Events</p>
            <h3 className="text-4xl font-black text-gray-900">{stats.totalEvents}</h3>
            <p className="text-blue-500 text-xs font-bold mt-2">Your active events</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tickets Sold</p>
            <h3 className="text-4xl font-black text-gray-900">{stats.totalSold}</h3>
            <p className="text-green-500 text-xs font-bold mt-2">Overall sales</p>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Total Revenue</p>
            <h3 className="text-4xl font-black text-gray-900">${stats.totalRevenue.toLocaleString()}</h3>
            <p className="text-green-500 text-xs font-bold mt-2">From tickets sold</p>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Your Event Portfolio</h3>
            
          </div>
          
          {myEvents.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No events yet. Click "Create New" to add your first event!
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b">
                  <th className="p-8">Event Details</th>
                  <th className="p-8">Sales Velocity</th>
                  <th className="p-8">Status</th>
                  <th className="p-8 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {myEvents.map((event) => {
                  const sold = event.totalTickets - event.availableTickets;
                  const percent = (sold / event.totalTickets) * 100;
                  return (
                    <tr key={event.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-8">
                        <p className="font-black text-gray-800 text-lg">{event.title}</p>
                        <p className="text-xs text-gray-400 font-medium">ID: #EV-{event.id}</p>
                      </td>
                      <td className="p-8">
                        <div className="w-full bg-gray-100 h-2 rounded-full mb-2 max-w-[150px]">
                          <div 
                            className="bg-[#1e4e8c] h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <p className="text-xs font-bold text-gray-600">{sold} / {event.totalTickets} Tickets sold</p>
                      </td>
                      {/* ✅ التعديل هنا */}
                      <td className="p-8">
                        <div className="flex flex-col gap-1">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter text-center ${
                            event.status === 'approved' ? 'bg-green-100 text-green-600' :
                            event.status === 'rejected' ? 'bg-red-100 text-red-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            {event.status === 'approved' ? '✅ Accepted' :
                             event.status === 'rejected' ? '❌ Rejected' :
                             '⏳ Pending Approval'}
                          </span>
                          {event.status === 'rejected' && event.rejectionReason && (
                            <p className="text-[10px] text-red-500 text-center italic">
                              Reason: {event.rejectionReason}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex justify-center gap-2">
                          <Link 
                            to={`/edit-event/${event.id}`}
                            className="p-3 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-600 hover:text-white transition shadow-sm"
                            title="Edit Event"
                          >
                            ✏️
                          </Link>
                          <Link 
                            to={`/event/${event.id}`}
                            className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition shadow-sm"
                            title="View Event"
                          >
                            👁️
                          </Link>
                          <button 
                            onClick={() => openUploadModal(event.id)}
                            className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition shadow-sm"
                            title="Upload Materials"
                          >
                            📎
                          </button>
                          <button 
                            onClick={() => handleDelete(event.id)}
                            className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm"
                            title="Delete Event"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Upload Materials Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowUploadModal(false)}
          />
          <div className="relative bg-white rounded-[28px] w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-8 border-b">
              <h3 className="text-2xl font-bold text-gray-800">Upload Material</h3>
              <p className="text-gray-500 text-sm mt-1">
                {selectedEventId ? `For Event: ${myEvents.find(e => e.id === selectedEventId)?.title || selectedEventId}` : 'Select an event first'}
              </p>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select File</label>
                <input 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full p-3 border rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-gray-400 mt-2">
                  Supported: PDF, JPG, PNG (Max 10MB)
                </p>
              </div>
            </div>
            
            <div className="p-8 bg-gray-50 flex gap-4">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="flex-1 py-4 text-gray-500 font-bold hover:bg-gray-200 rounded-2xl transition"
              >
                Cancel
              </button>
              <button 
                onClick={uploadMaterial}
                disabled={uploading || !attachmentFile}
                className="flex-1 py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;