# Conti — 100% Online Company Setup & SME Compliance
[cloudflarebutton]
Conti is a modern web application designed to provide seamless, 100% online services for small and medium-sized enterprises (SMEs) and startups in Vietnam. It focuses on company formation, accounting & tax compliance, legal adherence, and digital business tools. The platform emphasizes a minimalist, encouraging UX with generous whitespace, a trustworthy light blue and white color palette, and transparent all-inclusive pricing. Built for rapid deployment and scalability on Cloudflare, it delivers a polished, responsive experience across devices.
## Overview
Conti - Giải pháp lập và vận hành doanh nghiệp tối ưu cho SME và Startup.
- **Online Company Formation**: Handle registrations, seals, digital signatures, and more in 5-7 days.
- **Accounting & Tax Services**: Quarterly reports, bookkeeping, and e-invoicing integration starting at 800,000 VND/month.
- **Compliance Solutions**: License changes, director appointments, and legal document management.
- **Digital Tools**: Business digitization support to attract customers online.
Key unique selling points include 100% digital workflows, transparent pricing with no hidden fees, and expert legal compliance. The application features a complete homepage, services overview, dedicated pricing page, resources section, about page, and a mock client portal for login and dashboard previews.
## Features
- **Responsive Design**: Mobile-first layout with Tailwind CSS, ensuring flawless performance on all devices.
- **Interactive UI**: Smooth animations via Framer Motion, micro-interactions, and accessible components using ShadCN UI.
- **Data Management**: Frontend caching with React Query; backend persistence via Cloudflare Durable Objects.
- **Mock API Integration**: Endpoints for services, pricing, leads, and subscriptions using Hono on Cloudflare Workers.
- **Client Portal**: Simulated authentication with progress tracking and invoice views.
- **SEO & Accessibility**: Optimized meta tags, high contrast ratios, and keyboard navigation.
- **Form Handling**: Secure lead capture and newsletter signups with React Hook Form and Zod validation.
## Tech Stack
### Frontend
- **React 18** with **React Router 6** for routing
- **ShadCN UI** for accessible, customizable components
- **Tailwind CSS v3** for styling (with custom Blue/White palette, primary: #3B82F6)
- **Framer Motion** for animations and transitions
- **@tanstack/react-query** for data fetching and caching
- **React Hook Form + Zod** for forms and validation
- **Lucide React** for icons
- **Sonner** for toast notifications
- **Zustand** for lightweight state management
### Backend
- **Hono** for API routing on Cloudflare Workers
- **Cloudflare Durable Objects** for entity-based persistence (users, leads, sessions)
- **TypeScript** for type safety across frontend and backend
### Tools & Utilities
- **Vite** for fast development and builds
- **Bun** as the runtime and package manager
- **Cloudflare Workers** for edge deployment
- **Wrangler** for local development and deployment
## Quick Start
### Prerequisites
- Node.js (v18+) or Bun installed
- Cloudflare account (for deployment)
### Installation
1. Clone the repository:
   ```
   git clone <your-repo-url>
   cd conti-app
   ```
2. Install dependencies using Bun:
   ```
   bun install
   ```
3. (Optional) Generate TypeScript types for Workers:
   ```
   bun run cf-typegen
   ```
## Development
### Local Development
Start the development server:
```
bun run dev
```
The app will be available at `http://localhost:3000`. The worker APIs are handled via Cloudflare's local emulation.
### Environment Setup
- No additional environment variables are required for basic development.
- For production, ensure your Cloudflare account is linked via Wrangler.
### Scripts
- `bun run dev`: Start Vite dev server (frontend + worker proxy)
- `bun run build`: Build for production
- `bun run preview`: Preview production build locally
- `bun run lint`: Run ESLint checks
- `bun run deploy`: Build and deploy to Cloudflare
### Adding Routes
- **Frontend**: Edit `src/main.tsx` to add new routes using React Router.
- **Backend**: Extend `worker/user-routes.ts` with new Hono endpoints. Use entities from `worker/entities.ts` for persistence (e.g., `LeadEntity.create()` for form submissions).
### Data Flow
- Frontend fetches from `/api/*` endpoints (e.g., `api<{ items: Service[] }>('/api/services')`).
- Backend uses `IndexedEntity` patterns for CRUD operations with automatic seeding from `shared/mock-data.ts`.
### Customization
- Update colors in `tailwind.config.js` (extend the blue palette: #3B82F6 primary).
- Extend mock data in `shared/mock-data.ts` for services, pricing tiers, etc.
- Add new pages in `src/pages/` and import into the router.
## Usage Examples
### Frontend Data Fetching
```tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
function ServicesList() {
  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: () => api<Service[]>('/api/services'),
  });
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {services?.map(service => (
        <Card key={service.id}>
          <CardHeader>{service.name}</CardHeader>
          <CardContent>{service.description}</CardContent>
        </Card>
      ))}
    </div>
  );
}
```
### Backend Endpoint Example (in `worker/user-routes.ts`)
```ts
import { LeadEntity } from './entities';
import { ok, bad } from './core-utils';
app.post('/api/lead', async (c) => {
  const { name, email, service } = await c.req.json();
  if (!name || !email) return bad(c, 'Name and email required');
  const lead = await LeadEntity.create(c.env, {
    id: crypto.randomUUID(),
    name,
    email,
    service,
    createdAt: Date.now(),
  });
  return ok(c, lead);
});
```
### Form Submission
Use React Hook Form for lead capture:
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
const schema = z.object({ name: z.string().min(1), email: z.string().email() });
type FormData = z.infer<typeof schema>;
function LeadForm() {
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const onSubmit = async (data: FormData) => {
    await api('/api/lead', { method: 'POST', body: JSON.stringify(data) });
    toast.success('Lead submitted!');
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('name')} placeholder="Full Name" />
      <Input {...register('email')} placeholder="Email" />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```
## Deployment
Deploy to Cloudflare Workers for global edge performance:
1. Authenticate with Wrangler:
   ```
   bunx wrangler login
   ```
2. (Optional) Configure your Cloudflare account ID in `wrangler.jsonc`.
3. Deploy:
   ```
   bun run deploy
   ```
The app will be live at your Workers subdomain. Static assets are served via Cloudflare Pages integration, with the Worker handling API routes.
For custom domains, update bindings in your Cloudflare dashboard.
[cloudflarebutton]
## Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.
Please ensure code follows TypeScript best practices and includes tests where applicable.
## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.