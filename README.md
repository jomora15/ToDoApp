# ToDoApp

Esta es una aplicación móvil desarrollada con Ionic que permite gestionar tus tareas. Puedes crear, marcar como completada, eliminar y filtrar tareas por categorías.

---

## Cómo Ejecutar la Aplicación

Sigue estas instrucciones para compilar y ejecutar la aplicación en un emulador o dispositivo real.

### Requisitos Previos

Asegúrate de tener instaladas las siguientes herramientas en tu sistema:

* **Node.js y npm**: Descárgalo desde [nodejs.org](https://nodejs.org/).
* **Ionic CLI**: Instálalo globalmente con npm:
    ```bash
    npm install -g @ionic/cli
    ```
* **Android Studio**: Necesario para compilar y ejecutar en Android. Descárgalo desde [developer.android.com/studio](https://developer.android.com/studio).
    * Configura las variables de entorno `ANDROID_HOME` y añade las herramientas de la plataforma a tu `PATH`.
* **Xcode**: Necesario para compilar y ejecutar en iOS (solo macOS). Descárgalo desde la App Store.
    * Asegúrate de tener las Command Line Tools instaladas (`xcode-select --install`).

### Pasos de Configuración Inicial

1.  **Clona el repositorio** (si aún no lo has hecho):
    ```bash
    git clone https://github.com/jomora15/ToDoApp.git
    cd ToDoApp
    ```
2.  **Instala las dependencias de Node.js**:
    ```bash
    npm install
    ```
3.  **Sincroniza Capacitor**:
    Este paso es crucial para preparar el proyecto nativo de Android e iOS.
    ```bash
    npx cap sync
    ```

---

## Ejecutar en Android

1.  **Abre el proyecto en Android Studio**:
Espera a que Gradle sincronice el proyecto.
2.  **Selecciona un Dispositivo/Emulador**:
    En Android Studio, en la barra de herramientas superior, selecciona un **emulador** configurado o un **dispositivo Android** conectado.
3.  **Ejecuta la Aplicación**:
    Haz clic en el botón de **"Run"** (el icono de triángulo verde) en la barra de herramientas de Android Studio. La aplicación se instalará y ejecutará en el emulador o dispositivo seleccionado.

---

## Ejecutar en iOS (solo macOS)

1.  **Abre el proyecto en Xcode**:
    ```bash
    npx cap open ios
    ```
    Esto abrirá tu proyecto de iOS en Xcode.
2.  **Selecciona un Dispositivo/Simulador**:
    En Xcode, en la barra de herramientas superior, selecciona un **simulador** de iOS o un **dispositivo iOS** conectado.
3.  **Ejecuta la Aplicación**:
    Haz clic en el botón de **"Run"** (el icono de triángulo verde) en la barra de herramientas de Xcode. La aplicación se instalará y ejecutará en el simulador o dispositivo seleccionado.

---

## Cambios Realizados

Se han implementado las siguientes características principales:

* **Infinite Scroll**:
    * Se añadió una funcionalidad de **desplazamiento infinito** a la lista de tareas. Ahora, las tareas se cargan en lotes a medida que el usuario se desplaza hacia abajo, mejorando el rendimiento y la experiencia de usuario para listas extensas.
    * La lógica de paginación se maneja en el código TypeScript (`tasks.page.ts`), controlando qué tareas se muestran y cuándo cargar el siguiente bloque.
    * El componente `ion-infinite-scroll` se ha integrado en la plantilla (`tasks.page.html`) para activar el evento de carga.
