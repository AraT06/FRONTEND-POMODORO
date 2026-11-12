# Proyecto Multimedia — Ambient Focus App (contexto técnico)

Materia: Programación Gráfica y Multimedia — Carrera de Sistemas, UNIFRANZ.
Autor: Santiago Federico Echeverría Terán.

> Leyenda: **[Acordado]** = decidido previamente. **[Propuesto]** = decisión técnica sugerida para completar el diseño; validar antes de implementar.
>
> **Cambio vigente:** el proyecto se implementa en **Angular** (antes: JavaScript vanilla + Vite). El concepto, los visuales, el audio y los patrones no cambian; cambia la arquitectura de implementación.

---

## 1. Concepto [Acordado]

Aplicación web de enfoque ambiental basada en el clima real del usuario:

- Obtiene el clima actual desde la API de Open-Meteo.
- Genera visuales procedurales en Canvas acordes al clima.
- Mezcla audio ambiental con Web Audio API (lluvia, viento, etc.) con análisis espectral.
- Incluye un temporizador Pomodoro.
- Un árbol recursivo crece mientras se estudia, como representación visual del progreso.

Descartado durante la ideación: conversores, juegos y propuestas demasiado complejas. No reabrir.

## 2. Requisitos académicos

- **[Acordado]** Proyecto semestral entregado en 4 hitos (hitos 2 al 5).
- **[Acordado]** Debe aplicar patrones de diseño y elementos multimedia.
- **[Acordado]** Documentación con la estructura formal UNIFRANZ.
- **[Acordado]** Citas en APA 7.
- **Pendiente:** el contenido exacto que pide la materia en cada hito no está registrado. Completar la tabla de la sección 12 con lo que indique el docente.

## 3. Stack

| Capa | Tecnología |
|---|---|
| Framework | **Angular** (última versión estable; verificar con `ng version`), TypeScript en modo `strict` |
| Componentes | Standalone components (sin NgModules), señales (`signal`, `computed`) para estado de UI |
| Reactividad de eventos | RxJS |
| HTTP | `HttpClient` (`provideHttpClient()`) |
| Gráficos | HTML5 Canvas 2D |
| Audio | Web Audio API (+ `AnalyserNode` para espectro) |
| Datos | Open-Meteo API |
| Persistencia | `localStorage` |
| Deploy | Netlify |

**[Propuesto]** Crear sin SSR (la app depende de Canvas, `AudioContext` y `localStorage`, que no existen en servidor):

```bash
ng new focus-app --style=scss --ssr=false
```

## 4. Estructura de proyecto [Propuesto]

```
src/app/
├── app.ts / app.config.ts       # raíz y providers (HttpClient, etc.)
├── core/
│   ├── event-bus.service.ts     # Observer (Subjects tipados de RxJS)
│   ├── store.service.ts         # Singleton: estado global + persistencia
│   └── commands/                # Command + historial
├── weather/
│   ├── weather.service.ts       # Facade: geocoding + forecast + caché
│   ├── open-meteo.adapter.ts    # Adapter: respuesta API -> WeatherData
│   └── weather-category.ts      # mapeo WMO code -> categoría
├── visuals/
│   ├── canvas-engine.service.ts # loop rAF, resize, DPR
│   ├── renderer.factory.ts      # Factory Method
│   ├── renderers/               # Strategy: clear, cloudy, rain, snow, fog, storm
│   ├── tree.ts                  # árbol recursivo (lógica pura, sin Angular)
│   └── scene-canvas/            # componente que aloja el <canvas>
├── audio/
│   ├── audio-engine.service.ts  # Facade + Singleton sobre AudioContext
│   ├── noise-generators.ts      # ruido blanco/rosa/marrón
│   ├── soundscapes.ts           # perfiles de mezcla por categoría (Strategy)
│   └── spectrum/                # componente del visualizador
├── timer/
│   ├── pomodoro.service.ts      # contexto de la máquina de estados
│   └── states/                  # State
├── persistence/
│   └── session.memento.ts       # Memento
└── ui/                          # HUD, controles, selector de ciudad
```

Regla: la lógica de dominio (`tree.ts`, renderers, generadores de ruido, mapeo WMO, estados del Pomodoro) son clases/funciones TypeScript puras. Angular solo las orquesta mediante servicios y componentes; así son testeables sin `TestBed`.

## 5. Clima (Open-Meteo)

Sin API key, solo uso no comercial (válido para fines académicos).

- **Geocoding:** `https://geocoding-api.open-meteo.com/v1/search?name={ciudad}&count=5&language=es`
- **Forecast:** `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,weather_code,is_day,wind_speed_10m,cloud_cover,precipitation`

**[Propuesto]** `WeatherService` expone el clima como `Observable`/señal (`toSignal`). Flujo de ubicación: `navigator.geolocation` → si el usuario deniega, búsqueda manual por ciudad → fallback fijo (Cochabamba) para que la app nunca quede vacía. Refrescar cada 15 min (`timer` de RxJS con `switchMap`) y cachear la última respuesta para uso offline.

Mapeo de `weather_code` (WMO) a categoría interna:

| Códigos | Categoría |
|---|---|
| 0 | `clear` |
| 1, 2, 3 | `cloudy` |
| 45, 48 | `fog` |
| 51–57, 61–67, 80–82 | `rain` |
| 71–77, 85–86 | `snow` |
| 95, 96, 99 | `storm` |

`is_day` define la paleta (día/noche); `wind_speed_10m` y `precipitation` modulan intensidad de partículas y volumen del audio.

Modelo interno (salida del Adapter):

```ts
interface WeatherData {
  category: WeatherCategory;
  temperatureC: number;
  windKmh: number;
  cloudCover: number;
  precipitationMm: number;
  isDay: boolean;
  city: string;
  fetchedAt: number;
}
```

## 6. Visuales (Canvas)

**Integración con Angular (crítico para rendimiento):**

- El `<canvas>` vive en `SceneCanvasComponent`, obtenido con `viewChild`. Inicializar el contexto en `afterNextRender`, no en el constructor.
- Ejecutar el loop de `requestAnimationFrame` **fuera de la zona**: `ngZone.runOutsideAngular(...)`. Si no, cada frame dispara detección de cambios en toda la app. (Si se opta por aplicación zoneless, este punto no aplica.)
- Liberar el loop, listeners y observadores en `DestroyRef.onDestroy`.
- Componentes con `ChangeDetectionStrategy.OnPush`.

**Motor:**

- Loop único con delta-time; pausar con `document.hidden`.
- Escalado por `devicePixelRatio` y `resize` debounced (`ResizeObserver`).
- Cada categoría es un renderer con la misma interfaz: `init(ctx, size)`, `update(dt, weather)`, `draw(ctx)`.
  - `rain`: partículas diagonales, densidad según `precipitation`, inclinación según viento.
  - `snow`: copos con deriva sinusoidal.
  - `cloudy`: capas de nubes con parallax.
  - `clear`: gradiente de cielo + sol/luna según `is_day`.
  - `fog`: capas de ruido con alpha bajo.
  - `storm`: lluvia + destellos aleatorios.
- Transición entre climas con crossfade (~1.5 s) para evitar saltos bruscos.

### Árbol recursivo

- Función recursiva `branch(x, y, length, angle, depth)` con bifurcación y reducción de longitud/grosor por nivel.
- **[Propuesto]** Progreso: `maxDepth` crece con minutos de enfoque acumulados (p. ej. +1 nivel por Pomodoro completado, tope ~10). Crecimiento animado de las ramas nuevas, no redibujo instantáneo.
- PRNG con semilla (guardada en el Memento) para que el árbol sea idéntico entre recargas.
- El viento del clima aporta un balanceo leve de las ramas.
- Rendimiento: con `depth` ≤ 10 son ~2¹⁰ ramas; dibujar sobre un canvas offscreen y recomponer solo al crecer.

## 7. Audio (Web Audio API)

- **Autoplay policy:** el `AudioContext` solo se activa tras un gesto del usuario. `AudioEngineService` crea/reanuda el contexto desde el handler del botón "Iniciar sesión de enfoque".
- **[Propuesto]** Generar el sonido de forma procedural, sin archivos: evita derechos de autor y reduce peso.
  - Ruido blanco/rosa/marrón con `AudioBuffer` en loop.
  - Lluvia: ruido blanco → `BiquadFilter` highpass + modulación de ganancia.
  - Viento: ruido marrón → bandpass con frecuencia modulada por un `OscillatorNode` lento (LFO).
  - Trueno: ráfaga de ruido marrón con envolvente de ganancia.
- Grafo: `fuentes → GainNode (por canal) → master Gain → AnalyserNode → destination`.
- Cada categoría climática define un perfil de mezcla (ganancias por canal); cambiar de clima hace `linearRampToValueAtTime` para evitar clicks.
- Sliders de volumen por canal + master, persistidos.
- **Análisis espectral:** `AnalyserNode` (`fftSize` 256–2048, `getByteFrequencyData`) alimenta `SpectrumComponent`, que dibuja barras en Canvas dentro del mismo esquema fuera de zona.
- Cerrar el `AudioContext` y desconectar nodos en `ngOnDestroy`/`DestroyRef`.

## 8. Pomodoro

- Defaults: 25 min enfoque, 5 min descanso corto, 15 min descanso largo cada 4 ciclos (configurable).
- Estados: `Idle → Focus → ShortBreak/LongBreak → Focus…`, con `Paused` desde cualquier estado activo.
- **Importante:** calcular el tiempo restante con `Date.now()` contra un timestamp de fin, no sumando ticks de `interval`; los navegadores throttlean timers en pestañas inactivas.
- `PomodoroService` publica el tiempo restante como señal y emite `pomodoro:completed` por el `EventBus`.
- Al completar un Focus: el árbol crece y se persiste el progreso.
- Notificación al cambiar de fase (sonido corto por Web Audio; `Notification API` opcional).

## 9. Patrones de diseño [Acordado: los 9]

| Patrón | Dónde se aplica en Angular |
|---|---|
| Strategy | Renderers por clima; perfiles de mezcla de audio |
| State | Fases del Pomodoro (objetos de estado, no `switch` sobre un enum) |
| Observer | `EventBus` con `Subject` tipados de RxJS: clima → visuales/audio; timer → árbol/UI |
| Factory Method | `RendererFactory` y creación de soundscapes por categoría |
| Facade | `WeatherService` (geocoding + forecast + caché); `AudioEngineService` (oculta el grafo de nodos) |
| Singleton | Servicios con `providedIn: 'root'` (`AudioEngineService`, `StoreService`) |
| Command | Acciones de UI (iniciar, pausar, reiniciar, cambiar ciudad, mute) como objetos con `execute()`/`undo()` e historial |
| Memento | Snapshot de sesión: semilla y profundidad del árbol, minutos acumulados, configuración |
| Adapter | Respuesta de Open-Meteo → `WeatherData` interno |

**Advertencias:**

- Nueve patrones en una app de este tamaño tienen riesgo de sobreingeniería. Cada uno debe resolver un problema real del código; si alguno queda forzado, es preferible justificar y documentar menos patrones bien aplicados que nueve decorativos.
- Angular ya trae algunos de estos mecanismos de forma nativa: la DI es el Singleton (`providedIn: 'root'`) y RxJS es el Observer. Para que cuenten como patrón aplicado en la documentación, usarlos de forma explícita (un `EventBus` con Subjects tipados, no solo señales) y explicar la correspondencia.
- Las señales sirven para estado de UI derivado; no sustituyen al Observer de eventos de dominio.

## 10. Persistencia (`localStorage`)

Clave única versionada, p. ej. `focusapp:v1`, gestionada por `StoreService`:

```ts
interface PersistedState {
  version: 1;
  settings: {
    focusMin: number;
    shortBreakMin: number;
    longBreakMin: number;
    volumes: Record<string, number>;
  };
  location: { name: string; lat: number; lon: number };
  tree: { seed: number; depth: number; totalFocusMinutes: number };
  weatherCache: { data: WeatherData; fetchedAt: number };
}
```

Envolver lecturas/escrituras en `try/catch` y validar al cargar (datos corruptos → defaults). Incluir `version` para migraciones. Un `effect` sobre las señales del store persiste los cambios con debounce.

## 11. Convenciones de código Angular [Propuesto]

- Standalone components; `inject()` en lugar de inyección por constructor.
- Control flow nativo del template (`@if`, `@for`) y señales para estado local.
- `strict: true` en TypeScript y plantillas; sin `any`.
- Un servicio por responsabilidad; componentes "tontos" que solo presentan y delegan en servicios.
- Estilos con SCSS y variables CSS para la paleta día/noche.

## 12. Hitos (2–5)

> El contenido real por hito depende de lo que pida la materia. La columna "Alcance técnico sugerido" es una propuesta de orden de construcción.

| Hito | Entregable según la materia | Alcance técnico sugerido |
|---|---|---|
| 2 | [completar] | Proyecto Angular, estructura, `WeatherService` + Adapter, `SceneCanvasComponent` con 2 renderers (`clear`, `rain`) |
| 3 | [completar] | Resto de renderers, árbol recursivo, `PomodoroService` con State |
| 4 | [completar] | `AudioEngineService`, soundscapes, visualizador espectral, Command/Memento |
| 5 | [completar] | Pulido, persistencia completa, accesibilidad, deploy en Netlify, documento final |

## 13. Documentación académica

- Ya entregado: perfil de proyecto (.docx) con carátula, índice, Generalidades, Resumen, Antecedentes, Descripción del Objeto de Estudio, Diseño Técnico de la Investigación (Planteamiento del Problema, Objetivos, Alcances y Aportes) y bibliografía.
- **Desactualizado:** ese documento declara JavaScript vanilla + Vite. Hay que corregir solo esas menciones del stack (y la bibliografía si cita Vite) a Angular, sin tocar el resto.
- Formato UNIFRANZ: Verdana 10, interlineado 1.5, numeración romana en preliminares y arábiga en el cuerpo.
- Citas en APA 7. Datos personales con corchetes `[ ]` como placeholder si faltan.
- Fuentes técnicas a citar: documentación de Open-Meteo, MDN (Web Audio API, Canvas API), documentación oficial de Angular (angular.dev), documentación de RxJS, y el libro de patrones de diseño (Gamma et al., 1994).

## 14. Calidad y entrega

- **Accesibilidad:** respetar `prefers-reduced-motion` (reducir partículas y balanceo), controles operables con teclado, contraste suficiente en el HUD, no depender solo del color.
- **Rendimiento:** loops fuera de la zona, `OnPush`, límite de partículas por dispositivo, pausar animación y audio en pestaña oculta.
- **Errores:** fallo de red o API → usar caché y mostrar estado discreto; geolocalización denegada → búsqueda manual.
- **Pruebas:** unitarias sobre la lógica pura (mapeo WMO, Adapter, estados del Pomodoro, PRNG/árbol). Manuales: cada categoría climática (forzable desde un selector de debug), cambio de clima con audio activo, recarga con sesión guardada, pestaña en segundo plano durante un Pomodoro.
- **Deploy (Netlify):** build command `ng build`; publish directory `dist/focus-app/browser` (confirmar la ruta exacta tras el primer build). Si se añade el router, agregar una regla de redirección a `index.html` (`_redirects` o `netlify.toml`) para las rutas SPA.

## 15. Reglas de trabajo con Santi

- Entregar exactamente lo pedido, sin subsecciones, párrafos ni decisiones extra no solicitadas.
- Cuando se pida modificar o citar un texto existente, cambiar solo lo solicitado.
- Toda afirmación que requiera fuente se referencia en el mismo turno, con la investigación hecha.
- Código limpio, buenas prácticas, comentarios solo si son realmente necesarios (no obvios ni repetitivos).
- Si algo no es correcto o es mala decisión de producto, decirlo directamente.
