'use client';

import { useState } from 'react';
import { useFeedQuery, useSavedPostsQuery } from '../hooks/usePosts';
import { useBookmarkMutation } from '../hooks/useBookmarkMutation';
import { PostCard } from '../components/PostCard';
import { getI18n, Locale } from '../lib/i18n';

export default function Home() {
  // UI States
  const [activeTab, setActiveTab] = useState<'feed' | 'saved'>('feed');
  const [courseId, setCourseId] = useState<string>('course-react');
  const [locale, setLocale] = useState<Locale>('en');

  const t = getI18n(locale);

  // Data Fetching Hooks
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
    <main className="max-w-3xl mx-auto py-10 px-4">
      {/* Header & Language Switcher */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.appTitle}</h1>
          <p className="text-sm text-gray-500">Logged in as: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">student-1</span></p>
        </div>

        {/* Locale Selector */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setLocale('en')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${locale === 'en' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            🇺🇸 English
          </button>
          <button
            onClick={() => setLocale('es')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${locale === 'es' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
          >
            🇪🇸 Español
          </button>
        </div>
      </header>

      {/* Navigation Tabs & Course Filter */}
      <nav className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-6 gap-4">
        {/* View Tabs */}
        <div className="flex gap-2 border-b sm:border-b-0 border-gray-200 pb-2 sm:pb-0 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
              activeTab === 'feed'
                ? 'bg-blue-50 text-blue-600 border border-blue-200 font-semibold'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.feedTab}
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
              activeTab === 'saved'
                ? 'bg-blue-50 text-blue-600 border border-blue-200 font-semibold'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t.savedTab}
          </button>
        </div>

        {/* Course Dropdown (Only visible on Feed tab) */}
        {activeTab === 'feed' && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <label htmlFor="course-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {t.courseSelect}
            </label>
            <select
              id="course-select"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none shadow-sm"
            >
              <option value="course-react">{t.courseReact}</option>
              <option value="course-sysdesign">{t.courseSysDesign}</option>
            </select>
          </div>
        )}
      </nav>

      {/* Content Area (Loading, Error, Empty, and List States) */}
      <section className="space-y-4 mt-2">
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-500 font-medium">{t.loading}</span>
          </div>
        )}

        {isError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center font-medium">
            {t.error}
          </div>
        )}

        {!isLoading && !isError && currentData?.length === 0 && (
          <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-xl p-8">
            <p className="text-gray-500 text-base">
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