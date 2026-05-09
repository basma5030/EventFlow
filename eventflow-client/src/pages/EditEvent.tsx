import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventsAPI } from '../api/events';
import { useAuth } from '../context/AuthContext';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Entertainment',
    venue: '',
    eventDate: '',
    ticketPrice: '',
    totalTickets: '',
  });

  // جلب بيانات الحدث الحالي
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await eventsAPI.getById(Number(id));
        const event = response.data;
        setFormData({
          title: event.title,
          description: event.description,
          category: event.category,
          venue: event.venue,
          eventDate: event.eventDate.split('T')[0],
          ticketPrice: event.ticketPrice.toString(),
          totalTickets: event.totalTickets.toString(),
        });
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        venue: formData.venue,
        category: formData.category,
        eventDate: new Date(formData.eventDate).toISOString(),
        ticketPrice: parseFloat(formData.ticketPrice),
        totalTickets: parseInt(formData.totalTickets),
      };
      
      await eventsAPI.update(Number(id), eventData);
      
      // لو فيه صورة جديدة، نرفعها
      if (imageFile) {
        const formDataWithImage = new FormData();
        formDataWithImage.append('image', imageFile);
        await eventsAPI.uploadImage(Number(id), formDataWithImage);
      }
      
      alert('Event updated successfully!');
      navigate('/organizer-dashboard');
    } catch (err: any) {
      console.error('Error updating event:', err);
      setError(err.response?.data?.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.title) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-[#1e4e8c] p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Edit Event</h2>
          <p className="text-sm opacity-80">Update your event information</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-100 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Event Title *</label>
            <input 
              type="text" 
              className="mt-1 w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#1e4e8c] outline-none"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea 
              rows={4}
              className="mt-1 w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#1e4e8c] outline-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <select 
                className="mt-1 w-full p-3 border rounded-xl"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option>Entertainment</option>
                <option>Technology</option>
                <option>Business</option>
                <option>Art</option>
                <option>Food</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Venue *</label>
              <input 
                type="text" 
                className="mt-1 w-full p-3 border rounded-xl"
                value={formData.venue}
                onChange={(e) => setFormData({...formData, venue: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Event Date *</label>
              <input 
                type="date" 
                className="mt-1 w-full p-3 border rounded-xl"
                value={formData.eventDate}
                onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Image (optional)</label>
              <input 
                type="file" 
                accept="image/*"
                className="mt-1 w-full p-3 border rounded-xl"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Ticket Price ($) *</label>
              <input 
                type="number" 
                step="0.01"
                className="mt-1 w-full p-3 border rounded-xl"
                value={formData.ticketPrice}
                onChange={(e) => setFormData({...formData, ticketPrice: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Tickets *</label>
              <input 
                type="number" 
                className="mt-1 w-full p-3 border rounded-xl"
                value={formData.totalTickets}
                onChange={(e) => setFormData({...formData, totalTickets: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/organizer-dashboard')}
              className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-3 bg-[#1e4e8c] text-white font-bold rounded-xl hover:bg-blue-800 transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;