import { Hono } from 'hono';
import { corsMiddleware } from './middleware/cors';
import { healthRoute } from './routes/health';
import { authRoute } from './routes/auth';
import { usersRoute } from './routes/users';
import { locationsRoute } from './routes/locations';
import { communitiesRoute } from './routes/communities';
import { citiesRoute } from './routes/cities';
import { locationRoute } from './routes/location';
import type { Bindings } from './types/env';

import { protectDomain } from './services/access';
import { discoveryRoute } from './routes/discovery';
import { accessRoute } from './routes/access';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', corsMiddleware);
app.use('*', protectDomain);
app.route('/discovery', discoveryRoute);
app.route('/api/discovery', discoveryRoute);
app.route('/access', accessRoute);
app.route('/api/access', accessRoute);

app.get('/', (c) => {
  return c.json({ ok: true, service: 'qahal-worker' });
});

app.route('/health', healthRoute);
app.route('/auth', authRoute);
app.route('/users', usersRoute);
app.route('/locations', locationsRoute);
app.route('/communities', communitiesRoute);
app.route('/api/cities', citiesRoute);
app.route('/api/location', locationRoute);

// API prefix compatibility for local Vite proxy and frontend base URL.
app.route('/api/health', healthRoute);
app.route('/api/auth', authRoute);
app.route('/api/users', usersRoute);
app.route('/api/locations', locationsRoute);
app.route('/api/communities', communitiesRoute);

app.onError((err, c) => {
  console.error('Unhandled worker error');
  return c.json({ ok: false, error: 'internal_server_error' }, 500);
});

export default app;
