# Architectural Notes & Trade-offs

## 1. Key Design Decisions

### Data Modeling & Soft Deletes (History Preservation)
To guarantee idempotency and preserve historical bookmarks without database constraint collisions, I implemented a composite unique index on `(user_id, post_id)` within the `saved_posts` table.
* Rather than deleting rows on un-save, we mutate a nullable `deleted_at` timestamp.
* **Why:** If a user saves, un-saves, and re-saves a post, inserting a new row would violate relational integrity or bloat tables with duplicate historical pairs. Reactivating the existing row (`deleted_at: null`) maintains strict relational integrity and historical tracking while making repeated save attempts safe no-ops.

### Preventing $N+1$ Query Bottlenecks
Hydrated flags (`hasSaved`, `savesCount`) are computed directly within the SQL query during feed generation using conditional Drizzle/PostgreSQL aggregations:
* `count(case when deleted_at is null then 1 end)` computes total active saves.
* `max(case when user_id = :currentUserId and deleted_at is null then 1 else 0 end) > 0` resolves user-specific state in a single database trip, preventing $N+1$ query cascades as feed sizes grow.

### Pure Business Logic Separation
State transitions (determining whether to insert, reactivate, soft-delete, or no-op) live in `/domain/bookmark.logic.ts`. This file has zero dependencies on Drizzle ORM or HTTP headers, making our core business rules 100% testable in sub-millisecond execution times without requiring database mocking or network I/O.

---

## 2. Client State & Optimistic UI
I utilized **React Query v5** paired with a strict **Query Key Factory** (`queryKeys.posts.feed(courseId)`). 
* When a user toggles a bookmark, `useBookmarkMutation` triggers an `onMutate` optimistic update, instantly reflecting UI changes while preventing interface layout shifts.
* If the server response fails, React Query automatically rolls back the cache to the exact `previousFeed` snapshot.
* Presentation components (`PostCard.tsx`) remain 100% pure and decoupled from data fetching, receiving only primitive props and callback functions.

---

## 3. Trade-offs & Descoping (Time Boxed to ~5 Hours)
* **Authentication:** Per assessment instructions, real JWT/session verification was stubbed. Auth identity is derived cleanly from `x-user-id` and `x-user-role` request headers. However, authorization boundaries (`401 Unauthenticated`, `403 Forbidden course access`, and `OWN user saved lists`) are strictly enforced as if auth were live.
* **Pagination:** Implemented via clean array slicing and SQL sorting. For production feeds at scale, I would migrate to Cursor-based pagination (using `created_at` timestamps) to prevent page-drift during real-time insertions.

---

## 4. What I'd Do With Another Day
1. **Real-Time WebSockets / Server-Sent Events (SSE):** Broadcast save count updates to other enrolled students viewing the same course feed using a lightweight Redis pub/sub layer.
2. **End-to-End Playwright Tests:** Implement automated browser assertions to simulate network disconnects and verify optimistic rollback behavior in the DOM.
3. **Cursor-Based Infinite Scroll:** Replace standard pagination with an infinite loading scroll hook in the presentation layer.
