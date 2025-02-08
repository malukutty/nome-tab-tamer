
export interface TabData {
  id: string;
  title: string;
  url: string;
  content?: string;
}

export interface TabGroup {
  id: string;
  name: string;
  tabs: TabData[];
}

export interface TabRule {
  id: string;
  groupId: string;
  pattern: string;
  priority: number;
}

export interface TabGroupResponse {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface TabRuleResponse {
  id: string;
  group_id: string;
  pattern: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface SavedTabResponse {
  id: string;
  group_id: string;
  title: string;
  url: string;
  created_at: string;
  updated_at: string;
}
