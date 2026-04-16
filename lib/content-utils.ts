import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

export type ContentItem = {
  slug: string;
  title: string;
  category: 'work' | 'writings' | 'social';
  iconType?: 'image' | 'gradient' | 'svg';
  icon?: string;
  gradientColors?: string;
  externalUrl?: string;
};

const socialLinks: ContentItem[] = [
  { slug: 'github', title: 'GitHub', category: 'social', iconType: 'svg', externalUrl: 'https://github.com/ethantrang' },
  { slug: 'linkedin', title: 'LinkedIn', category: 'social', iconType: 'svg', externalUrl: 'https://www.linkedin.com/in/ethan-trang/' },
  { slug: 'x', title: 'X', category: 'social', iconType: 'svg', externalUrl: 'https://x.com/ethantrangg' },
  { slug: 'youtube', title: 'YouTube', category: 'social', iconType: 'svg', externalUrl: 'https://www.youtube.com/@ethantrangg' },
  { slug: 'instagram', title: 'Instagram', category: 'social', iconType: 'svg', externalUrl: 'https://www.instagram.com/ethantrangg' },
  { slug: 'tiktok', title: 'TikTok', category: 'social', iconType: 'svg', externalUrl: 'https://tiktok.com/@ethantrangg' },
];

export function extractTitle(filePath: string): string {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const match = content.match(/^#\s+(.+)$/m);
    if (match) return match[1].trim();
    const filename = filePath.split('/').pop()?.replace(/\.md$/, '') || '';
    return filename.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  } catch {
    return 'Untitled';
  }
}

function scanContentDir(category: 'work' | 'writings'): ContentItem[] {
  const dir = join(process.cwd(), 'content', category);
  try {
    return readdirSync(dir)
      .filter(f => f.endsWith('.md'))
      .map(file => {
        const slug = file.replace(/\.md$/, '');
        const title = extractTitle(join(dir, file));

        if (category === 'work') {
          const iconMappings: Record<string, string> = { 'vng-corporation': 'vngcorp.jpeg' };
          const iconName = iconMappings[slug] || `${slug.replace(/-/g, '')}.jpeg`;
          try {
            statSync(join(process.cwd(), 'public', iconName));
            return { slug, title, category, iconType: 'image' as const, icon: `/${iconName}` };
          } catch {
            // no icon found, fall through
          }
        }

        return { slug, title, category };
      });
  } catch {
    return [];
  }
}

export function getAllContentItems(): ContentItem[] {
  return [
    ...scanContentDir('work'),
    ...scanContentDir('writings'),
    ...socialLinks,
  ];
}

export function getContentByCategory(category: ContentItem['category']): ContentItem[] {
  return getAllContentItems().filter(item => item.category === category);
}

export function getContentBySlug(category: ContentItem['category'], slug: string): ContentItem | undefined {
  return getAllContentItems().find(item => item.category === category && item.slug === slug);
}
