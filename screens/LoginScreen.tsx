
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import { ChevronDownIcon } from '../components/icons';

export const LoginScreen: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>(Role.STUDENT);
  const [error, setError] = useState('');
  const { login, signup, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignup) {
        await signup(name, email);
      } else {
        await login(email, role);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };

  const toggleFormMode = () => {
      setIsSignup(!isSignup);
      setError('');
      setName('');
      setEmail('');
      setRole(Role.STUDENT);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20 transform transition-all duration-300 hover:scale-[1.02]">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {isSignup ? 'Create Admin Account' : 'Welcome Back'}
          </h2>
          <p className="text-slate-600">
            {isSignup ? 'Sign up to manage the system' : 'Sign in to your account'}
          </p>
        </div>
        
        {error && <p className="bg-red-100 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-center animate-shake">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div className="mb-4">
              <label htmlFor="name" className="block text-slate-700 font-medium mb-2">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
                placeholder="e.g., Jane Doe"
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="email" className="block text-slate-700 font-medium mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
              placeholder="e.g., user@example.com"
              required
            />
          </div>
          {!isSignup && (
            <div className="mb-6">
              <label htmlFor="role" className="block text-slate-700 font-medium mb-2">Role</label>
              <div className="relative">
                  <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="w-full appearance-none px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/50 transition-all duration-200"
                  >
                      <option value={Role.ADMIN}>Administrator</option>
                      <option value={Role.TEACHER}>Teacher</option>
                      <option value={Role.STUDENT}>Student</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                      <ChevronDownIcon />
                  </div>
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] font-medium shadow-lg hover:shadow-xl"
          >
            {loading ? 'Processing...' : (isSignup ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
         <div className="mt-6 text-center text-sm">
             <p className="text-slate-600">
                {isSignup ? 'Already have an account?' : "Don't have an admin account?"}{' '}
                <button onClick={toggleFormMode} className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
                    {isSignup ? 'Sign In' : 'Sign Up'}
                </button>
             </p>
         </div>
         <div className="mt-6 text-center text-sm bg-indigo-50 border border-indigo-100 rounded-lg p-4">
            <p className="font-semibold text-indigo-900 mb-2">📋 Instructions:</p>
            <p className="text-slate-700 mb-1">1. First-time admin? Use 'Sign Up'.</p>
            <p className="text-slate-700">2. Students & Teachers must be added by an admin before they can sign in.</p>
        </div>
      </div>
    </div>
  );
};
