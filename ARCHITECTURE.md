# Halaqa Management System - Architecture Documentation

## Overview

This project follows a **Model-View-ViewModel (MVVM)** architecture with a modular structure for better code organization, maintainability, and scalability.

## Project Structure

```
src/
├── types/                      # TypeScript types and interfaces
│   ├── user.types.ts
│   ├── student.types.ts
│   ├── group.types.ts
│   ├── session.types.ts
│   ├── attendance.types.ts
│   ├── common.types.ts
│   └── index.ts
│
├── services/                   # Shared services
│   ├── api-client.ts          # Axios HTTP client
│   ├── storage.service.ts     # LocalStorage service
│   └── index.ts
│
├── modules/                    # Feature modules (MVVM)
│   ├── auth/
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   ├── viewmodels/
│   │   │   └── auth.viewmodel.ts
│   │   ├── views/
│   │   │   └── LoginView.tsx
│   │   └── index.ts
│   │
│   ├── dashboard/
│   │   ├── services/
│   │   ├── viewmodels/
│   │   ├── views/
│   │   └── index.ts
│   │
│   ├── groups/
│   │   ├── services/
│   │   ├── viewmodels/
│   │   ├── views/
│   │   └── index.ts
│   │
│   └── [other modules...]
│
├── components/                 # Shared UI components
│   ├── ui/                    # shadcn/ui components
│   ├── Layout.tsx
│   └── [other shared components]
│
├── contexts/                   # React contexts
│   └── ThemeContext.tsx
│
├── lib/                        # Utilities and helpers
│   └── mockData.ts
│
├── styles/                     # Global styles
│   └── globals.css
│
└── App.tsx                     # Application entry point
```

## Architecture Patterns

### MVVM (Model-View-ViewModel)

Each feature module follows the MVVM pattern:

#### 1. **Model** (Types + Services)

- **Types**: Define data structures using Zod schemas for validation
- **Services**: Handle API calls and business logic
- Located in: `types/` and `modules/[feature]/services/`

```typescript
// Example: types/user.types.ts
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: UserRoleSchema
});

export type User = z.infer<typeof UserSchema>;

// Example: modules/auth/services/auth.service.ts
export class AuthService {
  async login(credentials: LoginCredentials) {
    return apiClient.post('/auth/login', credentials);
  }
}
```

#### 2. **View** (React Components)

- Pure presentational components
- Receive props from ViewModels
- Located in: `modules/[feature]/views/`

```typescript
// Example: modules/auth/views/LoginView.tsx
export const LoginView = ({ onLoginSuccess }: LoginViewProps) => {
  const { isLoading, error, login } = useAuthViewModel();

  // JSX rendering...
};
```

#### 3. **ViewModel** (Custom Hooks)

- Manage component state
- Handle user interactions
- Call service methods
- Located in: `modules/[feature]/viewmodels/`

```typescript
// Example: modules/auth/viewmodels/auth.viewmodel.ts
export const useAuthViewModel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    const response = await authService.login(credentials);
    setIsLoading(false);
    return response;
  };

  return { isLoading, error, login };
};
```

## Module Structure

Each module is self-contained with:

```
module/
├── services/         # API calls and business logic
├── viewmodels/       # State management and user interactions
├── views/            # UI components
└── index.ts          # Public exports
```

### Example Module: Groups

```
groups/
├── services/
│   └── group.service.ts       # getAllGroups, createGroup, etc.
├── viewmodels/
│   ├── groups.viewmodel.ts    # useGroupsViewModel
│   └── group-details.viewmodel.ts
├── views/
│   ├── GroupsView.tsx         # List view
│   └── GroupDetailsView.tsx   # Detail view
└── index.ts                   # Export public API
```

## Key Technologies

### Dependencies

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Zod**: Runtime type validation
- **Axios**: HTTP client
- **React Query (@tanstack/react-query)**: Server state management
- **Zustand**: Client state management
- **React Router**: Navigation
- **shadcn/ui**: UI components
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **Sonner**: Toast notifications

### Dev Dependencies

- **Vite**: Build tool
- **TypeScript**: Type checking
- **Tailwind CSS**: Styling
- **PostCSS & Autoprefixer**: CSS processing

## Path Aliases

Configure in `tsconfig.json` and `vite.config.ts`:

```typescript
{
  "@/*": ["./src/*"],
  "@halaqa/shared": ["./src/types"],
  "@/services": ["./src/services"],
  "@/modules/*": ["./src/modules/*"],
  "@/components/*": ["./src/components/*"]
}
```

## Best Practices

### 1. Type Safety

- Use Zod schemas for all data types
- Leverage TypeScript's type inference
- Validate data at boundaries (API, forms)

### 2. Separation of Concerns

- **Services**: Only API calls and data transformation
- **ViewModels**: Only state and interaction logic
- **Views**: Only presentation and UI

### 3. Code Reusability

- Share services across modules
- Create reusable UI components
- Extract common logic into utilities

### 4. Error Handling

- Centralized error handling in API client
- User-friendly error messages
- Toast notifications for feedback

### 5. Loading States

- Show loading indicators during async operations
- Disable actions while loading
- Handle loading states consistently

## Migration Strategy

The project is being migrated from the old structure to MVVM:

### Completed Modules ✅

- Auth (Login)
- Dashboard
- Groups

### To Be Migrated 🚧

- Sessions
- Attendance
- Reports
- Users

### Legacy Components (Temporary)

Located in `components/` - will be moved to modules progressively.

## Running the Project

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build for production
npm run build

# Type check
npm run lint
```

## Future Enhancements

1. **State Management**: Integrate React Query for caching
2. **Testing**: Add unit and integration tests
3. **API Integration**: Replace mock data with real API
4. **Authentication**: JWT token refresh mechanism
5. **Permissions**: Role-based access control
6. **Internationalization**: Multi-language support
7. **PWA**: Offline support
8. **Performance**: Code splitting and lazy loading
