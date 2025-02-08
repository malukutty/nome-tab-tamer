
import { useTabQueries } from './tabs/useTabQueries';
import { useTabMutations } from './tabs/useTabMutations';
import { organizeTab } from './tabs/tabUtils';

export const useTabOrganization = () => {
  const { groups, rules, loadingGroups, loadingRules } = useTabQueries();
  const { createGroup, createRule, deleteGroup, deleteRule } = useTabMutations();

  return {
    groups,
    rules,
    loadingGroups,
    loadingRules,
    createGroup,
    createRule,
    deleteGroup,
    deleteRule,
    organizeTab: (tab: any) => organizeTab(tab, rules, groups),
  };
};
