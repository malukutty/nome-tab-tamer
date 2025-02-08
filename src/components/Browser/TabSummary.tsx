
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TabData } from '@/types/browser';

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
        title: "Tabs summarized",
        description: "Your open tabs have been summarized successfully",
      });
    } catch (error) {
      console.error('Error summarizing tabs:', error);
      toast({
        title: "Error summarizing tabs",
        description: "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleSummarizeTabs}
        disabled={summarizing}
        className="ml-4"
      >
        {summarizing ? "Summarizing..." : "Summarize Tabs"}
      </Button>
      
      {summary && (
        <div className="mt-6 p-4 bg-nome-50 rounded-lg">
          <h3 className="text-lg font-semibold text-nome-800 mb-2">Tab Summary</h3>
          <p className="text-nome-600 whitespace-pre-line">{summary}</p>
        </div>
      )}
    </>
  );
};

export default TabSummary;
