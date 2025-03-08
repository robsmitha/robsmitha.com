
import { get } from './CacheManager';

// Define interfaces for the API responses
export interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  created_at: string;
  // Add other user properties as needed
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string;
  // Add other repo properties as needed
}

export interface GithubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
  // Add other commit properties as needed
}

export interface GithubLanguages {
  [language: string]: number;
}

const endpoint = 'https://api.github.com';
const login = 'robsmitha';

async function getUser(): Promise<GithubUser | null> {
  return get<GithubUser>(`${endpoint}/users/${login}`);
}

async function getUserRepos(): Promise<GithubRepo[] | null> {
  return get<GithubRepo[]>(`${endpoint}/users/${login}/repos?sort=pushed&direction=desc`); // TODO: pass sort, direction as params
}

async function getStarred(): Promise<GithubRepo[] | null> {
  return get<GithubRepo[]>(`${endpoint}/users/${login}/starred`);
}

async function getRepo(repo: string): Promise<GithubRepo | null> {
  return get<GithubRepo>(`${endpoint}/repos/${login}/${repo}`);
}

async function getCommits(repo: string): Promise<GithubCommit[] | null> {
  return get<GithubCommit[]>(`${endpoint}/repos/${login}/${repo}/commits`);
}

async function getCommit(repo: string, sha: string): Promise<GithubCommit | null> {
  return get<GithubCommit>(`${endpoint}/repos/${login}/${repo}/commits/${sha}`);
}

async function getLanguages(repo: string): Promise<GithubLanguages | null> {
  return get<GithubLanguages>(`${endpoint}/repos/${login}/${repo}/languages`);
}

export default {
  getUser,
  getUserRepos,
  getStarred,
  getRepo,
  getCommits,
  getLanguages,
  getCommit
};