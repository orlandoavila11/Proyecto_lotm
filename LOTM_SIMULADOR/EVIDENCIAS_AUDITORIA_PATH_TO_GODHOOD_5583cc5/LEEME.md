# Evidencia de auditoría — Path to Godhood

Commit auditado: 5583cc5c940ae5d8a056d7af5560b93c9af40afd.
Fecha: 23 de septiembre de 2026. Entorno local: Node 24.19.0.

Leer AUDITORIA.md antes de ejecutar los scripts. Son reproducciones de defectos sobre el código existente; no aplican arreglos.

1. Obtener ese commit del repositorio y entrar en LOTM_SIMULADOR.
2. Instalar dependencias según el informe.
3. Ejecutar: node --import tsx /ruta/extraida/scripts/reproduce.mjs
4. Para la prueba de reinicio, ejecutar restart_probe.mjs dos veces como procesos separados, pasando la ruta absoluta de LOTM_SIMULADOR y una misma ruta NUEVA de SQLite temporal. El comando completo aparece en AUDITORIA.md.

reproduce.mjs usa SQLite en memoria e inyecta un fallo de inventario para demostrar ausencia de rollback. También reemplaza fetch temporalmente para simular HTTP 503. No conecta a una partida externa.

restart_probe.mjs modifica la base temporal indicada. No debe apuntar a una partida real.

Los resultados incluyen fallos esperados del commit auditado. resetIdCollision en reproductions.json simula el reinicio del generador dentro de un proceso; restart_results.json demuestra adicionalmente el problema con dos procesos nuevos y una base persistida.

Los logs distinguen los fallos del proyecto de las limitaciones de ejecución local. No se completó una prueba interactiva nueva de navegador.

assets_and_imports.json contiene un inventario estático de imágenes e imports relativos desde main.tsx; no mide descarga inicial ni demuestra formalmente código muerto. ci_verified.json resume los jobs remotos consultados.
