'use client';

import { useState } from 'react';
import { useFeedQuery, useSavedPostsQuery } from '../hooks/usePosts';
import { useBookmarkMutation } from '../hooks/useBookmarkMutation';
import { PostCard } from '../components/PostCard';
import { getI18n, Locale } from '../lib/i18n';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'feed' | 'saved'>('feed');
  const [courseId, setCourseId] = useState<string>('course-react');
  const [locale, setLocale] = useState<Locale>('en');

  const t = getI18n(locale);

  const feedQuery = useFeedQuery(courseId);
  const savedQuery = useSavedPostsQuery();
  const bookmarkMutation = useBookmarkMutation();

  const handleToggleBookmark = (postId: string, currentHasSaved: boolean) => {
    bookmarkMutation.mutate({
      postId,
      courseId,
      currentHasSaved,
    });
  };

  const currentData = activeTab === 'feed' ? feedQuery.data?.data : savedQuery.data?.data;
  const isLoading = activeTab === 'feed' ? feedQuery.isLoading : savedQuery.isLoading;
  const isError = activeTab === 'feed' ? feedQuery.isError : savedQuery.isError;

  return (
    <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header & Language Switcher */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t.appTitle}</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Logged in as: <span className="font-mono bg-blue-50 text-blue-700 border border-blue-200/60 px-1.5 py-0.5 rounded font-semibold">student-1</span>
          </p>
        </div>

        {/* Locale Selector */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg border border-slate-300/50">
          <button
            onClick={() => setLocale('en')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              locale === 'en' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🇺🇸 English
          </button>
          <button
            onClick={() => setLocale('es')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              locale === 'es' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🇪🇸 Español
          </button>
        </div>
      </header>

      {/* Navigation Tabs & Course Filter */}
      <nav className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4">
        {/* View Tabs */}
        <div className="flex gap-1.5 bg-slate-200/60 p-1 rounded-xl w-full sm:w-auto border border-slate-300/40">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex-1 sm:flex-none px-4 py-2 font-semibold text-xs sm:text-sm rounded-lg transition-all ${
              activeTab === 'feed'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {t.feedTab}
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 sm:flex-none px-4 py-2 font-semibold text-xs sm:text-sm rounded-lg transition-all ${
              activeTab === 'saved'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {t.savedTab}
          </button>
        </div>

        {/* Course Dropdown */}
        {activeTab === 'feed' && (
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <label htmlFor="course-select" className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              {t.courseSelect}
            </label>
            <select
              id="course-select"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="bg-white border border-slate-300 text-slate-800 font-medium text-xs sm:text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="course-react">{t.courseReact}</option>
              <option value="course-sysdesign">{t.courseSysDesign}</option>
            </select>
          </div>
        )}
      </nav>

      {/* Content Area */}
      <section className="space-y-4 mt-2">
        {isLoading && (
          <div className="flex flex-col justify-center items-center py-24 gap-3 bg-white/50 border border-slate-200/60 rounded-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-slate-200 border-t-blue-600"></div>
            <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">{t.loading}</span>
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-center text-sm font-semibold shadow-xs">
            {t.error}
          </div>
        )}

        {!isLoading && !isError && currentData?.length === 0 && (
          <div className="text-center py-20 bg-white border border-dashed border-slate-300 rounded-2xl p-8">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <svg className="w-6 h-6 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium text-sm">
              {activeTab === 'feed' ? t.emptyFeed : t.emptySavedList}
            </p>
          </div>
        )}

        {!isLoading && !isError && currentData && currentData.length > 0 && (
          <div className="grid gap-4">
            {currentData.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onToggleBookmark={handleToggleBookmark}
                isDisabled={bookmarkMutation.isPending}
                locale={locale}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}