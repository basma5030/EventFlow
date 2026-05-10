import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '../api/events';
import { useAuth } from '../context/AuthContext';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [materials, setMaterials] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Entertainment',
    venue: '',
    eventDate: '',
    ticketPrice: '',
    totalTickets: '',
  });

  const nextStep = () => {
    if (step === 2 && !imageFile) {
      setError('Please upload an event image before proceeding');
      return;
    }
    setError('');
    setStep(step + 1);
  };
  
  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageFile) {
      setError('Event image is required. Please go back to step 2 and upload an image.');
      return;
    }
    
    if (!formData.eventDate) {
      setError('Please select an event date');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // 1. إنشاء الحدث
      const eventData = {
        title: formData.title,
        description: formData.description,
        venue: formData.venue,
        category: formData.category,
        eventDate: new Date(formData.eventDate).toISOString(),
        ticketPrice: parseFloat(formData.ticketPrice),
        totalTickets: parseInt(formData.totalTickets),
      };
      
      console.log('Creating event...', eventData);
      const response = await eventsAPI.create(eventData);
      const createdEvent = response.data;
      console.log('Event created with ID:', createdEvent.id);
      
      try {
        // 2. رفع الصورة
        const formDataWithImage = new FormData();
        formDataWithImage.append('image', imageFile);
        await eventsAPI.uploadImage(createdEvent.id, formDataWithImage);
        console.log('✅ Image uploaded successfully');
        
        // 3. رفع المواد
        if (materials.length > 0) {
          console.log(`📦 Uploading ${materials.length} material(s)...`);
          for (const file of materials) {
            const materialFormData = new FormData();
            materialFormData.append('attachment', file);
            await eventsAPI.uploadMaterial(createdEvent.id, materialFormData);
            console.log(`✅ Uploaded: ${file.name}`);
          }
        }
      } catch (uploadErr) {
        console.error('Upload failed, rolling back event creation...');
        try {
          await eventsAPI.delete(createdEvent.id);
          console.log('Rollback successful');
        } catch (rollbackErr) {
          console.error('Failed to rollback event:', rollbackErr);
        }
        throw uploadErr; // Rethrow to show the error message in the outer catch block
      }
      
      alert('Event submitted for Admin Approval!');
      navigate('/organizer-dashboard');
    } catch (err: any) {
      console.error('Error creating event:', err);
      setError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-[#1e4e8c] p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Create New Event</h2>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-[#deff9a]' : 'bg-blue-900'}`} />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Step 1: General Info</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Event Title *</label>
                <input 
                  type="text" 
                  className="mt-1 w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#1e4e8c] outline-none"
                  placeholder="e.g. Cairo Tech Summit"
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
                  placeholder="Tell us about your event..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
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
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Step 2: Logistics</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700">Venue / Location *</label>
                <input 
                  type="text" 
                  className="mt-1 w-full p-3 border rounded-xl" 
                  placeholder="e.g. Grand Hall, Cairo"
                  value={formData.venue}
                  onChange={(e) => setFormData({...formData, venue: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Event Date *</label>
                <input 
                  type="datetime-local" 
                  className="mt-1 w-full p-3 border rounded-xl"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Event Image *</label>
                <input 
                  type="file" 
                  accept="image/*"
                  className="mt-1 w-full p-3 border rounded-xl"
                  onChange={(e) => {
                    setImageFile(e.target.files?.[0] || null);
                    if (e.target.files?.[0]) {
                      setError('');
                    }
                  }}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Upload a picture for your event (required)</p>
              </div>

              {/* Materials Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Event Materials (Optional)</label>
                <input 
                  type="file" 
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="mt-1 w-full p-3 border rounded-xl"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setMaterials(prev => [...prev, ...files]);
                  }}
                />
                <p className="text-xs text-gray-400 mt-1">Supported: PDF, JPG, PNG (You can upload multiple files)</p>
                
                {materials.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Selected files ({materials.length}):</p>
                    {materials.map((file, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                        <span className="text-sm text-gray-600">📎 {file.name}</span>
                        <button 
                          type="button"
                          onClick={() => removeMaterial(idx)}
                          className="text-red-500 hover:text-red-700 text-sm px-2"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">Step 3: Tickets & Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ticket Price ($) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="mt-1 w-full p-3 border rounded-xl" 
                    placeholder="0 for free"
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
                    placeholder="Capacity"
                    value={formData.totalTickets}
                    onChange={(e) => setFormData({...formData, totalTickets: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-700">
                ℹ️ Your event will be sent to the <strong>Admin</strong> for approval before it becomes visible to participants.
              </div>
            </div>
          )}

          <div className="mt-10 flex justify-between">
            {step > 1 && (
              <button type="button" onClick={prevStep} className="px-8 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition">
                Back
              </button>
            )}
            <div className="ml-auto">
              {step < 3 ? (
                <button type="button" onClick={nextStep} className="px-10 py-3 bg-[#1e4e8c] text-white font-bold rounded-xl hover:bg-blue-800 transition">
                  Next Step
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-10 py-3 bg-[#deff9a] text-[#1e4e8c] font-bold rounded-xl hover:bg-[#c9ef7a] transition shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Event'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;