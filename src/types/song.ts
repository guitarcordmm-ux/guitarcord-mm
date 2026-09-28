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
  status?: 'pending' | 'approved' | 'rejected' | 'private' | 'deleted';
  isWatermarked?: boolean;
  approvedAt?: string | Date;
  approvedBy?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  userId?: string;
  userEmail?: string;
}
