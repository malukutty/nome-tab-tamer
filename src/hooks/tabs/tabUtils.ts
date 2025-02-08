
import { TabData } from '@/types/browser';
import { TabRuleResponse } from '@/types/browser';

export const organizeTab = (tab: TabData, rules: TabRuleResponse[], groups: any[]) => {
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
