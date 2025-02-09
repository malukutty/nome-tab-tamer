
import { Capacitor } from '@capacitor/core';
import NavigationControls from './NavigationControls';
import AddressBar from './AddressBar';

interface BrowserControlsProps {
  onNavigate: (url: string) => void;
  activeTabUrl?: string;
}

const BrowserControls = ({ onNavigate, activeTabUrl }: BrowserControlsProps) => {
  const handleBack = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const { Browser } = await import('@capacitor/browser');
        await Browser.close();
      } catch (error) {
        console.log('Browser plugin not available:', error);
      }
    } else {
      window.history.back();
    }
  };

  const handleRefresh = () => {
    if (activeTabUrl) {
      onNavigate(activeTabUrl);
    }
  };

  return (
    <div className="flex items-center h-12 border-b border-nome-200">
      <NavigationControls
        onBack={handleBack}
        onForward={() => {}}
        onRefresh={handleRefresh}
        canGoBack={true}
        canGoForward={false}
      />
      <AddressBar onNavigate={onNavigate} currentUrl={activeTabUrl} />
    </div>
  );
};

export default BrowserControls;
