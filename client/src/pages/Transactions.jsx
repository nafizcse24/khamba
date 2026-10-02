import { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { Receipt, Search, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SkeletonRow = () => (
  <div className="p-4 sm:px-6 flex items-center justify-between animate-pulse bg-white">
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 bg-gray-200 rounded-2xl"></div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
    <div className="h-5 bg-gray-200 rounded w-16"></div>
  </div>
);

const Transactions = () => {
  const { token } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchTransactions = useCallback(async (pageNumber, isLoadMore = false) => {
    if (!isLoadMore) setLoading(true);
    else setLoadingMore(true);

    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/payments/transactions?page=${pageNumber}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (isLoadMore) {
        setTransactions(prev => [...prev, ...data.transactions]);
      } else {
        setTransactions(data.transactions);
      }
      
      setTotalPages(data.pages);
      setTotalCount(data.total);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
      toast.error('Could not load transactions.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTransactions(1, false);
  }, [fetchTransactions]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTransactions(nextPage, true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Transaction History</h1>
          <p className="text-gray-500 mt-1">Showing {transactions.length} of {totalCount} transactions</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-5 md:col-span-4 pl-2">Transaction Detail</div>
          <div className="hidden md:block col-span-3 text-center">Txn ID</div>
          <div className="col-span-4 md:col-span-3 text-center">Date</div>
          <div className="col-span-3 md:col-span-2 text-right pr-2">Amount</div>
        </div>

        <div className="divide-y divide-gray-50">
          {loading ? (
            Array(5).fill(0).map((_, i) => <SkeletonRow key={i} />)
          ) : transactions.length === 0 ? (
            <div className="p-16 text-center text-gray-400 flex flex-col items-center">
              <Search className="h-12 w-12 mb-3 opacity-20" />
              <p className="text-lg font-medium text-gray-900 mb-1">No transactions</p>
              <p>You haven't made any payments or recharges yet.</p>
            </div>
          ) : (
            transactions.map((tx) => {
              const isRecharge = tx.type === 'RECHARGE';
              const isSuccess = tx.status === 'SUCCESS';
              
              return (
                <div key={tx._id} className="p-4 sm:px-4 hover:bg-slate-50 transition-colors grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  
                  {/* Detail Column */}
                  <div className="col-span-12 sm:col-span-5 md:col-span-4 flex items-center gap-4">
                    <div className={`p-3 rounded-2xl shrink-0 ${isSuccess ? (isRecharge ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600') : 'bg-slate-100 text-slate-500'}`}>
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 capitalize leading-none">
                          {tx.type.replace('_', ' ').toLowerCase()}
                        </p>
                        {!isSuccess && (
                          <span className="text-[10px] font-bold tracking-wider uppercase bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">Failed</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">
                        {tx.description}
                      </p>
                    </div>
                  </div>

                  {/* ID Column (hidden on mobile) */}
                  <div className="hidden md:block col-span-3 text-center">
                    <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {tx.transactionId.substring(0, 8)}...
                    </code>
                  </div>

                  {/* Date Column */}
                  <div className="hidden sm:block col-span-4 md:col-span-3 text-center">
                    <p className="text-sm text-gray-600">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Amount Column */}
                  <div className="col-span-12 sm:col-span-3 md:col-span-2 flex justify-between sm:justify-end items-center sm:pr-2">
                    {/* Mobile Date (visible only on small screens) */}
                    <div className="sm:hidden text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </div>
                    
                    <div className={`font-bold text-lg ${isSuccess ? (isRecharge ? 'text-emerald-600' : 'text-gray-900') : 'text-slate-400 line-through'}`}>
                      {isRecharge ? '+' : '-'} BDT {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>

      {page < totalPages && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="bg-white border border-gray-200 text-gray-700 font-medium py-2.5 px-6 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
          >
            {loadingMore ? 'Loading...' : 'Load More Transactions'}
          </button>
        </div>
      )}
      
    </div>
  );
};

export default Transactions;
