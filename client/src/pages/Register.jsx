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
      // Warm-up pass — html-to-image needs this to properly resolve fonts/styles
      await toPng(cardRef.current, { cacheBust: true, pixelRatio: 1, skipFonts: true });
      // Real capture at high resolution
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = 'khambapay-chanda-card.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
      toast.error('Download failed. Try again.');
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg overflow-y-auto">
          <div className="max-w-xl w-full flex flex-col items-center gap-5 py-8 animate-in zoom-in duration-500">
            
            {/* Downloadable Card */}
            <div 
              ref={cardRef}
              className="w-full max-w-[560px] aspect-[1.6] rounded-xl sm:rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden relative font-['Hind_Siliguri']"
            >
              {/* === BACKGROUND LAYERS === */}
              
              {/* Base gradient — deep forest green */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#041a0a] via-[#0d3118] to-[#061f0b]"></div>
              
              {/* Subtle radial light in the center for depth */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_50%,_rgba(30,80,45,0.35)_0%,_transparent_70%)]"></div>

              {/* Top-left diagonal flag stripe — Red */}
              <div className="absolute -top-6 sm:-top-8 -left-6 sm:-left-8 w-[120px] sm:w-[180px] h-[180px] sm:h-[280px] bg-[#C41E1E] rotate-[25deg] opacity-80" style={{ borderRadius: '0 0 80px 0' }}></div>
              {/* Top-left diagonal flag stripe — Green overlay */}
              <div className="absolute -top-2 sm:-top-4 -left-8 sm:-left-12 w-[70px] sm:w-[100px] h-[170px] sm:h-[260px] bg-[#155C2B] rotate-[25deg] opacity-90" style={{ borderRadius: '0 0 60px 0' }}></div>

              {/* Bottom-left corner — subtle red bleed */}
              <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 w-[90px] sm:w-[140px] h-[90px] sm:h-[140px] bg-[#B81D1D] rounded-full opacity-40"></div>
              <div className="absolute -bottom-6 sm:-bottom-10 -left-10 sm:-left-16 w-[80px] sm:w-[120px] h-[140px] sm:h-[200px] bg-[#C41E1E] rotate-[30deg] opacity-35" style={{ borderRadius: '0 80px 0 0' }}></div>

              {/* Top-right sun / red circle */}
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4 w-[60px] h-[60px] sm:w-[100px] sm:h-[100px]">
                <div className="absolute inset-0 bg-[#D42020] rounded-full"></div>
                <div className="absolute inset-[4px] sm:inset-[6px] bg-[#E03030] rounded-full opacity-60"></div>
                <div className="absolute inset-[10px] sm:inset-[15px] rounded-full bg-[#8B1A1A] opacity-30"></div>
              </div>

              {/* Bottom-right monument silhouette */}
              <div className="absolute bottom-0 right-2 sm:right-4 opacity-[0.12] flex flex-col items-center">
                <div className="relative w-[45px] sm:w-[70px] h-[60px] sm:h-[90px]">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[22px] sm:border-l-[35px] border-l-transparent border-r-[22px] sm:border-r-[35px] border-r-transparent border-b-[60px] sm:border-b-[90px] border-b-[#90C9A0]"></div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] sm:border-l-[22px] border-l-transparent border-r-[14px] sm:border-r-[22px] border-r-transparent border-b-[40px] sm:border-b-[65px] border-b-[#60A070]"></div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] sm:border-l-[12px] border-l-transparent border-r-[8px] sm:border-r-[12px] border-r-transparent border-b-[25px] sm:border-b-[45px] border-b-[#40804C]"></div>
                </div>
              </div>

              {/* Inner border */}
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-[#2a5c34]/50"></div>

              {/* === CARD CONTENT === */}
              <div className="absolute inset-0 p-3 sm:p-7 flex flex-col z-10">
                
                {/* Title */}
                <div className="text-center mb-2 sm:mb-6 mt-0 sm:mt-1">
                  <h1 className="text-[1.4rem] sm:text-[2.8rem] font-extrabold text-[#F4E8D3] tracking-wider inline-block relative drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                    চাঁদা কার্ড
                    <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 -translate-x-1/2 w-[110%] h-[2px] sm:h-[3px] bg-gradient-to-r from-transparent via-[#E51118] to-transparent rounded-full"></div>
                  </h1>
                </div>

                {/* Main Body */}
                <div className="flex gap-2.5 sm:gap-5 flex-1 items-center relative z-20">
                  
                  {/* Photo Placeholder */}
                  <div className="w-[75px] h-[95px] sm:w-[125px] sm:h-[148px] rounded-lg sm:rounded-xl overflow-hidden shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border sm:border-2 border-[#D4C5A0]/60 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#8A919A] via-[#6B7280] to-[#4B5563]"></div>
                    <User className="w-[65px] h-[65px] sm:w-[100px] sm:h-[100px] text-[#374151] absolute bottom-[-8px] sm:bottom-[-16px] left-1/2 -translate-x-1/2 drop-shadow-md" strokeWidth={1.2} />
                    {/* Subtle inner frame */}
                    <div className="absolute inset-[2px] sm:inset-1 rounded-md sm:rounded-lg border border-white/10"></div>
                  </div>

                  {/* Info Column */}
                  <div className="flex-1 space-y-1 sm:space-y-3">
                    
                    {/* Name */}
                    <div className="flex items-center gap-1.5 sm:gap-2.5 pb-1 sm:pb-2 border-b border-[#D4C5A0]/20">
                      <div className="w-4 h-4 sm:w-7 sm:h-7 rounded-full border sm:border-[1.5px] border-[#D4C5A0]/70 flex items-center justify-center shrink-0 bg-[#D4C5A0]/10">
                        <User className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#D4C5A0]" />
                      </div>
                      <span className="text-[#D4C5A0]/80 font-semibold text-[10px] sm:text-base shrink-0">নাম :</span>
                      <span className="text-[#F4E8D3] font-bold text-xs sm:text-xl tracking-wide truncate drop-shadow-sm">{currentUser.name}</span>
                    </div>

                    {/* Profession */}
                    <div className="flex items-center gap-1.5 sm:gap-2.5 pb-1 sm:pb-2 border-b border-[#D4C5A0]/20">
                      <div className="w-4 h-4 sm:w-7 sm:h-7 rounded-full border sm:border-[1.5px] border-[#D4C5A0]/70 flex items-center justify-center shrink-0 bg-[#D4C5A0]/10">
                        <GraduationCap className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#D4C5A0]" />
                      </div>
                      <span className="text-[#D4C5A0]/80 font-semibold text-[10px] sm:text-base shrink-0">পেশা :</span>
                      <span className="text-[#F4E8D3] font-semibold text-xs sm:text-xl tracking-wide truncate">{currentUser.profession}</span>
                    </div>

                    {/* Monthly Chanda */}
                    <div className="flex items-center gap-1.5 sm:gap-2.5">
                      <div className="w-4 h-4 sm:w-7 sm:h-7 rounded-full border sm:border-[1.5px] border-[#D4C5A0]/70 flex items-center justify-center shrink-0 bg-[#D4C5A0]/10">
                        <Coins className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#D4C5A0]" />
                      </div>
                      <span className="text-[#D4C5A0]/80 font-semibold text-[10px] sm:text-base shrink-0">মাসিক চাঁদা-</span>
                      <div className="bg-[#F4E8D3] text-[#0A2313] px-1.5 py-0 sm:px-3 sm:py-1 rounded sm:rounded-md shadow-md flex-1 text-center font-bold text-[10px] sm:text-base whitespace-nowrap tracking-wide">
                        {enToBnNumber(monthlyChanda)} টাকা
                      </div>
                    </div>

                    {/* Weekly Chanda */}
                    <div className="flex items-center gap-1.5 sm:gap-2.5">
                      <div className="w-4 h-4 sm:w-7 sm:h-7 rounded-full border sm:border-[1.5px] border-[#D4C5A0]/70 flex items-center justify-center shrink-0 bg-[#D4C5A0]/10">
                        <Calendar className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#D4C5A0]" />
                      </div>
                      <span className="text-[#D4C5A0]/80 font-semibold text-[10px] sm:text-base shrink-0">সাপ্তাহিক চাঁদা-</span>
                      <div className="bg-[#F4E8D3] text-[#0A2313] px-1.5 py-0 sm:px-3 sm:py-1 rounded sm:rounded-md shadow-md flex-1 text-center font-bold text-[10px] sm:text-base whitespace-nowrap tracking-wide">
                        {enToBnNumber(weeklyChanda)} টাকা
                      </div>
                    </div>

                  </div>
                </div>

                {/* Bottom Slogan */}
                <div className="absolute bottom-2 sm:bottom-4 left-0 w-full flex items-center justify-center gap-1.5 sm:gap-2 z-10">
                  <div className="h-[1px] sm:h-[2px] w-4 sm:w-10 bg-gradient-to-r from-transparent to-[#E51118]"></div>
                  <div className="h-[1px] sm:h-[2px] w-3 sm:w-6 bg-[#2E6B42]"></div>
                  <span className="text-[#D4C5A0] text-[9px] sm:text-base opacity-80 px-1 sm:px-2 italic tracking-widest" style={{ fontFamily: 'Georgia, serif' }}>We have a plan</span>
                  <div className="h-[1px] sm:h-[2px] w-3 sm:w-6 bg-[#2E6B42]"></div>
                  <div className="h-[1px] sm:h-[2px] w-4 sm:w-10 bg-gradient-to-l from-transparent to-[#E51118]"></div>
                </div>
                
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[560px] px-2">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 bg-[#0d3118] hover:bg-[#164225] border border-[#2a5c34] text-[#D4C5A0] font-semibold py-3.5 px-5 rounded-xl transition-all duration-200 flex justify-center items-center gap-2.5 shadow-lg hover:shadow-xl"
              >
                <Download className="h-5 w-5" />
                {downloading ? 'Generating...' : 'Download Card'}
              </button>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  navigate('/dashboard');
                }}
                className="flex-1 bg-[#C41E1E] hover:bg-[#D42020] text-white font-semibold py-3.5 px-5 rounded-xl transition-all duration-200 flex justify-center items-center gap-2.5 shadow-lg hover:shadow-xl"
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
