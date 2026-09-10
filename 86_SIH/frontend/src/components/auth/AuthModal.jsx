import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { sendOtpApi, verifyOtpApi, loginUserApi, registerUserApi } from '../../services/api';
import { 
  X, 
  Smartphone, 
  KeyRound, 
  User, 
  MapPin, 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Sparkles,
  Lock
} from 'lucide-react';

export const AuthModal = ({ isOpen, onClose }) => {
  const { loginUserSession, setSelectedDistrict, setSelectedBlock } = useApp();

  // Mode: 'otp' or 'password'
  const [authMode, setAuthMode] = useState('otp');
  // Sub-mode for password: 'login' or 'register'
  const [passwordTab, setPasswordTab] = useState('login');

  // OTP State
  const [otpStep, setOtpStep] = useState(1); // 1: Enter Phone, 2: Enter OTP & Details
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [name, setName] = useState('');
  const [pincode, setPincode] = useState('754212');
  const [demoOtpNotice, setDemoOtpNotice] = useState('');

  // Password Registration/Login State
  const [password, setPassword] = useState('');
  const [district, setDistrict] = useState('Kendrapara');
  const [block, setBlock] = useState('Rajkanika');
  const [role, setRole] = useState('FARMER');

  // Status & Loading
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // 1. Handle Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!phoneNumber || phoneNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian Mobile Number');
      return;
    }

    setLoading(true);
    const res = await sendOtpApi(phoneNumber);
    setLoading(false);

    if (res.status === 'success') {
      setOtpStep(2);
      setSuccessMsg(`OTP sent to +91 ${phoneNumber}`);
      if (res.demo_otp) {
        setDemoOtpNotice(res.demo_otp);
      }
    } else {
      setErrorMsg(res.message || 'Failed to send OTP. Try again.');
    }
  };

  // 2. Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otpCode || otpCode.length < 4) {
      setErrorMsg('Please enter the OTP received');
      return;
    }

    setLoading(true);
    const res = await verifyOtpApi({
      phoneNumber,
      otp: otpCode,
      name: name || 'Farmer',
      pincode: pincode || '754212',
      district,
      block
    });
    setLoading(false);

    if (res.status === 'success' && res.token) {
      setSuccessMsg('Phone Number Verified! Logging in...');
      loginUserSession(res.user, res.token);
      if (res.user?.district && res.user?.block) {
        setSelectedDistrict(res.user.district);
        setSelectedBlock(res.user.block);
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setErrorMsg(res.message || 'Invalid OTP. Please check and try again.');
    }
  };

  // 3. Handle Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!phoneNumber || !password) {
      setErrorMsg('Please enter Phone Number and Password');
      return;
    }

    setLoading(true);
    const res = await loginUserApi(phoneNumber, password);
    setLoading(false);

    if (res.status === 'success' && res.token) {
      setSuccessMsg('Logged in successfully!');
      loginUserSession(res.user, res.token);
      if (res.user?.district && res.user?.block) {
        setSelectedDistrict(res.user.district);
        setSelectedBlock(res.user.block);
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setErrorMsg(res.message || 'Invalid phone number or password');
    }
  };

  // 4. Handle Password Registration
  const handlePasswordRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || !phoneNumber || !password || !pincode) {
      setErrorMsg('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const res = await registerUserApi({
      name,
      phoneNumber,
      password,
      pincode,
      district,
      block,
      role
    });
    setLoading(false);

    if (res.status === 'success' && res.token) {
      setSuccessMsg('Account registered successfully!');
      loginUserSession(res.user, res.token);
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setErrorMsg(res.message || 'Registration failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Modal Card Container */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl text-slate-100 font-sans">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-md shadow-sky-500/20 text-white font-bold text-xl">
            🌧️
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              MoES Monsoon Intel Auth
            </h2>
            <p className="text-xs text-slate-400">
              Sign in to access localized advisories & alerts
            </p>
          </div>
        </div>

        {/* Primary Auth Mode Toggle (OTP vs Password) */}
        <div className="flex rounded-xl bg-slate-950/80 border border-slate-800 p-1 mb-5 text-xs font-bold">
          <button
            onClick={() => { setAuthMode('otp'); setErrorMsg(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all cursor-pointer ${
              authMode === 'otp'
                ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Mobile OTP Login</span>
          </button>

          <button
            onClick={() => { setAuthMode('password'); setErrorMsg(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all cursor-pointer ${
              authMode === 'password'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="h-4 w-4" />
            <span>Password Login</span>
          </button>
        </div>

        {/* Error / Success Toast Messages */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs font-medium">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs font-medium">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Simulated Demo OTP Toast Alert */}
        {authMode === 'otp' && demoOtpNotice && (
          <div className="mb-4 flex items-center justify-between p-3 rounded-xl bg-sky-950/80 border border-sky-600/80 text-sky-200 text-xs shadow-lg animate-bounce">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Demo OTP: <strong className="text-amber-300 font-mono text-sm tracking-widest">{demoOtpNotice}</strong></span>
            </div>
            <button
              onClick={() => setOtpCode(demoOtpNotice)}
              className="px-2 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded text-[10px] cursor-pointer"
            >
              Auto-Fill
            </button>
          </div>
        )}

        {/* --- 1. MOBILE OTP FORM --- */}
        {authMode === 'otp' && (
          <div>
            {otpStep === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Mobile Phone Number / ମୋବାଇଲ ନମ୍ବର:
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">+91</span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full pl-12 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Send OTP Code</span> <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Enter 6-Digit OTP / ଓଟିପି ଦିଅନ୍ତୁ:
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-sky-500 rounded-xl text-base font-mono font-bold tracking-widest text-center text-amber-300 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="754212"
                      maxLength={6}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setOtpStep(1)}
                    className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Verify & Login</span>}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* --- 2. PASSWORD FORM --- */}
        {authMode === 'password' && (
          <div>
            {/* Sub-tab Toggle */}
            <div className="flex justify-center gap-4 mb-4 text-xs border-b border-slate-800 pb-2">
              <button
                onClick={() => setPasswordTab('login')}
                className={`font-bold transition-colors cursor-pointer ${
                  passwordTab === 'login' ? 'text-emerald-400 border-b-2 border-emerald-400 pb-1' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setPasswordTab('register')}
                className={`font-bold transition-colors cursor-pointer ${
                  passwordTab === 'register' ? 'text-emerald-400 border-b-2 border-emerald-400 pb-1' : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {passwordTab === 'login' ? (
              <form onSubmit={handlePasswordLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Sign In</span>}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePasswordRegister} className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-0.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-0.5">Phone Number</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-0.5">Pincode</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="754212"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-0.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create Password"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-0.5">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-amber-300 font-bold"
                    >
                      <option value="FARMER">FARMER 🌾</option>
                      <option value="OFFICER">OFFICER 🛡️</option>
                      <option value="RESEARCHER">RESEARCHER 🔬</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-0.5">District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 mt-1"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Create Account</span>}
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthModal;
