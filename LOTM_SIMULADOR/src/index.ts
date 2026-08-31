import { DatabaseManager } from './database/DatabaseManager';
import { Player } from './character/Player';
import { MysticalMarket } from './market/MysticalMarket';

function verifyCanonEconomyMarket() {
  console.log("==================================================");
  console.log("      CHRONICLES OF THE FOOL - CANON ECONOMY      ");
  console.log("==================================================");

  // 1. Cargar Base de Datos
  const db = DatabaseManager.getInstance();
  db.loadAllData();

  const market = new MysticalMarket();

  // Instanciar a Klein Moretti como un Seer S-9 recién contratado
  console.log("\n🕵️‍♂️ --- EXAMINANDO MERCADO DE REINO DE LOEN (CANON) ---");
  const klein = new Player("PC_01", "Klein Moretti", "SEER", 9);
  klein.addCurrency(30, 0, 0); // Presupuesto inicial realista del lore: £30 Libras

  const catalog = market.generateCatalogForPlayer(klein);
  
  console.log(`   Billetera de Klein: £${klein.wallet.pounds} Libras.`);
  console.log("\n📋 ARTÍCULOS EN VENTA (Precios ajustados a la novela):");
  
  catalog.forEach(o => {
    console.log(`   └─ [${o.id}] Ítem: ${o.name} | Rango: S-${o.requiredMaxSequence} | Precio: £${o.pricePounds} Libras.`);
  });

  // Klein ejecuta la compra de su arma reglamentaria (£4 libras)
  console.log("\n⚔️  Klein compra su revólver de caza reglamentario (£4 libras)...");
  const weaponOffer = catalog.find(o => o.id === "MK_BSC_02");
  if (weaponOffer) {
    console.log(market.purchaseItem(weaponOffer, klein));
  }

  // Klein compra el primer ingrediente de su poción actual extraído de tu JSON (£15 libras)
  const currentPillOffer = catalog.find(o => o.id === "MK_DYNAMIC_ING_0");
  if (currentPillOffer) {
    console.log(`\n🧪 Klein compra el ingrediente dinámico para su avance de Secuencia 9 [${currentPillOffer.name}] (£15 libras)...`);
    console.log(market.purchaseItem(currentPillOffer, klein));
  }

  // Reporte de inventario físico
  console.log("\n🎒 Contenido final de la mochila de Klein:");
  klein.inventory.getAllItems().forEach(item => {
    console.log(`   └─ Objeto: [${item.name}] | Unidades: ${item.quantity}`);
  });
  console.log(`\n💰 Balance financiero restante de Klein: £${klein.wallet.pounds} Libras.`);
  console.log("==================================================");
}

verifyCanonEconomyMarket();
