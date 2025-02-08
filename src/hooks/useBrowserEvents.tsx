
import { useEffect } from 'react';
import { Browser } from '@capacitor/browser';
import { useToast } from '@/hooks/use-toast';

export const useBrowserEvents = () => {
  const { toast } = useToast();

  useEffect(() => {
    let browserFinishedListener: any;
    let browserPageLoadedListener: any;

    const setupListeners = async () => {
      browserFinishedListener = await Browser.addListener('browserFinished', () => {
        console.log('Browser finished');
        toast({
          title: "Browser closed",
          description: "The browser window has been closed",
        });
      });

      browserPageLoadedListener = await Browser.addListener('browserPageLoaded', () => {
        console.log('Browser page loaded');
        toast({
          title: "Page loaded",
          description: "The web page has finished loading",
        });
      });
    };

    setupListeners();

    return () => {
      browserFinishedListener?.remove();
      browserPageLoadedListener?.remove();
    };
  }, [toast]);
};
