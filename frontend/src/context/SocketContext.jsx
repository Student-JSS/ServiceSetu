import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [incomingEmergency, setIncomingEmergency] = useState(null);

  useEffect(() => {
    // Connect directly to backend server port 5000
    const backendUrl = 'http://localhost:5000';
    const newSocket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🟢 Real-time Socket connected to', backendUrl, 'Socket ID:', newSocket.id);
      const uid = user?.id || user?._id;
      if (uid) {
        newSocket.emit('join_user', uid);
      }
    });

    newSocket.on('emergency_booking_request', (data) => {
      console.log('🚨 Incoming emergency booking:', data);
      setIncomingEmergency(data);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id, user?._id]);

  const joinBookingRoom = (bookingId) => {
    if (socket && bookingId) {
      socket.emit('join_booking', bookingId);
      console.log('Joined live booking room:', bookingId);
    }
  };

  const sendMessage = (bookingId, senderName, message) => {
    if (socket && bookingId && user) {
      const uid = user.id || user._id;
      socket.emit('send_message', {
        bookingId,
        senderId: uid,
        senderName: senderName || user.fullName,
        message,
      });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        incomingEmergency,
        setIncomingEmergency,
        joinBookingRoom,
        sendMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
