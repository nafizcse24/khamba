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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar />
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff' } }} />
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
      <footer className="w-full border-t border-gray-100 bg-white py-4 text-center text-sm text-gray-400">
        Developed by <span className="font-semibold text-blue-600">Nafiz</span> · © {new Date().getFullYear()} khambaPay
      </footer>
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
