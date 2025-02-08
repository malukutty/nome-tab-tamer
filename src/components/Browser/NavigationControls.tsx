
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface NavigationControlsProps {
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

const NavigationControls = ({
  onBack,
  onForward,
  onRefresh,
  canGoBack,
  canGoForward,
}: NavigationControlsProps) => {
  return (
    <div className="flex items-center gap-1 px-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        disabled={!canGoBack}
        className="hover:bg-nome-100 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 text-nome-600" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onForward}
        disabled={!canGoForward}
        className="hover:bg-nome-100 transition-colors"
      >
        <ArrowRight className="h-4 w-4 text-nome-600" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRefresh}
        className="hover:bg-nome-100 transition-colors"
      >
        <RefreshCw className="h-4 w-4 text-nome-600" />
      </Button>
    </div>
  );
};

export default NavigationControls;
