import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wallet, LogOut, UserCircle, Menu, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="bg-blue-600 group-hover:bg-blue-700 p-1.5 rounded-lg transition-colors">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">khambaPay</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-6">
            {currentUser ? (
              <>
                <Link to="/account" className="flex items-center gap-2 group hover:bg-gray-50 px-3 py-1.5 rounded-xl transition-colors focus:ring-2 focus:ring-blue-100 outline-none">
                  <div className="bg-gray-100 p-1.5 rounded-full group-hover:bg-blue-100 transition-colors">
                    <UserCircle className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors truncate max-w-[150px]">
                    {currentUser.name}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-medium transition-colors focus:outline-none"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex gap-4 items-center">
                <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium px-2 py-2 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-xl transition-colors shadow-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="sm:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-900 focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top-2 duration-200 shadow-lg absolute w-full">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {currentUser ? (
              <>
                <Link 
                  to="/account" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="bg-gray-100 p-2 rounded-full">
                    <UserCircle className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">View Account</p>
                  </div>
                </Link>
                
                <div className="h-px bg-gray-100 my-2 mx-3"></div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 text-left rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                >
                  <div className="p-2">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 p-3">
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center text-gray-600 hover:text-gray-900 font-medium py-3 rounded-xl bg-gray-50 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
