"use client";

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Notification } from '@/types';
import { useAuthStore } from '@/stores/auth.store';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3004';

let socket: Socket | null = null;

export function useNotifications(onNotification?: (notification: Notification) => void): { socket: Socket | null } {
  const { accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      return;
    }

    // Connect to WebSocket
    socket = io(`${WS_URL}/notifications`, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket'],
    });

    socket.on('connected', (data) => {
      console.log('Connected to notifications:', data);
    });

    socket.on('notification', (notification: Notification) => {
      console.log('New notification:', notification);
      onNotification?.(notification);
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from notifications');
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [isAuthenticated, accessToken, onNotification]);

  return { socket };
}
