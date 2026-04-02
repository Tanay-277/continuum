export interface CategoryConfig {
  slug: string;
  title: string;
  description: string;
  rawgGenre: string;
}

export const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    slug: 'action',
    title: 'Action',
    description: 'Fast combat, huge set pieces, and nonstop momentum.',
    rawgGenre: 'action',
  },
  {
    slug: 'rpg',
    title: 'RPG',
    description: 'Deep progression systems and long-form worldbuilding.',
    rawgGenre: 'role-playing-games-rpg',
  },
  {
    slug: 'shooter',
    title: 'Shooter',
    description: 'Precision aiming, tactical movement, and heavy firepower.',
    rawgGenre: 'shooter',
  },
  {
    slug: 'strategy',
    title: 'Strategy',
    description: 'Planning, adaptation, and high-impact decision making.',
    rawgGenre: 'strategy',
  },
  {
    slug: 'adventure',
    title: 'Adventure',
    description: 'Narrative-first journeys packed with discovery.',
    rawgGenre: 'adventure',
  },
  {
    slug: 'indie',
    title: 'Indie',
    description: 'Creative design ideas and standout artistic direction.',
    rawgGenre: 'indie',
  },
];

export function getCategoryConfig(slug: string): CategoryConfig | undefined {
  return CATEGORY_CONFIGS.find((category) => category.slug === slug);
}
