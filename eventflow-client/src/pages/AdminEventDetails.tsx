import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventsAPI } from '../api/events';
import { adminAPI } from '../api/admin';

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
  rejectionReason?: string;
}

interface Material {
  id: number;
  filePath: string;
  originalName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
}

const AdminEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      // ✅ استخدام getEventWithMaterials عشان يجيب المواد مع الحدث
      const response = await eventsAPI.getEventWithMaterials(Number(id));
      setEvent(response.data.event);
      setMaterials(response.data.materials || []);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const approveEvent = async () => {
    try {
      await adminAPI.approveEvent(Number(id));
      alert('Event approved successfully!');
      navigate('/admin');
    } catch (err: any) {
      console.error('Error approving event:', err);
      alert(err.response?.data?.message || 'Failed to approve event');
    }
  };

  const rejectEvent = async () => {
    const reason = prompt('Enter rejection reason:');
    if (reason === null) return;
    try {
      await adminAPI.rejectEvent(Number(id), reason);
      alert('Event rejected.');
      navigate('/admin');
    } catch (err: any) {
      console.error('Error rejecting event:', err);
      alert(err.response?.data?.message || 'Failed to reject event');
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
        <div className="text-center">Loading event details...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error || 'Event not found'}</p>
          <Link to="/admin" className="text-blue-600 mt-4 inline-block">Back to Admin Panel</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <nav className="p-6 border-b flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/admin" className="flex items-center gap-2 text-[#1e4e8c] font-bold text-2xl">
          📅 EventFlow Admin
        </Link>
        <Link to="/admin" className="text-gray-600 hover:text-black font-medium">
          ← Back to Dashboard
        </Link>
      </nav>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-6 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2">
          {/* Event Image */}
          <div className="mb-8">
            <img 
              src={getImageUrl(event.imageUrl)} 
              alt={event.title}
              className="w-full max-h-96 object-cover rounded-2xl shadow-lg"
            />
          </div>

          <span className="bg-[#1e4e8c] text-white text-xs px-4 py-1.5 rounded-full font-bold mb-4 inline-block">
            {event.category}
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">{event.title}</h2>
          <p className="text-gray-500 mb-8">Organized by {event.organizerName}</p>

          <div className="flex flex-wrap gap-8 text-gray-600 mb-10 text-sm border-b pb-8">
            <div className="flex items-center gap-2">📅 {new Date(event.eventDate).toLocaleDateString()}</div>
            <div className="flex items-center gap-2">📍 {event.venue}</div>
            <div className="flex items-center gap-2">🎟️ {event.availableTickets} / {event.totalTickets} tickets left</div>
          </div>

          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">About This Event</h3>
            <p className="text-gray-600 leading-relaxed text-lg">{event.description}</p>
          </div>

          {/* ✅ Event Materials Section */}
          {materials.length > 0 && (
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {event.status === 'rejected' && event.rejectionReason && (
            <div className="mb-12 p-4 bg-red-50 rounded-xl border border-red-200">
              <h3 className="text-lg font-bold text-red-600 mb-2">Rejection Reason</h3>
              <p className="text-red-500">{event.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Sidebar with Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 shadow-2xl rounded-[32px] p-8 sticky top-10">
            <p className="text-gray-400 text-sm font-medium mb-1">Status</p>
            <h4 className={`text-2xl font-extrabold mb-6 ${
              event.status === 'approved' ? 'text-green-600' : 
              event.status === 'rejected' ? 'text-red-600' : 
              'text-yellow-600'
            }`}>
              {event.status === 'approved' ? '✅ Approved' : 
               event.status === 'rejected' ? '❌ Rejected' : 
               '⏳ Pending Approval'}
            </h4>
            
            <div className="space-y-4">
              {event.status === 'pending' && (
                <>
                  <button 
                    onClick={approveEvent}
                    className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-green-700 transition-all transform active:scale-95"
                  >
                    ✅ Approve Event
                  </button>
                  <button 
                    onClick={rejectEvent}
                    className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-red-700 transition-all transform active:scale-95"
                  >
                    ❌ Reject Event
                  </button>
                </>
              )}
              <Link 
                to="/admin" 
                className="w-full block text-center border border-gray-200 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-50 transition"
              >
                ← Back to Dashboard
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Ticket Price</p>
              <p className="text-3xl font-black text-gray-900">${event.ticketPrice}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEventDetails;