
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TabData } from '@/types/browser';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface TabSummaryProps {
  tabs: TabData[];
}

const TabSummary = ({ tabs }: TabSummaryProps) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
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

  return (
    <div className="space-y-4">
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
      
      {summary && (
        <div className="mt-6 bg-white rounded-lg border border-nome-200 shadow-sm">
          <div className="p-4 border-b border-nome-200">
            <h3 className="text-lg font-semibold text-nome-800">Tab Analysis</h3>
            <p className="text-sm text-nome-600">
              Here's an analysis of your current browsing context and organization suggestions
            </p>
          </div>
          <ScrollArea className="h-[300px]">
            <div className="p-4">
              <div className="prose prose-nome max-w-none">
                <div className="whitespace-pre-line text-nome-600">{summary}</div>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default TabSummary;

