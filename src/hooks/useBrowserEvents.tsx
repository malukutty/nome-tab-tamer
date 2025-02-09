
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';

export const useBrowserEvents = () => {
  const { toast } = useToast();

  useEffect(() => {
    let browserFinishedListener: any;
    let browserPageLoadedListener: any;
    let appStateChangeListener: any;

    const setupListeners = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const { Browser } = await import('@capacitor/browser');
          const { App } = await import('@capacitor/app');

          browserFinishedListener = await Browser.addListener('browserFinished', () => {
            console.log('Browser finished');
          });

          browserPageLoadedListener = await Browser.addListener('browserPageLoaded', () => {
            console.log('Browser page loaded');
          });

          appStateChangeListener = await App.addListener('appStateChange', ({ isActive }) => {
            console.log('App state changed:', isActive);
            if (!isActive) {
              Browser.close();
            }
          });
        } catch (error) {
          console.log('Capacitor plugins not available:', error);
        }
      }
    };

    setupListeners();

    return () => {
      if (Capacitor.isNativePlatform()) {
        browserFinishedListener?.remove();
        browserPageLoadedListener?.remove();
        appStateChangeListener?.remove();
      }
    };
  }, [toast]);
};
