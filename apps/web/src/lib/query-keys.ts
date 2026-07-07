export const queryKeys = {
  posts: {
    all: ['posts'] as const,
    feed: (courseId: string) => [...queryKeys.posts.all, 'feed', courseId] as const,
    saved: () => [...queryKeys.posts.all, 'saved'] as const,
  },
};