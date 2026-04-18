import React, { useState, useEffect, useRef } from 'react';
import { Search, CheckCircle, Bell, User, LogOut, Activity, ShieldCheck, MessageSquare } from 'lucide-react';
import io from 'socket.io-client';

const socket = io.connect("http://localhost:5000");

export default function Header({ user, setActivePage, onLogout }) {
  const isPatient = user?.role === 'patient' || user?.patientId;

  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // --- 1. FETCH INITIAL DATABASE NOTIFICATIONS ---
    const fetchUnread = async () => {
      try {
        if (!isPatient) {
          // DOCTOR FETCH
          const res = await fetch('http://localhost:5000/api/doctors/unread-messages', {
            headers: { 'x-auth-token': localStorage.getItem('token') }
          });
          if (res.ok) setNotifications(await res.json());
        } else {
          // PATIENT FETCH
          const res = await fetch('http://localhost:5000/api/patients/unread-messages', {
            headers: { 'x-auth-token': localStorage.getItem('token') }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.count > 0) {
              setNotifications([{ title: 'Message from Doctor', count: data.count }]);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load notifications");
      }
    };

    fetchUnread();

    // --- 2. LISTEN FOR LIVE SOCKET MESSAGES ---
    const handleLiveNotification = (data) => {
      // IF DOCTOR: Listen for Patient messages
      if (!isPatient && data.senderRole === 'Patient') {
        setNotifications(prev => {
          const exists = prev.find(n => n.patientId === data.room);
          if (exists) {
            return prev.map(n => n.patientId === data.room ? { ...n, count: n.count + 1 } : n);
          }
          return [...prev, { patientId: data.room, count: 1 }];
        });
      }
      // IF PATIENT: Listen for Doctor messages meant for YOUR room
      else if (isPatient && data.senderRole === 'Doctor' && data.room === user.patientId) {
        setNotifications(prev => {
          if (prev.length > 0) return [{ ...prev[0], count: prev[0].count + 1 }];
          return [{ title: 'Message from Doctor', count: 1 }];
        });
      }
    };

    socket.on("global_notification", handleLiveNotification);
    return () => socket.off("global_notification", handleLiveNotification);
  }, [isPatient, user]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalUnread = notifications.reduce((sum, notif) => sum + notif.count, 0);

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">

          {/* LEFT SECTION */}
          <div>
            <h1
              onClick={() => setActivePage('dashboard')}
              className="text-2xl font-bold text-slate-900 flex items-center gap-2 cursor-pointer"
            >
              {isPatient ? (
                <><ShieldCheck className="text-primary-600" /> My Health Portal</>
              ) : (
                "NAMASTE-ICD11 Medical Terminology Dashboard"
              )}
            </h1>
          </div>

          <div className="flex items-center space-x-4">

            {/* DOCTOR-ONLY TOOLS
            {!isPatient && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Quick search..." className="pl-10 pr-4 py-2 w-64 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 bg-slate-50" />
                </div>
                <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-bold transition-all" onClick={() => setActivePage('validation')}>
                  <CheckCircle className="w-4 h-4" /> Validate Mappings
                </button>
              </>
            )} */}

          

            {/* --- SHARED NOTIFICATION BELL --- */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {totalUnread > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-sm">{isPatient ? 'Secure Inbox' : 'Patient Messages'}</h3>
                    {totalUnread > 0 && (
                      <span className="text-xs font-bold bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full">
                        {totalUnread} New
                      </span>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-sm">
                        No new messages.
                      </div>
                    ) : (
                      notifications.map((notif, idx) => (
                        <div
                          key={idx}
                          onClick={async () => {
                            // 1. Immediately remove it from the UI so the red dot goes away instantly
                            setNotifications(prev => prev.filter(n => n !== notif));

                            // 2. Determine the correct room ID based on who is logged in
                            const targetRoom = isPatient ? user.patientId : notif.patientId;

                            // 3. Tell the database to mark these messages as read silently in the background
                            try {
                              await fetch('http://localhost:5000/api/messages/mark-read', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'x-auth-token': localStorage.getItem('token')
                                },
                                body: JSON.stringify({
                                  room: targetRoom,
                                  userRole: user.role // Send the role so the DB knows which messages to mark
                                })
                              });
                            } catch (err) {
                              console.error("Could not mark messages as read");
                            }

                            // 4. Close the dropdown and navigate to the chat
                            setShowNotifications(false);
                            setActivePage(isPatient ? 'dashboard' : 'profile');
                          }}
                          className="px-4 py-4 border-b border-slate-50 hover:bg-primary-50 cursor-pointer transition-colors flex justify-between items-center group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 group-hover:text-primary-600 transition-colors">
                                {isPatient ? notif.title : notif.patientId}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">Click to open chat window</p>
                            </div>
                          </div>
                          <div className="bg-primary-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-sm">
                            {notif.count}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* LOGOUT BUTTON */}
            <button onClick={onLogout} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>

            <div className="h-8 w-[1px] bg-slate-200 mx-2" />

            {/* PROFILE ICON */}
            <button
              onClick={() => !isPatient && setActivePage('profile')}
              className={`flex items-center space-x-3 p-1.5 rounded-xl transition-all border border-transparent ${!isPatient ? 'hover:bg-slate-50 hover:border-slate-200 group' : 'cursor-default'}`}
              title={!isPatient ? "View Doctor Profile" : "Account Identity"}
            >
              <div className="flex flex-col items-end mr-1">
                <span className="text-sm font-bold text-slate-800 leading-none">
                  {isPatient ? user.name : `Dr. ${user.name}`}
                </span>
                <span className="text-[10px] font-mono text-primary-600 mt-1 uppercase">
                  {isPatient ? user.patientId : (user.doctorId || "ID Pending")}
                </span>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-md transition-transform ${!isPatient ? 'group-hover:scale-105 bg-primary-600' : 'bg-emerald-600'}`}>
                {user?.name ? user.name[0].toUpperCase() : <User />}
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}