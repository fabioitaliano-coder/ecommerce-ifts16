# Migracion de la app a Sequelize ORM

Esta guia explica paso a paso como transformar esta API que originalmente trabajaba con datos en memoria hacia una version persistente usando Sequelize ORM y SQLite. La idea es que sirva como material de clase: cada paso indica qué problema resuelve, qué archivo conviene tocar y cuál es la referencia oficial para profundizar.

## 1. Entender el punto de partida

Antes de migrar, la app usaba un archivo `src/data/store.js` con arrays en memoria:

- `products`
- `clients`
- `discounts`
- `nextIds`

Eso permite enseñar CRUD rapido, pero tiene una limitacion central: cuando el proceso de Node se reinicia, los datos se pierden. ORM significa Object Relational Mapping: una capa que traduce objetos JavaScript a tablas relacionales.

Referencia completa:

- Sequelize Documentation, "Getting started", https://sequelize.org/docs/v6/getting-started/
- Sequelize Documentation, "Model Basics", https://sequelize.org/docs/v6/core-concepts/model-basics/

## 2. Instalar dependencias y preparar variables de entorno

Para una migracion pedagogica conviene SQLite porque guarda la base en un archivo local y no exige levantar otro servicio. Pero ademas conviene cargar la configuracion desde `.env`, asi los datos de entorno no quedan hardcodeados en el codigo.

Comando usado:

```bash
npm install sequelize sqlite3 dotenv
```

Archivos a preparar:

- `.env` para valores locales reales
- `.env.example` para compartir la estructura sin exponer datos sensibles
- `.gitignore` para evitar subir `.env` al repositorio

Referencias completas:

- Sequelize Documentation, "Dialect-Specific Things", https://sequelize.org/docs/v6/other-topics/dialect-specific-things/
- SQLite Home Page, https://www.sqlite.org/index.html
- dotenv on npm, https://www.npmjs.com/package/dotenv

## 3. Crear el archivo .env y definir la configuracion de base

En esta migracion la app toma los datos de la base desde variables de entorno.

Ejemplo de `.env`:

```env
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
DB_LOGGING=false
```

Qué significa cada variable:

- `DB_DIALECT`: motor usado por Sequelize. En este proyecto: `sqlite`.
- `DB_STORAGE`: ruta del archivo `.sqlite` que actuara como base.
- `DB_LOGGING`: si vale `true`, Sequelize muestra las consultas SQL en consola.

Dialectos habituales que Sequelize espera en `DB_DIALECT`:

- `sqlite` para SQLite
- `mysql` para MySQL
- `postgres` para PostgreSQL
- `mssql` para SQL Server

Ejemplos orientativos:

```env
# SQLite
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite

# MySQL
DB_DIALECT=mysql

# PostgreSQL
DB_DIALECT=postgres

# SQL Server
DB_DIALECT=mssql
```

Nota importante:

- para SQLite suele usarse `storage`
- para MySQL, PostgreSQL y SQL Server normalmente tambien se agregan variables como `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD`

Se crea un .env con la configuración de ejemplo, para que pueda subirse a Github `.env.example` con la misma estructura para que cualquier alumno pueda copiarlo:

```bash
copy .env.example .env
```

Referencia completa:

- dotenv on npm, https://www.npmjs.com/package/dotenv

## 4. Ignorar .env en Git

El archivo `.env` debe agregarse a `.gitignore` porque contiene configuracion local y, en proyectos reales, puede contener secretos.

Ejemplo:

```gitignore
.env
```

En este proyecto tambien se ignora `*.sqlite` para no mezclar datos locales con el codigo fuente.

Referencia completa:

- Git Documentation, "gitignore", https://git-scm.com/docs/gitignore

## 5. Crear la conexion central

Se agrego `src/config/database.js`.

Objetivo del archivo:

- Crear una instancia de `Sequelize`
- Leer variables desde `.env` con `dotenv`
- Configurar el dialecto usando `DB_DIALECT`
- Elegir el archivo de almacenamiento usando `DB_STORAGE`
- Activar o no logs SQL usando `DB_LOGGING`

En Sequelize, el nombre del dialecto no siempre coincide exactamente con el nombre comercial del motor:

- MySQL usa `mysql`
- PostgreSQL usa `postgres`
- SQL Server usa `mssql`
- SQLite usa `sqlite`

Idea clave:

```js
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: process.env.DB_STORAGE || './database.sqlite',
  logging: process.env.DB_LOGGING === 'true'
});
```

Referencia completa:

- Sequelize Documentation, "Connecting to a database", https://sequelize.org/docs/v6/getting-started/
- dotenv on npm, https://www.npmjs.com/package/dotenv

## 6. Reemplazar clases simples por modelos Sequelize

Se rehicieron estos archivos:

- `src/models/Product.js`
- `src/models/Client.js`
- `src/models/Discount.js`
- `src/models/Category.js`

Cada modelo ahora define:

- nombre de tabla
- campos
- tipos de datos
- validaciones
- claves primarias
- restricciones de unicidad

Ejemplos concretos de decisiones:

- `Client.email` es `unique` e `isEmail`
- `Discount.percent` tiene rango entre 0 y 100
- `Product.stock` no puede ser negativo
- `Category.name` es obligatorio y unico

Referencia completa:

- Sequelize Documentation, "Model Basics", https://sequelize.org/docs/v6/core-concepts/model-basics/
- Sequelize Documentation, "Validations and Constraints", https://sequelize.org/docs/v6/core-concepts/validations-and-constraints/

## 7. Crear la tabla categories y relacionarla con products

Este era el cambio estructural principal pedido.

Se agrego el modelo `Category` y se definio una relacion 1:N:

- una categoria tiene muchos productos
- un producto pertenece a una categoria

En `src/models/index.js` quedaron las asociaciones:

```js
Category.hasMany(Product, {
  foreignKey: 'categoryId',
  as: 'products'
});

Product.belongsTo(Category, {
  foreignKey: 'categoryId',
  as: 'category'
});
```

Traduccion conceptual:

- `categoryId` es la clave foranea en `products`
- `include` permite traer producto + categoria en una misma consulta

Referencias completas:

- Sequelize Documentation, "Associations", https://sequelize.org/docs/v6/core-concepts/assocs/
- Sequelize Documentation, "Eager Loading", https://sequelize.org/docs/v6/advanced-association-concepts/eager-loading/

## 8. Centralizar modelos y semilla inicial

Tambien se agrego `src/models/index.js`.

Ese archivo hace tres cosas:

1. importa todos los modelos
2. define asociaciones
3. inicializa la base con `sequelize.sync()`

Ademas incorpora un `seedDatabase()` para dejar datos iniciales si la base esta vacia. Esto es importante en contexto docente porque al arrancar ya existen:

- categorias
- productos
- un cliente
- un descuento

Asi los alumnos pueden probar endpoints desde Postman o Insomnia sin tener que cargar todo desde cero.

Referencia completa:

- Sequelize Documentation, "Model Synchronization", https://sequelize.org/docs/v6/core-concepts/model-basics/#model-synchronization

## 9. Cambiar controladores para usar consultas ORM

Se migraron estos controladores:

- `src/controllers/productsController.js`
- `src/controllers/clientsController.js`
- `src/controllers/discountsController.js`
- `src/controllers/checkoutController.js`
- `src/controllers/categoriesController.js`

Patron general del cambio:

- antes: `store.products.find(...)`
- ahora: `Product.findByPk(...)`

- antes: `store.products.push(...)`
- ahora: `Product.create(...)`

- antes: actualizar objeto en memoria
- ahora: cambiar atributos y luego `await model.save()`

- antes: `splice(...)`
- ahora: `await model.destroy()`

Metodos ORM importantes usados en la migracion:

- `findAll`
- `findByPk`
- `findOne`
- `create`
- `save`
- `destroy`
- `count`
- `bulkCreate`

Referencia completa:

- Sequelize Documentation, "Model Querying - Finders", https://sequelize.org/docs/v6/core-concepts/model-querying-finders/
- Sequelize Documentation, "Simple INSERT queries", https://sequelize.org/docs/v6/core-concepts/model-querying-basics/

## 10. Validar la relacion antes de crear o actualizar productos

En productos aparece una regla nueva:

- si `categoryId` no existe, la API responde error

Esto se resolvio buscando la categoria antes de crear o actualizar:

```js
const category = await Category.findByPk(categoryId);
if (!category) {
  return res.status(400).json({ error: 'Categoria invalida' });
}
```

Pedagogicamente este paso es importante porque muestra que:

- una clave foranea no es solo un numero
- debe representar una fila valida en otra tabla

Referencia completa:

- Sequelize Documentation, "Associations", https://sequelize.org/docs/v6/core-concepts/assocs/

## 11. Agregar CRUD de categorias

Se agregaron:

- `src/controllers/categoriesController.js`
- `src/routes/categories.js`

Y en `server.js` se registro:

```js
app.use('/api/categorias', categoriesRouter);
```

Tambien se agrego una regla de integridad simple:

- no se puede borrar una categoria que todavia tenga productos asociados

Eso ayuda a explicar integridad referencial incluso antes de estudiar borrados en cascada.

Referencia completa:

- Sequelize Documentation, "Constraints & Circularities", https://sequelize.org/docs/v6/other-topics/constraints-and-circularities/

## 12. Adaptar checkout para trabajar contra la base real

Antes, checkout calculaba total y descontaba stock leyendo arrays en memoria.

Ahora `src/models/Checkout.js`:

- busca productos con `Product.findByPk`
- busca descuentos con `Discount.findOne`
- descuenta stock guardando cambios reales en la base

Ademas el commit de compra usa transacciones:

```js
return sequelize.transaction(async transaction => {
  // cambios de stock
});
```

Por qué importa:

- si algo falla en medio del proceso, se revierten los cambios
- evita dejar stock parcialmente actualizado

Referencia completa:

- Sequelize Documentation, "Transactions", https://sequelize.org/docs/v6/other-topics/transactions/

## 13. Inicializar la base antes de levantar el servidor

`server.js` ya no llama `app.listen(...)` directamente.

Ahora el flujo es:

1. `initializeDatabase()`
2. `sequelize.sync()`
3. `seedDatabase()`
4. `app.listen(...)`

Eso evita que el servidor reciba pedidos cuando las tablas todavia no existen.

Referencia completa:

- Sequelize Documentation, "Model Synchronization", https://sequelize.org/docs/v6/core-concepts/model-basics/#model-synchronization

## 14. Manejar errores async y errores de Sequelize

En Express 4, las funciones `async` necesitan una ayuda extra para propagar errores. Por eso se agrego:

- `src/utils/asyncHandler.js`

Ese wrapper encapsula cada ruta:

```js
router.get('/', asyncHandler(controller.getAll));
```

Ademas `server.js` ahora tiene un middleware final que traduce errores de Sequelize a respuestas HTTP claras:

- `400` para validaciones
- `409` para unicidad
- `500` para errores no previstos

Referencias completas:

- Express Documentation, "Error Handling", https://expressjs.com/en/guide/error-handling.html
- Sequelize Documentation, "Validations and Constraints", https://sequelize.org/docs/v6/core-concepts/validations-and-constraints/

## 15. Endpoints nuevos y cambios en payloads

### Categorias

- `GET /api/categorias`
- `GET /api/categorias/:id`
- `POST /api/categorias`
- `PUT /api/categorias/:id`
- `DELETE /api/categorias/:id`

Ejemplo de alta:

```json
{
  "name": "Calzado",
  "description": "Zapatillas, botas y sandalias"
}
```

### Productos

Ahora `POST /api/productos` y `PUT /api/productos/:id` deben incluir `categoryId`.

Ejemplo:

```json
{
  "name": "Zapatilla urbana",
  "price": 59.9,
  "stock": 12,
  "categoryId": 3
}
```

## 16. Orden recomendado para replicarlo desde cero

Si un alumno quisiera rehacer toda la migracion por su cuenta, el orden recomendado es este:

1. Instalar `sequelize`, `sqlite3` y `dotenv`
2. Crear `.env.example`
3. Crear `.env` local
4. Agregar `.env` a `.gitignore`
5. Crear `src/config/database.js`
6. Redefinir modelos con `sequelize.define(...)`
7. Crear `Category`
8. Agregar `categoryId` a `Product`
9. Declarar asociaciones en `src/models/index.js`
10. Reemplazar el acceso al `store` por consultas ORM en controladores
11. Agregar `categoriesController` y `categories` router
12. Adaptar checkout
13. Incorporar `asyncHandler`
14. Agregar middleware global de errores
15. Inicializar base con `initializeDatabase()`
16. Probar endpoints

## 17. Qué conceptos de backend enseña esta migracion

Esta migracion es util para mostrar en clase, paso a paso:

- diferencia entre persistencia en memoria y persistencia real
- configuracion por variables de entorno
- definicion de modelos
- validaciones
- relaciones entre tablas
- claves foraneas
- CRUD con ORM
- consultas con `include`
- transacciones
- manejo de errores async

## 18. Resumen final

El resultado de la migracion es una API que:

- persiste datos en `database.sqlite`
- usa Sequelize en lugar de arrays en memoria
- toma la configuracion de base desde `.env`
- incluye `.env.example` para replicar la configuracion
- incorpora una tabla `categories`
- relaciona categorias con productos
- mantiene comentarios pedagógicos en el codigo
- ofrece una base mejor para seguir enseñando validaciones, asociaciones y transacciones

Si se quiere extender el ejercicio, un siguiente paso razonable seria agregar una tabla `orders` y otra `order_items` para que checkout tambien quede persistido en la base.
