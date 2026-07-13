// Shared CreaTune types — kept out of the component files so Fast Refresh
// and tree-shaking treat the React components as component-only modules.

export interface CreaTuneTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  url: string;
  plays: number;
  lyrics?: string;
  cover?: string;
  albumId?: string;
  featured?: boolean;
}

export interface CreaTuneAlbum {
  id: string;
  title: string;
  year?: string;
  cover?: string;
}

export interface CreaTuneLinks {
  soundcloud?: string;
  youtube?: string;
  album?: string;
}

export interface CreaTuneNews {
  title: string;
  body: string;
}

export interface CreaTuneNextRelease {
  title: string;
  date: string;
  note: string;
  cover?: string;
}
