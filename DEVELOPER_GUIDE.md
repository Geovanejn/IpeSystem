# Developer Guide - Sistema Integrado IPE

## Getting Started

### Prerequisites
- Node.js 18+ with npm
- PostgreSQL (provided by Replit)
- Git

### Initial Setup

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Database Setup**
   ```bash
   npm run db:push
   ```
   This applies the schema from `shared/schema.ts` to PostgreSQL.

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   This starts Express backend + Vite frontend on http://localhost:5000

4. **Access the App**
   - Open http://localhost:5000 in your browser
   - Login with test credentials (see Backend Development section)

---

## Project Organization

### Frontend (`client/src/`)

**Pages Structure** (organized by role):
```
pages/
├── pastor/           # Pastor panel pages
├── treasurer/        # Treasurer panel pages
├── deacon/           # Deacon panel pages
├── lgpd/             # LGPD portal pages
├── login.tsx         # Public login page
└── not-found.tsx     # 404 page
```

**UI Components** (`components/`):
- `ui/` - shadcn/ui base components (don't edit)
- `app-layout.tsx` - Main layout with sidebar
- `app-sidebar.tsx` - Role-based navigation sidebar
- `theme-provider.tsx` - Light/dark mode support

**Utilities** (`lib/`):
- `queryClient.ts` - React Query setup with API client
- Other utility functions

**Styling**:
- `index.css` - Global styles and CSS custom properties
- Tailwind CSS for utility styling

### Backend (`server/`)

```
server/
├── routes.ts         # All API endpoints (80+ routes)
├── storage.ts        # Data storage/CRUD interface
├── auth.ts           # Authentication & authorization logic
└── vite.ts           # Vite dev server integration
```

### Shared (`shared/`)

```
shared/
└── schema.ts         # Drizzle ORM tables + Zod validation schemas
```

### Configuration

- `vite.config.ts` - Vite build config (don't modify)
- `tailwind.config.ts` - Tailwind CSS tokens and theme
- `tsconfig.json` - TypeScript configuration
- `drizzle.config.ts` - Drizzle ORM migration config

---

## Development Workflow

### 1. Adding a New Feature

#### Step 1: Update Database Schema
Edit `shared/schema.ts`:

```typescript
// Define table
export const myFeature = pgTable("my_feature", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  memberId: integer("member_id").notNull().references(() => members.id),
});

// Define Zod validation
export const insertMyFeatureSchema = createInsertSchema(myFeature).omit({
  id: true,
});

// Define types
export type InsertMyFeature = z.infer<typeof insertMyFeatureSchema>;
export type MyFeature = typeof myFeature.$inferSelect;
```

#### Step 2: Apply Schema Changes
```bash
npm run db:push
```

#### Step 3: Add Backend Routes
Edit `server/routes.ts`:

```typescript
// List
app.get("/api/my-feature", async (req, res) => {
  try {
    const items = await storage.getMyFeatures();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch" });
  }
});

// Create
app.post("/api/my-feature", async (req, res) => {
  try {
    const validated = insertMyFeatureSchema.parse(req.body);
    const item = await storage.createMyFeature(validated);
    res.status(201).json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to create" });
  }
});

// Update
app.patch("/api/my-feature/:id", async (req, res) => {
  try {
    const validated = insertMyFeatureSchema.parse(req.body);
    const item = await storage.updateMyFeature(parseInt(req.params.id), validated);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to update" });
  }
});

// Delete
app.delete("/api/my-feature/:id", async (req, res) => {
  try {
    await storage.deleteMyFeature(parseInt(req.params.id));
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete" });
  }
});
```

#### Step 4: Update Storage Interface
Edit `server/storage.ts` - add methods to `IStorage` interface:

```typescript
interface IStorage {
  // ... existing methods ...
  getMyFeatures(): Promise<MyFeature[]>;
  createMyFeature(data: InsertMyFeature): Promise<MyFeature>;
  updateMyFeature(id: number, data: InsertMyFeature): Promise<MyFeature>;
  deleteMyFeature(id: number): Promise<void>;
}

// In MemStorage class, implement the methods:
async getMyFeatures(): Promise<MyFeature[]> {
  return this.myFeatures || [];
}

async createMyFeature(data: InsertMyFeature): Promise<MyFeature> {
  const id = (this.myFeatureCounter = (this.myFeatureCounter || 0) + 1);
  const feature = { ...data, id } as MyFeature;
  this.myFeatures = [...(this.myFeatures || []), feature];
  return feature;
}

// ... etc
```

#### Step 5: Create Frontend Page
Create `client/src/pages/{role}/my-feature.tsx`:

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMyFeatureSchema, type InsertMyFeature } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export default function MyFeaturePage() {
  const [open, setOpen] = useState(false);

  // Fetch data
  const { data: items, isLoading } = useQuery({
    queryKey: ["/api/my-feature"],
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: InsertMyFeature) =>
      apiRequest("POST", "/api/my-feature", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-feature"] });
      setOpen(false);
      form.reset();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/my-feature/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-feature"] });
    },
  });

  // Form setup
  const form = useForm<InsertMyFeature>({
    resolver: zodResolver(insertMyFeatureSchema),
    defaultValues: {},
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Feature</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="mt-4">
                  Create
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* List items */}
      <div className="space-y-2">
        {items?.map((item) => (
          <div key={item.id} className="flex justify-between p-4 border rounded">
            <span>{item.name}</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Step 6: Register Route in App.tsx
Edit `client/src/App.tsx`:

```typescript
import MyFeaturePage from "@/pages/{role}/my-feature";

// In Router function, add:
<Route path="/{role}/my-feature">
  {() => (
    <AppLayout role="{role}">
      <MyFeaturePage />
    </AppLayout>
  )}
</Route>
```

---

### 2. Modifying Existing Features

1. **Edit the database schema** if needed (`shared/schema.ts`)
2. **Run** `npm run db:push` to apply changes
3. **Update backend routes** in `server/routes.ts`
4. **Update storage methods** in `server/storage.ts`
5. **Update React pages** to use new fields
6. **Test in browser** - changes auto-reload via HMR

---

### 3. Working with Forms

Always use React Hook Form with Zod validation:

```typescript
const form = useForm<MyFormData>({
  resolver: zodResolver(myFormSchema),
  defaultValues: {
    name: "",
    email: "",
  },
});

return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name *</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit">Submit</Button>
    </form>
  </Form>
);
```

---

### 4. Working with Data Fetching

Use React Query for all server state:

```typescript
// Fetch
const { data, isLoading, error } = useQuery({
  queryKey: ["/api/items"],
  // queryFn defaults to GET request - no need to specify
});

// Create/Update/Delete
const mutation = useMutation({
  mutationFn: (newData) => apiRequest("POST", "/api/items", newData),
  onSuccess: () => {
    // Invalidate cache to refetch
    queryClient.invalidateQueries({ queryKey: ["/api/items"] });
  },
});
```

---

### 5. Styling Components

- Use Tailwind utility classes for styling
- Use shadcn/ui components for common UI elements
- Follow the design guidelines in `design_guidelines.md`
- Use CSS custom properties for colors (in `index.css`)

```typescript
// Good - using utility classes
<div className="flex items-center justify-between p-4 rounded-lg bg-card border">
  <span className="font-semibold text-foreground">{title}</span>
  <Button size="sm" variant="outline">Edit</Button>
</div>

// Good - using shadcn/ui components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

---

### 6. Adding Test IDs

Add `data-testid` to all interactive and display elements:

```typescript
// Interactive elements
<Button data-testid="button-submit">Submit</Button>
<Input data-testid="input-email" />
<Link data-testid="link-profile" href="/profile">Profile</Link>

// Display elements
<span data-testid="text-username">{user.name}</span>
<img data-testid="img-avatar" src={avatar} />
<div data-testid="status-active">Active</div>

// Dynamic elements
<div data-testid={`card-member-${memberId}`} />
<button data-testid={`button-delete-${itemId}`} />
```

---

## Common Tasks

### Debugging

1. **Check browser console** - Open DevTools (F12) > Console tab
2. **Check backend logs** - Look at server output in terminal
3. **Check database** - Run `npm run db:studio` to open Drizzle Studio

### Database Debugging

```bash
# View database visually
npm run db:studio

# Push schema changes
npm run db:push

# Force push if conflicts occur
npm run db:push --force
```

### Restarting Development

```bash
# Stop server (Ctrl+C)
# Clear node_modules if needed
rm -rf node_modules
npm install

# Restart
npm run dev
```

---

## Common Patterns

### CRUD Operations
All CRUD modules follow this pattern:
1. List page with table
2. Create dialog with form
3. Edit functionality (inline or modal)
4. Delete with confirmation dialog

### Data Protection
System-managed data (auto-generated expenses) is protected:
- Backend checks `isAutoGenerated` flag
- Frontend disables edit/delete buttons
- Only manual data can be modified

### Relationships
- Foreign keys cascade delete
- Linked data auto-populates (e.g., member name from member ID)
- Proper validation before deletion

---

## Best Practices

✅ **Do:**
- Use TypeScript for type safety
- Validate on both frontend and backend
- Use React Query for server state
- Use shadcn/ui components
- Add delete confirmations
- Test in both light and dark mode
- Add data-testid attributes
- Follow existing code patterns

❌ **Don't:**
- Use `fetch()` directly - use `apiRequest()` from queryClient
- Store sensitive data in localStorage
- Modify vite.config.ts or drizzle.config.ts
- Edit package.json without permission
- Create large monolithic files (split components)
- Use hardcoded colors (use design tokens)
- Skip validation (always validate)
- Leave console errors unaddressed

---

## Performance Tips

1. **Memoization** - Use `useMemo` for expensive calculations
2. **Lazy Loading** - Use React.lazy for page code-splitting
3. **Pagination** - Limit initial data load with pagination
4. **Caching** - React Query automatically caches queries
5. **Debouncing** - Debounce search/filter inputs

---

## Deployment

The application is ready for deployment to production:

```bash
# Build
npm run build

# This creates optimized bundles in dist/

# To publish (via Replit):
# Click "Publish" button in Replit UI
```

For production, consider:
- Using persistent PostgreSQL session store (not in-memory)
- Adding environment variables for sensitive config
- Setting up automated backups
- Implementing rate limiting
- Adding advanced error logging

---

## Support & Resources

- **TypeScript Docs**: https://www.typescriptlang.org/docs
- **React Docs**: https://react.dev
- **React Query Docs**: https://tanstack.com/query/latest
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Drizzle ORM**: https://orm.drizzle.team

---

**Last Updated**: November 21, 2025
