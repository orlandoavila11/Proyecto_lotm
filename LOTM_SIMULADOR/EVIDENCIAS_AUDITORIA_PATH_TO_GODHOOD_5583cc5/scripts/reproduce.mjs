// Auditoría no destructiva: usa SQLite en memoria. No modifica el código del proyecto.
// Ejecutar desde LOTM_SIMULADOR: node --import tsx /ruta/reproduce.mjs
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const root = resolve(process.argv[2] || process.cwd());
const imp = p => import(pathToFileURL(resolve(root,p)).href);
const { buildApp } = await imp('reborn/src/server/app.ts');
const { EconomyEngine } = await imp('reborn/src/core/economy/EconomyEngine.ts');
const { IdentityEngine } = await imp('reborn/src/core/identity/IdentityEngine.ts');
const { setDeterministicSeed } = await imp('reborn/src/core/rng/IdGenerator.ts');
const { apiClient } = await imp('ui/src/services/apiClient.ts');
const out = {};
const {app,db}=await buildApp();
const post=async(url,payload)=>{const r=await app.inject({method:'POST',url,payload});return {status:r.statusCode,body:r.json()};};
try {
 const created=await post('/api/character/new',{name:'Audit Character',pathway:'FOOL'});
 if(created.status!==201)throw new Error(JSON.stringify(created));
 const id=created.body.character.id;
 const require=createRequire(resolve(root,'package.json'));
 const React=require('react');const {renderToStaticMarkup}=require('react-dom/server');
 const {CandleObject}=await imp('ui/src/features/desk/objects/CandleObject.tsx');
 const tier=created.body.somatics.sanityTier;
 try {renderToStaticMarkup(React.createElement(CandleObject,{tier,description:'API value'}));out.somaticsRender={tier,crash:false};}
 catch(e){out.somaticsRender={tier,crash:true,error:e.message};}
 out.health=(await app.inject('/api/health')).json();
 const calendar=await post('/api/calendar/action',{characterId:id,actionType:'WORK'});
 out.calendarContract={status:calendar.status,returned:{day:calendar.body.day,slot:calendar.body.slot},persisted:{day:db.getCharacter(id).current_day,slot:db.getCharacter(id).current_slot}};
 const anchorBefore=db.getTotalAnchorStrength(id);
 const social=await post('/api/calendar/action',{characterId:id,actionType:'SOCIALIZE'});
 out.socialize={status:social.status,declaredAnchorDelta:social.body.mechanicalDeltas.anchorStrengthDelta,anchorBefore,anchorAfter:db.getTotalAnchorStrength(id)};
 const duplicate={characterId:id,actionType:'WORK',commandId:'audit-same-request'};
 const before=structuredClone(db.getCharacter(id));
 const d1=await post('/api/calendar/action',duplicate);const d2=await post('/api/calendar/action',duplicate);
 out.duplicateCalendar={statuses:[d1.status,d2.status],before:{day:before.current_day,slot:before.current_slot},after:{day:db.getCharacter(id).current_day,slot:db.getCharacter(id).current_slot}};
 const event=IdentityEngine.getEvents()[0];
 const ir=await post('/api/identity/resolve',{characterId:id,eventId:event.id,optionIndex:9999});
 const ir2=await post('/api/identity/resolve',{characterId:id,eventId:event.id,optionIndex:9999});
 out.identityInvalidAndReplay={event:event.id,statuses:[ir.status,ir2.status],chosenOption:ir.body.chosenOption?.text,history:db.getIdentityEventHistory(id).map(x=>({event:x.event_id,option:x.chosen_option_index,day:x.day,slot:x.slot}))};
 await post('/api/combat/start',{characterId:id});
 const move=await post('/api/combat/action',{characterId:id,actionType:'MOVE',targetPosition:{x:999,y:-100}});
 const moveRepeat=[];
 for(let i=0;i<5;i++){const m=await post('/api/combat/action',{characterId:id,actionType:'MOVE',targetPosition:{x:0,y:2}});moveRepeat.push({status:m.status,ap:m.body.player?.ap,turn:m.body.state?.turnCount});}
 out.combatInvalidMove={status:move.status,position:move.body.player?.position,ap:move.body.player?.ap,repeats:moveRepeat};
 const oldDay=db.getCharacter(id).current_day;
 const rewind=await post('/api/character/advance-day',{characterId:id,days:-10});
 out.negativeDay={status:rewind.status,before:oldDay,after:db.getCharacter(id).current_day};
 db.updateCharacterSomatics(id,{digestion:100,sanity:100,corruption:0});
 const ingredientCount=db.getInventoryItems(id).filter(x=>x.category==='INGREDIENT').length;
 const asc=await post('/api/character/advance',{characterId:id});
 out.legacyAscension={ingredientCount,status:asc.status,response:asc.body,sequenceAfter:db.getCharacter(id).sequence};

 // Fallo inyectado exactamente después de cobrar: comprueba la atomicidad.
 const market=EconomyEngine.getMarketCatalog().markets[0];
 const item=market.inventory[0];
 const moneyBefore=db.getCharacter(id).raw_pence;
 const addOriginal=db.addInventoryItem.bind(db);
 db.addInventoryItem=()=>{throw new Error('AUDIT_INJECTED_INVENTORY_FAILURE');};
 const failedBuy=await post('/api/economy/buy',{characterId:id,districtId:market.districtId,itemCode:item.id,quality:item.availableQualities[0]});
 db.addInventoryItem=addOriginal;
 out.purchaseAtomicity={injectedFailure:true,status:failedBuy.status,moneyBefore,moneyAfter:db.getCharacter(id).raw_pence,itemCode:item.id,itemReceived:db.getInventoryItems(id).some(x=>x.item_code===item.id)};

 // El mismo estado inicial del generador es el que hay tras cada arranque.
 setDeterministicSeed(13530101);
 const one=await post('/api/calendar/action',{characterId:id,actionType:'WORK'});
 const workBefore=db.getCharacter(id).work_attendance_weekly;
 setDeterministicSeed(13530101);
 const two=await post('/api/calendar/action',{characterId:id,actionType:'WORK'});
 out.resetIdCollision={simulatesGeneratorRestart:true,statuses:[one.status,two.status],error:two.body.error,workBefore,workAfter:db.getCharacter(id).work_attendance_weekly};
 // Reproduce las respuestas silenciosas del cliente ante errores HTTP.
 const originalFetch=globalThis.fetch;
 globalThis.fetch=async()=>new Response(JSON.stringify({error:'test offline'}),{status:503,headers:{'Content-Type':'application/json'}});
 out.uiFallback503={acting:await apiClient.resolveActingDilemma('missing','missing','missing'),identity:await apiClient.resolveIdentityEvent('missing','missing',0)};
 globalThis.fetch=originalFetch;
 out.fixtureCharacter=(await app.inject('/api/character/char_fixture_fool_01')).statusCode;
} finally {await app.close();db.close();}
console.log(JSON.stringify(out,null,2));
if(process.env.AUDIT_RESULT_FILE)writeFileSync(process.env.AUDIT_RESULT_FILE,JSON.stringify(out,null,2)+'\n');
