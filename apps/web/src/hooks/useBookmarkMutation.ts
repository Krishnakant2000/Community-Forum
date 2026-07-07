import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher, Post } from '../lib/api';
import { queryKeys } from '../lib/query-keys';

interface BookmarkVariables {
  postId: string;
  courseId: string;
  currentHasSaved: boolean;
}

export function useBookmarkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, currentHasSaved }: BookmarkVariables) => {
      const action = currentHasSaved ? 'UNSAVE' : 'SAVE';
      return fetcher<{ success: boolean; status: string }>(`/posts/${postId}/bookmark`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
    },

    // OPTIMISTIC UPDATE: Executes instantly before the network call finishes
    onMutate: async ({ postId, courseId, currentHasSaved }) => {
      // 1. Cancel any outgoing refetches for this course feed
      await queryClient.cancelQueries({ queryKey: queryKeys.posts.feed(courseId) });

      // 2. Snapshot the previous value for rollback purposes
      const previousFeed = queryClient.getQueryData<{ data: Post[] }>(queryKeys.posts.feed(courseId));

      // 3. Optimistically update the feed cache
      queryClient.setQueryData<{ data: Post[] }>(queryKeys.posts.feed(courseId), (old) => {
        if (!old?.data) return old;
        
        return {
          ...old,
          data: old.data.map((post) => {
            if (post.id !== postId) return post;
            return {
              ...post,
              hasSaved: !currentHasSaved,
              savesCount: currentHasSaved ? post.savesCount - 1 : post.savesCount + 1,
            };
          }),
        };
      });

      return { previousFeed };
    },

    // If the API errors out, roll back the UI to the exact previous state
    onError: (_err, variables, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(queryKeys.posts.feed(variables.courseId), context.previousFeed);
      }
    },

    // Always refetch after error or success to ensure 100% server consistency
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.saved() });
    },
  });
}