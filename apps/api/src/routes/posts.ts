import { Elysia, t } from 'elysia';
import { db } from '../db';
import { posts, savedPosts, enrollments } from '../db/schema';
import { eq, and, sql, desc, isNull } from 'drizzle-orm';
import { calculateBookmarkTransition } from '../domain/bookmark.logic';

// Stubbed Auth Middleware as requested by the spec
const authMiddleware = (app: Elysia) => app.derive(({ headers, set }) => {
  const userId = headers['x-user-id'];
  const role = headers['x-user-role'] || 'student';
  
  if (!userId) {
    set.status = 401;
    throw new Error('Unauthenticated: Missing x-user-id header');
  }
  return { user: { id: userId, role } };
});

export const postRoutes = new Elysia({ prefix: '/api/posts' })
  .use(authMiddleware)
  
  // 1. GET FEED (With Hydrated Flags & Course Auth)
  .get('/feed/:courseId', async ({ params: { courseId }, user, set }) => {
    // Authorization Check (403): Student must be enrolled in the course
    if (user.role === 'student') {
      const [enrollment] = await db
        .select()
        .from(enrollments)
        .where(and(eq(enrollments.userId, user.id), eq(enrollments.courseId, courseId)))
        .limit(1);

      if (!enrollment) {
        set.status = 403;
        return { error: 'Forbidden: You are not enrolled in this course.' };
      }
    }

    // Zero N+1 Queries: Hydrate flags directly in SQL using conditional aggregations
    const feed = await db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        authorId: posts.authorId,
        // Explicitly map Drizzle aggregations to clean JS numbers and booleans
        savesCount: sql<number>`cast(count(case when ${savedPosts.deletedAt} is null then 1 end) as integer)`,
        hasSaved: sql<boolean>`case when max(case when ${savedPosts.userId} = ${user.id} and ${savedPosts.deletedAt} is null then 1 else 0 end) > 0 then true else false end`,
      })
      .from(posts)
      .leftJoin(savedPosts, eq(posts.id, savedPosts.postId))
      .where(eq(posts.courseId, courseId))
      .groupBy(posts.id)
      .orderBy(desc(posts.createdAt));

    return { data: feed };
  })

  // 2. GET SAVED POSTS (Most recently saved first)
  .get('/saved', async ({ user }) => {
    const savedList = await db
      .select({
        id: posts.id,
        content: posts.content,
        createdAt: posts.createdAt,
        authorId: posts.authorId,
        savedAt: savedPosts.createdAt,
        savesCount: sql<number>`count(case when ${savedPosts.deletedAt} is null then 1 end)::int`,
        hasSaved: sql<boolean>`true`, // Always true in the saved list!
      })
      .from(savedPosts)
      .innerJoin(posts, eq(savedPosts.postId, posts.id))
      .where(and(eq(savedPosts.userId, user.id), isNull(savedPosts.deletedAt)))
      .groupBy(posts.id, savedPosts.createdAt)
      .orderBy(desc(savedPosts.createdAt));

    return { data: savedList };
  })

  // 3. TOGGLE SAVE / UNSAVE (Idempotent & History Preserving)
  .post('/:postId/bookmark', async ({ params: { postId }, body, user, set }) => {
    const { action } = body as { action: 'SAVE' | 'UNSAVE' };

    // Verify post exists (404 Check)
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);

    if (!post) {
      set.status = 404;
      return { error: 'Post not found.' };
    }

    // Verify course access (403 Check)
    if (user.role === 'student') {
      const [isEnrolled] = await db
        .select()
        .from(enrollments)
        .where(and(eq(enrollments.userId, user.id), eq(enrollments.courseId, post.courseId)))
        .limit(1);

      if (!isEnrolled) {
        set.status = 403;
        return { error: 'Forbidden: Cannot bookmark posts from unenrolled courses.' };
      }
    }

    // Check existing bookmark record in the database
    const [existing] = await db
      .select()
      .from(savedPosts)
      .where(and(eq(savedPosts.userId, user.id), eq(savedPosts.postId, postId)))
      .limit(1);

    const state = existing ? { exists: true, isSoftDeleted: !!existing.deletedAt } : null;
    
    // Delegate to our pure domain logic!
    const transition = calculateBookmarkTransition(state, action);

    if (transition.type === 'NO_OP') {
      return { success: true, status: 'NO_OP', message: transition.reason };
    }

    if (transition.type === 'CREATE_NEW') {
      await db.insert(savedPosts).values({
        id: crypto.randomUUID(),
        userId: user.id,
        postId: postId,
      });
    } else if (transition.type === 'REACTIVATE') {
      await db.update(savedPosts)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where(eq(savedPosts.id, existing!.id));
    } else if (transition.type === 'SOFT_DELETE') {
      await db.update(savedPosts)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(savedPosts.id, existing!.id));
    }

    return { success: true, status: transition.type };
  }, {
    body: t.Object({ action: t.Union([t.Literal('SAVE'), t.Literal('UNSAVE')]) })
  });