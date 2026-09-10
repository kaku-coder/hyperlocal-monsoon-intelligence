import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { mobileLoginApi, registerUserApi } from '../services/api';
import {
  CloudRain,
  Smartphone,
  UserPlus,
  MapPin,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  Crosshair,
  LocateFixed,
  KeyRound
} from 'lucide-react';

const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address || {};
    const pincode = addr.postcode || '';
    const district = addr.state_district || addr.county || '';
    const block = addr.suburb || addr.village || addr.town || addr.city || district;
    return { pincode: pincode.replace(/\s/g, ''), district, block };
  } catch {
    return null;
  }
};

const lookupPincode = async (pin) => {
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data[0]?.Status === 'Success' && data[0]?.PostOffice?.length) {
      const po = data[0].PostOffice[0];
      return { district: po.District, block: po.Block || po.Name, state: po.State };
    }
    return null;
  } catch {
    return null;
  }
};

export const AuthPage = () => {
  const { loginUserSession, setSelectedDistrict, setSelectedBlock } = useApp();

  const [mode, setMode] = useState('login');

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pincode, setPincode] = useState('');
  const [district, setDistrict] = useState('');
  const [block, setBlock] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [geoLoading, setGeoLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState('');
  const [locationFetched, setLocationFetched] = useState(false);

  const fetchMyLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation not supported by browser');
      return;
    }

    setGeoLoading(true);
    setGeoStatus('Detecting your location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const geo = await reverseGeocode(latitude, longitude);

        if (geo) {
          if (geo.pincode) setPincode(geo.pincode);
          if (geo.district) setDistrict(geo.district);
          if (geo.block) setBlock(geo.block);
          setLocationFetched(true);
          setGeoStatus(`Detected: ${geo.district || ''}, ${geo.block || ''} (${geo.pincode || ''})`);

          if (geo.pincode && !geo.district) {
            const detail = await lookupPincode(geo.pincode);
            if (detail) {
              setDistrict(detail.district);
              setBlock(detail.block);
              setGeoStatus(`Detected: ${detail.district}, ${detail.block} (${geo.pincode})`);
            }
          }
        } else {
          setGeoStatus('Could not determine location. Enter pincode manually.');
        }
        setGeoLoading(false);
      },
      () => {
        setGeoStatus('Location permission denied. Enter pincode manually.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    if (mode === 'register' && !locationFetched && !geoLoading) {
      fetchMyLocation();
    }
  }, [mode, locationFetched, geoLoading, fetchMyLocation]);

  const handlePincodeChange = async (val) => {
    setPincode(val);
    if (val.length === 6) {
      const detail = await lookupPincode(val);
      if (detail) {
        setDistrict(detail.district);
        setBlock(detail.block);
      }
    } else {
      setDistrict('');
      setBlock('');
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleMobileLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!phoneNumber) {
      setErrorMsg('Please enter your Mobile Number');
      return;
    }

    if (phoneNumber.length < 10) {
      setErrorMsg('Enter a valid 10-digit Mobile Number');
      return;
    }

    setLoading(true);
    const res = await mobileLoginApi(phoneNumber);
    setLoading(false);

    if (res.status === 'success' && res.token) {
      setSuccessMsg('Logged in successfully!');
      loginUserSession(res.user, res.token);
      if (res.user?.district && res.user?.block) {
        setSelectedDistrict(res.user.district);
        setSelectedBlock(res.user.block);
      }
    } else {
      setErrorMsg(res.message || 'Login failed. Please try again.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || !phoneNumber) {
      setErrorMsg('Please fill in Name and Mobile Number.');
      return;
    }

    if (phoneNumber.length < 10) {
      setErrorMsg('Mobile Number must be a valid 10-digit number.');
      return;
    }

    setLoading(true);
    const res = await registerUserApi({
      name,
      phoneNumber,
      password: `Farmer_${phoneNumber}`,
      pincode: pincode || '754212',
      district: district || 'Kendrapara',
      block: block || 'Rajkanika',
      role: 'FARMER'
    });
    setLoading(false);

    if (res.status === 'success' && res.token) {
      setSuccessMsg('Account created & logged in!');
      loginUserSession(res.user, res.token);
      if (res.user?.district && res.user?.block) {
        setSelectedDistrict(res.user.district);
        setSelectedBlock(res.user.block);
      }
    } else {
      setErrorMsg(res.message || 'Registration failed. Phone may already be registered.');
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
              Cloud alerts & weather updates sent to your mobile
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

          {/* SIGN IN — Mobile Number Only */}
          {mode === 'login' && (
            <form onSubmit={handleMobileLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="h-3 w-3 text-sky-400" />
                    Enter your Mobile Number
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">+91</span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    autoFocus
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm font-semibold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Cloud & weather alerts will be sent to this number
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-700/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <><span>Sign In</span> <ArrowRight className="h-4 w-4" /></>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-500 pt-1">
                New farmer?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="text-sky-400 font-bold hover:underline cursor-pointer"
                >
                  Create Account
                </button>
              </p>
            </form>
          )}

          {/* CREATE ACCOUNT — Name + Mobile + Auto Location */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra Behera"
                  autoFocus
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="h-3 w-3 text-sky-400" />
                    Mobile Number
                  </span>
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

              {/* Auto Location Detection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-amber-400" />
                      Area Pincode
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={fetchMyLocation}
                    disabled={geoLoading}
                    className="flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {geoLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <LocateFixed className="h-3 w-3" />
                    )}
                    {geoLoading ? 'Detecting...' : 'Auto Detect'}
                  </button>
                </div>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => handlePincodeChange(e.target.value)}
                  placeholder="Auto-detected or type 6-digit pincode"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
                {geoStatus && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Crosshair className="h-3 w-3 flex-shrink-0" />
                    <span>{geoStatus}</span>
                  </div>
                )}
              </div>

              {/* Auto-filled District & Block */}
              {(district || block) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">District</div>
                    <div className="text-xs font-semibold text-emerald-300 truncate">{district}</div>
                  </div>
                  <div className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2.5">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Block</div>
                    <div className="text-xs font-semibold text-amber-300 truncate">{block}</div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-700/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <><span>Create Account</span> <ArrowRight className="h-4 w-4" /></>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-500 pt-1">
                Already registered?{' '}
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
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-600">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            MoES Secured
          </span>
          <span>•</span>
          <span>Weather alerts via SMS</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
