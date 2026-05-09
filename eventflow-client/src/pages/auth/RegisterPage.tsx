import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { authAPI } from '../../api/auth';



const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Participant'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      await authAPI.register({
        username: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      if (formData.role === 'Organizer') {
        setSuccess("Registration submitted! Admin must approve your organizer account first.");
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setSuccess("Welcome to EventFlow! Please login.");
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-10 rounded-[2rem] shadow-2xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-black text-center text-[#1e4e8c] mb-6 uppercase tracking-tighter">Create Account</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-600 rounded-xl text-sm font-medium">
            {success}
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-500 text-xs font-bold mb-1 uppercase">Full Name</label>
            <input
              type="text"
              name="fullName"
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Your Name"
              required
            />
          </div>

          <div>
            <label className="block text-gray-500 text-xs font-bold mb-1 uppercase">Email Address</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="email@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-500 text-xs font-bold mb-1 uppercase">Join as</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-400 outline-none font-bold text-gray-700 cursor-pointer"
            >
              <option value="Participant">Participant (Attendee)</option>
              <option value="Organizer">Event Organizer</option>
            </select>
            <p className="text-[10px] text-gray-400 mt-1 italic">
              * Organizers require Admin approval before creating events.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-500 text-xs font-bold mb-1 uppercase">Password</label>
              <input
                type="password"
                name="password"
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="********"
                required
              />
            </div>
            <div>
              <label className="block text-gray-500 text-xs font-bold mb-1 uppercase">Confirm</label>
              <input
                type="password"
                name="confirmPassword"
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="********"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#1e4e8c] text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition duration-300 shadow-lg shadow-blue-100 mt-4"
          >
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;