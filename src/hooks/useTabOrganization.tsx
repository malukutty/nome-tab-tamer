
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
    // Normalize URL to lowercase for better matching
    const normalizedUrl = tab.url.toLowerCase();

    // Common URL patterns for different categories
    const urlPatterns = {
      socialMedia: [
        /facebook\.com/,
        /twitter\.com/,
        /instagram\.com/,
        /tiktok\.com/,
        /linkedin\.com/,
        /reddit\.com/,
        /snapchat\.com/,
        /pinterest\.com/,
        /threads\.net/,
      ],
      technology: [
        /github\.com/,
        /stackoverflow\.com/,
        /openai\.com/,
        /aws\.amazon\.com/,
        /cloud\.google\.com/,
        /azure\.microsoft\.com/,
        /digitalocean\.com/,
        /vercel\.com/,
        /netlify\.com/,
        /heroku\.com/,
        /medium\.com/,
        /dev\.to/,
      ],
      shopping: [
        /amazon\./,
        /ebay\.com/,
        /walmart\.com/,
        /etsy\.com/,
        /bestbuy\.com/,
        /target\.com/,
        /shopify\.com/,
      ],
      entertainment: [
        /youtube\.com/,
        /netflix\.com/,
        /spotify\.com/,
        /disney\.com/,
        /hulu\.com/,
        /twitch\.tv/,
        /vimeo\.com/,
        /hbomax\.com/,
        /primevideo\.com/,
      ],
      news: [
        /cnn\.com/,
        /bbc\.co\.uk/,
        /nytimes\.com/,
        /reuters\.com/,
        /bloomberg\.com/,
        /wsj\.com/,
        /theguardian\.com/,
        /washingtonpost\.com/,
      ],
    };

    // First check custom rules from database
    for (const rule of rules) {
      try {
        const pattern = new RegExp(rule.pattern);
        if (pattern.test(normalizedUrl)) {
          return rule.group_id;
        }
      } catch (e) {
        console.error('Invalid regex pattern in custom rule:', rule.pattern);
        continue;
      }
    }

    // Then check predefined patterns
    for (const [category, patterns] of Object.entries(urlPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedUrl)) {
          // Find the group with matching name
          const group = groups.find(g => g.name.toLowerCase().includes(category.toLowerCase()));
          if (group) {
            return group.id;
          }
          break;
        }
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

