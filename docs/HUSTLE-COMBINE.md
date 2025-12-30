# /hustle-combine Command Reference

**Version:** 4.0.0
**Last Updated:** 2025-12-29

> **The Problem**
>
> Complex features often require orchestrating multiple APIs together - calling one API, using its response to call another, handling errors across services. Building these manually leads to inconsistent error handling and duplicated logic.

> **The Solution**
>
> `/hustle-combine` creates orchestrated API endpoints that combine 2+ existing APIs with proper error handling, retry logic, and unified response schemas.

---

## Quick Start

```bash
/hustle-combine location-weather
```

This command creates an endpoint that:
1. Calls geocoding API to get coordinates from address
2. Calls weather API with those coordinates
3. Returns combined, unified response
4. Handles errors from either service gracefully

---

## The 14 Phases (Combine Variant)

### Phase 1: API Selection

**Purpose:** Select 2+ APIs from registry to combine.

**Example:**
```
Select APIs to combine (minimum 2):

Available APIs:
┌────────────────────┬─────────────┬──────────────────┐
│ API                │ Method      │ Last Updated     │
├────────────────────┼─────────────┼──────────────────┤
│ geocoding          │ GET         │ 2025-12-28       │
│ weather            │ GET         │ 2025-12-27       │
│ unsplash           │ GET         │ 2025-12-26       │
│ stripe-checkout    │ POST        │ 2025-12-29       │
└────────────────────┴─────────────┴──────────────────┘

Selected: [geocoding, weather]
```

---

### Phase 2: Scope

**Purpose:** Define the orchestration pattern.

**Patterns:**
```
How should these APIs be combined?

1. Sequential (Chain)
   geocoding → weather
   Response from first feeds into second

2. Parallel (Fan-out)
   Both called simultaneously, results merged

3. Conditional (Branch)
   Call second API only if first meets condition

4. Fallback (Resilient)
   Try first, use second if first fails

Selected: Sequential
```

---

### Phase 3: Flow Definition

**Purpose:** Map data between APIs.

**Example:**
```
Define the data flow:

Step 1: geocoding
  Input: { address: string }
  Output: { lat: number, lng: number }

Step 2: weather
  Input: { lat: number, lng: number }  ← From Step 1
  Output: { temperature: number, conditions: string }

Mapping:
  geocoding.lat → weather.lat
  geocoding.lng → weather.lng
```

---

### Phase 4: Interview

**Purpose:** Gather orchestration requirements.

**Example:**
```
Let's configure the orchestration:

1. Error handling strategy?
   [x] Fail fast (stop on first error)
   [ ] Partial success (return what succeeded)
   [ ] Fallback values (use defaults on error)

2. Retry logic?
   [x] Retry failed steps (max 3 attempts)
   [ ] No retries

3. Timeout per step?
   [x] 5 seconds per API call
   [ ] 10 seconds total

4. Caching?
   [x] Cache geocoding results (1 hour)
   [ ] No caching
```

---

### Phase 5: Deep Research

**Purpose:** Research orchestration patterns.

**Topics:**
- Error propagation in chained calls
- Retry with exponential backoff
- Response caching strategies
- Circuit breaker patterns

---

### Phase 6: Schema Creation

**Purpose:** Create unified request/response schemas.

**Output:** `src/lib/schemas/location-weather.ts`
```typescript
import { z } from 'zod';

// Combined request schema
export const LocationWeatherRequestSchema = z.object({
  address: z.string().min(1).describe('Address to get weather for'),
  units: z.enum(['metric', 'imperial']).default('metric'),
});

// Combined response schema
export const LocationWeatherResponseSchema = z.object({
  location: z.object({
    address: z.string(),
    lat: z.number(),
    lng: z.number(),
    formattedAddress: z.string(),
  }),
  weather: z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    conditions: z.string(),
    humidity: z.number(),
    windSpeed: z.number(),
  }),
  metadata: z.object({
    geocodingCached: z.boolean(),
    fetchedAt: z.string().datetime(),
  }),
});

// Error schema
export const LocationWeatherErrorSchema = z.object({
  error: z.string(),
  failedStep: z.enum(['geocoding', 'weather']),
  details: z.unknown().optional(),
});
```

---

### Phase 7: Environment Check

**Purpose:** Verify all source APIs work.

**Checks:**
```
Verifying source APIs...

✅ geocoding: API key valid, endpoint responding
✅ weather: API key valid, endpoint responding

All source APIs operational.
```

---

### Phase 8: TDD Red

**Purpose:** Write tests for the orchestration.

**Output:** `src/app/api/v2/location-weather/__tests__/location-weather.api.test.ts`
```typescript
describe('POST /api/v2/location-weather', () => {
  it('returns combined location and weather data', async () => {
    const response = await POST(createMockRequest({
      address: '1600 Pennsylvania Avenue, Washington DC',
    }));

    expect(response.status).toBe(200);
    const data = await response.json();

    // Location data from geocoding
    expect(data.location.lat).toBeCloseTo(38.8977, 2);
    expect(data.location.lng).toBeCloseTo(-77.0365, 2);

    // Weather data
    expect(data.weather.temperature).toBeDefined();
    expect(data.weather.conditions).toBeDefined();
  });

  it('returns error if geocoding fails', async () => {
    const response = await POST(createMockRequest({
      address: 'invalid-address-that-does-not-exist-12345',
    }));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.failedStep).toBe('geocoding');
  });

  it('returns cached geocoding results', async () => {
    // First call
    await POST(createMockRequest({ address: '123 Main St' }));

    // Second call should use cache
    const response = await POST(createMockRequest({ address: '123 Main St' }));
    const data = await response.json();

    expect(data.metadata.geocodingCached).toBe(true);
  });

  it('retries on transient failures', async () => {
    // Mock first call to fail, second to succeed
    mockWeatherApi.mockRejectedValueOnce(new Error('Network error'));
    mockWeatherApi.mockResolvedValueOnce({ temperature: 72 });

    const response = await POST(createMockRequest({
      address: '123 Main St',
    }));

    expect(response.status).toBe(200);
    expect(mockWeatherApi).toHaveBeenCalledTimes(2);
  });
});
```

---

### Phase 9: TDD Green

**Purpose:** Implement the orchestration.

**Output:** `src/app/api/v2/location-weather/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { LocationWeatherRequestSchema } from '@/lib/schemas/location-weather';
import { geocodingApi } from '@/lib/api/geocoding';
import { weatherApi } from '@/lib/api/weather';
import { cache } from '@/lib/cache';

const GEOCODING_CACHE_TTL = 60 * 60; // 1 hour
const MAX_RETRIES = 3;
const TIMEOUT_MS = 5000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, units } = LocationWeatherRequestSchema.parse(body);

    // Step 1: Geocoding (with cache)
    const cacheKey = `geocoding:${address}`;
    let geocodingResult = await cache.get(cacheKey);
    let geocodingCached = true;

    if (!geocodingResult) {
      geocodingCached = false;
      geocodingResult = await withRetry(
        () => geocodingApi.geocode(address),
        MAX_RETRIES
      );

      if (!geocodingResult) {
        return NextResponse.json(
          { error: 'Address not found', failedStep: 'geocoding' },
          { status: 400 }
        );
      }

      await cache.set(cacheKey, geocodingResult, GEOCODING_CACHE_TTL);
    }

    // Step 2: Weather (no cache - data changes frequently)
    const weatherResult = await withRetry(
      () => weatherApi.getWeather({
        lat: geocodingResult.lat,
        lng: geocodingResult.lng,
        units,
      }),
      MAX_RETRIES
    );

    if (!weatherResult) {
      return NextResponse.json(
        { error: 'Weather data unavailable', failedStep: 'weather' },
        { status: 503 }
      );
    }

    // Combine results
    return NextResponse.json({
      location: {
        address,
        lat: geocodingResult.lat,
        lng: geocodingResult.lng,
        formattedAddress: geocodingResult.formattedAddress,
      },
      weather: {
        temperature: weatherResult.temperature,
        feelsLike: weatherResult.feelsLike,
        conditions: weatherResult.conditions,
        humidity: weatherResult.humidity,
        windSpeed: weatherResult.windSpeed,
      },
      metadata: {
        geocodingCached,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    throw error;
  }
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  delay = 1000
): Promise<T | null> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), TIMEOUT_MS)
        ),
      ]);
    } catch (error) {
      if (i === maxRetries - 1) return null;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  return null;
}
```

---

### Phases 10-14

Same as standard API workflow: Verification, Code Review, Refactor, Documentation, Completion.

---

## Orchestration Patterns

### Sequential (Chain)
```
A → B → C
Each step uses output from previous
```

### Parallel (Fan-out)
```
    ┌→ B ─┐
A → ┼→ C ─┼→ D
    └→ D ─┘
All called simultaneously, results merged
```

### Conditional (Branch)
```
A → condition? → B (if true)
              → C (if false)
```

### Fallback (Resilient)
```
A → B (try first)
  → C (if B fails)
```

---

## Registry Entry

Combined endpoints are tracked in the registry:
```json
{
  "apis": {
    "location-weather": {
      "type": "combined",
      "sourceApis": ["geocoding", "weather"],
      "pattern": "sequential",
      "path": "/api/v2/location-weather",
      "schema": "src/lib/schemas/location-weather.ts"
    }
  }
}
```

---

## Related Commands

| Command | Purpose |
|---------|---------|
| `/api-create` | Create individual APIs |
| `/api-status` | Check API status |

---

## See Also

- [API-CREATE.md](./API-CREATE.md) - Individual API creation
- [ORCHESTRATOR.md](./ORCHESTRATOR.md) - Master orchestrator
- [SKILLS.md](./SKILLS.md) - All slash commands
