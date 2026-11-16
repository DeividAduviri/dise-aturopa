# DiseñaTuPrenda

Sistema web para diseñar y personalizar prendas de vestir .

## Estructura del proyecto

- `config/`: conexión con MySQL.
- `controlador/`: controla las acciones del sistema.
- `modelo/`: consultas y operaciones de datos.
- `vista/`: pantallas del diseñador y administrador.
- `public/`: estilos CSS, JavaScript e imágenes.
- `bd/`: archivos SQL de la base de datos.
- `index.php`: menú principal y rutas del sistema.

## Instalación

1. Copia la carpeta `diseñaprenda` dentro de `htdocs`.
2. Inicia Apache y MySQL desde XAMPP.
3. Importa `bd/esquema.sql` desde phpMyAdmin.
4. Si ya tienes una base de datos anterior, revisa las actualizaciones SQL de `bd/` antes de ejecutarlas.
5. Si necesitas cambiar los datos de conexión, edita `config/database.php`.
6. Abre `http://localhost/diseñaprenda/`.

La conexión predeterminada utiliza MySQL en `127.0.0.1:3306`, base de datos `disenatuprenda_db`, usuario `root` y contraseña vacía.


## Actualización del modo diseñador (versión mejorada)

El editor ahora usa un lienzo HTML5/Canvas sin dependencias externas para la previsualización 2D. Permite seleccionar prendas del catálogo, aplicar tintes de color, patrones, texturas visuales, texto movible, zoom, rotación del texto, deshacer/rehacer, cargar una referencia, descargar una vista previa y guardar la imagen junto con la personalización en MySQL.

### Si ya tienes la base de datos creada

1. Abre phpMyAdmin.
2. Selecciona la pestaña SQL.
3. Ejecuta una sola vez el archivo `bd/actualizar_disenador.sql`.
4. Comprueba que `disenos` tenga las columnas `vista_previa` y `personalizacion_json`.

### Si vas a crear la base de datos desde cero

Importa `bd/esquema.sql` como siempre. Ya incluye las columnas nuevas.

### Permisos y configuración

La aplicación guarda las imágenes en `public/archivos/`. En XAMPP normalmente PHP puede crear esta carpeta automáticamente. Si tu servidor limita las subidas, configura `upload_max_filesize` en al menos `2M` y `post_max_size` en al menos `8M`.

### Alcance visual

Los colores y patrones se muestran sobre la transparencia de la imagen del catálogo. Escote, mangas, largo, cintura y falda se almacenan como especificaciones para el emprendimiento; para cambiar geométricamente esas partes en pantalla hacen falta plantillas gráficas por capas para cada prenda. Las vistas de espalda/lateral y el modo 3D no se falsifican: necesitan imágenes específicas o modelos 3D que el catálogo todavía no contiene.

## Probar el diseñador con prendas de ejemplo

Si al entrar aparece “El catálogo está vacío” o “no hay catálogo”, no es un problema del pincel: la base de datos no tiene categorías/prendas activas. Para cargar un catálogo de prueba:

1. Abre `http://localhost/phpmyadmin`.
2. Selecciona la base `disenatuprenda_db`.
3. Entra en la pestaña SQL e importa/ejecuta `bd/catalogo_demo.sql`.
4. Cierra sesión y vuelve a entrar como usuario normal (rol `usuario`).
5. Abre Diseñar prenda. Deben aparecer Vestidos, Faldas y Blusas con cuatro modelos de ejemplo.

El catálogo de demostración también aparecerá en el administrador, donde podrás editar o desactivar las categorías y prendas. No es necesario borrar ni recrear las tablas.

## Usar el pincel

En la barra izquierda del área de previsualización están Seleccionar, Pincel, Borrador, Mover, Rotar, Zoom y Restablecer. Selecciona primero una prenda, luego Pincel y dibuja arrastrando el mouse sobre el lienzo. El panel de pincel permite cambiar color y grosor. Borrador elimina trazos dibujados, no borra la fotografía de la prenda. “Borrar trazos” limpia todas las marcas manuales. Los trazos se guardan en la personalización del diseño.

## Editor visual ampliado (2D y 3D)
- El panel de catálogo se puede plegar con el botón **Catálogo** para ampliar el lienzo.
- Herramientas 2D añadidas: cubeta de color, pincel, borrador, rectángulo, cuadrado, círculo y carga de imagen/logotipo. El logotipo se puede arrastrar dentro del lienzo.
- Se puede cargar un modelo propio `.glb` o `.gltf` desde el panel derecho para abrirlo en el visor 3D; se puede girar con el ratón y cambiar el color del material cuando el modelo lo permite.
- El visor 3D usa Three.js desde CDN, por lo que necesita conexión a Internet. Para ofrecer un catálogo 3D permanente a todos los usuarios, el administrador debe incorporar archivos GLB/GLTF autorizados para cada prenda. Esta entrega no incluye una colección comercial de modelos 3D ni convierte automáticamente una foto 2D en un modelo 3D.
- El editor 2D trabaja sobre la imagen base de cada prenda; los cambios de escote, mangas y largo siguen guardándose como especificaciones de diseño y no remodelan geométricamente la silueta de la fotografía.


## Catálogo ampliado: 24 plantillas SVG

Se incluye `bd/catalogo_24_prendas.sql` y 24 ilustraciones vectoriales 2D en
`public/img/prendas/`. Para incorporarlas a una instalación existente:

1. Copia la carpeta `public/img/prendas/` completa dentro de `public/img/` del proyecto.
2. En phpMyAdmin, selecciona la base de datos `disenatuprenda_db` y ejecuta
   `bd/catalogo_24_prendas.sql` (después de haber importado `bd/esquema.sql`).
3. Abre el diseñador: aparecerán las categorías Vestidos, Faldas, Blusas, Tops,
   Chaquetas y Pantalones, con cuatro modelos en cada una.

El SQL es idempotente: si se ejecuta otra vez no duplica estas categorías ni prendas.
Las plantillas son ilustraciones vectoriales 2D de referencia; no son moldes de costura
ni modelos 3D. Las imágenes SVG se cargan en el catálogo y en el lienzo del diseñador.


## Ajustes de catálogo y diseñador
- Las 24 plantillas SVG se redibujaron con siluetas limpias, fondo transparente y trazos suaves, sin sombras negras.
- Se retiraron del panel las opciones de escote, manga y largo del vestido porque no modificaban la vista previa.
- Al guardar, esos campos se registran como `No aplica` para conservar compatibilidad con la estructura actual de la base de datos.


## Editor de prendas renovado

La pantalla de edición ahora usa una distribución de catálogo, lienzo central e inspector lateral. El inspector reúne colores, telas, patrones, detalles y guardado. Incluye lista de capas para texto, imágenes y formas; duplicación; orden de formas; propiedades de color y texto; atajos Ctrl+Z, Ctrl+Y, Ctrl+D y Supr. El editor sigue usando el lienzo 2D y el guardado PHP/MySQL existente.

Para probar: inicia el proyecto en XAMPP/Apache, inicia sesión, abre Diseñador, selecciona una prenda y prueba texto, formas, imagen, selección, movimiento, duplicado, capas, deshacer/rehacer, exportación PNG y guardado. La vista 3D requiere un archivo GLB/GLTF propio y conexión para cargar Three.js.

## Herramientas nuevas del editor

- **Balde:** haz clic en una zona cerrada de la prenda para rellenarla sin cambiar las zonas vecinas; también rellena las formas vectoriales seleccionadas al hacer clic sobre ellas.
- **Formas:** rectángulo, cuadrado y círculo se crean con relleno y contorno; el color se controla desde Propiedades/Color de dibujo.
- **Mover:** selecciona cualquier texto, forma o logotipo y arrástralo directamente en el lienzo. El logotipo usa su tamaño real para detectar el arrastre.
- **Pincel y borrador:** dibuja trazos libres y elimina trazos con el borrador.
- **Tema claro/oscuro:** el botón de la barra del editor cambia únicamente los paneles del área de trabajo y recuerda la preferencia en ese navegador.
