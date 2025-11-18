export type ContentItem = {
  slug: string;
  title: string;
  category: 'work' | 'random' | 'writings' | 'social';
  iconType: 'image' | 'gradient' | 'svg';
  icon?: string; // path for image or gradient colors
  gradientColors?: string; // for gradient icons
  externalUrl?: string; // for external links (writings, social)
  role?: string; // for work items
};

export const contentItems: ContentItem[] = [
  // Work experiences
  {
    slug: 'inflect-labs',
    title: 'Inflect Labs',
    category: 'work',
    iconType: 'image',
    icon: '/inflectlabs.jpeg',
    role: 'Founder',
  },
  {
    slug: 'relevance-ai',
    title: 'Relevance AI',
    category: 'work',
    iconType: 'image',
    icon: '/relevanceai.jpeg',
    role: 'AI Engineer',
  },
  {
    slug: 'dory-ai',
    title: 'Dory AI',
    category: 'work',
    iconType: 'image',
    icon: '/doryai.jpeg',
    role: 'Co-Founder, CTO',
  },
  {
    slug: 'vng-corporation',
    title: 'VNG Corporation',
    category: 'work',
    iconType: 'image',
    icon: '/vngcorp.jpeg',
    role: 'AI Intern',
  },
  // Random items
  {
    slug: 'building',
    title: 'Building',
    category: 'random',
    iconType: 'gradient',
    gradientColors: 'from-emerald-400 to-yellow-400',
  },
  {
    slug: 'exploring',
    title: 'Exploring',
    category: 'random',
    iconType: 'gradient',
    gradientColors: 'from-orange-400 to-yellow-400',
  },
  {
    slug: 'side-quests',
    title: 'Side quests',
    category: 'random',
    iconType: 'gradient',
    gradientColors: 'from-green-400 to-purple-400',
  },
  // Writings (external links)
  {
    slug: 'my-first-10k-month',
    title: 'My first $10k month',
    category: 'writings',
    iconType: 'svg',
    externalUrl: 'https://ethantrangg.medium.com/my-first-10k-month-410e69fb1d83',
  },
  {
    slug: 'so-im-starting-over',
    title: "So I'm starting over",
    category: 'writings',
    iconType: 'svg',
    externalUrl: 'https://ethantrangg.medium.com/so-im-starting-over-1873e4956631',
  },
  // Social links
  {
    slug: 'github',
    title: 'GitHub',
    category: 'social',
    iconType: 'svg',
    externalUrl: 'https://github.com/ethantrang',
  },
  {
    slug: 'linkedin',
    title: 'LinkedIn',
    category: 'social',
    iconType: 'svg',
    externalUrl: 'https://www.linkedin.com/in/ethan-trang/',
  },
  {
    slug: 'x',
    title: 'X',
    category: 'social',
    iconType: 'svg',
    externalUrl: 'https://x.com/ethantrangg',
  },
  {
    slug: 'youtube',
    title: 'YouTube',
    category: 'social',
    iconType: 'svg',
    externalUrl: 'https://www.youtube.com/@ethantrangg',
  },
  {
    slug: 'instagram',
    title: 'Instagram',
    category: 'social',
    iconType: 'svg',
    externalUrl: 'https://www.instagram.com/ethantrangg',
  },
  {
    slug: 'tiktok',
    title: 'TikTok',
    category: 'social',
    iconType: 'svg',
    externalUrl: 'https://tiktok.com/@ethantrangg',
  },
];

export function getContentByCategory(category: ContentItem['category']): ContentItem[] {
  return contentItems.filter(item => item.category === category);
}

export function getContentBySlug(category: ContentItem['category'], slug: string): ContentItem | undefined {
  return contentItems.find(item => item.category === category && item.slug === slug);
}

