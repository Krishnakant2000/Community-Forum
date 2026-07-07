import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { APP_NAME } from '@forum/shared';
import { postRoutes } from './routes/posts';

const app = new Elysia()
  .use(cors())
  .get('/api/health', () => ({ status: 'ok', app: APP_NAME }))
  .use(postRoutes)
  .listen(3001);

console.log(`🦊 Elysia API is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;