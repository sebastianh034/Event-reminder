import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { getFollowedArtistsEvents, type Event as SupabaseEvent } from '../../utils/eventsService';
import { Ionicons } from '@expo/vector-icons';

interface EventsCalendarProps {
  userId: string;
}

interface MarkedDates {
  [date: string]: {
    marked: boolean;
    dotColor: string;
    selected?: boolean;
    selectedColor?: string;
  };
}

const EventsCalendar: React.FC<EventsCalendarProps> = ({ userId }) => {
  const [events, setEvents] = useState<SupabaseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDateEvents, setSelectedDateEvents] = useState<SupabaseEvent[]>([]);

  useEffect(() => {
    loadEvents();
  }, [userId]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const fetchedEvents = await getFollowedArtistsEvents(userId);
      setEvents(fetchedEvents);
      markEventDates(fetchedEvents);
    } catch (error) {
      console.error('Error loading events for calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocalDateKey = (dateString: string): string => {
    // Just extract the date part (YYYY-MM-DD) directly from the string
    // This avoids timezone conversion issues
    const datePart = dateString.split('T')[0];
    return datePart;
  };

  const markEventDates = (eventsList: SupabaseEvent[]) => {
    const marked: MarkedDates = {};

    eventsList.forEach((event) => {
      if (event.event_date) {
        // Convert to local date to avoid timezone issues
        const dateKey = getLocalDateKey(event.event_date);
        marked[dateKey] = {
          marked: true,
          dotColor: '#3B82F6',
        };
      }
    });

    setMarkedDates(marked);
  };

  const handleDayPress = (day: DateData) => {
    const dateKey = day.dateString;

    // Update marked dates to show selection
    const updatedMarked = { ...markedDates };

    // Remove previous selection
    Object.keys(updatedMarked).forEach((key) => {
      if (updatedMarked[key].selected) {
        delete updatedMarked[key].selected;
        delete updatedMarked[key].selectedColor;
      }
    });

    // Add new selection
    if (updatedMarked[dateKey]) {
      updatedMarked[dateKey] = {
        ...updatedMarked[dateKey],
        selected: true,
        selectedColor: '#3B82F6',
      };
    } else {
      updatedMarked[dateKey] = {
        marked: false,
        dotColor: '#3B82F6',
        selected: true,
        selectedColor: '#3B82F6',
      };
    }

    setMarkedDates(updatedMarked);
    setSelectedDate(dateKey);

    // Filter events for selected date
    const eventsOnDate = events.filter((event) => {
      if (event.event_date) {
        const eventDateKey = getLocalDateKey(event.event_date);
        return eventDateKey === dateKey;
      }
      return false;
    });

    setSelectedDateEvents(eventsOnDate);
  };

  const formatDate = (dateString: string) => {
    // Parse YYYY-MM-DD format directly to avoid timezone issues
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parseInt(parts[1], 10) - 1; // months are 0-indexed
      const day = parseInt(parts[2], 10);
      const date = new Date(parseInt(year), month, day);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    // Fallback for other formats
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const timeString = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return timeString === 'Invalid Date' ? 'TBA' : timeString;
  };

  const renderEventItem = ({ item }: { item: SupabaseEvent }) => (
    <View style={styles.eventItem}>
      <View style={styles.eventHeader}>
        <Text style={styles.artistName}>{item.artist_name}</Text>
        <Text style={styles.eventStatus}>{item.status}</Text>
      </View>
      <View style={styles.eventDetails}>
        <Ionicons name="location-outline" size={14} color="#9CA3AF" />
        <Text style={styles.eventVenue} numberOfLines={1}>
          {item.venue}
        </Text>
      </View>
      {item.event_date && (
        <View style={styles.eventDetails}>
          <Ionicons name="time-outline" size={14} color="#9CA3AF" />
          <Text style={styles.eventTime}>{formatTime(item.event_date)}</Text>
        </View>
      )}
      {item.location && (
        <Text style={styles.eventLocation} numberOfLines={1}>
          {item.location}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading events...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        theme={{
          calendarBackground: 'rgba(255, 255, 255, 0.1)',
          textSectionTitleColor: '#E5E7EB',
          selectedDayBackgroundColor: '#3B82F6',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#3B82F6',
          dayTextColor: '#ffffff',
          textDisabledColor: '#6B7280',
          dotColor: '#3B82F6',
          selectedDotColor: '#ffffff',
          arrowColor: '#ffffff',
          monthTextColor: '#ffffff',
          indicatorColor: '#3B82F6',
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontWeight: '400',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 14,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 12,
        }}
        style={styles.calendar}
      />

      {selectedDate && (
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateTitle}>
            {selectedDateEvents.length > 0
              ? `Events on ${formatDate(selectedDate)}`
              : `No events on ${formatDate(selectedDate)}`}
          </Text>
          {selectedDateEvents.length > 0 ? (
            <FlatList
              data={selectedDateEvents}
              renderItem={renderEventItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.eventsList}
            />
          ) : (
            <View style={styles.noEventsContainer}>
              <Ionicons name="calendar-outline" size={48} color="#6B7280" />
              <Text style={styles.noEventsText}>No events scheduled</Text>
            </View>
          )}
        </View>
      )}

      {!selectedDate && events.length > 0 && (
        <View style={styles.instructionsContainer}>
          <Ionicons name="information-circle-outline" size={24} color="#9CA3AF" />
          <Text style={styles.instructionsText}>
            Tap on a date to view events
          </Text>
        </View>
      )}

      {!selectedDate && events.length === 0 && (
        <View style={styles.noEventsContainer}>
          <Ionicons name="calendar-outline" size={64} color="#6B7280" />
          <Text style={styles.noEventsText}>No upcoming events</Text>
          <Text style={styles.noEventsSubtext}>
            Follow some artists to see their events here
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#E5E7EB',
    fontSize: 16,
    marginTop: 12,
  },
  calendar: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  selectedDateContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  selectedDateTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  eventsList: {
    gap: 12,
  },
  eventItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  artistName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  eventStatus: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  eventDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  eventVenue: {
    color: '#E5E7EB',
    fontSize: 14,
    flex: 1,
  },
  eventTime: {
    color: '#E5E7EB',
    fontSize: 14,
  },
  eventLocation: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  noEventsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noEventsText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  noEventsSubtext: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginTop: 10,
  },
  instructionsText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});

export default EventsCalendar;
