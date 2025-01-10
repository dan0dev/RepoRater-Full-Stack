export interface UrlPreviewType {
  title: string;
  description: string;
  image?: string;
  favicon?: string;
}

export interface UrlPreviewProps {
  preview: {
    title: string;
    description: string;
    image?: string;
    favicon?: string;
  };
  url: string;
}

export interface Card {
  url: string;
  user: {
    username: string;
    name: string;
    image: string | null;
  } | null;
  description: string;
  rating: number;
  postedAt: string;
  isAnonymous: boolean;
}
