
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddressBarProps {
  onNavigate: (url: string) => void;
  currentUrl?: string;
}

const AddressBar = ({ onNavigate, currentUrl }: AddressBarProps) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(currentUrl || '');
  }, [currentUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onNavigate(url);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2 px-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-nome-400" />
        <Input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL or search..."
          className="w-full pl-10 h-10 bg-nome-50 border-nome-200 focus:border-nome-300 transition-colors"
        />
      </div>
      <Button 
        type="submit" 
        variant="ghost"
        className="px-4 py-2 hover:bg-nome-100 transition-colors"
      >
        Go
      </Button>
    </form>
  );
};

export default AddressBar;
