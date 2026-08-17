export type PortfolioItemType = "image" | "video" | "youtube" | "instagram";

export type PortfolioVisibility = "public" | "recruiters_only" | "private";

export type PortfolioCategory = "work" | "personal" | "intro";

export interface PortfolioItem {
  id: string;
  userId?: string;
  type: PortfolioItemType;
  category: PortfolioCategory;
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  embedUrl?: string;
  duration?: string;
  skills: string[];
  likesCount: number;
  isLiked?: boolean;
  viewsCount: number;
  isFeatured: boolean;
  sortOrder: number;
  visibility: PortfolioVisibility;
  createdAt: string;
  updatedAt: string;
}

export type PortfolioTab = "All" | "Images" | "Videos" | "YouTube";

export interface PortfolioFormValues {
  type: PortfolioItemType;
  title: string;
  description: string;
  url: string;
  skills: string[];
  isFeatured: boolean;
  visibility: PortfolioVisibility;
  file?: File;
}
