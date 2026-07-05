import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { APP_NAME } from '@forum/shared';

const app = new Elysia()
  .use(cors())
  .get('/api/health', () => ({ status: 'ok', app: APP_NAME }))
  .listen(3001);

console.log(`🦊 Elysia API is running at ${app.server?.hostname}:${app.server?.port}`);