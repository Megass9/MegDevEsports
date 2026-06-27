import { useEffect, useRef } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echoInstance: Echo | null = null;

export function getEcho(): Echo | null {
  return echoInstance;
}

export function useEcho(callback: (echo: Echo) => () => void, deps: any[] = []) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!echoInstance) {
      echoInstance = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_REVERB_APP_KEY || 'local',
        wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
        wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
        wssPort: 443,
        forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
        encrypted: import.meta.env.VITE_REVERB_SCHEME === 'https',
        enabledTransports: ['ws', 'wss'],
        disableStats: true,
        authEndpoint: '/api/broadcasting/auth',
        auth: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      });
    }

    cleanupRef.current = callback(echoInstance);

    return () => {
      cleanupRef.current?.();
    };
  }, deps);
}
