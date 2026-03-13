import { test, expect } from '@playwright/test'

// Helper to log in via API and set localStorage
async function loginAs(page: any, username: string, password: string) {
    const res = await page.request.post('/api/auth/login', {
        data: { username, password }
    })
    const { token, user } = await res.json()
    await page.goto('/')
    await page.evaluate(({ token, user }: any) => {
        localStorage.setItem('myday_session_token', token)
        const store = JSON.parse(localStorage.getItem('myday-storage') || '{}')
        store.state = { ...store.state, sessionUser: user, token, viewedUserId: user.id }
        localStorage.setItem('myday-storage', JSON.stringify(store))
    }, { token, user })
    await page.goto('/')
}

test.describe('Items', () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, 'amine', 'password123')
    })

    test('shows dashboard after login', async ({ page }) => {
        await expect(page.getByRole('main')).toBeVisible()
        await expect(page.getByRole('navigation', { name: 'Calendar' })).toBeVisible()
    })

    test('opens Add to MyDay sheet', async ({ page }) => {
        await page.click('text=Add to MyDay')
        await expect(page.getByRole('dialog')).toBeVisible()
    })

    test('closes sheet on Cancel', async ({ page }) => {
        await page.click('text=Add to MyDay')
        await expect(page.getByRole('dialog')).toBeVisible()
        await page.click('text=Cancel')
        await expect(page.getByRole('dialog')).not.toBeVisible()
    })
})
