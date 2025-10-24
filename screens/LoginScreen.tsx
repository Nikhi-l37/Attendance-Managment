
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import { ChevronDownIcon } from '../components/icons';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>(Role.STUDENT);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Welcome Back</h2>
        <p className="text-center text-slate-500 mb-8">Sign in to your account</p>
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-slate-700 font-medium mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., admin@example.com"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="role" className="block text-slate-700 font-medium mb-2">Role</label>
            <div className="relative">
                <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full appearance-none px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors duration-300"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
         <div className="mt-6 text-center text-sm text-slate-500">
            <p className="font-semibold">Demo Credentials:</p>
            <p><span className="font-medium">Admin:</span> admin@example.com</p>
            <p><span className="font-medium">Teacher:</span> charles@example.com</p>
            <p><span className="font-medium">Student:</span> alice@example.com</p>
        </div>
      </div>
    </div>
  );
};
