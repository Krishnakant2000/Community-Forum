import { pgTable, text, timestamp, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role', { enum: ['student', 'moderator'] }).notNull().default('student'),
});

export const courses = pgTable('courses', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
});

// Many-to-Many: Students can enroll in multiple courses
export const enrollments = pgTable('enrollments', {
  userId: text('user_id').references(() => users.id).notNull(),
  courseId: text('course_id').references(() => courses.id).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.courseId] }),
}));

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  courseId: text('course_id').references(() => courses.id).notNull(),
  authorId: text('author_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// THE BOOKMARK TABLE
export const savedPosts = pgTable('saved_posts', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull(),
  postId: text('post_id').references(() => posts.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'), // null = Active Save; Timestamp = Soft Deleted
}, (t) => ({
  // Prevents duplicate records for the same user + post combination
  userPostUnique: uniqueIndex('user_post_unique_idx').on(t.userId, t.postId),
}));