import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  
  const { login, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (currentUser && !showSuccess) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate, showSuccess]);

  const playLoginSuccessSound = () => {
    const audio = new Audio('/login-success.mp3');
    audio.play().catch(e => console.error('Audio playback failed:', e));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLocalLoading(true);
    
    const res = await login(email, password);
    if (res.success) {
      playLoginSuccessSound();
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/dashboard');
      }, 4000);
    } else {
      setError(res.message);
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-xl mb-4">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-gray-500 mt-2">Sign in to your khambaPay account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={localLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-70"
          >
            {localLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up now
          </Link>
        </p>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-lg">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 max-w-sm w-full shadow-2xl border border-slate-700 animate-in zoom-in duration-300 flex flex-col items-center">
            <div className="bg-blue-500/20 p-5 rounded-full mb-6">
              <Sparkles className="h-16 w-16 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white text-center tracking-wide leading-relaxed">
              মনে রাখবেন, We have a plan
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
