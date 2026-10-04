import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Wallet, Sparkles, Download, ArrowRight } from 'lucide-react';
import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profession, setProfession] = useState('');
  const [professionsList, setProfessionsList] = useState([]);
  
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  
  const { register, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (currentUser && !showSuccess) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate, showSuccess]);

  useEffect(() => {
    const fetchProfessions = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/professions`);
        setProfessionsList(data);
        if (data.length > 0) {
          setProfession(data[0].name);
        }
      } catch (err) {
        console.error('Failed to fetch professions');
      }
    };
    fetchProfessions();
  }, []);

  const playLoginSuccessSound = () => {
    const audio = new Audio('/login-success.mp3');
    audio.play().catch(e => console.error('Audio playback failed:', e));
  };

  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLocalLoading(true);
    
    const res = await register(name, email, password, profession);
    if (res.success) {
      playLoginSuccessSound();
      setShowSuccess(true);
      // Removed automatic setTimeout redirect so user can view/download their card
    } else {
      setError(res.message);
      setLocalLoading(false);
    }
  };

  const handleDownload = async () => {
    if (cardRef.current === null) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'khambapay-member-card.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
      toast.error('Failed to download card');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-3 rounded-xl mb-4">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create an account</h2>
          <p className="text-gray-500 mt-2">Start sending money with khambaPay</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-['Hind_Siliguri']"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
            >
              {professionsList.map(p => (
                <option key={p.name} value={p.name} className="font-['Hind_Siliguri'] text-base">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={localLoading || professionsList.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2 disabled:opacity-70"
          >
            {localLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>

      {showSuccess && currentUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
          <div className="max-w-md w-full flex flex-col items-center gap-6 py-10 animate-in zoom-in duration-300">
            
            {/* Downloadable Card */}
            <div 
              ref={cardRef}
              className="w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl overflow-hidden relative border border-slate-700 p-1"
            >
              {/* Decorative background */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
              
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 sm:p-8 h-full flex flex-col justify-between relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/50">
                      <Wallet className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-white font-bold text-xl tracking-tight">khambaPay</span>
                  </div>
                  <div className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-blue-500/30">
                    Member
                  </div>
                </div>
                
                <div className="space-y-1 mb-8">
                  <h3 className="text-gray-400 text-[10px] uppercase tracking-widest font-semibold">Cardholder Name</h3>
                  <p className="text-white text-2xl font-bold tracking-wide">{currentUser.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest font-semibold mb-1">Profession</p>
                    <p className="text-white font-['Hind_Siliguri'] text-lg font-medium">
                      {currentUser.profession}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase tracking-widest font-semibold mb-1">Joined</p>
                    <p className="text-white text-sm mt-1 font-medium tracking-wide">
                      {new Date(currentUser.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 pt-5 border-t border-slate-700/50 flex justify-between items-end">
                  <div>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest font-semibold mb-1">Card ID</p>
                    <p className="text-gray-300 text-xs font-mono tracking-widest opacity-80">
                      {currentUser._id ? currentUser._id.slice(-8).toUpperCase() : 'PENDING'}
                    </p>
                  </div>
                  <Sparkles className="h-6 w-6 text-blue-400 opacity-40" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full px-2">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-medium py-3 px-4 rounded-xl transition-colors flex justify-center items-center gap-2"
              >
                <Download className="h-5 w-5" />
                {downloading ? 'Generating...' : 'Download Card'}
              </button>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  navigate('/dashboard');
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-lg shadow-blue-900/20"
              >
                Go to Dashboard
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
