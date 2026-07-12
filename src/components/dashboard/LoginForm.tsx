import React, { useState } from 'react';
import { Shield, Eye, EyeOff, AlertTriangle, Check } from 'lucide-react';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onForgotPassword: () => void;
  loading: boolean;
  error: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  onForgotPassword,
  loading,
  error,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-teal-200/80 mb-1">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white placeholder-teal-200/40 focus:outline-none focus:border-[#007aff] transition-colors"
          placeholder="admin@solertianovarum.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-teal-200/80 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-teal-500/30 rounded-lg text-white placeholder-teal-200/40 focus:outline-none focus:border-[#007aff] transition-colors pr-12"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-400 hover:text-white"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-linear-to-r from-[#007aff] to-teal-500 hover:from-teal-500 hover:to-[#007aff] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
        >
          Forgot Password?
        </button>
      </div>
    </form>
  );
};
