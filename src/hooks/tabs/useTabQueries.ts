
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TabGroupResponse, TabRuleResponse } from '@/types/browser';
import { useAuth } from '@/hooks/useAuth';

export const useTabQueries = () => {
  const { user } = useAuth();

  const {
    data: groups = [],
    isLoading: loadingGroups
  } = useQuery({
    queryKey: ['tabGroups'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tab_groups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data as TabGroupResponse[]) || [];
    },
    enabled: !!user,
  });

  const {
    data: rules = [],
    isLoading: loadingRules
  } = useQuery({
    queryKey: ['tabRules'],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('tab_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: false });

      if (error) throw error;
      return (data as TabRuleResponse[]) || [];
    },
    enabled: !!user,
  });

  return {
    groups,
    rules,
    loadingGroups,
    loadingRules
  };
};
