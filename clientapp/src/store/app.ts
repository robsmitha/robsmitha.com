// Utilities
import { defineStore } from 'pinia'
import { WpPage, WpPost, WpTag, WpCategory } from './types'

type State = {
  pages: WpPage[],
  posts: WpPost[],
  tags: WpTag[],
  categories: WpCategory[]
}

export const useAppStore = defineStore('app', {
  state: (): State => ({
    pages: [],
    posts: [],
    tags: [],
    categories: []
  }),
  getters: {
    // pages
    homePage: (state: State) => state.pages.find((page) => page.slug === 'home-page'),
    aboutPage: (state: State) => state.pages.find((page) => page.slug === 'about-page'),

    // posts
    summaryPost: (state: State) => state.posts.find((post) => post.slug === 'summary'),
    experiencePost: (state: State) => state.posts.find((post) => post.slug === 'professional-experience-achievements'),
    educationPost: (state: State) => state.posts.find((post) => post.slug === 'education-certification'),

    // tags
    summaryPostTags: (state: State) => {
      const summary = state.posts.find((post) => post.slug === 'summary');
      return state.tags.filter(t => summary?.tags.includes(t.id));
    },
    educationPostTags: (state: State) => {
      const summary = state.posts.find((post) => post.slug === 'education-certification');
      return state.tags.filter(t => summary?.tags.includes(t.id));
    },
    tagsByPost: (state: State) : Map<string, WpTag[]> => {
      const languages = state.posts.find((post) => post.slug === 'languages');
      const frontend = state.posts.find((post) => post.slug === 'frontend');
      const backend = state.posts.find((post) => post.slug === 'backend');
      const tools = state.posts.find((post) => post.slug === 'tools');

      const map = new Map<string, WpTag[]>();
      [languages, frontend, backend, tools].forEach((post) => {
        post && map.set(post.slug, state.tags.filter(t => post.tags.includes(t.id)))
      });
      return map;
    },
    groupedCategories: (state: State) : Map<number, WpCategory[]> => {
      const categoryMap = new Map<number, WpCategory[]>();
      state.categories.forEach(category => {
        const parentId = category.parent;
        if (parentId === 0 && !categoryMap.has(category.id)) {
          categoryMap.set(category.id, []);
        } else if (categoryMap.has(parentId)) {
          categoryMap.get(parentId)?.push(category);
        } else {
            categoryMap.set(parentId, [category]);
        }
      })
      
      return categoryMap;
    },
    parentCategories: (state: State) : Set<WpCategory> => {
      return new Set(state.categories.filter(c => c.parent === 0))
    }
  },
  actions: {
    async fetchContent(): Promise<void> {
      const response = await fetch('/api/WordPressContent');
      if (!response.ok){
        console.error("Failed to get page content.")
        return
      }
      const data = await response.json()
      this.pages = data.Pages
      this.posts = data.Posts
      this.tags = data.Tags
      this.categories = data.Categories
    }
  }
})