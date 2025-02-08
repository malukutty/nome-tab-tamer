
import { useEffect } from 'react';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import { useToast } from '@/hooks/use-toast';

export const useBrowserEvents = () => {
  const { toast } = useToast();

  useEffect(() => {
    let browserFinishedListener: any;
    let browserPageLoadedListener: any;
    let appStateChangeListener: any;

    const setupListeners = async () => {
      // Browser events
      browserFinishedListener = await Browser.addListener('browserFinished', () => {
        console.log('Browser finished');
      });

      browserPageLoadedListener = await Browser.addListener('browserPageLoaded', () => {
        console.log('Browser page loaded');
      });

      // App lifecycle events
      appStateChangeListener = await App.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed:', isActive);
        if (!isActive) {
          // App went to background
          Browser.close();
        }
      });
    };

    setupListeners();

    return () => {
      browserFinishedListener?.remove();
      browserPageLoadedListener?.remove();
      appStateChangeListener?.remove();
    };
  }, [toast]);
};
