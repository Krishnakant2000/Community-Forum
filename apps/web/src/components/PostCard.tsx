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
    <article className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between gap-4">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="font-semibold text-slate-800 tracking-tight">
              {t.author(post.authorId)}
            </span>
          </div>
          <time dateTime={post.createdAt} className="text-slate-400 font-medium">
            {new Date(post.createdAt).toLocaleDateString(locale, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
        </div>
        
        <p className="text-slate-700 text-sm md:text-base leading-relaxed font-normal">
          {post.content}
        </p>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-1">
        <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-md">
          <span className="text-xs font-semibold text-slate-600">
            {t.savesCount(post.savesCount)}
          </span>
        </div>

        <button
          type="button"
          disabled={isDisabled}
          onClick={() => onToggleBookmark(post.id, post.hasSaved)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold text-xs md:text-sm transition-all duration-150 active:scale-95 ${
            post.hasSaved
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 hover:border-slate-400 shadow-2xs'
          } ${isDisabled ? 'opacity-50 cursor-not-allowed active:scale-100' : 'cursor-pointer'}`}
        >
          <svg
            className={`w-4 h-4 transition-transform ${post.hasSaved ? 'fill-current scale-110' : 'fill-none stroke-current stroke-2'}`}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {post.hasSaved ? t.saved : t.save}
        </button>
      </div>
    </article>
  );
};