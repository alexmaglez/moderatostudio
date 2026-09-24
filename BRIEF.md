# Moderato Studio — Brief del proyecto web

## Qué es Moderato Studio
Agencia creativa especializada en música clásica. Servicios de branding, comunicación visual, cobertura audiovisual, contenido para redes sociales, fotografía, vídeo, rebranding y diseño web. Posicionamiento premium, elegante y atemporal. Nace desde dentro del ecosistema musical.

**La web habla siempre del estudio como marca.** No se muestran personas, nombres, fotos ni número de integrantes.

## Estructura de la web
- `index.html` — Home (hero con cifras, banda pentagrama, I · El estudio, II · Servicios, III · Método, IV · Portfolio «Próximamente», CTA)
- `servicios.html` — Servicios detallados (anclas `#audiovisual`, `#redes`, `#fotografia`, `#rebranding`, `#web`)
- `portfolio.html` — Portfolio: de momento muestra el bloque «Próximamente» (`.soon`). En la nav lleva la etiqueta «Pronto»
- `contacto.html` — Formulario de contacto (abre el correo con el mensaje; acepta `?servicio=<valor>` para preseleccionar)
- `css/style.css` — Estilos globales compartidos
- `js/i18n.js` — Textos en inglés (el español vive en el HTML)
- `js/main.js` — JavaScript compartido (idioma, cursor, nav, reveal, cifras, formulario)
- `assets/logos/` — Logos originales (2000×2000 con margen)
- `assets/logos/web/` — Logos recortados y optimizados en WebP + favicon (usar estos en la web)

## Concepto visual
El nombre es una indicación de tempo, y todo el lenguaje sale de la partitura:
- **Pentagramas** (5 líneas) como separadores que se dibujan al entrar en pantalla (`.staff`) y la banda de disciplinas (`.staff-band`), con barras de compás entre palabras.
- **Movimientos en números romanos** para las secciones (`I`, `II`…), **Op. 01…** para los proyectos.
- **Método en cuatro tempos**: Adagio (Escucha), Andante (Partitura), Moderato (Ensayo), Allegro (Estreno).
- La **M caligráfica** del logo se "escribe" en el hero y aparece como marca de agua en portfolio y CTA (máscara CSS, color por token).

## Idiomas (ES / EN)
- El español está escrito en el HTML. Cada texto traducible lleva `data-i18n="clave"` y su inglés va en `js/i18n.js` (puede contener HTML: `<em>`, `<br>`…)
- Atributos: `data-i18n-attr="aria-label:clave"` (varios separados por `;`)
- `<title>` y meta description en inglés: `I18N.meta.en[<data-page del body>]`
- Idioma inicial (script inline del `<head>`): elección guardada en `localStorage` → idioma del dispositivo. `es`, `ca`, `gl`, `eu` → español; cualquier otro → inglés
- Selector ES / EN en la nav: cambia sin recargar y guarda la elección
- **Al añadir un texto nuevo:** ponerle `data-i18n` y añadir su clave en `i18n.js`. Sin clave en inglés se queda en español
- Limitación: los buscadores solo indexan la versión en español

## Cifras del hero
- `<span class="stat-value" data-count="136">136</span>` → `main.js` lo convierte en un contador de rodillo (cada cifra gira desde 0; las unidades dan más vueltas) y al final aparece el «+»
- Para actualizar el histórico basta con cambiar `data-count` y el texto

## Paleta de colores
Todos los colores viven en `:root`. Nunca hardcodear colores fuera de ahí.
```css
--verde:  #132b08;  /* verde oscuro principal, secciones oscuras */
--verde2: #1e4210;  /* verde medio, hover sobre oscuro */
--verde3: #3a6b22;  /* verde salvia: eyebrows, cursivas, acentos */
--crema:  #f6f1ea;  /* fondo principal */
--crema2: #e8e0d0;  /* fondo secundario */
--arena:  #c8b89a;  /* acento cálido sobre verde */
--noche:  #0d1f05;  /* texto principal, footer */

/* Derivados (contraste AA) */
--tinta-2: #333d2c;  /* párrafos sobre crema */
--tinta-3: #5d6453;  /* metadatos sobre crema */
--claro-2 / --claro-3  /* texto secundario sobre verde */
--linea / --linea-fuerte / --linea-clara  /* bordes */
```
Ritmo de color: secciones crema alternadas con secciones `.on-dark` (verde) y footer en noche. Dentro de `.on-dark` los acentos pasan a arena.

## Tipografía
- **Display y lectura**: Cormorant Garamond (Google Fonts): 300 para titulares, 400 para párrafos (mín. 1.15–1.25rem; tiene un ojo pequeño).
- **UI y etiquetas**: `--sans` = Aileron si está instalada localmente → Hanken Grotesk (Google Fonts) como respaldo. Versalitas a 0.7–0.78rem, peso 500, tracking 0.12–0.18em.
- Nunca usar texto con opacidad para jerarquía: usar los tokens `--tinta-*` / `--claro-*`.

## Estética y estilo
- Mucho espacio en blanco, ritmo vertical generoso (`--section`)
- Bordes de 1px con los tokens `--linea*`
- Sin sombras. Sin gradientes decorativos. Sin border-radius en elementos UI
- Grano sutil fijo sobre toda la página (`body::after`)

## Movimiento
- Curvas: `--ease-out` (.16,1,.3,1) para entradas, `--ease-io` (.65,0,.35,1) para trazos
- Animar solo `transform`, `opacity` y `clip-path`
- Todo se desactiva con `prefers-reduced-motion`
- Transición entre páginas con View Transitions (`@view-transition`)

### Clases de animación
- `.reveal` → aparece al entrar en viewport (`.reveal-delay-1..3` para escalonar)
- `data-lines` en un titular → cada línea separada por `<br>` sube desde una máscara
- `.staff` con 5 `<i>` → pentagrama que se dibuja
- Los estados ocultos solo aplican con la clase `.js` en `<html>` (script inline en el `<head>`), así que sin JS todo es visible

## Componentes globales

### Nav
- 3 enlaces: Servicios, Portfolio, Contacto + botón "Hablemos"
- Marcar la página actual con `aria-current="page"`
- Se vuelve `scrolled` (velo crema + blur) al pasar de 40px y se oculta al bajar / reaparece al subir
- En ≤900px: menú a pantalla completa con enlaces grandes en serif

### Cursor (nota musical)
- Lo crea `main.js`; no hace falta marcado en el HTML
- Cabeza de nota que sigue al puntero; sobre `a, button, label` le crece la plica (♩); al hacer clic se comprime
- Color noche sobre fondos claros y crema sobre `.on-dark` y el footer (tiene en cuenta el relleno de los botones al hover)
- Solo con ratón (`hover: hover` y `pointer: fine`). En campos de formulario vuelve el cursor nativo
- El cursor nativo solo se oculta tras el primer movimiento del ratón, así que si falla el JS no se pierde

### Botones
```html
<a class="btn-primary">Texto <span class="arrow">→</span></a>  <!-- verde; hover relleno arena -->
<a class="btn-outline">Texto</a>                              <!-- borde; hover relleno verde -->
<a class="link">Texto <span class="arrow">→</span></a>        <!-- enlace de texto subrayado -->
```
Dentro de `.on-dark` se invierten automáticamente.

### Eyebrow
```html
<p class="section-eyebrow"><span class="num">II</span>Lo que hacemos</p>
```

## Servicios (los 5)
1. Cobertura audiovisual: conciertos, festivales, eventos
2. Contenido para redes: creación y distribución estratégica
3. Fotografía & vídeo: sesiones para artistas e instituciones
4. Rebranding: identidad visual completa
5. Diseño web: webs elegantes y funcionales

## Reglas de desarrollo
- Separar siempre HTML / CSS / JS en sus propios archivos (única excepción: la línea inline que añade `.js`)
- Todos los HTML comparten `style.css` y `main.js` (cargado con `defer` en el `<head>`)
- La nav y el footer son iguales en todas las páginas
- Breakpoints: 1100px y 900px (principal)
- Sin frameworks CSS ni JS (vanilla únicamente)
- Comentarios en el CSS separando secciones: `/* ── NAV ── */`
- Imágenes con `width`/`height` para evitar saltos de layout
