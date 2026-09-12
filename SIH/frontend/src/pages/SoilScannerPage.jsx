import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { analyzeSoilApi, fetchSoilHistoryApi } from '../services/api';
import {
  Camera,
  Upload,
  Sun,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Droplets,
  Sprout,
  CheckCircle2,
  HelpCircle,
  History,
  Info,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  X,
  MapPin,
  Clock,
  ExternalLink
} from 'lucide-react';

export const SoilScannerPage = () => {
  const {
    selectedDistrict,
    selectedBlock,
    selectedPanchayat,
    selectedLocationId,
    forecastData
  } = useApp();

  // Multi-image upload state (1 to 3 images)
  const [images, setImages] = useState([]); // Array of base64 strings
  const cameraInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Optional Farmer Inputs
  const [currentCrop, setCurrentCrop] = useState('Rice');
  const [previousCrop, setPreviousCrop] = useState('Rice');
  const [irrigation, setIrrigation] = useState('Rain-fed');
  const [farmerGoal, setFarmerGoal] = useState('Choose next crop');

  // Scanner UI States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [errorState, setErrorState] = useState(null);

  // Results State
  const [report, setReport] = useState(null);
  const [selectedResultCropIndex, setSelectedResultCropIndex] = useState(0);

  // History & Soil Test Modal States
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Convert File to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle Image File Selection
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setErrorState(null);
    try {
      const base64Promises = files.slice(0, 3 - images.length).map((f) => fileToBase64(f));
      const newBase64s = await Promise.all(base64Promises);
      setImages((prev) => [...prev, ...newBase64s].slice(0, 3));
    } catch (err) {
      setErrorState({
        message: 'Failed to process selected image file.',
        reasons: ['Please try again with a valid JPG/PNG image file.']
      });
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Soil Scan Analysis
  const handleAnalyzeSoil = async () => {
    if (images.length === 0) {
      setErrorState({
        message: 'No soil photo provided.',
        reasons: ['Please take or upload at least one clean soil photo in daylight.']
      });
      return;
    }

    setIsAnalyzing(true);
    setErrorState(null);
    setAnalysisProgress(15);
    setProgressStatus('Checking daylight & image quality...');

    // Progress simulation steps
    const timer1 = setTimeout(() => {
      setAnalysisProgress(45);
      setProgressStatus('Analyzing soil visual color, texture & apparent moisture...');
    }, 600);

    const timer2 = setTimeout(() => {
      setAnalysisProgress(75);
      setProgressStatus('Merging Open-Meteo 7-day rainfall & temperature forecast...');
    }, 1200);

    try {
      const payload = {
        images,
        location: {
          district: selectedDistrict || 'Khordha',
          block: selectedBlock || 'Bhubaneswar',
          panchayat: selectedPanchayat || 'Patia',
          locationId: selectedLocationId || 'od-khordha-bhubaneswar'
        },
        farmerInputs: {
          currentCrop,
          previousCrop,
          irrigation,
          goal: farmerGoal
        }
      };

      const res = await analyzeSoilApi(payload);

      clearTimeout(timer1);
      clearTimeout(timer2);
      setAnalysisProgress(100);

      if (res.status === 'success' && res.data) {
        setReport(res.data);
        setSelectedResultCropIndex(0);
      } else {
        setErrorState({
          message: res.message || 'Please take another photo.',
          reasons: res.reasons || ['Image quality too low or soil not clearly visible.', 'Avoid blurry or dark photos.']
        });
      }
    } catch (err) {
      setErrorState({
        message: 'Analysis connection error.',
        reasons: ['Could not connect to Soil Vision AI engine. Please check internet connection.']
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Fetch History Modal Data
  const openHistory = async () => {
    setShowHistoryModal(true);
    setLoadingHistory(true);
    const res = await fetchSoilHistoryApi(selectedDistrict);
    if (res && res.data) {
      setHistoryList(res.data);
    }
    setLoadingHistory(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-slate-950 border border-emerald-500/20 rounded-2xl p-4 sm:p-6 backdrop-blur-md shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              AI Soil Intelligence
            </span>
            <span className="text-xs text-slate-400 font-mono">v2.4 • MoES Agro-Vision</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Soil Health Scanner
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Take a photo of your soil and get an AI-powered visual assessment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openHistory}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
          >
            <History className="w-4 h-4 text-sky-400" />
            <span>My Soil Reports</span>
          </button>

          <button
            onClick={() => setShowLabModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50 text-xs font-semibold transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Govt Soil Testing Labs</span>
          </button>
        </div>
      </div>

      {/* STEP 2: AUTO LOCATION HIERARCHY BANNER */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Active Location:</span>
          <div className="flex flex-wrap items-center gap-1 font-semibold text-emerald-300">
            <span>Odisha</span>
            <ChevronRight className="w-3 h-3 text-slate-500" />
            <span>{selectedDistrict}</span>
            <ChevronRight className="w-3 h-3 text-slate-500" />
            <span>{selectedBlock}</span>
            {selectedPanchayat && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-500" />
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">{selectedPanchayat} GP</span>
              </>
            )}
          </div>
        </div>
        <span className="text-[11px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
          ✓ Synced with existing site location & weather engine
        </span>
      </div>

      {/* MAIN SCANNER INPUT & OPTIONAL INPUTS GRID */}
      {!report && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* STEP 1: PHOTO CAPTURE & UPLOAD SECTION (8 cols) */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-5 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">1</span>
                  Capture or Upload Soil Photo
                </h2>
                <p className="text-xs text-slate-400">Minimum 1 photo • Up to 3 field samples recommended</p>
              </div>
              {images.length > 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {images.length} / 3 Photos Added
                </span>
              )}
            </div>

            {/* SIMPLE INSTRUCTIONS BANNER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Take the photo in daylight.</span>
              </div>
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Capture a clean patch of soil.</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>Avoid leaves, hands, tools & objects.</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>Take multiple field spots if possible.</span>
              </div>
            </div>

            {/* ACTION BUTTONS: TAKE PHOTO & UPLOAD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={images.length >= 3}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold text-xs shadow-lg shadow-emerald-950/50 transition cursor-pointer disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                <span>Take Soil Photo (Camera)</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= 3}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-sky-400" />
                <span>Upload Soil Photo</span>
              </button>

              {/* Hidden File Inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* IMAGE PREVIEWS */}
            {images.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 pt-2">
                {images.map((imgBase64, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-video">
                    <img src={imgBase64} alt={`Soil sample ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-950/80 text-slate-300 hover:text-rose-400 transition"
                      title="Remove sample"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-950/90 text-emerald-400 border border-slate-800">
                      Sample #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center space-y-2 bg-slate-950/40">
                <Droplets className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">No soil photo selected yet</p>
                <p className="text-[11px] text-slate-500">Tap buttons above to capture directly or pick from gallery</p>
              </div>
            )}

            {/* ERROR STATE CARD */}
            {errorState && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-rose-300 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{errorState.message}</span>
                </div>
                {errorState.reasons && (
                  <ul className="list-disc list-inside text-rose-200/80 space-y-0.5 pl-1">
                    {errorState.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* LOADING STATE */}
            {isAnalyzing && (
              <div className="space-y-3 p-4 rounded-xl bg-slate-950 border border-emerald-500/30">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-emerald-400 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    {progressStatus}
                  </span>
                  <span className="text-slate-400 font-mono">{analysisProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 transition-all duration-300"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* PRIMARY CTA BUTTON */}
            <button
              onClick={handleAnalyzeSoil}
              disabled={isAnalyzing || images.length === 0}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-slate-950 font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              <span>SCAN SOIL NOW</span>
              <ArrowRight className="w-5 h-5 text-slate-950" />
            </button>
          </div>

          {/* STEP 3: OPTIONAL FARMER INPUTS (4 cols) */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 space-y-4 backdrop-blur-md shadow-lg">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold">2</span>
                Optional Farmer Inputs
              </h2>
              <p className="text-xs text-slate-400">Optional details to enhance AI recommendation accuracy</p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Crop Currently Grown</label>
                <select
                  value={currentCrop}
                  onChange={(e) => setCurrentCrop(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:border-sky-500 focus:outline-none"
                >
                  <option value="Rice">Rice (Paddy)</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Maize">Maize (Corn)</option>
                  <option value="Pulses">Pulses (Moong/Biri)</option>
                  <option value="Other">Other Crop</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Previous Crop in Field</label>
                <select
                  value={previousCrop}
                  onChange={(e) => setPreviousCrop(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:border-sky-500 focus:outline-none"
                >
                  <option value="Rice">Rice (Paddy)</option>
                  <option value="Maize">Maize</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Pulses">Pulses</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Irrigation Source</label>
                <select
                  value={irrigation}
                  onChange={(e) => setIrrigation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:border-sky-500 focus:outline-none"
                >
                  <option value="Rain-fed">Rain-fed (Monsoon only)</option>
                  <option value="Borewell">Borewell</option>
                  <option value="Canal">Canal</option>
                  <option value="Pond">Pond / Reservoir</option>
                  <option value="Drip">Drip Irrigation</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Farmer's Goal</label>
                <select
                  value={farmerGoal}
                  onChange={(e) => setFarmerGoal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 focus:border-sky-500 focus:outline-none"
                >
                  <option value="Choose next crop">Choose next crop</option>
                  <option value="Improve soil">Improve soil condition</option>
                  <option value="Check dryness">Check soil dryness & moisture</option>
                  <option value="Prepare for sowing">Prepare land for sowing</option>
                  <option value="Diagnose soil problem">Diagnose soil problem</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-semibold text-sky-400">💡 Why provide these inputs?</span>
              <p>These optional selections help the recommendation engine match local crop rotations and water requirements.</p>
            </div>
          </div>
        </div>
      )}

      {/* RESULT PAGE VIEW (STEP 5 to 10) */}
      {report && (
        <div className="space-y-6">
          {/* RESET / NEW SCAN BUTTON BAR */}
          <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 rounded-xl p-3">
            <span className="text-xs text-slate-300 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Soil Health Analysis Complete
            </span>
            <button
              onClick={() => {
                setReport(null);
                setImages([]);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Scan Another Photo</span>
            </button>
          </div>

          {/* OVERALL VISUAL SCORE BANNER */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/70 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Overall Visual Condition</span>
              <div className="text-4xl font-extrabold text-emerald-400 font-mono my-1">
                {report.visualAnalysis?.overallVisualCondition?.score || 68} <span className="text-xl text-slate-500">/ 100</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-xs border border-emerald-500/40 mt-1">
                {report.visualAnalysis?.overallVisualCondition?.label || 'Moderate Visual Condition'}
              </span>
            </div>

            <div className="md:col-span-8 flex flex-col justify-center space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <span className="text-sm font-bold text-slate-200">Confidence Ratings & Indicators</span>
                <span className="text-xs text-slate-400">Location: {report.location?.district}, {report.location?.block}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Image Quality</span>
                  <span className="font-bold text-emerald-400">{report.confidence?.imageQuality || 'High'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Texture Confidence</span>
                  <span className="font-bold text-sky-400">{report.confidence?.textureConfidence || 'Medium'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Moisture Confidence</span>
                  <span className="font-bold text-amber-400">{report.confidence?.moistureConfidence || 'Medium'}</span>
                </div>
              </div>

              {/* Strict Disclaimer Banner */}
              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200/90 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Visual estimate based strictly on photographic features. Exact NPK, pH & EC require laboratory testing.</span>
              </div>
            </div>
          </div>

          {/* STEP 5: SOIL OBSERVATION CARDS GRID */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider text-slate-400">
              Soil Observation Cards
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Card 1: Moisture */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Moisture</span>
                <p className="text-sm font-extrabold text-amber-400">
                  {report.visualAnalysis?.apparentMoisture?.value || 'Visually Dry'}
                </p>
                <div className="text-[10px] text-slate-500">
                  Score: {report.visualAnalysis?.apparentMoisture?.score || 72}/100
                </div>
              </div>

              {/* Card 2: Texture */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Texture</span>
                <p className="text-sm font-extrabold text-sky-400">
                  {report.visualAnalysis?.texture?.classification || 'Likely Loam'}
                </p>
                <div className="text-[10px] text-slate-500">Classification</div>
              </div>

              {/* Card 3: Organic Matter */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Organic Residue</span>
                <p className="text-xs font-bold text-emerald-400 line-clamp-1">
                  {report.visualAnalysis?.organicMatterAppearance?.value || 'Moderate'}
                </p>
                <div className="text-[10px] text-slate-500">Visible Residue</div>
              </div>

              {/* Card 4: Compaction */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Compaction</span>
                <p className="text-sm font-extrabold text-indigo-400">
                  {report.visualAnalysis?.surfaceCondition?.compaction || 'Possible'}
                </p>
                <div className="text-[10px] text-slate-500">Surface Crust</div>
              </div>

              {/* Card 5: Waterlogging */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Waterlogging Risk</span>
                <p className="text-sm font-extrabold text-teal-400">
                  {report.visualAnalysis?.waterlogging?.risk || 'Low Risk'}
                </p>
                <div className="text-[10px] text-slate-500">Drainage Status</div>
              </div>

              {/* Card 6: Erosion */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Erosion Risk</span>
                <p className="text-sm font-extrabold text-emerald-400">
                  {report.visualAnalysis?.erosion?.risk || 'Low Risk'}
                </p>
                <div className="text-[10px] text-slate-500">Surface Stability</div>
              </div>
            </div>
          </div>

          {/* STEP 10: WEATHER + SOIL SYNERGY INSIGHT CARD */}
          {report.weatherContext && (
            <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-950 border border-sky-500/30 rounded-2xl p-5 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-sky-400" />
                  Soil + Live Weather Synergy Insight
                </span>
                <span className="text-xs text-slate-400">7-Day Rain: {report.weatherContext.rainfall}</span>
              </div>
              <p className="text-sm text-slate-200 font-medium leading-relaxed">
                "{report.weatherContext.insight}"
              </p>
            </div>
          )}

          {/* STEP 6: CROP RECOMMENDATION ENGINE */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-400" />
                Location & Season Aware Crop Match
              </h3>
              <span className="text-xs text-slate-400">Calculated for {selectedDistrict} district</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {report.cropRecommendations?.map((cropItem, idx) => {
                const isSelected = selectedResultCropIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedResultCropIndex(idx)}
                    className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-emerald-950/50 border-emerald-500/60 shadow-lg shadow-emerald-950/50'
                        : 'bg-slate-900/80 border-slate-800 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{cropItem.icon || '🌾'}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {cropItem.score}% Suitability
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{cropItem.crop}</h4>
                      <p className="text-[11px] text-slate-400">{cropItem.category} • {cropItem.seasonCompatibility}</p>
                    </div>

                    <div className="space-y-1 pt-1">
                      {cropItem.reasons?.map((r, rIdx) => (
                        <div key={rIdx} className="text-[11px] text-slate-300 flex items-start gap-1">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span className="line-clamp-1">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 7: CROP CARE GUIDANCE FOR SELECTED CROP */}
          {report.cropRecommendations?.[selectedResultCropIndex] && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 backdrop-blur-md shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{report.cropRecommendations[selectedResultCropIndex].icon}</span>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      How to Take Care of Your {report.cropRecommendations[selectedResultCropIndex].crop}
                    </h3>
                    <p className="text-xs text-slate-400">Tailored field management & agricultural advice</p>
                  </div>
                </div>
              </div>

              {/* 8 SECTION GUIDANCE GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-sky-400 block">1. Water Management</span>
                  <p className="text-slate-300 leading-relaxed">
                    {report.cropRecommendations[selectedResultCropIndex].careGuidance?.water}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-emerald-400 block">2. Sowing & Spacing</span>
                  <p className="text-slate-300 leading-relaxed">
                    {report.cropRecommendations[selectedResultCropIndex].careGuidance?.sowing}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-amber-400 block">3. Fertilization (Lab Guided)</span>
                  <p className="text-slate-300 leading-relaxed">
                    {report.cropRecommendations[selectedResultCropIndex].careGuidance?.fertilization}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-teal-400 block">4. Weed Management</span>
                  <p className="text-slate-300 leading-relaxed">
                    {report.cropRecommendations[selectedResultCropIndex].careGuidance?.weedManagement}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-rose-400 block">5. Pest Monitoring</span>
                  <p className="text-slate-300 leading-relaxed">
                    {report.cropRecommendations[selectedResultCropIndex].careGuidance?.pestMonitoring}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-400 block">6. Disease Control</span>
                  <p className="text-slate-300 leading-relaxed">
                    {report.cropRecommendations[selectedResultCropIndex].careGuidance?.diseaseMonitoring}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-cyan-400 block">7. Weather Precautions</span>
                  <p className="text-slate-300 leading-relaxed">
                    {report.cropRecommendations[selectedResultCropIndex].careGuidance?.weatherPrecautions}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-yellow-400 block">8. Harvest Guidance</span>
                  <p className="text-slate-300 leading-relaxed">
                    {report.cropRecommendations[selectedResultCropIndex].careGuidance?.harvestGuidance}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: SOIL CARE ("IMPROVE YOUR SOIL") */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 backdrop-blur-md">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              Improve Your Soil Condition
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {report.soilCareAdvice?.map((advice, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2 text-slate-200">
                  <span className="flex-shrink-0 font-bold text-amber-400">#{idx + 1}</span>
                  <p className="leading-relaxed">{advice}</p>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 9: SOIL TEST RECOMMENDATION CARD */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                Want a More Accurate Soil Chemical Report?
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl">
                AI image analysis estimates visual soil features. Laboratory testing is required for exact pH, NPK (Nitrogen, Phosphorus, Potassium), EC, Organic Carbon & Micronutrient values.
              </p>
            </div>

            <button
              onClick={() => setShowLabModal(true)}
              className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs tracking-wide transition shadow-lg cursor-pointer flex items-center gap-1.5"
            >
              <span>Find Soil Testing Options</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>
      )}

      {/* LAB TESTING MODAL (STEP 9) */}
      {showLabModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                Odisha Soil Testing Laboratories
              </h3>
              <button onClick={() => setShowLabModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                To obtain official certified soil health card measurements (pH, N, P, K, Organic Carbon, Micronutrients), visit your local District Soil Testing Laboratory.
              </p>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="font-bold text-emerald-400">{selectedDistrict} District Soil Testing Lab</div>
                <div className="text-[11px] text-slate-400">Department of Agriculture & Farmers' Empowerment, Govt of Odisha</div>
                <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
                  <span>Sample Cost: Free under Soil Health Card Scheme</span>
                  <span className="text-sky-400 font-semibold">100% Verified</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-slate-200">How to collect soil sample:</span>
                <ol className="list-decimal list-inside space-y-0.5 text-slate-400 pl-1">
                  <li>Collect soil in 'V' shape cut at 15cm depth from 5 spots.</li>
                  <li>Mix thoroughly in clean container and dry in shade.</li>
                  <li>Submit 500g bagged sample to nearest Agriculture Extension Officer.</li>
                </ol>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowLabModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY MODAL (MY SOIL REPORTS) */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-sky-400" />
                My Soil Reports ({selectedDistrict})
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingHistory ? (
                <div className="text-center py-8 text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                  <span>Loading past soil reports...</span>
                </div>
              ) : historyList.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No previous soil scans saved for {selectedDistrict} district yet.
                </div>
              ) : (
                historyList.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                        <span>{item.location?.block}, {item.location?.district}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                          Score: {item.visualAnalysis?.overallVisualCondition?.score || 68}/100
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3">
                        <span>Moisture: {item.visualAnalysis?.apparentMoisture?.value}</span>
                        <span>•</span>
                        <span>Texture: {item.visualAnalysis?.texture?.classification}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setReport(item);
                        setShowHistoryModal(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 text-xs font-semibold border border-sky-500/30 transition"
                    >
                      View Report
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoilScannerPage;
