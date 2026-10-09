import { test, expect } from '@playwright/test';

test('el dashboard carga y permite navegar al login', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Gestión Hotelera' })).toBeVisible();

  // Scoped al header: el footer tiene otro link a /login ("Iniciar Sesión") y
  // getByRole matchea el nombre sin distinguir mayúsculas, así que sin el scope
  // el locator resuelve a 2 elementos y Playwright falla por strict mode.
  await page.getByRole('banner').getByRole('link', { name: 'Iniciar sesión' }).click();
  await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible();
});

test('el login valida los campos requeridos antes de llamar a la API', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  await expect(page.getByText('Completa usuario y contraseña.')).toBeVisible();
  // Seguimos en /login: no navegó, o sea que no se disparó un login "exitoso" falso.
  await expect(page).toHaveURL(/\/login$/);
});

// Regresión: .form-container tiene fondo oscuro pero no definía color, así que
// el texto que no era <label> quedaba negro sobre negro ("Confirmar reserva", Login...).
test('el texto de los formularios es claro sobre su fondo oscuro', async ({ page }) => {
  await page.goto('/login');
  const texto = page.locator('.form-container p').first();
  await expect(texto).toBeVisible();
  await expect(texto).toHaveCSS('color', 'rgb(255, 255, 255)');
});

test('una ruta protegida redirige a /login si no hay sesión iniciada', async ({ page }) => {
  await page.goto('/mis-reservas');
  await expect(page).toHaveURL(/\/login$/);
});

test('las páginas de gestión (admin) también redirigen a /login sin sesión', async ({ page }) => {
  for (const path of ['/servicios', '/empleados', '/provincias', '/ciudades', '/cupos', '/precios-servicio', '/reserva-servicios', '/usuarios']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
  }
});
