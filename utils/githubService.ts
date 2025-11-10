/**
 * GitHub API Service for creating issues
 * Fetches GitHub credentials from Supabase app_config table
 */

import { supabase } from './supabase';

interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
}

let cachedConfig: GitHubConfig | null = null;

/**
 * Fetch GitHub configuration from Supabase
 */
async function getGitHubConfig(): Promise<GitHubConfig | null> {
  // Return cached config if available
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('key, value')
      .in('key', ['github_owner', 'github_repo', 'github_token']);

    if (error) {
      console.error('Failed to fetch GitHub config:', error);
      return null;
    }

    if (!data || data.length !== 3) {
      console.error('GitHub configuration is incomplete in Supabase');
      return null;
    }

    const config: any = {};
    data.forEach((item) => {
      if (item.key === 'github_owner') config.owner = item.value;
      if (item.key === 'github_repo') config.repo = item.value;
      if (item.key === 'github_token') config.token = item.value;
    });

    // Cache the config
    cachedConfig = config as GitHubConfig;
    return cachedConfig;
  } catch (error) {
    console.error('Error fetching GitHub config:', error);
    return null;
  }
}

export interface GitHubIssue {
  title: string;
  body: string;
  labels?: string[];
}

/**
 * Create a GitHub issue
 */
export async function createGitHubIssue(issue: GitHubIssue): Promise<{
  success: boolean;
  issueNumber?: number;
  issueUrl?: string;
  error?: string;
}> {
  try {
    const config = await getGitHubConfig();

    if (!config) {
      console.error('GitHub configuration is missing. Please check Supabase app_config table.');
      return {
        success: false,
        error: 'GitHub configuration is missing',
      };
    }

    const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/issues`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: issue.title,
        body: issue.body,
        labels: issue.labels || ['user-report'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create GitHub issue:', response.status, errorText);
      return {
        success: false,
        error: `GitHub API error: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log('GitHub issue created:', data.html_url);

    return {
      success: true,
      issueNumber: data.number,
      issueUrl: data.html_url,
    };
  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test the GitHub API connection
 */
export async function testGitHubConnection(): Promise<boolean> {
  try {
    const config = await getGitHubConfig();

    if (!config) {
      console.log('GitHub configuration is missing');
      return false;
    }

    const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (response.ok) {
      console.log('GitHub connection successful');
      return true;
    } else {
      console.log('GitHub connection failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error testing GitHub connection:', error);
    return false;
  }
}

/**
 * Format issue data for GitHub
 */
export function formatIssueForGitHub(
  title: string,
  reporterName: string,
  description: string,
  screenshotUrls: string[]
): GitHubIssue {
  let body = `**Reported by:** ${reporterName}\n\n`;
  body += `## Description\n\n${description}\n\n`;

  if (screenshotUrls.length > 0) {
    body += `## Screenshots\n\n`;
    screenshotUrls.forEach((url, index) => {
      body += `### Screenshot ${index + 1}\n`;
      body += `![Screenshot ${index + 1}](${url})\n\n`;
    });
  }

  body += `---\n`;
  body += `*This issue was automatically created from the app's issue reporting feature.*`;

  return {
    title,
    body,
    labels: ['user-report', 'from-app'],
  };
}
