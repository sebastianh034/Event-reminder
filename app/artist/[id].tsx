import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { type Event, fakeArtistData, fakeConcertData, fakePastEvents } from '../../components/data/fakedata';
import { SafeAreaView } from 'react-native-safe-area-context';
import ArtistHeader from '../../components/ArtistPage/ArtistHeader';
import ContentContainer from '../../components/ArtistPage/ContentContainer';
import EventsSection from '../../components/ArtistPage/EventsSection';
import PastEventsSection from '../../components/ArtistPage/PastEventsSection';

export default function ArtistPage() {
  const { id } = useLocalSearchParams();

  const artist = fakeArtistData.find(a => a.id.toString() === id);

  if (!artist) {
    return null;
  }

  const events = fakeConcertData.filter(event => event.artist === artist.name);
  const pastEvents = fakePastEvents.filter(event => event.artist === artist.name);

  const handleEventPress = (event: Event): void => {
    console.log(`Pressed ${event.artist} event on ${event.date}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#1d4ed8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <ArtistHeader artist={artist} isUserSignedIn={true} />

            <ContentContainer>
              <EventsSection events={events} onEventPress={handleEventPress} />
              <PastEventsSection pastEvents={pastEvents} onEventPress={handleEventPress} />
            </ContentContainer>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});