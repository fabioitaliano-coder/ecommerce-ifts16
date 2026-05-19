# Operaciones sobre datos: consultar, modificar y borrar

Esta guía explica cómo trabajar con los datos persistidos de la app una vez creada la base SQLite. El foco está puesto en tres tareas frecuentes:

- consultar datos
- insertar o modificar datos
- borrar datos

Además incluye una opción práctica para hacerlo desde VS Code.

## 1. Qué base usa este proyecto

Por defecto la app lee estas variables desde `.env`:

```env
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
```

Eso significa que:

- el motor es SQLite
- la base vive en el archivo `database.sqlite` en la raíz del proyecto

## 2. Qué tablas existen

En el estado actual del proyecto, las tablas principales son:

- `categories`
- `products`
- `clients`
- `discounts`

Relación importante:

- `products.categoryId` apunta a `categories.id`

## 3. Formas de trabajar con la base

Hay dos enfoques válidos:

1. usar la API de la app con Postman o frontend
2. abrir la base directamente y ejecutar consultas SQL

Cuándo conviene cada una:

- API: cuando querés probar el comportamiento real del backend, validaciones y respuestas HTTP
- SQL directo: cuando querés inspeccionar rápido la base, corregir un dato, cargar ejemplos o auditar tablas

## 4. Consultar datos con SQL

### Ver todas las categorías

```sql
SELECT * FROM categories;
```

### Ver todos los productos

```sql
SELECT * FROM products;
```

### Ver productos con su categoría

```sql
SELECT
  p.id,
  p.name,
  p.price,
  p.stock,
  c.name AS category
FROM products p
JOIN categories c ON c.id = p.categoryId
ORDER BY p.id;
```

### Ver clientes

```sql
SELECT * FROM clients;
```

### Ver descuentos

```sql
SELECT * FROM discounts;
```

## 5. Insertar datos de ejemplo

### Insertar una categoría

```sql
INSERT INTO categories (name, description, createdAt, updatedAt)
VALUES ('Calzado', 'Zapatillas, botas y sandalias', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

### Insertar un producto asociado a una categoría

Antes, averiguá el `id` de la categoría:

```sql
SELECT * FROM categories;
```

Luego:

```sql
INSERT INTO products (name, price, stock, categoryId, createdAt, updatedAt)
VALUES ('Zapatilla urbana', 59.9, 12, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

### Insertar un cliente

```sql
INSERT INTO clients (name, email, createdAt, updatedAt)
VALUES ('Ana Lopez', 'ana@example.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

### Insertar un descuento

```sql
INSERT INTO discounts (code, percent, minTotal, createdAt, updatedAt)
VALUES ('BIENVENIDA15', 15, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

## 6. Modificar datos

### Cambiar el precio de un producto

```sql
UPDATE products
SET price = 64.9,
    updatedAt = CURRENT_TIMESTAMP
WHERE id = 1;
```

### Cambiar el stock

```sql
UPDATE products
SET stock = 20,
    updatedAt = CURRENT_TIMESTAMP
WHERE id = 2;
```

### Cambiar la categoría de un producto

```sql
UPDATE products
SET categoryId = 3,
    updatedAt = CURRENT_TIMESTAMP
WHERE id = 2;
```

### Modificar el email de un cliente

```sql
UPDATE clients
SET email = 'ana.lopez@example.com',
    updatedAt = CURRENT_TIMESTAMP
WHERE id = 2;
```

## 7. Borrar datos

### Borrar un descuento

```sql
DELETE FROM discounts
WHERE id = 2;
```

### Borrar un cliente

```sql
DELETE FROM clients
WHERE id = 2;
```

### Borrar un producto

```sql
DELETE FROM products
WHERE id = 3;
```

### Atención con categorías

Antes de borrar una categoría, revisá si todavía tiene productos relacionados:

```sql
SELECT * FROM products
WHERE categoryId = 1;
```

Si existen productos, primero:

- los movés a otra categoría, o
- los borrás

Luego sí:

```sql
DELETE FROM categories
WHERE id = 1;
```

## 8. Consultas útiles para control rápido

### Contar productos por categoría

```sql
SELECT
  c.name,
  COUNT(p.id) AS total_products
FROM categories c
LEFT JOIN products p ON p.categoryId = c.id
GROUP BY c.id, c.name
ORDER BY c.name;
```

### Ver productos sin stock

```sql
SELECT * FROM products
WHERE stock <= 0;
```

### Ver descuentos ordenados por porcentaje

```sql
SELECT * FROM discounts
ORDER BY percent DESC;
```

## 9. Cómo hacerlo desde VS Code

Sí. Para este proyecto conviene usar la extensión `SQLite` para VS Code.

Marketplace:

- `SQLite` para VS Code: https://marketplace.visualstudio.com/items?itemName=alexcvzz.vscode-sqlite

### Qué permite hacer

Con esta extensión podés:

- abrir el archivo `database.sqlite`
- explorar tablas
- ejecutar consultas SQL
- inspeccionar filas y resultados

### Prerrequisito importante: `sqlite3` CLI

Aunque la extensión puede funcionar con binarios incluidos en algunos entornos, para clase conviene asumir como prerrequisito tener instalado el cliente de línea de comandos `sqlite3`.

Eso sirve para:

- usar la base también desde terminal
- evitar problemas si la extensión no encuentra su binario interno
- poder configurar explícitamente la ruta del ejecutable si hiciera falta

Nombre del comando:

- en Linux y macOS: `sqlite3`
- en Windows: `sqlite3.exe`

### Cómo instalar `sqlite3` CLI

#### Windows

Opción recomendada:

1. ir a la página oficial de descargas de SQLite
2. descargar el paquete de herramientas de línea de comandos para Windows
3. descomprimirlo
4. ubicar `sqlite3.exe`
5. agregar esa carpeta al `PATH`

Alternativa común en equipos de desarrollo:

- instalarlo con Chocolatey desde PowerShell

```powershell
choco install sqlite --yes
```

Aclaración importante:

- en muchos equipos Windows conviene abrir PowerShell como Administrador para que la instalación con Chocolatey tenga permisos suficientes
- después de instalar, puede hacer falta cerrar y volver a abrir VS Code o la terminal para que el `PATH` se refresque

Si no tenés Chocolatey, la alternativa nativa habitual en Windows es `winget`:

```powershell
winget install -e --id SQLite.SQLite
```

Notas:

- `winget` es el Windows Package Manager y suele venir disponible en Windows 10/11 actuales
- si `winget` no existe, revisar que esté instalado `App Installer`
- después de instalar, también puede hacer falta reabrir la terminal o VS Code

Luego comprobar:

```powershell
sqlite3 --version
```

#### Ubuntu o Debian

```bash
sudo apt update
sudo apt install sqlite3
```

Luego comprobar:

```bash
sqlite3 --version
```

#### macOS

En muchos casos ya viene instalado. Si no estuviera, o si querés instalarlo por Homebrew:

```bash
brew install sqlite
```

Luego comprobar:

```bash
sqlite3 --version
```

### Cómo usar la extensión en VS Code

1. instalar la extensión `SQLite`
2. abrir el proyecto en VS Code
3. abrir el archivo `database.sqlite`
4. usar el panel o los comandos de la extensión para explorar tablas y ejecutar SQL

### Si la extensión no encuentra `sqlite3`

Revisar:

- que `sqlite3 --version` funcione en la terminal integrada de VS Code
- que el `PATH` del sistema incluya la carpeta del ejecutable
- que, si hace falta, se configure la ruta del ejecutable en la setting `sqlite.sqlite3`

## 10. Recomendación práctica para esta materia

Para estudiantes que recién empiezan:

- usar Postman para probar la API
- usar la extensión `SQLite` en VS Code para mirar la base visualmente

Esa combinación deja ver dos planos distintos:

- el plano HTTP de la app
- el plano físico de la base real

## 11. Cómo no trabajar los datos

Evitar estas prácticas:

- editar el archivo `.sqlite` a mano como si fuera texto
- borrar filas sin revisar relaciones
- cambiar `id` manualmente sin necesidad
- usar SQL directo sin entender antes qué hace la API
- mezclar datos de prueba y datos reales sin criterio

## 12. Flujo sugerido para una corrección o demo

1. consultar el estado actual con `SELECT`
2. insertar o actualizar un dato
3. volver a consultar para verificar
4. probar el endpoint correspondiente en la API
5. si hace falta, deshacer el cambio con otro `UPDATE` o `DELETE`

## 13. Resumen

En este proyecto podés trabajar los datos de dos maneras:

- desde la API, para validar comportamiento funcional
- desde SQLite, para inspección y mantenimiento

Para clase, lo más cómodo suele ser:

- Postman o frontend para el flujo de negocio
- VS Code con una extensión SQLite para ver la persistencia real
