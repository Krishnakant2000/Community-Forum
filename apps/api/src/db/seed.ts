import { db } from './index';
import { users, courses, enrollments, posts, savedPosts } from './schema';
import { sql } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Starting database seed...');

  // 1. Clear existing tables (Reverse order of dependencies)
  console.log('Clearing old data...');
  await db.execute(sql`TRUNCATE TABLE saved_posts, posts, enrollments, courses, users CASCADE;`);

  // 2. Insert Users (2 Students, 1 Moderator)
  console.log('Inserting users...');
  await db.insert(users).values([
    { id: 'student-1', name: 'Alice (Student 1)', role: 'student' },
    { id: 'student-2', name: 'Bob (Student 2)', role: 'student' },
    { id: 'mod-1', name: 'Charlie (Moderator)', role: 'moderator' },
  ]);

  // 3. Insert Courses
  console.log('Inserting courses...');
  await db.insert(courses).values([
    { id: 'course-react', title: 'Advanced React & Next.js' },
    { id: 'course-sysdesign', title: 'Scalable Systems Design' },
  ]);

  // 4. Insert Enrollments
  // Alice is in React only. Bob is in System Design only. Mod has access to everything.
  console.log('Inserting enrollments...');
  await db.insert(enrollments).values([
    { userId: 'student-1', courseId: 'course-react' },
    { userId: 'student-2', courseId: 'course-sysdesign' },
    { userId: 'mod-1', courseId: 'course-react' },
    { userId: 'mod-1', courseId: 'course-sysdesign' },
  ]);

  // 5. Insert Posts
  console.log('Inserting posts...');
  await db.insert(posts).values([
    {
      id: 'post-1',
      courseId: 'course-react',
      authorId: 'mod-1',
      content: 'Welcome to Advanced React! What feature of React 19 are you most excited about?',
    },
    {
      id: 'post-2',
      courseId: 'course-react',
      authorId: 'student-1',
      content: 'I am really struggling to understand how Server Actions interact with React Query cache invalidation.',
    },
    {
      id: 'post-3',
      courseId: 'course-react',
      authorId: 'student-1',
      content: 'Pro-tip: Always use Optimistic Updates for UI toggles like bookmarks or likes!',
    },
    {
      id: 'post-4',
      courseId: 'course-sysdesign',
      authorId: 'mod-1',
      content: 'Welcome to System Design. Remember: keep your business logic pure and decoupled from your database layers.',
    },
    {
      id: 'post-5',
      courseId: 'course-sysdesign',
      authorId: 'student-2',
      content: 'When handling bookmarks at scale, how do you prevent N+1 queries when fetching feeds?',
    },
  ]);

  // 6. Pre-save one post just to test
  console.log('Inserting initial bookmarks...');
  await db.insert(savedPosts).values([
    {
      id: 'save-1',
      userId: 'student-1',
      postId: 'post-1',
    }
  ]);

  console.log('✅ Seed completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});