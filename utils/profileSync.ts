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
      const updateData: any = {
        name: user.name,
        email: user.email,
        updated_at: new Date().toISOString(),
      };

      // Only update profile picture if one is provided
      if (user.profilePicture) {
        updateData.profile_picture = user.profilePicture;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
      } else {
      }
    } else {
      // Profile doesn't exist, try to create it (but it might be created by trigger already)
      const insertData: any = {
        id: user.id,
        name: user.name,
        email: user.email,
      };

      // Only set profile picture if one is provided, otherwise let DB trigger handle it
      if (user.profilePicture) {
        insertData.profile_picture = user.profilePicture;
      }

      const { error: insertError } = await supabase
        .from('profiles')
        .insert(insertData);

      if (insertError) {
        // Profile might have been created by trigger - just update instead
        const fallbackUpdateData: any = {
          name: user.name,
          email: user.email,
          updated_at: new Date().toISOString(),
        };

        // Only update profile picture if one is provided
        if (user.profilePicture) {
          fallbackUpdateData.profile_picture = user.profilePicture;
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update(fallbackUpdateData)
          .eq('id', user.id);

        if (updateError) {
          console.error('Error syncing profile:', updateError);
        } else {
        }
      } else {
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
    console.log('[Profile Sync] Updating profile for user:', userId);
    console.log('[Profile Sync] Update data:', {
      name: updates.name,
      email: updates.email,
      profile_picture: updates.profilePicture,
    });

    // Only include fields that are actually being updated
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    if (updates.email !== undefined) {
      updateData.email = updates.email;
    }
    if (updates.profilePicture !== undefined) {
      updateData.profile_picture = updates.profilePicture;
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select();

    if (error) {
      console.error('[Profile Sync] Error updating user profile:', error);
      console.error('[Profile Sync] Error details:', JSON.stringify(error, null, 2));
      return false;
    }

    console.log('[Profile Sync] Profile updated successfully:', data);
    return true;
  } catch (error) {
    console.error('[Profile Sync] Exception in updateUserProfile:', error);
    return false;
  }
}
