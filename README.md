# E-Commerce IFTS 16

Proyecto de ejemplo para la clase 6 de PP2.

El objetivo de este repositorio es practicar:

- arquitectura RESTful
- estructura MVC
- separación de responsabilidades
- uso básico de Git y GitHub

## Tecnologías

- Node.js
- Express
- JavaScript

## Clonar el proyecto

Para descargar este repositorio en tu computadora:

```bash
git clone https://github.com/fabioitaliano-coder/ecommerce-ifts16.git
```

Luego entrá a la carpeta del proyecto:

```bash
cd ecommerce-ifts16
```

## Instalar dependencias

Este proyecto usa Node.js y Express.

Instalá las dependencias con:

```bash
npm install
```

## Ejecutar el proyecto

Para levantar el servidor:

```bash
npm start
```

Si todo sale bien, vas a ver el servidor corriendo en:

```text
http://localhost:3080
```

## Qué probar primero

1. Abrí en el navegador:
`http://localhost:3080`

2. Probá la ruta base de la API:
`http://localhost:3080/api`

3. Probá listar productos:
`http://localhost:3080/api/productos`

## Estructura del proyecto

```text
/public
/src
  /controllers
  /routes
  /models
  /data
server.js
README.md
```

## Cómo leer el proyecto

Si querés entender el flujo de una petición como:

```text
GET /api/productos
```

mirá los archivos en este orden:

1. `server.js`
2. `src/routes/products.js`
3. `src/controllers/productsController.js`
4. `src/data/store.js`

### Qué hace cada parte

- `server.js`
Recibe la petición y la deriva al router correcto.

- `src/routes/products.js`
Define qué función se ejecuta según la URL y el método HTTP.

- `src/controllers/productsController.js`
Contiene la lógica de negocio.

- `src/data/store.js`
Guarda los datos en memoria para este ejemplo.

## Endpoints principales

- `GET /api/productos`
- `GET /api/productos/:id`
- `POST /api/productos`
- `PUT /api/productos/:id`
- `DELETE /api/productos/:id`
- `GET /api/clientes`
- `GET /api/clientes/:id`
- `POST /api/clientes`
- `PUT /api/clientes/:id`
- `DELETE /api/clientes/:id`
- `GET /api/descuentos`
- `GET /api/descuentos/:id`
- `POST /api/descuentos`
- `PUT /api/descuentos/:id`
- `DELETE /api/descuentos/:id`
- `POST /api/checkout`

## Datos de ejemplo

Los datos están hardcodeados en:

`src/data/store.js`

Esto se hizo así para que el ejemplo sea más simple para alumnos iniciales.

## Flujo MVC explicado de forma simple

- Router = recibe el pedido
- Controller = resuelve la lógica
- Data = devuelve la información
- Server = conecta todo

## Comandos básicos de Git

Ver estado del proyecto:

```bash
git status
```

Agregar cambios:

```bash
git add .
```

Crear un commit:

```bash
git commit -m "Mi avance"
```

Subir cambios a GitHub:

```bash
git push
```

Traer cambios del repositorio remoto:

```bash
git pull
```

## Si querés subir tu propia versión a GitHub

1. Creá un repositorio nuevo en GitHub.
2. Configurá el remoto:

```bash
git remote set-url origin TU_URL_DEL_REPO
```

3. Subí los cambios:

```bash
git push -u origin main
```

## Integrantes

- Fabio Italiano
