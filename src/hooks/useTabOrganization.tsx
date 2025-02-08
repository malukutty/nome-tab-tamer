
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TabGroup, TabRule, TabData, TabGroupResponse, TabRuleResponse } from '@/types/browser';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const useTabOrganization = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch tab groups
  const { data: groups = [], isLoading: loadingGroups } = useQuery({
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

  // Fetch tab rules
  const { data: rules = [], isLoading: loadingRules } = useQuery({
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

  // Create new group
  const createGroup = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tab_groups')
        .insert([{ 
          name,
          user_id: user.id 
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tabGroups'] });
      toast({
        title: "Group created",
        description: "New tab group has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating group",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create new rule
  const createRule = useMutation({
    mutationFn: async ({ groupId, pattern, priority }: { groupId: string; pattern: string; priority: number }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tab_rules')
        .insert([{ 
          group_id: groupId, 
          pattern, 
          priority,
          user_id: user.id 
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tabRules'] });
      toast({
        title: "Rule created",
        description: "New organization rule has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating rule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete group
  const deleteGroup = useMutation({
    mutationFn: async (groupId: string) => {
      const { error } = await supabase
        .from('tab_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tabGroups'] });
      toast({
        title: "Group deleted",
        description: "Tab group has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting group",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete rule
  const deleteRule = useMutation({
    mutationFn: async (ruleId: string) => {
      const { error } = await supabase
        .from('tab_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tabRules'] });
      toast({
        title: "Rule deleted",
        description: "Organization rule has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting rule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Function to organize tabs based on rules
  const organizeTab = (tab: TabData) => {
    for (const rule of rules) {
      const pattern = new RegExp(rule.pattern);
      if (pattern.test(tab.url)) {
        return rule.group_id;
      }
    }
    return null;
  };

  return {
    groups,
    rules,
    loadingGroups,
    loadingRules,
    createGroup,
    createRule,
    deleteGroup,
    deleteRule,
    organizeTab,
  };
};

