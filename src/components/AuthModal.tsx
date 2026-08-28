import React, { useState } from 'react';
import { UserProfile } from '../types/auth';
import { saveUserSession } from '../utils/authStorage';
import { 
  X, Mail, Lock, User, Sparkles, CheckCircle2, 
  ArrowRight, ShieldCheck, Globe
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile, message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'quick-providers'>('quick-providers');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Handle OAuth style quick provider (Gmail, Yahoo, Outlook, Apple)
  const handleProviderLogin = (provider: 'google' | 'yahoo' | 'outlook' | 'apple', providerName: string, defaultDomain: string) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    // Simulate instant secure authentication tagging
    setTimeout(() => {
      const generatedEmail = email.trim() || `traveler@${defaultDomain}`;
      const displayName = name.trim() || (provider === 'google' ? 'Google Traveler' : `${providerName} Member`);

      const user: UserProfile = {
        id: `usr-${provider}-${Date.now()}`,
        email: generatedEmail,
        name: displayName,
        provider: provider === 'google' ? 'google' : provider === 'yahoo' ? 'yahoo' : 'email',
        avatar: provider === 'google' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' : undefined,
        createdAt: new Date().toISOString()
      };

      saveUserSession(user);
      setIsSubmitting(false);
      onLoginSuccess(user, `Welcome back, ${user.name}! Successfully signed in via ${providerName}.`);
      onClose();
    }, 600);
  };

  // Handle standard email / password
  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address (e.g. name@gmail.com, name@yahoo.com).');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('Password should be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    setTimeout(() => {
      let detectedProvider: 'google' | 'yahoo' | 'email' = 'email';
      if (email.toLowerCase().includes('gmail.com')) detectedProvider = 'google';
      else if (email.toLowerCase().includes('yahoo.')) detectedProvider = 'yahoo';

      const user: UserProfile = {
        id: `usr-mail-${Date.now()}`,
        email: email.trim(),
        name: name.trim() || email.split('@')[0],
        provider: detectedProvider,
        createdAt: new Date().toISOString()
      };

      saveUserSession(user);
      setIsSubmitting(false);
      onLoginSuccess(user, mode === 'signup' ? 'Account created! Your itineraries will now be saved to your profile.' : 'Signed in successfully!');
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">
              Traveler Profile
            </span>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'signup' ? 'Create Traveler Account' : mode === 'login' ? 'Sign In to Your Account' : 'Sign In or Tag Account'}
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            Save custom itineraries, track holiday schedules, and access your travel plans anytime.
          </p>
        </div>

        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              {errorMsg}
            </div>
          )}

          {/* Quick 1-Click Social / Email Provider Sign In */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-slate-700">Continue with your preferred email service:</p>

            {/* Google / Gmail Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleProviderLogin('google', 'Google / Gmail', 'gmail.com')}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 text-slate-700 text-sm font-medium transition-all shadow-2xs group cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with <strong>Google / Gmail</strong></span>
            </button>

            {/* Yahoo Mail Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleProviderLogin('yahoo', 'Yahoo Mail', 'yahoo.com')}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-[#6001d2]/5 border border-[#6001d2]/20 rounded-xl hover:bg-[#6001d2]/10 text-[#6001d2] text-sm font-medium transition-all shadow-2xs cursor-pointer"
            >
              <span className="w-4 h-4 bg-[#6001d2] text-white rounded-full flex items-center justify-center text-[10px] font-bold">Y!</span>
              <span>Continue with <strong>Yahoo Mail</strong></span>
            </button>

            {/* Microsoft Outlook / Hotmail */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleProviderLogin('outlook', 'Microsoft Outlook', 'outlook.com')}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-sky-50 border border-sky-200 rounded-xl hover:bg-sky-100 text-sky-800 text-sm font-medium transition-all shadow-2xs cursor-pointer"
            >
              <Globe className="w-4 h-4 text-sky-600" />
              <span>Continue with <strong>Outlook / Hotmail</strong></span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-xs text-slate-400 font-medium uppercase tracking-wider absolute">
              or use custom email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Tan"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com, name@yahoo.com..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Create Account & Save' : 'Sign In with Email'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login / Signup */}
          <div className="pt-2 text-center text-xs text-slate-500">
            {mode === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Need a new account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  Sign Up with Email
                </button>
              </p>
            )}
          </div>

          {/* Security footnote */}
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Encrypted local session profile. Your saved itineraries persist securely in your browser.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
