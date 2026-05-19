# Guia de `async/await`

Esta guia explica qué es `async/await`, por qué existe, cómo se usa en JavaScript y Node.js, qué problemas resuelve, qué casos borde hay que conocer y cómo manejar errores correctamente con `try/catch`.

La idea no es solo aprender la sintaxis, sino entender el modelo mental correcto:

- `async/await` no vuelve síncrono a JavaScript
- `async/await` no bloquea mágicamente el programa completo
- `await` solo espera Promesas
- los errores async no se manejan igual que los errores puramente síncronos

## 1. El problema que viene a resolver

Muchas tareas de backend tardan un tiempo en completarse:

- leer una base de datos
- consultar una API externa
- guardar un archivo
- esperar una transacción

Si JavaScript se frenara hasta terminar cada una de esas tareas, el servidor respondería mal y perdería escalabilidad. Por eso Node trabaja de forma asíncrona.

Antes de `async/await`, esto se resolvía sobre todo con:

- callbacks
- Promesas con `.then()` y `.catch()`

Ejemplo con callback:

```js
fs.readFile('archivo.txt', 'utf8', (error, contenido) => {
  if (error) {
    console.error(error);
    return;
  }

  console.log(contenido);
});
```

Ejemplo con Promesa:

```js
leerArchivo()
  .then(contenido => {
    console.log(contenido);
  })
  .catch(error => {
    console.error(error);
  });
```

Eso funciona, pero cuando la lógica crece puede empezar a leerse peor. `async/await` mejora esa legibilidad.

## 2. Qué es una Promesa

Para entender `async/await`, primero hay que entender que trabaja arriba de Promesas.

Una Promesa es un objeto que representa el resultado futuro de una operación asíncrona. Puede estar en alguno de estos estados:

- `pending`: todavía no terminó
- `fulfilled`: terminó bien
- `rejected`: terminó con error

Ejemplo:

```js
const promesa = Product.findByPk(1);
```

Cuando Sequelize ejecuta `findByPk(1)`, no devuelve inmediatamente el producto: devuelve una Promesa que más adelante tendrá:

- el producto encontrado, o
- un error

## 3. Qué hace `async`

Cuando una función se declara con `async`, JavaScript garantiza que esa función va a devolver una Promesa.

Ejemplo:

```js
async function saludar() {
  return 'hola';
}
```

Aunque parezca que devuelve un string, en realidad devuelve una Promesa resuelta con `'hola'`.

Equivalente conceptual:

```js
function saludar() {
  return Promise.resolve('hola');
}
```

Entonces:

```js
const resultado = saludar();
```

`resultado` no vale `'hola'`, sino una Promesa.

## 4. Qué hace `await`

`await` solo puede usarse dentro de una función `async` o en algunos contextos especiales de módulos modernos.

`await` le dice a JavaScript:

"esperá el resultado de esta Promesa antes de seguir con la próxima línea"

Ejemplo:

```js
async function ejemplo() {
  const producto = await Product.findByPk(1);
  console.log(producto);
}
```

Acá:

1. `Product.findByPk(1)` devuelve una Promesa
2. `await` pausa esa función puntual
3. cuando la Promesa se resuelve, `producto` recibe el valor real
4. la función sigue

Punto importante:

- se pausa esa función
- no se "congela" todo Node.js

Node puede seguir atendiendo otras tareas mientras espera.

## 5. Ejemplo básico comparando estilos

### Con `.then()`

```js
Product.findByPk(1)
  .then(product => {
    console.log(product);
  })
  .catch(error => {
    console.error(error);
  });
```

### Con `async/await`

```js
async function buscarProducto() {
  try {
    const product = await Product.findByPk(1);
    console.log(product);
  } catch (error) {
    console.error(error);
  }
}
```

Ambos estilos son válidos. `async/await` suele ser más claro cuando hay varios pasos encadenados.

## 6. Cómo se usa en esta app

En este proyecto aparece, por ejemplo, en `src/controllers/checkoutController.js`:

```js
async create(req, res) {
  try {
    const { clientId, items, discountCode } = req.body;
    const client = await Client.findByPk(clientId);

    if (!client) {
      return res.status(400).json({ error: 'Cliente inválido' });
    }

    const subtotal = await calculateCartTotal(items);
    const discountResult = await applyDiscount(subtotal, discountCode);

    await commitPurchase(items);

    return res.status(201).json({ order: { subtotal, total: discountResult.total } });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
```

Secuencia real:

1. llega una petición HTTP
2. Express llama al controller
3. el controller usa `await` para esperar consultas y lógica async
4. si algo falla, salta al `catch`
5. si todo sale bien, responde JSON

## 7. Cuándo conviene usar `await`

Conviene usar `await` cuando:

- necesitás el resultado de una operación para seguir con la próxima
- querés escribir una secuencia en orden lógico
- necesitás manejar errores con `try/catch`
- querés que el flujo sea fácil de leer en clase o en mantenimiento

Ejemplo:

```js
const client = await Client.findByPk(clientId);
const subtotal = await calculateCartTotal(items);
const discountResult = await applyDiscount(subtotal, discountCode);
```

Cada línea depende de la anterior o forma parte de una secuencia de negocio clara.

## 8. Cuándo no usar `await` de forma ingenua

No siempre conviene encadenar `await` uno por uno.

Si varias tareas son independientes, hacerlas secuencialmente puede volver más lento el código.

### Mal uso

```js
const client = await Client.findByPk(clientId);
const discounts = await Discount.findAll();
const categories = await Category.findAll();
```

Si no dependen entre sí, acá se esperan una por una.

### Mejor opción

```js
const [client, discounts, categories] = await Promise.all([
  Client.findByPk(clientId),
  Discount.findAll(),
  Category.findAll()
]);
```

Así las tres operaciones se disparan en paralelo y se esperan juntas.

## 9. `try/catch`: para qué sirve

Cuando una Promesa se rechaza, `await` lanza una excepción.

Por eso este patrón es tan común:

```js
try {
  const product = await Product.findByPk(1);
} catch (error) {
  console.error(error);
}
```

Si la consulta falla, el control salta al `catch`.

## 10. Qué captura un `catch`

Captura:

- errores lanzados manualmente con `throw new Error(...)`
- Promesas rechazadas esperadas con `await`
- errores que ocurren dentro del bloque `try`

Ejemplo:

```js
try {
  const product = await Product.findByPk(1);

  if (!product) {
    throw new Error('Producto no encontrado');
  }

  return product;
} catch (error) {
  console.error(error.message);
}
```

## 11. Caso borde: olvidar `await`

Este es uno de los errores más comunes.

### Mal

```js
const product = Product.findByPk(1);
console.log(product.name);
```

Problema:

- `product` no es el producto real
- `product` es una Promesa

Entonces `product.name` no tiene sentido.

### Bien

```js
const product = await Product.findByPk(1);
console.log(product.name);
```

## 12. Caso borde: usar `await` fuera de `async`

### Mal

```js
function buscar() {
  const product = await Product.findByPk(1);
}
```

Eso da error de sintaxis.

### Bien

```js
async function buscar() {
  const product = await Product.findByPk(1);
}
```

## 13. Caso borde: no manejar errores

### Mal

```js
async function buscarProducto() {
  const product = await Product.findByPk(1);
  return product.name;
}
```

Si la consulta falla, la función rechaza su Promesa. Eso no siempre es incorrecto, pero si nadie la captura, puede terminar en:

- error no manejado
- petición colgada
- caída lógica del flujo

### Mejor

```js
async function buscarProducto() {
  try {
    const product = await Product.findByPk(1);
    return product?.name;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
```

Acá hay dos decisiones válidas:

- capturar y responder ahí
- capturar, registrar y relanzar con `throw`

## 14. Cuándo capturar y cuándo relanzar

No todo error debe resolverse en el mismo nivel.

### Patrón 1: el controller responde al cliente

```js
async function create(req, res) {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json(product);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
```

Útil cuando:

- ese nivel ya sabe qué respuesta HTTP devolver

### Patrón 2: una función de negocio relanza

```js
async function calcular(items) {
  try {
    return await calculateCartTotal(items);
  } catch (error) {
    throw new Error(`No se pudo calcular el carrito: ${error.message}`);
  }
}
```

Útil cuando:

- querés agregar contexto
- otro nivel superior va a responder el error

## 15. Mal uso frecuente: `try/catch` demasiado grande

### Menos recomendable

```js
async function handler(req, res) {
  try {
    const client = await Client.findByPk(req.body.clientId);
    const subtotal = await calculateCartTotal(req.body.items);
    const discount = await applyDiscount(subtotal, req.body.discountCode);
    await commitPurchase(req.body.items);
    return res.json({ client, subtotal, discount });
  } catch (error) {
    return res.status(400).json({ error: 'Algo salió mal' });
  }
}
```

Problema:

- el mensaje es demasiado genérico
- se pierde información útil

### Mejor

```js
async function handler(req, res) {
  try {
    const client = await Client.findByPk(req.body.clientId);

    if (!client) {
      return res.status(400).json({ error: 'Cliente inválido' });
    }

    const subtotal = await calculateCartTotal(req.body.items);
    const discount = await applyDiscount(subtotal, req.body.discountCode);
    await commitPurchase(req.body.items);

    return res.json({ client, subtotal, discount });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
```

## 16. Mal uso frecuente: atrapar el error y "comérselo"

### Mal

```js
async function calcularTotal(items) {
  try {
    return await calculateCartTotal(items);
  } catch (error) {
    console.log(error);
    return 0;
  }
}
```

Problema:

- el flujo parece exitoso
- se oculta el error real
- la app puede seguir con datos falsos

Esto solo tendría sentido si `0` fuera una decisión funcional explícita y correcta. En la mayoría de los casos, no lo es.

### Mejor

```js
async function calcularTotal(items) {
  try {
    return await calculateCartTotal(items);
  } catch (error) {
    console.error(error);
    throw error;
  }
}
```

## 17. `return await`: cuándo sí y cuándo no

Muchas veces se escribe:

```js
return await Product.findByPk(1);
```

En funciones simples, suele ser innecesario. Alcanzaría con:

```js
return Product.findByPk(1);
```

Pero dentro de un `try/catch`, `return await` puede tener sentido si querés que el error se capture en ese mismo bloque antes de devolver.

Ejemplo:

```js
async function ejemplo() {
  try {
    return await Product.findByPk(1);
  } catch (error) {
    throw error;
  }
}
```

Regla práctica:

- fuera de `try/catch`, muchas veces `return await` es redundante
- dentro de `try/catch`, puede ser útil para que el rechazo ocurra ahí

## 18. Lo secuencial y lo paralelo

### Secuencial

```js
const a = await tareaA();
const b = await tareaB(a);
const c = await tareaC(b);
```

Esto está bien si:

- `b` depende de `a`
- `c` depende de `b`

### Paralelo

```js
const [productos, clientes, descuentos] = await Promise.all([
  Product.findAll(),
  Client.findAll(),
  Discount.findAll()
]);
```

Esto está bien si:

- las tres consultas son independientes

## 19. Caso borde: `Promise.all`

`Promise.all([...])` falla completo si una sola Promesa rechaza.

Ejemplo:

```js
await Promise.all([
  Product.findAll(),
  Client.findAll(),
  tareaQueFalla()
]);
```

Si `tareaQueFalla()` falla:

- toda la llamada falla
- salta al `catch`

Eso suele ser correcto, pero hay que saberlo.

Si querés tolerar fallos parciales, se puede pensar en `Promise.allSettled()`.

Ejemplo:

```js
const resultados = await Promise.allSettled([
  Product.findAll(),
  Client.findAll(),
  Discount.findAll()
]);
```

Cada resultado indica si salió:

- `fulfilled`
- `rejected`

## 20. Caso borde: loops con `await`

### Secuencial en `for...of`

```js
for (const item of items) {
  const product = await Product.findByPk(item.productId);
  console.log(product.name);
}
```

Esto espera uno por uno. A veces está bien, por ejemplo cuando:

- necesitás orden
- cada paso depende del anterior
- trabajás dentro de una transacción y querés control fino

### Problema con `forEach`

```js
items.forEach(async item => {
  const product = await Product.findByPk(item.productId);
  console.log(product.name);
});
```

Esto suele traer confusión porque:

- `forEach` no espera los `await`
- el flujo externo sigue antes de tiempo
- los errores pueden manejarse mal

### Mejor

```js
for (const item of items) {
  const product = await Product.findByPk(item.productId);
  console.log(product.name);
}
```

o, si querés paralelo:

```js
await Promise.all(
  items.map(item => Product.findByPk(item.productId))
);
```

## 21. Caso borde: controllers async en Express

En Express 4, un error dentro de una función `async` no siempre se propaga solo al middleware global. Por eso en este proyecto existe `src/utils/asyncHandler.js`.

Uso:

```js
router.get('/', asyncHandler(controller.getAll));
```

Ese wrapper hace:

```js
Promise.resolve(handler(req, res, next)).catch(next);
```

O sea:

1. ejecuta el handler async
2. si devuelve error, captura el rechazo
3. llama a `next(error)`
4. Express pasa el error al middleware global

## 22. Diferencia entre validación esperada y error inesperado

No todo problema debe tratarse igual.

### Validación esperada

```js
if (!client) {
  return res.status(400).json({ error: 'Cliente inválido' });
}
```

Esto no necesariamente es una excepción técnica. Es una condición de negocio esperable.

### Error inesperado

```js
try {
  const client = await Client.findByPk(clientId);
} catch (error) {
  return res.status(500).json({ error: 'Error interno' });
}
```

Esto sí apunta a:

- fallo de base
- error de conexión
- bug

## 23. Cuándo usar `throw new Error(...)`

Sirve cuando querés cortar el flujo y señalar que no se puede seguir.

Ejemplo del proyecto:

```js
if (!product) {
  throw new Error(`Producto ${item.productId} no encontrado`);
}
```

Eso hace que:

- se detenga la operación actual
- el error suba al nivel superior
- el `catch` o el middleware global lo manejen

## 24. Buenas prácticas resumidas

- usar `async` en funciones que realmente necesitan esperar Promesas
- usar `await` cuando el resultado es necesario para la siguiente línea
- usar `try/catch` cuando ese nivel pueda responder o enriquecer el error
- relanzar con `throw` si otro nivel debe decidir la respuesta final
- usar `Promise.all` cuando las tareas sean independientes
- evitar `forEach(async ...)`
- no ocultar errores devolviendo valores falsos sin justificación
- distinguir validaciones esperadas de fallos técnicos

## 25. Malas prácticas resumidas

- olvidar `await`
- usar `await` fuera de `async`
- capturar errores y no hacer nada útil con ellos
- responder mensajes demasiado genéricos que borran el contexto
- encadenar `await` secuenciales cuando podrían resolverse en paralelo
- mezclar validaciones de negocio con errores técnicos sin criterio

## 26. Ejemplo completo bien resuelto

```js
async function crearPedido(req, res) {
  try {
    const { clientId, items, discountCode } = req.body;

    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(400).json({ error: 'Cliente inválido' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Carrito vacío' });
    }

    const subtotal = await calculateCartTotal(items);
    const discountResult = await applyDiscount(subtotal, discountCode);
    await commitPurchase(items);

    return res.status(201).json({
      order: {
        clientId,
        items,
        subtotal,
        discount: discountResult.discount,
        total: discountResult.total
      }
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}
```

Qué está bien en este ejemplo:

- la función está marcada como `async`
- los datos vienen de `req.body`
- se usan validaciones tempranas con `return`
- las operaciones async se esperan con `await`
- el error se captura en un `try/catch`
- la respuesta HTTP se construye de forma explícita

## 27. Resumen final

`async/await` es una forma más clara de trabajar con Promesas. No elimina la asincronía: la vuelve más legible.

La clave real no es solo aprender esta sintaxis:

- hay que entender qué devuelve una función `async`
- cuándo usar `await`
- cuándo paralelizar
- cómo manejar errores con criterio
- cuándo responder en ese nivel y cuándo relanzar

Si esto se entiende bien, el código backend queda:

- más legible
- más mantenible
- menos propenso a errores sutiles
- más fácil de explicar en clase
