export interface Coupon {
  id: string;
  code: string;
  status: 'unredeemed' | 'redeemed' | 'expired';
  createdAt: number;
  redeemedAt: number | null;
  redeemedBy: string | null;
  expiresAt: number | null;
  priceCharged: number;
  soldOfflineVia: string | null;
}

export type UserRole = 'painter' | 'admin';
export type AccountStatus = 'active' | 'expired' | 'pending';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  accountStatus: AccountStatus;
  couponId?: string;
  expiresAt?: number;
  profile?: PainterProfile;
  createdAt: number;
}

export interface PainterProfile {
  name: string;
  businessName: string;
  bio: string;
  yearsOfExperience: number;
  photoUrl: string;
  coverImageUrl: string;
  whatsappNumber: string;
  phoneNumber: string;
  email: string;
  serviceAreas: string[];
  regions: string[];
  cities: string[];
  specialties: string[];
  availability: boolean;
  workingHours: string;
}

export interface PortfolioItem {
  id: string;
  painterId: string;
  imageUrl: string;
  title: string;
  description: string;
  caption: string;
  isBeforeAfter: boolean;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  isCover: boolean;
  visible: boolean;
  showOnHomepage: boolean;
  createdAt: number;
  order: number;
  albumId?: string;
}

export interface PortfolioAlbum {
  id: string;
  painterId: string;
  name: string;
  createdAt: number;
  order: number;
}

export interface PromoAd {
  id: string;
  painterId: string;
  painterName: string;
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  priceCharged: number;
  createdAt: number;
  approvedAt: number | null;
  activeUntil: number | null;
  clickThroughPainterId: string;
}

export interface PainterListing {
  id: string;
  painterId: string;
  name: string;
  businessName: string;
  profileImageUrl: string;
  coverImageUrl: string;
  bio: string;
  yearsOfExperience: number;
  whatsappNumber: string;
  phoneNumber: string;
  email: string;
  serviceAreas: string[];
  regions: string[];
  cities: string[];
  specialties: string[];
  availability: boolean;
  workingHours: string;
  visible: boolean;
  featured: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface HeroVideo {
  url: string;
  linkUrl: string;
  linkLabel: string;
}

export interface HomepageContent {
  hero: {
    headline: string;
    subtitle: string;
    description: string;
    heroImage: string;
    ctaText: string;
    ctaLink: string;
    videos: HeroVideo[];
  };
  about: {
    title: string;
    description: string;
    mission: string;
    vision: string;
  };
  services: HomepageService[];
  howItWorks: HowItWorksStep[];
  featuredPainters: string[];
  banners: HomepageBanner[];
  promotions: HomepagePromotion[];
  tagline: string;
  footer: {
    contact: string;
    socialLinks: Record<string, string>;
  };
}

export interface HomepageService {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface HowItWorksStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export interface HomepageBanner {
  id: string;
  imageUrl: string;
  enabled: boolean;
}

export interface HomepagePromotion {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  visible: boolean;
}

export interface HomepageGalleryItem {
  id: string;
  painterId: string;
  portfolioItemId: string;
  imageUrl: string;
  painterName: string;
  painterBusinessName: string;
  painterPhotoUrl: string;
  createdAt: number;
  priority: number;
}

export interface SiteConfig {
  regions: string[];
  specialties: string[];
}

export interface Review {
  id: string;
  painterId: string;
  reviewerName: string;
  rating: number;
  text: string;
  createdAt: number;
}
