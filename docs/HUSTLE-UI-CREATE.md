# /hustle-ui-create Command Reference

**Version:** 4.0.0
**Last Updated:** 2025-12-29

> **The Problem**
>
> UI components are often built without proper design research, accessibility testing, or visual regression coverage. Components drift from design systems and break in different viewports.

> **The Solution**
>
> `/hustle-ui-create` enforces a complete workflow for building UI components with Storybook integration, visual testing across 7 viewports, accessibility audits, and brand guide compliance.

---

## Quick Start

```bash
/hustle-ui-create Button
```

This command triggers a workflow that:
1. Clarifies component type (Basic vs Complex)
2. Researches similar component patterns
3. Interviews about variants, states, and accessibility
4. Applies brand guide styling
5. Writes component tests (TDD)
6. Implements the component
7. Creates Storybook stories
8. Runs visual regression tests across 7 viewports
9. Performs accessibility audit
10. Documents in registry

---

## The 14 Phases (UI Variant)

### Phase 1: Disambiguation

**Purpose:** Clarify component type and scope.

**Example:**
```
You said "Button" - what type of component?

1. Basic Component (single responsibility, no state management)
   - Simple button with variants (primary, secondary, ghost)

2. Complex Component (compound, with internal state)
   - Button group with selection state
   - Dropdown button with menu

3. Pattern Component (composition of existing components)
   - Form submit button with loading state
```

---

### Phase 2: Scope

**Purpose:** Confirm component requirements.

**Output:**
```
Building: Button (Basic Component)

Variants:
- Primary, Secondary, Ghost, Danger
- Sizes: sm, md, lg
- States: default, hover, active, disabled, loading

Accessibility:
- Keyboard navigation
- ARIA labels
- Focus indicators

Storybook:
- Stories for each variant
- Interactive controls
- Documentation

Confirm? [Y/n]
```

---

### Phase 3: Design Research

**Purpose:** Research similar component patterns.

**Sources:**
- Radix UI primitives
- shadcn/ui implementations
- Accessibility best practices (WAI-ARIA)
- Brand guide (if exists)

**Example:**
```
Researching button patterns...

Found:
1. Radix Primitive: Accessible button foundation
2. shadcn/ui: Variant-based styling with CVA
3. WAI-ARIA: Button role requirements
4. Brand Guide: Primary color #BA0C2F
```

---

### Phase 4: Interview

**Purpose:** Gather specific requirements.

**Example:**
```
Based on research, let's define your Button:

1. Variants needed?
   [x] Primary (brand color)
   [x] Secondary (outline)
   [x] Ghost (transparent)
   [x] Danger (destructive actions)
   [ ] Link (styled as link)

2. Sizes?
   [x] sm (28px height)
   [x] md (36px height)
   [x] lg (44px height)

3. Icon support?
   [x] Leading icon
   [x] Trailing icon
   [ ] Icon-only

4. Loading state?
   [x] Yes, with spinner
   [ ] No
```

---

### Phase 5: Deep Research

**Purpose:** Research specifics based on answers.

**Example:**
```
Based on your answers, researching:

1. CVA (class-variance-authority) for variant management
2. Loading spinner animations
3. Icon sizing in buttons
4. Touch target sizes for mobile (44x44 minimum)

Approve? [Y/n]
```

---

### Phase 6: Schema/Types

**Purpose:** Generate TypeScript types.

**Output:** `src/components/ui/Button/types.ts`
```typescript
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}
```

---

### Phase 7: Brand Guide Check

**Purpose:** Apply brand guide styles.

**Checks:**
```
Applying brand guide...

✅ Primary color: #BA0C2F
✅ Font family: Inter
✅ Border radius: 8px
✅ Focus ring: 2px offset
⚠️ Shadow tokens: Not defined in brand guide
   → Using default: shadow-sm
```

---

### Phase 8: TDD Red

**Purpose:** Write failing tests first.

**Output:** `src/components/ui/Button/Button.test.tsx`
```typescript
describe('Button', () => {
  it('renders with primary variant by default', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary');
  });

  it('shows loading spinner when isLoading', () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('is disabled when isLoading', () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('supports keyboard navigation', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    await userEvent.tab();
    expect(screen.getByRole('button')).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalled();
  });
});
```

---

### Phase 9: TDD Green

**Purpose:** Implement the component.

**Output:** `src/components/ui/Button/Button.tsx`
```typescript
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from '@radix-ui/react-slot';
import { Spinner } from '../Spinner';
import { cn } from '@/lib/utils';
import type { ButtonProps } from './types';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        sm: 'h-7 px-3 text-sm',
        md: 'h-9 px-4',
        lg: 'h-11 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, leftIcon, rightIcon, asChild, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={isLoading || props.disabled}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && <Spinner className="mr-2 h-4 w-4" data-testid="spinner" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </Comp>
    );
  }
);

Button.displayName = 'Button';
```

---

### Phase 10: Verification (4-Step)

**Purpose:** Comprehensive verification.

**Steps:**
```
1. ✅ Unit Tests: 8/8 passing
2. ✅ Type Check: No errors
3. ✅ Storybook Build: Successful
4. ⏳ Visual Regression: Running across 7 viewports...
```

---

### Phase 11: Visual Testing (7 Viewports)

**Purpose:** Screenshot testing across all viewport sizes.

**Viewports Tested:**
| Viewport | Dimensions | Status |
|----------|------------|--------|
| Mobile Portrait | 375×667 | ✅ |
| Mobile Notch | 393×852 | ✅ |
| Mobile Landscape | 667×375 | ✅ |
| Tablet Portrait | 768×1024 | ✅ |
| Tablet Landscape | 1024×768 | ✅ |
| Small Desktop | 1280×720 | ✅ |
| Desktop | 1920×1080 | ✅ |

**Output:**
```
Visual regression tests complete!

Screenshots saved to:
- __snapshots__/Button-primary-mobile.png
- __snapshots__/Button-primary-tablet.png
- __snapshots__/Button-primary-desktop.png
- ... (21 total screenshots)

No visual regressions detected.
```

---

### Phase 12: Accessibility Audit

**Purpose:** Automated a11y checks.

**Checks:**
```
Running accessibility audit...

✅ Color contrast: 7.2:1 (exceeds AA requirement)
✅ Focus indicator: Visible
✅ Touch target: 44x44px minimum met
✅ ARIA: Proper button role
✅ Keyboard: Enter and Space work
⚠️ Screen reader: Add aria-label for icon-only buttons

Overall: PASS with 1 suggestion
```

---

### Phase 13: Documentation

**Purpose:** Create Storybook stories and update registry.

**Storybook Stories:** `src/components/ui/Button/Button.stories.tsx`
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading...',
    isLoading: true,
  },
};

// ... more stories
```

---

### Phase 14: Completion

**Output:**
```
═══════════════════════════════════════════════════════════
✅ Component Complete: Button
═══════════════════════════════════════════════════════════

Files Created:
- src/components/ui/Button/Button.tsx
- src/components/ui/Button/Button.test.tsx
- src/components/ui/Button/Button.stories.tsx
- src/components/ui/Button/types.ts
- src/components/ui/Button/index.ts

Storybook: http://localhost:6006/?path=/docs/ui-button
Visual Tests: 21 screenshots across 7 viewports

Ready to commit? [Y/n]
```

---

## Related Commands

| Command | Purpose |
|---------|---------|
| `/hustle-ui-create-page` | Create full pages |
| `/test-visual` | Run visual tests standalone |
| `/test-unit` | Run unit tests standalone |

---

## See Also

- [HUSTLE-UI-CREATE-PAGE.md](./HUSTLE-UI-CREATE-PAGE.md) - Page creation
- [ORCHESTRATOR.md](./ORCHESTRATOR.md) - Master orchestrator
- [SKILLS.md](./SKILLS.md) - All slash commands
