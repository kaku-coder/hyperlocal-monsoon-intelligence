import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { sendOtpApi, verifyOtpApi, loginUserApi, registerUserApi } from '../services/api';
import {
  CloudRain,
  Smartphone,
  KeyRound,
  UserPlus,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';

export const AuthPage = () => {
  const { loginUserSession, setSelectedDistrict, setSelectedBlock } = useApp();

  const [mode, setMode] = useState('login');
  const [otpStep, setOtpStep] = useState(1);

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pincode, setPincode] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [generatedDemoOtp, setGeneratedDemoOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const resetFields = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setOtpStep(1);
    setOtpCode('');
    setGeneratedDemoOtp('');
  };

  const switchMode = (m) => {
    setMode(m);
    resetFields();
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!phoneNumber || !password) {
      setErrorMsg('Please enter your Phone Number and Password');
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
    } else {
      setErrorMsg(res.message || 'Invalid phone number or password.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || !phoneNumber || !password || !pincode) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (phoneNumber.length < 10) {
      setErrorMsg('Phone Number must be a valid 10-digit number.');
      return;
    }

    if (pincode.length !== 6) {
      setErrorMsg('Pincode must be a valid 6-digit number.');
      return;
    }

    setLoading(true);
    const res = await registerUserApi({
      name,
      phoneNumber,
      password,
      pincode,
      district: 'Kendrapara',
      block: 'Rajkanika',
      role: 'FARMER'
    });
    setLoading(false);

    if (res.status === 'success' && res.token) {
      setSuccessMsg('Account created successfully!');
      loginUserSession(res.user, res.token);
      if (res.user?.district && res.user?.block) {
        setSelectedDistrict(res.user.district);
        setSelectedBlock(res.user.block);
      }
    } else {
      setErrorMsg(res.message || 'Registration failed. Phone number may already be registered.');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!phoneNumber || phoneNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Mobile Number');
      return;
    }

    setLoading(true);
    const res = await sendOtpApi(phoneNumber);
    setLoading(false);

    if (res.status === 'success') {
      setOtpStep(2);
      setSuccessMsg(`OTP sent to +91 ${phoneNumber}`);
      if (res.demo_otp) {
        setGeneratedDemoOtp(res.demo_otp);
      }
    } else {
      setErrorMsg(res.message || 'Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otpCode) {
      setErrorMsg('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    const res = await verifyOtpApi({
      phoneNumber,
      otp: otpCode,
      name: name || 'Farmer',
      pincode: pincode || '754212',
      district: 'Kendrapara',
      block: 'Rajkanika'
    });
    setLoading(false);

    if (res.status === 'success' && res.token) {
      setSuccessMsg('OTP verified & logged in!');
      loginUserSession(res.user, res.token);
      if (res.user?.district && res.user?.block) {
        setSelectedDistrict(res.user.district);
        setSelectedBlock(res.user.block);
      }
    } else {
      setErrorMsg(res.message || 'Invalid or expired OTP.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-8 min-h-[calc(100vh-8rem)]">
      <div className="w-full max-w-md space-y-8">

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg shadow-sky-500/25">
            <CloudRain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              MoES Monsoon Intel
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Sign in to access localized advisories & alerts
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 shadow-2xl space-y-6">

          {/* Mode Tabs */}
          <div className="flex rounded-xl bg-slate-950 border border-slate-800 p-1 text-xs font-bold">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => switchMode('register')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Create Account</span>
            </button>
            <button
              onClick={() => switchMode('otp')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all cursor-pointer ${
                mode === 'otp'
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>OTP Login</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs font-medium">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN */}
          {mode === 'login' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">+91</span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-700/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Sign In</span>}
              </button>

              <p className="text-[11px] text-center text-slate-500 pt-1">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-sky-400 font-bold hover:underline cursor-pointer"
                >
                  Create one
                </button>
              </p>
            </form>
          )}

          {/* CREATE ACCOUNT */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra Behera"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">+91</span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-amber-400" />
                    Area Pincode
                  </span>
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 754212"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min 6 chars)"
                    className="w-full px-4 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-700/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Create Account</span>}
              </button>

              <p className="text-[11px] text-center text-slate-500 pt-1">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-sky-400 font-bold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* OTP LOGIN */}
          {mode === 'otp' && (
            <div>
              {otpStep === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Enter Mobile Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">+91</span>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="9876543210"
                        maxLength={10}
                        className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-700/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <><span>Send OTP</span> <ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  {generatedDemoOtp && (
                    <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-700/50 text-xs space-y-2">
                      <div className="flex items-center justify-between text-amber-300 font-bold">
                        <span>Demo OTP:</span>
                        <span className="font-mono text-base tracking-widest text-white bg-slate-950 px-3 py-1 rounded-lg border border-amber-600">
                          {generatedDemoOtp}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpCode(generatedDemoOtp)}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Auto-Fill OTP
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Enter 6-Digit OTP
                    </label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full px-4 py-3 bg-slate-950 border border-sky-600 rounded-xl text-lg font-mono font-bold tracking-[0.3em] text-center text-amber-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setOtpStep(1)}
                      className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Verify & Sign In</span>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-600">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            MoES Secured
          </span>
          <span>•</span>
          <span>All users are registered Farmers</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
