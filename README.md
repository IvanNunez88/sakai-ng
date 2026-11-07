# FACPYA - Front

Ejemplo de clase: front en Angular con la plantilla [Sakai](https://github.com/primefaces/sakai-ng) (PrimeNG) conectado a la API `ProgramasFacpya.Api`.

## Pantallas

- **Alumnos**: `/alumnos`
- **Maestros**: `/maestros`
- **Carreras**: `/carreras`

Cada pantalla tiene listado con búsqueda, alta, edición y baja.

## Estructura

```
src/
├── environments/environment.ts   URL de la API
└── app/
    ├── layout/                     Menú lateral y barra superior (Sakai)
    ├── models/                     Interfaces (igual que los DTO y entidades del back)
    ├── services/                   Llamadas HTTP a cada controlador
    └── pages/                      Pantallas CRUD
```

## Cómo correrlo

1. Levantar la API (`dotnet run`), que escucha en `http://localhost:5165`.
2. Instalar dependencias (solo la primera vez):
   ```
   npm install
   ```
3. Levantar el front:
   ```
   npm start
   ```
4. Abrir http://localhost:4200
