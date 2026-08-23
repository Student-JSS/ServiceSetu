import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Send, X, MessageSquare, ShieldCheck, CheckCheck } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

export const ChatDrawer = ({ bookingId, recipientName, onClose }) => {
  const { user } = useAuth();
  const { socket, joinBookingRoom } = useSocket();
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);
  const drawerRef = useRef(null);

  const currentUserId = user?.id || user?._id;

  // 1. Fetch persistent chat history from backend on open
  const fetchChatHistory = async () => {
    try {
      const res = await API.get(`/bookings/${bookingId}/chat`);
      if (res.data.success && Array.isArray(res.data.messages)) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Could not fetch chat history', err);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchChatHistory();
      joinBookingRoom(bookingId);
    }

    if (!socket) return;

    const handleNewMessage = (payload) => {
      if (payload.bookingId === bookingId) {
        setMessages((prev) => {
          if (String(payload.senderId) === String(currentUserId)) {
            return prev;
          }

          const isDuplicate = prev.some((m) => {
            if (m._id && payload._id && m._id === payload._id) return true;
            if (m.msgId && payload.msgId && m.msgId === payload.msgId) return true;
            const sameContent = m.message === payload.message;
            const sameSender = String(m.senderId) === String(payload.senderId);
            const timeDiff = Math.abs(new Date(m.timestamp) - new Date(payload.timestamp));
            return sameContent && sameSender && timeDiff < 6000;
          });

          if (isDuplicate) return prev;
          return [...prev, payload];
        });
      }
    };

    socket.on('receive_message', handleNewMessage);
    return () => {
      socket.off('receive_message', handleNewMessage);
    };
  }, [bookingId, socket, currentUserId]);

  // Click outside to close chat drawer
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || sending) return;

    const text = inputMsg.trim();
    setInputMsg('');
    const myId = currentUserId;
    const clientMsgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newMsg = {
      _id: clientMsgId,
      msgId: clientMsgId,
      bookingId,
      senderId: myId,
      senderName: user?.fullName || 'Me',
      message: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);

    if (socket) {
      socket.emit('send_message', {
        bookingId,
        senderId: myId,
        senderName: user?.fullName || 'Me',
        message: text,
        msgId: clientMsgId,
      });
    }
  };

  const content = (
    <div
      ref={drawerRef}
      className="fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[99999] w-full sm:w-96 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col h-[82vh] sm:h-[500px] overflow-hidden animate-in slide-in-from-bottom-5"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-coop-700 via-coop-600 to-emerald-700 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-base shadow-inner">
            💬
          </div>
          <div>
            <h4 className="font-extrabold text-sm leading-tight text-white">{recipientName || 'Direct Co-op Chat'}</h4>
            <span className="text-[10px] text-emerald-200 flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live Co-op Line
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        <div className="bg-coop-50/80 border border-coop-200/80 text-coop-900 text-[11px] p-3 rounded-2xl text-center font-medium shadow-sm">
          🛡️ Verified cooperative in-app communication for Booking #{bookingId?.slice(-6).toUpperCase()}.
        </div>

        {messages.map((m, idx) => {
          const isMe = String(m.senderId) === String(currentUserId);

          return (
            <div key={m._id || m.msgId || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] font-bold text-slate-400 mb-0.5 px-1.5">
                {isMe ? 'You' : m.senderName || recipientName}
              </span>
              <div
                className={`max-w-[85%] sm:max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm leading-relaxed ${
                  isMe
                    ? 'bg-coop-600 text-white rounded-br-none shadow-coop-600/20'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }`}
              >
                {m.message}
              </div>
              <span className="text-[9px] text-slate-400 mt-0.5 px-1.5 flex items-center gap-0.5">
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {isMe && <CheckCheck className="w-3 h-3 text-coop-600 inline" />}
              </span>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Type message to worker/customer..."
          className="flex-1 text-xs p-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-coop-500 focus:bg-white transition-all font-medium"
        />
        <button
          type="submit"
          disabled={!inputMsg.trim()}
          className="p-3 bg-coop-600 hover:bg-coop-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl transition-all shadow-md shadow-coop-600/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};
