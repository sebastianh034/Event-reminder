import { Artist, Event } from './fakedata';

export interface ExtendedArtist extends Artist {
  genre?: string;
  verified?: boolean;
  bio?: string;
  monthlyListeners?: string;
  topTracks?: string[];
  upcomingEvents?: Event[];
}

// Helper functions to get additional artist details
export function getArtistGenre(name: string): string {
  const genres: Record<string, string> = {
    'Kendrick Lamar': 'Hip-Hop, Rap',
    'Taylor Swift': 'Pop, Country',
    'Drake': 'Hip-Hop, R&B',
    'The Weeknd': 'R&B, Pop',
    'Billie Eilish': 'Pop, Alternative'
  };
  return genres[name] || 'Pop';
}

export function getArtistBio(name: string): string {
  const bios: Record<string, string> = {
    'Kendrick Lamar': 'Pulitzer Prize-winning rapper and songwriter from Compton, California.',
    'Taylor Swift': 'Grammy-winning singer-songwriter known for narrative songs about her personal life.',
    'Drake': 'Canadian rapper, singer, and actor from Toronto.',
    'The Weeknd': 'Canadian singer, songwriter, and record producer from Toronto.',
    'Billie Eilish': 'American singer-songwriter known for her unique sound and style.'
  };
  return bios[name] || 'Popular recording artist.';
}

export function getMonthlyListeners(followers: string): string {
  const num = parseFloat(followers.replace('M', ''));
  return `${(num * 15).toFixed(1)}M`;
}

export function getTopTracks(name: string): string[] {
  const tracks: Record<string, string[]> = {
    'Kendrick Lamar': ['HUMBLE.', 'DNA.', 'Swimming Pools'],
    'Taylor Swift': ['Anti-Hero', 'Lavender Haze', 'Karma'],
    'Drake': ['God\'s Plan', 'In My Feelings', 'Hotline Bling'],
    'The Weeknd': ['Blinding Lights', 'The Hills', 'Can\'t Feel My Face'],
    'Billie Eilish': ['bad guy', 'everything i wanted', 'Happier Than Ever']
  };
  return tracks[name] || ['Popular Song 1', 'Popular Song 2', 'Popular Song 3'];
}

// Similar artists recommendations - now as full artist objects
export const similarArtists: Record<string, ExtendedArtist[]> = {
  'Taylor Swift': [
    {
      id: 101,
      name: 'Olivia Rodrigo',
      followers: '3.2M',
      image: 'https://example.com/olivia.jpg',
      isFollowing: false,
      genre: 'Pop, Alternative',
      verified: true,
      bio: 'Grammy-winning singer-songwriter known for emotional pop-rock anthems.',
      monthlyListeners: '48.0M',
      topTracks: ['drivers license', 'good 4 u', 'vampire'],
      upcomingEvents: []
    },
    {
      id: 102,
      name: 'Phoebe Bridgers',
      followers: '1.8M',
      image: 'https://example.com/phoebe.jpg',
      isFollowing: false,
      genre: 'Indie, Folk',
      verified: true,
      bio: 'Indie rock singer-songwriter known for introspective lyrics.',
      monthlyListeners: '27.0M',
      topTracks: ['Motion Sickness', 'Kyoto', 'I Know the End'],
      upcomingEvents: []
    },
    {
      id: 103,
      name: 'Lorde',
      followers: '2.9M',
      image: 'https://example.com/lorde.jpg',
      isFollowing: false,
      genre: 'Pop, Alternative',
      verified: true,
      bio: 'New Zealand singer-songwriter known for alternative pop music.',
      monthlyListeners: '35.5M',
      topTracks: ['Royals', 'Green Light', 'Solar Power'],
      upcomingEvents: []
    }
  ],
  'Kendrick Lamar': [
    {
      id: 104,
      name: 'J. Cole',
      followers: '4.1M',
      image: 'https://example.com/jcole.jpg',
      isFollowing: false,
      genre: 'Hip-Hop, Rap',
      verified: true,
      bio: 'American rapper, singer, and record producer from North Carolina.',
      monthlyListeners: '42.3M',
      topTracks: ['Middle Child', 'No Role Modelz', 'GOMD'],
      upcomingEvents: []
    },
    {
      id: 105,
      name: 'Tyler, The Creator',
      followers: '3.8M',
      image: 'https://example.com/tyler.jpg',
      isFollowing: false,
      genre: 'Hip-Hop, Alternative',
      verified: true,
      bio: 'American rapper, singer, and record producer known for unique style.',
      monthlyListeners: '38.7M',
      topTracks: ['EARFQUAKE', 'See You Again', 'Yonkers'],
      upcomingEvents: []
    }
  ],
  'Drake': [
    {
      id: 106,
      name: 'Future',
      followers: '3.5M',
      image: 'https://example.com/future.jpg',
      isFollowing: false,
      genre: 'Hip-Hop, Trap',
      verified: true,
      bio: 'American rapper, singer, and songwriter from Atlanta.',
      monthlyListeners: '41.2M',
      topTracks: ['Mask Off', 'Life Is Good', 'Jumpman'],
      upcomingEvents: []
    },
    {
      id: 107,
      name: 'Travis Scott',
      followers: '4.7M',
      image: 'https://example.com/travis.jpg',
      isFollowing: false,
      genre: 'Hip-Hop, Trap',
      verified: true,
      bio: 'American rapper, singer, and record producer from Houston.',
      monthlyListeners: '46.8M',
      topTracks: ['SICKO MODE', 'goosebumps', 'Antidote'],
      upcomingEvents: []
    }
  ],
  'The Weeknd': [
    {
      id: 108,
      name: 'Frank Ocean',
      followers: '2.4M',
      image: 'https://example.com/frank.jpg',
      isFollowing: false,
      genre: 'R&B, Alternative',
      verified: true,
      bio: 'American singer, songwriter, and rapper known for introspective R&B.',
      monthlyListeners: '36.0M',
      topTracks: ['Thinking Bout You', 'Thinkin Bout You', 'Pink + White'],
      upcomingEvents: []
    },
    {
      id: 109,
      name: 'Bryson Tiller',
      followers: '2.1M',
      image: 'https://example.com/bryson.jpg',
      isFollowing: false,
      genre: 'R&B, Hip-Hop',
      verified: true,
      bio: 'American singer, songwriter, and rapper from Louisville, Kentucky.',
      monthlyListeners: '31.5M',
      topTracks: ['Don\'t', 'Exchange', 'Run Me Dry'],
      upcomingEvents: []
    }
  ],
  'Billie Eilish': [
    {
      id: 110,
      name: 'Clairo',
      followers: '1.6M',
      image: 'https://example.com/clairo.jpg',
      isFollowing: false,
      genre: 'Indie Pop',
      verified: true,
      bio: 'American singer-songwriter known for dreamy indie pop songs.',
      monthlyListeners: '24.0M',
      topTracks: ['Pretty Girl', 'Bags', 'Sofia'],
      upcomingEvents: []
    },
    {
      id: 111,
      name: 'Girl in Red',
      followers: '1.2M',
      image: 'https://example.com/girlinred.jpg',
      isFollowing: false,
      genre: 'Indie Pop',
      verified: true,
      bio: 'Norwegian indie pop artist known for bedroom pop and LGBTQ+ themes.',
      monthlyListeners: '18.0M',
      topTracks: ['i wanna be your girlfriend', 'we fell in love in october', 'girls'],
      upcomingEvents: []
    }
  ]
};