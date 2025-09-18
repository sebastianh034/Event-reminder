export interface Event {
  id: number;
  artist: string;
  date: string;
  venue: string;
  location: string;
  status: string;
  statusColor: string;
  image: string;
}

export interface Artist {
  id: number;
  name: string;
  followers: string;
  image: string;
  isFollowing: boolean;
}

export const fakeConcertData: Event[] = [
  {
    id: 1,
    artist: "Kendrick Lamar",
    date: "Mar 15",
    venue: "MGM Grand",
    location: "Las Vegas",
    status: "Low Stock",
    statusColor: "#F59E0B",
    image: "https://example.com/kendrick.jpg"
  },
  {
    id: 2,
    artist: "Drake",
    date: "May 12",
    venue: "MGM Grand", 
    location: "Las Vegas",
    status: "Sold Out",
    statusColor: "#EF4444",
    image: "https://example.com/drake.jpg"
  },
  {
    id: 3,
    artist: "Taylor Swift",
    date: "June 15",
    venue: "MGM Grand",
    location: "Las Vegas", 
    status: "Tickets Soon",
    statusColor: "#10B981",
    image: "https://example.com/taylor.jpg"
  },
  // {
  //   id: 4,
  //   artist: "The Weeknd",
  //   date: "Apr 22",
  //   venue: "T-Mobile Arena",
  //   location: "Las Vegas",
  //   status: "Available",
  //   statusColor: "#3B82F6",
  //   image: "https://example.com/weeknd.jpg"
  // },
  {
    id: 5,
    artist: "Billie Eilish",
    date: "Jul 8",
    venue: "Sphere",
    location: "Las Vegas",
    status: "Low Stock",
    statusColor: "#F59E0B",
    image: "https://example.com/billie.jpg"
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
  }
  
];

export const fakePastEvents: Event[] = [
  {
    id: 101,
    artist: "Kendrick Lamar",
    date: "Jan 20",
    venue: "MGM Grand",
    location: "Las Vegas",
    status: "Attended",
    statusColor: "#6B7280",
    image: "https://example.com/kendrick.jpg"
  },
  {
    id: 102,
    artist: "Taylor Swift",
    date: "Dec 15",
    venue: "T-Mobile Arena",
    location: "Las Vegas",
    status: "Attended", 
    statusColor: "#6B7280",
    image: "https://example.com/taylor.jpg"
  },
  {
    id: 103,
    artist: "Drake",
    date: "Nov 8",
    venue: "Sphere",
    location: "Las Vegas",
    status: "Attended",
    statusColor: "#6B7280", 
    image: "https://example.com/drake.jpg"
  }
];