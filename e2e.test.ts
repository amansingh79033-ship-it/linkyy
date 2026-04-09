import { test, expect } from '@playwright/test';

test.describe('Linky Platform E2E - Desktop Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Clear local storage for a clean start
        await page.goto('http://localhost:3000');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('should complete the full user journey from landing to content generation', async ({ page }) => {
        // 1. Landing Page Rebranding Verification
        await expect(page.getByText('Linky', { exact: true }).first()).toBeVisible();
        await expect(page.getByText('A q-re-us-minds Dev')).toBeVisible();
        await expect(page.getByText('Made with pride in Bihar 🙏')).toBeVisible();

        // 2. Launch App -> Workroom
        await page.getByText('Launch App').click();
        await expect(page.getByText('Setup')).toBeVisible();

        // 3. Create Workroom
        await page.fill('input[placeholder="Enter your codename"]', 'tester');
        
        // Fill Passcode (SET)
        await page.fill('input[type="password"]', '1234');
        
        // Fill Passcode (CONFIRM)
        const confirmInputs = page.locator('div:has-text("CONFIRM PASSCODE") + div input');
        await confirmInputs.fill('1234');

        await page.getByRole('button', { name: 'INITIALIZE' }).click();

        // 4. Workspace Verification
        await expect(page.getByText('Master the Dwell Time Algorithm')).toBeVisible();

        // 5. Generate Post
        await page.fill('textarea', 'Why React is amazing in 2024');
        await page.getByRole('button', { name: 'Generate Content' }).click();
        
        // Wait for preview to appear
        await expect(page.getByText('Preview')).toBeVisible({ timeout: 30000 });
        await expect(page.getByText('Why React is amazing')).toBeVisible();

        // 6. Test History Persistence after reload
        await page.reload();
        
        // It should ask for passcode since we reloaded and session is now "Unlock" 
        await expect(page.getByText('Unlock')).toBeVisible();
        await page.fill('input[placeholder="Enter your codename"]', 'tester');
        
        await page.fill('input[type="password"]', '1234');
        await page.getByRole('button', { name: 'SECURE UNLOCK' }).click();

        // Check History Sidebar
        await page.getByRole('button', { name: 'History' }).click();
        await expect(page.getByText('Why React is amazing')).toBeVisible();
    });
});

test.describe('Linky Platform E2E - Mobile Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Clear local storage for a clean start
        await page.goto('http://localhost:3000');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('should be responsive on small mobile (375px width)', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('http://localhost:3000');
        
        // Check landing page elements are visible and properly sized
        await expect(page.getByText('Linky', { exact: true }).first()).toBeVisible();
        await expect(page.getByText('Launch App')).toBeVisible();
        
        // Verify button fits within screen
        const launchButton = await page.getByText('Launch App').boundingBox();
        expect(launchButton!.width).toBeLessThanOrEqual(375);
        
        // Navigate to workroom
        await page.getByText('Launch App').click();
        await expect(page.getByText('Setup')).toBeVisible();
        
        // Check workroom form elements
        await expect(page.locator('input[placeholder="Enter your codename"]')).toBeVisible();
        
        // Verify form buttons are accessible
        const createButton = await page.getByRole('button', { name: 'INITIALIZE' }).boundingBox();
        expect(createButton!.width).toBeLessThanOrEqual(375);
        expect(createButton!.height).toBeGreaterThanOrEqual(44); // Minimum touch target
    });

    test('should be responsive on medium mobile (414px width)', async ({ page }) => {
        await page.setViewportSize({ width: 414, height: 896 });
        await page.goto('http://localhost:3000');
        
        // Check landing page
        await expect(page.getByText('Architect Viral Growth')).toBeVisible();
        await expect(page.getByText('Launch App')).toBeVisible();
        
        // Navigate and test workroom
        await page.getByText('Launch App').click();
        await expect(page.getByText('Setup')).toBeVisible();
        
        // Test form submission flow
        await page.fill('input[placeholder="Enter your codename"]', 'mobiletest');
        await page.fill('input[type="password"]', '1234');
        await page.locator('div:has-text("CONFIRM PASSCODE") + div input').fill('1234');
        await page.getByRole('button', { name: 'INITIALIZE' }).click();
        
        // Verify workspace loads
        await expect(page.getByText('Master the Dwell Time Algorithm')).toBeVisible();
    });

    test('should handle mobile navigation and sidebar properly', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('http://localhost:3000');
        
        // Complete setup flow
        await page.getByText('Launch App').click();
        await page.fill('input[placeholder="Enter your codename"]', 'navtest');
        await page.fill('input[type="password"]', '1234');
        await page.locator('div:has-text("CONFIRM PASSCODE") + div input').fill('1234');
        await page.getByText('INITIALIZE').click();
        
        // Test mobile navigation elements
        await expect(page.locator('[title="History"]')).toBeVisible();
        await expect(page.locator('[title="Security Settings"]')).toBeVisible();
        
        // Open history sidebar
        await page.locator('[title="History"]').click();
        await expect(page.getByText('History')).toBeVisible();
        
        // Close sidebar by clicking backdrop
        await page.locator('.fixed.inset-0').first().click(); // Backdrop
        await expect(page.getByText('History')).not.toBeVisible();
    });

    test('should generate and display content properly on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12 Pro
        await page.goto('http://localhost:3000');
        
        // Setup workroom
        await page.getByText('Launch App').click();
        await page.fill('input[placeholder="Enter your codename"]', 'contenttest');
        await page.fill('input[type="password"]', '1234');
        await page.locator('div:has-text("CONFIRM PASSCODE") + div input').fill('1234');
        await page.getByText('INITIALIZE').click();
        
        // Generate post content
        await page.fill('textarea', 'Mobile testing is important');
        await page.getByText('Generate Content').click();
        
        // Wait for content generation
        await expect(page.getByText('Preview')).toBeVisible({ timeout: 30000 });
        await expect(page.getByText('Mobile testing is important')).toBeVisible();
        
        // Test carousel generation
        await page.getByText('Carousel').click();
        await page.fill('textarea', 'Mobile carousel test');
        await page.getByText('Generate Content').click();
        
        // Verify carousel preview loads
        await expect(page.getByText('Swipe through to see the breakdown')).toBeVisible();
    });

    test('should maintain proper touch targets and spacing on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('http://localhost:3000');
        
        // Check minimum touch target sizes
        await page.getByText('Launch App').click();
        
        // Verify input fields have proper height
        const inputField = await page.locator('input[placeholder="Enter your codename"]').boundingBox();
        expect(inputField!.height).toBeGreaterThanOrEqual(44);
        
        // Verify buttons have proper touch targets
        const buttons = await page.$$('button');
        for (const button of buttons) {
            const box = await button.boundingBox();
            if (box) {
                expect(box.height).toBeGreaterThanOrEqual(44);
                expect(box.width).toBeGreaterThanOrEqual(44);
            }
        }
        
        // Test form interaction
        await page.fill('input[placeholder="Enter your codename"]', 'touchtest');
        await page.fill('input[type="password"]', '1234');
        await page.locator('div:has-text("CONFIRM PASSCODE") + div input').fill('1234');
        
        // Verify all form elements are tappable
        await expect(page.getByText('INITIALIZE')).toBeEnabled();
    });
});

test.describe('Linky Platform E2E - Cross-device Compatibility', () => {
    test('should maintain consistent layout across different viewport sizes', async ({ page }) => {
        const viewports = [
            { width: 320, height: 568 }, // iPhone SE
            { width: 375, height: 812 }, // iPhone X
            { width: 414, height: 896 }, // iPhone 11 Pro Max
            { width: 768, height: 1024 }, // iPad
            { width: 1024, height: 1366 } // iPad Pro
        ];
        
        for (const viewport of viewports) {
            await page.setViewportSize(viewport);
            await page.goto('http://localhost:3000');
            
            // Basic layout checks for each viewport
            await expect(page.getByText('Linky', { exact: true }).first()).toBeVisible();
            await expect(page.getByText('Launch')).toBeVisible();
            
            // Check that content doesn't overflow horizontally
            const body = await page.$('body');
            const bodyBox = await body!.boundingBox();
            expect(bodyBox!.width).toBeLessThanOrEqual(viewport.width);
        }
    });

    test('should handle orientation changes gracefully', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('http://localhost:3000');
        
        // Test portrait mode
        await expect(page.getByText('Architect Viral Growth')).toBeVisible();
        
        // Switch to landscape
        await page.setViewportSize({ width: 812, height: 375 });
        await page.waitForTimeout(1000); // Allow for layout adjustment
        
        // Verify content still displays correctly
        await expect(page.getByText('Linky', { exact: true }).first()).toBeVisible();
        await expect(page.getByText('Launch')).toBeVisible();
        
        // Switch back to portrait
        await page.setViewportSize({ width: 375, height: 812 });
        await page.waitForTimeout(1000);
        await expect(page.getByText('Architect Viral Growth')).toBeVisible();
    });
});
