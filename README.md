# Web de Destiny Dynasty

Web principal: https://destiny-dynasty.github.io/

## Rutas
- `/`: portada real, sin redirección.
- `/legal/`: índice legal.
- `/legal/condiciones/` y `/legal/privacidad/`: documentos legales.
- `/novedades/<noticia>/`: artículos.

Cada página es un directorio con index.html; las URL públicas no llevan extensión.

## Repositorios
Este repositorio reúne la web, los artículos, las imágenes y el feed del launcher. La única fuente editorial es `news.json`, publicada en https://destiny-dynasty.github.io/news.json. No hay copias del feed ni otro repositorio necesario para publicar novedades.

## Publicar novedades
1. Subir el banner a `images/` con un nombre nuevo.
2. Añadir o editar una entrada en `news.json`: id único, caption de hasta 90 caracteres, imageUrl relativo al feed, linkUrl HTTPS a la noticia y enabled booleano opcional.
3. Crear el artículo en `novedades/<nombre>/index.html` y enlazar su URL sin extensión.
4. Ejecutar `node tools/check-site.mjs` y publicar en main. Web y launcher leen el mismo feed; se muestran hasta ocho noticias activas. `enabled: false` o retirar la entrada la oculta; `items: []` vacía el carrusel.

Los archivos del modpack y las cuentas de los jugadores no pertenecen a este repositorio.

Destiny-Launcher, Modpack y Modpack-Lite siguen manteniendo sus responsabilidades independientes.

Publicación: GitHub Pages sirve la raíz de main. Validar con node tools/check-site.mjs y node --check site.js antes de publicar.
