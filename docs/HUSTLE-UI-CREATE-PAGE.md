# /hustle-ui-create-page Command Reference

**Version:** 4.0.0
**Last Updated:** 2025-12-29

> **The Problem**
>
> Pages are more than components - they require routing, data fetching, SEO, and end-to-end testing. Building pages without considering these aspects leads to poor user experience and untestable code.

> **The Solution**
>
> `/hustle-ui-create-page` creates complete Next.js pages with proper routing, data fetching patterns, SEO metadata, and Playwright E2E tests across multiple viewports.

---

## Quick Start

```bash
/hustle-ui-create-page Dashboard
```

This command creates:
1. Next.js page route with proper metadata
2. Data fetching logic (server components or client)
3. Layout composition from existing components
4. Playwright E2E tests
5. Visual regression tests across 7 viewports
6. SEO metadata and Open Graph tags

---

## The 14 Phases (Page Variant)

### Phase 1: Disambiguation

**Purpose:** Clarify page type and routing.

**Example:**
```
You said "Dashboard" - what kind of page?

1. Static Page (pre-rendered at build time)
   - Marketing pages, about, pricing

2. Dynamic Page (server-rendered on request)
   - User dashboard, profile, settings

3. Hybrid Page (static shell + dynamic content)
   - Dashboard with static layout, dynamic widgets
```

---

### Phase 2: Scope

**Purpose:** Define page structure and data requirements.

**Output:**
```
Building: Dashboard (Dynamic Page)

Route: /dashboard
Layout: Authenticated (requires login)

Sections:
- Header with user info
- Stats cards (4 metrics)
- Activity chart
- Recent items list

Data Sources:
- User profile API
- Analytics API
- Activity feed API

SEO:
- Title: "Dashboard | Your App"
- No indexing (authenticated page)

Confirm? [Y/n]
```

---

### Phase 3: Design Research

**Purpose:** Research page patterns and data fetching.

**Sources:**
- Next.js App Router patterns
- Server Components best practices
- Dashboard UI patterns
- Loading states and Suspense

---

### Phase 4: Interview

**Purpose:** Gather page-specific requirements.

**Example:**
```
Let's define your Dashboard page:

1. Authentication required?
   [x] Yes, redirect to /login if not authenticated
   [ ] No, public page

2. Data fetching strategy?
   [x] Server Components (faster initial load)
   [ ] Client-side fetching (more interactive)
   [ ] Hybrid (static shell, client data)

3. Loading states?
   [x] Skeleton loaders per section
   [ ] Full-page loader
   [ ] Streaming with Suspense

4. Error handling?
   [x] Error boundaries per section
   [ ] Full-page error
   [ ] Toast notifications
```

---

### Phase 5: Component Mapping

**Purpose:** Map existing components to page sections.

**Output:**
```
Mapping components to Dashboard sections:

Section          | Existing Component | Status
─────────────────┼───────────────────┼────────
Header           | AppHeader          | ✅ Exists
Stats Cards      | StatCard           | ✅ Exists
Activity Chart   | LineChart          | ✅ Exists
Recent Items     | ItemList           | ⚠️ Need to create
User Avatar      | Avatar             | ✅ Exists

1 component needs to be created first.
Create ItemList component now? [Y/n]
```

---

### Phase 6: Schema/Types

**Purpose:** Define page props and data types.

**Output:** `src/app/dashboard/types.ts`
```typescript
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  growth: number;
}

export interface ActivityItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  description: string;
  timestamp: Date;
  user: {
    name: string;
    avatar: string;
  };
}

export interface DashboardData {
  stats: DashboardStats;
  activities: ActivityItem[];
  chartData: {
    labels: string[];
    values: number[];
  };
}
```

---

### Phase 7: Environment Check

**Purpose:** Verify data source availability.

**Checks:**
```
Checking data sources...

✅ User API: /api/v2/user - Available
✅ Analytics API: /api/v2/analytics - Available
✅ Activity API: /api/v2/activity - Available
⚠️ Chart API: Not implemented yet
   → Will use mock data for development
```

---

### Phase 8: TDD Red (E2E Tests)

**Purpose:** Write failing Playwright tests.

**Output:** `src/app/dashboard/__tests__/dashboard.e2e.test.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('displays stats cards', async ({ page }) => {
    await expect(page.getByTestId('stats-cards')).toBeVisible();
    await expect(page.getByTestId('stat-total-users')).toBeVisible();
    await expect(page.getByTestId('stat-revenue')).toBeVisible();
  });

  test('displays activity chart', async ({ page }) => {
    await expect(page.getByTestId('activity-chart')).toBeVisible();
  });

  test('displays recent activity list', async ({ page }) => {
    await expect(page.getByTestId('activity-list')).toBeVisible();
    const items = page.getByTestId('activity-item');
    await expect(items).toHaveCount(10); // Default limit
  });

  test('redirects to login if not authenticated', async ({ page, context }) => {
    // Clear cookies to simulate logged out state
    await context.clearCookies();
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login?redirect=/dashboard');
  });
});

// Viewport-specific tests
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
];

for (const viewport of viewports) {
  test(`renders correctly on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/dashboard');

    // Take screenshot for visual regression
    await expect(page).toHaveScreenshot(`dashboard-${viewport.name}.png`);
  });
}
```

---

### Phase 9: TDD Green (Page Implementation)

**Purpose:** Implement the page.

**Output:** `src/app/dashboard/page.tsx`
```typescript
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Metadata } from 'next';

import { AppHeader } from '@/components/layout/AppHeader';
import { StatCard } from '@/components/ui/StatCard';
import { LineChart } from '@/components/charts/LineChart';
import { ItemList } from '@/components/ui/ItemList';
import { StatsCardsSkeleton, ChartSkeleton, ListSkeleton } from './skeletons';
import { getDashboardData } from './actions';

export const metadata: Metadata = {
  title: 'Dashboard | Your App',
  robots: 'noindex, nofollow', // Don't index authenticated pages
};

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/login?redirect=/dashboard');
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader user={session.user} />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        {/* Stats Section */}
        <Suspense fallback={<StatsCardsSkeleton />}>
          <StatsSection />
        </Suspense>

        {/* Chart Section */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Activity Overview</h2>
          <Suspense fallback={<ChartSkeleton />}>
            <ChartSection />
          </Suspense>
        </section>

        {/* Recent Activity */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <Suspense fallback={<ListSkeleton />}>
            <ActivitySection />
          </Suspense>
        </section>
      </main>
    </div>
  );
}

async function StatsSection() {
  const { stats } = await getDashboardData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="stats-cards">
      <StatCard
        title="Total Users"
        value={stats.totalUsers}
        data-testid="stat-total-users"
      />
      <StatCard
        title="Active Users"
        value={stats.activeUsers}
        data-testid="stat-active-users"
      />
      <StatCard
        title="Revenue"
        value={`$${stats.revenue.toLocaleString()}`}
        data-testid="stat-revenue"
      />
      <StatCard
        title="Growth"
        value={`${stats.growth}%`}
        trend={stats.growth > 0 ? 'up' : 'down'}
        data-testid="stat-growth"
      />
    </div>
  );
}

async function ChartSection() {
  const { chartData } = await getDashboardData();

  return (
    <div data-testid="activity-chart">
      <LineChart
        labels={chartData.labels}
        values={chartData.values}
        height={300}
      />
    </div>
  );
}

async function ActivitySection() {
  const { activities } = await getDashboardData();

  return (
    <div data-testid="activity-list">
      <ItemList
        items={activities}
        renderItem={(activity) => (
          <div key={activity.id} data-testid="activity-item">
            <span>{activity.description}</span>
            <time>{activity.timestamp.toLocaleDateString()}</time>
          </div>
        )}
      />
    </div>
  );
}
```

---

### Phase 10-14: Same as Component Workflow

Verification, Visual Testing (7 viewports), Accessibility Audit, Documentation, and Completion follow the same pattern as `/hustle-ui-create`.

---

## Page-Specific Features

### SEO Metadata

Every page includes proper metadata:
```typescript
export const metadata: Metadata = {
  title: 'Page Title | App Name',
  description: 'Page description for search engines',
  openGraph: {
    title: 'Page Title',
    description: 'Page description',
    images: ['/og-image.png'],
  },
};
```

### Authentication Patterns

```typescript
// Server-side auth check
const session = await getServerSession();
if (!session) redirect('/login');

// Client-side auth check (for client components)
const { data: session, status } = useSession();
if (status === 'unauthenticated') router.push('/login');
```

### Data Fetching Patterns

```typescript
// Server Component (recommended)
async function Page() {
  const data = await fetchData();
  return <Component data={data} />;
}

// With Suspense boundaries
<Suspense fallback={<Skeleton />}>
  <AsyncComponent />
</Suspense>

// Client-side with SWR
const { data, isLoading } = useSWR('/api/data', fetcher);
```

---

## E2E Test Patterns

### Viewport Testing
```typescript
const viewports = [
  { name: 'mobile-portrait', width: 375, height: 667 },
  { name: 'mobile-notch', width: 393, height: 852 },
  { name: 'mobile-landscape', width: 667, height: 375 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'small-desktop', width: 1280, height: 720 },
  { name: 'desktop', width: 1920, height: 1080 },
];
```

### Visual Regression
```typescript
await expect(page).toHaveScreenshot('page-name.png', {
  fullPage: true,
  animations: 'disabled',
});
```

---

## Related Commands

| Command | Purpose |
|---------|---------|
| `/hustle-ui-create` | Create components |
| `/test-e2e` | Run Playwright tests |
| `/test-visual` | Run visual tests |

---

## See Also

- [HUSTLE-UI-CREATE.md](./HUSTLE-UI-CREATE.md) - Component creation
- [ORCHESTRATOR.md](./ORCHESTRATOR.md) - Master orchestrator
- [SKILLS.md](./SKILLS.md) - All slash commands
