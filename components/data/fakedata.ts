export interface Event {
  id: number;
  artist: string;
  artistId?: number;
  date: string;
  venue: string;
  location: string;
  status: string;
  statusColor: string;
  image: string;
  latitude?: number;
  longitude?: number;
}

export interface Artist {
  id: number;
  name: string;
  followers: string;
  image: string;
  isFollowing: boolean;
}

export const fakeConcertData: Event[] = [
  // Kendrick Lamar Events
  {
    id: 1,
    artist: "Kendrick Lamar",
    date: "Mar 15",
    venue: "MGM Grand",
    location: "Las Vegas, NV",
    status: "Low Stock",
    statusColor: "#F59E0B",
    image: "https://example.com/kendrick.jpg",
    latitude: 36.1024,
    longitude: -115.1708
  },
  {
    id: 2,
    artist: "Kendrick Lamar",
    date: "Apr 2",
    venue: "Madison Square Garden",
    location: "New York, NY",
    status: "Available",
    statusColor: "#3B82F6",
    image: "https://example.com/kendrick.jpg",
    latitude: 40.7505,
    longitude: -73.9934
  },
  {
    id: 3,
    artist: "Kendrick Lamar",
    date: "Apr 18",
    venue: "Staples Center",
    location: "Los Angeles, CA",
    status: "Selling Fast",
    statusColor: "#F59E0B",
    image: "https://example.com/kendrick.jpg",
    latitude: 34.0430,
    longitude: -118.2673
  },
  {
    id: 4,
    artist: "Kendrick Lamar",
    date: "May 5",
    venue: "United Center",
    location: "Chicago, IL",
    status: "Available",
    statusColor: "#3B82F6",
    image: "https://example.com/kendrick.jpg",
    latitude: 41.8807,
    longitude: -87.6742
  },
  {
    id: 5,
    artist: "Kendrick Lamar",
    date: "Jun 12",
    venue: "Rogers Centre",
    location: "Toronto, ON",
    status: "Low Stock",
    statusColor: "#F59E0B",
    image: "https://example.com/kendrick.jpg",
    latitude: 43.6414,
    longitude: -79.3894
  },

  // Drake Events
  {
    id: 10,
    artist: "Drake",
    date: "Mar 28",
    venue: "Scotiabank Arena",
    location: "Toronto, ON",
    status: "Sold Out",
    statusColor: "#EF4444",
    image: "https://example.com/drake.jpg",
    latitude: 43.6435,
    longitude: -79.3791
  },
  {
    id: 11,
    artist: "Drake",
    date: "Apr 10",
    venue: "Barclays Center",
    location: "Brooklyn, NY",
    status: "Low Stock",
    statusColor: "#F59E0B",
    image: "https://example.com/drake.jpg",
    latitude: 40.6826,
    longitude: -73.9754
  },
  {
    id: 12,
    artist: "Drake",
    date: "May 12",
    venue: "MGM Grand",
    location: "Las Vegas, NV",
    status: "Available",
    statusColor: "#3B82F6",
    image: "https://example.com/drake.jpg",
    latitude: 36.1024,
    longitude: -115.1708
  },
  {
    id: 13,
    artist: "Drake",
    date: "May 25",
    venue: "American Airlines Center",
    location: "Dallas, TX",
    status: "Available",
    statusColor: "#3B82F6",
    image: "https://example.com/drake.jpg",
    latitude: 32.7905,
    longitude: -96.8103
  },

  // Taylor Swift Events
  {
    id: 20,
    artist: "Taylor Swift",
    date: "Apr 5",
    venue: "SoFi Stadium",
    location: "Los Angeles, CA",
    status: "Sold Out",
    statusColor: "#EF4444",
    image: "https://example.com/taylor.jpg",
    latitude: 33.9535,
    longitude: -118.3392
  },
  {
    id: 21,
    artist: "Taylor Swift",
    date: "Apr 22",
    venue: "MetLife Stadium",
    location: "East Rutherford, NJ",
    status: "Sold Out",
    statusColor: "#EF4444",
    image: "https://example.com/taylor.jpg",
    latitude: 40.8128,
    longitude: -74.0742
  },
  {
    id: 22,
    artist: "Taylor Swift",
    date: "May 8",
    venue: "Soldier Field",
    location: "Chicago, IL",
    status: "Low Stock",
    statusColor: "#F59E0B",
    image: "https://example.com/taylor.jpg",
    latitude: 41.8623,
    longitude: -87.6167
  },
  {
    id: 23,
    artist: "Taylor Swift",
    date: "June 15",
    venue: "MGM Grand",
    location: "Las Vegas, NV",
    status: "Tickets Soon",
    statusColor: "#10B981",
    image: "https://example.com/taylor.jpg",
    latitude: 36.1024,
    longitude: -115.1708
  },

  // The Weeknd Events
  {
    id: 30,
    artist: "The Weeknd",
    date: "Mar 20",
    venue: "T-Mobile Arena",
    location: "Las Vegas, NV",
    status: "Available",
    statusColor: "#3B82F6",
    image: "https://example.com/weeknd.jpg",
    latitude: 36.1020,
    longitude: -115.1784
  },
  {
    id: 31,
    artist: "The Weeknd",
    date: "Apr 14",
    venue: "Chase Center",
    location: "San Francisco, CA",
    status: "Low Stock",
    statusColor: "#F59E0B",
    image: "https://example.com/weeknd.jpg",
    latitude: 37.7680,
    longitude: -122.3877
  },
  {
    id: 32,
    artist: "The Weeknd",
    date: "May 3",
    venue: "TD Garden",
    location: "Boston, MA",
    status: "Available",
    statusColor: "#3B82F6",
    image: "https://example.com/weeknd.jpg",
    latitude: 42.3662,
    longitude: -71.0621
  },
  {
    id: 33,
    artist: "The Weeknd",
    date: "Jun 1",
    venue: "Climate Pledge Arena",
    location: "Seattle, WA",
    status: "Available",
    statusColor: "#3B82F6",
    image: "https://example.com/weeknd.jpg",
    latitude: 47.6221,
    longitude: -122.3540
  },

  // Billie Eilish Events
  {
    id: 40,
    artist: "Billie Eilish",
    date: "Mar 25",
    venue: "Forum",
    location: "Los Angeles, CA",
    status: "Sold Out",
    statusColor: "#EF4444",
    image: "https://example.com/billie.jpg",
    latitude: 33.9580,
    longitude: -118.3418
  },
  {
    id: 41,
    artist: "Billie Eilish",
    date: "Apr 8",
    venue: "United Center",
    location: "Chicago, IL",
    status: "Low Stock",
    statusColor: "#F59E0B",
    image: "https://example.com/billie.jpg",
    latitude: 41.8807,
    longitude: -87.6742
  },
  {
    id: 42,
    artist: "Billie Eilish",
    date: "May 15",
    venue: "Bell Centre",
    location: "Montreal, QC",
    status: "Available",
    statusColor: "#3B82F6",
    image: "https://example.com/billie.jpg",
    latitude: 45.4961,
    longitude: -73.5693
  },
  {
    id: 43,
    artist: "Billie Eilish",
    date: "Jul 8",
    venue: "Sphere",
    location: "Las Vegas, NV",
    status: "Low Stock",
    statusColor: "#F59E0B",
    image: "https://example.com/billie.jpg",
    latitude: 36.1215,
    longitude: -115.1678
  },

  // Bad Bunny Events
  {
    id: 50,
    artist: "Bad Bunny",
    date: "Mar 30",
    venue: "Kia Forum",
    location: "Los Angeles, CA",
    status: "Sold Out",
    statusColor: "#EF4444",
    image: "https://example.com/badbunny.jpg",
    latitude: 33.9580,
    longitude: -118.3418
  },
  {
    id: 51,
    artist: "Bad Bunny",
    date: "Apr 16",
    venue: "American Airlines Arena",
    location: "Miami, FL",
    status: "Low Stock",
    statusColor: "#F59E0B",
    image: "https://example.com/badbunny.jpg",
    latitude: 25.7814,
    longitude: -80.1870
  },
  {
    id: 52,
    artist: "Bad Bunny",
    date: "May 20",
    venue: "Toyota Center",
    location: "Houston, TX",
    status: "Available",
    statusColor: "#3B82F6",
    image: "https://example.com/badbunny.jpg",
    latitude: 29.7508,
    longitude: -95.3621
  },

  // SZA Events
  {
    id: 60,
    artist: "SZA",
    date: "Apr 3",
    venue: "State Farm Arena",
    location: "Atlanta, GA",
    status: "Available",
    statusColor: "#3B82F6",
    image: "https://example.com/sza.jpg",
    latitude: 33.7573,
    longitude: -84.3963
  },
  {
    id: 61,
    artist: "SZA",
    date: "Apr 24",
    venue: "Little Caesars Arena",
    location: "Detroit, MI",
    status: "Low Stock",
    statusColor: "#F59E0B",
    image: "https://example.com/sza.jpg",
    latitude: 42.3410,
    longitude: -83.0550
  },
  {
    id: 62,
    artist: "SZA",
    date: "May 18",
    venue: "Capital One Arena",
    location: "Washington, DC",
    status: "Available",
    statusColor: "#3B82F6",
    image: "https://example.com/sza.jpg",
    latitude: 38.8981,
    longitude: -77.0209
  },

  // Travis Scott Events
  {
    id: 70,
    artist: "Travis Scott",
    date: "Mar 22",
    venue: "Toyota Center",
    location: "Houston, TX",
    status: "Sold Out",
    statusColor: "#EF4444",
    image: "https://example.com/travis.jpg",
    latitude: 29.7508,
    longitude: -95.3621
  },
  {
    id: 71,
    artist: "Travis Scott",
    date: "Apr 12",
    venue: "Crypto.com Arena",
    location: "Los Angeles, CA",
    status: "Low Stock",
    statusColor: "#F59E0B",
    image: "https://example.com/travis.jpg",
    latitude: 34.0430,
    longitude: -118.2673
  },
  {
    id: 72,
    artist: "Travis Scott",
    date: "May 7",
    venue: "Prudential Center",
    location: "Newark, NJ",
    status: "Available",
    statusColor: "#3B82F6",
    image: "https://example.com/travis.jpg",
    latitude: 40.7336,
    longitude: -74.1710
  }
];

export const fakeArtistData: Artist[] = [
  {
    id: 1,
    name: "Kendrick Lamar",
    followers: "2.1M",
    image: "https://example.com/kendrick-profile.jpg",
    isFollowing: false
  },
  {
    id: 2,
    name: "Taylor Swift",
    followers: "5.8M",
    image: "https://example.com/taylor-profile.jpg",
    isFollowing: true
  },
  {
    id: 3,
    name: "Drake",
    followers: "4.2M",
    image: "https://example.com/drake-profile.jpg",
    isFollowing: false
  },
  {
    id: 4,
    name: "The Weeknd",
    followers: "3.1M",
    image: "https://example.com/weeknd-profile.jpg",
    isFollowing: true
  },
  {
    id: 5,
    name: "Billie Eilish",
    followers: "1.9M",
    image: "https://example.com/billie-profile.jpg",
    isFollowing: false
  },
  {
    id: 6,
    name: "Bad Bunny",
    followers: "6.4M",
    image: "https://example.com/badbunny-profile.jpg",
    isFollowing: true
  },
  {
    id: 7,
    name: "SZA",
    followers: "2.8M",
    image: "https://example.com/sza-profile.jpg",
    isFollowing: false
  },
  {
    id: 8,
    name: "Travis Scott",
    followers: "4.1M",
    image: "https://example.com/travis-profile.jpg",
    isFollowing: true
  }
];

export const fakePastEvents: Event[] = [
  {
    id: 101,
    artist: "Kendrick Lamar",
    date: "Jan 20",
    venue: "MGM Grand",
    location: "Las Vegas, NV",
    status: "Attended",
    statusColor: "#6B7280",
    image: "https://example.com/kendrick.jpg",
    latitude: 36.1024,
    longitude: -115.1708
  },
  {
    id: 102,
    artist: "Kendrick Lamar",
    date: "Dec 10",
    venue: "Forum",
    location: "Los Angeles, CA",
    status: "Attended",
    statusColor: "#6B7280",
    image: "https://example.com/kendrick.jpg",
    latitude: 33.9580,
    longitude: -118.3418
  },
  {
    id: 103,
    artist: "Taylor Swift",
    date: "Jan 15",
    venue: "T-Mobile Arena",
    location: "Las Vegas, NV",
    status: "Attended",
    statusColor: "#6B7280",
    image: "https://example.com/taylor.jpg",
    latitude: 36.1020,
    longitude: -115.1784
  },
  {
    id: 104,
    artist: "Taylor Swift",
    date: "Nov 28",
    venue: "AT&T Stadium",
    location: "Arlington, TX",
    status: "Attended",
    statusColor: "#6B7280",
    image: "https://example.com/taylor.jpg",
    latitude: 32.7473,
    longitude: -97.0945
  },
  {
    id: 105,
    artist: "Drake",
    date: "Feb 5",
    venue: "Sphere",
    location: "Las Vegas, NV",
    status: "Attended",
    statusColor: "#6B7280",
    image: "https://example.com/drake.jpg",
    latitude: 36.1215,
    longitude: -115.1678
  },
  {
    id: 106,
    artist: "Drake",
    date: "Dec 18",
    venue: "Scotiabank Arena",
    location: "Toronto, ON",
    status: "Attended",
    statusColor: "#6B7280",
    image: "https://example.com/drake.jpg",
    latitude: 43.6435,
    longitude: -79.3791
  },
  {
    id: 107,
    artist: "The Weeknd",
    date: "Jan 8",
    venue: "SoFi Stadium",
    location: "Los Angeles, CA",
    status: "Attended",
    statusColor: "#6B7280",
    image: "https://example.com/weeknd.jpg",
    latitude: 33.9535,
    longitude: -118.3392
  },
  {
    id: 108,
    artist: "Billie Eilish",
    date: "Feb 14",
    venue: "Chase Center",
    location: "San Francisco, CA",
    status: "Attended",
    statusColor: "#6B7280",
    image: "https://example.com/billie.jpg",
    latitude: 37.7680,
    longitude: -122.3877
  },
  {
    id: 109,
    artist: "Bad Bunny",
    date: "Jan 25",
    venue: "Hard Rock Stadium",
    location: "Miami, FL",
    status: "Attended",
    statusColor: "#6B7280",
    image: "https://example.com/badbunny.jpg",
    latitude: 25.9580,
    longitude: -80.2389
  },
  {
    id: 110,
    artist: "SZA",
    date: "Feb 18",
    venue: "Barclays Center",
    location: "Brooklyn, NY",
    status: "Attended",
    statusColor: "#6B7280",
    image: "https://example.com/sza.jpg",
    latitude: 40.6826,
    longitude: -73.9754
  },
  {
    id: 111,
    artist: "Travis Scott",
    date: "Jan 12",
    venue: "NRG Stadium",
    location: "Houston, TX",
    status: "Attended",
    statusColor: "#6B7280",
    image: "https://example.com/travis.jpg",
    latitude: 29.6847,
    longitude: -95.4107
  }
];

// Helper function to get artist ID from artist name
export const getArtistIdByName = (artistName: string): number | undefined => {
  return fakeArtistData.find(artist => artist.name === artistName)?.id;
};

// Helper function to get events from followed artists
export const getFollowedArtistsEvents = (): Event[] => {
  const followedArtistNames = fakeArtistData
    .filter(artist => artist.isFollowing)
    .map(artist => artist.name);

  return fakeConcertData
    .filter(event => followedArtistNames.includes(event.artist))
    .slice(0, 10); // Limit to 10 events
};