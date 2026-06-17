# EKOU DevTools — Requerimientos · v1

**Producto:** `mfx-cli` (paquete npm) · comando `mfx` · marca EKOU.
**Alcance v1:** definición de requerimientos. No incluye implementación.

## Convenciones
- Historias de usuario en formato Given / When / Then.
- Requisitos funcionales como `FR-xx`.

## Principios transversales de UX
Aplican a TODOS los requisitos; no se repiten en cada uno:
- **Feedback de estado siempre visible:** la CLI mantiene al usuario al tanto de
  qué ocurre en cada MFE (loading, building, creating preview, purging, etc.).
- **Logs en tiempo real:** toda operación que levante un MFE transmite su log en vivo.
- **Errores claros:** cualquier error se muestra de forma legible y accionable.

## Distribución
- **Given** un dev **when** necesita una devtool para administrar micro frontends
  **then** puede instalarla desde npm como librería (`mfx-cli`).
- **Given** un usuario con políticas estrictas de seguridad **when** instala `mfx-cli`
  **then** puede instalarla como código fuente del cual es owner (estilo copy-paste de
  código listo para ejecutar), no solo como dependencia.

## Configuración
- **Given** un usuario **when** configura la CLI **then** puede hacerlo desde un archivo
  de contrato legible (`mfx.config.json` con `$schema` para validación/autocompletado)
  **o** desde un onboarding (`mfx init`) que genera ese mismo archivo.
  El archivo es la fuente de verdad; el wizard solo lo produce.
- Parámetros configurables en v1:
  - **App Shell y su puerto:** por defecto, el primer puerto del rango efectivo.
  - **Nombre del proyecto:** se muestra en el encabezado como `EKOU CLI — {nombreProyecto}`.
  - **Rango de puertos** (ver §Asignación de puertos).
  - **Comandos de ejecución por modo:** dev, build, build+watch, etc.; con soporte
    para custom commands por modo.

## Asignación de puertos
- `ports` omitido → default Vite (5173), asignación secuencial +1 por cada MFE.
- `ports: 5000` (entero) → inicio de rango, secuencial +1 por MFE.
- `ports: "5000-5060"` (string) → rango explícito, inclusivo en ambos extremos.
- El App Shell toma siempre el primer puerto del rango efectivo.
- Validación con error claro si: `fin < inicio`, rango insuficiente para la cantidad
  de MFEs, o solapamiento de puertos.

## Theming
- **FR-01** La CLI sigue la línea gráfica de EKOU; el tema **EKOU** es el default.
- **FR-02** Ofrece varios temas predefinidos y permite definir un tema custom, al
  estilo de la configuración de theming de Tailwind o MUI.

## Gestión de MFEs
- **FR-03** Permite seleccionar qué MFE(s) levantar.
- **FR-04** Cada MFE tiene puerto por defecto (modificable) y modo, ambos individuales.
- **FR-05** Al levantar un MFE, abre el navegador en su URL **solo la primera vez**
  que ese MFE corre en la sesión; en reinicios no vuelve a abrirlo.
- **FR-06** Opción en el menú para abrir en navegador un MFE concreto o todos los
  levantados; si hay varios, muestra un selector.

## Logs
- **FR-07** Muestra el log en vivo del MFE levantado.
- **FR-08** Si un MFE corre en varios modos a la vez (ej. dev + build), muestra el log
  de cada modo y permite navegar entre ellos con arrow keys para verlos individualmente.

## Menú inferior persistente
- **FR-09** Barra inferior siempre disponible con los comandos vigentes, ej.:
  `↑↓ navegar` · `space toggle` · `a all` · `n none` · `p purge port {rango}` ·
  `enter start` · `q quit`, además de las opciones disponibles según el contexto.

## Panel de notificaciones
- **FR-10** Panel de notificaciones encendible/apagable desde el menú inferior.
- **FR-11** Muestra eventos en tiempo real (MFE levantado, MFE purgado, error al
  levantar, etc.).
- **FR-12** Configurable: el usuario elige qué tipos de notificación recibir.

## Mockup de UI

![Mockup de UI](assets/mockup-ui.png)
