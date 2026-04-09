export enum ContentType {
  POST = 'POST',
  CAROUSEL = 'CAROUSEL'
}

export interface CarouselSlide {
  title: string;
  content: string;
  footer: string;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  titleFont?: string;
  bodyFont?: string;
  titleWeight?: string; // e.g., '300', '400', '700', '900'
  bodyWeight?: string;
}

export interface GeneratedContent {
  id: string;
  type: ContentType;
  textRaw?: string;
  slides?: CarouselSlide[];
  dwellScore?: number;
  viralTips?: string[];
  hashtags?: string[];
  createdAt: number;
}

export interface GeminiResponse {
  success: boolean;
  data?: GeneratedContent;
  error?: string;
}