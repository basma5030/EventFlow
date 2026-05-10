import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin';

interface Organizer {
  id: number;
  username: string;
  email: string;
  role: string;
  isApproved: boolean;
}

interface PendingEvent {
  id: number;
  title: string;
  organizerName: string;
  ticketPrice: number;
  category: string;
  status: string;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('organizers');
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const orgResponse = await adminAPI.getOrganizers();
      const unapprovedOrgs = orgResponse.data.filter((org: Organizer) => !org.isApproved);
      setOrganizers(unapprovedOrgs);

      const eventsResponse = await adminAPI.getPendingEvents();
      setPendingEvents(eventsResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Make sure the API is running.');
    } finally {
      setLoading(false);
    }
  };

  const approveOrganizer = async (userId: number) => {
    try {
      await adminAPI.approveOrganizer(userId);
      setOrganizers(organizers.filter(org => org.id !== userId));
      alert('Organizer approved successfully!');
    } catch (err: any) {
      console.error('Error approving organizer:', err);
      alert(err.response?.data?.message || 'Failed to approve organizer');
    }
  };

  const rejectOrganizer = async (userId: number) => {
    if (!confirm('Are you sure you want to reject this organizer?')) return;
    try {
      await adminAPI.rejectOrganizer(userId);
      setOrganizers(organizers.filter(org => org.id !== userId));
      alert('Organizer rejected and removed.');
    } catch (err: any) {
      console.error('Error rejecting organizer:', err);
      alert(err.response?.data?.message || 'Failed to reject organizer');
    }
  };

  const approveEvent = async (eventId: number) => {
    try {
      await adminAPI.approveEvent(eventId);
      setPendingEvents(pendingEvents.filter(ev => ev.id !== eventId));
      alert('Event approved successfully!');
    } catch (err: any) {
      console.error('Error approving event:', err);
      alert(err.response?.data?.message || 'Failed to approve event');
    }
  };

  const rejectEvent = async (eventId: number) => {
    const reason = prompt('Enter rejection reason:');
    if (reason === null) return;
    try {
      await adminAPI.rejectEvent(eventId, reason);
      setPendingEvents(pendingEvents.filter(ev => ev.id !== eventId));
      alert('Event rejected.');
    } catch (err: any) {
      console.error('Error rejecting event:', err);
      alert(err.response?.data?.message || 'Failed to reject event');
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
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#1e4e8c] text-white p-8 hidden md:block">
        <h2 className="text-2xl font-bold mb-10 italic">EventFlow Admin</h2>
        <nav className="space-y-4">
          <button 
            onClick={() => setActiveTab('organizers')}
            className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'organizers' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}
          >
            👥 Organizers ({organizers.length})
          </button>
          <button 
            onClick={() => setActiveTab('events')}
            className={`w-full text-left px-4 py-2 rounded-lg transition ${activeTab === 'events' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}
          >
            📝 Pending Events ({pendingEvents.length})
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">
            {activeTab === 'organizers' ? 'Organizer Requests' : 'Event Approvals'}
          </h1>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border text-sm font-bold text-[#1e4e8c]">
            Admin Mode
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-600 rounded-xl">
            {error}
          </div>
        )}

        {/* Organizers Tab */}
        {activeTab === 'organizers' && (
          <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
            {organizers.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                No pending organizer requests.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-6 text-gray-400 uppercase text-xs font-black">Name</th>
                    <th className="p-6 text-gray-400 uppercase text-xs font-black">Email</th>
                    <th className="p-6 text-gray-400 uppercase text-xs font-black">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {organizers.map(org => (
                    <tr key={org.id} className="hover:bg-gray-50 transition">
                      <td className="p-6">
                        <div className="font-bold text-gray-800">{org.username}</div>
                      </td>
                      <td className="p-6 text-gray-600 font-medium">{org.email}</td>
                      <td className="p-6 flex gap-3">
                        <button 
                          onClick={() => approveOrganizer(org.id)}
                          className="bg-green-100 text-green-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-600 hover:text-white transition"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => rejectOrganizer(org.id)}
                          className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingEvents.length === 0 ? (
              <div className="col-span-2 bg-white p-12 text-center text-gray-400 rounded-[2rem]">
                No pending events.
              </div>
            ) : (
              pendingEvents.map(event => (
                <div key={event.id} className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase italic">
                      {event.category}
                    </span>
                    <span className="text-xl font-black text-gray-900">${event.ticketPrice}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                  <p className="text-gray-400 text-sm mb-6">Requested by: <span className="text-gray-600 font-bold">{event.organizerName}</span></p>
                  <div className="mt-auto flex gap-4">
                    <button 
                      onClick={() => approveEvent(event.id)}
                      className="flex-1 bg-[#1e4e8c] text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition shadow-lg shadow-blue-100"
                    >
                      Approve Event
                    </button>
                    <button 
                      onClick={() => rejectEvent(event.id)}
                      className="flex-1 bg-gray-100 text-gray-400 py-3 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;