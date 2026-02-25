// @ts-check
import tseslint from 'typescript-eslint';

const tanstackRestriction = {
  paths: [
    {
      name: '@tanstack/react-query',
      importNames: ['useQuery', 'useMutation', 'useInfiniteQuery', 'useSuspenseQuery'],
      message: 'Use useApiQuery/useApiMutation wrappers instead of raw TanStack hooks.',
    },
  ],
};

export default tseslint.config(
  {
    ignores: ['build/**', 'node_modules/**', 'eslint.config.mjs'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-restricted-imports': ['error', tanstackRestriction],
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='confirm']",
          message: 'Use ConfirmDialog component for destructive/critical actions.',
        },
        {
          selector: "NewExpression[callee.name='Date']",
          message: 'Use @halaqa/shared date utilities instead of direct Date construction.',
        },
      ],
    },
  },
  {
    files: [
      'src/components/**/*.{ts,tsx}',
      'src/contexts/**/*.{ts,tsx}',
      'src/lib/**/*.{ts,tsx}',
      'src/services/**/*.{ts,tsx}',
      'src/hoc/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          ...tanstackRestriction,
          patterns: [
            {
              group: ['@/modules/*', '!@/modules/users'],
              message:
                'Shared layers (components/lib/services/contexts/hoc) must not import module internals directly.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/lib/hooks/useApiQuery.ts',
      'src/lib/hooks/useApiMutation.ts',
      'src/lib/query-client.ts',
      'src/main.tsx',
    ],
    rules: {
      'no-restricted-imports': 'off',
    },
  }
);
