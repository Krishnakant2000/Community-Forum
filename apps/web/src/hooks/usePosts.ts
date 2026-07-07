import { useQuery } from '@tanstack/react-query';
import { fetcher, Post } from '../lib/api';
import { queryKeys } from '../lib/query-keys';

interface ApiResponse<T> {
  data: T;
}

export function useFeedQuery(courseId: string) {
  return useQuery({
    queryKey: queryKeys.posts.feed(courseId),
    queryFn: () => fetcher<ApiResponse<Post[]>>(`/posts/feed/${courseId}`),
    // Re-fetch when switching tabs or refocusing the window
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useSavedPostsQuery() {
  return useQuery({
    queryKey: queryKeys.posts.saved(),
    queryFn: () => fetcher<ApiResponse<Post[]>>('/posts/saved'),
    staleTime: 1000 * 60,
  });
}