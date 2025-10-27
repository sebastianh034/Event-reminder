import { supabase } from './supabase';
import { User } from '../context/authcontext';

/**
 * Sync user profile with Supabase database
 * Call this after successful authentication to ensure profile exists
 */
export async function syncUserProfile(user: User): Promise<void> {
  try {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is fine
      console.error('Error fetching profile:', fetchError);
      return;
    }

    if (existingProfile) {
      // Profile exists, update it
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: user.name,
          email: user.email,
          profile_picture: user.profilePicture,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
      } else {
        console.log('Profile updated successfully');
      }
    } else {
      // Profile doesn't exist, try to create it (but it might be created by trigger already)
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          name: user.name,
          email: user.email,
          profile_picture: user.profilePicture,
        });

      if (insertError) {
        // Profile might have been created by trigger - just update instead
        console.log('Profile may exist already, trying update instead');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            name: user.name,
            email: user.email,
            profile_picture: user.profilePicture,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error syncing profile:', updateError);
        } else {
          console.log('Profile synced via update');
        }
      } else {
        console.log('Profile created successfully');
      }
    }
  } catch (error) {
    console.error('Error in syncUserProfile:', error);
  }
}

/**
 * Get user profile from Supabase
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      profilePicture: data.profile_picture,
    };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

/**
 * Update user profile in Supabase
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<User>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: updates.name,
        email: updates.email,
        profile_picture: updates.profilePicture,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user profile:', error);
      return false;
    }

    console.log('User profile updated successfully');
    return true;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return false;
  }
}
