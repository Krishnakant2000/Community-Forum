import { describe, it, expect } from 'vitest';
import { postRoutes } from '../src/routes/posts';

describe('Integration: API Authorization & Happy Paths', () => {
  it('should return 401 Unauthorized if x-user-id header is missing', async () => {
    const response = await postRoutes.handle(
      new Request('http://localhost/api/posts/feed/course-react', {
        method: 'GET',
        // Deliberately omitting authentication headers
      })
    );
    expect(response.status).toBe(401);
  });

  it('should return 403 Forbidden if a student tries to access an unenrolled course feed', async () => {
    // From our seed data: student-2 (Bob) is ONLY enrolled in 'course-sysdesign'
    const response = await postRoutes.handle(
      new Request('http://localhost/api/posts/feed/course-react', {
        method: 'GET',
        headers: { 'x-user-id': 'student-2', 'x-user-role': 'student' }
      })
    );
    expect(response.status).toBe(403);
  });

  it('should return 200 OK and hydrated flags when an enrolled student fetches the feed', async () => {
    // From our seed data: student-1 (Alice) is enrolled in 'course-react'
    const response = await postRoutes.handle(
      new Request('http://localhost/api/posts/feed/course-react', {
        method: 'GET',
        headers: { 'x-user-id': 'student-1', 'x-user-role': 'student' }
      })
    );
    
    expect(response.status).toBe(200);
    const body = await response.json() as any;
    expect(Array.isArray(body.data)).toBe(true);
    
    // Check that our SQL aggregations properly returned the boolean and number types
    if (body.data.length > 0) {
      expect(typeof body.data[0].hasSaved).toBe('boolean');
      expect(typeof body.data[0].savesCount).toBe('number');
    }
  });

  it('should return 404 Not Found when bookmarking a non-existent post', async () => {
    const response = await postRoutes.handle(
      new Request('http://localhost/api/posts/fake-post-id/bookmark', {
        method: 'POST',
        headers: { 
          'x-user-id': 'student-1', 
          'x-user-role': 'student',
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ action: 'SAVE' })
      })
    );
    expect(response.status).toBe(404);
  });
});