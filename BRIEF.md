# Moderato Studio — Brief del proyecto web

## Qué es Moderato Studio
Agencia creativa especializada en música clásica. Servicios de branding, comunicación visual, cobertura audiovisual, contenido para redes sociales, fotografía, vídeo, rebranding y diseño web. Posicionamiento premium, elegante y atemporal. Nace desde dentro del ecosistema musical.

## Estructura de la web
- `index.html` — Home (hero, manifiesto, servicios overview, portfolio preview, CTA)
- `servicios.html` — Página de servicios detallada
- `portfolio.html` — Portfolio con filtros por categoría
- `equipo.html` — El equipo (5 personas)
- `contacto.html` — Formulario de contacto
- `css/style.css` — Estilos globales compartidos
- `js/main.js` — JavaScript compartido (cursor, nav scroll, scroll reveal)
- `assets/logos/` — Logos de la marca
- `assets/img/` — Imágenes del proyecto
- `assets/fonts/` — Tipografía Aileron (local)

## Paleta de colores
```css
:root {
  --verde:  #132b08;   /* verde oscuro principal */
  --verde2: #1e4210;   /* verde medio */
  --verde3: #3a6b22;   /* verde salvia, acentos */
  --crema:  #f6f1ea;   /* fondo principal */
  --crema2: #e8e0d0;   /* fondo secundario, footer */
  --arena:  #c8b89a;   /* tono cálido, detalles */
  --noche:  #0d1f05;   /* casi negro, texto principal */
  --trans:  300ms cubic-bezier(.4,0,.2,1);
}
```

## Tipografía
- **Display / títulos**: Cormorant Garamond (Google Fonts) — pesos 300, 400, 500 — también itálica
- **Cuerpo / UI**: Aileron (archivo local en assets/fonts/) — pesos 300, 400
- En producción: reemplazar Cormorant Garamond por carga local si se desea

## Estética y estilo
- Fondo general: crema (#f6f1ea)
- Textos: verde noche (#0d1f05)
- Acentos: verde salvia (#3a6b22) para eyebrows, números, tags, líneas decorativas
- Títulos grandes en Cormorant Garamond weight 300
- Mucho espacio en blanco, ritmo vertical generoso
- Bordes sutiles: `0.5px solid rgba(13,31,5,0.08)`
- Sin sombras. Sin gradientes decorativos. Sin border-radius en elementos UI
- Animaciones: suaves, con cubic-bezier(.16,1,.3,1) o (.4,0,.2,1)

## Componentes globales (en style.css y main.js)

### Cursor personalizado
```html
<div class="cursor" id="cursor"></div>
<div class="cursor-ring" id="cursorRing"></div>
```
```css
.cursor {
  position: fixed; width: 10px; height: 10px;
  background: var(--noche); border-radius: 50%;
  pointer-events: none; z-index: 9999;
  top: 0; left: 0; transform: translate(-50%, -50%);
  transition: transform 200ms ease;
}
.cursor-ring {
  position: fixed; width: 36px; height: 36px;
  border: 1px solid rgba(13,31,5,0.35); border-radius: 50%;
  pointer-events: none; z-index: 9998;
  top: 0; left: 0; transform: translate(-50%, -50%);
  transition: width 300ms ease, height 300ms ease, border-color 300ms ease;
}
.cursor.hover  { transform: translate(-50%,-50%) scale(2.5); }
.cursor-ring.hover { width: 60px; height: 60px; border-color: rgba(13,31,5,0.55); }
```
```js
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursorRing');
let mx=0, my=0, rx=0, ry=0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx+'px'; cursor.style.top = my+'px';
});
(function loop() {
  rx += (mx-rx)*0.12; ry += (my-ry)*0.12;
  ring.style.left = rx+'px'; ring.style.top = ry+'px';
  requestAnimationFrame(loop);
})();
document.querySelectorAll('a,button,.service-item,.portfolio-item,.card').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); ring.classList.add('hover'); });
  el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); ring.classList.remove('hover'); });
});
```

### Nav
```html
<nav id="nav">
  <a href="index.html" class="nav-logo">
    <img src="assets/logos/logo-horizontal.svg" alt="Moderato Studio" />
  </a>
  <ul class="nav-links">
    <li><a href="servicios.html">Servicios</a></li>
    <li><a href="portfolio.html">Portfolio</a></li>
    <li><a href="equipo.html">Equipo</a></li>
    <li><a href="contacto.html">Contacto</a></li>
  </ul>
  <div class="nav-cta">
    <a href="contacto.html" class="btn-outline">Hablemos</a>
  </div>
</nav>
```
La nav se vuelve `scrolled` (fondo crema semitransparente + blur) al hacer scroll > 60px.

### Botones
```html
<a href="#" class="btn-primary">Texto</a>   <!-- verde oscuro, texto crema -->
<a href="#" class="btn-outline">Texto</a>   <!-- borde verde, hover relleno -->
```

### Scroll reveal
Añadir clase `reveal` a cualquier elemento. Al entrar en viewport se añade `visible`.
```css
.reveal { opacity:0; transform:translateY(40px); transition: opacity 0.8s cubic-bezier(.16,1,.3,1), transform 0.8s cubic-bezier(.16,1,.3,1); }
.reveal.visible { opacity:1; transform:translateY(0); }
.reveal-delay-1 { transition-delay:0.1s; }
.reveal-delay-2 { transition-delay:0.2s; }
.reveal-delay-3 { transition-delay:0.3s; }
```

### Eyebrow / etiqueta de sección
```html
<p class="section-eyebrow">Lo que hacemos</p>
```
Siempre acompañado de una línea decorativa via `::before`.

## Servicios (los 5)
1. Cobertura audiovisual — conciertos, festivales, eventos
2. Contenido para redes — creación y distribución estratégica
3. Fotografía & vídeo — sesiones para artistas e instituciones
4. Rebranding — identidad visual completa
5. Diseño web — webs elegantes y funcionales

## Logos disponibles (en assets/logos/)
- `logo-horizontal-verde.png` — logo completo sobre fondo oscuro
- `logo-horizontal-crema.png` — logo completo sobre fondo claro
- `logo-m-verde.png` — solo la M, sobre fondo oscuro
- `logo-m-crema.png` — solo la M, sobre fondo claro
- Versiones SVG de cada uno (preferir SVG siempre)

## Reglas de desarrollo
- Separar siempre HTML / CSS / JS en sus propios archivos
- Usar variables CSS de :root para todos los colores
- Nunca hardcodear colores fuera de :root
- Todos los archivos HTML comparten el mismo style.css y main.js
- La nav y el footer son iguales en todas las páginas
- Mobile-first: breakpoint principal en 900px
- Sin frameworks CSS (no Bootstrap, no Tailwind)
- Sin frameworks JS (vanilla JS únicamente)
- Comentarios en el CSS separando secciones: /* ── NAV ── */

## Prompts de referencia para Copilot

### Crear una página nueva
"Usando como referencia BRIEF.md y el estilo de index.html, crea servicios.html con [descripción de la página]. Usa el mismo header, footer, cursor y scroll reveal que el resto del proyecto."

### Añadir una sección
"En index.html, añade una sección de testimonios después de #portfolio. Mismo estilo que el resto del archivo, usando las variables de color de :root y la clase reveal para la animación de entrada."

### Corregir un bug
"El cursor personalizado no funciona en móvil. Revisa main.js y oculta el cursor en dispositivos táctiles usando (navigator.maxTouchPoints > 0)."

### Integrar el logo
"Sustituye el texto 'Moderato Studio' de la nav por la imagen assets/logos/logo-horizontal.svg. El logo debe tener height: 36px y adaptarse al color del fondo en scroll."
