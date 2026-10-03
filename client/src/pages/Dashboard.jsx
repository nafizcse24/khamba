import { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { CreditCard, Clock, Receipt, ArrowUpCircle, X, Wallet, Briefcase, TrendingUp, CheckCircle2, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SkeletonCard = () => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="h-10 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
  </div>
);

const SkeletonRow = () => (
  <div className="p-4 sm:px-6 flex items-center justify-between animate-pulse">
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
    <div className="h-5 bg-gray-200 rounded w-16"></div>
  </div>
);

const Dashboard = () => {
  const { currentUser, token, refreshUser } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);

  // States for Chanda Payment
  const [isChandaModalOpen, setIsChandaModalOpen] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [showChandaSuccess, setShowChandaSuccess] = useState(false);

  // States for Recharge
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [rechargeStep, setRechargeStep] = useState('INPUT'); // INPUT, CONFIRM, SUCCESS
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [lastRechargeTxId, setLastRechargeTxId] = useState('');

  const fetchDashboardData = useCallback(async () => {
    try {
      const [txRes, profRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/payments/transactions?limit=5`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${import.meta.env.VITE_API_URL}/professions`)
      ]);
      setTransactions(txRes.data.transactions);
      setProfessions(profRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setInitialLoad(false);
    }
  }, [token]);

  useEffect(() => {
    if (currentUser && token) {
      fetchDashboardData();
    }
  }, [currentUser, token, fetchDashboardData]);

  const playSuccessSound = () => {
    const audio = new Audio('/success.mp3');
    audio.play().catch(e => console.error('Audio playback failed:', e));
  };

  const handlePayChanda = async () => {
    setPayLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/payments/chanda`,
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsChandaModalOpen(false);
      setShowChandaSuccess(true);
      setTimeout(() => setShowChandaSuccess(false), 5000);
      playSuccessSound();
      fetchDashboardData();
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to pay chanda');
    } finally {
      setPayLoading(false);
    }
  };

  const openRechargeModal = () => {
    setRechargeStep('INPUT');
    setRechargeAmount('');
    setLastRechargeTxId('');
    setIsRechargeModalOpen(true);
  };

  const handleRechargeRequest = (e) => {
    e.preventDefault();
    const amount = Number(rechargeAmount);
    if (!amount || amount <= 0) {
      return toast.error('Enter a valid amount to recharge');
    }
    setRechargeStep('CONFIRM');
  };

  const handleConfirmRecharge = async () => {
    setRechargeLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/recharge`,
        { amount: Number(rechargeAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLastRechargeTxId(res.data.transaction.transactionId);
      setRechargeStep('SUCCESS');
      fetchDashboardData();
      refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to recharge account');
      setRechargeStep('INPUT');
    } finally {
      setRechargeLoading(false);
    }
  };

  if (!currentUser) return null;

  // Determine required chanda amount
  const userProfessionObj = professions.find(p => p.name === currentUser.profession);
  const requiredAmount = userProfessionObj ? userProfessionObj.amount : 0;
  const isBalanceSufficient = currentUser.balance >= requiredAmount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Section: Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* 1. Balance Card */}
        {initialLoad ? <SkeletonCard /> : (
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-slate-300 font-medium text-sm tracking-wide uppercase">Current Balance</h3>
                  <div className="text-3xl sm:text-4xl font-bold mt-1 tracking-tight">
                    BDT {currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <button
                  onClick={openRechargeModal}
                  disabled={currentUser.balance >= 100}
                  className="w-full bg-blue-500 hover:bg-blue-400 text-white font-medium py-3 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
                >
                  <ArrowUpCircle className="h-5 w-5" />
                  Recharge Balance
                </button>
                {currentUser.balance >= 100 && (
                  <p className="text-xs text-blue-200 text-center font-medium bg-blue-900/20 py-1.5 rounded-lg">
                    Recharge locked. Balance must be below BDT 100.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. Profession Card */}
        {initialLoad ? <SkeletonCard /> : (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4 text-blue-600 bg-blue-50 w-fit p-3 rounded-2xl">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-gray-500 font-medium text-sm tracking-wide uppercase">Current Profession</h3>
              <div className="text-2xl font-bold text-gray-900 mt-1 font-['Hind_Siliguri']">
                {currentUser.profession}
              </div>
              <p className="text-[12px] text-gray-400 mt-3 leading-relaxed italic font-['Hind_Siliguri']">
                আপনার income আপনার ব্যাপার, <br />
                কিন্তু চাঁদার হিসাবটা আমাদের ব্যাপার।
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-50">
              <div className="text-sm text-gray-500 flex justify-between items-center">
                <span>Weekly Chanda Tier</span>
                <span className="font-semibold text-gray-900">BDT {requiredAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} / wk</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Chanda Payment Card */}
        {initialLoad ? <SkeletonCard /> : (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 w-fit p-3 rounded-2xl">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-['Hind_Siliguri']">
                  {currentUser.profession}
                </span>
              </div>
              <h3 className="text-gray-500 font-medium text-sm tracking-wide uppercase">Chanda Due</h3>
              <div className="text-2xl font-bold text-gray-900 mt-1 mb-3">
                BDT {requiredAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-500">
                Balance: <span className={isBalanceSufficient ? 'text-gray-900 font-medium' : 'text-rose-600 font-medium'}>BDT {currentUser.balance}</span>
              </div>
            </div>
            <button
              onClick={() => setIsChandaModalOpen(true)}
              className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-colors flex justify-center items-center gap-2"
            >
              <CreditCard className="h-5 w-5" />
              Pay Chanda
            </button>
          </div>
        )}
      </div>

      {/* Bottom Section: Transactions */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Recent Transactions</h3>
          </div>
          <Link to="/transactions" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all
          </Link>
        </div>
        
        <div className="divide-y divide-gray-50">
          {initialLoad ? (
            Array(3).fill(0).map((_, i) => <SkeletonRow key={i} />)
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-gray-400 flex flex-col items-center">
              <Receipt className="h-12 w-12 mb-3 opacity-20" />
              <p>No transactions found.</p>
            </div>
          ) : (
            transactions.map((tx) => {
              const isRecharge = tx.type === 'RECHARGE';
              const isSuccess = tx.status === 'SUCCESS';
              
              return (
                <div key={tx._id} className="p-4 sm:px-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${isSuccess ? (isRecharge ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600') : 'bg-slate-100 text-slate-500'}`}>
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 capitalize">
                          {tx.type.replace('_', ' ').toLowerCase()}
                        </p>
                        {!isSuccess && (
                          <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">Failed</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[180px] sm:max-w-none">
                        {new Date(tx.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} • ID: {tx.transactionId.substring(0,8)}...
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold ${isSuccess ? (isRecharge ? 'text-emerald-600' : 'text-gray-900') : 'text-slate-400 line-through'}`}>
                    {isRecharge ? '+' : '-'} BDT {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chanda Confirmation Modal (Invoice) */}
      {isChandaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-lg">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsChandaModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
            <div className="text-center mb-6">
              <div className="bg-blue-50 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Payment Invoice</h2>
              <p className="text-sm text-gray-500 mt-1">Review your weekly chanda details.</p>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-sm border border-gray-100">
              
              {/* Item Details */}
              <div className="space-y-3 mb-4 pb-4 border-b border-dashed border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Tier (<span className="font-['Hind_Siliguri']">{currentUser.profession}</span>)</span>
                  <span className="font-medium text-gray-900">BDT {requiredAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Balance Calculation */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Before Balance</span>
                  <span className="font-medium text-gray-900">
                    BDT {currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-rose-600">
                  <span>Deduction</span>
                  <span className="font-medium">
                    - BDT {requiredAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="pt-3 mt-1 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">After Balance</span>
                  <span className={`font-bold text-lg ${isBalanceSufficient ? 'text-emerald-600' : 'text-rose-600'}`}>
                    BDT {(currentUser.balance - requiredAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayChanda}
              disabled={payLoading || !isBalanceSufficient}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center shadow-md"
            >
              {payLoading ? 'Processing...' : (isBalanceSufficient ? 'Confirm Payment' : 'Insufficient Balance')}
            </button>
          </div>
        </div>
      )}

      {/* Advanced Recharge Modal */}
      {isRechargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-lg">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            {/* Common Close Button unless in success state */}
            {rechargeStep !== 'SUCCESS' && (
              <button onClick={() => setIsRechargeModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            )}

            {rechargeStep === 'INPUT' && (
              <>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Recharge Balance</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Current Balance: <span className="font-semibold text-gray-900">BDT {currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </p>
                </div>
                
                <form onSubmit={handleRechargeRequest}>
                  <div className="mb-6">
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      required
                      autoFocus
                      className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-center text-2xl font-bold bg-gray-50"
                      placeholder="BDT 0.00"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[500, 1000, 2000, 5000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setRechargeAmount(amt.toString())}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-2 rounded-xl transition-colors border border-emerald-100"
                      >
                        + BDT {amt}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3.5 rounded-xl transition-all flex justify-center items-center text-lg shadow-md"
                  >
                    Proceed
                  </button>
                </form>
              </>
            )}

            {rechargeStep === 'CONFIRM' && (
              <>
                <div className="text-center mb-6">
                  <div className="bg-emerald-50 text-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowUpCircle className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Confirm Deposit</h2>
                  <p className="text-sm text-gray-500 mt-2">Please review your recharge request.</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 mb-6 text-center space-y-2 border border-gray-100">
                  <p className="text-sm text-gray-500">Amount to add</p>
                  <p className="text-3xl sm:text-4xl font-bold text-gray-900">BDT {Number(rechargeAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setRechargeStep('INPUT')}
                    disabled={rechargeLoading}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-all disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmRecharge}
                    disabled={rechargeLoading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center shadow-lg shadow-emerald-500/30"
                  >
                    {rechargeLoading ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </>
            )}

            {rechargeStep === 'SUCCESS' && (
              <div className="text-center pt-4">
                <div className="bg-emerald-100 text-emerald-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Recharge Successful!</h2>
                <p className="text-gray-500 mb-6">Your balance has been updated immediately.</p>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100 text-left">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Transaction ID</p>
                  <p className="text-sm font-mono text-gray-900 break-all">{lastRechargeTxId}</p>
                </div>

                <button
                  onClick={() => setIsRechargeModalOpen(false)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-all shadow-md"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fullscreen Blurred Chanda Success Modal */}
      {showChandaSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-300 flex flex-col items-center relative">
            <div className="absolute -top-12 -left-12 animate-bounce delay-100">
              <Sparkles className="h-24 w-24 text-yellow-400 opacity-80" />
            </div>
            <div className="absolute -bottom-12 -right-12 animate-bounce delay-300">
              <Sparkles className="h-24 w-24 text-blue-400 opacity-80" />
            </div>
            <div className="bg-emerald-100 p-5 rounded-full mb-6 shadow-inner animate-pulse">
              <CheckCircle2 className="h-16 w-16 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 text-center leading-relaxed">
              চাদা দিয়ে নিরাপদে থাকার জন্য আপনাকে ধন্যবাদ।
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
