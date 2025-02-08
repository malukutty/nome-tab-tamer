
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTabOrganization } from '@/hooks/useTabOrganization';

const TabOrganizer = () => {
  const {
    groups,
    rules,
    loadingGroups,
    loadingRules,
    createGroup,
    createRule,
    deleteGroup,
    deleteRule,
  } = useTabOrganization();

  const [newGroupName, setNewGroupName] = useState('');
  const [newRulePattern, setNewRulePattern] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      createGroup.mutate(newGroupName.trim());
      setNewGroupName('');
    }
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRulePattern.trim() && selectedGroupId) {
      createRule.mutate({
        groupId: selectedGroupId,
        pattern: newRulePattern.trim(),
        priority: rules.length,
      });
      setNewRulePattern('');
    }
  };

  if (loadingGroups || loadingRules) {
    return <div className="flex items-center justify-center p-4">Loading...</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Groups Management */}
      <Card>
        <CardHeader>
          <CardTitle>Tab Groups</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateGroup} className="flex gap-2 mb-4">
            <Input
              placeholder="New group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <Button type="submit" disabled={createGroup.isPending}>
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </form>
          <div className="space-y-2">
            {groups.map((group) => (
              <div key={group.id} className="flex items-center justify-between p-2 bg-muted rounded">
                <span>{group.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteGroup.mutate(group.id)}
                  disabled={deleteGroup.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rules Management */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateRule} className="space-y-4 mb-4">
            <select
              className="w-full p-2 border rounded"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              <option value="">Select a group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Input
                placeholder="URL pattern (e.g., .*github\.com.*)"
                value={newRulePattern}
                onChange={(e) => setNewRulePattern(e.target.value)}
              />
              <Button type="submit" disabled={createRule.isPending || !selectedGroupId}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </form>
          <div className="space-y-2">
            {rules.map((rule) => {
              const group = groups.find(g => g.id === rule.group_id);
              return (
                <div key={rule.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{group?.name}</span>
                    <span className="text-xs text-muted-foreground">{rule.pattern}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteRule.mutate(rule.id)}
                    disabled={deleteRule.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TabOrganizer;

