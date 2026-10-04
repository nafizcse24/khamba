import { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Wallet, Sparkles, Download, ArrowRight, User, GraduationCap, Coins, Calendar } from 'lucide-react';
import { toPng } from 'html-to-image';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const enToBnNumber = (num) => {
  if (num === undefined || num === null) return '';
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().split('').map(digit => bnDigits[digit] || digit).join('');
};

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

  // Derived values for the card
  const userProf = professionsList.find(p => p.name === currentUser?.profession);
  const weeklyChanda = userProf ? userProf.amount : 0;
  const monthlyChanda = weeklyChanda * 4;

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
          <div className="max-w-xl w-full flex flex-col items-center gap-6 py-10 animate-in zoom-in duration-300">
            
            {/* Downloadable Card */}
            <div 
              ref={cardRef}
              className="w-full max-w-[550px] aspect-[1.58] bg-[#0A2313] rounded-xl shadow-2xl overflow-hidden relative border border-[#164225] font-['Hind_Siliguri']"
            >
              {/* Top Right Circle (Sun) */}
              <div className="absolute top-4 right-4 w-28 h-28 bg-[#D11818] rounded-full opacity-90 blur-[1px] flex items-center justify-center">
                {/* Optional dark map silhouette could go here if we had an SVG, for now just the flag sun */}
              </div>

              {/* Bottom Left Red Swoosh */}
              <div className="absolute -bottom-32 -left-20 w-64 h-64 bg-[#E51118] rounded-full rotate-45 blur-md opacity-90"></div>

              {/* Bottom Right Monument (Abstract CSS) */}
              <div className="absolute bottom-2 right-8 flex items-end justify-center opacity-70">
                 <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[80px] border-b-[#06150b] absolute"></div>
                 <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[60px] border-b-[#0b2414] absolute"></div>
                 <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[40px] border-b-[#12361d] absolute"></div>
              </div>

              {/* Card Content - Z-10 */}
              <div className="absolute inset-0 p-5 sm:p-7 flex flex-col z-10">
                
                {/* Title */}
                <div className="text-center mb-6 mt-1">
                  <h1 className="text-4xl sm:text-5xl font-bold text-[#F4E8D3] tracking-wide inline-block relative">
                    চাঁদা কার্ড
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[120%] h-1 bg-[#E51118] rounded-[50%] blur-[0.5px]"></div>
                  </h1>
                </div>

                {/* Main Body */}
                <div className="flex gap-4 sm:gap-6 h-full items-center relative z-20 mt-2">
                  
                  {/* Photo Placeholder */}
                  <div className="w-[110px] h-[130px] sm:w-[130px] sm:h-[150px] bg-[#3A3F47] border-[2px] border-[#F4E8D3] rounded-xl overflow-hidden flex items-end justify-center shrink-0 shadow-lg relative bg-gradient-to-b from-[#6B7280] to-[#374151]">
                     <User size={120} className="text-[#1F2937] absolute -bottom-6" strokeWidth={1.5} />
                  </div>

                  {/* Info Column */}
                  <div className="flex-1 space-y-3 sm:space-y-4">
                    
                    {/* Name */}
                    <div className="flex items-center gap-2 sm:gap-3 border-b border-[#F4E8D3]/30 pb-1.5">
                      <div className="p-1 border-[1.5px] border-[#F4E8D3] rounded-full shrink-0">
                        <User size={14} className="text-[#F4E8D3]" />
                      </div>
                      <span className="text-[#F4E8D3] font-semibold text-base sm:text-lg min-w-[50px] sm:min-w-[60px]">নাম :</span>
                      <span className="text-[#F4E8D3] font-bold text-lg sm:text-xl truncate">{currentUser.name}</span>
                    </div>

                    {/* Profession */}
                    <div className="flex items-center gap-2 sm:gap-3 border-b border-[#F4E8D3]/30 pb-1.5">
                      <div className="p-1 border-[1.5px] border-[#F4E8D3] rounded-full shrink-0">
                        <GraduationCap size={14} className="text-[#F4E8D3]" />
                      </div>
                      <span className="text-[#F4E8D3] font-semibold text-base sm:text-lg min-w-[50px] sm:min-w-[60px]">পেশা :</span>
                      <span className="text-[#F4E8D3] text-lg sm:text-xl truncate">{currentUser.profession}।</span>
                    </div>

                    {/* Monthly */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1 border-[1.5px] border-[#F4E8D3] rounded-full shrink-0">
                        <Coins size={14} className="text-[#F4E8D3]" />
                      </div>
                      <span className="text-[#F4E8D3] font-semibold text-base sm:text-lg min-w-[90px] sm:min-w-[110px]">মাসিক চাঁদা-</span>
                      <div className="bg-[#F4E8D3] text-[#0A2313] px-2 sm:px-3 py-0.5 sm:py-1 rounded shadow-inner flex-1 text-center font-bold text-base sm:text-lg whitespace-nowrap">
                        {enToBnNumber(monthlyChanda)} টাকা
                      </div>
                    </div>

                    {/* Weekly */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1 border-[1.5px] border-[#F4E8D3] rounded-full shrink-0">
                        <Calendar size={14} className="text-[#F4E8D3]" />
                      </div>
                      <span className="text-[#F4E8D3] font-semibold text-base sm:text-lg min-w-[90px] sm:min-w-[110px]">সাপ্তাহিক চাঁদা-</span>
                      <div className="bg-[#F4E8D3] text-[#0A2313] px-2 sm:px-3 py-0.5 sm:py-1 rounded shadow-inner flex-1 text-center font-bold text-base sm:text-lg whitespace-nowrap">
                        {enToBnNumber(weeklyChanda)} টাকা
                      </div>
                    </div>

                  </div>
                </div>

                {/* Bottom Slogan */}
                <div className="absolute bottom-4 w-full left-0 flex items-center justify-center gap-2 sm:gap-3 z-10">
                  <div className="h-[2px] w-8 sm:w-12 bg-[#E51118]"></div>
                  <div className="h-[2px] w-8 sm:w-12 bg-[#2E6B42]"></div>
                  <span className="text-[#F4E8D3] text-base sm:text-lg opacity-90 px-1 sm:px-2 font-[cursive]">We have a plan</span>
                  <div className="h-[2px] w-8 sm:w-12 bg-[#E51118]"></div>
                  <div className="h-[2px] w-8 sm:w-12 bg-[#2E6B42]"></div>
                </div>
                
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[550px] px-2">
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
