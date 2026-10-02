import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { UserCircle, Mail, Briefcase, Calendar, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Account = () => {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link to="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Account</h1>
          <p className="text-gray-500 mt-1">Manage your profile and account settings</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-slate-900 px-8 py-10 text-white flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <UserCircle className="w-48 h-48" />
          </div>
          
          <div className="bg-white/10 p-4 rounded-full backdrop-blur-md relative z-10 border border-white/20">
            <UserCircle className="h-16 w-16 text-white" />
          </div>
          
          <div className="text-center sm:text-left relative z-10">
            <h2 className="text-3xl font-bold">{currentUser.name}</h2>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Verified Member</span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
          
          <div className="space-y-6">
            
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email Address</p>
                <p className="text-gray-900 font-semibold mt-1">{currentUser.email}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Profession</p>
                <p className="text-gray-900 font-semibold mt-1 capitalize">{currentUser.profession}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Joined khambaPay</p>
                <p className="text-gray-900 font-semibold mt-1">
                  {new Date(currentUser.createdAt || Date.now()).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Account;
