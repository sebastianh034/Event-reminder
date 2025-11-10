import { supabase } from './supabase';
import type { IssueData } from '../components/Settings/ReportIssueModal';
import { createGitHubIssue, formatIssueForGitHub } from './githubService';

// Rate limiting: 1 hour between reports
const RATE_LIMIT_HOURS = 1;

/**
 * Check if user can submit an issue (rate limiting)
 */
async function canSubmitIssue(userId: string): Promise<{ allowed: boolean; minutesRemaining?: number }> {
  try {
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_HOURS * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('issue_reports')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error checking rate limit:', error);
      // Allow submission if there's an error checking
      return { allowed: true };
    }

    if (data && data.length > 0) {
      // Calculate minutes remaining
      const lastReport = new Date(data[0].created_at);
      const nextAllowed = new Date(lastReport.getTime() + RATE_LIMIT_HOURS * 60 * 60 * 1000);
      const minutesRemaining = Math.ceil((nextAllowed.getTime() - Date.now()) / (60 * 1000));

      return { allowed: false, minutesRemaining };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error in rate limit check:', error);
    return { allowed: true };
  }
}

/**
 * Upload a screenshot to Supabase Storage
 */
async function uploadScreenshot(
  imageUri: string,
  issueId: string,
  index: number
): Promise<string | null> {
  try {
    // Fetch the image
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

    // Create file path: issue-screenshots/{issueId}/screenshot-{index}.{ext}
    const filePath = `${issueId}/screenshot-${index}.${fileExt}`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('issue-screenshots')
      .upload(filePath, arrayBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('issue-screenshots')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading screenshot:', error);
    return null;
  }
}

/**
 * Create an issue report in Supabase
 */
export async function createIssueReport(data: IssueData, userId?: string): Promise<boolean> {
  try {
    // Rate limiting check
    if (userId) {
      const rateCheck = await canSubmitIssue(userId);
      if (!rateCheck.allowed) {
        throw new Error(`Please wait ${rateCheck.minutesRemaining} minutes before submitting another issue.`);
      }
    }

    // Generate a unique ID for this issue
    const issueId = `issue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Upload screenshots first if any
    const screenshotUrls: string[] = [];
    if (data.screenshots.length > 0) {
      for (let i = 0; i < data.screenshots.length; i++) {
        const url = await uploadScreenshot(data.screenshots[i], issueId, i);
        if (url) {
          screenshotUrls.push(url);
        }
      }
    }

    // Create GitHub issue first
    const githubIssue = formatIssueForGitHub(
      data.title,
      data.name,
      data.description,
      screenshotUrls
    );

    const githubResult = await createGitHubIssue(githubIssue);

    // Insert issue report into database with GitHub info
    const { error } = await supabase
      .from('issue_reports')
      .insert({
        id: issueId,
        title: data.title,
        reporter_name: data.name,
        description: data.description,
        screenshots: screenshotUrls,
        status: 'open',
        created_at: new Date().toISOString(),
        github_issue_number: githubResult.issueNumber || null,
        github_issue_url: githubResult.issueUrl || null,
        user_id: userId || null,
      });

    if (error) {
      console.error('Failed to create issue report:', error);
      return false;
    }

    if (githubResult.success) {
      console.log('Issue report created successfully:', issueId);
      console.log('GitHub issue created:', githubResult.issueUrl);
    } else {
      console.log('Issue report saved to Supabase, but GitHub creation failed:', githubResult.error);
    }

    return true;
  } catch (error) {
    console.error('Error creating issue report:', error);
    return false;
  }
}

/**
 * Get all issue reports (admin function)
 */
export async function getAllIssueReports() {
  try {
    const { data, error } = await supabase
      .from('issue_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch issue reports:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching issue reports:', error);
    return [];
  }
}

/**
 * Update issue status (admin function)
 */
export async function updateIssueStatus(
  issueId: string,
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('issue_reports')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', issueId);

    if (error) {
      console.error('Failed to update issue status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating issue status:', error);
    return false;
  }
}
