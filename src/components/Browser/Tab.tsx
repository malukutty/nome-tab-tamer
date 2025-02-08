
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface TabProps {
  title: string;
  active: boolean;
  onClose: () => void;
  onClick: () => void;
}

const Tab = ({ title, active, onClose, onClick }: TabProps) => {
  return (
    <div
      onClick={onClick}
      className={`
        group flex items-center gap-2 px-4 py-2 max-w-[200px] cursor-pointer
        border-r border-nome-200 transition-colors animate-fade-in
        ${active ? 'bg-white' : 'bg-nome-50 hover:bg-nome-100'}
      `}
    >
      <span className="truncate text-sm text-nome-700">{title}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <X className="h-3 w-3 text-nome-400 hover:text-nome-600" />
      </Button>
    </div>
  );
};

export default Tab;
