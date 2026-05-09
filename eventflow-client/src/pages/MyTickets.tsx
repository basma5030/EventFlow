import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ticketsAPI } from '../api/tickets';
import { useAuth } from '../context/AuthContext';

interface Ticket {
  id: number;
  eventTitle: string;
  eventVenue: string;
  eventDate: string;
  pricePaid: number;
  qrCode: string;
  uniqueCode: string;
  purchaseDate: string;
}

const MyTickets = () => {
  const { isLoggedIn } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await ticketsAPI.getMyTickets();
        setTickets(response.data);
      } catch (err: any) {
        console.error('Error fetching tickets:', err);
        setError(err.response?.data?.message || 'Failed to load tickets');
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading your tickets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <nav className="p-6 bg-white border-b flex justify-between items-center max-w-7xl mx-auto mb-10">
        <Link to="/" className="text-[#1e4e8c] font-bold text-2xl">📅 EventFlow</Link>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 font-medium italic">My Digital Wallet</span>
          <Link to="/" className="text-[#1e4e8c] text-sm font-bold hover:underline">Back to Home</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tighter">My Tickets</h2>
        <p className="text-gray-500 mb-10 font-medium">Show these QR codes at the venue entrance</p>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-600 rounded-xl">
            {error}
          </div>
        )}

        {tickets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-gray-100">
            <p className="text-gray-400 text-xl font-medium italic">You haven't purchased any tickets yet.</p>
            <Link to="/" className="text-[#1e4e8c] font-bold underline mt-4 inline-block">Explore Events</Link>
          </div>
        ) : (
          <div className="space-y-8">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100 transform hover:scale-[1.01] transition-all">
                
                {/* Ticket Info Section */}
                <div className="p-10 flex-grow border-b md:border-b-0 md:border-r border-dashed border-gray-200 relative">
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-100 text-green-600">
                      Active
                    </span>
                    <span className="text-gray-400 font-mono text-xs">#{ticket.uniqueCode?.slice(0, 8) || ticket.id}</span>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-800 mb-4">{ticket.eventTitle}</h3>
                  
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-gray-400 uppercase text-[10px] font-bold mb-1">Date</p>
                      <p className="font-bold text-gray-700">{new Date(ticket.eventDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase text-[10px] font-bold mb-1">Location</p>
                      <p className="font-bold text-gray-700">{ticket.eventVenue}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase text-[10px] font-bold mb-1">Price Paid</p>
                      <p className="font-bold text-gray-700">${ticket.pricePaid}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase text-[10px] font-bold mb-1">Purchased</p>
                      <p className="font-bold text-gray-700">{new Date(ticket.purchaseDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="bg-gray-50 p-10 flex flex-col items-center justify-center min-w-[250px]">
                  <div className="bg-white p-4 rounded-2xl shadow-inner border border-gray-100 mb-4">
                    {ticket.qrCode ? (
                      <img 
                        src={`data:image/png;base64,${ticket.qrCode}`} 
                        alt="QR Code"
                        className="w-[120px] h-[120px]"
                      />
                    ) : (
                      <QRCodeSVG 
                        value={`https://eventflow.com/verify/${ticket.uniqueCode || ticket.id}`} 
                        size={120}
                        fgColor="#1e4e8c"
                        level="H"
                      />
                    )}
                  </div>
                  <p className="text-[10px] font-black text-[#1e4e8c] uppercase tracking-widest">Scan to verify</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;