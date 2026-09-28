export interface Song {
  id: string;
  songTitle: string;
  title?: string;
  artist: string;
  composer?: string;
  album?: string;
  genre: string;
  imageURL: string;
  tutorialURL?: string;
  lyrics?: string;
  tags?: string[];
  searchAliases?: string[];
  artistSlug?: string;
  songSlug?: string;
  language?: string;
  difficulty?: 'easy' | 'intermediate' | 'advanced' | string;
  playCount?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'private' | 'deleted';
  isWatermarked?: boolean;
  approvedAt?: string | Date;
  approvedBy?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  userId?: string;
  userEmail?: string;
}
