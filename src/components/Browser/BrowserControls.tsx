
import { Browser } from '@capacitor/browser';
import NavigationControls from './NavigationControls';
import AddressBar from './AddressBar';

interface BrowserControlsProps {
  onNavigate: (url: string) => void;
  activeTabUrl?: string;
}

const BrowserControls = ({ onNavigate, activeTabUrl }: BrowserControlsProps) => {
  return (
    <div className="flex items-center h-12 border-b border-nome-200">
      <NavigationControls
        onBack={() => Browser.close()}
        onForward={() => {}}
        onRefresh={() => {
          if (activeTabUrl) {
            onNavigate(activeTabUrl);
          }
        }}
        canGoBack={true}
        canGoForward={false}
      />
      <AddressBar onNavigate={onNavigate} />
    </div>
  );
};

export default BrowserControls;
