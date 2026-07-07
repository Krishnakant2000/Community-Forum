import React from 'react';
import { getI18n, Locale } from '../lib/i18n';
import { Post } from '../lib/api';

interface PostCardProps {
  post: Post;
  onToggleBookmark: (postId: string, hasSaved: boolean) => void;
  isDisabled?: boolean;
  locale?: Locale;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onToggleBookmark,
  isDisabled = false,
  locale = 'en',
}) => {
  const t = getI18n(locale);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span className="font-semibold text-gray-700">{t.author(post.authorId)}</span>
          <span>{new Date(post.createdAt).toLocaleDateString(locale)}</span>
        </div>
        <p className="text-gray-800 text-base leading-relaxed">{post.content}</p>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
        <span className="text-sm font-medium text-gray-500">
          {t.savesCount(post.savesCount)}
        </span>

        <button
          disabled={isDisabled}
          onClick={() => onToggleBookmark(post.id, post.hasSaved)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium text-sm transition-all ${
            post.hasSaved
              ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <svg
            className={`w-4 h-4 ${post.hasSaved ? 'fill-current' : 'fill-none stroke-current stroke-2'}`}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {post.hasSaved ? t.saved : t.save}
        </button>
      </div>
    </div>
  );
};