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
  status?: 'pending' | 'approved' | 'rejected' | 'private' | 'deleted';
  isWatermarked?: boolean;
  approvedAt?: Date | any;
  approvedBy?: string;
  createdAt?: Date | any;
  updatedAt?: Date | any;
  userId?: string;
  userEmail?: string;
}
