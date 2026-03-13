import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./vitest.setup.ts'],
        exclude: ['node_modules/**', 'e2e/**'],
        alias: {
            '@': path.resolve(__dirname, './'),
            'next/font/google': path.resolve(__dirname, './__mocks__/next-font.ts'),
            'next/font/local': path.resolve(__dirname, './__mocks__/next-font.ts'),
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            reportsDirectory: './coverage',
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 75,
                statements: 80,
            },
            exclude: [
                'node_modules/**',
                'coverage/**',
                '**/*.d.ts',
                '**/*.config.*',
                'vitest.setup.ts',
                'prisma/**',
                '.next/**',
                'e2e/**',
                'components/ui/**',
                'scripts/**',
            ],
        },
    },
})
