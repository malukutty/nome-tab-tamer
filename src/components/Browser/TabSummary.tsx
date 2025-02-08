
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TabData } from '@/types/browser';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, XIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TabSummaryProps {
  tabs: TabData[];
}

const TabSummary = ({ tabs }: TabSummaryProps) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const handleSummarizeTabs = async () => {
    if (tabs.length === 0) {
      toast({
        title: "No tabs to summarize",
        description: "Open some tabs first to get a summary",
        variant: "destructive",
      });
      return;
    }

    setSummarizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('summarize-tabs', {
        body: { tabs }
      });

      if (error) throw error;

      setSummary(data.summary);
      setShowDialog(true);
      toast({
        title: "Analysis complete",
        description: "Your tabs have been analyzed and organized",
      });
    } catch (error) {
      console.error('Error summarizing tabs:', error);
      toast({
        title: "Error analyzing tabs",
        description: "Failed to generate analysis",
        variant: "destructive",
      });
    } finally {
      setSummarizing(false);
    }
  };

  const formatSummary = (text: string) => {
    // Convert markdown-style bullets to proper formatting
    return text.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('*')) {
        return (
          <li key={index} className="ml-4 mb-2">
            {trimmedLine.substring(1).trim()}
          </li>
        );
      }
      return <p key={index} className="mb-2">{trimmedLine}</p>;
    });
  };

  return (
    <div>
      <Button
        onClick={handleSummarizeTabs}
        disabled={summarizing}
        className="w-full sm:w-auto"
      >
        {summarizing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing tabs...
          </>
        ) : (
          "Analyze & Organize Tabs"
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center justify-between">
              Tab Analysis Summary
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDialog(false)}
                className="h-6 w-6 p-0"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] mt-4">
            <div className="px-2">
              {summary && (
                <div className="prose prose-nome">
                  <ul className="list-none space-y-2 text-nome-600">
                    {formatSummary(summary)}
                  </ul>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TabSummary;
