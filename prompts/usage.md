# Usage

## Overview
Cloudflare Workers + React. Storage via a single Durable Object (DO) powered library to support multiple entities on a single DO.
- Frontend: React Router 6 + TypeScript + ShadCN UI
- Backend: Hono Worker; persistence through one DO (no direct DO access)
- Shared: Types in `shared/types.ts`

## ⚠️ IMPORTANT: Demo Content
**The existing demo pages, mock data, and API endpoints are FOR TEMPLATE UNDERSTANDING ONLY.**
- Replace `src/pages/HomePage.tsx` with your application UI
- Remove or replace mock data in `shared/mock-data.ts` with real data structures
- Remove or replace demo API endpoints (`/api/demo`, `/api/counter`) and implement actual business logic
- The counter and demo items examples show DO patterns - replace with real functionality

## Tech
- React Router 6, ShadCN UI, Tailwind, Lucide, Hono, TypeScript

## Development Restrictions
- **Tailwind Colors**: Hardcode custom colors in `tailwind.config.js`, NOT in `index.css`
- **Components**: Use existing ShadCN components instead of writing custom ones
- **Icons**: Import from `lucide-react` directly
- **Error Handling**: ErrorBoundary components are pre-implemented
- **Worker Patterns**: Follow exact patterns in `worker/index.ts` to avoid breaking functionality
- **CRITICAL**: You CANNOT modify `wrangler.jsonc` - only use the single `GlobalDurableObject` binding
- **CRITICAL**: You CANNOT modify `worker/core-utils.ts` - it is a library to abstract durable object operations, handcrafted by a team of experts at Cloudflare

## Styling
- Responsive, accessible
- Prefer ShadCN components; Tailwind for layout/spacing/typography
- Use framer-motion sparingly for micro-interactions

## Code Organization

### Frontend Structure
- `src/pages/HomePage.tsx` - Placeholder wait screen (replace it)
- `src/components/TemplateDemo.tsx` - Demo-only UI (remove/ignore when building your app)
- `src/components/ThemeToggle.tsx` - Theme switching component
- `src/hooks/useTheme.ts` - Theme management hook

### Backend Structure
- `worker/index.ts` - Worker entrypoint (registers routes; do not change patterns)
- `worker/user-routes.ts` - Add routes here using existing helpers
- `worker/core-utils.ts` - DO + core index/entity utilities (**DO NOT MODIFY**)
- `worker/entities.ts` - Demo entities (users, chats)

### Shared
- `shared/types.ts` - API/data types
- `shared/mock-data.ts` - Demo-only; replace

## API Patterns

### Adding Endpoints (use Entities)
In `worker/user-routes.ts`, use entity helpers from `worker/entities.ts` and response helpers from `worker/core-utils.ts`.
```ts
import { ok, bad } from './core-utils';
import { UserEntity } from './entities';
app.post('/api/users', async (c) => {
  const { name } = await c.req.json();
  if (!name?.trim()) return bad(c, 'name required');
  const user = await UserEntity.create(c.env, { id: crypto.randomUUID(), name: name.trim() });
  return ok(c, user);
});
```

<!-- No direct DO methods in this template; use Entities/Index helpers instead. -->

### Type Safety
- Always return `ApiResponse<T>`
- Share types via `shared/types.ts`

## Bindings
CRITICAL: only `GlobalDurableObject` is available for stateful ops and is managed by our custom library. It is not to be modified or accessed directly in any way.

**IMPORTANT: You are NOT ALLOWED to edit/add/remove ANY worker bindings OR touch wrangler.jsonc/wrangler.toml. Build your application around what is already provided.**

**YOU CANNOT**:
- Modify `wrangler.jsonc` 
- Add new Durable Objects or KV namespaces
- Change binding names or add new bindings

## Storage Patterns
- Use Entities/Index utilities from `core-utils.ts`; avoid raw DO calls
- Atomic ops via provided helpers

Example of using the core-utils library:
```ts
import { IndexedEntity } from "./core-utils";
import type { User, Chat, ChatMessage } from "@shared/types";
import { MOCK_CHAT_MESSAGES, MOCK_CHATS, MOCK_USERS } from "@shared/mock-data";

export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", name: "" };
  static seedData = MOCK_USERS;
}
```

Then you can do stuff like:
```ts
const user = await UserEntity.create(c.env, { id: crypto.randomUUID(), name: name.trim() });
await UserEntity.list(c.env, null, 10); // Fetch first 10 users
```

## Frontend
- Call `/api/*` endpoints directly
- Handle loading/errors; use shared types

---

## Routing (CRITICAL)

Uses `createBrowserRouter` - do NOT switch to `BrowserRouter`/`HashRouter`.

If you switch routers, `RouteErrorBoundary`/`useRouteError()` will not work (you'll get a router configuration error screen instead of proper route error handling).

**Add routes in `src/main.tsx`:**
```tsx
const router = createBrowserRouter([
  { path: "/", element: <HomePage />, errorElement: <RouteErrorBoundary /> },
  { path: "/new", element: <NewPage />, errorElement: <RouteErrorBoundary /> },
]);
```

**Navigation:** `import { Link } from 'react-router-dom'` then `<Link to="/new">New</Link>`

**Don't:**
- Use `BrowserRouter`, `HashRouter`, `MemoryRouter`
- Remove `errorElement` from routes
- Use `useRouteError()` in your components

## UI Components
All ShadCN components are in `./src/components/ui/*`. Import and use them directly:
```tsx
import { Button } from "@/components/ui/button";
```
**Do not rewrite these components.**
