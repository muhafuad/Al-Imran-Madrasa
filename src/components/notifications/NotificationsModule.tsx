import React, { useState } from 'react';
import { useMadrasa } from '../../context/MadrasaContext';
import { DatabaseStatusBanner } from '../common/DatabaseStatusBanner';
import {
  Bell,
  Send,
  
  Smartphone,
  CheckCheck,
  
  X,
} from 'lucide-react';

export const NotificationsModule: React.FC = () => {
  const { notifications, sendNotification, currentUser } = useMadrasa();

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [filterChannel, setFilterChannel] = useState('all');

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all' | 'parents' | 'teachers' | 'students'>('parents');
  const [channel, setChannel] = useState<'all' | 'sms' | 'app' | 'telegram'>('sms');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      alert('Please fill in title and message.');
      return;
    }

    sendNotification({
      title,
      message,
      targetAudience,
      channel,
      priority,
      sentDate: new Date().toISOString().split('T')[0],
      isRead: false,
    });

    setIsComposeOpen(false);
    setTitle('');
    setMessage('');
    alert('Broadcast dispatched successfully to recipients via ' + channel.toUpperCase());
  };

  const filteredList = notifications.filter(
    n => filterChannel === 'all' || (n.channel || 'sms') === filterChannel
  );

  return (
    <div className="space-y-6">
      {/* Database Connection & Sync Status */}
      <DatabaseStatusBanner
        pageName="Broadcasts, Notifications & SMS Gateway Database"
        arabicPageName="إرسال التعاميم المدرسية والإشعارات"
        recordCount={notifications.length}
        recordLabel="Dispatched Broadcasts"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900">Announcements & Parent Broadcasts</h1>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900">
              SMS & Telegram Gateway
            </span>
          </div>
          <p className="text-xs text-slate-500 font-arabic mt-0.5">
            إرسال التعاميم المدرسية والإشعارات لأولياء الأمور والمعلمين
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsComposeOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>+ Compose New Broadcast</span>
          </button>
        </div>
      </div>

      {/* Broadcast Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Broadcast History</span>
            <div className="flex items-center gap-1">
              {['all', 'sms', 'telegram', 'app'].map((ch) => (
                <button
                  key={ch}
                  onClick={() => setFilterChannel(ch)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                    filterChannel === ch
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredList.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        item.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-900 animate-pulse'
                          : item.priority === 'high'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {item.priority || 'normal'} priority
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{item.sentDate || item.timestamp}</span>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                    Channel: {item.channel || 'sms'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Target: {(item.targetAudience || 'all').toUpperCase()}</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <CheckCheck className="w-3.5 h-3.5" /> Delivered to 240+ recipients
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Channels Information Sidebar */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Delivery Gateways Status</h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-700" />
                  <div>
                    <strong className="text-emerald-950 block">Ethio Telecom Bulk SMS</strong>
                    <span className="text-[10px] text-emerald-700">Gateway Online (99.8% rate)</span>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>

              <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-sky-700" />
                  <div>
                    <strong className="text-sky-950 block">Telegram Channel Bot</strong>
                    <span className="text-[10px] text-sky-700">@AlImranMadrasaBot</span>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-slate-700" />
                  <div>
                    <strong className="text-slate-900 block">Parent Portal Web Push</strong>
                    <span className="text-[10px] text-slate-500">Active Realtime Listener</span>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compose Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Compose Broadcast Message</h2>
                <p className="text-xs text-slate-500 font-arabic">إرسال رسالة جماعية عبر الرسائل النصية القصيرة</p>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSend} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Broadcast Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramadan Schedule Adjustment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="parents">All Parents (أولياء الأمور)</option>
                    <option value="teachers">All Teachers (هيئة التدريس)</option>
                    <option value="all">Entire Madrasa Community</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Channel Gateway</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="sms">SMS (Ethio Telecom)</option>
                    <option value="telegram">Telegram Bot Channel</option>
                    <option value="all">Omnichannel (SMS + Web + TG)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Broadcast Message Body *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Assalamu Alaikum wa Rahmatullahi wa Barakatuh..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg leading-relaxed"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Broadcast Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
