export interface UserSocial {
  id: number;
  platform: string;
  url: string;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  bio: string;
  role: string;
  credits: number;
  subjects: string[];
  socials: UserSocial[];
  createdAt: string;
  resourceCount?: number;
  upvoteCount?: number;
}

export interface UpdateProfileRequest {
  name: string;
  bio: string;
}

export interface UserSocialRequest {
  platform: string;
  url: string;
}
