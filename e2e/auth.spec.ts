import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
    test('shows login form on first visit', async ({ page }) => {
        await page.goto('/')
        await expect(page.getByRole('heading', { name: 'MyDay' })).toBeVisible()
        await expect(page.getByPlaceholder('username')).toBeVisible()
    })

    test('shows error on invalid credentials', async ({ page }) => {
        await page.goto('/')
        await page.fill('[placeholder="username"]', 'wronguser')
        await page.fill('[placeholder="••••••••"]', 'wrongpass')
        await page.click('button[type="submit"]')
        await expect(page.getByText(/invalid username or password/i)).toBeVisible()
    })

    test('navigates to signup form', async ({ page }) => {
        await page.goto('/')
        await page.click('text=Don\'t have an account? Sign up')
        await expect(page.getByText(/create your account/i)).toBeVisible()
    })
})
