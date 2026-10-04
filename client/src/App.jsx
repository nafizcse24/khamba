import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Account from './pages/Account';
import Login from './pages/Login';
import Register from './pages/Register';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return currentUser ? children : <Navigate to="/login" />;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-900 flex flex-col relative overflow-hidden">
      {/* Low opacity background artistic blobs for website attraction */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[30%] left-[20%] w-[40vw] h-[40vw] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff', borderRadius: '12px' } }} />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/transactions" 
              element={
                <PrivateRoute>
                  <Transactions />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/account" 
              element={
                <PrivateRoute>
                  <Account />
                </PrivateRoute>
              } 
            />
          </Routes>
        </div>
        <footer className="w-full border-t border-gray-100/50 bg-white/40 backdrop-blur-md py-4 text-center text-sm text-gray-500">
          Developed by <span className="font-semibold text-blue-600">Nafiz</span> · © {new Date().getFullYear()} khambaPay
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
