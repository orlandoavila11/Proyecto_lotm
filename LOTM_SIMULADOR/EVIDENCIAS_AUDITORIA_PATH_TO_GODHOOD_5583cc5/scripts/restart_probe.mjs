// Ejecutar dos veces con el mismo archivo NUEVO de SQLite, desde LOTM_SIMULADOR.
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const root=resolve(process.argv[2]);const dbPath=resolve(process.argv[3]);
const {DatabaseClient}=await import(pathToFileURL(resolve(root,'reborn/src/infra/database/DatabaseClient.ts')));
const {CalendarEngine}=await import(pathToFileURL(resolve(root,'reborn/src/core/calendar/CalendarEngine.ts')));
const db=new DatabaseClient(dbPath);const id='audit_restart_character';
if(!db.getCharacter(id))db.createCharacter({id,name:'Audit Restart',pathway:'FOOL',sequence:9,current_health:100,max_health:100,current_spirituality:100,max_spirituality:100,sanity:95,corruption:0,digestion_progress:10,raw_pence:2400,current_location:'Backlund',current_day:1});
const before=db.getCharacter(id);let error=null;
try{CalendarEngine.performSlotAction(db,id,'WORK');}catch(e){error=e.message;}
const after=db.getCharacter(id);
console.log(JSON.stringify({pid:process.pid,error,before:{day:before.current_day,slot:before.current_slot,work:before.work_attendance_weekly},after:{day:after.current_day,slot:after.current_slot,work:after.work_attendance_weekly},logs:db.getCalendarLogs(id).map(x=>x.id)}));
db.close();
