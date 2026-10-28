import { test, expect } from '@playwright/test';

test('the dashboard loads and links to the login', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Gestión Hotelera' })).toBeVisible();
  await page.getByRole('banner').getByRole('link', { name: 'Iniciar sesión' }).click();
  await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible();
});

test('the login validates the required fields before calling the API', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page.getByText('Completá usuario y contraseña.')).toBeVisible();
  await expect(page.getByLabel('Usuario o Email')).toHaveAttribute('aria-invalid', 'true');
  await expect(page).toHaveURL(/\/login$/);
});

test('form text is light on its dark background', async ({ page }) => {
  await page.goto('/login');
  const text = page.locator('.form-container p').first();
  await expect(text).toBeVisible();
  await expect(text).toHaveCSS('color', 'rgb(255, 255, 255)');
});

test('a protected route redirects to /login without a session', async ({ page }) => {
  await page.goto('/my-reservations');
  await expect(page).toHaveURL(/\/login$/);
});

test('the management pages also redirect to /login without a session', async ({ page }) => {
  for (const path of ['/amenities', '/employees', '/provinces', '/cities', '/amenity-quotas', '/amenity-prices', '/reservation-amenities', '/pricing-rules', '/users']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
  }
});
