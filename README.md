# Amor de Otro Mundo

Sistema base para Foundry VTT v14+ con una hoja de personaje en formato Handlebars usando Application V2.

## Estructura principal

- `system.json`: configuración del sistema.
- `template.json`: datos por defecto de actores.
- `scripts/amordom.mjs`: registro del sistema y la hoja del personaje.
- `templates/actor/character-sheet.hbs`: plantilla de la ficha.
- `styles/amordom.css`: estilos visuales del sistema.

## Uso

1. Copia esta carpeta dentro de `Data/systems/` de Foundry VTT.
2. Inicia Foundry y crea un mundo.
3. Crea un actor del tipo "Personaje" y la ficha se mostrará con el formulario base.

## Personalización

Puedes ampliar los atributos y añadir más secciones, además de crear fichas de vehículo, criatura o NPC.
