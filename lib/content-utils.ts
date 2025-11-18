import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

export type ContentItem = {
  slug: string;
  title: string;
  category: 'work' | 'random' | 'writings' | 'social';
  iconType?: 'image' | 'gradient' | 'svg';
  icon?: string;
  gradientColors?: string;
  externalUrl?: string;
  role?: string;
};

// Minimal config for external links only (writings, social)
// These can't be inferred from the file system
const externalLinks: Omit<ContentItem, 'slug' | 'category'>[] = [
  {
    title: 'My first $10k month',
    iconType: 'svg',
    externalUrl: 'https://ethantrangg.medium.com/my-first-10k-month-410e69fb1d83',
  },
  {
    title: "So I'm starting over",
    iconType: 'svg',
    externalUrl: 'https://ethantrangg.medium.com/so-im-starting-over-1873e4956631',
  },
  {
    title: 'GitHub',
    iconType: 'svg',
    externalUrl: 'https://github.com/ethantrang',
  },
  {
    title: 'LinkedIn',
    iconType: 'svg',
    externalUrl: 'https://www.linkedin.com/in/ethan-trang/',
  },
  {
    title: 'X',
    iconType: 'svg',
    externalUrl: 'https://x.com/ethantrangg',
  },
  {
    title: 'YouTube',
    iconType: 'svg',
    externalUrl: 'https://www.youtube.com/@ethantrangg',
  },
  {
    title: 'Instagram',
    iconType: 'svg',
    externalUrl: 'https://www.instagram.com/ethantrangg',
  },
  {
    title: 'TikTok',
    iconType: 'svg',
    externalUrl: 'https://tiktok.com/@ethantrangg',
  },
];

// Extract title from MDX file (first H1 heading)
function extractTitleFromMDX(filePath: string): string {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }
    // Fallback to filename if no H1 found
    const filename = filePath.split('/').pop()?.replace(/\.mdx?$/, '') || '';
    return filename
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return 'Untitled';
  }
}

// Scan directory for MDX pages
function scanDirectoryForPages(
  dirPath: string,
  category: 'work' | 'random',
  basePath: string = ''
): ContentItem[] {
  const items: ContentItem[] = [];
  
  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Check if directory contains a page.mdx
        const pagePath = join(fullPath, 'page.mdx');
        if (statSync(pagePath).isFile()) {
          const title = extractTitleFromMDX(pagePath);
          const slug = entry.name;
          
          // Try to infer icon from public folder
          // Manual mappings for edge cases
          const iconMappings: Record<string, string> = {
            'vng-corporation': 'vngcorp.jpeg',
          };
          
          // Pattern: slug without hyphens + .jpeg (e.g., inflect-labs -> inflectlabs.jpeg)
          // Or use manual mapping if available
          const iconName = iconMappings[slug] || `${slug.replace(/-/g, '')}.jpeg`;
          let iconType: 'image' | 'gradient' = 'gradient';
          let icon: string | undefined;
          
          // Check if icon exists in public folder
          try {
            const publicIconPath = join(process.cwd(), 'public', iconName);
            if (statSync(publicIconPath).isFile()) {
              iconType = 'image';
              icon = `/${iconName}`;
            } else {
              // Icon doesn't exist, use default gradient based on slug
              const gradients: Record<string, string> = {
                building: 'from-emerald-400 to-yellow-400',
                exploring: 'from-orange-400 to-yellow-400',
                'side-quests': 'from-green-400 to-purple-400',
              };
              if (gradients[slug]) {
                iconType = 'gradient';
                icon = gradients[slug];
              }
            }
          } catch {
            // Icon doesn't exist, use default gradient based on slug
            const gradients: Record<string, string> = {
              building: 'from-emerald-400 to-yellow-400',
              exploring: 'from-orange-400 to-yellow-400',
              'side-quests': 'from-green-400 to-purple-400',
            };
            if (gradients[slug]) {
              iconType = 'gradient';
              icon = gradients[slug];
            }
          }
          
          items.push({
            slug,
            title,
            category,
            iconType,
            ...(iconType === 'image' && icon ? { icon } : iconType === 'gradient' && icon ? { gradientColors: icon } : {}),
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dirPath}:`, error);
  }
  
  return items;
}

// Get all content items dynamically
export function getAllContentItems(): ContentItem[] {
  const appDir = join(process.cwd(), 'app');
  
  // Scan work directory
  const workDir = join(appDir, 'work');
  const workItems = scanDirectoryForPages(workDir, 'work');
  
  // Scan random directory if it exists
  const randomDir = join(appDir, 'random');
  let randomItems: ContentItem[] = [];
  try {
    if (statSync(randomDir).isDirectory()) {
      randomItems = scanDirectoryForPages(randomDir, 'random');
    }
  } catch {
    // random directory doesn't exist, skip
  }
  
  // Add external links for writings and social
  const writings = externalLinks.slice(0, 2).map((link, index) => ({
    slug: link.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category: 'writings' as const,
    ...link,
  }));
  
  const social = externalLinks.slice(2).map((link) => ({
    slug: link.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    category: 'social' as const,
    ...link,
  }));
  
  return [...workItems, ...randomItems, ...writings, ...social];
}

// Get content by category
export function getContentByCategory(
  category: ContentItem['category']
): ContentItem[] {
  return getAllContentItems().filter((item) => item.category === category);
}

// Get content by slug
export function getContentBySlug(
  category: ContentItem['category'],
  slug: string
): ContentItem | undefined {
  return getAllContentItems().find(
    (item) => item.category === category && item.slug === slug
  );
}

