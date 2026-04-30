import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckSquare } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function Login() {
  const { user, login } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Member'
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        // Check if email exists
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('email', formData.email)
          .single();
          
        if (existingUser) throw new Error('Email already in use');

        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([formData])
          .select()
          .single();
          
        if (insertError) throw insertError;
        login(newUser);
        
      } else {
        const { data: existingUser, error: authError } = await supabase
          .from('users')
          .select('*')
          .eq('email', formData.email)
          .eq('password', formData.password)
          .single();
          
        if (authError || !existingUser) throw new Error('Invalid credentials');
        
        login(existingUser);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans transition-all duration-300">
      <div className="max-w-md w-full space-y-8 bg-card-bg backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl border border-card-border animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
             <CheckSquare className="w-8 h-8" />
          </div>
          <h2 className="text-center text-3xl font-bold text-text-main tracking-tight">
            {isSignup ? 'Create an account' : 'Welcome back'}
          </h2>
          <p className="mt-3 text-center text-sm text-text-muted">
            {isSignup ? 'Sign up to start managing tasks' : 'Sign in to access your dashboard'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm backdrop-blur-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-text-main/80 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  className="appearance-none block w-full px-4 py-3 bg-input-bg border border-card-border rounded-2xl shadow-sm placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-300 text-text-main"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-text-main/80 mb-2">Email address</label>
              <input
                type="email"
                required
                className="appearance-none block w-full px-4 py-3 bg-input-bg border border-card-border rounded-2xl shadow-sm placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-300 text-text-main"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
               <label className="block text-sm font-medium text-text-main/80 mb-2">Password</label>
               <input
                 type="password"
                 required
                 minLength={6}
                 className="appearance-none block w-full px-4 py-3 bg-input-bg border border-card-border rounded-2xl shadow-sm placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-300 text-text-main"
                 placeholder="••••••••"
                 value={formData.password}
                 onChange={(e) => setFormData({...formData, password: e.target.value})}
               />
            </div>

            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-text-main/80 mb-2">Role</label>
                <select
                  className="appearance-none block w-full px-4 py-3 bg-input-bg border border-card-border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-300 text-text-main"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="Member" className="bg-bg-color text-text-main">Team Member</option>
                  <option value="Admin" className="bg-bg-color text-text-main">Admin</option>
                </select>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-full shadow-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-color focus:ring-blue-500 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? 'Processing...' : (isSignup ? 'Create account' : 'Sign in')}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <button
            type="button"
            className="text-[14px] text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium transition-colors"
            onClick={() => {
               setIsSignup(!isSignup);
               setError('');
               setFormData({ name: '', email: '', password: '', role: 'Member' });
            }}
          >
            {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
