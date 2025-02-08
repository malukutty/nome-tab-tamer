
export interface TabData {
  id: string;
  title: string;
  url: string;
  content?: string;
}

export interface TabGroup {
  id: string;
  name: string;
  tabs: string[];
}
