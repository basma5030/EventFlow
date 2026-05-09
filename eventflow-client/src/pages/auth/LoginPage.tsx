import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, userRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      
      // Redirect based on role
      if (userRole === 'Admin') {
        navigate('/admin');
      } else if (userRole === 'Organizer') {
        navigate('/organizer-dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-black text-center text-[#1e4e8c] mb-2 uppercase tracking-tighter">Welcome Back</h2>
        <p className="text-gray-400 text-center mb-8 text-sm font-medium">Log in to manage your events and tickets</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-500 text-xs font-bold mb-1 uppercase tracking-widest">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition-all"
              placeholder="admin@eventflow.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-500 text-xs font-bold mb-1 uppercase tracking-widest">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none transition-all"
              placeholder="********"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#1e4e8c] text-white font-bold py-4 rounded-2xl hover:bg-blue-800 transition duration-300 shadow-lg shadow-blue-100 mt-4 active:scale-95"
          >
            Log In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <p className="text-gray-500 text-sm">
            Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Create one now</Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-xl text-[10px] text-blue-600 leading-relaxed italic">
          💡 Try <strong>admin@eventflow.com</strong> (Admin) or register as Organizer/Participant.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;