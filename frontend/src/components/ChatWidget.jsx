import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Send, X, MessageSquare } from 'lucide-react';

// Connect to the backend socket server
const socket = io.connect("https://ayurconnect-portal.vercel.app");

export default function ChatWidget({ roomId, currentUserRole, currentUserName, onClose }) {
  const [isOpen, setIsOpen] = useState(true);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  useEffect(() => {
    if (isOpen && roomId) {
      // Join the room based on Patient ID
      socket.emit("join_room", roomId);

      // Listen for the chat history from the database
      const loadHistoryHandler = (history) => {
        setMessageList(history);
      };

      socket.on("load_history", loadHistoryHandler);

      // Cleanup listener when chat closes to prevent duplicates
      return () => socket.off("load_history", loadHistoryHandler);
    }
  }, [isOpen, roomId]);

  useEffect(() => {
    // Listen for incoming messages
    const receiveMessageHandler = (data) => {
      setMessageList((list) => [...list, data]);
    };

    socket.on("receive_message", receiveMessageHandler);

    // Cleanup listener to prevent duplicate messages
    return () => socket.off("receive_message", receiveMessageHandler);
  }, []);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: roomId,
        senderRole: currentUserRole,
        senderName: currentUserName,
        text: currentMessage,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-70">
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-2xl transition-transform active:scale-95"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 h-[500px] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-primary-600 p-4 text-white flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">Secure Chat</h3>
              <p className="text-xs text-primary-100">Room ID: {roomId}</p>
            </div>
            <button onClick={() => {
              setIsOpen(false)
              if (onClose) onClose()
            }} className="hover:bg-primary-700 p-1 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
            {messageList.length === 0 ? (
              <p className="text-center text-slate-400 text-sm mt-10">Start the conversation...</p>
            ) : (
              messageList.map((msg, index) => (
                <div key={index} className={`flex flex-col ${msg.senderName === currentUserName ? 'items-end' : 'items-start'}`}>
                  <p className="text-[10px] text-slate-400 font-bold ml-1 mb-1">{msg.senderName} ({msg.senderRole})</p>
                  <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm shadow-sm ${msg.senderName === currentUserName ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'}`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1">{msg.time}</span>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={currentMessage}
              placeholder="Type a message..."
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={sendMessage}
              className="bg-primary-600 text-white p-3 rounded-xl hover:bg-primary-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}