# Frontend Pomodoro

Aplicacion Angular para organizar sesiones de enfoque con temporizador Pomodoro, ambientes de concentracion, progreso y un chat de asistencia.

## Requisitos

- Node.js 20 o superior
- Backend Pomodoro ejecutandose en `http://localhost:3000` para usar el chat con API

## Instalacion y ejecucion

```bash
npm install
npm start
```

Abre `http://localhost:4200/`.

El chat `Focus AI` usa `POST /api/chat` del repositorio `BACKEND-POMODORO`. Si el backend no esta disponible, el frontend usa una respuesta local basica.

## Build

```bash
ng build
```
