# Web de Destiny Dynasty

Web principal: https://destiny-dynasty.github.io/

## Rutas
- `/`: portada real, sin redirección.
- `/legal/`: índice legal.
- `/legal/condiciones/` y `/legal/privacidad/`: documentos legales.
- `/novedades/<noticia>/`: artículos.

Cada página es un directorio con index.html; las URL públicas no llevan extensión.

## Repositorios
Este repositorio es la fuente de la web. Launcher-News conserva el feed editorial news.json y sus imágenes para los launchers instalados; sus antiguas páginas redirigen aquí. La web consulta ese mismo feed y resuelve sus imágenes respecto a su URL de origen. Para publicar noticias se edita Launcher-News/news.json, usando enlaces a las nuevas rutas de esta web. tools/news-reference.json en este repositorio es una copia inicial de referencia para validación, no la fuente editorial; actualizarla al revisar el feed.

Destiny-Launcher, Modpack y Modpack-Lite siguen manteniendo sus responsabilidades independientes.

Publicación: GitHub Pages sirve la raíz de main. Validar con node tools/check-site.mjs y node --check site.js antes de publicar.
