export interface InfluencerFoodType {
  iinfluencer: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    instagram: string;
    youtube: string;
    tiktok: string;
    facebook: string;
    twitter: string;
    snapchat: string;
    website: string;
    linkedin: string;
  };
  foods: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
  }[];
}

export interface InfluencerFoodVideoType {
  influencer: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    instagram: string;
    youtube: string;
    tiktok: string;
    facebook: string;
    twitter: string;
    snapchat: string;
    website: string;
    linkedin: string;
  };
  foods: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    videos: {
      url: string;
      title: string;
      thumbnailUrl: string;
    }[];
  }[];
}
