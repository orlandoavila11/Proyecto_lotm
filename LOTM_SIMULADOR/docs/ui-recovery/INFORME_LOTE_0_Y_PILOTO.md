# Informe de Ejecución de Lote 0 y Piloto Lote 1

**Proyecto:** Path to Godhood (*LOTM_ENGINE_REBORN*)  
**Fecha:** 21 de septiembre de 2026  
**Órdenes Ejecutadas:** `GFX00`, `GFX01`, `GFX02`, `GFX03`, `GFX12`, `GFX13`, `GFX14`  
**Estado:** LISTO PARA REVISIÓN HUMANA (HUMAN_REVIEW)  
**Fase de Producto:** Fase 1 ABIERTA (Briefs R0–R10 / GFX00–GFX72)  

---

## 1. Entregables de Lote 0 (Inventario y Contrato)

1. **`production_inventory.json`** (`GFX00`):
   - Ubicación: [`art/manifest/production_inventory.json`](file:///d:/Users/sammy.avila/Documents/GitHub/LOTM_SIMULADOR%20Gemini/Simulador/LOTM_SIMULADOR/art/manifest/production_inventory.json) y [`docs/ui-recovery/production_inventory.json`](file:///d:/Users/sammy.avila/Documents/GitHub/LOTM_SIMULADOR%20Gemini/Simulador/LOTM_SIMULADOR/docs/ui-recovery/production_inventory.json).
   - Cobertura: 8 pantallas/etapas, 11 objetos del Desván, 17 estados somáticos cualitativos, 6 orígenes canónicos, 8 pistas del Caso Cherwood con 4 tipos de hilos, 35 celdas tácticas (7×5), 8 marcas de estado y 5 puertas de ascensión.
   - Resolución de conflictos canónicos: Mapeo tipado de vela (`BRILLANTE`, `VACILANTE`, `CREPITANTE`, `AHOGADA_EN_CERA`) vs Biblia (*Plena, Vacilante, Humeante, Moribunda*), espejo (*Limpio, Turbio, Ondulante, Monstruoso*), y formato monetario diegético (`£ / s / d`).

2. **`art_contract.md`** (`GFX01`):
   - Ubicación: [`art/manifest/art_contract.md`](file:///d:/Users/sammy.avila/Documents/GitHub/LOTM_SIMULADOR%20Gemini/Simulador/LOTM_SIMULADOR/art/manifest/art_contract.md) y [`docs/ui-recovery/art_contract.md`](file:///d:/Users/sammy.avila/Documents/GitHub/LOTM_SIMULADOR%20Gemini/Simulador/LOTM_SIMULADOR/docs/ui-recovery/art_contract.md).
   - Especificaciones: Lienzo lógico `1920 × 1080`, 7 presets de cámara 2.5D, pila de renderizado en 9 capas desacopladas, zonas seguras (`1280×720` a `2560×1440`), regla de sombras desacopladas y canal alfa real.

---

## 2. Entregables de Lote 1 (Piloto de Dirección de Arte)

### A. Muestra de Materiales (`S0` - `GFX02`)
- **Descripción:** Muestra continua de 6 texturas arquetípicas victorianas: caoba envejecida, latón mate, papel de fibra marfil, cuero marrón oscuro, cera de sebo y azogue plateado líquido.
- **Iluminación:** Luz cálida principal a la izquierda, relleno frío difuso a la derecha.

### B. Composición Maestra del Desván (`C0` - `GFX03`)
- **Descripción:** Encuadre espacial de tres cuartos ligeramente elevado.
- **Puntos funcionales distribuidos:**
  1. *Vela de sebo* en soporte de latón (izquierda)
  2. *Espejo de azogue* ovalado (centro-izquierda)
  3. *Mesa de caoba* en primer término
  4. *Libro de actuación* encuadernado en cuero cerrado
  5. *Papeles de identidad* en blanco
  6. *Bolsa de cuero* (monedero)
  7. *Almanaque y reloj de latón* (derecha)
  8. *Carta sellada* con lacre rojo
  9. *Tablero de corcho* en pared derecha
  10. *Hornacina ritual con Cáliz de plata* en pared frontal
  11. *Escalera de caracol de madera* al fondo a la izquierda

### C. Trío Piloto Aislado (`O0` - `GFX12`, `GFX13`, `GFX14`)
1. **`GFX12` (Vela de sebo):** Portavelas de latón, cuerpo de cera con desgaste, mecha sin llama (lista para SVG/CSS). Aislada sobre fondo gris neutro uniforme.
2. **`GFX13` (Espejo de azogue):** Marco ovalado de latón, pie de apoyo, superficie de azogue plateada limpia sin rostros reflejados. Aislado sobre gris neutro.
3. **`GFX14` (Libro de actuación cerrado):** Encuadernación en cuero noble con lomo cosido y cantos gastados, sin textos ni símbolos mágicos. Aislado sobre gris neutro.

---

## 3. Próximos Pasos (Lote 2: Separación de Capas en Krita)

Una vez ratificadas las referencias `S0`, `C0` y `O0` por el Director:
1. Ejecutar `GFX05`: Separación del archivo maestro `C0` en capas KRA (fondo, estante, escalera, mesa, objetos, sombras).
2. Ejecutar `GFX06` y `GFX07`: Reconstrucción de fondo limpio y mesa limpia de caoba sin objetos horneados.
3. Preparación de estados somáticos de vela (`GFX23`), espejo (`GFX24–26`) y grietas de ruina (`GFX27`).

