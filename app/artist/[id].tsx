import { useLocalSearchParams } from 'expo-router';
import ArtistPage from '../../components/ArtistPage';
import { fakeArtistData } from '../../components/data/fakedata';

export default function ArtistRoute() {
  const { id } = useLocalSearchParams();
  
  const artist = fakeArtistData.find(a => a.id.toString() === id);
  
  if (!artist) {
    return null;
  }
  
  return <ArtistPage artist={artist} />;
}