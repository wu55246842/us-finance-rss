export type Category = 'markets' | 'macro' | 'official';

export type Source = {
  id: string;
  name: string;
  url: string;
  category: Category;
  description?: string;
};

export type Article = {
  id: string;
  title: string;
  link: string;
  sourceId: string;
  sourceName: string;
  category: Category;
  publishedAt: string; // ISO string
  summary?: string;
};
