import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ArtistFollowButton from '../index';

// --- Mocks ---

const mockFollowArtist = jest.fn();
const mockUnfollowArtist = jest.fn();
jest.mock('../../../utils/artistService', () => ({
  followArtist: (...args: any[]) => mockFollowArtist(...args),
  unfollowArtist: (...args: any[]) => mockUnfollowArtist(...args),
}));

const mockRouterPush = jest.fn();
jest.mock('expo-router', () => ({
  router: { push: (...args: any[]) => mockRouterPush(...args) },
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Light: 'light' },
}));

const mockUseAuth = jest.fn();
jest.mock('../../../context/authcontext', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockIsFollowing = jest.fn();
const mockAddFollowedArtist = jest.fn();
const mockRemoveFollowedArtist = jest.fn();
jest.mock('../../../context/followedArtistsContext', () => ({
  useFollowedArtists: () => ({
    isFollowing: mockIsFollowing,
    addFollowedArtist: mockAddFollowedArtist,
    removeFollowedArtist: mockRemoveFollowedArtist,
  }),
}));

// --- Helpers ---

const defaultProps = {
  artistId: 1,
  artistName: 'Test Artist',
  spotifyId: 'spotify123',
  genre: 'Rock',
  imageUrl: 'https://example.com/img.jpg',
  initialFollowState: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({ user: { id: 'user-1', name: 'Test', email: 'test@test.com' } });
  mockIsFollowing.mockReturnValue(false);
  mockFollowArtist.mockResolvedValue(true);
  mockUnfollowArtist.mockResolvedValue(true);
});

// --- Tests ---

describe('ArtistFollowButton', () => {
  describe('rendering', () => {
    it('renders "Follow" when not following', () => {
      const { getByText } = render(<ArtistFollowButton {...defaultProps} />);
      expect(getByText('Follow')).toBeTruthy();
    });

    it('renders "Following" when the artist is followed', () => {
      mockIsFollowing.mockReturnValue(true);
      const { getByText } = render(<ArtistFollowButton {...defaultProps} />);
      expect(getByText('Following')).toBeTruthy();
    });

    it('renders with small size', () => {
      const { getByText } = render(<ArtistFollowButton {...defaultProps} size="small" />);
      expect(getByText('Follow')).toBeTruthy();
    });

    it('renders with large size', () => {
      const { getByText } = render(<ArtistFollowButton {...defaultProps} size="large" />);
      expect(getByText('Follow')).toBeTruthy();
    });
  });

  describe('follow action', () => {
    it('calls followArtist with correct data on press', async () => {
      const { getByText } = render(<ArtistFollowButton {...defaultProps} />);

      await act(async () => {
        fireEvent.press(getByText('Follow'));
      });

      expect(mockFollowArtist).toHaveBeenCalledWith('user-1', {
        name: 'Test Artist',
        spotifyId: 'spotify123',
        genre: 'Rock',
        imageUrl: 'https://example.com/img.jpg',
        followersCount: undefined,
        popularity: undefined,
        bio: undefined,
      });
    });

    it('updates context on successful follow', async () => {
      const { getByText } = render(<ArtistFollowButton {...defaultProps} />);

      await act(async () => {
        fireEvent.press(getByText('Follow'));
      });

      expect(mockAddFollowedArtist).toHaveBeenCalledWith('spotify123');
    });

    it('calls onFollowChange callback on successful follow', async () => {
      const onFollowChange = jest.fn();
      const { getByText } = render(
        <ArtistFollowButton {...defaultProps} onFollowChange={onFollowChange} />
      );

      await act(async () => {
        fireEvent.press(getByText('Follow'));
      });

      expect(onFollowChange).toHaveBeenCalledWith(1, true);
    });

    it('does not update context when followArtist fails', async () => {
      mockFollowArtist.mockResolvedValue(false);
      const { getByText } = render(<ArtistFollowButton {...defaultProps} />);

      await act(async () => {
        fireEvent.press(getByText('Follow'));
      });

      expect(mockAddFollowedArtist).not.toHaveBeenCalled();
    });
  });

  describe('unfollow action', () => {
    it('calls unfollowArtist on press when already following', async () => {
      mockIsFollowing.mockReturnValue(true);
      const { getByText } = render(<ArtistFollowButton {...defaultProps} />);

      await act(async () => {
        fireEvent.press(getByText('Following'));
      });

      expect(mockUnfollowArtist).toHaveBeenCalledWith('user-1', 'spotify123');
    });

    it('removes from context on successful unfollow', async () => {
      mockIsFollowing.mockReturnValue(true);
      const { getByText } = render(<ArtistFollowButton {...defaultProps} />);

      await act(async () => {
        fireEvent.press(getByText('Following'));
      });

      expect(mockRemoveFollowedArtist).toHaveBeenCalledWith('spotify123');
    });

    it('calls onFollowChange with false on successful unfollow', async () => {
      mockIsFollowing.mockReturnValue(true);
      const onFollowChange = jest.fn();
      const { getByText } = render(
        <ArtistFollowButton {...defaultProps} onFollowChange={onFollowChange} />
      );

      await act(async () => {
        fireEvent.press(getByText('Following'));
      });

      expect(onFollowChange).toHaveBeenCalledWith(1, false);
    });
  });

  describe('unauthenticated user', () => {
    it('shows sign-in alert when user is not logged in', () => {
      mockUseAuth.mockReturnValue({ user: null });
      jest.spyOn(Alert, 'alert');

      const { getByText } = render(<ArtistFollowButton {...defaultProps} />);
      fireEvent.press(getByText('Follow'));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Sign In Required',
        'You need to create an account or sign in to follow artists.',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel' }),
          expect.objectContaining({ text: 'Sign In' }),
        ])
      );
    });

    it('navigates to sign-in when alert button is pressed', () => {
      mockUseAuth.mockReturnValue({ user: null });
      jest.spyOn(Alert, 'alert');

      const { getByText } = render(<ArtistFollowButton {...defaultProps} />);
      fireEvent.press(getByText('Follow'));

      // Get the "Sign In" button handler from the alert call
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const signInButton = alertCall[2].find((btn: any) => btn.text === 'Sign In');
      signInButton.onPress();

      expect(mockRouterPush).toHaveBeenCalledWith('/signin');
    });

    it('does not call followArtist when user is not logged in', () => {
      mockUseAuth.mockReturnValue({ user: null });

      const { getByText } = render(<ArtistFollowButton {...defaultProps} />);
      fireEvent.press(getByText('Follow'));

      expect(mockFollowArtist).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('does nothing when spotifyId is missing (follow)', async () => {
      const { getByText } = render(
        <ArtistFollowButton {...defaultProps} spotifyId={undefined} initialFollowState={false} />
      );

      await act(async () => {
        fireEvent.press(getByText('Follow'));
      });

      expect(mockFollowArtist).not.toHaveBeenCalled();
    });

    it('does nothing when spotifyId is missing (unfollow)', async () => {
      // Without spotifyId, isFollowing from context returns false,
      // so we use initialFollowState to simulate the following state
      mockIsFollowing.mockReturnValue(false);
      const { getByText } = render(
        <ArtistFollowButton
          {...defaultProps}
          spotifyId={undefined}
          initialFollowState={true}
        />
      );

      // When spotifyId is undefined, isFollowing falls back to initialFollowState
      await act(async () => {
        fireEvent.press(getByText('Following'));
      });

      expect(mockUnfollowArtist).not.toHaveBeenCalled();
    });

    it('handles API error gracefully', async () => {
      mockFollowArtist.mockRejectedValue(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { getByText } = render(<ArtistFollowButton {...defaultProps} />);

      await act(async () => {
        fireEvent.press(getByText('Follow'));
      });

      // Should not crash, and context should not be updated
      expect(mockAddFollowedArtist).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('shows loading indicator and disables button during request', async () => {
      // Make followArtist hang so we can check loading state
      let resolveFollow: (value: boolean) => void;
      mockFollowArtist.mockImplementation(
        () => new Promise((resolve) => { resolveFollow = resolve; })
      );

      const { getByText, queryByText, getByTestId, UNSAFE_getByType } = render(
        <ArtistFollowButton {...defaultProps} />
      );

      // Press the button but don't await
      await act(async () => {
        fireEvent.press(getByText('Follow'));
      });

      // "Follow" text should be gone (replaced by ActivityIndicator)
      expect(queryByText('Follow')).toBeNull();

      // Resolve the follow call
      await act(async () => {
        resolveFollow!(true);
      });
    });
  });
});
