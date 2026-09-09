import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchNotificationStats, sendNotificationApi } from '../services/api';
import { 
  BellRing, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  Smartphone, 
  Users, 
  Radio, 
  Sparkles,
  RefreshCw,
  Share2
} from 'lucide-react';

export const NotificationCenterPage = () => {
  const { selectedDistrict, selectedBlock, selectedLocationId } = useApp();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('WhatsApp & SMS');
  const [previewLanguage, setPreviewLanguage] = useState('en');
  const [successToast, setSuccessToast] = useState(null);

  // Custom advisory draft text
  const [messageEn, setMessageEn] = useState(
    `🔴 HIGH DRY SPELL RISK - ${selectedBlock}: Rainfall may remain below normal for next 10-14 days. Farmers advised to delay new paddy sowing by 5-7 days and prepare supplemental irrigation. - MoES / NCMRWF`
  );
  const [messageHi, setMessageHi] = useState(
    `🔴 उच्च शुष्क दौर चेतावनी - ${selectedBlock}: अगले 10-14 दिनों में वर्षा सामान्य से कम रहने की संभावना है। किसान धान की नई बुवाई 5-7 दिन टालें और सिंचाई तैयार रखें। - MoES / NCMRWF`
  );
  const [messageOr, setMessageOr] = useState(
    `🔴 ପ୍ରବଳ ଶୁଷ୍କ ପାଗ ସତର୍କତା - ${selectedBlock}: ଆଗାମୀ ୧୦-୧୪ ଦିନ ବର୍ଷା କମ ରହିବା ସମ୍ଭାବନା। ଚାଷୀ ଭାଇମାନେ ଧାନ ବୁଣା ୫-୭ ଦିନ ବିଳମ୍ବ କରନ୍ତୁ ଏବଂ ଜଳସେଚନ ପ୍ରସ୍ତୁତ ରଖନ୍ତୁ। - MoES / NCMRWF`
  );

  const loadStats = async () => {
    setLoading(true);
    const data = await fetchNotificationStats();
    if (data) setStatsData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleBroadcast = async () => {
    setSending(true);
    const payload = {
      locationId: selectedLocationId,
      district: selectedDistrict,
      block: selectedBlock,
      urgency: "HIGH",
      channel: selectedChannel,
      recipients_count: 5240,
      message_en: messageEn,
      message_hi: messageHi,
      message_or: messageOr
    };

    const res = await sendNotificationApi(payload);
    if (res?.status === 'success') {
      setSuccessToast(`Dispatched broadcast to 5,240 registered farmers in ${selectedBlock} block.`);
      await loadStats();
      setTimeout(() => setSuccessToast(null), 5000);
    }
    setSending(false);
  };

  const stats = statsData?.stats || {
    total_broadcasts: 14,
    total_recipients: 48520,
    total_delivered: 46210,
    total_failed: 890,
    delivery_rate_percent: 95.2,
    active_subscribers_odisha: 48520
  };

  const logs = statsData?.logs || [];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="h-6 w-6 text-sky-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Farmer Notification & Alert Dispatch Center
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulated multi-channel (SMS, WhatsApp, Voice OBD) dissemination gateway for block agricultural officers
          </p>
        </div>

        <button
          onClick={loadStats}
          className="flex items-center gap-2 text-xs font-semibold text-sky-400 bg-sky-950/60 border border-sky-800 px-3 py-1.5 rounded-xl hover:bg-sky-900/60 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Delivery Logs</span>
        </button>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="bg-emerald-950 border border-emerald-500/50 p-4 rounded-xl text-emerald-300 text-xs font-bold flex items-center justify-between shadow-xl animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>{successToast}</span>
          </div>
          <span className="text-[10px] bg-emerald-900/80 px-2 py-0.5 rounded text-emerald-200">
            SMS Gateway: OK
          </span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
        
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-1">
          <div className="text-[10px] font-sans text-slate-400 uppercase font-bold flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-sky-400" /> Total Subscribers
          </div>
          <div className="text-2xl font-black text-white">
            {stats.total_recipients.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 font-sans">Active in Odisha</div>
        </div>

        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-1">
          <div className="text-[10px] font-sans text-emerald-400 uppercase font-bold flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Successfully Delivered
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {stats.total_delivered.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-500/80 font-sans">Rate: {stats.delivery_rate_percent}%</div>
        </div>

        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-1">
          <div className="text-[10px] font-sans text-rose-400 uppercase font-bold flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5" /> Failed / Unreachable
          </div>
          <div className="text-2xl font-black text-rose-400">
            {stats.total_failed.toLocaleString()}
          </div>
          <div className="text-[10px] text-rose-500/80 font-sans">Network retry active</div>
        </div>

        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-1">
          <div className="text-[10px] font-sans text-indigo-400 uppercase font-bold flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5" /> Total Broadcasts
          </div>
          <div className="text-2xl font-black text-indigo-300">
            {stats.total_broadcasts}
          </div>
          <div className="text-[10px] text-slate-500 font-sans">Across 10 Districts</div>
        </div>

      </div>

      {/* Broadcast Dispatcher Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Broadcast Composer */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Send className="h-4 w-4 text-sky-400" />
              <span>Compose & Broadcast Block Advisory</span>
            </h2>
            <span className="text-xs font-mono text-amber-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              Target: {selectedBlock} ({selectedDistrict})
            </span>
          </div>

          {/* Channel Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Dissemination Channel:
            </label>
            <div className="flex flex-wrap gap-2">
              {['WhatsApp & SMS', 'SMS Only', 'WhatsApp Only', 'Voice OBD Broadcast'].map(channel => (
                <button
                  key={channel}
                  onClick={() => setSelectedChannel(channel)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedChannel === channel
                      ? 'bg-sky-600 border-sky-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {channel}
                </button>
              ))}
            </div>
          </div>

          {/* Multi-Lingual Message Previews */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Multi-Lingual Broadcast Content:
              </label>
              <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
                {['en', 'hi', 'or'].map(l => (
                  <button
                    key={l}
                    onClick={() => setPreviewLanguage(l)}
                    className={`px-2.5 py-0.5 rounded font-bold uppercase transition-colors ${
                      previewLanguage === l ? 'bg-sky-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    {l === 'en' ? 'English' : l === 'hi' ? 'हिन्दी' : 'ଓଡ଼ିଆ'}
                  </button>
                ))}
              </div>
            </div>

            {previewLanguage === 'en' && (
              <textarea
                value={messageEn}
                onChange={(e) => setMessageEn(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans"
              />
            )}

            {previewLanguage === 'hi' && (
              <textarea
                value={messageHi}
                onChange={(e) => setMessageHi(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 font-sans"
              />
            )}

            {previewLanguage === 'or' && (
              <textarea
                value={messageOr}
                onChange={(e) => setMessageOr(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 font-odia"
              />
            )}
          </div>

          {/* Send Broadcast Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-400">
              Estimated Reach: <strong className="text-white font-mono">5,240 registered farmers</strong> in {selectedBlock}
            </div>

            <button
              onClick={handleBroadcast}
              disabled={sending}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg shadow-emerald-700/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className={`h-4 w-4 ${sending ? 'animate-pulse' : ''}`} />
              <span>{sending ? 'Transmitting Broadcast...' : `Send Broadcast to ${selectedBlock}`}</span>
            </button>
          </div>
        </div>

        {/* Right Col: Mobile Phone Simulator Preview */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-emerald-400" />
              <span>Farmer Handset Preview</span>
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              WhatsApp
            </span>
          </div>

          {/* Smartphone mockup */}
          <div className="rounded-2xl bg-slate-950 border-2 border-slate-700 p-4 space-y-3 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                  🌾
                </div>
                <div>
                  <div className="text-xs font-bold text-white">MoES Krishi Alert</div>
                  <div className="text-[10px] text-emerald-400">Official Weather Gateway</div>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">10:45 AM</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed font-odia">
              {previewLanguage === 'or' ? messageOr : previewLanguage === 'hi' ? messageHi : messageEn}
            </div>

            <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-400 font-mono">
              <span>Delivered</span>
              <span>✓✓</span>
            </div>
          </div>
        </div>

      </div>

      {/* Broadcast History Table */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white">Recent Broadcast Logs & Audit Trail</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="pb-2">Broadcast ID</th>
                <th className="pb-2">Location</th>
                <th className="pb-2">Channel</th>
                <th className="pb-2 text-center">Sent</th>
                <th className="pb-2 text-center">Delivered</th>
                <th className="pb-2 text-center">Failed</th>
                <th className="pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="py-3 font-bold text-slate-300 font-sans">{log.id}</td>
                  <td className="py-3 font-sans text-slate-200">{log.block} ({log.district})</td>
                  <td className="py-3 font-sans text-slate-400">{log.channel}</td>
                  <td className="py-3 text-center text-white">{log.recipients_count.toLocaleString()}</td>
                  <td className="py-3 text-center text-emerald-400">{log.delivered_count?.toLocaleString() || log.recipients_count}</td>
                  <td className="py-3 text-center text-rose-400">{log.failed_count || 0}</td>
                  <td className="py-3 text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      DELIVERED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default NotificationCenterPage;
