import { supabase } from './supabase';

/**
 * Upload a profile picture to Supabase Storage
 * @param userId - The user's ID
 * @param imageUri - Local file URI from ImagePicker
 * @returns Public URL of the uploaded image, or null if failed
 */
export async function uploadProfilePicture(
  userId: string,
  imageUri: string
): Promise<string | null> {
  try {
    // Fetch the image as a blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Convert blob to array buffer
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });

    // Determine file extension
    const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = blob.type || `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;

    // Create file path: avatars/{userId}/avatar.{ext}
    const filePath = `${userId}/avatar.${fileExt}`;

    // Delete old avatar if exists (ignore errors)
    await supabase.storage.from('avatars').remove([filePath]);

    // Upload new avatar
    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, arrayBuffer, {
        contentType,
        upsert: true, // Replace if exists
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

/**
 * Delete a user's profile picture from Supabase Storage
 * @param userId - The user's ID
 */
export async function deleteProfilePicture(userId: string): Promise<boolean> {
  try {
    // List all files in user's folder
    const { data: files, error: listError } = await supabase.storage
      .from('avatars')
      .list(userId);

    if (listError) {
      console.error('Error listing files:', listError);
      return false;
    }

    if (!files || files.length === 0) {
      return true; // No files to delete
    }

    // Delete all files
    const filePaths = files.map((file) => `${userId}/${file.name}`);
    const { error: deleteError } = await supabase.storage
      .from('avatars')
      .remove(filePaths);

    if (deleteError) {
      console.error('Error deleting files:', deleteError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteProfilePicture:', error);
    return false;
  }
}

/**
 * Get the public URL for a user's profile picture
 * @param userId - The user's ID
 * @returns Public URL or null if no picture exists
 */
export async function getProfilePictureUrl(userId: string): Promise<string | null> {
  try {
    // List files in user's folder
    const { data: files, error } = await supabase.storage
      .from('avatars')
      .list(userId);

    if (error || !files || files.length === 0) {
      return null;
    }

    // Get the first file (should only be one)
    const fileName = files[0].name;
    const filePath = `${userId}/${fileName}`;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error getting profile picture URL:', error);
    return null;
  }
}
