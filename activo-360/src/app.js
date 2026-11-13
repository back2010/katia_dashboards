const T0 = '2026-10-13';
const MES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const money=n=>'$'+Math.round(n||0).toLocaleString('es-MX');
const kmoney=n=>n>=1e6?'$'+(n/1e6).toFixed(2)+' M':n>=1e4?'$'+Math.round(n/1e3).toLocaleString('es-MX')+' mil':money(n);
const pd=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(Date.UTC(a,b-1,c))};
const iso=d=>d.toISOString().slice(0,10);
const addD=(s,n)=>{const d=pd(s);d.setUTCDate(d.getUTCDate()+n);return iso(d)};
const addY=(s,n)=>{const d=pd(s);d.setUTCFullYear(d.getUTCFullYear()+n);return iso(d)};
const diff=(a,b)=>Math.round((pd(b)-pd(a))/864e5);
const fd=s=>{if(!s)return'—';const d=pd(s);return d.getUTCDate()+' '+MES[d.getUTCMonth()]+' '+d.getUTCFullYear()};
const r50=n=>Math.max(50,Math.round(n/50)*50);
const isWk=s=>{const d=pd(s).getUTCDay();return d===0||d===6};
const bizDiff=(a,b)=>{let n=0,s=a;while(s<b){s=addD(s,1);if(!isWk(s))n++}return n};
const addBiz=(s,n)=>{while(n>0){s=addD(s,1);if(!isWk(s))n--}return s};
const sum=(a,f)=>a.reduce((s,x)=>s+(f?f(x):x),0);

/* ---------- Catálogos ---------- */
const VIDA={'Escritorio':5,'Laptop':3,'Monitor':5,'Diadema':2,'Hub USB-C':3,'Memoria USB':2,'Divisor de pantalla':3};
const defaultCfg=()=>({tab:{opt:{A:{min:50,d:30,dc:20},B:{min:30,d:50,dc:30},C:{min:0,d:70,dc:40}},vb:{Escritorio:1384,Laptop:1384},resid:10,
    pen:{lento:25,estB:20,estC:40,puertos:15,monF:15,noMon:25,perif:10,noDisk:20,cpu:10,gen:10,ram:10}},pmax:{'Escritorio':800,'Laptop':1000},ded:{i3:150,genOld:100,ram4:80,hdd:50,noDisk:150,monF:100,noMon:250,noPerif:50,noCharger:100,anio:50},piso:150,aptos:.4,
  acc:{'Monitor':250,'Diadema':50,'Hub USB-C':60,'Memoria USB':20,'Divisor de pantalla':80},est:{A:1,B:.85,C:.7},lento:.85,puertos:.9,
  meta:.7,sla:{SIS:3,AF:1,ING:2,FAC:2,FIS:5},prio:3,max:1,bloqDev:true,
  plazo:{firmas:1,pago:2,reintento:2,sinVenta:15,subasta:5,donFact:10},subastaMin:.5,
  banco:{banco:'Por configurar',titular:'Salud Digna, A.C.',clabe:'Por configurar',concepto:'Folio de la venta'},
  kg:{'Escritorio':12,'Laptop':2.2,'Monitor':4.5,'Diadema':.2,'Hub USB-C':.15,'Memoria USB':.02,'Divisor de pantalla':.3},
  donatarias:['Escuela Primaria Federal (SEP) · donataria autorizada','DIF Municipal','Casa Hogar comunitaria A.C. · donataria autorizada SAT','Centro Comunitario de Capacitación A.C.']});
const C=()=>S.cfg;
const MAIL_FAC='cfdifacturacion@salud-digna.org';
const AREAS={AF:'Activo Fijo',ING:'Ingresos',FAC:'Facturación',FIS:'Fiscal (Jurídico)',SIS:'Sistemas (ingeniero de clínica)',COL:'Colaborador',JEFE:'Jefe inmediato'};
const RT={
  PRECIO:{n:'Autorización de precio',a:'AF',ch:'humand',d:'valida o modifica el precio sugerido por el diagnóstico'},
  DECISION:{n:'Equipo sin venta',a:'AF',ch:'humand',d:'decide si baja el precio, inicia subasta, destruye o dona'},
  FIRMA_COL:{n:'Firma del formato de compra',a:'COL',ch:'firma',d:'el colaborador firma el formato SGC-N4-60 prellenado'},
  FIRMA_JEFE:{n:'Firma del jefe inmediato',a:'JEFE',ch:'firma',d:'el jefe firma el formato de su colaborador'},
  DEPOSITO:{n:'Confirmación de depósito',a:'ING',ch:'humand',d:'valida el váucher del depósito'},
  FACTURA:{n:'Emisión de factura',a:'FAC',ch:'correo',d:'adjunta el CFDI en Activo 360'},
  AGENDA:{n:'Agendar entrega',a:'SIS',ch:'correo',d:'prepara el equipo y propone fecha y hora'},
  DONFACT:{n:'Factura de la donataria',a:'AF',ch:'humand',d:'adjunta la factura emitida por la donataria'},
  REVFIS:{n:'Revisión fiscal de donación',a:'FIS',ch:'correo',d:'revisa que la factura cumpla los requisitos fiscales'},
};
const ST={
  VIGENTE:['Vigente','p-ok'],ALERTA:['Alerta: cumple vida útil en ≤3 meses','p-warn'],VENCIDO:['Cumplió vida útil','p-bad'],
  CONFIRMADO:['Por diagnosticar','p-info'],PRECIO:['En Activo Fijo (precio)','p-hm'],PUBLICADO:['Disponible en Bazar','p-sd'],SUBASTA:['En subasta','p-warn'],
  FIRMAS:['Congelado · firmas del formato','p-hm'],PAGO:['Congelado · esperando depósito','p-warn'],DEPOSITO:['Congelado · Ingresos valida','p-hm'],
  FACTURA:['Vendido · en Facturación','p-info'],AGENDA:['Vendido · por agendar entrega','p-info'],ENTREGA:['Vendido · cita de entrega','p-info'],
  ENTREGADO:['Vendido y entregado','p-ok'],DESTRUCCION:['Para destrucción certificada','p-mut'],RECOLECCION:['Recolección programada','p-mut'],DESTRUIDO:['Destruido (certificado)','p-mut'],
  DONACION:['Donación · por entregar','p-info'],DONADO_FACT:['Donado · falta factura de la donataria','p-warn'],DONADO:['Donado','p-ok']
};
const SOLD=['FACTURA','AGENDA','ENTREGA','ENTREGADO'],FROZEN=['FIRMAS','PAGO','DEPOSITO'],DESTR=['DESTRUCCION','RECOLECCION','DESTRUIDO'],DON=['DONACION','DONADO_FACT','DONADO'];
const DFLOW=[['Por entregar','DONACION'],['Factura donataria','DONADO_FACT'],['Donado','DONADO']];
const FLOW=[['Diagnóstico','CONFIRMADO'],['Precio AF','PRECIO'],['Publicado','PUBLICADO'],['Firmas','FIRMAS'],['Depósito','PAGO'],['Ingresos','DEPOSITO'],['Factura','FACTURA'],['Agenda','AGENDA'],['Entrega','ENTREGA'],['Cerrado','ENTREGADO']];
const flowIdx=p=>p==='SUBASTA'?2:FLOW.findIndex(f=>f[1]===p);
const OWNER={CONFIRMADO:'SIS',PRECIO:'AF',PUBLICADO:'COL',SUBASTA:'COL',FIRMAS:'COL',PAGO:'COL',DEPOSITO:'ING',FACTURA:'FAC',AGENDA:'SIS',ENTREGA:'SIS',DONACION:'SIS',DONADO_FACT:'AF'};
const BUYERS=['Ana Gómez · Recepción','Luis Peña · Ultrasonido','Carla Ruiz · Optometría','Mario Soto · Almacén','Elena Vidal · Laboratorio','Iris Castro · Nutrición'];
const JEFES=['Dra. Laura Félix','Dr. Óscar Zamora','Lic. Paola Ibarra','Ing. Raúl Montaño','Dra. Sofía Rentería','Lic. Tomás Cota'];
const ME={name:'Karla Méndez',emp:'104582',puesto:'Recepcionista',area:'Recepción',jefe:'Lic. Paola Ibarra'};
// Horas-hombre por equipo vendido (supuestos editables en la reunión con cada área)
const HH_MANUAL=[['Diagnóstico y listado en Excel','Sistemas',.75],['Tabulador y envío a Humand','Activo Fijo',.5],['Atención de ticket y verificación de existencia','Activo Fijo',.5],['Formato impreso, firma y escaneo','Colaborador / Activo Fijo',.5],['Envío de link de pago y seguimiento','Activo Fijo',.25],['Llevar la ficha a Ingresos y confirmar','Activo Fijo / Ingresos',.35],['Solicitud y emisión de factura por correo','Activo Fijo / Facturación',.4],['Avisos y entrega','Activo Fijo / Sistemas',.5]];
const HH_A360=[['Diagnóstico en la herramienta','Sistemas',.33],['Aprobar precio en Humand','Activo Fijo',.05],['Firma electrónica del formato','Colaborador / jefe',.05],['Validar váucher en Humand','Ingresos',.1],['Adjuntar CFDI desde el correo','Facturación',.2],['Agendar y entregar','Sistemas',.3]];
const HHM=sum(HH_MANUAL,x=>x[2]),HHA=sum(HH_A360,x=>x[2]),HH_CARTA=[.5,.1];
Object.defineProperty(window,'HOLD',{get:()=>S?.cfg?.plazo?.pago??2});Object.defineProperty(window,'META',{get:()=>S?.cfg?.meta??.85});


/* ---------- Integración AppSheet (formato real de la vista de equipos) ---------- */
const AS_COLS=()=>DATA.appsheet.cols;
const AS_REQ=['CENTRO DE TRABAJO','AREA','ESTATUS','MARCA','MODELO','INSTALACION','# DE SERIE'];
const AS_VIVOS=['ACTIVO','RESGUARDO','PLAN DE RENOVACION / ENVIADO A CSI',''];
const ASP={'ACTIVO':'p-ok','PLAN DE RENOVACION / ENVIADO A CSI':'p-info','RESGUARDO':'p-warn','VENDIDO':'p-sd','DESTRUIDO':'p-mut','TRANSFERIDO':'p-mut','DONADO':'p-sd'};
const aspill=s=>`<span class="pill ${ASP[s]||'p-mut'}" title="Estatus en AppSheet">${esc(s==='PLAN DE RENOVACION / ENVIADO A CSI'?'Plan de renovación':s?s.charAt(0)+s.slice(1).toLowerCase():'Sin estatus')}</span>`;
const asObjs=t=>t.rows.map(r=>{const o={};t.cols.forEach((c,i)=>o[c]=r[i]??'');return o});
const ACC={RECEPCION:'Recepción',OPTOMETRIA:'Optometría',DENSITOMETRIA:'Densitometría',MASTOGRAFIA:'Mastografía',TOMOGRAFIA:'Tomografía',MAGNETICA:'magnética',NUTRICION:'Nutrición',ALMACEN:'Almacén',CAPACITACION:'capacitación',AREA:'área'};
const niceArea=a=>String(a||'').trim().split(/\s+/).map((w,i)=>{const n=ACC[w]||w.toLowerCase();return i?n.toLowerCase():n.charAt(0).toUpperCase()+n.slice(1)}).join(' ');
const nkey=s=>String(s||'').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' ').trim();
function genOf(cpu){const s=String(cpu||'');let m=s.match(/(\d{1,2})th Gen/i);if(m)return+m[1];m=s.match(/i[3579]-(\d{4,5})/i);if(m)return m[1].length===5?+m[1].slice(0,2):+m[1][0];
  m=s.match(/Ryzen\s*\d\s*(?:PRO\s*)?(\d)\d{3}/i);if(m)return({2:8,3:9,4:10,5:11,7:12})[m[1]]||9;if(/\bA\d{1,2}\b|A\d-|PRO A\d/i.test(s))return 6;return 8}
const tipoAS=d=>{const s=String(d||'CPU').toUpperCase();return /LAP/.test(s)?'Laptop':/MON/.test(s)?'Monitor':'Escritorio'};
/* rows: objetos con encabezados AppSheet originales (o normalizados con normK) */
function mapAS(rows,name){
  const g=(r,k)=>{if(k in r)return r[k];const n=normK(k);return r[n]??''};
  const dir={};DATA.clinics.forEach(c=>dir[nkey(c.n)]=c);
  const usr={};rows.forEach(r=>{const c=nkey(g(r,'CENTRO DE TRABAJO')),u=String(g(r,'USUARIO')).trim();if(u){(usr[c]??={})[u]=(usr[c][u]||0)+1}});
  const topU=c=>{const o=usr[c];return o?Object.entries(o).sort((a,b)=>b[1]-a[1])[0][0]:''};
  const inv=[],prev=[];let bad=0;const seen=new Set();
  const mdy=isMDY(rows.flatMap(r=>[g(r,'INSTALACION'),g(r,'FIN DE GARANTIA'),g(r,'MODIFICADO EL:')]));
  rows.forEach(r=>{const raw={};AS_COLS().forEach(c=>raw[c]=String(g(r,c)??''));
    const st=nkey(raw['ESTATUS']),serie=raw['# DE SERIE'].trim(),clin=raw['CENTRO DE TRABAJO'].replace(/\s+/g,' ').trim();
    let fa=normDate(g(r,'INSTALACION'),mdy);if(!fa||fa<'2000'){const gw=normDate(g(r,'FIN DE GARANTIA'),mdy);fa=gw&&gw>'2003'?addY(gw,-3):null}
    if(!serie||!clin||!fa){bad++;return}
    if(!AS_VIVOS.includes(st)||seen.has(serie)){prev.push(raw);return}seen.add(serie);
    const c=dir[nkey(clin)],t=tipoAS(raw['DISPOSITIVO']),cpu=raw['PROCESADOR'];
    const ing=String(raw['USUARIO']).trim()||topU(nkey(clin))||'Ingeniero de Sistemas';
    inv.push({ID_ACTIVO:serie,NUM_SERIE:serie,CLINICA:clin,MUNICIPIO:c?.m||clin.split(' ')[0],ESTADO:c?.e||'',ZONA:c?.z||raw['ZONA'],DIVISION:raw['ZONA']||c?.dv||'',
      SERVICIO:niceArea(raw['AREA']),UBICACION:'Estación '+(raw['UBICACIÓN']||'1'),TIPO_EQUIPO:t,MARCA:raw['MARCA'],MODELO:raw['MODELO'],PROCESADOR:cpu,GENERACION:genOf(cpu),
      RAM_GB:parseInt(raw['RAM(GB)'])||8,ALMACENAMIENTO:raw['DISCO DURO (HDD, SSD)']||'',MONITOR:t==='Escritorio'?'Monitor de la estación':'',SO:raw['SistemaOperativo']||'',
      FECHA_ADQUISICION:fa,COSTO_ADQUISICION:0,VIDA_UTIL_ANIOS:VIDA[t]||5,INGENIERO:ing,CORREO_INGENIERO:'',
      AS_ESTATUS:st,_p0:st==='PLAN DE RENOVACION / ENVIADO A CSI'?'CONFIRMADO':null,_d0:normDate(String(raw['MODIFICADO EL:']).slice(0,10),mdy),as:raw})});
  return{inv,prev,bad,mdy,name:name||'AppSheet',total:rows.length}}
let BASE0=null;const base0=()=>BASE0||(BASE0=mapAS(asObjs(DATA.appsheet),'Demo en formato AppSheet'));
function applyAS(items){items.forEach(e=>{if(e._p0==='CONFIRMADO'&&!e.p){e.p='CONFIRMADO';const d=e._d0&&e._d0<=S.today&&diff(e._d0,S.today)<=30?e._d0:S.today;
  e.hist.push({d,t:'Reemplazo confirmado: AppSheet en "Plan de renovación / enviado a CSI"'+(e.as?.['# DE SERIE NUEVO EQUIPO']?' · equipo nuevo '+e.as['# DE SERIE NUEVO EQUIPO']:''),a:'SIS',k:''})}})}
/* estatus que Activo 360 devuelve a AppSheet según la etapa del proceso */
function asStatus(e){const p=e.p;if(!p)return e.AS_ESTATUS||'ACTIVO';if(SOLD.includes(p))return'VENDIDO';if(p==='DESTRUIDO')return'DESTRUIDO';if(DON.includes(p)&&p!=='DONACION')return'DONADO';
  if(p==='CONFIRMADO')return'PLAN DE RENOVACION / ENVIADO A CSI';return'RESGUARDO'}
function asExportRows(){const now=new Date(),z=n=>String(n).padStart(2,'0'),[y,m,d]=S.today.split('-');const ts=`${d}/${m}/${y} ${z(now.getHours())}:${z(now.getMinutes())}:${z(now.getSeconds())}`;
  return[...S.items.filter(e=>e.as).map(e=>{const o={...e.as};const ns=asStatus(e);if(ns!==o['ESTATUS']){o['ESTATUS']=ns;o['MODIFICADO EL:']=ts}o['ESTATUS ACTIVO 360']=ST[stOf(e)][0];o['PRECIO AUTORIZADO']=e.price?.aut??'';o['FOLIO VENTA']=e.sale?.folio||'';return o}),
    ...S.prev.map(o=>({...o,'ESTATUS ACTIVO 360':'Histórico (antes de Activo 360)','PRECIO AUTORIZADO':'','FOLIO VENTA':''}))]}
/* Apps Script: lectura directa de la hoja AppSheet */
const GAS=typeof google!=='undefined'&&google.script&&google.script.run;


/* ---------- Saludo ---------- */
function userName(){let n='';try{n=localStorage.getItem('activo360-nombre')||''}catch(e){}return n||window.A360_USER||''}
function greet(){const d=new Date(),h=d.getHours();const s=h<12?'Buenos días':h<19?'Buenas tardes':'Buenas noches';const n=userName();
  const f=DIAS[d.getDay()].replace(/^./,c=>c.toUpperCase())+', '+d.getDate()+' de '+MESL[d.getMonth()];return{s,n,f,line:n?`${s}, <b>${esc(n)}</b>`:s}}
function paintGreet(){const g=greet(),a=alerts();$('#greet').innerHTML=`<div class="gh">${g.line}</div><div class="gs">${g.f} · Activo 360</div>`;
  const nb=a.filter(x=>x.l!=='info').length;$('#bell').innerHTML=`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>${nb?`<span>${nb}</span>`:''}`;$('#bell').setAttribute('aria-label',`Alertas: ${nb}`)}
function welcome(){try{if(sessionStorage.getItem('a360-hola'))return;sessionStorage.setItem('a360-hola','1')}catch(e){}
  const g=greet(),a=alerts(),bad=a.filter(x=>x.l==='bad').length,warn=a.filter(x=>x.l==='warn').length;
  const el=document.createElement('div');el.className='hola';el.innerHTML=`<div class="holac" role="dialog" aria-label="Bienvenida"><img src="${$('.navlogo').src}" alt=""><h2>${g.line}</h2><p>${g.f}</p>
   <div class="holak"><span class="pill p-bad">${bad} urgentes</span><span class="pill p-warn">${warn} por atender</span></div>
   <div class="row" style="justify-content:center;margin-top:14px"><button class="btn p" data-hola="alertas">Ver alertas</button><button class="btn" data-hola="">Entrar</button></div>
   ${userName()?'':'<p class="note" style="margin-top:12px"><a href="#" data-nombre>¿Cómo te llamas?</a> para saludarte por tu nombre.</p>'}</div>`;
  document.body.appendChild(el);const close=v=>{el.classList.add('out');setTimeout(()=>el.remove(),350);if(v)go(v)};
  el.onclick=ev=>{const b=ev.target.closest('[data-hola]');if(b)close(b.dataset.hola);else if(ev.target.closest('[data-nombre]')){ev.preventDefault();askName()}else if(ev.target===el)close()};
  setTimeout(()=>el.isConnected&&!el.matches(':hover')&&close(),6000)}
function askName(){const n=prompt('¿Cómo quieres que te salude?',userName());if(n!=null){try{localStorage.setItem('activo360-nombre',n.trim())}catch(e){}paintGreet();$('.hola')?.remove()}}

/* ---------- Alertas ---------- */
function alerts(){if(!S)return[];const o=[],K=C(),add=(l,cat,t,d,act)=>o.push({l,cat,t,d,act});
  const byC=(f)=>{const g={};S.items.filter(f).forEach(e=>(g[e.CLINICA]??=[]).push(e));return Object.entries(g).sort((a,b)=>b[1].length-a[1].length)};
  byC(e=>!e.p&&baseSt(e)==='VENCIDO').forEach(([c,l])=>add('bad','Vida útil',`${c}: ${l.length} ${l.length>1?'equipos cumplieron':'equipo cumplió'} 5 años sin iniciar proceso`,`Instalados ${[...new Set(l.map(e=>e.as?.['INSTALACION']||fd(e.FECHA_ADQUISICION)))].slice(0,3).join(', ')}${l.length>3?'…':''} · ${l[0].INGENIERO}`,{eng:c}));
  S.items.map(e=>[e,sisTask(e)]).filter(([e,t])=>t&&!t.ok).forEach(([e,t])=>add('bad','Sistemas',`Diagnóstico atrasado · ${e.ID_ACTIVO}`,`${e.CLINICA} · ${t.days} días hábiles (meta ${K.sla.SIS}) · ${e.INGENIERO}`,{eq:e._i}));
  S.reqs.filter(r=>r.state==='Pendiente'&&!slaOk(r)).forEach(r=>{const e=S.items[r.eq];if(!e)return;add('bad',AREAS[RT[r.type].a]||'Solicitud',`${RT[r.type].n} fuera de tiempo${r.esc?' · escalada':''}`,`${r.id} · ${e.ID_ACTIVO} · ${e.CLINICA} · ${reqDays(r)} días hábiles (meta ${slaOf(r)})`,{eq:e._i})});
  S.items.filter(e=>e.p==='PAGO'&&e.pay?.dl&&diff(S.today,e.pay.dl)<=1).forEach(e=>add('warn','Ingresos',`Depósito vence ${e.pay.dl===S.today?'hoy':fd(e.pay.dl)} · ${e.sale?.folio}`,`${e.buyer} · ${money(e.pay.amount)} · si no paga, el equipo regresa al Bazar`,{eq:e._i}));
  S.items.filter(e=>['PUBLICADO','SUBASTA'].includes(e.p)&&diff(e.pub,S.today)>=K.plazo.sinVenta).forEach(e=>add('warn','Bazar',`${diff(e.pub,S.today)} días en Bazar sin venta · ${e.ID_ACTIVO}`,`${e.CLINICA} · ${money(curPrice(e).v)} · Activo Fijo debe decidir`,{eq:e._i}));
  byC(e=>!e.p&&baseSt(e)==='ALERTA').forEach(([c,l])=>add('warn','Vida útil',`${c}: ${l.length} equipo${l.length>1?'s':''} cumple${l.length>1?'n':''} 5 años en ≤3 meses`,`Primero: ${fd(l.map(due).sort()[0])} · programar reemplazo con ${l[0].INGENIERO}`,{eng:c}));
  S.items.filter(e=>e.p==='DONADO_FACT'&&e.don?.d&&diff(e.don.d,S.today)>K.plazo.donFact).forEach(e=>add('warn','Activo Fijo',`Falta factura de donataria · ${e.ID_ACTIVO}`,`${e.don.org} · entregado ${fd(e.don.d)}`,{eq:e._i}));
  Object.entries(S.cartas).forEach(([emp,L])=>{const v=L[L.length-1];if(v.st==='Pendiente de firma'&&diff(v.d,S.today)>=2){const c=colOf(emp);add('warn','Cartas',`Carta responsiva sin firma · ${v.folio}`,`${c?.name||emp} · ${diff(v.d,S.today)} días · ${v.rem} recordatorio(s)`,{v:'carta'})}});
  S.col.filter(c=>c.st==='Baja laboral'&&assignedTo(c.emp).some(a=>a.estado==='Pendiente de devolución')).forEach(c=>add('bad','Sistemas',`Baja laboral con equipo sin devolver · ${c.name}`,`${assignedTo(c.emp).length} activo(s) pendiente(s) de devolución`,{v:'ti'}));
  const pl=S.items.filter(e=>e.p==='CONFIRMADO'&&e.AS_ESTATUS==='PLAN DE RENOVACION / ENVIADO A CSI').length;if(pl)add('info','AppSheet',`${pl} equipos en plan de renovación`,'Vienen de AppSheet y esperan diagnóstico del ingeniero',{v:'ingeniero'});
  (S.feedLog||[]).slice(0,3).forEach(f=>add('info','AppSheet',f.t,f.d,{v:'inventario'}));
  const g=engCur();return g?o.filter(a=>a.act&&(a.act.eq!=null?mine(S.items[a.act.eq]):a.act.eng?g.clinicas.includes(a.act.eng):false)):o}
const LV={bad:['p-bad','Urgente'],warn:['p-warn','Por atender'],info:['p-info','Aviso']};
function alertRow(a,i){return `<div class="alr ${a.l}"><span class="pill ${LV[a.l][0]}">${LV[a.l][1]}</span><div class="alt"><b>${esc(a.t)}</b><div class="note">${esc(a.cat)} · ${esc(a.d)}</div></div><button class="btn sm" data-alr="${i}">Ver</button></div>`}
function bindAlerts(list){$$('[data-alr]').forEach(b=>b.onclick=()=>{const a=list[+b.dataset.alr].act;if(a.eq!=null)openEq(a.eq);else if(a.eng){S.engClinic=a.eng;go('ingeniero')}else go(a.v)})}
/* ---------- Archivo de AppSheet en Drive (Apps Script) ---------- */
const PROC_K=['p','dx','price','pub','buyer','pay','fac','destD','hist'];
function mergeFeed(src){const byId={};S.items.forEach(e=>byId[e.ID_ACTIVO]=e);const fresh=freshItems(src.inv);let nNew=0,nCh=0;
  fresh.forEach(n=>{const o=byId[n.ID_ACTIVO];if(!o){nNew++;return}if(o.AS_ESTATUS!==n.AS_ESTATUS)nCh++;
    for(const k in o){if(PROC_K.includes(k)||!(k in n))n[k]=o[k]}n._old=o._i;delete byId[n.ID_ACTIVO]});
  const left=Object.values(byId),kept=left.filter(o=>o.p||!o.as);kept.forEach(o=>o._old=o._i);
  const out=[...fresh,...kept],map={};out.forEach((e,i)=>{if(e._old!=null)map[e._old]=i;e._i=i;delete e._old});
  S.reqs=S.reqs.filter(r=>map[r.eq]!=null);S.reqs.forEach(r=>r.eq=map[r.eq]);S.mails.forEach(m=>{if(m.eq!=null)m.eq=map[m.eq]??null});
  S.items=out;S.prev=src.prev;S.src=src.name;S.dxId=null;S.buyId=null;applyAS(S.items);
  return{nNew,nCh,nOut:left.length-kept.length}}
function feedLoad(src,stamp,silent){
  if(!src.inv.length){toast('El archivo no tiene equipos vigentes (formato AppSheet o plantilla de Activo 360)');return}
  const first=!S.feedStamp||/^Demo/.test(S.src||'');let msg;
  if(first){const ti={col:S.col,ast:S.ast,cartas:S.cartas,movs:S.movs,cfg:S.cfg};init(false,src);Object.assign(S,ti);msg=`${src.inv.length} equipos vigentes · ${src.prev.length} históricos`;if(window.A360_SIM&&simulate())msg+=' · con ventas de ejemplo'}
  else{const r=mergeFeed(src);msg=`+${r.nNew} nuevos · ${r.nCh} cambiaron estatus · ${r.nOut} salieron de vigentes`}
  S.feedStamp=stamp;(S.feedLog??=[]).unshift({t:'AppSheet actualizado desde Drive · '+fd(S.today),d:msg});S.feedLog.length=Math.min(S.feedLog.length,10);
  log('GET','Drive · '+src.name,'g',{filas:src.total,vigentes:src.inv.length,historicos:src.prev.length},'Activo 360 lee el archivo de AppSheet guardado en Drive.');
  save();render();toast('AppSheet actualizado · '+msg)}
function syncFeed(force){if(!GAS){toast('Disponible al publicar en Apps Script');return}
  const fail=err=>toast('No se pudo leer el archivo de Drive: '+(err&&err.message||err));
  google.script.run.withSuccessHandler(info=>{if(!info||!info.ok){force&&toast(info?.msg||'Configura FILE_ID en Code.gs');return}
    if(!force&&info.updated===S.feedStamp)return;force&&toast('Leyendo '+info.name+'…');
    google.script.run.withSuccessHandler(res=>{try{let rows=res.rows;
        if(!rows){const bin=atob(res.b64);let wb;if(/csv|text/i.test(res.mime)||/\.csv$/i.test(res.name)){const u=Uint8Array.from(bin,c=>c.charCodeAt(0));wb=XLSX.read(new TextDecoder('utf-8').decode(u).replace(/^\uFEFF/,''),{type:'string',raw:true})}
          else wb=XLSX.read(bin,{type:'binary',cellDates:true});rows=XLSX.utils.sheet_to_json(wb.Sheets[res.sheet&&wb.Sheets[res.sheet]?res.sheet:wb.SheetNames[0]],{defval:'',raw:false,dateNF:'dd/mm/yyyy'})}
        feedLoad(('ID_ACTIVO' in (rows[0]||{})?mapLegacy:mapAS)(rows,'Drive · '+res.name),info.updated)}catch(e){fail(e)}}).withFailureHandler(fail).getFeedData()}).withFailureHandler(fail).getFeedInfo()}
function syncSheet(){syncFeed(true)}

/* ---------- Estado ---------- */
let S;
const due=e=>addY(e.FECHA_ADQUISICION,+e.VIDA_UTIL_ANIOS||VIDA[e.TIPO_EQUIPO]||5);
function baseSt(e){const d=diff(S.today,due(e));return d<=0?'VENCIDO':d<=90?'ALERTA':'VIGENTE'}
const soon=e=>diff(S.today,due(e))<=90;
const stOf=e=>e.p||baseSt(e);
const tipo=e=>e.TIPO_EQUIPO||'Escritorio';
function freshItems(inv){return inv.map((x,i)=>({...x,TIPO_EQUIPO:/escrit/i.test(x.TIPO_EQUIPO||'Escritorio')?'Escritorio':x.TIPO_EQUIPO,_i:i,p:null,dx:null,price:null,pub:null,buyer:null,pay:null,fac:null,destD:null,hist:[]}))}
function init(sample=true,src){src=src||base0();const lv=TRZ.live;TRZ.live=false;try{init0(sample,src)}finally{TRZ.live=lv}}
function init0(sample,src){
  S={cfg:defaultCfg(),meClinic:null,today:sample?T0:new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10),items:freshItems(src.inv),prev:src.prev||[],src:src.name||'AppSheet',invAs:'',mod:'venta',reqs:[],notifs:[],log:[],mails:[],mailTab:'',fisDraft:null,seq:1000,view:'panel',hmTab:'ALL',city:null,engClinic:null,dxId:null,dxDraft:null,buyId:null,invQ:'',invClin:'',invSt:'',invPage:0,segArea:'',sample,
     col:[],ast:[],cartas:{},movs:[],emp:'102458',tiQ:'',tiTipo:'',tiEst:'',tiPage:0,mov:null,clinQ:''};
  applyAS(S.items);
  genTI();
  if(sample){seed();S.simDone=true}
}
function H(e,txt,area,kind){e.hist.push({d:S.today,t:txt,a:area,k:kind||''});
  if(TRZ.live&&GAS){TRZ.q.push(trzRow(e,dmy(S.today),ST[e.p]?.[0]||'',AREAS[area]||area||'',kind==='hmn'?'Humand':'',txt,'Demo en vivo'));clearTimeout(TRZ.h);TRZ.h=setTimeout(trzFlush,1500)}}
/* Traza en Google Sheets (pestaña "Traza", ver Code.gs). Solo con Apps Script; las filas viajan como texto. */
const TRZ={live:false,q:[],h:0,url:'',view:null};
const dmy=s=>s?s.split('-').reverse().join('/'):'';
const trzRow=(e,fecha,etapa,resp,donde,evento,origen,folio)=>[fecha,folio||e.sale?.folio||'',e.ID_ACTIVO,eqName(e),e.CLINICA,etapa,resp,donde,evento,origen];
function trzSend(rows,ok,fail){google.script.run.withSuccessHandler(r=>{if(r&&r.url)TRZ.url=r.url;ok&&ok(r)}).withFailureHandler(err=>fail&&fail(err&&err.message||String(err))).appendTraza(rows)}
/* Perfiles: el administrador ve todo; el ingeniero solo las clínicas que le asignan en "Ingenieros y clínicas". */
const tCase=s=>String(s||'').toLowerCase().replace(/(^|\s)\S/g,m=>m.toUpperCase());
const engMail=n=>{const p=String(n).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').split(/\s+/).filter(Boolean);return(p.length>=3?p[2]+'.'+p[0]:p.join('.'))+'@demo.activo360'};
function engList(){if(!S.engs){const by={};S.items.forEach(e=>{const o=by[e.CLINICA]??={};o[e.INGENIERO]=(o[e.INGENIERO]||0)+1});const m={};
    Object.entries(by).forEach(([c,o])=>{const u=Object.entries(o).sort((a,b)=>b[1]-a[1])[0][0];(m[u]??=[]).push(c)});
    S.engs=Object.keys(m).sort().map((n,i)=>({id:'ING-'+String(i+1).padStart(3,'0'),nombre:n,correo:engMail(n),clinicas:m[n].sort()}))}return S.engs}
const engCur=()=>S&&S.role==='ing'?engList().find(g=>g.id===S.asEng)||null:null;
const ING=()=>!!engCur();
const mine=e=>{const g=engCur();return!g||g.clinicas.includes(e.CLINICA)};
const ING_V=['misequipos','alertas','ingeniero','recorrido'];
function setRole(r,id){S.role=r;S.asEng=r==='ing'?id:null;S.engClinic=null;S.dxId=null;S.rec=null;closeDrawer();go(r==='ing'?'misequipos':'panel')}
function paintViewAs(){const el=$('#viewas');if(!el)return;const L=engList(),v=ING()?S.asEng:'admin';
  el.innerHTML=`<option value="admin">Ver como: Administrador</option><optgroup label="Ver como ingeniero">${L.map(g=>`<option value="${g.id}">${esc(tCase(g.nombre))} · ${g.clinicas.length} clínica${g.clinicas.length>1?'s':''}</option>`).join('')}</optgroup>`;el.value=v;
  el.onchange=()=>setRole(el.value==='admin'?'admin':'ing',el.value)}
function trzFlush(){if(!GAS||!TRZ.q.length)return;const rows=TRZ.q.splice(0);trzSend(rows,null,m=>{TRZ.q.unshift(...rows);toast('No se pudo escribir la traza: '+m)})}
function log(m,ep,src,body,desc){S.log.unshift({d:S.today,m,ep,src,body,desc})}
function notify(to,txt,kind){S.notifs.unshift({d:S.today,to,txt,kind:kind||'info'})}
function newReq(type,e,extra){const t=RT[type];const r={id:'SOL-'+(++S.seq),type,eq:e._i,created:S.today,last:S.today,state:'Pendiente',rem:0,esc:false,res:null,amount:extra?.amount??null,dl:extra?.dl||null};S.reqs.unshift(r);
  const who=t.a==='COL'?e.buyer:t.a==='JEFE'?(e.sale?.jefe||'Jefe inmediato'):t.a==='SIS'?e.INGENIERO:AREAS[t.a];
  if(t.ch==='humand'){log('POST','/chats/{id}/messages (API Marty · bot Activo 360)','pub',{to:AREAS[t.a],text:`Tienes pendiente: ${t.n} · ${e.ID_ACTIVO}`,link:'https://activo360.salud-digna.interno/aprobaciones/'+r.id},'El bot de Activo 360 avisa al área en Humand; la aprobación se hace dentro de Activo 360 (Humand no permite crear solicitudes desde un sistema externo).');notify(AREAS[t.a],`Nueva solicitud: ${t.n} · ${e.ID_ACTIVO} (${e.CLINICA})`,'req')}
  else if(t.ch==='firma'){log('POST','/documents','pub',{employeeInternalId:t.a==='COL'?(e.sale?.emp||''):'jefe de '+(e.sale?.emp||''),name:`Formato SGC-N4-60 ${e.sale?.folio}.pdf`,signatureStatus:'PENDING',signatureCoordinates:[{page:1,x:t.a==='COL'?.12:.58,y:.82,width:.3,height:.06}],sendNotification:true},'Sube el formato prellenado a Documentos de Humand para firma electrónica.');notify(who,`Tienes un documento por firmar: formato de compra de ${eqName(e)} (${e.sale?.folio})`,'req')}
  else{const to=t.a==='FAC'?MAIL_FAC:t.a==='SIS'?(e.CORREO_INGENIERO||e.INGENIERO):'Fiscal (Jurídico)';mail(to,`[Activo 360] ${t.n} · ${e.sale?.folio||e.ID_ACTIVO}`,mailBody(type,e),e)}
  return r}
function curReq(e){return S.reqs.find(r=>r.eq===e._i&&r.state==='Pendiente')}
function closeReq(r,state){if(!r)return;r.state=state||'Aprobada';r.res=fd(S.today);r.resD=S.today}
function mail(to,subj,body,e){S.mails.unshift({d:S.today,to,subj,body,eq:e?e._i:null});log('POST','https://gmail.googleapis.com/gmail/v1/users/me/messages/send','g',{to,subject:subj},'Aviso por correo de Google: el área entra a Activo 360 solo cuando tiene algo pendiente.')}
function fiscalTxt(f){if(!f||f.tipo==='publico')return 'Venta a público en general';return f.csf?`Con factura · constancia de situación fiscal: ${f.csf}`:`Con factura · RFC ${f.rfc} · ${f.nombre} · régimen ${f.regimen} · CP ${f.cp} · uso ${f.uso}`}
function mailBody(type,e){const s=e.sale||{};
  if(type==='FACTURA')return `Hay una venta pendiente de facturar.\nFolio: ${s.folio}\nEquipo: ${eqName(e)} · activo ${e.ID_ACTIVO} · serie ${e.NUM_SERIE}\nPrecio: ${money(e.pay?.amount)}\nComprador: ${e.buyer} (empleado ${s.emp||''})\nDatos fiscales: ${fiscalTxt(s.fiscal)}\nAdjunta el CFDI aquí: https://activo360.salud-digna.interno/facturas/${s.folio}`;
  if(type==='AGENDA')return `La venta ${s.folio} ya está facturada. Prepara el equipo ${eqName(e)} (activo ${e.ID_ACTIVO}) y propone fecha y hora de entrega en ${e.CLINICA}.\nComprador: ${e.buyer}\nAgenda aquí: https://activo360.salud-digna.interno/entregas/${s.folio}`;
  if(type==='REVFIS')return `Se donó el equipo ${eqName(e)} (activo ${e.ID_ACTIVO}) a ${e.don?.org}. Se adjuntó la factura de la donataria (${e.don?.factura}). Revisa que cumpla los requisitos fiscales: https://activo360.salud-digna.interno/donaciones/${e.ID_ACTIVO}`;
  return ''}
function addFile(e,name){if(!e.sale)return;e.sale.files.push({d:S.today,name});log('POST','https://www.googleapis.com/upload/drive/v3/files','g',{carpeta:'Activo 360 / Ventas / '+e.sale.folio,archivo:name},'Guarda el documento en la carpeta de la venta en Drive.')}

/* ---------- Tabulador y diagnóstico ---------- */
const DEFDX={enciende:'si',rend:'ok',monitor:'ok',estetica:'A',puertos:'ok',perif:'si',disco:'borrado',comp:[],obs:''};
/* Tabulador de Activo Fijo (equipo de cómputo): el diagnóstico da el % de vida útil → opción A/B/C →
   precio con descuento = valor en libros × (1 − % descuento) → precio colaborador = ese precio × (1 − % desc. colaborador). */
const money2=n=>'$'+(+n||0).toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2});
const numOf=v=>{const n=+String(v??'').replace(/[^0-9.]/g,'');return isFinite(n)?n:0};
function valorLibros(e){const K=C().tab,t=tipo(e);const vl=numOf(e.VALOR_LIBROS||e.as?.['VALOR EN LIBROS']);if(vl>0)return{v:vl,src:'Valor en libros registrado'};
  const c=numOf(e.COSTO_ADQUISICION);if(c>0){const vida=+e.VIDA_UTIL_ANIOS||VIDA[t]||5,anos=Math.max(0,diff(e.FECHA_ADQUISICION,S.today)/365.25);
    return{v:Math.round(c*Math.max(K.resid/100,1-anos/vida)*100)/100,src:`Estimado: costo ${money(c)} depreciado en ${vida} años (mínimo ${K.resid}%)`}}
  return{v:K.vb[t]||K.vb.Escritorio,src:'Valor de referencia del tabulador (sin valor en libros en el inventario)'}}
function vidaPct(e,dx){const P=C().tab.pen,t=tipo(e),cpu=e.PROCESADOR||'';let v=100;const why=[];const m=(c,n,l)=>{if(c&&n){v-=n;why.push(`${l} −${n}`)}};
  m(dx.rend==='lento',P.lento,'rendimiento lento');m(dx.estetica==='B',P.estB,'estética B');m(dx.estetica==='C',P.estC,'estética C');m(dx.puertos==='falla',P.puertos,'puertos');
  m(t==='Escritorio'&&dx.monitor==='fallas',P.monF,'monitor con fallas');m(t==='Escritorio'&&dx.monitor==='no',P.noMon,'sin monitor');m(dx.perif!=='si',P.perif,t==='Laptop'?'sin cargador':'sin teclado y mouse');
  m(dx.disco==='retirado',P.noDisk,'sin disco');m(!/i5|i7|i9|Ryzen [579]/.test(cpu),P.cpu,'procesador básico');m((+e.GENERACION||8)<8,P.gen,'generación antigua');m((+e.RAM_GB||8)<=4,P.ram,'RAM de 4 GB');
  return{v:Math.max(0,Math.min(100,v)),why}}
function priceCalc(e,dx){
  const t=tipo(e),K=C(),pc=t==='Escritorio'||t==='Laptop';let b,top;
  if(pc){const T=K.tab,vp=vidaPct(e,dx),opt=vp.v>=T.opt.A.min?'A':vp.v>=T.opt.B.min?'B':'C',o=T.opt[opt],vl=valorLibros(e);
    const lista=Math.round(vl.v*(1-o.d/100)*100)/100,sug=Math.round(lista*(1-o.dc/100)*100)/100;
    return{sug,min:sug,max:sug,lista,opt,vida:vp.v,why:vp.why,vl:vl.v,vlSrc:vl.src,d:o.d,dc:o.dc,tab:true}}
  else{top=K.acc[t]||100;b=top;if(dx.perif!=='si')b*=.85}
  let f=K.est[dx.estetica]||1;if(dx.rend==='lento')f*=K.lento;if(dx.puertos==='falla')f*=K.puertos;
  const fl=pc?K.piso:20,rr=n=>Math.max(fl,Math.round(n/50)*50||fl);const sug=Math.min(top,rr(b*f));
  return{sug,min:Math.min(sug,rr(sug*.88)),max:Math.min(top,rr(sug*1.12))};
}
const tabBox=pr=>`<div class="tb-box"><div class="tb-opt"><span class="tb-l">Opción</span><b>${pr.opt}</b><span class="note">${pr.vida}% de vida útil</span></div>
  <div class="tb-st"><span class="note">Valor en libros</span><b>${money2(pr.vl)}</b></div><div class="tb-st"><span class="note">Con descuento (−${pr.d}%)</span><b>${money2(pr.lista)}</b></div>
  <div class="tb-st fin"><span class="note">Precio colaborador (−${pr.dc}%)</span><b class="pr">${money2(pr.sug)}</b></div></div>
  <div class="note">${pr.why.length?'Vida útil: 100 '+esc(pr.why.join(' · ')):'Vida útil 100%: sin fallas en el diagnóstico'} · ${esc(pr.vlSrc)}</div>`;
const destino=dx=>dx.enciende==='no'?((dx.comp&&dx.comp.length)?'RECUP':'DEST'):'VENTA';
const estValue=e=>e.price?.aut??priceCalc(e,e.dx&&e.dx.enciende==='si'?e.dx:DEFDX).sug;
const estExp=e=>e.dx?(e.dx.enciende==='si'?estValue(e):0):estValue(e)*C().aptos; // sin diagnóstico: se pondera por % de equipos aptos para venta
function curPrice(e){if(!e.price)return null;const d=diff(e.pub||S.today,S.today);
  if(e.p==='SUBASTA'){const bids=e.auc.bids||[];const best=bids.length?Math.max(...bids.map(b=>b.amount)):e.auc.min;return{v:best,l:`Subasta · cierra ${fd(e.auc.end)}`,d,auction:true,bids:bids.length}}
  return{v:e.price.aut,l:e.price.adj?'Precio ajustado por Activo Fijo':'Precio autorizado',d,auction:false}}
const slaOf=r=>r.type==='DONFACT'?C().plazo.donFact:C().sla[RT[r.type].a]??2;
const reqDays=r=>bizDiff(r.created,r.resD||S.today);
const slaOk=r=>reqDays(r)<=slaOf(r);
const slaPill=r=>r.sis?(r.ok?`<span class="pill p-ok">En tiempo · meta ${C().sla.SIS} d</span>`:`<span class="pill p-bad">Fuera de tiempo · meta ${C().sla.SIS} d</span>`):r.state==='Pendiente'?(slaOk(r)?`<span class="pill p-ok">En tiempo · meta ${slaOf(r)} d</span>`:`<span class="pill p-bad">Fuera de tiempo · meta ${slaOf(r)} d</span>`):(slaOk(r)?'<span class="pill p-ok">En tiempo</span>':'<span class="pill p-bad">Fuera de tiempo</span>');
const MEB_=()=>ME.name+' · '+ME.area;
function canBuy(e){const K=C(),d=diff(e.pub||S.today,S.today);
  const mine=S.items.filter(x=>x.buyer===MEB_()&&x.sale&&diff(x.sale.start,S.today)<365&&(FROZEN.includes(x.p)||SOLD.includes(x.p))).length;
  if(K.max&&mine>=K.max)return{ok:false,msg:`Límite de ${K.max} equipo(s) por colaborador al año`};
  if(K.bloqDev&&S.ast.some(a=>a.emp===ME.emp&&a.estado==='Pendiente de devolución'))return{ok:false,msg:'Tienes activos pendientes de devolución'};
  if(e.p==='PUBLICADO'&&d<K.prio&&S.meClinic!==e.CLINICA)return{ok:false,msg:`Prioridad para personal de ${e.CLINICA} hasta el ${fd(addD(e.pub,K.prio))}`};
  return{ok:true}}
const kgOf=e=>C().kg[tipo(e)]||1;
function sisTask(e){if(e.p!=='CONFIRMADO')return null;const h=[...e.hist].reverse().find(x=>/Reemplazo confirmado|Devuelto por/.test(x.t));const d0=h?.d||S.today;const days=bizDiff(d0,S.today);return{sis:1,days,ok:days<=C().sla.SIS}}
function sisDone(){const o=[];S.items.forEach(e=>{const H_=e.hist;const c=H_.find(x=>/Reemplazo confirmado|Devuelto por/.test(x.t)),d=H_.find(x=>/Diagnóstico registrado|No funciona|No enciende/.test(x.t));if(c&&d)o.push(bizDiff(c.d,d.d))});return o}

/* ---------- Inventario tecnológico por colaborador ---------- */
let _s=20261013;const rnd=()=>{_s|=0;_s=_s+0x6D2B79F5|0;let t=Math.imul(_s^_s>>>15,1|_s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const pick=a=>a[Math.floor(rnd()*a.length)];
const TI_MOD={Laptop:[['Lenovo','ThinkPad E14 Gen 4','Intel Core i5-1235U',12],['Lenovo','ThinkPad T14 Gen 3','Intel Core i7-1255U',12],['Lenovo','ThinkPad L14 Gen 2','Intel Core i5-1135G7',11]],
  Monitor:[['Lenovo','ThinkVision T24i-30 24"']],Diadema:[['Logitech','H390 USB'],['Jabra','Evolve2 30']],'Hub USB-C':[['Lenovo','USB-C Mini Dock'],['Lenovo','Hub USB-C 7 en 1']],
  'Memoria USB':[['Kingston','DataTraveler 64 GB']],'Divisor de pantalla':[['StarTech','Divisor HDMI 1x2']]};
const STAFF=['Ing. Andrés Lugo','Ing. Mónica Beltrán','Ing. Saúl Camacho'];
const TI_AREAS=['Finanzas','Activo Fijo','Sistemas','Experiencia del Paciente','Call Center','Recursos Humanos','Compras','Calidad','Mercadotecnia','Jurídico','Operaciones','Crédito y Cobranza','Facturación'];
const NOMS=['Sofía','Diego','Valeria','Alejandro','Regina','Fernando','Camila','Rodrigo','Ximena','Eduardo','Natalia','Arturo','Paulina','Manuel','Renata','Javier','Daniela','Héctor','Lorena','Gustavo','Alma','Ernesto','Patricia','Rubén'];
const APS=['Pérez','López','Ramírez','Castro','Morales','Ortiz','Delgado','Vega','Herrera','Mendoza','Ríos','Acosta','Lara','Serrano','Guerrero','Pacheco','Sandoval','Montes','Beltrán','Inzunza','Valdez','Osuna'];
let invSeq=40000;
function newAsset(t,extra){const m=pick(TI_MOD[t]);const a={inv:'TI-'+(++invSeq),tipo:t,marca:m[0],modelo:m[1],cpu:m[2]||'',gen:m[3]||0,serie:(m[0].slice(0,2)+Math.floor(rnd()*9e6+1e6)).toUpperCase(),entrega:null,alta:S.today,estado:'En almacén',emp:null,resp:pick(STAFF),hist:[],...extra};S.ast.push(a);return a}
const tiDue=a=>a.entrega?addY(a.entrega,VIDA[a.tipo]||3):null;
const tiSoon=a=>a.estado==='Asignado'&&a.entrega&&diff(S.today,tiDue(a))<=90;
const colOf=emp=>S.col.find(c=>c.emp===emp);
const assignedTo=emp=>S.ast.filter(a=>a.emp===emp&&['Asignado','Pendiente de devolución'].includes(a.estado));
const curCarta=emp=>(S.cartas[emp]||[]).slice(-1)[0];
function snap(emp){return assignedTo(emp).map(a=>({inv:a.inv,tipo:a.tipo,marca:a.marca,modelo:a.modelo,serie:a.serie,entrega:a.entrega}))}
function newCarta(emp,motivo,opts={}){const L=S.cartas[emp]||(S.cartas[emp]=[]);const prev=L[L.length-1];
  if(prev){if(prev.st==='Pendiente de firma')prev.st='Cancelada (reemplazada antes de firmar)';else if(prev.st==='Firmada')prev.st='Histórica'}
  const v={v:L.length+1,folio:`CR-${emp}-${String(L.length+1).padStart(2,'0')}`,d:S.today,motivo,items:snap(emp),st:opts.st||'Pendiente de firma',signed:opts.signed||null,rem:0,last:S.today};L.push(v);
  if(!opts.silent){log('POST','/users/'+emp+'/documents/files','pub',{file:v.folio+'.pdf',folder:'Cartas responsivas',version:v.v},'Sube la nueva versión al expediente del colaborador.');
    log('POST','/documents','pub',{employeeInternalId:emp,name:v.folio+'.pdf',signatureStatus:'PENDING',signatureCoordinates:[{page:2,x:.12,y:.8,width:.3,height:.06}],sendNotification:true},'Sube la carta responsiva a Documentos de Humand para firma electrónica.');
    notify(colOf(emp)?.name||emp,`Tienes una carta responsiva por firmar (${v.folio}): ${motivo}`,'req')}
  return v}
function addMov(emp,tipoM,a,det,motivo,resp){S.movs.unshift({d:S.today,emp,tipo:tipoM,inv:a?.inv||'',activo:a?`${a.tipo} ${a.marca} ${a.modelo}`:'',det,motivo:motivo||'',resp:resp||'Sistemas'});a&&a.hist.push({d:S.today,t:`${tipoM}: ${det}`})}
function genTI(){
  const keep=S.today;const ubis=['Campus Culiacán','Campus Culiacán','Campus Culiacán','Campus Culiacán','Corporativo CDMX',...DATA.clinics.filter((c,i)=>i%37===0).map(c=>c.n)];
  const used=new Set();
  for(let i=0;i<48;i++){
    let name;do{name=pick(NOMS)+' '+pick(APS)+' '+pick(APS)}while(used.has(name));used.add(name);
    const c=i===0?{emp:'102458',name:'Juan Pérez Osuna',area:'Finanzas',ubi:'Campus Culiacán',st:'Activo'}:{emp:String(102400+i*13),name,area:pick(TI_AREAS),ubi:pick(ubis),st:'Activo'};
    if(i===7||i===19){c.st='Baja laboral';c.bajaD=addD(T0,-(i===7?12:4))}
    S.col.push(c);
    const lapD=i===0?'2024-03-15':addD('2023-07-01',Math.floor(rnd()*1050));
    const had=i!==0&&rnd()<.3;
    if(had){S.today=addD(lapD,-1095);const old=newAsset('Laptop',{entrega:S.today,estado:'Asignado',emp:c.emp});addMov(c.emp,'Alta',old,'Entrega inicial','Nuevo ingreso',old.resp);newCarta(c.emp,'Entrega inicial',{st:'Firmada',signed:addD(S.today,1),silent:true})}
    S.today=lapD;
    const items=[['Laptop',1],['Monitor',.6],['Diadema',.7],['Hub USB-C',.45],['Memoria USB',.35],['Divisor de pantalla',.1]];
    const list=[];
    if(had){const old=S.ast.find(a=>a.emp===c.emp&&a.tipo==='Laptop');old.estado='Devuelto';old.devD=S.today;old.emp=null}
    items.forEach(([t,p])=>{if(i===0?['Laptop','Monitor','Diadema'].includes(t):rnd()<p){const a=newAsset(t,{entrega:S.today,estado:'Asignado',emp:c.emp});list.push(a);addMov(c.emp,had&&t==='Laptop'?'Sustitución':'Alta',a,had&&t==='Laptop'?'Renovación de laptop (3 años)':'Entrega de equipo',had&&t==='Laptop'?'Fin de vida útil':'Asignación',a.resp)}});
    newCarta(c.emp,had?'Sustitución de laptop por renovación':'Entrega de equipo de cómputo',{st:'Firmada',signed:addD(S.today,1),silent:true});
    if(i===0){S.today='2025-06-10';const u=newAsset('Memoria USB',{entrega:S.today,estado:'Asignado',emp:c.emp});addMov(c.emp,'Alta',u,'Entrega de memoria USB','Asignación',u.resp);newCarta(c.emp,'Alta de memoria USB',{st:'Firmada',signed:'2025-06-11',silent:true})}
    if(c.st==='Baja laboral')assignedTo(c.emp).forEach(a=>a.estado='Pendiente de devolución');
  }
  S.today=keep;
  // cartas pendientes de firma (movimientos recientes)
  [3,11,24,31,40].forEach((i,k)=>{const c=S.col[i];if(c.st!=='Activo')return;S.today=addD(keep,-k%3-(k===3?2:0));const a=newAsset(pick(['Diadema','Hub USB-C','Monitor']),{entrega:S.today,estado:'Asignado',emp:c.emp});addMov(c.emp,'Alta',a,'Entrega de accesorio','Asignación',a.resp);const v=newCarta(c.emp,'Alta de '+a.tipo.toLowerCase(),{silent:true});if(k===3){v.rem=2;v.last=addD(keep,-1)}});
  S.today=keep;
  for(let k=0;k<14;k++)newAsset(['Laptop','Laptop','Laptop','Monitor','Diadema','Hub USB-C','Hub USB-C','Memoria USB'][k%8],{alta:addD(keep,-k*3)});
}

/* ---------- Flujo de venta ---------- */
function release(e,why){S.reqs.filter(r=>r.eq===e._i&&r.state==='Pendiente').forEach(r=>closeReq(r,'Cancelada'));
  H(e,why+' · el equipo regresa al Bazar','COL','rem');notify(e.buyer,`${why}. El equipo ${e.ID_ACTIVO} regresó al Bazar.`,'rem');
  log('PUT','/products/'+e.ID_ACTIVO,'pub',{status:'DISPONIBLE',stock:1},'Descongela el equipo en el Bazar.');e.p='PUBLICADO';e.buyer=null;e.pay=null;e.sale=null}
function startSale(e,buyer,amount,fiscal,info){e.buyer=buyer;e.pay={amount};
  e.sale={folio:'VTA-'+S.today.slice(0,4)+'-'+String(++S.seq).padStart(5,'0'),start:S.today,files:[],fiscal,emp:info?.emp||String(100000+S.seq),puesto:info?.puesto||buyer.split(' · ')[1]||'',area:info?.area||buyer.split(' · ')[1]||'',jefe:info?.jefe||JEFES[S.seq%JEFES.length],firmDl:addBiz(S.today,C().plazo.firmas)};
  e.p='FIRMAS';H(e,`Solicitud de compra de ${buyer} · ${fiscalTxt(fiscal)} · equipo congelado`,'COL');
  log('GET','/service-management/service-items/{sid}/tasks','pub',{servicio:'Compra de equipo',initiatorIds:e.sale.emp,createdAtFrom:S.today},'Activo 360 lee la solicitud "Compra de equipo" que el colaborador llenó en Gestión de Servicios de Humand.');
  log('PUT','/products/'+e.ID_ACTIVO,'pub',{status:'CONGELADO',folio:e.sale.folio},'Congela el equipo en el Bazar mientras se concreta la compra.');
  log('POST','https://www.googleapis.com/drive/v3/files','g',{carpeta:'Activo 360 / Ventas / '+e.sale.folio,mimeType:'application/vnd.google-apps.folder'},'Crea la carpeta de la venta en Drive con su folio.');
  addFile(e,'Formato SGC-N4-60 prellenado.pdf');if(fiscal?.csf)addFile(e,fiscal.csf);
  notify('Activo Fijo',`Solicitud de compra ${e.sale.folio}: ${eqName(e)} para ${buyer} (informativo)`,'info');
  newReq('FIRMA_COL',e)}
function signCol(e){closeReq(S.reqs.find(r=>r.eq===e._i&&r.type==='FIRMA_COL'&&r.state==='Pendiente'),'Firmada');e.sale.colSig=S.today;H(e,`${e.buyer} firmó el formato de compra`,'COL','hmn');newReq('FIRMA_JEFE',e)}
function signJefe(e){closeReq(S.reqs.find(r=>r.eq===e._i&&r.type==='FIRMA_JEFE'&&r.state==='Pendiente'),'Firmada');e.sale.jefeSig=S.today;H(e,`${e.sale.jefe} (jefe inmediato) firmó el formato`,'JEFE','hmn');addFile(e,'Formato SGC-N4-60 firmado.pdf');
  e.p='PAGO';e.pay.dl=addBiz(S.today,C().plazo.pago);const b=C().banco;
  notify(e.buyer,`Formato firmado. Deposita ${money(e.pay.amount)} a ${b.banco}, CLABE ${b.clabe}, concepto ${e.sale.folio}, y sube tu váucher antes del ${fd(e.pay.dl)}.`,'req');H(e,`Datos bancarios enviados · plazo para depositar hasta el ${fd(e.pay.dl)}`,'COL')}
function uploadVoucher(e,file){e.pay.file=file;e.pay.date=S.today;log('GET','/service-management/tasks/{taskId}','pub',{servicio:'Comprobante de depósito',folio:e.sale.folio,formAnswer:{fileAnswerSources:[file]}},'Activo 360 lee el váucher que el colaborador adjuntó en el formulario de Humand.');addFile(e,file);e.p='DEPOSITO';H(e,`Váucher cargado (${file})`,'COL');newReq('DEPOSITO',e,{amount:e.pay.amount})}
function schedule(e,dia,hora,re){const r=S.reqs.find(x=>x.eq===e._i&&x.type==='AGENDA'&&x.state==='Pendiente');if(r)closeReq(r);e.cita={d:dia,h:hora};e.p='ENTREGA';
  H(e,`${re?'Entrega reprogramada':'Entrega agendada'} para el ${fd(dia)} a las ${hora} en ${e.CLINICA}`,'SIS');notify(e.buyer,`Tu equipo ${e.ID_ACTIVO} está listo. ${re?'Nueva cita':'Cita'}: ${fd(dia)} a las ${hora} en ${e.CLINICA}. Lleva tu gafete.`,'req');
  log('POST','/chats/{id}/messages (API Marty · bot Activo 360)','pub',{to:'user:'+(e.sale?.emp||''),text:`Entrega de tu equipo: ${fd(dia)} ${hora} · ${e.CLINICA}`},'El bot de Activo 360 avisa la cita al comprador en Humand.')}
function startAuction(e,min){e.p='SUBASTA';e.auc={min:r50(min),end:addBiz(S.today,C().plazo.subasta),bids:[]};H(e,`Activo Fijo inició subasta desde ${money(e.auc.min)} · cierra el ${fd(e.auc.end)}`,'AF','hmn');
  log('PUT','/products/'+e.ID_ACTIVO,'pub',{status:'SUBASTA',min:e.auc.min,cierre:e.auc.end},'Publica la subasta en el Bazar de la ciudad.');notify('Colaboradores de '+e.MUNICIPIO,`Subasta en el Bazar de Activos: ${eqName(e)} desde ${money(e.auc.min)}`)}

/* ---------- Datos iniciales de operación ---------- */
function seed(){
  const V=S.items.filter(e=>!e.p&&diff(S.today,due(e))<=75).sort((a,b)=>due(a)<due(b)?-1:1).slice(5); // los 5 más vencidos quedan sin seguimiento
  const mk=(e,dxo)=>{const dx={...DEFDX,...(dxo||{})};e.dx=dx;e.price={...priceCalc(e,dx)};e.price.aut=e.price.sug;H(e,'Reemplazo confirmado: equipos nuevos recibidos en clínica','SIS');H(e,`Diagnóstico registrado · destino venta · sugerido ${money(e.price.sug)}`,'SIS')};
  const at=(n,fn)=>{const keep=S.today;S.today=addD(keep,-n);fn();S.today=keep};
  const go_=n=>S.today=addD(S.today,n);
  const pastReq=(type,e,cr,dd,amount)=>S.reqs.push({id:'SOL-'+(++S.seq),type,eq:e._i,created:cr,last:cr,state:type.startsWith('FIRMA')?'Firmada':'Aprobada',rem:Math.max(0,dd-1),esc:dd>=4,res:fd(addD(cr,dd)),resD:addD(cr,dd),amount});
  const fis=k=>k%3===0?{tipo:'factura',rfc:'GOMA850312AB1',nombre:'Ana Gómez Ruiz',regimen:'605 Sueldos y salarios',cp:'80000',uso:'G03 Gastos en general'}:k%3===1?{tipo:'factura',csf:'Constancia_situacion_fiscal.pdf'}:{tipo:'publico'};
  let k=0;const take=n=>V.slice(k,k+=n);
  take(4).forEach((e,i)=>at(i===0?2:0,()=>{mk(e,i===3?{estetica:'B'}:{});e.p='PRECIO';const r=newReq('PRECIO',e,{amount:e.price.sug});if(i===0){r.rem=1;r.last=addD(S.today,1)}}));
  // publicados; los de más de 15 días ya tienen la pregunta en la bandeja de Activo Fijo
  [2,5,9,12,16,21].forEach(dd=>{const[e]=take(1);if(!e)return;at(dd,()=>{mk(e,dd>10?{estetica:'B'}:{});e.p='PUBLICADO';e.pub=S.today;H(e,'Precio autorizado por Activo Fijo y publicado en Bazar (Humand)','AF','hmn');
    if(dd>=15){go_(15);const r=newReq('DECISION',e,{amount:e.price.aut});if(dd>18){r.rem=3;r.esc=true;r.last=addD(S.today,5)}}})});
  // precio ajustado por Activo Fijo hace 6 días
  take(1).forEach(e=>at(21,()=>{mk(e);e.p='PUBLICADO';e.pub=S.today;H(e,'Publicado en Bazar','AF','hmn');go_(15);pastReq('DECISION',e,S.today,0,e.price.aut);e.price.aut=r50(e.price.aut*.8);e.price.adj=true;e.pub=S.today;H(e,`Sin venta en 15 días · Activo Fijo bajó el precio 20 % (${money(e.price.aut)})`,'AF','hmn')}));
  // subasta abierta con una oferta
  take(1).forEach(e=>at(19,()=>{mk(e,{estetica:'C'});e.p='PUBLICADO';e.pub=S.today;go_(16);pastReq('DECISION',e,S.today,1,e.price.aut);go_(1);startAuction(e,e.price.aut*C().subastaMin);go_(1);e.auc.bids.push({who:BUYERS[3],amount:r50(e.auc.min+100),d:S.today})}));
  // en firmas, pago, Ingresos
  take(1).forEach(e=>at(0,()=>{mk(e);e.pub=addD(S.today,-4);startSale(e,BUYERS[0],e.price.aut,fis(0));signCol(e)}));
  take(1).forEach(e=>at(1,()=>{mk(e);e.pub=addD(S.today,-6);startSale(e,BUYERS[1],e.price.aut,fis(2));signCol(e);signJefe(e)}));
  take(1).forEach(e=>at(3,()=>{mk(e);e.pub=addD(S.today,-8);startSale(e,BUYERS[5],e.price.aut,fis(1));signCol(e);signJefe(e);go_(1);uploadVoucher(e,'vaucher_deposito.jpg');go_(1);closeReq(curReq(e),'Rechazada');e.p='PAGO';e.pay.rej=1;e.pay.dl=addD(S.today,C().plazo.reintento);H(e,'Ingresos no encontró el depósito · se avisa al colaborador y tiene 2 días naturales para corregir','ING','hmn')}));
  take(2).forEach((e,i)=>at(i?3:0,()=>{mk(e);e.pub=addD(S.today,-10);startSale(e,BUYERS[2+i],e.price.aut,fis(i));signCol(e);signJefe(e);uploadVoucher(e,'vaucher_spei.pdf');if(i){const r=curReq(e);r.rem=2;r.last=addD(S.today,2)}}));
  // vendidos en proceso: factura, agenda y cita
  const sold=(e,i,stage)=>{mk(e);e.pub=addD(S.today,-12);startSale(e,BUYERS[i],e.price.aut,fis(i));signCol(e);signJefe(e);uploadVoucher(e,'vaucher.pdf');closeReq(curReq(e));e.pay.ok=true;e.p='FACTURA';H(e,'Ingresos confirmó el depósito · el equipo sale del stock','ING','hmn');newReq('FACTURA',e,{amount:e.pay.amount});
    if(stage>0){go_(1);closeReq(curReq(e));e.fac='CFDI_'+e.sale.folio+'.pdf';addFile(e,e.fac);H(e,`Facturación adjuntó el CFDI (${e.fac})`,'FAC');e.p='AGENDA';newReq('AGENDA',e)}
    if(stage>1){go_(1);schedule(e,addBiz(S.today,1),'10:00')}};
  take(1).forEach(e=>at(2,()=>sold(e,4,0)));
  take(1).forEach(e=>at(3,()=>sold(e,5,1)));
  take(1).forEach(e=>at(3,()=>sold(e,2,2)));
  // ventas cerradas
  const COMS=['Muy rápido, recogí el equipo en mi misma clínica.','Buen precio, el proceso fue claro.','Tardó un poco la validación del depósito.','Excelente opción para mis hijos que estudian.','Me hubiera gustado ver fotos del equipo.','Todo bien, volvería a comprar.'];
  take(14).forEach((e,i)=>at(30+i*9,()=>{mk(e,i%4===3?{estetica:'B'}:{});const k=i%6;
    const d1=[0,1,1,2,0,3][k],d2=[1,0,2,1,4,1][k],d3=[1,1,0,2,1,3][k],d4=[1,2,1,3,1,2][k],buyD=[1,3,2,5,1,4][k];
    pastReq('PRECIO',e,S.today,d1,e.price.sug);go_(d1);H(e,`Activo Fijo autorizó ${money(e.price.aut)} · publicado en Bazar`,'AF','hmn');e.pub=S.today;
    go_(buyD);e.buyer=BUYERS[k];e.pay={amount:e.price.aut,ok:true,date:S.today};e.sale={folio:'VTA-'+S.today.slice(0,4)+'-'+String(++S.seq).padStart(5,'0'),start:S.today,files:[{d:S.today,name:'Formato SGC-N4-60 firmado.pdf'},{d:S.today,name:'vaucher.pdf'}],fiscal:fis(k),emp:String(100300+i),jefe:JEFES[k],colSig:S.today,jefeSig:S.today};
    H(e,`Solicitud de compra de ${e.buyer} · formato firmado por colaborador y jefe`,'COL','hmn');pastReq('FIRMA_COL',e,S.today,0);pastReq('FIRMA_JEFE',e,S.today,0);
    go_(1);H(e,'Váucher cargado','COL');pastReq('DEPOSITO',e,S.today,d2,e.price.aut);go_(d2);H(e,'Ingresos confirmó el depósito · el equipo sale del stock','ING','hmn');
    pastReq('FACTURA',e,S.today,d3,e.price.aut);go_(d3);e.fac='CFDI_'+e.sale.folio+'.pdf';e.sale.files.push({d:S.today,name:e.fac});H(e,`Facturación adjuntó el CFDI (${e.fac})`,'FAC');
    pastReq('AGENDA',e,S.today,d4);go_(d4);e.cita={d:addBiz(S.today,1),h:['10:00','12:30','9:00','16:00','11:00','13:00'][k]};H(e,`Entrega agendada para el ${fd(e.cita.d)} a las ${e.cita.h}`,'SIS');
    S.today=e.cita.d;H(e,`Equipo entregado a ${e.buyer.split(' · ')[0]} · expediente cerrado`,'SIS');e.sale.files.push({d:S.today,name:'Acta de entrega firmada.pdf'});e.p='ENTREGADO';
    e.survey={d:addD(S.today,1),q:[[5,4,5,3,5,4][k],[5,5,4,3,4,5][k],[5,4,5,4,5,5][k]],c:COMS[k]}}));
  // destruidos: no funcionales y funcionales (valor perdido)
  take(8).forEach((e,i)=>at(8+i*17,()=>{const func=i%3===1;if(func){mk(e);e.price=null;H(e,'Sin venta · Activo Fijo decidió destruirlo','AF','hmn')}else{e.dx={...DEFDX,enciende:'no',comp:i%2?['RAM']:[]};H(e,'No enciende · destrucción certificada','SIS')}e.p='DESTRUIDO';e.destD=S.today;H(e,`Destruido · certificado CERT-${S.today.replace(/-/g,'')}`,'AF')}));
  take(3).forEach((e,i)=>{e.dx={...DEFDX,enciende:'no',comp:i?['RAM']:[]};e.p='DESTRUCCION';e.destD=S.today;H(e,i?'No enciende · se recupera RAM · remanente a destrucción':'No enciende · sin componentes aprovechables','SIS')});
  take(6).forEach(e=>{e.p='CONFIRMADO';H(e,'Reemplazo confirmado: equipos nuevos recibidos en clínica','SIS')});
  // donaciones
  take(4).forEach((e,i)=>at([1,5,9,70][i],()=>{mk(e,{estetica:'C'});e.p='PUBLICADO';e.pub=addD(S.today,-16);pastReq('DECISION',e,S.today,0,e.price.aut);
    e.don={org:C().donatarias[i%4],fecha:addBiz(S.today,2)};e.p='DONACION';H(e,`Sin venta · Activo Fijo decidió donarlo a ${e.don.org} (entrega ${fd(e.don.fecha)})`,'AF','hmn');
    if(i>0){S.today=e.don.fecha;e.don.d=S.today;e.p='DONADO_FACT';H(e,`Entregado a ${e.don.org} · sale del stock`,'SIS');const r=newReq('DONFACT',e,{dl:addD(S.today,C().plazo.donFact)});
      if(i>1){go_(4);closeReq(r,'Adjuntada');e.don.factura='Factura_donataria_'+e.ID_ACTIVO+'.pdf';H(e,`Se adjuntó la factura de la donataria (${e.don.factura})`,'AF');e.p='DONADO';const rf=newReq('REVFIS',e);if(i>2){go_(3);closeReq(rf);e.don.fiscal='Revisada sin observaciones';H(e,'Fiscal revisó la factura de la donación: sin observaciones','FIS')}}}}));
  S.log=S.log.slice(0,25);S.mails=S.mails.slice(0,30);
}
/* Ventas simuladas sobre el inventario cargado de la hoja (demo): mismas que seed(), una sola vez. No escribe en la traza. */
function simulate(){if(S.simDone){toast('Las ventas de ejemplo ya están aplicadas');return false}
  const lv=TRZ.live;TRZ.live=false;try{seed()}finally{TRZ.live=lv}S.simDone=true;save();return true}

/* ---------- Cierre diario: recordatorios, plazos, renovaciones ---------- */
function tick(days){
  for(let i=0;i<days;i++){
    S.today=addD(S.today,1);const wk=isWk(S.today);const K=C();
    S.reqs.filter(r=>r.state==='Pendiente').forEach(r=>{
      if(!wk&&diff(r.last,S.today)>=1&&!(r.type==='DONFACT'&&r.dl&&diff(S.today,r.dl)>3)){r.rem++;r.last=S.today;const e=S.items[r.eq];const t=RT[r.type];const area=t.a==='COL'?e.buyer:t.a==='JEFE'?e.sale?.jefe:AREAS[t.a];
        if(r.rem>=3&&!r.esc){r.esc=true;notify('Jefe de '+area,`Escalamiento: ${r.id} (${t.n}) lleva ${diff(r.created,S.today)} días sin respuesta`,'esc');H(e,`Escalado a jefe de ${area} tras 3 recordatorios`,t.a,'rem')}
        else if(t.ch==='correo'){mail(t.a==='FAC'?MAIL_FAC:t.a==='SIS'?(e.CORREO_INGENIERO||e.INGENIERO):'Fiscal (Jurídico)',`[Activo 360] Recordatorio: ${t.n} · ${e.sale?.folio||e.ID_ACTIVO}`,`Sigue pendiente: ${t.n}. ${mailBody(r.type,e).split('\n')[0]}`,e);H(e,`Recordatorio ${r.rem} enviado por correo a ${area}`,t.a,'rem')}
        else{notify(area,`Recordatorio: tienes pendiente ${t.n} · ${e.ID_ACTIVO}`,'rem');H(e,`Recordatorio ${r.rem} enviado a ${area} por Humand`,t.a,'rem')}}});
    S.items.forEach(e=>{
      if(e.p==='FIRMAS'&&S.today>e.sale.firmDl)release(e,'No se completaron las firmas del formato a tiempo');
      else if(e.p==='PAGO'&&S.today>e.pay.dl)release(e,e.pay.rej?'No se corrigió el depósito en el plazo':'No se recibió el depósito en el plazo');
      else if(e.p==='PAGO'&&!wk&&!e.pay.rs&&bizDiff(e.sale.jefeSig||S.today,S.today)>=1){e.pay.rs=1;notify(e.buyer,`Recordatorio: deposita y sube tu váucher de ${e.sale.folio} antes del ${fd(e.pay.dl)}`,'rem');H(e,'Recordatorio al colaborador: depositar y subir váucher','COL','rem')}
      else if(e.p==='ENTREGA'&&S.today>=e.cita.d){notify(e.buyer,`Recordatorio: tu equipo ${e.ID_ACTIVO} te espera en ${e.CLINICA}. Cita: ${fd(e.cita.d)} ${e.cita.h}.`,'rem');H(e,'Recordatorio diario al comprador para recoger su equipo','COL','rem')}
      else if(e.p==='PUBLICADO'&&diff(e.pub,S.today)>=K.plazo.sinVenta&&!S.reqs.some(r=>r.eq===e._i&&r.type==='DECISION'&&r.state==='Pendiente')){newReq('DECISION',e,{amount:e.price.aut});H(e,`${K.plazo.sinVenta} días sin venta · se pregunta a Activo Fijo qué hacer`,'AF','hmn')}
      else if(e.p==='SUBASTA'&&S.today>=e.auc.end){const bids=e.auc.bids;if(bids.length){const w=bids.reduce((a,b)=>b.amount>a.amount?b:a);H(e,`Subasta cerrada · gana ${w.who} con ${money(w.amount)}`,'COL','hmn');
          log('PUT','/products/'+e.ID_ACTIVO,'pub',{status:'SUBASTA_CERRADA',ganador:w.who,monto:w.amount},'Cierra la subasta.');e.price.aut=w.amount;startSale(e,w.who,w.amount,w.fiscal||{tipo:'publico'},w.info)}
        else{e.p='PUBLICADO';e.pub=addD(S.today,-K.plazo.sinVenta);H(e,'Subasta cerrada sin ofertas · se vuelve a preguntar a Activo Fijo','AF','hmn');newReq('DECISION',e,{amount:e.price.aut})}}
    });
    Object.entries(S.cartas).forEach(([emp,L])=>{const v=L[L.length-1];if(wk||v.st!=='Pendiente de firma'||diff(v.last,S.today)<1)return;v.rem++;v.last=S.today;const c=colOf(emp);
      if(v.rem>=3)notify('Jefe inmediato de '+(c?.name||emp),`${c?.name} lleva ${diff(v.d,S.today)} días sin firmar su carta responsiva ${v.folio}`,'esc');
      else notify(c?.name||emp,`Recordatorio: firma tu carta responsiva ${v.folio}`,'rem');
      log('POST','/chats/{id}/messages (API Marty · bot Activo 360)','pub',{to:'user:'+emp,text:'Recordatorio: firma tu carta responsiva '+v.folio},'Recordatorio diario de firma de carta responsiva.')});
    S.ast.filter(a=>a.estado==='Asignado'&&a.entrega&&diff(S.today,tiDue(a))===90).forEach(a=>{const c=colOf(a.emp);notify(c?.name||a.emp,`Tu ${a.tipo.toLowerCase()} ${a.modelo} se renueva el ${fd(tiDue(a))}. Sistemas te contactará para el cambio.`,'info');notify('Sistemas · Mesa de servicio',`Renovación programada: ${a.inv} de ${c?.name}`,'req')});
  }
  if(S.notifs.length>400)S.notifs.length=400;if(S.log.length>200)S.log.length=200;if(S.mails.length>200)S.mails.length=200;
  save();render();toast(`Cierre del día ${fd(S.today)} · recordatorios enviados`);
}

/* ---------- Persistencia ligera ---------- */
const KEY='activo360-v10';
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&s.items&&s.ast&&s.cfg&&s.mails&&s.prev){S=s;if(!S.cfg.tab)S.cfg.tab=defaultCfg().tab;invSeq=Math.max(40000,...S.ast.map(a=>+a.inv.slice(3)))}else init()}catch(e){init()}}

/* ---------- UI helpers ---------- */
function toast(t){const el=$('#toast');el.textContent=t;el.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>el.hidden=true,2800)}
const pill=st=>`<span class="pill ${ST[st]?.[1]||'p-mut'}">${ST[st]?.[0]||st}</span>`;
function steps(e,mini){const p=stOf(e);if(DON.includes(p)){const i=p==='DONADO'?3:DFLOW.findIndex(f=>f[1]===p);
    if(mini)return `<span class="mini">${DFLOW.map((f,k)=>`<b class="${k<i?'d':k===i?'c':''}"></b>`).join('')}</span>`;
    return `<div class="steps">${DFLOW.map((f,k)=>`<div class="st ${k<i?'done':k===i?'cur':''}"><i>${k<i?'✓':k+1}</i><span>${f[0]}</span></div>`).join('')}</div>`}
  let i=flowIdx(p);if(p==='ENTREGADO')i=FLOW.length;
  if(mini)return `<span class="mini" title="${ST[p]?.[0]}">${FLOW.map((f,k)=>`<b class="${k<i?'d':k===i?'c':''}"></b>`).join('')}</span>`;
  return `<div class="steps">${FLOW.map((f,k)=>`<div class="st ${k<i?'done':k===i?'cur':''}"><i>${k<i?'✓':k+1}</i><span>${f[0]}</span></div>`).join('')}</div>`}
const eqName=e=>`${tipo(e)!=='Escritorio'?tipo(e)+' ':''}${e.MARCA} ${e.MODELO}`;
const eqLine=e=>`<b>${esc(e.ID_ACTIVO)}</b> · ${esc(eqName(e))}<div class="note">${esc(e.CLINICA)} · ${esc(e.SERVICIO)} ${esc(e.UBICACION)}</div>`;
const TIP={Asignado:'p-ok','Pendiente de devolución':'p-bad','En almacén':'p-info',Devuelto:'p-mut',Baja:'p-mut','Baja · Activo 360':'p-sd','Baja (extravío)':'p-bad'};
const tpill=s=>`<span class="pill ${TIP[s]||'p-mut'}">${s}</span>`;
const CST={'Firmada':'p-ok','Pendiente de firma':'p-warn','Histórica':'p-mut','Cancelada (reemplazada antes de firmar)':'p-mut','Constancia de no adeudo':'p-sd','Devolución parcial':'p-warn'};
const cpill=s=>`<span class="pill ${CST[s]||'p-mut'}">${s}</span>`;
function hbars(rows,opt={}){const mx=Math.max(1,...rows.map(r=>sum(r.v)));return `<div class="bars">${rows.map(r=>`<div class="bar" style="grid-template-columns:${opt.lw||150}px minmax(0,1fr) ${opt.vw||60}px"><span>${esc(r.l)}</span><div class="stack">${r.v.map((v,i)=>`<div style="width:${100*v/mx}%;background:${(opt.c||['var(--sd)'])[i]}" title="${esc(r.l)}: ${opt.fmt?opt.fmt(v):v}"></div>`).join('')}</div><b class="mono" style="text-align:right">${opt.fmt?opt.fmt(sum(r.v)):sum(r.v)}</b></div>`).join('')}</div>`}
function gauge(segs,total,center,sub,needle){const cx=150,cy=140,r=110,sw=26;const P=f=>{const a=Math.PI*(1-Math.min(1,Math.max(0,f)));return[cx+r*Math.cos(a),cy-r*Math.sin(a)]};
  const arc=(f0,f1,col)=>{if(f1-f0<=0.0005)return'';const[x0,y0]=P(f0),[x1,y1]=P(f1);return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${sw}"/>`};
  let acc=0;const paths=segs.map(s=>{const f0=acc/total;acc+=s.v;return arc(f0,acc/total,s.c)}).join('');
  const[nx,ny]=P(Math.min(1,needle??acc/total));
  return `<svg viewBox="0 0 300 205" role="img" aria-label="${esc(center)}">${arc(0,1,'var(--surface2)')}${paths}
   <line x1="${cx}" y1="${cy}" x2="${(cx+(nx-cx)*.62).toFixed(1)}" y2="${(cy+(ny-cy)*.62).toFixed(1)}" stroke="var(--fg)" stroke-width="3" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="7" fill="var(--fg)"/>
   <text x="${cx-r}" y="${cy+20}" font-size="10" text-anchor="middle">0%</text><text x="${cx+r}" y="${cy+20}" font-size="10" text-anchor="middle">100%</text>
   <text x="${cx}" y="${cy+38}" font-size="26" font-weight="700" text-anchor="middle" style="fill:var(--fg);font-family:var(--f-num)">${esc(center)}</text>
   <text x="${cx}" y="${cy+57}" font-size="11" text-anchor="middle">${esc(sub)}</text></svg>`}
const legend=items=>`<div class="legend">${items.map(([c,l])=>`<span><i style="background:${c}"></i>${l}</span>`).join('')}</div>`;

/* ---------- Navegación ---------- */
const NAVS={
 venta:[['h','Equipo de clínicas','mv'],['panel','Panel ejecutivo'],['recorrido','Recorrido de un equipo'],['alertas','Alertas'],['clinicas','Activos por clínica'],['inventario','Inventario AppSheet'],['ingeniero','Ingeniero de Sistemas'],['seguimiento','Seguimiento de ventas'],['hgestion','Aprobaciones (Activo Fijo e Ingresos)'],['facturacion','Facturación'],['destruccion','Destrucción certificada'],['donacion','Donación'],['fiscal','Fiscal'],['config','Tabulador y reglas'],['ingenieros','Ingenieros y clínicas'],
  ['h','Humand','hm'],['hbazar','Bazar de Activos'],['compra','Gestión de Servicios · compra'],['hfirma','Firma del formato de compra'],['hnotif','Notificaciones'],['h','Google'],['correos','Correos enviados'],['h','Para Humand'],['integracion','Integración técnica']],
 ing:[['h','Mis clínicas','mv'],['misequipos','Mis equipos'],['alertas','Mis alertas'],['ingeniero','Diagnóstico y entregas'],['recorrido','Recorrido de un equipo']],
 ti:[['h','Inventario de Sistemas','mt'],['alertas','Alertas'],['ti','Activos por colaborador'],['carta','Carta responsiva'],
  ['h','Humand','hm'],['hfirma','Firma de carta responsiva'],['hnotif','Notificaciones'],['h','Para Humand'],['integracion','Integración técnica']]};
const MODV={ti:['ti','carta'],venta:['panel','recorrido','misequipos','ingenieros','clinicas','inventario','ingeniero','seguimiento','compra','facturacion','destruccion','donacion','fiscal','config','hgestion','hbazar','correos']};
const MODTAG={venta:['VENTA DE EQUIPO DE CLÍNICAS','Equipo de cómputo de las clínicas que cumplió su vida útil: venta local, destrucción o donación.'],ti:['INVENTARIO DE SISTEMAS','Equipo asignado a cada colaborador y su carta responsiva consolidada (SGC-N4-347).']};
const HMV=['compra','hbazar','hfirma','hnotif'];
const pendOf=(type)=>S.reqs.filter(r=>r.state==='Pendiente'&&(Array.isArray(type)?type.includes(r.type):r.type===type)).length;
function counts(){return{alertas:alerts().filter(x=>x.l!=='info').length,hgestion:S.reqs.filter(r=>r.state==='Pendiente'&&RT[r.type].ch==='humand').length,hbazar:S.items.filter(e=>e.p==='PUBLICADO'||e.p==='SUBASTA').length,
  misequipos:ING()?S.items.filter(e=>mine(e)&&!e.p&&soon(e)).length:null,
  ingeniero:S.items.filter(e=>mine(e)&&((!e.p&&soon(e))||['CONFIRMADO','AGENDA','ENTREGA','DONACION'].includes(e.p))).length,seguimiento:S.items.filter(e=>e.p&&!['ENTREGADO',...DESTR].includes(e.p)).length,
  hnotif:S.notifs.filter(n=>n.d===S.today).length,donacion:S.items.filter(e=>['DONACION','DONADO_FACT'].includes(e.p)).length,
  hfirma:S.mod==='ti'?Object.values(S.cartas).filter(L=>L[L.length-1].st==='Pendiente de firma').length:pendOf(['FIRMA_COL','FIRMA_JEFE']),ti:S.ast.filter(tiSoon).length,
  facturacion:pendOf('FACTURA'),fiscal:pendOf('REVFIS'),correos:S.mails.filter(m=>m.d===S.today).length}}

function renderNav(){const c=counts();$('#nav').innerHTML=NAVS[ING()?'ing':S.mod||'venta'].map(n=>n[0]==='h'?`<h6 class="${n[2]||''}">${n[1]}</h6>`:`<button data-v="${n[0]}" class="${HMV.includes(n[0])?'hmb ':''}${S.view===n[0]?'on':''}">${n[1]}${c[n[0]]!=null?`<span class="cnt ${['hgestion','hfirma','alertas'].includes(n[0])&&c[n[0]]?'hot':''}">${c[n[0]]}</span>`:''}</button>`).join('')}
function go(v){if(MODV.ti.includes(v))S.mod='ti';else if(MODV.venta.includes(v))S.mod='venta';S.view=v;save();render();window.scrollTo(0,0)}
function setMod(m){S.mod=m;S.view=m==='ti'?'ti':'panel';closeDrawer();save();render();window.scrollTo(0,0)}
function render(){if(ING()){S.mod='venta';if(!ING_V.includes(S.view))S.view='misequipos'}document.body.classList.toggle('rol-ing',ING());paintViewAs();
  if(!S.mod)S.mod=MODV.ti.includes(S.view)?'ti':'venta';$('#today').textContent=fd(S.today);document.body.classList.toggle('mod-ti',S.mod==='ti');$$('#mods [data-modulo]').forEach(b=>{const on=b.dataset.modulo===S.mod;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on))});renderNav();const f=VIEWS[S.view]||VIEWS.panel;const t=MODTAG[S.mod];$('#main').innerHTML=`<div class="modtag"><b>${t[0]}</b><span>${t[1]}</span></div>`+f();after[S.view]?.();paintGreet()}
const after={},VIEWS={};

/* ================= PANEL EJECUTIVO ================= */
function metrics(){
  const it=S.items,Y=S.today.slice(0,4),endY=Y+'-12-31';
  const yearItems=it.filter(e=>due(e)<=endY||SOLD.includes(e.p)||DESTR.includes(e.p)||DON.includes(e.p));
  const potencial=sum(yearItems,estExp);
  const meta=potencial*META;
  const sold=it.filter(e=>SOLD.includes(e.p));const recuperado=sum(sold,e=>e.pay?.amount||0);
  const proceso=sum(it.filter(e=>FROZEN.includes(e.p)),e=>e.pay?.amount||0)+sum(it.filter(e=>['PUBLICADO','SUBASTA'].includes(e.p)),e=>curPrice(e).v)+sum(it.filter(e=>e.p==='PRECIO'),e=>e.price.sug);
  const destr=it.filter(e=>DESTR.includes(e.p));const destFunc=destr.filter(e=>e.dx?.enciende==='si');
  const perdidoDest=sum(destFunc,e=>priceCalc(e,e.dx).sug);
  const sinSeg=it.filter(e=>!e.p&&baseSt(e)==='VENCIDO');const perdidoSinSeg=sum(sinSeg,estValue);
  const estanc=it.filter(e=>['PUBLICADO','SUBASTA'].includes(e.p)&&diff(e.pub,S.today)>=C().plazo.sinVenta);const perdidoEst=sum(estanc,e=>e.price.aut);
  // red completa: escritorios que cumplen 5 años en el año
  const sd=sold.filter(e=>tipo(e)==='Escritorio');const avgDesk=sd.length>=5?sum(sd,e=>e.pay.amount)/sd.length:sum(it.filter(e=>tipo(e)==='Escritorio'),estValue)/Math.max(1,it.filter(e=>tipo(e)==='Escritorio').length); // precio real de venta promedio cuando ya hay historial
  const proj={};DATA.clinics.forEach(c=>{for(let k=1;k<=2;k++){const y=addY(c.acq,5*k).slice(0,4);proj[y]=(proj[y]||0)+c.pc}});
  const redY=proj[Y]||0,redY1=proj[+Y+1]||0;
  const cartasGen=sum(Object.values(S.cartas),L=>L.length);
  const don=it.filter(e=>DON.includes(e.p)),donados=it.filter(e=>e.p==='DONADO');
  const reus=[...sold,...donados];const kgReus=sum(reus,kgOf),kgDest=sum(destr,kgOf),tasaReus=reus.length/Math.max(1,reus.length+destr.length);
  const res=S.reqs.filter(r=>r.resD),slaPct=res.length?res.filter(slaOk).length/res.length:0,fuera=S.reqs.filter(r=>r.state==='Pendiente'&&!slaOk(r)).length;
  const surv=it.filter(e=>e.survey),sat=surv.length?sum(surv,e=>sum(e.survey.q)/3)/surv.length:0;
  return{don,donados,valDon:sum(donados,estValue),kgReus,kgDest,tasaReus,slaPct,fuera,res,surv,sat,Y,yearItems,potencial,meta,sold,recuperado,proceso,destr,destFunc,perdidoDest,sinSeg,perdidoSinSeg,estanc,perdidoEst,avgDesk,proj,redY,redY1,
    redPot:redY*avgDesk*C().aptos,redPot1:redY1*avgDesk*C().aptos,hhAhorro:sold.length*(HHM-HHA)+cartasGen*(HH_CARTA[0]-HH_CARTA[1]),hhAnual:redY1*C().aptos*(HHM-HHA),cartasGen};
}
const ICONS={"reuse": "<path d=\"M7 19H4.8a1.8 1.8 0 0 1-1.6-2.7L7.2 9\"/><path d=\"M11 19h8.2a1.8 1.8 0 0 0 1.6-2.7l-1.2-2.1\"/><path d=\"m14 16-3 3 3 3\"/><path d=\"M8.3 13.6 7.2 9 2.6 10.1\"/><path d=\"m9.3 5.6 1.1-1.9a1.8 1.8 0 0 1 3.1 0l3.9 6.8\"/><path d=\"m13.4 9.6 4.6 1.2 1.2-4.6\"/>", "coin": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M15 9.5a2.5 2.5 0 0 0-2.5-1.5h-1a2 2 0 0 0 0 4h1a2 2 0 0 1 0 4h-1A2.5 2.5 0 0 1 9 14.5\"/><path d=\"M12 6v2m0 8v2\"/>", "clock": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/>", "leaf": "<path d=\"M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z\"/><path d=\"M2 21c0-3 1.9-5.4 5.2-6.1C9.6 14.4 12 13 13 12\"/>"};
const ico=k=>`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;
function heroTile(icon,col,label,val,ctx,frac,what){return `<div class="htile" style="--acc:${col}"><div class="hhead"><span class="hico">${ico(icon)}</span><span class="hlab">${label}</span></div><div class="hval">${val}</div><div class="hctx">${ctx}</div>${frac!=null?`<div class="hbar" role="img" aria-label="${Math.round(Math.min(1,frac)*100)} %"><i style="width:${Math.max(2,Math.min(100,frac*100))}%"></i></div>`:''}<div class="hwhat">${what}</div></div>`}
function miniTile(label,val,st,what){return `<div class="mtile"><div class="row" style="gap:6px"><span class="ml">${label}</span><span class="sp"></span>${st?`<span class="pill p-${st[0]}"><b aria-hidden="true">${st[1]}</b> ${st[2]}</span>`:''}</div><div class="mval">${val}</div><div class="mwhat">${what}</div></div>`}
VIEWS.panel=()=>{
  const M=metrics(),it=S.items,by=k=>it.filter(e=>stOf(e)===k).length;
  const nY=M.yearItems.length,nSold=M.sold.length,nDest=M.destr.length,nProc=M.yearItems.filter(e=>e.p&&!SOLD.includes(e.p)&&!DESTR.includes(e.p)&&e.p!=='DONADO').length;
  const pct=M.meta?M.recuperado/M.meta:0;
  // proyección red
  const yrs=[0,1,2,3,4,5].map(k=>String(+M.Y+k));const nice=Math.ceil(Math.max(...yrs.map(y=>M.proj[y]||0))/500)*500||500;const W=560,Hh=190,bw=60,gap=(W-40-bw*6)/5;
  const svg=`<svg viewBox="0 0 ${W} ${Hh+42}" style="width:100%;height:auto" role="img" aria-label="Proyección de sustitución por año">
   ${[0,.5,1].map(t=>`<line x1="30" x2="${W}" y1="${10+Hh*(1-t)}" y2="${10+Hh*(1-t)}" stroke="var(--line)"/><text x="26" y="${14+Hh*(1-t)}" font-size="10" text-anchor="end">${(nice*t).toLocaleString('es-MX')}</text>`).join('')}
   ${yrs.map((y,i)=>{const v=M.proj[y]||0,h=Hh*v/nice,x=40+i*(bw+gap);return `<rect x="${x}" y="${10+Hh-h}" width="${bw}" height="${h}" rx="4" fill="${i===0?'var(--hm)':'var(--sd)'}"/><text x="${x+bw/2}" y="${4+Hh-h}" font-size="11" text-anchor="middle" style="fill:var(--fg);font-weight:600">${v.toLocaleString('es-MX')}</text><text x="${x+bw/2}" y="${Hh+26}" font-size="11" text-anchor="middle">${y}</text><text x="${x+bw/2}" y="${Hh+40}" font-size="9.5" text-anchor="middle">${kmoney(v*M.avgDesk*C().aptos)}</text>`}).join('')}</svg>`;
  // destruido por mes
  const months=[5,4,3,2,1,0].map(k=>{const d=pd(S.today);d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()-k);return iso(d).slice(0,7)});
  const dm=months.map(m=>{const l=M.destr.filter(e=>(e.destD||'').startsWith(m));return{l:MES[+m.slice(5)-1]+' '+m.slice(0,4),v:[l.filter(e=>e.dx?.enciende!=='si').length,l.filter(e=>e.dx?.enciende==='si').length]}});
  const lost=[{l:'Destruidos estando funcionales',v:[M.perdidoDest]},{l:'Cumplieron vida útil sin seguimiento',v:[M.perdidoSinSeg]},{l:`En Bazar +${C().plazo.sinVenta} días sin venta`,v:[M.perdidoEst]}];
  const lostT=M.perdidoDest+M.perdidoSinSeg+M.perdidoEst;
  const pend=['AF','ING','FAC','SIS','FIS'].map(a=>{const rs=S.reqs.filter(r=>r.state==='Pendiente'&&RT[r.type].a===a);return{a,n:rs.length,avg:rs.length?sum(rs,r=>diff(r.created,S.today))/rs.length:0,rem:sum(rs,r=>r.rem),esc:rs.filter(r=>r.esc).length}});
  return `<div class="row"><div><h1>Panel ejecutivo</h1><p class="sub">Recuperación de valor de equipo de cómputo sustituido · ${new Set(S.items.map(e=>e.CLINICA)).size} clínicas con inventario AppSheet · ${M.Y}</p></div><span class="sp"></span><button class="btn p" data-rep>Exportar reporte de trazabilidad</button></div>
  <p class="sub" style="margin:-6px 0 0">Lo más importante en 30 segundos: cuántos equipos dejan de destruirse, lo que se recupera, el tiempo que se libera y el impacto ambiental.</p>
  ${(()=>{const a=alerts(),u=a.filter(x=>x.l!=="info");return u.length?`<div class="card alist"><div class="row" style="padding:6px 0 4px"><h2>Alertas de hoy</h2><span class="pill p-bad">${a.filter(x=>x.l==="bad").length} urgentes</span><span class="pill p-warn">${a.filter(x=>x.l==="warn").length} por atender</span><span class="sp"></span><button class="btn sm" data-go="alertas">Ver todas</button></div>${a.map((x,i)=>[x,i]).filter(([x])=>x.l!=="info").slice(0,4).map(([x,i])=>alertRow(x,i)).join("")}</div>`:""})()}
  <div class="hero">
   ${heroTile('reuse','var(--sd)','Equipos con segunda vida',M.sold.length+M.donados.length,`de ${nY} que cumplen vida útil en ${M.Y}`,(M.sold.length+M.donados.length)/Math.max(nY,1),`${M.sold.length} vendidos a colaboradores y ${M.donados.length} donados, en lugar de destruirse.`)}
   ${heroTile('coin','var(--amber)','Recuperado por venta',money(M.recuperado),`${Math.round(pct*100)} % de la meta ${M.Y} (${money(M.meta)})`,pct,'Lo que pagaron los colaboradores por equipo que antes se destruía sin recuperar nada.')}
   ${heroTile('clock','var(--info)','Horas de trabajo liberadas',Math.round(M.hhAhorro).toLocaleString('es-MX')+' h',`≈ ${Math.round(M.hhAhorro/8)} jornadas de 8 horas`,null,`Tiempo que ya no se va en Excel, correos, impresiones y seguimiento manual (${(HHM-HHA).toFixed(1)} h menos por venta).`)}
   ${heroTile('leaf','var(--ok)','Residuo electrónico evitado',Math.round(M.kgReus).toLocaleString('es-MX')+' kg',`${Math.round(M.tasaReus*100)} % del equipo se reutiliza`,M.tasaReus,'Peso del equipo vendido o donado que no terminó en destrucción.')}
  </div>
  <h2 class="sech">Así va la operación</h2>
  <div class="minis">
   ${miniTile('Tiempos cumplidos',Math.round(M.slaPct*100)+' %',M.slaPct>=.8?['ok','✓','En meta']:['warn','!','Atención'],`Solicitudes resueltas dentro del tiempo acordado. ${M.fuera} van tarde hoy.`)}
   ${miniTile('En proceso de venta',S.items.filter(e=>['PRECIO','PUBLICADO','SUBASTA',...FROZEN].includes(e.p)).length+' equipos',null,`En precio, publicados o congelados en firma y pago · ${money(M.proceso)}.`)}
   ${miniTile('Satisfacción',M.sat.toFixed(1)+' / 5',M.sat>=4?['ok','✓','Buena']:['warn','!','Revisar'],`Encuesta de 3 preguntas al recibir el equipo · ${M.surv.length} respuestas.`)}
   ${miniTile('Sin seguimiento',M.sinSeg.length,M.sinSeg.length?['bad','!','Actuar']:['ok','✓','Al día'],'Cumplieron su vida útil y nadie ha iniciado el proceso.')}
   ${miniTile('Destruidos',nDest,M.destFunc.length?['warn','!',M.destFunc.length+' funcionaban']:null,`Sin valor de venta, con certificado. Los que funcionaban se pudieron vender (${money(M.perdidoDest)}).`)}
   ${miniTile('Valor no recuperado',money(lostT),null,'Equipo funcional destruido, sin seguimiento o detenido en el Bazar.')}
   ${miniTile('Donados',M.donados.length,null,`A donatarias autorizadas · ${M.don.length-M.donados.length} en proceso.`)}
   ${miniTile(`Expectativa ${+M.Y+1}`,kmoney(M.redPot1),null,`${M.redY1.toLocaleString('es-MX')} escritorios cumplen 5 años; se estima vender ${Math.round(C().aptos*100)} % a ${money(M.avgDesk)} en promedio.`)}
  </div>
  <div class="grid g2">
   <div class="card gauge"><h2 style="align-self:flex-start">Recuperación ${M.Y} vs meta</h2>${gauge([{v:M.recuperado,c:'var(--sd)'},{v:Math.min(M.proceso,Math.max(0,M.meta-M.recuperado)),c:'var(--amber)'}],Math.max(M.meta,1),(pct*100).toFixed(0)+'%',`${money(M.recuperado)} de ${money(M.meta)}`,pct)}
    ${legend([['var(--sd)','Recuperado'],['var(--amber)','En proceso'],['var(--surface2)','Por recuperar']])}</div>
   <div class="card gauge"><h2 style="align-self:flex-start">Equipos dispuestos ${M.Y}</h2>${gauge([{v:nSold,c:'var(--sd)'},{v:M.donados.length,c:'var(--info)'},{v:nDest,c:'var(--bad)'},{v:nProc,c:'var(--hm)'}],Math.max(nY,1),Math.round(100*(nSold+nDest+M.donados.length)/Math.max(nY,1))+'%',`${nSold} vendidos · ${M.donados.length} donados · ${nDest} destruidos de ${nY}`,(nSold+nDest+M.donados.length)/Math.max(nY,1))}
    ${legend([['var(--sd)','Vendidos'],['var(--info)','Donados'],['var(--bad)','Destruidos'],['var(--hm)','En proceso'],['var(--surface2)','Pendientes']])}</div>
  </div>
  <div class="grid g2">
   <div class="card"><h2>Dinero que no se está recuperando</h2><p class="note">Valor de venta estimado que se pierde al destruir equipo funcional, al no dar seguimiento o que se queda detenido en el Bazar sin decisión.</p>
    ${hbars(lost,{lw:210,vw:90,fmt:money,c:['var(--bad)']})}
    <div style="margin-top:14px;border-top:1px solid var(--line);padding-top:12px"><h3>Si se destruyera todo (sin venta)</h3><p class="note" style="margin:4px 0 8px">Comparación sobre el valor potencial de ${M.Y}.</p>
    ${hbars([{l:'Destruir todo',v:[0,0,M.potencial]},{l:'Con Activo 360',v:[M.recuperado,M.proceso,Math.max(0,M.potencial-M.recuperado-M.proceso)]}],{lw:110,vw:90,fmt:money,c:['var(--sd)','var(--amber)','var(--bad)']})}
    ${legend([['var(--sd)','Recuperado'],['var(--amber)','En proceso'],['var(--bad)','No recuperado']])}</div></div>
   <div class="card"><h2>Destruido por mes</h2><p class="note">Equipos enviados a destrucción certificada. En rojo, los que funcionaban y pudieron venderse.</p>
    ${hbars(dm,{lw:80,vw:40,c:['var(--muted)','var(--bad)']})}${legend([['var(--muted)','No funcional'],['var(--bad)','Funcional (valor perdido)']])}
    <p class="note" style="margin-top:10px">${M.destr.filter(e=>e.p==='DESTRUIDO').length} con certificado · ${M.destr.filter(e=>e.dx?.comp?.length).length} con recuperación de componentes · valor perdido ${money(M.perdidoDest)}</p></div>
  </div>
  <div class="grid g2">
   <div class="card"><h2>Horas-hombre por equipo vendido</h2><p class="note">Proceso manual actual contra Activo 360. Proyección ${+M.Y+1}: <b>${Math.round(M.hhAnual).toLocaleString('es-MX')} h</b> ahorradas en la red.</p>
    ${hbars([{l:'Proceso actual',v:[HHM]},{l:'Activo 360',v:[HHA]}],{lw:110,vw:60,fmt:v=>v.toFixed(1)+' h',c:['var(--hm)']})}
    <details style="margin-top:10px"><summary>Supuestos por actividad</summary><div class="tbl" style="margin-top:8px"><table><tr><th>Actividad actual</th><th>Área</th><th class="n">h</th></tr>${HH_MANUAL.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td class="n">${r[2]}</td></tr>`).join('')}<tr><th>Con Activo 360</th><th></th><th></th></tr>${HH_A360.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td class="n">${r[2]}</td></tr>`).join('')}<tr><td>Carta responsiva (manual → automática)</td><td>Sistemas</td><td class="n">${HH_CARTA[0]} → ${HH_CARTA[1]}</td></tr></table></div></details></div>
   <div class="card"><h2>Proyección de sustitución · red completa</h2><p class="note">Escritorios que cumplen 5 años por año y lo que se espera recuperar: ${Math.round(C().aptos*100)}% aptos para venta × ${money(M.avgDesk)} precio promedio.</p>${svg}</div>
  </div>
  <div class="grid g2">
   <div class="card"><h2>Tiempos meta por área</h2><p class="note">Porcentaje resuelto dentro del tiempo meta, en días hábiles. Las metas se editan en Tabulador y reglas.</p>
    <div class="tbl" style="margin-top:8px"><table><tr><th>Área</th><th class="n">Meta</th><th class="n">Resueltas</th><th class="n">En tiempo</th><th class="n">Prom. días</th><th class="n">Fuera de tiempo hoy</th></tr>
    ${(()=>{const d=sisDone(),p=S.items.map(sisTask).filter(x=>x&&!x.ok).length,pc=d.length?d.filter(x=>x<=C().sla.SIS).length/d.length:0;return `<tr><td>Sistemas (diagnóstico)</td><td class="n">${C().sla.SIS} d</td><td class="n">${d.length}</td><td class="n"><span class="pill ${pc>=.8?'p-ok':pc>=.6?'p-warn':'p-bad'}">${Math.round(pc*100)}%</span></td><td class="n">${d.length?(sum(d)/d.length).toFixed(1):'—'}</td><td class="n">${p?`<span class="pill p-bad">${p}</span>`:0}</td></tr>`})()}
    ${['AF','ING','FAC','SIS','FIS'].map(a=>{const rs=M.res.filter(r=>RT[r.type].a===a),p=S.reqs.filter(r=>r.state==='Pendiente'&&RT[r.type].a===a&&!slaOk(r)),pc=rs.length?rs.filter(slaOk).length/rs.length:0;return `<tr><td>${a==='SIS'?'Sistemas (agendar entrega)':AREAS[a]}</td><td class="n">${C().sla[a]} d</td><td class="n">${rs.length}</td><td class="n"><span class="pill ${pc>=.8?'p-ok':pc>=.6?'p-warn':'p-bad'}">${Math.round(pc*100)}%</span></td><td class="n">${rs.length?(sum(rs,reqDays)/rs.length).toFixed(1):'—'}</td><td class="n">${p.length?`<span class="pill p-bad">${p.length}</span>`:0}</td></tr>`}).join('')}</table></div></div>
   <div class="card"><h2>Impacto ambiental</h2><p class="note">Residuo electrónico que no se destruye porque el equipo se reutiliza. Pesos promedio por tipo en Tabulador y reglas.</p>
    ${hbars([{l:'Reutilizado (venta + donación)',v:[M.kgReus]},{l:'Enviado a destrucción',v:[M.kgDest]}],{lw:200,vw:70,fmt:v=>Math.round(v)+' kg',c:['var(--ok)']})}
    <p class="note" style="margin-top:10px">Tasa de reutilización ${Math.round(M.tasaReus*100)}%. Si se venden los ${Math.round(C().aptos*100)}% aptos de los ${M.redY1.toLocaleString('es-MX')} escritorios de ${+M.Y+1}, se evitan ~${(M.redY1*C().aptos*C().kg['Escritorio']/1000).toFixed(1)} toneladas de residuo.</p>
    <h3 style="margin-top:14px">Satisfacción del colaborador</h3>
    ${hbars([['Proceso de compra',0],['Tiempo de entrega',1],['Estado del equipo',2]].map(([l,k])=>({l,v:[M.surv.length?sum(M.surv,e=>e.survey.q[k])/M.surv.length:0]})),{lw:150,vw:50,fmt:v=>v.toFixed(1),c:['var(--amber)']})}
    ${M.surv.slice(-2).map(e=>`<p class="note" style="margin:6px 0 0">“${esc(e.survey.c)}” · ${esc((e.buyer||'').split(' · ')[0])}</p>`).join('')}</div>
  </div>
  <div class="grid g2">
   <div class="card"><h2>Inventario por etapa</h2>${hbars(['VENCIDO','ALERTA','CONFIRMADO','PRECIO','PUBLICADO','SUBASTA','FIRMAS','PAGO','DEPOSITO','FACTURA','AGENDA','ENTREGA','ENTREGADO','DESTRUCCION','DESTRUIDO'].map(s=>({l:ST[s][0],v:[by(s)]})).concat([{l:'Donación (en proceso y donados)',v:[it.filter(e=>DON.includes(e.p)).length]}]),{lw:190,vw:40,c:['var(--sd)']})}</div>
   <div class="card"><div class="row"><h2>Pendientes por área</h2><span class="sp"></span><button class="btn sm" data-go="seguimiento">Ver seguimiento</button></div>
   <div class="tbl" style="margin-top:10px"><table><tr><th>Área</th><th class="n">Pendientes</th><th class="n">Días prom.</th><th class="n">Recordat.</th><th class="n">Escalados</th></tr>
   ${pend.map(p=>`<tr><td>${AREAS[p.a]}<div class="note">${['SIS','FAC','FIS'].includes(p.a)?'aviso por correo':'aviso por bot de Humand'}</div></td><td class="n">${p.n}</td><td class="n">${p.avg.toFixed(1)}</td><td class="n">${p.rem}</td><td class="n">${p.esc?`<span class="pill p-bad">${p.esc}</span>`:'0'}</td></tr>`).join('')}</table></div></div>
  </div>`;
};

/* ================= ACTIVOS POR CLÍNICA ================= */
VIEWS.clinicas=()=>{
  const g={};S.items.forEach(e=>(g[e.CLINICA]??=[]).push(e));
  const q=S.clinQ.toLowerCase();
  const rows=Object.entries(g).filter(([c])=>!q||c.toLowerCase().includes(q)).map(([c,l])=>{const n=k=>l.filter(e=>stOf(e)===k).length;return{c,mun:l[0].MUNICIPIO,tot:l.length,vig:n('VIGENTE'),al:n('ALERTA'),ven:n('VENCIDO'),bz:n('PUBLICADO'),fr:l.filter(e=>FROZEN.includes(e.p)).length,vd:l.filter(e=>SOLD.includes(e.p)).length,ds:l.filter(e=>DESTR.includes(e.p)).length,
    esp:sum(l.filter(e=>due(e)<=S.today.slice(0,4)+'-12-31'||SOLD.includes(e.p)||DESTR.includes(e.p)||DON.includes(e.p)),estExp)*META,rec:sum(l.filter(e=>SOLD.includes(e.p)),e=>e.pay?.amount||0),ti:S.ast.filter(a=>a.estado==='Asignado'&&colOf(a.emp)?.ubi===c).length}}).sort((a,b)=>(b.ven+b.al)-(a.ven+a.al));
  const T=k=>sum(rows,r=>r[k]);
  return `<div><h1>Activos por clínica</h1><p class="sub">Visibilidad del inventario, la vida útil y el stock del Bazar de cada clínica. El stock se actualiza al congelarse y al concretarse cada venta.</p></div>
  <div class="row"><input type="text" id="cq" placeholder="Buscar clínica…" value="${esc(S.clinQ)}" style="flex:0 1 280px"><span class="note">${rows.length} clínicas con inventario cargado</span></div>
  <div class="tbl"><table><tr><th>Clínica</th><th class="n">Equipos</th><th class="n">Vigentes</th><th class="n">Alerta ≤3m</th><th class="n">Cumplieron</th><th class="n">En Bazar</th><th class="n">Congelados</th><th class="n">Vendidos</th><th class="n">Destruidos</th><th class="n">Esperado ${S.today.slice(0,4)}</th><th class="n">Recuperado</th><th>Avance</th></tr>
  ${rows.map(r=>`<tr data-clin="${esc(r.c)}" style="cursor:pointer"><td><b>${esc(r.c)}</b><div class="note">${esc(r.mun)}${r.ti?` · ${r.ti} activos asignados a personal`:''}</div></td><td class="n">${r.tot}</td><td class="n">${r.vig}</td><td class="n">${r.al?`<span class="pill p-warn">${r.al}</span>`:0}</td><td class="n">${r.ven?`<span class="pill p-bad">${r.ven}</span>`:0}</td><td class="n">${r.bz}</td><td class="n">${r.fr}</td><td class="n">${r.vd}</td><td class="n">${r.ds}</td><td class="n">${money(r.esp)}</td><td class="n">${money(r.rec)}</td><td style="min-width:110px"><div class="stack"><div style="width:${r.esp?Math.min(100,100*r.rec/r.esp):0}%;background:var(--sd)"></div></div></td></tr>`).join('')}
  <tr><th>Total</th><th class="n">${T('tot')}</th><th class="n">${T('vig')}</th><th class="n">${T('al')}</th><th class="n">${T('ven')}</th><th class="n">${T('bz')}</th><th class="n">${T('fr')}</th><th class="n">${T('vd')}</th><th class="n">${T('ds')}</th><th class="n">${money(T('esp'))}</th><th class="n">${money(T('rec'))}</th><th></th></tr></table></div>`;
};
after.clinicas=()=>{$('#cq').oninput=e=>{S.clinQ=e.target.value;const p=e.target.selectionStart;render();const q=$('#cq');q.focus();q.setSelectionRange(p,p)};
  $$('[data-clin]').forEach(r=>r.onclick=()=>openClinic(r.dataset.clin))};
function openClinic(c){const l=S.items.filter(e=>e.CLINICA===c);const grp={};l.forEach(e=>(grp[stOf(e)]??=[]).push(e));
  const ti=S.ast.filter(a=>a.estado==='Asignado'&&colOf(a.emp)?.ubi===c);
  $('#drawer').innerHTML=`<div class="drawer"><div><div class="row"><h2>${esc(c)}</h2><span class="sp"></span><button class="btn sm" data-close>Cerrar</button></div>
  <p class="note">${esc(l[0]?.MUNICIPIO)}, ${esc(l[0]?.ESTADO)} · ${esc(l[0]?.INGENIERO)} · ${l.length} equipos</p>
  ${Object.keys(ST).filter(k=>grp[k]).map(k=>`<div class="card"><div class="row">${pill(k)}<span class="note">${grp[k].length}</span></div><div class="tbl" style="margin-top:8px"><table>${grp[k].map(e=>`<tr data-eq="${e._i}" style="cursor:pointer"><td>${eqLine(e)}</td><td class="mono note">${fd(due(e))}</td><td class="n">${SOLD.includes(e.p)?money(e.pay?.amount):e.p==='PUBLICADO'?money(curPrice(e).v):''}</td></tr>`).join('')}</table></div></div>`).join('')}
  ${ti.length?`<div class="card"><h3>Activos tecnológicos asignados a personal de la clínica</h3><div class="tbl" style="margin-top:8px"><table>${ti.map(a=>`<tr><td>${esc(a.inv)}</td><td>${esc(a.tipo)} ${esc(a.modelo)}</td><td>${esc(colOf(a.emp)?.name)}</td></tr>`).join('')}</table></div></div>`:''}</div></div>`;bindClose()}

/* ================= INVENTARIO (formato AppSheet) ================= */
const COLS=['ID_ACTIVO','NUM_SERIE','CLINICA','MUNICIPIO','ESTADO','ZONA','DIVISION','SERVICIO','UBICACION','TIPO_EQUIPO','MARCA','MODELO','PROCESADOR','GENERACION','RAM_GB','ALMACENAMIENTO','MONITOR','SO','FECHA_ADQUISICION','COSTO_ADQUISICION','VIDA_UTIL_ANIOS','INGENIERO','CORREO_INGENIERO'];
const REQ=['ID_ACTIVO','NUM_SERIE','CLINICA','MUNICIPIO','SERVICIO','MARCA','MODELO','FECHA_ADQUISICION'];
VIEWS.inventario=()=>{
  const q=S.invQ.toLowerCase();let rows=S.items.filter(e=>(!S.invClin||e.CLINICA===S.invClin)&&(!S.invSt||stOf(e)===S.invSt)&&(!S.invAs||asStatus(e)===S.invAs)&&(!q||(e.ID_ACTIVO+e.MODELO+e.CLINICA+e.SERVICIO+e.INGENIERO+(e.as?.['# DE SERIE NUEVO EQUIPO']||'')).toLowerCase().includes(q)));
  const per=50,pages=Math.max(1,Math.ceil(rows.length/per));S.invPage=Math.min(S.invPage,pages-1);const pg=rows.slice(S.invPage*per,S.invPage*per+per);
  const cAS={};S.items.forEach(e=>{const k=asStatus(e);cAS[k]=(cAS[k]||0)+1});const cPrev={};(S.prev||[]).forEach(o=>cPrev[o['ESTATUS']]=(cPrev[o['ESTATUS']]||0)+1);
  const nCl=new Set(S.items.map(e=>e.CLINICA)).size;
  return `<div><h1>Inventario de equipos</h1><p class="sub">Vista de equipos de AppSheet (Sistemas) que alimenta Activo 360 · ${esc(S.src||'AppSheet')} · ${nCl} clínicas.</p></div>
  <div class="grid g4">
   <div class="card kpi"><div class="l">Equipos vigentes en AppSheet</div><div class="v">${S.items.length.toLocaleString('es-MX')}</div><div class="s">ACTIVO, RESGUARDO y PLAN DE RENOVACIÓN</div></div>
   <div class="card kpi"><div class="l">Plan de renovación / enviado a CSI</div><div class="v">${S.items.filter(e=>e.AS_ESTATUS==='PLAN DE RENOVACION / ENVIADO A CSI').length}</div><div class="s">Entran directo a diagnóstico del ingeniero</div></div>
   <div class="card kpi"><div class="l">Cumplen 5 años en ≤3 meses</div><div class="v">${S.items.filter(e=>!e.p&&soon(e)).length}</div><div class="s">Regla: INSTALACION + 5 años</div></div>
   <div class="card kpi"><div class="l">Históricos (antes de Activo 360)</div><div class="v">${(S.prev||[]).length}</div><div class="s">${Object.entries(cPrev).map(([k,v])=>v+' '+k.toLowerCase()).join(' · ')||'—'}</div></div>
  </div>
  <div class="grid g2">
   <div class="card"><h2>Cargar vista de AppSheet</h2>
    <div class="drop" id="drop" style="margin-top:10px"><p style="margin:0 0 8px">Arrastra aquí el archivo exportado de AppSheet (<span class="mono">AppSheet.ViewData…csv</span>) o</p><input type="file" id="file" accept=".csv,.xlsx,.xls"><p class="note" style="margin:8px 0 0">Reemplaza el inventario y reinicia el proceso de venta. Los registros VENDIDO, DESTRUIDO y TRANSFERIDO se guardan como históricos.</p></div>
    <div id="upres" style="margin-top:10px"></div>
    <div class="row" style="margin-top:10px">${GAS?'<button class="btn p" id="sync">Actualizar desde Drive</button>':''}<button class="btn" id="tpl">Plantilla AppSheet .xlsx</button><button class="btn" id="exp">Exportar para AppSheet</button><button class="btn" id="sample">Restablecer demo</button></div></div>
   <div class="card"><h2>Estructura de la vista</h2><p class="note">Mismas columnas y orden que la vista de equipos de AppSheet. En verde, las obligatorias para Activo 360.</p>
    <div class="row" style="gap:6px;margin-top:8px">${AS_COLS().filter(c=>!/^Related /.test(c)).map(c=>`<span class="pill ${AS_REQ.includes(c)?'p-sd':'p-mut'}">${esc(c)}</span>`).join('')}</div>
    <p class="note" style="margin-top:10px">Vida útil: <span class="mono">INSTALACION + 5 años</span> (CPU) · alerta 3 meses antes. <span class="mono">USUARIO</span> = ingeniero responsable. Al exportar, <span class="mono">ESTATUS</span> se actualiza con la etapa del proceso: vendido → VENDIDO, destruido → DESTRUIDO, en venta o destrucción → RESGUARDO, por diagnosticar → PLAN DE RENOVACION / ENVIADO A CSI.</p>
    <div class="row" style="gap:6px;margin-top:8px">${Object.entries(cAS).map(([k,v])=>`${aspill(k)}<span class="mono note">${v}</span>`).join('')}</div></div>
  </div>
  <div class="card">
   <div class="row"><input type="text" id="q" placeholder="Buscar serie, modelo, área, ingeniero…" value="${esc(S.invQ)}" style="flex:1 1 200px">
   <select id="fc"><option value="">Todos los centros de trabajo</option>${[...new Set(S.items.map(e=>e.CLINICA))].sort().map(c=>`<option ${c===S.invClin?'selected':''}>${esc(c)}</option>`).join('')}</select>
   <select id="fa"><option value="">Estatus AppSheet</option>${Object.keys(cAS).map(k=>`<option ${k===S.invAs?'selected':''}>${esc(k)}</option>`).join('')}</select>
   <select id="fs"><option value="">Etapa Activo 360</option>${Object.keys(ST).map(k=>`<option value="${k}" ${k===S.invSt?'selected':''}>${ST[k][0]}</option>`).join('')}</select>
   <span class="note">${rows.length} equipos</span></div>
   <div class="tbl" style="margin-top:10px;max-height:560px"><table><tr><th># de serie</th><th>Centro de trabajo · área</th><th>Equipo</th><th>Instalación</th><th>Sustituir</th><th>AppSheet</th><th>Activo 360</th></tr>
   ${pg.map(e=>`<tr data-eq="${e._i}" style="cursor:pointer"><td><b class="mono">${esc(e.NUM_SERIE)}</b><div class="note">${esc(e.INGENIERO)}</div></td><td>${esc(e.CLINICA)}<div class="note">${esc(e.as?.['AREA']||e.SERVICIO)} · ubic. ${esc(e.as?.['UBICACIÓN']||e.UBICACION)} · ${esc(e.DIVISION)}</div></td><td>${esc(e.MARCA)} ${esc(e.MODELO)}<div class="note">${esc(e.PROCESADOR)} · ${e.RAM_GB} GB · ${esc(e.ALMACENAMIENTO)}</div></td><td class="mono">${e.as?esc(e.as['INSTALACION']):fd(e.FECHA_ADQUISICION)}</td><td class="mono">${fd(due(e))}</td><td>${aspill(asStatus(e))}</td><td>${pill(stOf(e))}</td></tr>`).join('')}</table></div>
   <div class="row" style="margin-top:8px"><button class="btn sm" id="pp" ${S.invPage?'':'disabled'}>Anterior</button><span class="note">Página ${S.invPage+1} de ${pages}</span><button class="btn sm" id="pn" ${S.invPage<pages-1?'':'disabled'}>Siguiente</button></div>
  </div>`;
};
after.inventario=()=>{
  $('#q').oninput=e=>{S.invQ=e.target.value;S.invPage=0;const p=e.target.selectionStart;render();const q=$('#q');q.focus();q.setSelectionRange(p,p)};
  $('#fc').onchange=e=>{S.invClin=e.target.value;S.invPage=0;render()};
  $('#fa').onchange=e=>{S.invAs=e.target.value;S.invPage=0;render()};
  $('#fs').onchange=e=>{S.invSt=e.target.value;S.invPage=0;render()};
  $('#pp').onclick=()=>{S.invPage--;render()};$('#pn').onclick=()=>{S.invPage++;render()};
  $('#file').onchange=e=>e.target.files[0]&&readFile(e.target.files[0]);
  $('#sync')&&($('#sync').onclick=()=>syncSheet());
  const d=$('#drop');d.ondragover=e=>{e.preventDefault();d.classList.add('over')};d.ondragleave=()=>d.classList.remove('over');d.ondrop=e=>{e.preventDefault();d.classList.remove('over');e.dataTransfer.files[0]&&readFile(e.dataTransfer.files[0])};
  $('#tpl').onclick=()=>xlsxOut(asObjs({cols:AS_COLS(),rows:DATA.appsheet.rows.slice(0,6)}),'plantilla_AppSheet_Activo360.xlsx',AS_COLS());
  $('#exp').onclick=()=>xlsxOut(asExportRows(),'AppSheet_equipos_Activo360_'+S.today+'.xlsx',[...AS_COLS(),'ESTATUS ACTIVO 360','PRECIO AUTORIZADO','FOLIO VENTA']);
  $('#sample').onclick=()=>{init(true);S.view='inventario';save();render();toast('Demo restablecido')};
};
function xlsxOut(rows,name,header){try{const ws=XLSX.utils.json_to_sheet(rows,header?{header}:undefined);const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,'INVENTARIO');XLSX.writeFile(wb,name);toast('Descargando '+name)}catch(e){toast('No se pudo generar la descarga en esta vista')}}
// Formato de fecha por archivo: mm/dd solo si algún valor lo prueba (2.º número >12) y ninguno prueba dd/mm (1.º >12). Ambiguo → dd/mm.
function isMDY(vals){let md=0,dm=0;vals.forEach(v=>{const m=String(v??'').trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-]\d{4}/);if(!m)return;if(+m[1]>12)dm++;else if(+m[2]>12)md++});return md>0&&dm===0}
function normDate(v,mdy){if(v instanceof Date)return iso(new Date(Date.UTC(v.getFullYear(),v.getMonth(),v.getDate())));if(typeof v==='number'){const d=new Date(Date.UTC(1899,11,30));d.setUTCDate(d.getUTCDate()+Math.floor(v));return iso(d)}const s=String(v||'').trim();let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);if(m)return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;m=s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);if(m&&mdy)m=[m[0],m[2],m[1],m[3]];if(m&&+m[2]<=12&&+m[1]<=31)return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;return null}
const normK=k=>String(k).trim().toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Z0-9]+/g,'_').replace(/^_|_$/g,'');
function readRows(f,cb,out,asText){const rd=new FileReader();const csv=/\.csv$/i.test(f.name);rd.onload=ev=>{try{const wb=csv?XLSX.read(String(ev.target.result).replace(/^\uFEFF/,''),{type:'string',raw:!!asText}):XLSX.read(new Uint8Array(ev.target.result),{type:'array',cellDates:true});const raw=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],asText?{defval:'',raw:false,dateNF:'dd/mm/yyyy'}:{defval:''});if(!raw.length)throw new Error('El archivo no tiene filas.');cb(raw.map(r=>{const o={};for(const k in r)o[normK(k)]=r[k];return o}),raw)}catch(err){$(out).innerHTML=`<div class="result bad"><b>No se pudo cargar.</b> ${esc(err.message)}</div>`}};csv?rd.readAsText(f,'utf-8'):rd.readAsArrayBuffer(f)}
/* Plantilla anterior de Activo 360 (ID_ACTIVO, CLINICA, COSTO_ADQUISICION…): archivo cargado o pestaña INVENTARIO del Sheets. */
function mapLegacy(rows,name){
  const miss=REQ.filter(c=>!(c in rows[0]));if(miss.length)throw new Error('Faltan columnas obligatorias: '+miss.join(', '));
  let bad=0;const inv=[];const mdy=isMDY(rows.map(r=>r.FECHA_ADQUISICION));rows.forEach(r=>{const fa=normDate(r.FECHA_ADQUISICION,mdy);if(!fa||!r.ID_ACTIVO){bad++;return}
    const o={};COLS.forEach(c=>o[c]=r[c]??'');o.VALOR_LIBROS=r.VALOR_LIBROS??r['VALOR EN LIBROS']??'';o.FECHA_ADQUISICION=fa;o.TIPO_EQUIPO=o.TIPO_EQUIPO||'Escritorio';o.VIDA_UTIL_ANIOS=+r.VIDA_UTIL_ANIOS||VIDA[o.TIPO_EQUIPO]||5;o.GENERACION=+r.GENERACION||genOf(r.PROCESADOR);o.RAM_GB=+r.RAM_GB||8;o.MUNICIPIO=o.MUNICIPIO||o.CLINICA;inv.push(o)});
  return{inv,prev:[],bad,mdy,name,total:rows.length}}
function readFile(f){readRows(f,(rows,raw)=>{
  let src;
  if('ID_ACTIVO' in rows[0]){ // compatibilidad con la plantilla anterior de Activo 360
    src=mapLegacy(rows,f.name);
  }else{
    const miss=AS_REQ.filter(c=>!(normK(c) in rows[0]));if(miss.length)throw new Error('No es la vista de AppSheet. Faltan columnas: '+miss.join(', '));
    src=mapAS(raw,f.name);
  }
  if(!src.inv.length)throw new Error('No hay equipos vigentes (ACTIVO, RESGUARDO o PLAN DE RENOVACION) en el archivo.');
  const ti={col:S.col,ast:S.ast,cartas:S.cartas,movs:S.movs,cfg:S.cfg};init(false,src);Object.assign(S,ti);S.view='inventario';save();render();
  $('#upres').innerHTML=`<div class="result"><b>${src.inv.length} equipos vigentes cargados</b> desde ${esc(f.name)} · ${src.prev.length} históricos${src.bad?` · ${src.bad} filas omitidas (sin serie, centro de trabajo o fecha válida)`:''}${src.mdy?' · fechas leídas como mm/dd/aaaa (formato EE. UU.)':''}.<div class="note">Cumplieron vida útil: ${S.items.filter(e=>baseSt(e)==='VENCIDO').length} · En alerta: ${S.items.filter(e=>baseSt(e)==='ALERTA').length} · En plan de renovación: ${S.items.filter(e=>e.p==='CONFIRMADO').length}</div></div>`;
  log('POST','/inventario/import','int',{archivo:f.name,filas:src.total,vigentes:src.inv.length,historicos:src.prev.length,omitidas:src.bad},'Carga de la vista de equipos de AppSheet a Activo 360.')},'#upres',true)}

/* ================= ALERTAS ================= */
VIEWS.alertas=()=>{const a=alerts(),f=S.alF||'';const l=a.map((x,i)=>[x,i]).filter(([x])=>!f||x.l===f);
  return `<div><h1>Alertas</h1><p class="sub">Lo que necesita atención hoy (${fd(S.today)}), de la más urgente a la informativa. Se recalculan con cada cierre del día y cada actualización de AppSheet.</p></div>
  <div class="row">${[['','Todas',a.length],['bad','Urgentes',a.filter(x=>x.l==='bad').length],['warn','Por atender',a.filter(x=>x.l==='warn').length],['info','Avisos',a.filter(x=>x.l==='info').length]].map(([k,t,n])=>`<button class="btn sm ${f===k?'p':''}" data-alf="${k}">${t} · ${n}</button>`).join('')}</div>
  <div class="card alist">${l.map(([x,i])=>alertRow(x,i)).join('')||'<p class="note">Sin alertas en esta categoría.</p>'}</div>`};
after.alertas=()=>{$$('[data-alf]').forEach(b=>b.onclick=()=>{S.alF=b.dataset.alf;render()});bindAlerts(alerts())};

after.panel=()=>bindAlerts(alerts());

/* ================= INGENIERO ================= */
VIEWS.ingeniero=()=>{
  const clins=[...new Set(S.items.filter(mine).map(e=>e.CLINICA))].sort();
  const score=c=>S.items.filter(e=>e.CLINICA===c&&((!e.p&&soon(e))||['CONFIRMADO','AGENDA','ENTREGA','DONACION'].includes(e.p))).length;
  if(!S.engClinic||!clins.includes(S.engClinic))S.engClinic=clins.slice().sort((a,b)=>score(b)-score(a))[0];
  const its=S.items.filter(e=>e.CLINICA===S.engClinic);const eng=its[0]?.INGENIERO||'Ingeniero';
  const toConf=its.filter(e=>!e.p&&soon(e)),toDx=its.filter(e=>e.p==='CONFIRMADO'),toAg=its.filter(e=>e.p==='AGENDA'),toDel=its.filter(e=>e.p==='ENTREGA'),toDon=its.filter(e=>e.p==='DONACION');
  const dx=S.dxId!=null?S.items[S.dxId]:null;const tm=addBiz(S.today,1);
  const hrs=['9:00','10:00','11:00','12:00','13:00','16:00','17:00'];
  return `<div class="row"><div><h1>Ingeniero de Sistemas</h1><p class="sub">${esc(eng)} · alertas, diagnóstico, agenda y entrega en clínica. Los pendientes nuevos llegan por correo con el enlace a esta pantalla.</p></div><span class="sp"></span>
   <select id="ec">${clins.map(c=>`<option value="${esc(c)}" ${c===S.engClinic?'selected':''}>${esc(c)} (${score(c)})</option>`).join('')}</select></div>
  ${toConf.length?`<div class="banner"><div style="flex:1 1 300px"><b>Alerta preventiva.</b> ${toConf.filter(e=>baseSt(e)==='VENCIDO').length} equipos ya cumplieron su vida útil y ${toConf.filter(e=>baseSt(e)==='ALERTA').length} la cumplen en los próximos 3 meses en ${esc(S.engClinic)}. Cuando lleguen los equipos nuevos, confirma para iniciar el diagnóstico.</div><button class="btn p" id="confAll">Confirmar llegada de equipos nuevos (${toConf.length})</button></div>`:''}
  ${dx?dxForm(dx):''}
  <div class="grid g2">
   <div class="card"><h2>Por diagnosticar <span class="cnt">${toDx.length}</span></h2>
    <div class="tbl" style="margin-top:10px"><table>${toDx.map(e=>`<tr><td>${eqLine(e)}</td><td style="text-align:right"><button class="btn sm p" data-dx="${e._i}">Diagnosticar</button></td></tr>`).join('')||'<tr><td class="note">Sin equipos pendientes de diagnóstico.</td></tr>'}</table></div></div>
   <div class="card"><h2>Por agendar entrega <span class="cnt">${toAg.length}</span></h2><p class="note">Ya están pagados y facturados. Prepara el equipo y propone fecha y hora; el comprador recibe la cita en Humand.</p>
    <div class="tbl" style="margin-top:10px"><table>${toAg.map(e=>`<tr><td>${eqLine(e)}<div class="note">Comprador: <b>${esc(e.buyer)}</b> · ${esc(e.sale?.folio||'')}</div></td><td><div class="row" style="gap:4px;justify-content:flex-end"><input type="date" id="cd-${e._i}" value="${tm}" min="${S.today}"><select id="ch-${e._i}">${hrs.map(h=>`<option>${h}</option>`).join('')}</select><button class="btn sm p" data-ag="${e._i}">Agendar</button></div></td></tr>`).join('')||'<tr><td class="note">Sin entregas por agendar.</td></tr>'}</table></div></div>
  </div>
  <div class="grid g2">
   <div class="card"><h2>Entregas agendadas <span class="cnt">${toDel.length}</span></h2><p class="note">El comprador recibe recordatorio diario en Humand hasta que marques la entrega. Solo Sistemas puede cambiar la cita.</p>
    <div class="tbl" style="margin-top:10px"><table>${toDel.map(e=>`<tr><td>${eqLine(e)}<div class="note">Comprador: <b>${esc(e.buyer)}</b> · cita <b>${fd(e.cita.d)} ${esc(e.cita.h)}</b>${S.today>e.cita.d?` · <span class="pill p-warn">${diff(e.cita.d,S.today)} d sin recoger</span>`:''}</div></td><td><div class="row" style="gap:4px;justify-content:flex-end"><button class="btn sm" data-rp="${e._i}">Reprogramar</button><button class="btn sm h" data-del="${e._i}">Registrar entrega</button></div></td></tr>`).join('')||'<tr><td class="note">Sin entregas agendadas.</td></tr>'}</table></div></div>
   <div class="card"><h2>Donaciones por entregar <span class="cnt">${toDon.length}</span></h2><p class="note">Activo Fijo eligió la donataria y la fecha. Al entregar, el equipo sale del stock.</p>
    <div class="tbl" style="margin-top:10px"><table>${toDon.map(e=>`<tr><td>${eqLine(e)}<div class="note">${esc(e.don.org)} · ${fd(e.don.fecha)}</div></td><td style="text-align:right"><button class="btn sm h" data-dent="${e._i}">Registrar entrega</button></td></tr>`).join('')||'<tr><td class="note">Sin donaciones por entregar.</td></tr>'}</table></div></div>
  </div>
  <div class="card"><h2>Equipos de la clínica</h2><div class="tbl" style="margin-top:10px;max-height:420px"><table><tr><th>Equipo</th><th>Sustituir</th><th>Estatus</th></tr>${its.map(e=>`<tr data-eq="${e._i}" style="cursor:pointer"><td>${eqLine(e)}</td><td class="mono">${fd(due(e))}</td><td>${pill(stOf(e))}</td></tr>`).join('')}</table></div></div>`;
};

function dxForm(e){const d=S.dxDraft||(S.dxDraft={...DEFDX,comp:[],fotos:''});const t=tipo(e),pc=t==='Escritorio'||t==='Laptop';
  const seg=(k,opts)=>`<div class="seg">${opts.map(([v,l])=>`<label><input type="radio" name="${k}" value="${v}" ${d[k]===v?'checked':''}>${l}</label>`).join('')}</div>`;
  const dest=destino(d),pr=priceCalc(e,d);const needDisk=pc||t==='Memoria USB';
  return `<div class="card" style="border-color:var(--sd)"><div class="row"><h2>Diagnóstico · ${esc(e.ID_ACTIVO)}</h2><span class="pill p-mut">${esc(t)}</span><span class="sp"></span><button class="btn sm" id="dxx">Cerrar</button></div>
  <p class="note">${esc(e.MARCA)} ${esc(e.MODELO)}${pc?` · ${esc(e.PROCESADOR)} · ${e.RAM_GB} GB · ${esc(e.ALMACENAMIENTO)}`:''}${t==='Escritorio'?' · '+esc(e.MONITOR):''} · serie ${esc(e.NUM_SERIE)} · adquirido ${fd(e.FECHA_ADQUISICION)}</p>
  <form id="dxf" class="form" style="margin-top:10px">
   <div class="fld"><span class="lb">${pc?'¿Enciende y arranca el sistema?':'¿Funciona correctamente?'}</span>${seg('enciende',[['si','Sí'],['no','No']])}</div>
   ${d.enciende==='si'?`
   ${pc?`<div class="fld"><span class="lb">Rendimiento en prueba</span>${seg('rend',[['ok','Óptimo'],['lento','Lento']])}</div>`:''}
   ${t==='Escritorio'?`<div class="fld"><span class="lb">Monitor</span>${seg('monitor',[['ok','Funciona'],['fallas','Con fallas'],['no','No incluido']])}</div>`:''}
   <div class="fld"><span class="lb">Estética</span>${seg('estetica',[['A','A · como nuevo'],['B','B · detalles'],['C','C · golpes']])}</div>
   ${pc||t==='Hub USB-C'?`<div class="fld"><span class="lb">Puertos USB / red / video</span>${seg('puertos',[['ok','Todos funcionan'],['falla','Alguno falla']])}</div>`:''}
   <div class="fld"><span class="lb">${t==='Escritorio'?'Teclado y mouse':t==='Laptop'?'Cargador':'Cables y accesorios'}</span>${seg('perif',[['si','Incluidos'],['no','No incluidos']])}</div>
   ${needDisk?`<div class="fld"><span class="lb">Almacenamiento (seguridad de información)</span>${seg('disco',[['borrado','Borrado seguro hecho'],['pend','Pendiente'],['retirado','Retirado y destruido']])}</div>`:''}`:`
   <div class="fld"><span class="lb">Componentes recuperables</span><div class="seg">${(pc?['RAM','Disco','Fuente','Monitor']:['Cables','Piezas']).map(c=>`<label><input type="checkbox" name="comp" value="${c}" ${d.comp.includes(c)?'checked':''}>${c}</label>`).join('')}</div></div>`}
   <div class="fld"><label for="fotos">Evidencia fotográfica</label><input type="file" id="fotos" accept="image/*" multiple><span class="note">${esc(d.fotos||'Sin archivos')}</span></div>
   <div class="fld"><label for="obs">Observaciones</label><input type="text" id="obs" value="${esc(d.obs)}" placeholder="Opcional"></div>
  </form>
  <div class="${dest==='VENTA'&&!(needDisk&&d.disco==='pend')?'result':'result bad'}" style="margin-top:12px">
   ${dest==='VENTA'?(needDisk&&d.disco==='pend'?`<b>Falta el borrado seguro.</b> Para enviarlo a venta, el almacenamiento debe estar borrado o retirado.`:
   `<div class="row"><div><div class="note">Destino: <b>Venta local en ${esc(e.MUNICIPIO)}</b></div>${pr.tab?tabBox(pr):`<div class="pr">${money(pr.sug)}</div><div class="note">Rango sugerido ${money(pr.min)} – ${money(pr.max)} · tabulador de Activo Fijo</div>`}</div><span class="sp"></span><button class="btn h" id="dxsend">Enviar a Activo Fijo por Humand</button></div>`)
   :`<div class="row"><div><div class="note">Destino</div><b>${dest==='RECUP'?'Recuperar componentes ('+d.comp.join(', ')+') y destruir el remanente':'Destrucción certificada'}</b></div><span class="sp"></span><button class="btn" id="dxsend">Enviar a destrucción</button></div>`}
  </div></div>`}
after.ingeniero=()=>{
  $('#ec').onchange=e=>{S.engClinic=e.target.value;S.dxId=null;render()};
  $('#confAll')&&($('#confAll').onclick=()=>{const l=S.items.filter(e=>e.CLINICA===S.engClinic&&!e.p&&soon(e));l.forEach(e=>{e.p='CONFIRMADO';H(e,'Reemplazo confirmado: equipos nuevos recibidos en clínica','SIS')});save();render();toast(`${l.length} equipos listos para diagnóstico`)});
  $$('[data-dx]').forEach(b=>b.onclick=()=>{S.dxId=+b.dataset.dx;S.dxDraft=null;render();$('#dxf').scrollIntoView({block:'center'})});
  $$('[data-del]').forEach(b=>b.onclick=()=>openDelivery(+b.dataset.del));
  $$('[data-ag]').forEach(b=>b.onclick=()=>{const e=S.items[+b.dataset.ag],d=$('#cd-'+e._i).value;if(!d||d<S.today){toast('Elige una fecha a partir de hoy');return}schedule(e,d,$('#ch-'+e._i).value);save();render();toast('Cita enviada al comprador por Humand')});
  $$('[data-rp]').forEach(b=>b.onclick=()=>openResched(+b.dataset.rp));
  $$('[data-dent]').forEach(b=>b.onclick=()=>{deliverDon(S.items[+b.dataset.dent]);save();render();toast('Donación entregada · Activo Fijo tiene 10 días para adjuntar la factura')});
  if(!$('#dxf'))return;
  $('#dxx').onclick=()=>{S.dxId=null;render()};
  $('#dxf').onchange=ev=>{const d=S.dxDraft;const t=ev.target;if(t.name==='comp')d.comp=$$('input[name=comp]:checked').map(x=>x.value);else if(t.id==='fotos')d.fotos=[...t.files].map(f=>f.name).join(', ');else if(t.id==='obs')d.obs=t.value;else if(t.name)d[t.name]=t.value;render()};
  $('#dxsend')&&($('#dxsend').onclick=()=>{const e=S.items[S.dxId],d={...S.dxDraft};e.dx=d;const dest=destino(d);
    if(dest==='VENTA'){e.price=priceCalc(e,d);e.price.aut=e.price.sug;e.p='PRECIO';H(e,`Diagnóstico registrado · destino venta · sugerido ${money(e.price.sug)}`,'SIS');newReq('PRECIO',e,{amount:e.price.sug});toast('Solicitud enviada a la bandeja de Activo Fijo en Humand')}
    else{e.p='DESTRUCCION';e.destD=S.today;H(e,dest==='RECUP'?`No funciona · se recuperan ${d.comp.join(', ')} · remanente a destrucción`:'No funciona · destrucción certificada','SIS');toast('Equipo enviado a destrucción certificada')}
    S.dxId=null;S.dxDraft=null;save();render()});
};
function openResched(i){const e=S.items[i];const hrs=['9:00','10:00','11:00','12:00','13:00','16:00','17:00'];
 $('#drawer').innerHTML=`<div class="drawer"><div><div class="row"><h2>Reprogramar entrega</h2><span class="sp"></span><button class="btn sm" data-close>Cerrar</button></div>${eqLine(e)}
 <div class="card"><div class="note">Cita actual</div><b>${fd(e.cita.d)} · ${esc(e.cita.h)}</b><div class="note">Comprador: ${esc(e.buyer)}</div></div>
 <div class="form"><div class="fld"><label for="rpd">Nueva fecha</label><input type="date" id="rpd" value="${addBiz(S.today,1)}" min="${S.today}"></div><div class="fld"><label for="rph">Hora</label><select id="rph">${hrs.map(h=>`<option>${h}</option>`).join('')}</select></div></div>
 <button class="btn p" id="rpok">Guardar y avisar al comprador</button></div></div>`;bindClose();
 $('#rpok').onclick=()=>{const d=$('#rpd').value;if(!d||d<S.today){toast('Elige una fecha a partir de hoy');return}schedule(e,d,$('#rph').value,true);closeDrawer();save();render();toast('Nueva cita enviada por Humand')}}
function openDelivery(i){const e=S.items[i];$('#drawer').innerHTML=`<div class="drawer"><div><div class="row"><h2>Entrega en clínica</h2><span class="sp"></span><button class="btn sm" data-close>Cerrar</button></div>
 ${eqLine(e)}<div class="card"><div class="note">Entregar a</div><b>${esc(e.buyer)}</b><div class="note">${esc(e.sale?.folio||'')} · factura ${esc(e.fac||'')} · ${money(e.pay?.amount||0)} · cita ${fd(e.cita?.d)} ${esc(e.cita?.h||'')}</div></div>
 <label class="chk"><input type="checkbox" id="c1"> Verifiqué identificación / gafete del colaborador</label>
 <label class="chk"><input type="checkbox" id="c2"> El colaborador revisó el equipo y firma de conformidad (equipo usado, sin garantía)</label>
 <div class="fld"><label for="fir">Nombre de quien recibe (firma digital)</label><input type="text" id="fir" value="${esc((e.buyer||'').split(' · ')[0])}"></div>
 <button class="btn p" id="okDel" disabled>Marcar como entregado</button></div></div>`;
 const chk=()=>$('#okDel').disabled=!($('#c1').checked&&$('#c2').checked&&$('#fir').value.trim());['#c1','#c2','#fir'].forEach(s=>$(s).oninput=chk);
 $('#okDel').onclick=()=>{e.p='ENTREGADO';H(e,`Equipo entregado a ${$('#fir').value.trim()} · expediente cerrado`,'SIS');addFile(e,'Acta de entrega firmada.pdf');notify(e.buyer,`Entrega registrada de ${e.ID_ACTIVO}. Cuéntanos cómo te fue en la encuesta de 3 preguntas.`,'req');log('PATCH','/inventario/'+e.ID_ACTIVO,'int',{estatus:'ENTREGADO',baja:true},'Cierre del activo en el inventario.');closeDrawer();save();render();toast('Entrega registrada · venta concluida')};
 bindClose()}

function closeDrawer(){$('#drawer').innerHTML=''}
function bindClose(){$$('[data-close]').forEach(b=>b.onclick=closeDrawer);const d=document.querySelector('.drawer');d&&(d.onclick=ev=>{if(ev.target===d)closeDrawer()})}

/* ================= SEGUIMIENTO ================= */
const ownerOf=e=>e.p==='FIRMAS'&&e.sale?.colSig?'JEFE':OWNER[e.p];
VIEWS.seguimiento=()=>{
  const act=S.items.filter(e=>e.p&&!DESTR.includes(e.p)).filter(e=>!S.segArea||(S.segArea==='COL'?['COL','JEFE'].includes(ownerOf(e)):ownerOf(e)===S.segArea)||(S.segArea==='DONE'&&['ENTREGADO','DONADO'].includes(e.p)));
  act.sort((a,b)=>(DON.includes(a.p)?20:flowIdx(a.p))-(DON.includes(b.p)?20:flowIdx(b.p)));
  return `<div><h1>Seguimiento de ventas</h1><p class="sub">Dónde está cada venta, quién la tiene y cuántos días lleva. Mientras nadie responda hay recordatorio diario: por el bot de Activo 360 en Humand al colaborador, jefe, Activo Fijo e Ingresos; por correo a Sistemas, Facturación y Fiscal. Al tercero se escala al jefe del área.</p></div>
  <div class="card"><div class="flow"><span>Ingeniero diagnostica</span><em>→</em><span>Activo Fijo autoriza precio</span><em>→</em><span class="h">Publicación en el Bazar</span><em>→</em><span class="h">Compra en Gestión de Servicios</span><em>→</em><span class="h">Colaborador y jefe firman (${C().plazo.firmas} d)</span><em>→</em><span class="h">Depósito y váucher (${C().plazo.pago} d)</span><em>→</em><span>Ingresos confirma · sale del stock</span><em>→</em><span class="g">Facturación adjunta CFDI</span><em>→</em><span class="g">Sistemas agenda</span><em>→</em><span>Entrega</span></div><p class="note" style="margin:8px 0 0">En rosa: lo que se hace en Humand (Bazar, formulario de compra, firmas). En blanco: se resuelve en Activo 360, con aviso por el bot de Humand. En azul: aviso por correo de Google. Si el equipo no se vende en ${C().plazo.sinVenta} días, Activo Fijo decide: bajar precio, subasta, donación o destrucción.</p></div>
  <div class="row"><span class="note">Filtrar por responsable:</span>${[['','Todos'],['SIS','Sistemas'],['AF','Activo Fijo'],['COL','Colaborador / jefe'],['ING','Ingresos'],['FAC','Facturación'],['DONE','Concluidos']].map(([k,l])=>`<button class="btn sm ${S.segArea===k?'p':''}" data-sa="${k}">${l}</button>`).join('')}</div>
  <div class="tbl"><table><tr><th>Equipo</th><th>Etapa actual</th><th>Responsable</th><th class="n">Días en etapa</th><th class="n">Recordat.</th><th>Tiempo meta</th><th>Avance</th></tr>
  ${act.map(e=>{const r=curReq(e);const last=e.hist[e.hist.length-1];const days=r?diff(r.created,S.today):last?diff(last.d,S.today):0;const ow=ownerOf(e);return `<tr data-eq="${e._i}" style="cursor:pointer"><td>${eqLine(e)}${e.sale?`<div class="mono note">${e.sale.folio}</div>`:''}</td><td>${pill(e.p)}${r?`<div class="mono note">${r.id}</div>`:''}</td><td>${['ENTREGADO','DONADO'].includes(e.p)?'—':ow==='COL'&&e.buyer?esc(e.buyer.split(' · ')[0])+'<div class="note">colaborador</div>':ow==='JEFE'?esc(e.sale.jefe)+'<div class="note">jefe inmediato</div>':AREAS[ow]||'—'}${r?.esc?' <span class="pill p-bad">Escalado</span>':''}</td><td class="n">${e.p==='ENTREGADO'?'—':days}</td><td class="n">${r?r.rem:'—'}</td><td>${r?slaPill(r):sisTask(e)?slaPill(sisTask(e)):e.p==='PAGO'?`<span class="pill p-warn">vence ${fd(e.pay.dl)}</span>`:''}</td><td>${steps(e,true)}</td></tr>`}).join('')||'<tr><td class="note">Sin solicitudes en este filtro.</td></tr>'}</table></div>`;
};
after.seguimiento=()=>$$('[data-sa]').forEach(b=>b.onclick=()=>{S.segArea=b.dataset.sa;render()});
/* ---------- Recorrido de un equipo: diagrama por bloques para explicar el proceso con un ejemplo ---------- */
const RPH=[['det','Detección','🔔'],['dx','Diagnóstico','🔧'],['af','Precio','🏷️'],['bz','Bazar','🛍️'],['cp','Compra y firmas','✍️'],['pg','Pago','💳'],['ing','Ingresos','🏦'],['fac','Facturación','🧾'],['ent','Entrega','📦']];
const RPH2=[['dec','Sin venta en 15 días','⏳'],['sub','Subasta','🔨'],['des','Destrucción','♻️'],['don','Donación','🤝']];
const RWHO={A360:'Activo 360',SIS:'Sistemas · ingeniero',AF:'Activo Fijo',HUM:'Colaboradores de la ciudad',COL:'Colaborador',JEFE:'Jefe inmediato',ING:'Ingresos',FAC:'Facturación',FIS:'Fiscal (Jurídico)'};
const RCH={a360:['En Activo 360','rc-sd'],humand:['En Humand','rc-hm'],firma:['Firma en Humand','rc-hm'],correo:['Aviso por correo','rc-in']};
const RSC=[['venta','Venta normal'],['baja','No se vende → baja de precio'],['subasta','No se vende → subasta'],['destruccion','No se vende → destrucción'],['nofunc','No enciende → destrucción'],['donacion','No se vende → donación']];
const RP2K={CONFIRMADO:'dx',PRECIO:'af',PUBLICADO:'bz',SUBASTA:'sub1',PAGO:'pg2',DEPOSITO:'ing',FACTURA:'fac',AGENDA:'ent1',ENTREGA:'ent2',ENTREGADO:'ent2',DESTRUCCION:'des1',RECOLECCION:'des2',DESTRUIDO:'des3',DONACION:'don1',DONADO_FACT:'don2',DONADO:'don3'};
function recEx(){const R=S.rec||{};if(R.eq!=null&&S.items[R.eq]&&mine(S.items[R.eq]))return S.items[R.eq];
  const pcs=S.items.filter(x=>mine(x)&&!x.p&&['Escritorio','Laptop'].includes(tipo(x)));const l=pcs.filter(x=>baseSt(x)==='ALERTA');const pool=l.length?l:pcs.length?pcs:S.items.filter(mine).length?S.items.filter(mine):S.items;
  return pool[(R.pick||0)%pool.length]}
function recSteps(e,R){const K=C(),P=K.plazo,sla=K.sla,ing=e.INGENIERO||'Ingeniero de Sistemas',buyer=(e.buyer||BUYERS[0]).split(' · ')[0],jefe=e.sale?.jefe||JEFES[2],folio0=R.folio;
  const price=+(e.price?.aut??estValue(e)),low=Math.round(price*.85*100)/100,mun=e.MUNICIPIO||e.CLINICA,fac=R.fac,folio=e.sale?.folio||folio0||'VTA-'+S.today.slice(0,4)+'-00123';
  const mk=(k,ph,who,ch,t,what,o={})=>({k,ph,who,ch,t,what,...o});
  const pre=[
   mk('det','det','A360','a360','Cumple 5 años: Activo 360 lo detecta',`Se instaló el ${fd(e.FECHA_ADQUISICION)} y cumple su vida útil el ${fd(due(e))}. Tres meses antes aparece en Alertas y en la bandeja de ${esc(ing)}.`,{notif:'Correo al ingeniero de Sistemas de la clínica',mock:`<div class="rx-alr"><b>⚠ Cumple 5 años en ≤3 meses</b><span>${esc(eqName(e))} · ${esc(e.CLINICA)}</span></div>`}),
   mk('dx','dx','SIS','a360','El ingeniero lo diagnostica',`${esc(ing)} confirma que ya llegó el equipo nuevo y revisa el viejo: si enciende, rendimiento, monitor, estética y puertos. Borra el disco y sube fotos. El tabulador sugiere el precio solo.`,{plazo:`${sla.SIS} días hábiles`,fail:'Si el equipo no enciende, va directo a destrucción certificada.',mock:`<div class="rx-form"><span>Enciende <b>Sí</b></span><span>Rendimiento <b>Bien</b></span><span>Estética <b>A</b></span><span>Disco <b>Borrado</b></span><div class="rx-big">Precio sugerido ${money(price)}</div></div>`}),
   mk('af','af','AF','humand','Activo Fijo autoriza el precio',`Le llega una solicitud por el bot de Activo 360 en Humand. Acepta el precio sugerido (${money(price)}) o lo cambia.`,{plazo:`${sla.AF} día hábil`,fail:'Si no responde: recordatorio diario y, al tercero, se escala a su jefe.',mock:`<div class="rx-req"><b>Autorización de precio</b><span>${esc(eqName(e))}</span><div class="rx-big">${money(price)}</div><div class="rx-btns"><i class="ok">Autorizar</i><i>Cambiar</i></div></div>`}),
   mk('bz','bz','HUM','humand','Se publica en el Bazar de Humand',`Lo ven los colaboradores de ${esc(mun)} con foto, características y precio. Tiene ${P.sinVenta} días para venderse.`,{plazo:`${P.sinVenta} días`,mock:`<div class="rx-prod"><div class="rx-pic">💻</div><b>${esc(eqName(e))}</b><span>${esc(e.PROCESADOR||'')} ${e.RAM_GB?'· '+e.RAM_GB+' GB':''}</span><div class="rx-big">${money(price)}</div><div class="rx-btns"><i class="ok">Comprar</i></div></div>`})];
  const sale=(amt,from)=>[
   mk('cp1','cp','COL','humand',`${esc(buyer)} lo compra`,`Da “Comprar” en el Bazar${from?' '+from:''} y llena la solicitud en Gestión de Servicios: ${fac?'pide factura con sus datos fiscales':'elige venta a público en general'}. El equipo se congela: nadie más lo puede comprar.`,{notif:'Activo Fijo (informativo)',mock:`<div class="rx-req"><b>Compra de equipo</b><span>${esc(buyer)} · ${money(amt)}</span><div class="rx-btns"><i class="${fac?'ok':''}">Con factura</i><i class="${fac?'':'ok'}">Público en general</i></div><span class="rx-tag">🔒 Congelado</span></div>`}),
   mk('cp2','cp','COL','firma',`${esc(buyer)} firma el formato`,'Recibe el formato de compra SGC-N4-60 ya llenado y lo firma en Humand.',{plazo:`${P.firmas} día hábil para las dos firmas`,fail:'Si no firman a tiempo, el equipo se libera y regresa al Bazar.',mock:`<div class="rx-doc"><b>SGC-N4-60</b><span>Formato de compra · ${folio}</span><div class="rx-sig">✓ ${esc(buyer)}</div><div class="rx-sig off">Jefe inmediato</div></div>`}),
   mk('cp3','cp','JEFE','firma',`Firma su jefe, ${esc(jefe)}`,'El jefe inmediato autoriza la compra de su colaborador firmando el mismo formato.',{plazo:'dentro del mismo día hábil',fail:'Si no firma a tiempo, el equipo se libera.',mock:`<div class="rx-doc"><b>SGC-N4-60</b><span>Formato de compra · ${folio}</span><div class="rx-sig">✓ ${esc(buyer)}</div><div class="rx-sig">✓ ${esc(jefe)}</div></div>`}),
   mk('pg1','pg','COL','humand','Recibe los datos para depositar',`Activo 360 le manda por Humand el banco, la CLABE y el concepto (folio ${folio}).`,{plazo:`${P.pago} días hábiles para depositar`,mock:`<div class="rx-req"><b>Datos para tu depósito</b><span>Banco: ${esc(K.banco.banco)}</span><span>CLABE: ${esc(K.banco.clabe)}</span><span>Concepto: ${folio}</span><div class="rx-big">${money(amt)}</div></div>`}),
   mk('pg2','pg','COL','humand','Deposita y sube su váucher','Hace el depósito y adjunta el comprobante en el formulario de Humand.',{fail:'Si no deposita en plazo, se libera y regresa al Bazar.',mock:`<div class="rx-req"><b>Comprobante de depósito</b><span>📎 vaucher_${folio}.jpg</span><div class="rx-btns"><i class="ok">Enviar</i></div></div>`}),
   mk('ing','ing','ING','humand','Ingresos confirma el depósito','Revisa el váucher contra las 4 cuentas. Al confirmar, el equipo sale del stock y en AppSheet pasa a VENDIDO.',{plazo:`${sla.ING} días hábiles`,fail:'Si no encuentra el depósito, se le pide al colaborador revisarlo.',mock:`<div class="rx-req"><b>Confirmación de depósito</b><span>${folio} · ${money(amt)}</span><div class="rx-btns"><i class="ok">Confirmar</i><i>No se encontró</i></div></div>`}),
   mk('fac','fac','FAC','correo','Facturación emite la factura',fac?`Recibe un correo con los datos fiscales de ${esc(buyer)}, emite el CFDI a su nombre y lo adjunta en Activo 360.`:'Recibe un correo, emite el CFDI a público en general y lo adjunta en Activo 360.',{plazo:`${sla.FAC} días hábiles`,mock:`<div class="rx-mail"><b>Para: ${MAIL_FAC}</b><span>Venta pendiente de facturar · ${folio}</span><span>${fac?'Con factura · RFC del colaborador':'Venta a público en general'}</span><div class="rx-btns"><i class="ok">Adjuntar CFDI</i></div></div>`}),
   mk('ent1','ent','SIS','correo','Sistemas agenda la entrega',`${esc(ing)} prepara el equipo y propone fecha y hora. ${esc(buyer)} recibe la cita en Humand.`,{mock:`<div class="rx-req"><b>Cita de entrega</b><span>${esc(e.CLINICA)}</span><div class="rx-big">📅 ${fd(addBiz(S.today,3))} · 10:00</div></div>`}),
   mk('ent2','ent','SIS','a360','Entrega y cierre',`Se entrega con gafete en ${esc(e.CLINICA)}. La venta queda cerrada con todo su expediente en Drive.`,{mock:`<div class="rx-done">✓ Vendido y entregado<span>${folio} · ${money(amt)}</span></div>`})];
  const dec=mk('dec','dec','AF','humand',`Pasaron ${P.sinVenta} días sin venta`,'Activo Fijo recibe la pregunta: bajar el precio, abrir subasta, mandarlo a destrucción o donarlo.',{mock:`<div class="rx-req"><b>Equipo sin venta</b><span>${esc(eqName(e))} · ${P.sinVenta} días</span><div class="rx-btns"><i class="${R.sc==='baja'?'ok':''}">Bajar precio</i><i class="${R.sc==='subasta'?'ok':''}">Subasta</i><i class="${R.sc==='destruccion'?'ok':''}">Destruir</i><i class="${R.sc==='donacion'?'ok':''}">Donar</i></div></div>`});
  if(R.sc==='baja')return[...pre,dec,mk('bz2','bz','HUM','humand','Se vuelve a publicar más barato',`Activo Fijo baja el precio a ${money(low)} y el equipo regresa al Bazar.`,{mock:`<div class="rx-prod"><div class="rx-pic">💻</div><b>${esc(eqName(e))}</b><div class="rx-big"><s>${money(price)}</s> ${money(low)}</div><div class="rx-btns"><i class="ok">Comprar</i></div></div>`}),...sale(low)];
  if(R.sc==='subasta'){const mn=r50(price*K.subastaMin);return[...pre,dec,mk('sub1','sub','HUM','humand','Subasta en el Bazar',`Sale a subasta desde ${money(mn)}. Los colaboradores ofertan durante ${P.subasta} días hábiles.`,{plazo:`${P.subasta} días hábiles`,mock:`<div class="rx-prod"><div class="rx-pic">🔨</div><b>${esc(eqName(e))}</b><span>Desde ${money(mn)}</span><div class="rx-big">Mejor oferta ${money(mn+100)}</div></div>`}),...sale(mn+100,'(ganó la subasta)')]}
  const nof=R.sc==='nofunc';if(nof||R.sc==='destruccion')return[...(nof?pre.slice(0,2):[...pre,dec]),
   mk('des1','des',nof?'SIS':'AF',nof?'a360':'humand','Se manda a destrucción certificada',nof?'En el diagnóstico el equipo no enciende: no se puede vender y se aparta para recolección.':'Activo Fijo decide destruirlo. Queda apartado para recolección.',{mock:`<div class="rx-tag big">♻️ Para destrucción certificada</div>`}),
   mk('des2','des','SIS','correo','Recolección programada','El proveedor certificado pasa por el equipo a la clínica.',{}),
   mk('des3','des','AF','a360','Destruido con certificado','Se adjunta el certificado y en AppSheet queda DESTRUIDO.',{mock:`<div class="rx-done">✓ Destruido (certificado)</div>`})];
  if(R.sc==='donacion')return[...pre,dec,
   mk('don1','don','SIS','a360','Se entrega a la donataria',`Activo Fijo elige una donataria autorizada y ${esc(ing)} entrega el equipo.`,{mock:`<div class="rx-req"><b>Donación</b><span>${esc(K.donatarias[0])}</span></div>`}),
   mk('don2','don','AF','humand','Factura de la donataria','Activo Fijo adjunta la factura que emite la donataria.',{plazo:`${P.donFact} días`}),
   mk('don3','don','FIS','correo','Fiscal revisa la donación','Jurídico revisa que la factura cumpla los requisitos fiscales. Queda como DONADO.',{mock:`<div class="rx-done">✓ Donado</div>`})];
  return[...pre,...sale(price)]}
function recScOf(e){if(DESTR.includes(e.p))return e.price?'destruccion':'nofunc';if(DON.includes(e.p))return'donacion';if(e.p==='SUBASTA'||e.auc)return'subasta';return'venta'}
function recKeyOf(e){if(!e.p)return'det';if(e.p==='FIRMAS')return e.sale?.colSig?'cp3':'cp2';return RP2K[e.p]||'det'}
VIEWS.recorrido=()=>{const R=S.rec||(S.rec={sc:'venta',fac:false,k:0,pick:0});const e=recEx();const real=R.eq!=null&&S.items[R.eq];
  if(real){R.sc=recScOf(e);R.fac=!!(e.sale&&e.sale.fiscal&&e.sale.fiscal.tipo!=='publico')}
  const L=recSteps(e,R);const cur=real?Math.max(0,L.findIndex(s=>s.k===recKeyOf(e))):-1;if(R.k==null)R.k=Math.max(0,cur);R.k=Math.max(0,Math.min(R.k,L.length-1));const s=L[R.k],nx=L[R.k+1];
  const seen=new Set(L.slice(0,R.k).map(x=>x.ph)),path=new Set(L.map(x=>x.ph));
  const blk=([id,n,ic],i)=>{const st=id===s.ph?'cur':seen.has(id)?'done':path.has(id)?'next':'off';const fst=L.findIndex(x=>x.ph===id);
    return `<button class="rx-b ${st}" ${fst<0?'disabled':`data-rk="${fst}"`} aria-current="${st==='cur'?'step':'false'}"><span class="rx-n">${st==='done'?'✓':i}</span><span class="rx-i" aria-hidden="true">${ic}</span><b>${n}</b>${st==='cur'?'<span class="rx-pc" aria-hidden="true">💻</span>':''}</button>`};
  const who=s.who,ch=RCH[s.ch];
  return `<div><h1>Recorrido de un equipo</h1><p class="sub">${real?`Dónde va <b>${esc(e.ID_ACTIVO)}</b> (${esc(eqName(e))}) y qué le falta.`:'Un ejemplo paso a paso para explicar el proceso: quién actúa, dónde y qué sigue.'} Usa las flechas del teclado o los botones.</p></div>
  <div class="card rx-top"><div class="rx-eq"><span class="rx-pic sm">💻</span><div><b>${esc(eqName(e))}</b> <span class="mono note">${esc(e.ID_ACTIVO)}</span><div class="note">${esc(e.CLINICA)} · instalado ${fd(e.FECHA_ADQUISICION)} · cumple 5 años el ${fd(due(e))}</div></div></div>
   <span class="sp"></span>${real?`${pill(stOf(e))}<button class="btn sm" data-rx="ej">Ver ejemplo guiado</button>`:`<button class="btn sm" data-rx="otro">Otro equipo</button>`}</div>
  ${real?'':`<div class="row rx-ctl"><span class="note">Escenario:</span>${RSC.map(([k,l])=>`<button class="btn sm ${R.sc===k?'p':''}" data-rsc="${k}">${l}</button>`).join('')}<span class="note" style="margin-left:8px">Factura:</span><button class="btn sm ${R.fac?'':'p'}" data-rfac="0">Público en general</button><button class="btn sm ${R.fac?'p':''}" data-rfac="1">A nombre del colaborador</button></div>`}
  <div class="card"><div class="rx-lane">${RPH.map((p,i)=>blk(p,i+1)).join('<i class="rx-ar" aria-hidden="true">→</i>')}</div>
   <div class="rx-br"><span class="note">Si no se vende en ${C().plazo.sinVenta} días:</span>${RPH2.map(p=>blk(p,'')).join('')}</div>
   <div class="rx-dots">${L.map((x,i)=>`<button class="${i<R.k?'d':i===R.k?'c':''}${real&&i===cur?' real':''}" data-rk="${i}" title="${i+1}. ${esc(x.t.replace(/<[^>]+>/g,''))}" aria-label="Paso ${i+1}"></button>`).join('')}</div></div>
  <div class="card rx-det"><div class="rx-txt"><div class="note">Paso ${R.k+1} de ${L.length}${real&&R.k===cur?(['ENTREGADO','DESTRUIDO','DONADO'].includes(e.p)?' · <b>proceso terminado</b>':' · <b>aquí va este equipo hoy</b>'):real&&R.k<cur?' · ya pasó':real?' · todavía no llega':''}</div>
    <h2>${s.t}</h2><div class="rx-chips"><span class="rx-c">👤 ${RWHO[who]}</span><span class="rx-c ${ch[1]}">${ch[0]}</span>${s.plazo?`<span class="rx-c">⏱ ${s.plazo}</span>`:''}</div>
    <p class="rx-what">${s.what}</p>${s.notif?`<p class="note">📣 Aviso a: ${s.notif}</p>`:''}${s.fail?`<p class="rx-fail">⚠ ${s.fail}</p>`:''}
    <div class="rx-nav"><button class="btn" data-rmv="-1" ${R.k?'':'disabled'}>◀ Anterior</button><button class="btn p" data-rmv="1" ${nx?'':'disabled'}>${nx?'Siguiente: '+nx.t.replace(/<[^>]+>/g,''):'Fin del recorrido'} ▶</button>${real&&R.k!==cur?`<button class="btn sm" data-rk="${cur}">Ir a la etapa actual</button>`:''}${!real&&R.k?'<button class="btn sm" data-rk="0">Reiniciar</button>':''}</div></div>
   <div class="rx-see"><div class="note">Lo que ve ${RWHO[who].toLowerCase()}</div>${s.mock||`<div class="rx-req"><b>${s.t}</b></div>`}</div></div>${trzCard(e,real)}`};
const txtOf=h=>{const d=document.createElement('div');d.innerHTML=h;return d.textContent};
function recExampleRows(e,R){R.folio='EJ-'+S.today.slice(0,4)+'-'+String(++S.seq).padStart(5,'0');const L=recSteps(e,R),lab=RSC.find(x=>x[0]===R.sc)?.[1]||'';let d=S.today;
  return L.map((s,i)=>{if(i)d=addBiz(d,1);return trzRow(e,dmy(d),RPH.concat(RPH2).find(p=>p[0]===s.ph)[1],RWHO[s.who],RCH[s.ch][0],txtOf(s.t)+'. '+txtOf(s.what),'Ejemplo · '+lab,R.folio)})}
const histRows=(e,origen)=>e.hist.map(h=>trzRow(e,dmy(h.d),'',AREAS[h.a]||h.a||'',h.k==='hmn'?'Humand':'',h.t,origen));
function trzCard(e,real){const V=TRZ.view&&TRZ.view.key===e.ID_ACTIVO?TRZ.view:null,rows=V?.rows||[];
  return `<div class="card"><div class="row" style="flex-wrap:wrap;gap:8px"><h3 style="margin:0">Traza en Google Sheets</h3><span class="sp"></span>
   ${real?'<button class="btn sm p" data-trz="leer">Ver traza de este equipo</button>':'<button class="btn sm p" data-trz="ej">Generar venta de ejemplo en la hoja</button><button class="btn sm" data-trz="dump">Volcar ventas simuladas del demo</button>'}
   ${TRZ.url?`<a class="btn sm" href="${esc(TRZ.url)}" target="_blank" rel="noopener">Abrir la hoja</a>`:''}</div>
   <p class="note">Cada paso queda como una fila en la pestaña <b>Traza</b> del mismo Sheets del inventario: fecha, folio, etapa, responsable, dónde y qué pasó. Datos inventados del demo.${GAS?'':' Fuera de Apps Script solo se muestra la vista previa; publicado en Apps Script se escribe en la hoja.'}</p>
   ${V?`<p class="note" style="margin:6px 0"><b>${esc(V.msg)}</b></p>${rows.length?`<div class="tbl rx-trz"><table><tr><th>Fecha</th><th>Folio</th><th>Etapa</th><th>Responsable</th><th>Dónde</th><th>Evento</th><th>Origen</th></tr>${rows.slice(-200).map(r=>`<tr><td class="mono">${esc(r[0])}</td><td class="mono">${esc(r[1])}</td><td>${esc(r[5])}</td><td>${esc(r[6])}</td><td>${esc(r[7])}</td><td>${esc(r[8])}</td><td class="note">${esc(r[9])}</td></tr>`).join('')}</table></div>${rows.length>200?`<p class="note">Se muestran las últimas 200 de ${rows.length} filas.</p>`:''}`:''}`:''}</div>`}
function trzAct(k){const e=recEx(),R=S.rec;const show=(rows,msg)=>{TRZ.view={key:e.ID_ACTIVO,rows,msg};render()};
  const write=(rows,what)=>{if(!GAS)return show(rows,`${what}: ${rows.length} filas (vista previa).`);show(rows,'Escribiendo en la hoja…');trzSend(rows,r=>show(rows,`${what}: ${r.n} filas escritas en la pestaña Traza.`),m=>show(rows,'No se pudo escribir en la hoja: '+m))};
  if(k==='ej'){const rows=recExampleRows(e,R);save();write(rows,'Venta de ejemplo '+R.folio)}
  else if(k==='dump'){const rows=S.items.filter(x=>x.p&&x.hist.length).flatMap(x=>histRows(x,'Venta simulada del demo'));
    if(GAS&&!confirm(`Se agregarán ${rows.length} filas de ${new Set(rows.map(r=>r[2])).size} ventas simuladas a la pestaña Traza. ¿Continuar?`))return;write(rows,'Ventas simuladas del demo')}
  else if(k==='leer'){if(!GAS)return show(histRows(e,'Bitácora local'),'Bitácora de este navegador (publicado en Apps Script se lee de la hoja).');show([],'Leyendo la hoja…');
    google.script.run.withSuccessHandler(r=>{TRZ.url=r.url||TRZ.url;const rows=(r.rows||[]).map(x=>x.slice(1));show(rows,rows.length?`${rows.length} filas en la hoja para ${e.ID_ACTIVO}.`:'Este equipo todavía no tiene filas en la hoja.')}).withFailureHandler(err=>show([],'No se pudo leer la hoja: '+(err&&err.message||err))).getTraza(e.ID_ACTIVO)}}
after.recorrido=()=>{const R=S.rec;const mv=k=>{R.k=k;save();render()};
  $$('[data-rk]').forEach(b=>b.onclick=()=>mv(+b.dataset.rk));$$('[data-trz]').forEach(b=>b.onclick=()=>trzAct(b.dataset.trz));$$('[data-rmv]').forEach(b=>b.onclick=()=>mv(R.k+ +b.dataset.rmv));
  $$('[data-rsc]').forEach(b=>b.onclick=()=>{R.sc=b.dataset.rsc;mv(0)});$$('[data-rfac]').forEach(b=>b.onclick=()=>{R.fac=b.dataset.rfac==='1';render()});
  $$('[data-rx]').forEach(b=>b.onclick=()=>{if(b.dataset.rx==='ej'){S.rec={sc:'venta',fac:false,k:0,pick:0};render()}else{R.pick=(R.pick||0)+1;mv(0)}})};
document.addEventListener('keydown',ev=>{if(S?.view!=='recorrido'||$('.drawer')||/INPUT|TEXTAREA|SELECT/.test(ev.target.tagName))return;const b=$(`[data-rmv="${ev.key==='ArrowRight'?1:ev.key==='ArrowLeft'?-1:0}"]`);if(b&&!b.disabled){ev.preventDefault();b.click()}});
/* ---------- Perfil de ingeniero: Mis equipos ---------- */
VIEWS.misequipos=()=>{const g=engCur()||engList()[0],cl=g.clinicas,its=S.items.filter(e=>cl.includes(e.CLINICA));
  const n=(l,f)=>l.filter(f).length,al=e=>!e.p&&baseSt(e)==='ALERTA',ve=e=>!e.p&&baseSt(e)==='VENCIDO',dx=e=>e.p==='CONFIRMADO',en=e=>['AGENDA','ENTREGA','DONACION'].includes(e.p);
  const fc=S.meqClin&&cl.includes(S.meqClin)?S.meqClin:'';const rows=its.filter(e=>!fc||e.CLINICA===fc).sort((a,b)=>due(a)<due(b)?-1:1);
  return `<div><h1>Mis equipos</h1><p class="sub"><b>${esc(tCase(g.nombre))}</b> · ve solo ${cl.length===1?'la clínica que tiene':`las ${cl.length} clínicas que tiene`} a cargo, con sus equipos y alertas. Las asigna el administrador en “Ingenieros y clínicas”.</p></div>
  <div class="grid g4">
   <div class="card kpi"><div class="l">Equipos en mis clínicas</div><div class="v">${its.length}</div><div class="s">${cl.length} clínica${cl.length>1?'s':''}</div></div>
   <div class="card kpi"><div class="l">Cumplen 5 años en ≤3 meses</div><div class="v" style="color:var(--warn)">${n(its,al)}</div><div class="s">Programar reemplazo</div></div>
   <div class="card kpi"><div class="l">Ya cumplieron 5 años</div><div class="v" style="color:var(--bad)">${n(its,ve)}</div><div class="s">Sin proceso iniciado</div></div>
   <div class="card kpi"><div class="l">Por diagnosticar · entregas</div><div class="v">${n(its,dx)} · ${n(its,en)}</div><div class="s">Tareas pendientes</div></div></div>
  <div class="eg-cl">${cl.map(c=>{const l=its.filter(e=>e.CLINICA===c);return `<div class="card eg-c"><b>${esc(c)}</b><div class="note">${l.length} equipos</div>
    <div class="row" style="gap:6px;flex-wrap:wrap;margin:8px 0">${n(l,ve)?`<span class="pill p-bad">${n(l,ve)} cumplieron 5 años</span>`:''}${n(l,al)?`<span class="pill p-warn">${n(l,al)} por cumplir</span>`:''}${n(l,dx)?`<span class="pill p-info">${n(l,dx)} por diagnosticar</span>`:''}${n(l,en)?`<span class="pill p-info">${n(l,en)} por entregar</span>`:''}${!n(l,ve)&&!n(l,al)&&!n(l,dx)&&!n(l,en)?'<span class="pill p-ok">Sin pendientes</span>':''}</div>
    <div class="row" style="gap:6px"><button class="btn sm p" data-egt="${esc(c)}">Ver tareas</button><button class="btn sm" data-egf="${esc(c)}">Ver equipos</button></div></div>`}).join('')}</div>
  <div class="card"><div class="row" style="flex-wrap:wrap;gap:8px"><h2 style="margin:0">Equipos${fc?' · '+esc(fc):''}</h2><span class="sp"></span>${fc?'<button class="btn sm" data-egf="">Todas mis clínicas</button>':''}</div>
   <div class="tbl" style="margin-top:10px"><table><tr><th>Equipo</th><th>Clínica</th><th>Instalado</th><th>Cumple 5 años</th><th>Estado</th></tr>
   ${rows.map(e=>`<tr data-eq="${e._i}" style="cursor:pointer"><td><b class="mono">${esc(e.ID_ACTIVO)}</b><div class="note">${esc(eqName(e))}</div></td><td>${esc(e.CLINICA)}<div class="note">${esc(e.SERVICIO)}</div></td><td class="mono">${fd(e.FECHA_ADQUISICION)}</td><td class="mono">${fd(due(e))}</td><td>${pill(stOf(e))}${e.p&&!DESTR.includes(e.p)?'<div>'+steps(e,true)+'</div>':''}</td></tr>`).join('')}</table></div></div>`};
after.misequipos=()=>{$$('[data-egt]').forEach(b=>b.onclick=()=>{S.engClinic=b.dataset.egt;S.dxId=null;go('ingeniero')});$$('[data-egf]').forEach(b=>b.onclick=()=>{S.meqClin=b.dataset.egf;render()})};
/* ---------- Administrador: Ingenieros y clínicas ---------- */
VIEWS.ingenieros=()=>{const L=engList(),all=[...new Set(S.items.map(e=>e.CLINICA))].sort(),cnt={};S.items.forEach(e=>cnt[e.CLINICA]=(cnt[e.CLINICA]||0)+1);
  const asg={};L.forEach(g=>g.clinicas.forEach(c=>(asg[c]??=[]).push(g)));const sin=all.filter(c=>!asg[c]);
  const ed=S.engEdit==='new'?{id:'',nombre:'',correo:'',clinicas:[]}:S.engEdit?L.find(g=>g.id===S.engEdit):null;const sel=new Set(S.engSel||ed?.clinicas||[]);const q=(S.engQ||'').toLowerCase();
  const alr=g=>S.items.filter(e=>g.clinicas.includes(e.CLINICA)&&!e.p&&soon(e)).length;
  return `<div><h1>Ingenieros y clínicas</h1><p class="sub">Da de alta a cada ingeniero de Sistemas y elige las clínicas que puede ver. Al entrar, solo verá los equipos y las alertas de esas clínicas. ${GAS?'Se guarda en la pestaña <b>Ingenieros</b> del mismo Sheets; el ingeniero entra con su correo.':'Al publicarlo en Apps Script se guarda en la pestaña <b>Ingenieros</b> del Sheets y cada ingeniero entra con su correo.'}</p></div>
  <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn p" data-ege="new">+ Dar de alta ingeniero</button><span class="note">${L.length} ingenieros · ${all.length-sin.length} de ${all.length} clínicas asignadas</span></div>
  ${sin.length?`<div class="banner"><div><b>Clínicas sin ingeniero:</b> ${sin.map(esc).join(', ')}. Nadie recibe sus alertas.</div></div>`:''}
  ${ed?`<div class="card eg-ed"><h2>${ed.id?'Editar ingeniero':'Alta de ingeniero'}</h2>
   <div class="grid g2"><label>Nombre<input id="egn" value="${esc(ed.nombre)}" placeholder="Nombre completo"></label><label>Correo<input id="egm" type="email" value="${esc(ed.correo)}" placeholder="nombre.apellido@…"></label></div>
   <div class="row" style="margin:12px 0 6px;gap:8px;flex-wrap:wrap"><b>Clínicas que puede ver</b><span class="note">${sel.size} seleccionada${sel.size===1?'':'s'}</span><span class="sp"></span><input id="egq" placeholder="Buscar clínica" value="${esc(S.engQ||'')}" style="max-width:220px"></div>
   <div class="eg-pick">${all.filter(c=>!q||c.toLowerCase().includes(q)).map(c=>{const o=(asg[c]||[]).filter(g=>g.id!==ed.id);return `<label class="${sel.has(c)?'on':''}"><input type="checkbox" data-egc="${esc(c)}" ${sel.has(c)?'checked':''}><span><b>${esc(c)}</b><span class="note">${cnt[c]} equipos${o.length?' · también '+o.map(g=>esc(tCase(g.nombre).split(' ')[2]||tCase(g.nombre))).join(', '):''}</span></span></label>`}).join('')}</div>
   <div class="row" style="gap:8px;margin-top:12px"><button class="btn p" data-egs>Guardar</button><button class="btn" data-egx>Cancelar</button></div></div>`:''}
  <div class="tbl"><table><tr><th>Ingeniero</th><th>Clínicas a cargo</th><th class="n">Equipos</th><th class="n">Alertas</th><th></th></tr>
  ${L.map(g=>`<tr><td><b>${esc(tCase(g.nombre))}</b><div class="note mono">${esc(g.correo)}</div></td><td><div class="eg-chips">${g.clinicas.map(c=>`<span>${esc(c)}</span>`).join('')}</div></td><td class="n">${sum(g.clinicas,c=>cnt[c]||0)}</td><td class="n">${alr(g)}</td>
   <td><div class="row" style="gap:6px;justify-content:flex-end"><button class="btn sm p" data-egv="${g.id}">Ver como</button><button class="btn sm" data-ege="${g.id}">Editar</button><button class="btn sm" data-egd="${g.id}">Quitar</button></div></td></tr>`).join('')}</table></div>`};
after.ingenieros=()=>{const keep=()=>{S.engN=$('#egn')?.value;S.engM=$('#egm')?.value};
  $$('[data-ege]').forEach(b=>b.onclick=()=>{S.engEdit=b.dataset.ege;S.engSel=null;S.engQ='';render();$('.eg-ed')?.scrollIntoView({behavior:'smooth',block:'start'})});
  $('[data-egx]')&&($('[data-egx]').onclick=()=>{S.engEdit=null;S.engSel=null;render()});
  $$('[data-egc]').forEach(b=>b.onchange=()=>{const ed=S.engEdit==='new'?[]:engList().find(g=>g.id===S.engEdit)?.clinicas||[];const s=new Set(S.engSel||ed);b.checked?s.add(b.dataset.egc):s.delete(b.dataset.egc);S.engSel=[...s];const n=$('#egn').value,m=$('#egm').value;render();$('#egn').value=n;$('#egm').value=m});
  $('#egq')&&($('#egq').oninput=ev=>{const n=$('#egn').value,m=$('#egm').value,p=ev.target.selectionStart;S.engQ=ev.target.value;render();$('#egn').value=n;$('#egm').value=m;const q=$('#egq');q.focus();q.setSelectionRange(p,p)});
  $('[data-egs]')&&($('[data-egs]').onclick=()=>{const L=engList(),nom=$('#egn').value.trim(),mail=$('#egm').value.trim(),cur=S.engEdit==='new'?null:L.find(g=>g.id===S.engEdit),cl=[...new Set(S.engSel||cur?.clinicas||[])].sort();
    if(!nom)return toast('Escribe el nombre del ingeniero');if(!cl.length)return toast('Elige al menos una clínica');
    if(cur){cur.nombre=nom;cur.correo=mail;cur.clinicas=cl}else L.push({id:'ING-'+String(Math.max(0,...L.map(g=>+g.id.slice(4)||0))+1).padStart(3,'0'),nombre:nom,correo:mail||engMail(nom),clinicas:cl});
    S.engEdit=null;S.engSel=null;save();engSave();render();toast('Ingeniero guardado')});
  $$('[data-egd]').forEach(b=>b.onclick=()=>{const L=engList(),i=L.findIndex(g=>g.id===b.dataset.egd);if(i<0||!confirm(`¿Quitar a ${tCase(L[i].nombre)}? Sus clínicas quedarán sin ingeniero.`))return;L.splice(i,1);save();engSave();render()});
  $$('[data-egv]').forEach(b=>b.onclick=()=>setRole('ing',b.dataset.egv))};
function engSave(){if(!GAS)return;google.script.run.withFailureHandler(err=>toast('No se pudo guardar en la hoja: '+(err&&err.message||err))).saveIngenieros(engList().map(g=>[g.id,g.nombre,g.correo,g.clinicas.join(' | ')]))}
function frozenNote(e){if(e.p==='FIRMAS')return `Congelado para ${esc(e.buyer)}. ${e.sale.colSig?`Falta la firma de ${esc(e.sale.jefe)}`:'Falta la firma del colaborador'}; si no se completa antes del ${fd(addD(e.sale.firmDl,1))} se libera.`;
  if(e.p==='PAGO')return `Congelado para ${esc(e.buyer)}. Debe depositar y subir el váucher a más tardar el ${fd(e.pay.dl)}${e.pay.rej?' (Ingresos no encontró el primer depósito)':''}.`;
  if(e.p==='DEPOSITO')return `Congelado para ${esc(e.buyer)} mientras Ingresos valida el váucher.`;return ''}
function openEq(i){const e=S.items[i];const r=curReq(e);const cp=curPrice(e);
 $('#drawer').innerHTML=`<div class="drawer"><div><div class="row"><h2>${esc(e.ID_ACTIVO)}</h2>${pill(stOf(e))}<span class="sp"></span><button class="btn sm" data-rec="${e._i}">Ver recorrido</button><button class="btn sm p" data-exp="${e._i}">Expediente</button><button class="btn sm" data-close>Cerrar</button></div>
 <div class="note">${esc(eqName(e))}${e.PROCESADOR?' · '+esc(e.PROCESADOR)+' · '+e.RAM_GB+' GB · '+esc(e.ALMACENAMIENTO):''}<br>${esc(e.CLINICA)} (${esc(e.MUNICIPIO)}, ${esc(e.ESTADO)}) · ${esc(e.SERVICIO)} ${esc(e.UBICACION)} · serie ${esc(e.NUM_SERIE)}<br>Adquirido ${fd(e.FECHA_ADQUISICION)} · fin de vida útil ${fd(due(e))} · responsable ${esc(e.INGENIERO)}${e.as?`<br>AppSheet: ${aspill(e.as['ESTATUS'])} → ${aspill(asStatus(e))} · área ${esc(e.as['AREA'])} ubic. ${esc(e.as['UBICACIÓN'])} · zona ${esc(e.as['ZONA'])}${e.as['# DE SERIE NUEVO EQUIPO']?' · equipo nuevo '+esc(e.as['# DE SERIE NUEVO EQUIPO']):''}${e.as['# DE TICKET']?' · ticket '+esc(e.as['# DE TICKET']):''}${e.as['PERTENECE A:']?' · '+esc(e.as['PERTENECE A:']):''}${e.as['MODIFICADO EL:']?' · modificado '+esc(e.as['MODIFICADO EL:']):''}`:''}</div>
 ${e.p&&!DESTR.includes(e.p)?`<div class="card">${steps(e)}${r?`<p class="note" style="margin:8px 0 0">Solicitud <b class="mono">${r.id}</b> (${RT[r.type].n}) con <b>${r.type==='FIRMA_JEFE'?esc(e.sale.jefe):r.type==='FIRMA_COL'?esc(e.buyer):AREAS[RT[r.type].a]}</b> desde ${fd(r.created)} · ${RT[r.type].ch==='correo'?'aviso por correo':RT[r.type].ch==='firma'?'firma en Humand':'aviso por bot de Humand'} · ${r.rem} recordatorio(s)${r.esc?' · escalada':''}</p>`:''}${FROZEN.includes(e.p)?`<p class="note">${frozenNote(e)}</p>`:''}${e.p==='ENTREGA'?`<p class="note">Cita: ${fd(e.cita.d)} ${esc(e.cita.h)} en ${esc(e.CLINICA)}.</p>`:''}${e.sale?`<p class="note">Folio <b class="mono">${e.sale.folio}</b> · carpeta en Drive con ${e.sale.files.length} documento(s) · ${esc(fiscalTxt(e.sale.fiscal))}</p>`:''}</div>`:''}
 <div class="card grid g4"><div class="kpi"><div class="l">Valor estimado</div><div class="v" style="font-size:18px">${money(estValue(e))}</div></div>${e.price?`<div class="kpi"><div class="l">Autorizado AF</div><div class="v" style="font-size:18px">${money(e.price.aut)}</div></div>`:''}${cp&&['PUBLICADO','SUBASTA'].includes(e.p)?`<div class="kpi"><div class="l">${cp.auction?'Mejor oferta':'Precio hoy'}</div><div class="v" style="font-size:18px">${money(cp.v)}</div><div class="s">${cp.l}</div></div>`:''}${e.buyer?`<div class="kpi"><div class="l">Comprador</div><div style="font-weight:600">${esc(e.buyer)}</div></div>`:''}</div>
 <div class="card"><h3>Bitácora</h3><ul class="tl" style="margin-top:10px">${e.hist.slice().reverse().map(h=>`<li class="${h.k}"><span class="mono note">${fd(h.d)}</span><span class="dot"></span><span>${esc(h.t)}<div class="note">${AREAS[h.a]||''}</div></span></li>`).join('')||'<li><span></span><span></span><span class="note">Sin movimientos.</span></li>'}</ul></div></div></div>`;bindClose();$('[data-exp]').onclick=()=>openExp(e._i);$('[data-rec]').onclick=()=>{S.rec={eq:e._i,k:null};closeDrawer();go('recorrido')}}
/* ================= COMPRA ================= */
const REGS=['605 Sueldos y salarios','612 Personas físicas con actividad empresarial','626 Régimen simplificado de confianza','616 Sin obligaciones fiscales','601 General de ley personas morales'];
const USOS=['G03 Gastos en general','S01 Sin efectos fiscales','I04 Equipo de cómputo y accesorios'];
function formatoDoc(e,amount){const s=e.sale||{};const buyer=e.sale?e.buyer:MEB_();const emp=s.emp||ME.emp,jefe=s.jefe||ME.jefe;
  const kv=rows=>`<table>${rows.map(([k,v])=>`<tr><th style="width:42%">${k}</th><td>${v}</td></tr>`).join('')}</table>`;
  return `<div class="carta"><div class="row"><b>FORMATO SGC-N4-60 · Solicitud de compra de activo usado</b><span class="sp"></span><span class="note mono">${esc(s.folio||'folio al confirmar')}</span></div>
   <h3 style="margin-top:12px;text-align:left">Colaborador (perfil de Humand)</h3>${kv([['Nombre',esc(buyer.split(' · ')[0])],['No. de empleado',esc(emp)],['Puesto',esc(s.puesto||ME.puesto)],['Área',esc(s.area||ME.area)],['Jefe inmediato',esc(jefe)]])}
   <h3 style="margin-top:12px;text-align:left">Equipo</h3>${kv([['Marca',esc(e.MARCA)],['Modelo',esc(e.MODELO)],['No. de serie',esc(e.NUM_SERIE)],['Código de barras / activo',esc(e.ID_ACTIVO)],['Clínica de entrega',esc(e.CLINICA)],['Precio',money(amount??e.pay?.amount??e.price?.aut)]])}
   <div class="firma"><div><div class="sig">${s.colSig?'Firmado '+fd(s.colSig):''}</div>Colaborador</div><div><div class="sig">${s.jefeSig?'Firmado '+fd(s.jefeSig):''}</div>Jefe inmediato</div></div></div>`}
VIEWS.compra=()=>{
  const e=S.buyId!=null?S.items[S.buyId]:null;const me=MEB_();const mine=S.items.filter(x=>x.buyer===me||(x.p==='SUBASTA'&&x.auc.bids.some(b=>b.who===me)));
  let top='';const avail=e&&['PUBLICADO','SUBASTA'].includes(e.p);
  if(avail&&!canBuy(e).ok)top=`<div class="banner"><div><b>No puedes comprar este equipo.</b> ${esc(canBuy(e).msg)}.</div></div>`;
  else if(avail){const cp=curPrice(e);const auc=e.p==='SUBASTA';const minBid=auc?r50(Math.max(e.auc.min,cp.v+(e.auc.bids.length?50:0))):0;const f=S.fisDraft||(S.fisDraft={tipo:'publico',modo:'datos'});
   top=`<div class="card" style="border-color:var(--hm)"><p class="note" style="margin:0 0 8px"><b style="color:var(--hm)">Formulario “Compra de equipo”</b> · lo llena <b>${ME.name}</b> · No. empleado ${ME.emp} · datos del perfil de Humand</p>
   <div class="grid g2"><div><h2>${esc(eqName(e))}</h2><p class="note">${e.PROCESADOR?esc(e.PROCESADOR)+' · '+e.RAM_GB+' GB RAM · '+(e.dx?.disco==='retirado'?'sin disco':esc(e.ALMACENAMIENTO))+' · ':''}${tipo(e)==='Escritorio'?(e.dx?.monitor==='no'?'sin monitor':esc(e.MONITOR))+' · ':''}estética ${e.dx?.estetica||'A'}<br>Activo ${esc(e.ID_ACTIVO)} · se entrega en <b>${esc(e.CLINICA)}</b>, ${esc(e.MUNICIPIO)}</p>
    <div style="font:700 30px var(--f-num)">${auc?`<input type="number" id="bid" min="${minBid}" step="50" value="${minBid}" style="width:140px"> <span class="note">tu oferta</span>`:money(cp.v)}</div><div class="note">${auc?`Subasta · ${cp.bids} oferta(s) · mejor ${money(cp.v)} · mínimo ${money(minBid)} · cierra ${fd(e.auc.end)}`:cp.l+' · publicado hace '+cp.d+' días'}</div>
    <details style="margin-top:12px"><summary>Ver formato SGC-N4-60 prellenado</summary>${formatoDoc(e,auc?minBid:cp.v)}</details></div>
    <form id="buyf" class="fld" style="gap:10px"><span class="lb">¿Necesitas factura?</span>
     <div class="seg"><label><input type="radio" name="tf" value="publico" ${f.tipo==='publico'?'checked':''}>No, público en general</label><label><input type="radio" name="tf" value="factura" ${f.tipo==='factura'?'checked':''}>Sí, a mi nombre</label></div>
     ${f.tipo==='factura'?`<div class="seg"><label><input type="radio" name="fm" value="datos" ${f.modo==='datos'?'checked':''}>Capturar datos</label><label><input type="radio" name="fm" value="csf" ${f.modo==='csf'?'checked':''}>Subir constancia (CSF)</label></div>
      ${f.modo==='csf'?`<label class="btn sm" style="align-self:flex-start">${f.csf?esc(f.csf):'Elegir constancia de situación fiscal'}<input type="file" id="csf" hidden accept=".pdf,image/*"></label>`:`<div class="form">
       <div class="fld"><label for="frfc">RFC</label><input type="text" id="frfc" maxlength="13" value="${esc(f.rfc||'')}" style="text-transform:uppercase"></div>
       <div class="fld"><label for="fnom">Nombre o razón social</label><input type="text" id="fnom" value="${esc(f.nombre||ME.name)}"></div>
       <div class="fld"><label for="freg">Régimen fiscal</label><select id="freg">${REGS.map(x=>`<option ${f.regimen===x?'selected':''}>${x}</option>`).join('')}</select></div>
       <div class="fld"><label for="fcp">Código postal</label><input type="text" id="fcp" maxlength="5" value="${esc(f.cp||'')}"></div>
       <div class="fld"><label for="fuso">Uso de CFDI</label><select id="fuso">${USOS.map(x=>`<option ${f.uso===x?'selected':''}>${x}</option>`).join('')}</select></div></div>`}`:''}
     <div class="note">${auc?`Si tu oferta es la más alta al cierre, el equipo se congela a tu nombre y sigue el mismo proceso de compra.`:`Al confirmar, el equipo se <b>congela a tu nombre</b> y se crea la carpeta de tu compra. Primero firmas tú el formato en Humand y después tu jefe inmediato (${C().plazo.firmas} día hábil). Luego recibes los datos bancarios y tienes ${C().plazo.pago} días hábiles para depositar y subir tu váucher.`}</div>
     <label class="chk"><input type="checkbox" id="acc"> Acepto que es equipo usado, sin garantía, con información borrada de forma segura, y que lo recojo en la clínica indicada (no hay envíos).</label>
     <button type="submit" class="btn h" id="buyok" disabled>${auc?'Enviar oferta':'Confirmar compra'}</button></form></div></div>`}
  else if(e&&e.buyer!==me&&!avail) top=`<div class="banner"><div><b>Este equipo ya no está disponible.</b> Elige otro en el Bazar.</div></div>`;
  const b=C().banco;
  return `<div><h1>Gestión de Servicios · Compra de equipo</h1><p class="sub">El colaborador inicia la compra en un formulario de Gestión de Servicios de Humand, así la solicitud la crea la persona, como pide Humand por seguridad. Activo 360 lee el formulario con la API y se encarga del resto del proceso.</p></div>
  ${hmFrame(`${top||`<div class="card row"><span>Elige un equipo en el Bazar de Humand para iniciar una compra.</span><span class="sp"></span><button class="btn h" data-go="hbazar">Ir al Bazar</button></div>`}
  <div class="card"><h2>Mis compras</h2>${mine.length?mine.map(x=>{const r=curReq(x);return `<div style="border-top:1px solid var(--line);padding-top:12px;margin-top:12px"><div class="row">${eqLine(x)}<span class="sp"></span>${x.sale?`<span class="mono note">${x.sale.folio}</span>`:''}${pill(x.p)}</div>${x.p==='SUBASTA'?'':steps(x)}
   ${x.p==='SUBASTA'?`<p class="note">Tu oferta: <b>${money(Math.max(...x.auc.bids.filter(b=>b.who===me).map(b=>b.amount)))}</b> · mejor oferta ${money(curPrice(x).v)} · cierra el ${fd(x.auc.end)}.</p>`:''}
   ${x.p==='FIRMAS'?(x.sale.colSig?`<p class="note">Ya firmaste. Esperando la firma de <b>${esc(x.sale.jefe)}</b> en Humand (a más tardar ${fd(x.sale.firmDl)}).</p>`:`<div class="banner" style="margin-top:8px"><div style="flex:1 1 260px"><b>Firma tu formato SGC-N4-60 en Humand</b> a más tardar el ${fd(x.sale.firmDl)} o el equipo regresa al Bazar.</div><button class="btn sm h" data-go="hfirma">Ir a Documentos en Humand</button></div>`):''}
   ${x.p==='PAGO'?`<div class="banner" style="margin-top:8px"><div style="flex:1 1 260px">${x.pay.rej?'<b style="color:var(--bad)">Ingresos no encontró tu depósito.</b> Revisa el váucher y vuelve a subirlo.<br>':''}<b>Deposita ${money(x.pay.amount)}</b> · banco ${esc(b.banco)} · titular ${esc(b.titular)} · CLABE <span class="mono">${esc(b.clabe)}</span> · concepto <span class="mono">${esc(x.sale.folio)}</span><br><span class="note">Sube tu váucher a más tardar el ${fd(x.pay.dl)}; si no, el equipo regresa al Bazar.</span></div><label class="btn sm h">Adjuntar váucher en Humand<input type="file" data-up="${x._i}" hidden accept="image/*,.pdf"></label></div>`:''}
   ${r&&!['FIRMAS','PAGO'].includes(x.p)?`<p class="note">Ahora está en <b>${AREAS[RT[r.type].a]}</b> (${RT[r.type].n}) desde ${fd(r.created)}${r.rem?` · ${r.rem} recordatorio(s) enviados`:''}.</p>`:''}
   ${x.p==='ENTREGA'?`<p class="note"><b>Tu equipo está listo.</b> Cita: ${fd(x.cita.d)} a las ${esc(x.cita.h)} en ${esc(x.CLINICA)}. Lleva tu gafete. Factura ${esc(x.fac||'')}.</p>`:''}
   ${x.p==='ENTREGADO'&&!x.survey?`<form class="card" data-sv="${x._i}" style="margin-top:8px;background:var(--surface2)"><b>¿Cómo fue tu experiencia?</b><div class="form" style="margin-top:8px">${['Proceso de compra','Tiempo de entrega','Estado del equipo'].map((l,k)=>`<div class="fld"><span class="lb">${l}</span><div class="seg">${[1,2,3,4,5].map(n=>`<label><input type="radio" name="q${k}" value="${n}" ${n===5?'checked':''}>${n}</label>`).join('')}</div></div>`).join('')}<div class="fld"><label for="svc${x._i}">Comentario</label><input type="text" id="svc${x._i}" name="c" placeholder="Opcional"></div></div><button class="btn p" style="margin-top:8px">Enviar encuesta</button></form>`:''}
   ${x.survey?`<p class="note">Tu calificación: ${(sum(x.survey.q)/3).toFixed(1)} / 5. ¡Gracias!</p>`:''}</div>`}).join(''):'<p class="note">Aún no tienes compras.</p>'}</div>`,'Vista: colaborador')}`;
};
after.compra=()=>{
  $$('[data-sv]').forEach(f=>f.onsubmit=ev=>{ev.preventDefault();const x=S.items[+f.dataset.sv];x.survey={d:S.today,q:[0,1,2].map(k=>+f['q'+k].value),c:f.c.value.trim()};log('GET','/forms/{id}/answers','pub',{formulario:'Encuesta Activo 360',employeeInternalId:ME.emp,asset:x.ID_ACTIVO,scores:x.survey.q},'Activo 360 lee la respuesta de la encuesta hecha con Formularios de Humand.');save();render();toast('Gracias por tu respuesta')});
  $$('[data-up]').forEach(inp=>inp.onchange=()=>{const x=S.items[+inp.dataset.up];if(!inp.files[0])return;uploadVoucher(x,inp.files[0].name);save();render();toast('Váucher enviado · Ingresos recibió la solicitud en Humand')});
  const f=$('#buyf');if(!f)return;const D=S.fisDraft;
  const keep=()=>{if(D.tipo==='factura'&&D.modo==='datos'&&$('#frfc')){D.rfc=$('#frfc').value.trim().toUpperCase();D.nombre=$('#fnom').value.trim();D.regimen=$('#freg').value;D.cp=$('#fcp').value.trim();D.uso=$('#fuso').value}};
  $$('input[name=tf],input[name=fm]').forEach(i=>i.onchange=()=>{keep();if(i.name==='tf')D.tipo=i.value;else D.modo=i.value;render()});
  $('#csf')&&($('#csf').onchange=ev=>{if(ev.target.files[0]){D.csf=ev.target.files[0].name;render()}});
  $('#acc').onchange=()=>$('#buyok').disabled=!$('#acc').checked;
  f.onsubmit=ev=>{ev.preventDefault();keep();const e=S.items[S.buyId];
    let fiscal={tipo:'publico'};
    if(D.tipo==='factura'){if(D.modo==='csf'){if(!D.csf){toast('Sube tu constancia de situación fiscal');return}fiscal={tipo:'factura',csf:D.csf}}
      else{if(!/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/.test(D.rfc||'')){toast('Revisa el RFC (12 o 13 caracteres)');return}if(!/^\d{5}$/.test(D.cp||'')){toast('El código postal debe tener 5 dígitos');return}if(!D.nombre){toast('Escribe el nombre o razón social');return}
        fiscal={tipo:'factura',rfc:D.rfc,nombre:D.nombre,regimen:D.regimen||REGS[0],cp:D.cp,uso:D.uso||USOS[0]}}}
    const info={emp:ME.emp,puesto:ME.puesto,area:ME.area,jefe:ME.jefe};
    if(e.p==='SUBASTA'){const v=+($('#bid').value||0),mn=+$('#bid').min;if(!(v>=mn)){toast(`La oferta mínima es ${money(mn)}`);return}e.auc.bids.push({who:MEB_(),amount:v,d:S.today,fiscal,info});H(e,`Oferta de ${MEB_()} por ${money(v)}`,'COL');
      log('PUT','/products/'+e.ID_ACTIVO,'pub',{status:'SUBASTA',mejorOferta:v},'Actualiza la mejor oferta en el Bazar.');S.fisDraft=null;save();render();toast('Oferta registrada');return}
    startSale(e,MEB_(),curPrice(e).v,fiscal,info);S.fisDraft=null;save();render();toast('Equipo congelado · firma tu formato en Humand')};
};
/* ================= FACTURACIÓN ================= */
VIEWS.facturacion=()=>{
  const pend=S.reqs.filter(r=>r.type==='FACTURA'&&r.state==='Pendiente'),done=S.items.filter(e=>e.fac&&e.sale).sort((a,b)=>(b.sale.files.find(f=>f.name===b.fac)?.d||'')>(a.sale.files.find(f=>f.name===a.fac)?.d||'')?1:-1).slice(0,25);
  return `<div><h1>Facturación</h1><p class="sub">Cada venta confirmada por Ingresos llega por correo a <span class="mono">${MAIL_FAC}</span> con los datos del equipo y a quién se factura. Aquí se adjunta el CFDI; al hacerlo, el comprador recibe aviso en Humand y Sistemas recibe el correo para agendar la entrega.</p></div>
  <div class="card"><h2>Por facturar <span class="cnt">${pend.length}</span></h2><div class="tbl" style="margin-top:10px"><table><tr><th>Venta</th><th>Equipo</th><th>Facturar a</th><th class="n">Monto</th><th class="n">Días</th><th>CFDI</th></tr>
   ${pend.map(r=>{const e=S.items[r.eq],f=e.sale.fiscal||{};return `<tr><td class="mono">${e.sale.folio}<div class="note">${r.id}</div></td><td>${eqLine(e)}<div class="note">Serie ${esc(e.NUM_SERIE)}</div></td><td>${f.tipo==='factura'?(f.csf?`<b>${esc(e.buyer.split(' · ')[0])}</b><div class="note">Constancia adjunta: ${esc(f.csf)}</div>`:`<b>${esc(f.nombre)}</b><div class="note mono">${esc(f.rfc)} · CP ${esc(f.cp)}</div><div class="note">${esc(f.regimen)} · ${esc(f.uso)}</div>`):'<b>Público en general</b><div class="note">'+esc(e.buyer)+'</div>'}</td><td class="n">${money(e.pay.amount)}</td><td class="n">${reqDays(r)}<div style="margin-top:4px">${slaPill(r)}</div></td><td><label class="btn sm p">Adjuntar CFDI<input type="file" data-cfdi="${r.id}" hidden accept=".pdf,.xml"></label></td></tr>`}).join('')||'<tr><td colspan="6" class="note">Nada por facturar.</td></tr>'}</table></div></div>
  <div class="card"><h2>Facturadas recientemente</h2><div class="tbl" style="margin-top:10px"><table><tr><th>Venta</th><th>Equipo</th><th>Comprador</th><th>CFDI</th><th>Estatus</th></tr>${done.map(e=>`<tr data-eq="${e._i}" style="cursor:pointer"><td class="mono">${e.sale.folio}</td><td>${eqLine(e)}</td><td>${esc(e.buyer)}</td><td class="mono note">${esc(e.fac)}</td><td>${pill(e.p)}</td></tr>`).join('')}</table></div></div>`};
after.facturacion=()=>$$('[data-cfdi]').forEach(inp=>inp.onchange=()=>{if(!inp.files[0])return;attachCFDI(inp.dataset.cfdi,inp.files[0].name);save();render();toast('CFDI adjunto · aviso al comprador y correo a Sistemas')});
function attachCFDI(id,file){const r=S.reqs.find(x=>x.id===id);const e=S.items[r.eq];closeReq(r);e.fac=file;addFile(e,file);H(e,`Facturación adjuntó el CFDI (${file})`,'FAC');
  notify(e.buyer,`Tu factura de ${e.sale.folio} está lista. Sistemas te avisará la fecha de entrega.`,'info');e.p='AGENDA';newReq('AGENDA',e)}

/* ================= DESTRUCCIÓN ================= */
VIEWS.destruccion=()=>{
  const l=S.items.filter(e=>DESTR.includes(e.p));const g={};l.forEach(e=>(g[e.MUNICIPIO]??=[]).push(e));
  return `<div><h1>Destrucción certificada</h1><p class="sub">Equipos sin valor de venta, agrupados por ciudad para una sola recolección con proveedor local autorizado. El certificado queda en el expediente del activo.</p></div>
  ${Object.keys(g).length?Object.entries(g).map(([c,es])=>{const pend=es.filter(e=>e.p==='DESTRUCCION'),rec=es.filter(e=>e.p==='RECOLECCION'),id=c.replace(/\W/g,'');return `<div class="card"><div class="row"><h2>${esc(c)}</h2><span class="note">${es.length} equipos</span><span class="sp"></span>
   ${pend.length?`<button class="btn" data-rec="${esc(c)}">Solicitar recolección (${pend.length})</button>`:''}${rec.length?`<input type="text" id="cert-${id}" placeholder="Folio del certificado" value="CERT-${S.today.replace(/-/g,'')}"> <button class="btn p" data-cert="${esc(c)}">Registrar certificado (${rec.length})</button>`:''}</div>
   <div class="tbl" style="margin-top:10px"><table>${es.map(e=>`<tr><td>${eqLine(e)}</td><td>${esc(e.hist[e.hist.length-1]?.t||'')}</td><td>${e.dx?.enciende==='si'?'<span class="pill p-bad">Funcional</span>':''}</td><td>${pill(e.p)}</td></tr>`).join('')}</table></div></div>`}).join(''):'<div class="card note">No hay equipos enviados a destrucción.</div>'}`;
};
after.destruccion=()=>{
  $$('[data-rec]').forEach(b=>b.onclick=()=>{S.items.filter(e=>e.MUNICIPIO===b.dataset.rec&&e.p==='DESTRUCCION').forEach(e=>{e.p='RECOLECCION';H(e,`Recolección programada con proveedor autorizado local (${fd(addD(S.today,2))})`,'SIS')});save();render();toast('Recolección solicitada')});
  $$('[data-cert]').forEach(b=>b.onclick=()=>{const c=b.dataset.cert,f=$('#cert-'+c.replace(/\W/g,'')).value||'CERT';S.items.filter(e=>e.MUNICIPIO===c&&e.p==='RECOLECCION').forEach(e=>{e.p='DESTRUIDO';e.destD=S.today;H(e,`Destruido · certificado ${f} integrado al expediente`,'AF')});save();render();toast('Certificado registrado')});
};

/* ================= DONACIÓN ================= */
function startDon(e,org,fecha){const r=S.reqs.find(x=>x.eq===e._i&&x.type==='DECISION'&&x.state==='Pendiente');if(r){closeReq(r,'Donar');r.res=fd(S.today)}
  if(e.p==='PUBLICADO'||e.p==='SUBASTA')log('DELETE','/products/'+e.ID_ACTIVO,'pub',null,'Retira el equipo del Bazar.');
  e.don={org,fecha};e.p='DONACION';H(e,`Activo Fijo decidió donarlo a ${org} · entrega el ${fd(fecha)}`,'AF','hmn');
  mail(e.CORREO_INGENIERO||e.INGENIERO,`[Activo 360] Donación por entregar · ${e.ID_ACTIVO}`,`Activo Fijo decidió donar el equipo ${eqName(e)} (activo ${e.ID_ACTIVO}) a ${org}. Entrégalo el ${fd(fecha)} y regístralo aquí: https://activo360.salud-digna.interno/donaciones/${e.ID_ACTIVO}`,e)}
function deliverDon(e){e.don.d=S.today;e.p='DONADO_FACT';H(e,`Entregado a ${e.don.org} · sale del stock`,'SIS');log('PATCH','/inventario/'+e.ID_ACTIVO,'int',{estatus:'DONADO',baja:true},'Baja del activo en el inventario.');newReq('DONFACT',e,{dl:addD(S.today,C().plazo.donFact)})}
function attachDonFact(e,file){closeReq(S.reqs.find(x=>x.eq===e._i&&x.type==='DONFACT'&&x.state==='Pendiente'),'Adjuntada');e.don.factura=file;e.p='DONADO';H(e,`Se adjuntó la factura de la donataria (${file})`,'AF');
  log('POST','https://www.googleapis.com/upload/drive/v3/files','g',{carpeta:'Activo 360 / Donaciones / '+e.ID_ACTIVO,archivo:file},'Guarda la factura de la donataria en Drive.');newReq('REVFIS',e)}
VIEWS.donacion=()=>{
  const cand=S.items.filter(e=>(['PUBLICADO','SUBASTA'].includes(e.p)&&diff(e.pub,S.today)>=C().plazo.sinVenta)||(e.p==='DESTRUCCION'&&e.dx?.enciende==='si'));
  const ent=S.items.filter(e=>e.p==='DONACION'),fac=S.items.filter(e=>e.p==='DONADO_FACT'),done=S.items.filter(e=>e.p==='DONADO');
  const opts=C().donatarias.map(d=>`<option>${esc(d)}</option>`).join('');const d2=addBiz(S.today,2);
  return `<div><h1>Donación</h1><p class="sub">Activo Fijo elige la donataria y la fecha; Sistemas entrega y el equipo sale del stock. Después hay ${C().plazo.donFact} días naturales para adjuntar la factura de la donataria, que se envía por correo a Fiscal para su revisión.</p></div>
  <div class="grid g4"><div class="card kpi"><div class="l">Candidatos</div><div class="v">${cand.length}</div><div class="s">funcionales sin venta</div></div><div class="card kpi"><div class="l">Por entregar</div><div class="v">${ent.length}</div></div><div class="card kpi"><div class="l">Falta factura</div><div class="v" style="color:var(--warn)">${fac.length}</div></div><div class="card kpi"><div class="l">Donados</div><div class="v" style="color:var(--ok)">${done.length}</div><div class="s">${money(sum(done,estValue))} valor estimado · ${Math.round(sum(done,kgOf))} kg reutilizados</div></div></div>
  <div class="card"><h2>Candidatos a donación</h2><p class="note">Equipos sin venta en ${C().plazo.sinVenta} días o funcionales que iban a destrucción. También se puede decidir desde la solicitud “Equipo sin venta” en Humand.</p><div class="tbl" style="margin-top:8px"><table>${cand.map(e=>`<tr><td>${eqLine(e)}</td><td>${pill(e.p)}</td><td class="n">${money(estValue(e))}</td><td><div class="row" style="gap:4px"><select id="dorg-${e._i}">${opts}</select><input type="date" id="dfe-${e._i}" value="${d2}" min="${S.today}"><button class="btn sm p" data-prop="${e._i}">Donar</button></div></td></tr>`).join('')||'<tr><td class="note">Sin candidatos por ahora.</td></tr>'}</table></div></div>
  <div class="grid g2"><div class="card"><h2>Por entregar (Sistemas)</h2><div class="tbl" style="margin-top:8px"><table>${ent.map(e=>`<tr><td>${eqLine(e)}</td><td>${esc(e.don.org)}<div class="note">${fd(e.don.fecha)}</div></td></tr>`).join('')||'<tr><td class="note">Nada por entregar.</td></tr>'}</table></div></div>
  <div class="card"><h2>Falta factura de la donataria</h2><div class="tbl" style="margin-top:8px"><table>${fac.map(e=>{const r=S.reqs.find(x=>x.eq===e._i&&x.type==='DONFACT'&&x.state==='Pendiente');const left=r?.dl?diff(S.today,r.dl):0;return `<tr><td>${eqLine(e)}<div class="note">${esc(e.don.org)} · entregado ${fd(e.don.d)}</div></td><td>${left>=0?`<span class="pill ${left<=3?'p-warn':'p-info'}">${left} d restantes</span>`:`<span class="pill p-bad">${-left} d vencida</span>`}</td><td><label class="btn sm p">Adjuntar factura<input type="file" data-dfac="${e._i}" hidden accept=".pdf,.xml"></label></td></tr>`}).join('')||'<tr><td class="note">Sin facturas pendientes.</td></tr>'}</table></div></div></div>
  <div class="card"><h2>Donados</h2><div class="tbl" style="margin-top:8px"><table><tr><th>Equipo</th><th>Donataria</th><th>Entregado</th><th>Factura</th><th>Revisión fiscal</th></tr>${done.map(e=>`<tr data-eq="${e._i}" style="cursor:pointer"><td>${eqLine(e)}</td><td>${esc(e.don.org)}</td><td>${fd(e.don.d)}</td><td class="mono note">${esc(e.don.factura||'')}</td><td>${e.don.fiscal?`<span class="pill ${/sin obs/i.test(e.don.fiscal)?'p-ok':'p-warn'}">${esc(e.don.fiscal)}</span>`:'<span class="pill p-info">En revisión</span>'}</td></tr>`).join('')||'<tr><td class="note">Aún no hay donaciones.</td></tr>'}</table></div></div>`};
after.donacion=()=>{
  $$('[data-prop]').forEach(b=>b.onclick=()=>{const e=S.items[+b.dataset.prop],f=$('#dfe-'+e._i).value;if(!f||f<S.today){toast('Elige una fecha a partir de hoy');return}startDon(e,$('#dorg-'+e._i).value,f);save();render();toast('Donación registrada · Sistemas recibió el correo para entregar')});
  $$('[data-dfac]').forEach(inp=>inp.onchange=()=>{if(!inp.files[0])return;attachDonFact(S.items[+inp.dataset.dfac],inp.files[0].name);save();render();toast('Factura adjunta · Fiscal recibió el correo para revisión')});
};
/* ================= FISCAL ================= */
VIEWS.fiscal=()=>{const pend=S.reqs.filter(r=>r.type==='REVFIS'&&r.state==='Pendiente'),done=S.items.filter(e=>e.don?.fiscal);
  return `<div><h1>Fiscal</h1><p class="sub">Fiscal (Jurídico) recibe un correo cada vez que se adjunta la factura de una donataria. La revisión no detiene la donación; si hay observaciones, quedan en el expediente para que Activo Fijo las atienda.</p></div>
  <div class="card"><h2>Por revisar <span class="cnt">${pend.length}</span></h2><div class="tbl" style="margin-top:10px"><table><tr><th>Equipo</th><th>Donataria</th><th>Factura</th><th class="n">Días</th><th>Resultado</th></tr>
   ${pend.map(r=>{const e=S.items[r.eq];return `<tr><td>${eqLine(e)}<div class="note">Valor estimado ${money(estValue(e))}</div></td><td>${esc(e.don.org)}<div class="note">entregado ${fd(e.don.d)}</div></td><td class="mono note">${esc(e.don.factura)}</td><td class="n">${reqDays(r)}<div style="margin-top:4px">${slaPill(r)}</div></td><td><div class="row" style="gap:4px"><button class="btn sm p" data-fok="${r.id}">Sin observaciones</button><input type="text" id="fo-${r.id}" placeholder="Observación" style="width:160px"><button class="btn sm o" data-fobs="${r.id}">Con observaciones</button></div></td></tr>`}).join('')||'<tr><td colspan="5" class="note">Nada por revisar.</td></tr>'}</table></div></div>
  <div class="card"><h2>Revisadas</h2><div class="tbl" style="margin-top:10px"><table>${done.map(e=>`<tr data-eq="${e._i}" style="cursor:pointer"><td>${eqLine(e)}</td><td>${esc(e.don.org)}</td><td>${esc(e.don.fiscal)}</td></tr>`).join('')||'<tr><td class="note">Sin revisiones.</td></tr>'}</table></div></div>`};
after.fiscal=()=>{const res=(id,txt)=>{const r=S.reqs.find(x=>x.id===id),e=S.items[r.eq];closeReq(r,'Revisada');e.don.fiscal=txt;H(e,`Fiscal revisó la factura de la donación: ${txt}`,'FIS');if(!/sin obs/i.test(txt))notify('Activo Fijo',`Fiscal dejó observaciones en la donación de ${e.ID_ACTIVO}: ${txt}`,'req');save();render();toast('Revisión registrada')};
  $$('[data-fok]').forEach(b=>b.onclick=()=>res(b.dataset.fok,'Sin observaciones'));
  $$('[data-fobs]').forEach(b=>b.onclick=()=>{const t=$('#fo-'+b.dataset.fobs).value.trim();if(!t){toast('Escribe la observación');return}res(b.dataset.fobs,'Con observaciones: '+t)})};
/* ================= CORREOS ================= */
VIEWS.correos=()=>{const tabs=[['','Todos'],[MAIL_FAC,'Facturación'],['SIS','Sistemas'],['Fiscal (Jurídico)','Fiscal']];
  const l=S.mails.filter(m=>!S.mailTab||(S.mailTab==='SIS'?m.to!==MAIL_FAC&&m.to!=='Fiscal (Jurídico)':m.to===S.mailTab)).slice(0,120);
  return `<div><h1>Correos enviados</h1><p class="sub">Avisos que Activo 360 manda por Gmail a Sistemas, Facturación y Fiscal. Estas áreas no necesitan revisar la herramienta todo el día: entran solo cuando el correo les dice que tienen algo pendiente. Colaboradores, jefes, Activo Fijo e Ingresos reciben sus avisos en Humand.</p></div>
  <div class="row">${tabs.map(([k,t])=>`<button class="btn sm ${(S.mailTab||'')===k?'p':''}" data-mt="${esc(k)}">${t}</button>`).join('')}</div>
  <div class="log">${l.map(m=>`<div class="logi"><div class="row"><span class="pill ${/Recordatorio/.test(m.subj)?'p-warn':'p-info'}">${/Recordatorio/.test(m.subj)?'Recordatorio':'Aviso'}</span><b style="min-width:0">${esc(m.subj)}</b><span class="sp"></span><span class="mono note">${fd(m.d)}</span></div><div class="note" style="margin-top:4px">Para: ${esc(m.to)}</div>${m.body?`<pre style="white-space:pre-wrap">${esc(m.body)}</pre>`:''}</div>`).join('')||'<p class="note">Sin correos.</p>'}</div>`};
after.correos=()=>$$('[data-mt]').forEach(b=>b.onclick=()=>{S.mailTab=b.dataset.mt;render()});

/* ================= TABULADOR Y REGLAS ================= */
VIEWS.config=()=>{const K=C();const n=(id,v,step,suf)=>`<input type="number" id="${id}" data-cfg="${id}" value="${v}" step="${step||1}" style="width:110px">${suf?` <span class="note">${suf}</span>`:''}`;
  const sample=S.items.find(e=>e.p==='CONFIRMADO'&&['Escritorio','Laptop'].includes(tipo(e)))||S.items.find(e=>['Escritorio','Laptop'].includes(tipo(e)))||S.items[0];const pr=priceCalc(sample,DEFDX);
  const row=(l,inp)=>`<div class="fld"><label>${l}</label><div>${inp}</div></div>`;const T=K.tab,ex=T.vb.Escritorio,pn=(id,v)=>`<input type="number" data-cfg="tab.${id}" value="${v}" step="1" min="0" max="100" style="width:64px"> %`;
  return `<div class="row"><div><h1>Tabulador y reglas</h1><p class="sub">Activo Fijo ajusta aquí precios, descuentos, tiempos meta y reglas de venta sin depender de Sistemas. Los cambios aplican a los diagnósticos nuevos.</p></div><span class="sp"></span><button class="btn" id="cfgreset">Restablecer valores</button></div>
  <div class="card"><h2>Tabulador de precios · equipo de cómputo</h2><p class="note">El diagnóstico del ingeniero da el % de vida útil del equipo; con eso se elige la opción. El precio con descuento sale del valor en libros y el colaborador recibe un descuento adicional sobre ese precio. El Bazar muestra los dos.</p>
   <div class="tbl" style="margin-top:10px"><table class="tb-tab"><tr><th>Opción</th><th>% de vida útil</th><th>% de descuento</th><th>% desc. colaborador</th><th class="n">Precio con dcto.</th><th class="n">Precio con dcto. colaborador</th></tr>
   ${['A','B','C'].map((k,i)=>{const o=T.opt[k],hi=i?T.opt[['A','B'][i-1]].min-1:null,l=Math.round(ex*(1-o.d/100)*100)/100;return `<tr><td><b>${k}</b></td><td>${k==='C'?`≤ ${hi}`:`${k==='A'?'≥':''} <input type="number" data-cfg="tab.opt.${k}.min" value="${o.min}" step="1" min="1" max="100" style="width:58px">${k==='B'?` – ${hi}`:''}`}</td><td>${pn('opt.'+k+'.d',o.d)}</td><td>${pn('opt.'+k+'.dc',o.dc)}</td><td class="n mono">${money2(l)}</td><td class="n mono"><b>${money2(Math.round(l*(1-o.dc/100)*100)/100)}</b></td></tr>`}).join('')}
   <tr class="tb-ex"><td colspan="4" class="n"><b>VALOR DEL ACTIVO</b> <span class="note">(ejemplo y valor de referencia sin valor en libros)</span></td><td colspan="2"><input type="number" data-cfg="tab.vb.Escritorio" value="${ex}" step="0.01" min="0" style="width:120px"></td></tr></table></div>
   <div class="result" style="margin-top:12px"><div class="note">Vista previa con ${esc(sample.ID_ACTIVO)} · ${esc(eqName(sample))} · ${esc(sample.PROCESADOR||'')} · sin fallas en el diagnóstico</div>${pr.tab?tabBox(pr):`<div class="pr">${money(pr.sug)}</div>`}</div></div>
  <div class="grid g2">
   <div class="card"><h2>Cómo se calcula el % de vida útil</h2><p class="note">El diagnóstico parte de 100% y resta por cada condición. Con ≥${T.opt.A.min}% es opción A; de ${T.opt.B.min}% a ${T.opt.A.min-1}%, B; de ${T.opt.B.min-1}% o menos, C.</p><div class="form" style="margin-top:10px">
    ${[['lento','Rendimiento lento'],['estB','Estética B (detalles)'],['estC','Estética C (golpes)'],['puertos','Algún puerto falla'],['monF','Monitor con fallas'],['noMon','Sin monitor'],['perif','Sin teclado y mouse / sin cargador'],['noDisk','Sin disco'],['cpu','Procesador Core i3 o inferior'],['gen','Generación anterior a la 8.ª'],['ram','RAM de 4 GB']].map(([k,l])=>row(l,`<input type="number" data-cfg="tab.pen.${k}" value="${T.pen[k]}" step="1" min="0" max="100" style="width:64px"> <span class="note">− puntos</span>`)).join('')}
    ${row('Valor en libros mínimo (si se estima con el costo)',n('tab.resid',T.resid,1,'% del costo'))}${row('Valor de referencia · laptop',n('tab.vb.Laptop',T.vb.Laptop,1,'$'))}
    ${row('Equipos aptos para venta (proyección)',n('aptos',K.aptos,.05,'0 a 1'))}</div></div>
   <div class="card"><h2>Accesorios (precio máximo) y factores</h2><div class="form" style="margin-top:10px">
    ${Object.keys(K.acc).map(t=>row(t,n('acc.'+t,K.acc[t],10))).join('')}
    ${row('Estética A',n('est.A',K.est.A,.01))}${row('Estética B',n('est.B',K.est.B,.01))}${row('Estética C',n('est.C',K.est.C,.01))}${row('Rendimiento lento',n('lento',K.lento,.01))}${row('Algún puerto falla',n('puertos',K.puertos,.01))}</div></div>
  </div>
  <div class="grid g2">
   <div class="card"><h2>Plazos de la venta</h2><p class="note">Hábiles: firmas, depósito y subasta. Naturales: sin venta, reintento de depósito y factura de donación.</p><div class="form" style="margin-top:10px">
    ${row('Firmas del formato (colaborador y jefe)',n('plazo.firmas',K.plazo.firmas,1,'días hábiles'))}${row('Depositar y subir váucher',n('plazo.pago',K.plazo.pago,1,'días hábiles'))}${row('Corregir depósito no encontrado',n('plazo.reintento',K.plazo.reintento,1,'días naturales'))}
    ${row('Preguntar a Activo Fijo si no se vende',n('plazo.sinVenta',K.plazo.sinVenta,1,'días naturales'))}${row('Duración de la subasta',n('plazo.subasta',K.plazo.subasta,1,'días hábiles'))}${row('Mínimo sugerido de subasta',n('subastaMin',K.subastaMin,.05,'× precio autorizado'))}
    ${row('Adjuntar factura de donataria',n('plazo.donFact',K.plazo.donFact,1,'días naturales'))}${row('Meta de recuperación',n('meta',K.meta,.05,'0 a 1'))}</div>
    <h2 style="margin-top:16px">Cuenta para depósito</h2><p class="note">Datos que recibe el colaborador en Humand después de las firmas. Ingresos indica cuál de sus cuentas usar.</p><div class="form" style="margin-top:10px">
    ${[['banco','Banco'],['titular','Titular'],['clabe','CLABE'],['concepto','Concepto']].map(([k,l])=>row(l,`<input type="text" data-cfgt="banco.${k}" value="${esc(K.banco[k])}" style="width:220px">`)).join('')}</div></div>
   <div class="card"><h2>Reglas de venta</h2><div class="form" style="margin-top:10px">
    ${row('Máximo de equipos por colaborador al año',n('max',K.max,1,'0 = sin límite'))}${row('Días de prioridad para la clínica',n('prio',K.prio,1,'días'))}
    <div class="fld"><label class="chk"><input type="checkbox" data-cfg="bloqDev" ${K.bloqDev?'checked':''}> Bloquear compra con devoluciones pendientes</label></div></div>
    <h2 style="margin-top:16px">Tiempos meta por área</h2><div class="form" style="margin-top:10px">${Object.keys(K.sla).map(a=>row(AREAS[a],n('sla.'+a,K.sla[a],1,'días'))).join('')}</div></div>
  </div>
  <div class="grid g2">
   <div class="card"><h2>Peso promedio por tipo (impacto ambiental)</h2><div class="form" style="margin-top:10px">${Object.keys(K.kg).map(t=>row(t,n('kg.'+t,K.kg[t],.1,'kg'))).join('')}</div></div>
   <div class="card"><h2>Donatarias autorizadas</h2><p class="note">Una por línea.</p><textarea id="dons" rows="6" style="width:100%;margin-top:8px">${esc(K.donatarias.join('\n'))}</textarea></div>
  </div>`};
after.config=()=>{
  $$('[data-cfg]').forEach(i=>i.onchange=()=>{const path=i.dataset.cfg.split('.');let o=S.cfg;for(let k=0;k<path.length-1;k++)o=o[path[k]];const key=path[path.length-1];if(i.type!=='checkbox'&&(i.value.trim()===''||isNaN(+i.value)||+i.value<0)){toast('Valor no válido; se conserva el anterior');render();return}
    o[key]=i.type==='checkbox'?i.checked:+i.value;
    log('PATCH','/config/tabulador','int',{campo:i.dataset.cfg,valor:o[key],usuario:'Activo Fijo'},'Cambio de tabulador o reglas (queda en bitácora).');save();render();toast('Configuración guardada')});
  $$('[data-cfgt]').forEach(i=>i.onchange=()=>{const[a,b]=i.dataset.cfgt.split('.');const v=i.value.trim();if(!v){toast('El campo no puede quedar vacío');render();return}S.cfg[a][b]=v;log('PATCH','/config/banco','int',{campo:i.dataset.cfgt,valor:v,usuario:'Ingresos / Activo Fijo'},'Cambio de la cuenta para depósito.');save();toast('Cuenta guardada')});
  $('#dons').onchange=e=>{S.cfg.donatarias=e.target.value.split('\n').map(s=>s.trim()).filter(Boolean);save();toast('Donatarias guardadas')};
  $('#cfgreset').onclick=()=>{S.cfg=defaultCfg();save();render();toast('Valores restablecidos')};
};

/* ================= EXPEDIENTE ================= */
function openExp(i){const e=S.items[i];const reqs=S.reqs.filter(r=>r.eq===i).sort((a,b)=>a.created<b.created?-1:1);const dx=e.dx;
  const kv=rows=>`<table>${rows.filter(r=>r[1]!==''&&r[1]!=null).map(([k,v])=>`<tr><th style="width:38%">${k}</th><td>${v}</td></tr>`).join('')}</table>`;
  const DXL={enciende:'Enciende / funciona',rend:'Rendimiento',monitor:'Monitor',estetica:'Estética',puertos:'Puertos',perif:'Accesorios',disco:'Almacenamiento'};
  const DXV={si:'Sí',no:'No',ok:'Óptimo / funciona',lento:'Lento',fallas:'Con fallas',falla:'Alguno falla',borrado:'Borrado seguro',pend:'Pendiente',retirado:'Retirado y destruido',A:'A',B:'B',C:'C'};
  const doc=`<div class="carta" id="expdoc"><div class="row"><img src="${document.querySelector('.brand img').src}" alt="" style="height:54px"><span class="sp"></span><div style="text-align:right"><b>EXPEDIENTE DEL ACTIVO</b><div class="note">${esc(e.ID_ACTIVO)} · emitido ${fd(S.today)}</div></div></div>
   <h3 style="margin-top:14px;text-align:left">1. Datos del activo</h3>${kv([['Activo',esc(e.ID_ACTIVO)],['Serie',esc(e.NUM_SERIE)],['Tipo',esc(tipo(e))],['Equipo',esc(e.MARCA+' '+e.MODELO)],['Especificaciones',e.PROCESADOR?esc(`${e.PROCESADOR} · ${e.RAM_GB} GB · ${e.ALMACENAMIENTO}`):''],['Clínica',esc(`${e.CLINICA} · ${e.MUNICIPIO}, ${e.ESTADO}`)],['Área',esc(`${e.SERVICIO} ${e.UBICACION}`)],['Adquisición',fd(e.FECHA_ADQUISICION)],['Fin de vida útil',fd(due(e))],['Costo de adquisición',e.COSTO_ADQUISICION?money(e.COSTO_ADQUISICION):''],['Estatus actual',ST[stOf(e)][0]]])}
   <h3 style="margin-top:14px;text-align:left">2. Diagnóstico de Sistemas</h3>${dx?kv([...Object.keys(DXL).filter(k=>dx[k]).map(k=>[DXL[k],DXV[dx[k]]||dx[k]]),['Componentes recuperados',(dx.comp||[]).join(', ')],['Evidencia',esc(dx.fotos||'')],['Observaciones',esc(dx.obs||'')],['Destino',destino(dx)==='VENTA'?'Venta local':destino(dx)==='RECUP'?'Recuperación + destrucción':'Destrucción'],['Responsable',esc(e.INGENIERO)]]):'<p class="note">Sin diagnóstico.</p>'}
   ${e.price?`<h3 style="margin-top:14px;text-align:left">3. Precio</h3>${kv([['Sugerido por tabulador',money(e.price.sug)+` (rango ${money(e.price.min)}–${money(e.price.max)})`],['Autorizado por Activo Fijo',money(e.price.aut)],['Publicado en Bazar',fd(e.pub)]])}`:''}
   ${e.buyer&&e.sale?`<h3 style="margin-top:14px;text-align:left">4. Venta</h3>${kv([['Folio',`<span class="mono">${esc(e.sale.folio)}</span>`],['Comprador',esc(e.buyer)+(e.sale.emp?' · empleado '+esc(e.sale.emp):'')],['Jefe inmediato',esc(e.sale.jefe||'')],['Datos fiscales',esc(fiscalTxt(e.sale.fiscal))],['Firma del colaborador',e.sale.colSig?fd(e.sale.colSig):'Pendiente'],['Firma del jefe',e.sale.jefeSig?fd(e.sale.jefeSig):'Pendiente'],['Monto',money(e.pay?.amount)],['Váucher',esc(e.pay?.file||'Pendiente')],['Depósito confirmado por Ingresos',e.pay?.ok?'Sí':'Pendiente'],['Factura (CFDI)',esc(e.fac||'Pendiente')],['Cita de entrega',e.cita?fd(e.cita.d)+' '+esc(e.cita.h):''],['Carpeta en Drive',(e.sale.files||[]).map(f=>esc(f.name)).join('<br>')],['Encuesta',e.survey?`${(sum(e.survey.q)/3).toFixed(1)} / 5 · “${esc(e.survey.c)}”`:'']])}`:''}
   ${e.don?`<h3 style="margin-top:14px;text-align:left">4. Donación</h3>${kv([['Donataria',esc(e.don.org)],['Fecha programada',fd(e.don.fecha)],['Entregado',fd(e.don.d)],['Factura de la donataria',esc(e.don.factura||'Pendiente')],['Revisión fiscal',esc(e.don.fiscal||(e.don.factura?'En revisión':''))]])}`:''}
   ${DESTR.includes(e.p)?`<h3 style="margin-top:14px;text-align:left">4. Destrucción</h3>${kv([['Funcional al destruir',e.dx?.enciende==='si'?'Sí':'No'],['Fecha',fd(e.destD)],['Certificado',esc((e.hist.find(h=>/certificado/i.test(h.t))?.t||'Pendiente'))]])}`:''}
   <h3 style="margin-top:14px;text-align:left">5. Aprobaciones y avisos</h3><table><tr><th>Folio</th><th>Tipo</th><th>Área</th><th>Canal</th><th>Creada</th><th>Resuelta</th><th>Días</th><th>Resultado</th></tr>${reqs.map(r=>`<tr><td class="mono">${r.id}</td><td>${RT[r.type].n}</td><td>${AREAS[RT[r.type].a]}</td><td>${RT[r.type].ch==='correo'?'Activo 360 · aviso por correo':RT[r.type].ch==='firma'?'Firma en Humand':'Activo 360 · aviso por bot de Humand'}</td><td>${fd(r.created)}</td><td>${fd(r.resD)}</td><td>${reqDays(r)}</td><td>${r.state}${r.resD?(slaOk(r)?' · en tiempo':' · fuera de tiempo'):''}</td></tr>`).join('')||'<tr><td colspan="8">Sin solicitudes.</td></tr>'}</table>
   <h3 style="margin-top:14px;text-align:left">6. Bitácora completa</h3><table>${e.hist.map(h=>`<tr><td style="width:110px">${fd(h.d)}</td><td>${esc(h.t)}</td><td>${AREAS[h.a]||''}</td></tr>`).join('')}</table>
   <div class="firma"><div><div class="sig"></div>Sistemas</div><div><div class="sig"></div>Activo Fijo</div></div></div>`;
  $('#drawer').innerHTML=`<div class="drawer"><div style="width:min(860px,100%)"><div class="row"><h2>Expediente ${esc(e.ID_ACTIVO)}</h2><span class="sp"></span><button class="btn sm p" id="expp">Imprimir o guardar PDF</button><button class="btn sm" id="exph">Descargar .html</button><button class="btn sm" data-close>Cerrar</button></div>${doc}</div></div>`;bindClose();
  $('#expp').onclick=()=>{document.body.classList.add('printing');window.print();setTimeout(()=>document.body.classList.remove('printing'),500)};
  $('#exph').onclick=()=>{try{const css=[...document.querySelectorAll('style')].map(s=>s.textContent).join('\n');const blob=new Blob([`<!doctype html><html lang="es"><meta charset="utf-8"><title>Expediente ${e.ID_ACTIVO}</title><style>${css}body{padding:20px}</style>${document.getElementById('expdoc').outerHTML}</html>`],{type:'text/html'});const u=URL.createObjectURL(blob),l=document.createElement('a');l.href=u;l.download=`Expediente_${e.ID_ACTIVO}.html`;document.body.appendChild(l);l.click();l.remove();toast('Descargando expediente')}catch(err){toast('No se pudo descargar en esta vista')}};
}

/* ================= INVENTARIO TECNOLÓGICO ================= */
const TI_COLS=['NUM_EMPLEADO','NOMBRE_COLABORADOR','AREA','UBICACION','TIPO_ACTIVO','MARCA','MODELO','NUM_SERIE','NUM_INVENTARIO','FECHA_ENTREGA','ESTADO','RESPONSABLE_ENTREGA'];
VIEWS.ti=()=>{
  const A=S.ast,asg=A.filter(a=>a.estado==='Asignado'),ren=A.filter(tiSoon),pdev=A.filter(a=>a.estado==='Pendiente de devolución'),alm=A.filter(a=>a.estado==='En almacén');
  const pendF=Object.values(S.cartas).filter(L=>L[L.length-1].st==='Pendiente de firma').length;
  const tipos=Object.keys(TI_MOD);const ubiK=a=>{const u=colOf(a.emp)?.ubi||'';return u.startsWith('Campus')?'Campus':u.startsWith('Corporativo')?'Corporativo':'Clínicas'};
  const mm={};asg.forEach(a=>{const k=a.marca+' '+a.modelo;mm[k]=(mm[k]||0)+1});
  const q=S.tiQ.toLowerCase();const rows=A.filter(a=>(!S.tiTipo||a.tipo===S.tiTipo)&&(!S.tiEst||a.estado===S.tiEst||(S.tiEst==='Por renovar'&&tiSoon(a)))&&(!q||(a.inv+a.serie+a.modelo+(colOf(a.emp)?.name||'')+(a.emp||'')).toLowerCase().includes(q)));
  const per=40,pages=Math.max(1,Math.ceil(rows.length/per));S.tiPage=Math.min(S.tiPage,pages-1);
  return `<div class="row"><div><h1>Activos por colaborador</h1><p class="sub">Laptops, monitores, diademas, hubs, memorias y accesorios asignados a personal de Campus, Corporativo y clínicas.</p></div><span class="sp"></span><button class="btn p" data-go="carta">Registrar movimiento</button></div>
  <div class="grid g4">
   <div class="card kpi"><div class="l">Activos registrados</div><div class="v">${A.length}</div><div class="s">${S.col.length} colaboradores</div></div>
   <div class="card kpi"><div class="l">Asignados</div><div class="v">${asg.length}</div><div class="s">${(asg.length/Math.max(1,S.col.filter(c=>c.st==='Activo').length)).toFixed(1)} por colaborador</div></div>
   <div class="card kpi"><div class="l">Por renovar ≤3 meses</div><div class="v" style="color:var(--warn)">${ren.length}</div><div class="s">colaborador y Sistemas notificados</div></div>
   <div class="card kpi"><div class="l">Pendientes de devolución</div><div class="v" style="color:var(--bad)">${pdev.length}</div><div class="s">${S.col.filter(c=>c.st==='Baja laboral').length} colaboradores con baja laboral</div></div>
   <div class="card kpi"><div class="l">Cartas pendientes de firma</div><div class="v" style="color:var(--hm)">${pendF}</div><div class="s">recordatorio diario en Humand</div></div>
   <div class="card kpi"><div class="l">En almacén</div><div class="v">${alm.length}</div><div class="s">disponibles para alta o sustitución</div></div>
  </div>
  <div class="grid g2">
   <div class="card"><h2>Asignados por tipo</h2>${hbars(tipos.map(t=>({l:t,v:[asg.filter(a=>a.tipo===t).length,ren.filter(a=>a.tipo===t).length]})).map(r=>({l:r.l,v:[r.v[0]-r.v[1],r.v[1]]})),{lw:150,vw:40,c:['var(--sd)','var(--amber)']})}${legend([['var(--sd)','Vigente'],['var(--amber)','Por renovar']])}</div>
   <div class="card"><h2>Por ubicación</h2>${hbars(['Campus','Corporativo','Clínicas'].map(u=>({l:u,v:[asg.filter(a=>ubiK(a)===u).length]})),{lw:110,vw:40,c:['var(--info)']})}
    <h3 style="margin-top:14px">Marca y modelo</h3><div class="tbl" style="margin-top:6px"><table>${Object.entries(mm).sort((a,b)=>b[1]-a[1]).slice(0,7).map(([k,v])=>`<tr><td>${esc(k)}</td><td class="n">${v}</td></tr>`).join('')}</table></div></div>
  </div>
  ${ren.length||pdev.length?`<div class="grid g2">
   <div class="card"><h2>Próximos a renovación</h2><div class="tbl" style="margin-top:8px;max-height:280px"><table>${ren.map(a=>`<tr><td><b>${esc(a.tipo)}</b> ${esc(a.modelo)}<div class="note mono">${a.inv}</div></td><td>${esc(colOf(a.emp)?.name)}<div class="note">${a.emp}</div></td><td class="mono note">${fd(tiDue(a))}</td><td><button class="btn sm" data-sus="${a.inv}">Programar sustitución</button></td></tr>`).join('')||'<tr><td class="note">Sin renovaciones próximas.</td></tr>'}</table></div></div>
   <div class="card"><h2>Pendientes de devolución</h2><div class="tbl" style="margin-top:8px;max-height:280px"><table>${pdev.map(a=>{const c=colOf(a.emp);return `<tr><td><b>${esc(a.tipo)}</b> ${esc(a.modelo)}<div class="note mono">${a.inv}</div></td><td>${esc(c?.name)}<div class="note">Baja laboral ${fd(c?.bajaD)}</div></td><td><button class="btn sm r" data-ret="${a.inv}">Registrar devolución</button></td></tr>`}).join('')||'<tr><td class="note">Sin pendientes.</td></tr>'}</table></div></div>
  </div>`:''}
  <div class="card"><div class="row"><h2>Inventario tecnológico</h2><span class="sp"></span><input type="text" id="tq" placeholder="Empleado, nombre, serie, inventario…" value="${esc(S.tiQ)}" style="flex:1 1 200px">
   <select id="tt"><option value="">Todos los tipos</option>${tipos.map(t=>`<option ${t===S.tiTipo?'selected':''}>${t}</option>`).join('')}</select>
   <select id="te"><option value="">Todos los estados</option>${['Asignado','Por renovar','Pendiente de devolución','En almacén','Devuelto','Baja','Baja · Activo 360','Baja (extravío)'].map(t=>`<option ${t===S.tiEst?'selected':''}>${t}</option>`).join('')}</select></div>
   <div class="tbl" style="margin-top:10px;max-height:520px"><table><tr><th>Inventario / serie</th><th>Activo</th><th>Colaborador</th><th>Entrega</th><th>Renovación</th><th>Estado</th></tr>
   ${rows.slice(S.tiPage*per,S.tiPage*per+per).map(a=>{const c=colOf(a.emp);return `<tr ${a.emp?`data-emp="${a.emp}" style="cursor:pointer"`:''}><td><b class="mono">${a.inv}</b><div class="note mono">${a.serie}</div></td><td>${esc(a.tipo)}<div class="note">${esc(a.marca)} ${esc(a.modelo)}</div></td><td>${c?esc(c.name)+`<div class="note">${a.emp} · ${esc(c.ubi)}</div>`:'—'}</td><td class="mono">${fd(a.entrega)}</td><td class="mono">${a.entrega&&['Asignado','Pendiente de devolución'].includes(a.estado)?fd(tiDue(a)):'—'}</td><td>${tpill(a.estado)}${tiSoon(a)?' <span class="pill p-warn">Por renovar</span>':''}</td></tr>`}).join('')}</table></div>
   <div class="row" style="margin-top:8px"><button class="btn sm" id="tp" ${S.tiPage?'':'disabled'}>Anterior</button><span class="note">Página ${S.tiPage+1} de ${pages} · ${rows.length} activos</span><button class="btn sm" id="tn" ${S.tiPage<pages-1?'':'disabled'}>Siguiente</button></div></div>
  <div class="grid g2">
   <div class="card"><h2>Historial de movimientos</h2><div class="tbl" style="margin-top:8px;max-height:340px"><table><tr><th>Fecha</th><th>Movimiento</th><th>Colaborador</th><th>Activo</th></tr>${S.movs.slice(0,40).map(m=>`<tr><td class="mono note">${fd(m.d)}</td><td><span class="pill ${m.tipo==='Alta'?'p-sd':m.tipo==='Baja'?'p-bad':m.tipo==='Sustitución'?'p-warn':'p-info'}">${m.tipo}</span><div class="note">${esc(m.motivo)}</div></td><td>${esc(colOf(m.emp)?.name||m.emp)}</td><td>${esc(m.activo)}<div class="note mono">${m.inv} · ${esc(m.resp)}</div></td></tr>`).join('')}</table></div></div>
   <div class="card"><h2>Cargar asignaciones</h2><p class="note">Migración desde el Excel de Drive. Una fila por activo.</p><div class="row" style="gap:6px;margin:8px 0">${TI_COLS.map(c=>`<span class="pill p-mut">${c}</span>`).join('')}</div>
    <input type="file" id="tifile" accept=".xlsx,.xls,.csv"><div id="tires" style="margin-top:8px"></div><div class="row" style="margin-top:8px"><button class="btn sm" id="tiexp">Exportar inventario tecnológico</button></div></div>
  </div>`;
};
after.ti=()=>{
  $('#tq').oninput=e=>{S.tiQ=e.target.value;S.tiPage=0;const p=e.target.selectionStart;render();const q=$('#tq');q.focus();q.setSelectionRange(p,p)};
  $('#tt').onchange=e=>{S.tiTipo=e.target.value;S.tiPage=0;render()};$('#te').onchange=e=>{S.tiEst=e.target.value;S.tiPage=0;render()};
  $('#tp').onclick=()=>{S.tiPage--;render()};$('#tn').onclick=()=>{S.tiPage++;render()};
  $$('[data-emp]').forEach(r=>r.onclick=()=>{S.emp=r.dataset.emp;go('carta')});
  $$('[data-sus]').forEach(b=>b.onclick=()=>{const a=S.ast.find(x=>x.inv===b.dataset.sus);S.emp=a.emp;S.mov={tipo:'Sustitución',inv:a.inv,dest:'a360',motivo:'Fin de vida útil'};go('carta')});
  $$('[data-ret]').forEach(b=>b.onclick=()=>{const a=S.ast.find(x=>x.inv===b.dataset.ret);S.emp=a.emp;S.mov={tipo:'Baja',inv:a.inv,dest:'almacen',motivo:'Devolución por baja laboral'};go('carta')});
  $('#tiexp').onclick=()=>xlsxOut(S.ast.map(a=>{const c=colOf(a.emp);return{NUM_EMPLEADO:a.emp||'',NOMBRE_COLABORADOR:c?.name||'',AREA:c?.area||'',UBICACION:c?.ubi||'',TIPO_ACTIVO:a.tipo,MARCA:a.marca,MODELO:a.modelo,NUM_SERIE:a.serie,NUM_INVENTARIO:a.inv,FECHA_ENTREGA:a.entrega||'',ESTADO:a.estado,RESPONSABLE_ENTREGA:a.resp}}),'inventario_tecnologico_Activo360.xlsx');
  $('#tifile').onchange=e=>{const f=e.target.files[0];f&&readRows(f,rows=>{
    if(!('NUM_EMPLEADO' in rows[0])||!('TIPO_ACTIVO' in rows[0]))throw new Error('Faltan columnas NUM_EMPLEADO o TIPO_ACTIVO.');
    S.col=[];S.ast=[];S.cartas={};S.movs=[];let n=0;const mdy=isMDY(rows.map(r=>r.FECHA_ENTREGA));
    rows.forEach(r=>{const emp=String(r.NUM_EMPLEADO||'').trim();if(emp&&!colOf(emp))S.col.push({emp,name:r.NOMBRE_COLABORADOR||emp,area:r.AREA||'',ubi:r.UBICACION||'',st:'Activo'});
      const t=Object.keys(VIDA).find(k=>k.toLowerCase()===String(r.TIPO_ACTIVO).trim().toLowerCase())||String(r.TIPO_ACTIVO||'Accesorio');
      S.ast.push({inv:r.NUM_INVENTARIO||'TI-'+(++invSeq),tipo:t,marca:r.MARCA||'',modelo:r.MODELO||'',serie:r.NUM_SERIE||'',entrega:normDate(r.FECHA_ENTREGA,mdy),alta:S.today,estado:emp?(r.ESTADO&&/devol/i.test(r.ESTADO)?'Devuelto':'Asignado'):'En almacén',emp:emp||null,resp:r.RESPONSABLE_ENTREGA||'Sistemas',hist:[]});n++});
    S.col.forEach(c=>newCarta(c.emp,'Carga inicial desde Excel',{st:'Firmada',signed:S.today,silent:true}));S.emp=S.col[0]?.emp;save();render();
    $('#tires').innerHTML=`<div class="result"><b>${n} activos</b> de ${S.col.length} colaboradores cargados.</div>`},'#tires')};
};

/* ---- Colaborador y carta responsiva ---- */
const DIAS=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'],MESL=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const fdl=s=>{const d=pd(s);return `${DIAS[d.getUTCDay()]}, ${d.getUTCDate()} de ${MESL[d.getUTCMonth()]} de ${d.getUTCFullYear()}`};
const COSTO={'Laptop':23862,'Monitor':3450,'Diadema':890,'Hub USB-C':1250,'Memoria USB':180,'Divisor de pantalla':640};
const PUESTO_N=['Analista','Coordinador(a)','Auxiliar','Especialista','Jefe(a)'];
const puestoOf=c=>c.puesto||`${PUESTO_N[(+c.emp)%PUESTO_N.length]} de ${c.area}`;
const mailOf=c=>{const n=c.name.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().split(' ');return `${n[0]}.${n[1]||''}@salud-digna.org`};
const estadoCarta=m=>/sustitu|renova/i.test(m)?'Sustitución':/reasign/i.test(m)?'Reasignado':/inicial|ingreso|entrega de equipo/i.test(m)?'Nuevo':'Actualización de resguardo';
function cartaDoc(c,v){const lap=v.items.find(a=>a.tipo==='Laptop');const full=lap&&S.ast.find(a=>a.inv===lap.inv);const nad=!v.items.length&&c.st!=='Activo';
  const ing=(S.movs.find(m=>m.emp===c.emp&&m.d<=v.d)||{}).resp||STAFF[0];
  const head=pg=>`<table class="sgc"><tr><td rowspan="2" style="width:31%"><div class="lg">SaludDigna<small>La salud es para todos</small></div></td><td rowspan="2" class="ttl">Salud Digna A.C.<br>Documento del Sistema de Gestión de la Calidad</td><td style="width:19%;text-align:center;white-space:nowrap"><b>Clave:</b><br>SGC-N4-347</td><td style="width:9%;text-align:center;white-space:nowrap"><b>Rev.:</b><br>3</td></tr><tr><td colspan="2"><b>Referencias:</b> <span class="mono">${v.folio}</span></td></tr><tr><td colspan="4" class="fm">${nad?'CONSTANCIA DE NO ADEUDO DE EQUIPO DE CÓMPUTO':'FORMATO DE CARTA RESPONSIVA DE EQUIPO DE CÓMPUTO'}</td></tr></table>`;
  const rows=v.items.map(a=>`<tr><td>${esc(a.tipo==='Laptop'?a.marca.toUpperCase():a.tipo+' '+a.marca)}</td><td>${esc(a.modelo)}</td><td class="mono">${esc(a.serie)}</td><td class="mono">${a.tipo==='Laptop'?'CRG-'+esc(a.serie.slice(-6)):'N/A'}</td><td>${money(COSTO[a.tipo]||0)}.00</td></tr>`).join('');
  return `<div class="carta">${head()}
  <p style="text-align:right;margin:10px 0">${fdl(v.d)}</p>
  <p style="margin:0">Ticket: <span class="mono">${esc(v.ticket||'TCK-'+v.folio.replace(/\D/g,'').slice(-6))}</span><br>${nad?'Constancia de no adeudo':'Carta responsiva de equipo de cómputo'}<br>Salud Digna A.C · versión ${v.v}</p>
  ${nad?`<p class="cl">Por medio de la presente se hace constar que <b>${esc(c.name)}</b> entregó a Salud Digna A.C. la totalidad del equipo de cómputo que tenía bajo su resguardo, por lo que no tiene adeudo de activos tecnológicos a la fecha.</p>`:
  `<p style="margin-top:12px">Estado del Equipo: <b>${estadoCarta(v.motivo)}</b><br>Por medio de la presente hago constar que recibí de Salud Digna A.C. el siguiente equipo para uso exclusivo del desempeño de mis actividades laborales asignadas y consta de las siguientes características</p>`}
  <div class="cdat"><b>Correo:</b><span>${esc(mailOf(c))}</span><b>ID:</b><span>${esc(c.emp)}</span><b>Nombre:</b><span>${esc(c.name.toUpperCase())}</span><b>Sucursal:</b><span>${esc(c.ubi)}</span><b>Puesto:</b><span>${esc(puestoOf(c).toUpperCase())}</span><b>Departamento:</b><span>${esc(c.area.toUpperCase())}</span></div>
  ${nad?'':`${lap?`<h4>Hardware</h4><div class="cdat"><b>Procesador:</b><span>${esc(full?.cpu||'—')}</span><b>Memoria RAM:</b><span>16 GB</span><b>Disco Duro:</b><span>256 GB SSD</span></div>
  <h4>Software</h4><div class="cdat"><b>Licencias:</b><span>Windows 11, ANTIVIRUS TRELLIX, SONIC WALL VPN</span><b>Licencias adicionales:</b><span>0</span></div>`:''}
  <table class="ctab"><tr><th>MARCA</th><th>MODELO</th><th>NÚMERO DE SERIE</th><th>NÚMERO DE CARGADOR</th><th>COSTO</th></tr>${rows}</table>
  <p style="margin-top:12px"><b>Comentarios:</b> ${esc(v.motivo)}. Esta versión sustituye a las anteriores y refleja la totalidad del equipo bajo resguardo.</p>
  <p class="cl">Así mismo, declaro conocer las políticas internas de Salud Digna A.C relacionada con el uso de este equipo y estar de acuerdo con las mismas, por lo que mediante la suscripción de esta carta me obligo a resguardar, proteger, conservar y ser sujeto a las sanciones internas y/o externas que pudieran surgir por el incumplimiento de lo aquí pactado.</p>
  <p class="cl">El suscrito, se obliga a informar de manera inmediata cualquier perdida, robo, extravío y/o cualquier vulneración que pudiera sufrir física o virtualmente el equipo. Lo anterior a fin de que Salud Digna A.C. pueda tomar medidas de seguridad pertinentes.</p>
  <p class="cl">Los daños ocasionados por el mal manejo y/o imprudencia, serán mi responsabilidad y en caso de ser necesario pagando el costo por reposición vía nomina o sustituirse por un modelo similar.</p>
  <p class="cl">Me comprometo a que no sea revisado por personal ajeno al área de soporte de infraestructura de Salud Digna.</p>`}
  <div class="firma"><div><div class="sig">${v.signed?esc(c.name):''}</div>Recibe<br>Colaborador<br><span class="note">${v.signed?'Firmado electrónicamente en Humand · '+fd(v.signed):nad?'':'Pendiente de firma en Humand'}</span></div><div><div class="sig">${esc(ing)}</div>Entrega<br>Ingeniero de Infraestructura</div></div></div>`}
VIEWS.carta=()=>{
  const c=colOf(S.emp)||S.col[0];if(!c)return '<div class="card">Sin colaboradores cargados.</div>';S.emp=c.emp;
  const L=S.cartas[c.emp]||[],v=L[L.length-1],mine=assignedTo(c.emp),hist=S.ast.filter(a=>a.hist.some(h=>true)&&S.movs.some(m=>m.emp===c.emp&&m.inv===a.inv)&&!mine.includes(a));
  const movs=S.movs.filter(m=>m.emp===c.emp);
  return `<div class="row"><div><h1>Carta responsiva</h1><p class="sub">Una sola carta vigente por colaborador. Cada alta, baja, sustitución o reasignación genera una nueva versión para firma; las anteriores se conservan.</p></div></div>
  <div class="card row"><label for="es" class="note">Buscar por número de empleado o nombre</label><input type="text" id="es" list="eml" placeholder="102458" style="flex:1 1 220px"><datalist id="eml">${S.col.map(x=>`<option value="${x.emp}">${esc(x.name)}</option>`).join('')}</datalist><button class="btn" id="esb">Buscar</button></div>
  <div class="card"><div class="prof"><div class="avatar">${esc(c.name.split(' ').slice(0,2).map(s=>s[0]).join(''))}</div><div style="flex:1 1 220px;min-width:0"><h2>${esc(c.name)}</h2><div class="note">Empleado ${c.emp} · ${esc(c.area)} · ${esc(c.ubi)}${c.st!=='Activo'?` · <span class="pill p-bad">${c.st} ${fd(c.bajaD)}</span>`:''}</div></div>
   <div class="grid" style="grid-template-columns:repeat(3,minmax(90px,1fr));flex:1 1 300px"><div class="kpi"><div class="v">${mine.length}</div><div class="l">Asignados</div></div><div class="kpi"><div class="v" style="color:var(--warn)">${mine.filter(tiSoon).length}</div><div class="l">Por renovar</div></div><div class="kpi"><div class="v" style="font-size:16px;padding-top:6px">${v?cpill(v.st):'—'}</div><div class="l">Carta v${v?.v||0}</div></div></div></div></div>
  ${S.mov?movForm(c):`<div class="row"><button class="btn p" data-mv="Alta">Alta de activo</button><button class="btn" data-mv="Baja">Baja / devolución</button><button class="btn" data-mv="Sustitución">Sustitución</button><button class="btn" data-mv="Reasignación">Reasignación</button></div>`}
  <div class="grid g2">
   <div class="card"><h2>Activos bajo resguardo</h2><div class="tbl" style="margin-top:8px"><table><tr><th>Activo</th><th>Entrega</th><th>Renovación</th><th>Estado</th></tr>${mine.map(a=>`<tr><td><b>${esc(a.tipo)}</b> ${esc(a.marca)} ${esc(a.modelo)}<div class="note mono">${a.inv} · ${a.serie}</div></td><td class="mono">${fd(a.entrega)}</td><td class="mono">${fd(tiDue(a))}</td><td>${tpill(a.estado)}${tiSoon(a)?' <span class="pill p-warn">Por renovar</span>':''}</td></tr>`).join('')||'<tr><td class="note">Sin activos asignados.</td></tr>'}</table></div>
    ${hist.length?`<h3 style="margin-top:12px">Activos anteriores</h3><div class="tbl" style="margin-top:6px"><table>${hist.map(a=>`<tr><td>${esc(a.tipo)} ${esc(a.modelo)}<div class="note mono">${a.inv}</div></td><td>${tpill(a.estado)}</td></tr>`).join('')}</table></div>`:''}</div>
   <div class="card"><div class="row"><h2>Carta vigente</h2><span class="sp"></span>${v?cpill(v.st):''}</div><div style="margin-top:10px">${v?cartaDoc(c,v):'<p class="note">Sin carta.</p>'}</div></div>
  </div>
  <div class="grid g2">
   <div class="card"><h2>Versiones</h2>${L.slice().reverse().map(x=>`<div class="ver"><b class="mono">${x.folio}</b>${cpill(x.st)}<span class="note">${fd(x.d)} · ${x.items.length} activos · ${esc(x.motivo)}${x.signed?' · firmada '+fd(x.signed):''}${x.st==='Pendiente de firma'&&x.rem?' · '+x.rem+' recordatorio(s)':''}</span><span class="sp"></span><button class="btn sm" data-cv="${x.v}">Ver</button></div>`).join('')}<p class="note" style="margin-top:8px">Las cartas firmadas no se modifican; se resguardan en el expediente del colaborador en Humand y en el repositorio institucional.</p></div>
   <div class="card"><h2>Historial de movimientos</h2><ul class="tl" style="margin-top:10px">${movs.map(m=>`<li><span class="mono note">${fd(m.d)}</span><span class="dot"></span><span><b>${m.tipo}</b> · ${esc(m.activo)} <span class="mono note">${m.inv}</span><div class="note">${esc(m.det)} · ${esc(m.motivo)} · ${esc(m.resp)}</div></span></li>`).join('')}</ul></div>
  </div>`;
};
function movForm(c){const m=S.mov;const mine=assignedTo(c.emp);const alm=S.ast.filter(a=>a.estado==='En almacén');
  const seg=(k,opts)=>`<div class="seg">${opts.map(([v,l])=>`<label><input type="radio" name="${k}" value="${v}" ${m[k]===v?'checked':''}>${l}</label>`).join('')}</div>`;
  const out=m.tipo!=='Alta',inn=m.tipo==='Alta'||m.tipo==='Sustitución';const old=S.ast.find(a=>a.inv===m.inv);
  const almF=alm.filter(a=>m.tipo!=='Sustitución'||!old||a.tipo===old.tipo);
  return `<div class="card" style="border-color:var(--sd)"><div class="row"><h2>Registrar movimiento</h2><span class="sp"></span><button class="btn sm" id="mvx">Cancelar</button></div>
  <form id="mvf" class="form" style="margin-top:10px">
   <div class="fld"><span class="lb">Tipo de movimiento</span>${seg('tipo',[['Alta','Alta'],['Baja','Baja / devolución'],['Sustitución','Sustitución'],['Reasignación','Reasignación']])}</div>
   ${out?`<div class="fld"><label for="mvinv">${m.tipo==='Reasignación'?'Activo a reasignar':'Activo que se devuelve'}</label><select id="mvinv" name="inv"><option value="">Selecciona…</option>${mine.map(a=>`<option value="${a.inv}" ${a.inv===m.inv?'selected':''}>${a.tipo} · ${a.modelo} · ${a.inv}</option>`).join('')}</select></div>`:''}
   ${m.tipo==='Baja'||m.tipo==='Sustitución'?`<div class="fld"><span class="lb">Destino del equipo devuelto</span>${seg('dest',[['almacen','Almacén (reutilizar)'],['a360','Activo 360 (venta o destrucción)'],['danio','Baja por daño'],['extravio','Robo / extravío']])}</div>`:''}
   ${m.tipo==='Reasignación'?`<div class="fld"><label for="mvto">Nuevo responsable</label><select id="mvto" name="to"><option value="">Selecciona…</option>${S.col.filter(x=>x.emp!==c.emp&&x.st==='Activo').map(x=>`<option value="${x.emp}" ${x.emp===m.to?'selected':''}>${x.emp} · ${esc(x.name)}</option>`).join('')}</select></div>`:''}
   ${inn?`<div class="fld"><label for="mvnew">Activo que se entrega</label><select id="mvnew" name="nw"><option value="">Selecciona…</option>${almF.map(a=>`<option value="${a.inv}" ${a.inv===m.nw?'selected':''}>${a.tipo} · ${a.marca} ${a.modelo} · ${a.inv}</option>`).join('')}<option value="NEW" ${m.nw==='NEW'?'selected':''}>+ Registrar equipo nuevo (compra)</option></select></div>
    ${m.nw==='NEW'?`<div class="fld"><label for="mvt">Tipo de activo nuevo</label><select id="mvt" name="nt">${Object.keys(TI_MOD).map(t=>`<option ${t===(m.nt||old?.tipo)?'selected':''}>${t}</option>`).join('')}</select></div>`:''}`:''}
   <div class="fld"><label for="mvm">Motivo</label><input type="text" id="mvm" name="motivo" value="${esc(m.motivo||'')}" placeholder="Ej. renovación, nuevo ingreso, daño"></div>
   <div class="fld"><label for="mvr">Responsable de Sistemas</label><select id="mvr" name="resp">${STAFF.map(s=>`<option ${s===m.resp?'selected':''}>${s}</option>`).join('')}</select></div>
  </form>
  <div class="row" style="margin-top:12px"><span class="note" style="flex:1 1 260px">Al guardar se genera la versión ${(S.cartas[c.emp]||[]).length+1} de la carta${m.tipo==='Reasignación'?' de ambos colaboradores':''} y se envía a firma en Humand.</span><button class="btn p" id="mvok">Guardar y generar carta</button></div></div>`}
after.carta=()=>{
  const find=()=>{const v=$('#es').value.trim().toLowerCase();const c=S.col.find(x=>x.emp===v)||S.col.find(x=>x.name.toLowerCase().includes(v));if(c){S.emp=c.emp;S.mov=null;render()}else toast('No se encontró el colaborador')};
  $('#esb').onclick=find;$('#es').onkeydown=e=>{if(e.key==='Enter')find()};
  $$('[data-mv]').forEach(b=>b.onclick=()=>{S.mov={tipo:b.dataset.mv,dest:'almacen',resp:STAFF[0]};render()});
  $$('[data-cv]').forEach(b=>b.onclick=()=>{const c=colOf(S.emp),v=S.cartas[S.emp].find(x=>x.v==b.dataset.cv);$('#drawer').innerHTML=`<div class="drawer"><div><div class="row"><h2>${v.folio}</h2>${cpill(v.st)}<span class="sp"></span><button class="btn sm" data-close>Cerrar</button></div>${cartaDoc(c,v)}</div></div>`;bindClose()});
  if(!$('#mvf'))return;
  $('#mvx').onclick=()=>{S.mov=null;render()};
  $('#mvf').onchange=ev=>{const t=ev.target;if(t.name){S.mov[t.name]=t.value;if(t.name==='tipo'){S.mov.inv='';S.mov.nw=''}}render()};
  $('#mvf').oninput=ev=>{if(ev.target.name==='motivo')S.mov.motivo=ev.target.value};
  $('#mvok').onclick=()=>{const m=S.mov,c=colOf(S.emp);m.resp=$('#mvr').value;m.motivo=$('#mvm').value.trim()||m.tipo;
    const out=m.tipo!=='Alta',inn=m.tipo==='Alta'||m.tipo==='Sustitución';
    if(out&&!m.inv)return toast('Selecciona el activo');if(inn&&!m.nw)return toast('Selecciona el activo que se entrega');if(m.tipo==='Reasignación'&&!m.to)return toast('Selecciona el nuevo responsable');
    const old=S.ast.find(a=>a.inv===m.inv);
    if(m.tipo==='Baja'||m.tipo==='Sustitución'){const d=m.dest||'almacen';old.devD=S.today;
      if(d==='almacen'){old.estado='En almacén';old.emp=null}else if(d==='a360'){old.estado='Baja · Activo 360';old.emp=null;toA360(old,c)}else{old.estado=d==='danio'?'Baja':'Baja (extravío)';old.emp=null}
      addMov(c.emp,m.tipo==='Sustitución'?'Sustitución':'Baja',old,m.tipo==='Sustitución'?'Devolución del equipo anterior':'Devolución / baja · destino '+({almacen:'almacén',a360:'Activo 360',danio:'baja por daño',extravio:'robo o extravío'}[d]),m.motivo,m.resp)}
    if(inn){let a=m.nw==='NEW'?newAsset(m.nt||old?.tipo||'Laptop',{}):S.ast.find(x=>x.inv===m.nw);a.estado='Asignado';a.emp=c.emp;a.entrega=S.today;a.resp=m.resp;addMov(c.emp,m.tipo,a,m.tipo==='Sustitución'?'Entrega del equipo nuevo':'Entrega de equipo',m.motivo,m.resp)}
    if(m.tipo==='Reasignación'){old.emp=m.to;old.entrega=S.today;addMov(c.emp,'Reasignación',old,'Devuelve para reasignar a '+m.to,m.motivo,m.resp);addMov(m.to,'Reasignación',old,'Recibe de '+c.emp,m.motivo,m.resp);newCarta(m.to,'Reasignación de '+old.tipo.toLowerCase())}
    if(c.st!=='Activo'&&!assignedTo(c.emp).length)toast('Colaborador sin activos pendientes de devolución');
    if(c.st!=='Activo'){const L=S.cartas[c.emp]||(S.cartas[c.emp]=[]);const pv=L[L.length-1];if(pv&&pv.st==='Firmada')pv.st='Histórica';if(pv&&pv.st==='Pendiente de firma')pv.st='Cancelada (reemplazada antes de firmar)';
      const left=assignedTo(c.emp).length;L.push({v:L.length+1,folio:`CD-${c.emp}-${String(L.length+1).padStart(2,'0')}`,d:S.today,motivo:'Devolución por baja laboral',items:snap(c.emp),st:left?'Devolución parcial':'Constancia de no adeudo',signed:S.today,rem:0,last:S.today});
      log('POST','/users/{employeeInternalId}/documents/files','pub',{employeeInternalId:c.emp,name:`CD-${c.emp}.pdf`,signatureStatus:'SIGNATURE_NOT_NEEDED'},'Constancia de devolución (no se envía a firma: el colaborador ya no está activo).');
      S.mov=null;save();render();toast(left?`Devolución registrada · faltan ${left} activo(s)`:'Constancia de no adeudo generada');return}
    const v=newCarta(c.emp,`${m.tipo}${old?' de '+old.tipo.toLowerCase():''}${inn&&m.tipo==='Alta'?' de '+S.ast.find(a=>a.emp===c.emp&&a.entrega===S.today)?.tipo.toLowerCase():''}`);
    S.mov=null;save();render();toast(`Carta ${v.folio} generada y enviada a firma en Humand`)};
};
function toA360(a,c){const ubi=c.ubi||'Campus Culiacán';const cl=DATA.clinics.find(x=>x.n===ubi);
  const e={ID_ACTIVO:a.inv,NUM_SERIE:a.serie,CLINICA:cl?ubi:ubi,MUNICIPIO:cl?cl.m:ubi.includes('Culiac')?'CULIACAN':'CIUDAD DE MEXICO',ESTADO:cl?cl.e:ubi.includes('Culiac')?'SINALOA':'CDMX',ZONA:cl?.z||'CAMPUS',DIVISION:cl?.dv||'CAMPUS',SERVICIO:'Asignado a personal',UBICACION:'',TIPO_EQUIPO:a.tipo,MARCA:a.marca,MODELO:a.modelo,PROCESADOR:a.cpu||'',GENERACION:a.gen||0,RAM_GB:a.tipo==='Laptop'?16:0,ALMACENAMIENTO:a.tipo==='Laptop'?'SSD 256GB':'',MONITOR:'',SO:a.tipo==='Laptop'?'Windows 11 Pro':'',FECHA_ADQUISICION:a.entrega||S.today,COSTO_ADQUISICION:0,VIDA_UTIL_ANIOS:VIDA[a.tipo]||3,INGENIERO:a.resp,CORREO_INGENIERO:''};
  const it=freshItems([e])[0];it._i=S.items.length;it.p='CONFIRMADO';H(it,`Devuelto por ${c.name} (${c.emp}) · enviado a diagnóstico de Activo 360`,'SIS');S.items.push(it);
  log('POST','/inventario','int',{id:a.inv,tipo:a.tipo,origen:'Inventario tecnológico'},'El equipo devuelto entra a Activo 360 para venta o destrucción.')}

/* ================= HUMAND ================= */
function hmFrame(inner,tag){const n=S.notifs.filter(x=>x.d===S.today).length;
  return `<div class="hm-frame"><div class="hm-bar"><div class="hm-logo">SaludDigna<small>LA SALUD ES PARA TODOS</small></div><span class="hm-tag">Integrado con Activo 360</span><span class="sp"></span><span class="note">${tag||''}</span><button class="btn sm o" data-go="hnotif">Notificaciones ${n?`<span class="cnt hot">${n}</span>`:''}</button></div><div class="hm-body">${inner}</div></div>`}
VIEWS.hgestion=()=>{
  const tabs=[['ALL','Todas'],['AF','Activo Fijo'],['ING','Ingresos']];const isH=r=>RT[r.type].ch==='humand';
  const rs=S.reqs.filter(r=>isH(r)&&(S.hmTab==='ALL'||RT[r.type].a===S.hmTab));const pend=rs.filter(r=>r.state==='Pendiente'),done=rs.filter(r=>r.state!=='Pendiente').slice(0,30);
  const types=Object.entries(RT).filter(([k,t])=>t.ch==='humand'&&(S.hmTab==='ALL'||t.a===S.hmTab));
  const row=r=>{const e=S.items[r.eq];const age=diff(r.created,S.today);return `<tr><td><b>${RT[r.type].n}</b><div class="mono note">${r.id}</div></td>
   <td>${r.state==='Pendiente'?`<span class="pill p-warn">Pendiente</span>${r.esc?' <span class="pill p-bad">Escalada</span>':''}`:`<span class="pill ${['Rechazada','Destruir'].includes(r.state)?'p-bad':'p-ok'}">${r.state}</span>`}</td>
   <td class="mono">${fd(r.created)}</td><td>${eqLine(e)}${e.buyer&&r.type==='DEPOSITO'?`<div class="note">Colaborador: ${esc(e.buyer)} · ${esc(e.sale?.folio||'')}</div>`:''}${r.type==='DECISION'&&e.pub?`<div class="note">${diff(e.pub,S.today)} días publicado sin venta</div>`:''}</td>
   <td class="n">${r.amount!=null?money(r.amount):'—'}${r.type==='PRECIO'&&e.price?`<div class="note">rango ${money(e.price.min)}–${money(e.price.max)}</div>`:''}${r.type==='DONFACT'&&e.don?`<div class="note">${esc(e.don.org)}</div>`:''}${r.type==='DEPOSITO'&&e.pay?.file?`<div class="note">${esc(e.pay.file)}<br>concepto ${esc(e.sale?.folio||'')}</div>`:''}</td>
   <td class="n">${r.state==='Pendiente'?`${age} d${r.rem?`<div class="note">${r.rem} recordat.</div>`:''}`:esc(r.res||'')}<div style="margin-top:4px">${slaPill(r)}</div></td>
   <td>${r.state==='Pendiente'?actions(r):''}</td></tr>`};
  return `<div><h1>Aprobaciones de Activo Fijo e Ingresos</h1><p class="sub">Humand no permite que un sistema externo cree solicitudes de aprobación, así que Activo Fijo e Ingresos aprueban aquí, en Activo 360. El aviso les llega en Humand por un mensaje del bot de Activo 360 con la liga directa a su pendiente.</p></div>
  <div class="card"><div class="tabs">${tabs.map(([k,l])=>`<button data-ht="${k}" class="${S.hmTab===k?'on':''}">${l}</button>`).join('')}</div>
   <h2 style="margin:18px 0 10px;font-size:20px">Tipos de solicitudes</h2>
   <div class="types">${types.map(([k,t])=>{const n=S.reqs.filter(r=>r.type===k&&r.state==='Pendiente').length;return `<div class="type ${n?'on':''}"><b>${t.n}</b><div class="big">${n} <span style="font-size:13px;font-weight:600">pendientes</span></div><div class="who"><b>${AREAS[t.a]}</b> · ${t.d}</div></div>`}).join('')}</div>
   <h2 style="margin:22px 0 10px;font-size:20px">Solicitudes por resolver</h2>
   <div class="tbl"><table><tr><th>Tipo de solicitud</th><th>Estado</th><th>Solicitado en</th><th>Equipo</th><th class="n">Monto</th><th class="n">Antigüedad</th><th>Acción</th></tr>${pend.map(row).join('')||'<tr><td colspan="7" class="note">Bandeja al día.</td></tr>'}</table></div>
   <details style="margin-top:16px"><summary>Resueltas recientemente (${done.length})</summary><div class="tbl" style="margin-top:8px"><table><tr><th>Tipo</th><th>Estado</th><th>Solicitado en</th><th>Equipo</th><th class="n">Monto</th><th class="n">Resolución</th><th></th></tr>${done.map(row).join('')}</table></div></details></div>`;
};
function actions(r){const id=r.id,e=S.items[r.eq];switch(r.type){
  case'PRECIO':return `<div class="row" style="gap:4px"><button class="btn sm h" data-ap="${id}">Aprobar</button><input type="number" step="50" min="50" id="m-${id}" placeholder="Nuevo $" style="width:90px"><button class="btn sm o" data-mod="${id}">Modificar</button><button class="btn sm r" data-rej="${id}">Rechazar</button></div>`;
  case'DECISION':{const L=t=>`<span class="note" style="white-space:nowrap">${t}</span>`;return `<div style="display:grid;grid-template-columns:auto auto auto;gap:6px 6px;align-items:center;min-width:300px">
   ${L('Bajar')}<span class="row" style="gap:4px;flex-wrap:nowrap"><input type="number" min="1" max="90" step="5" value="20" id="pc-${id}" style="width:58px">%</span><button class="btn sm o" data-dpc="${id}">Aplicar</button>
   ${L('Nuevo precio')}<input type="number" step="50" min="50" id="pa-${id}" placeholder="$" style="width:90px"><button class="btn sm o" data-dpa="${id}">Aplicar</button>
   ${L('Subasta desde')}<input type="number" step="50" min="50" value="${r50(e.price.aut*C().subastaMin)}" id="sm-${id}" style="width:90px"><button class="btn sm h" data-dau="${id}">Iniciar</button>
   ${L('Donar a')}<span class="row" style="gap:4px;flex-wrap:nowrap"><select id="do-${id}" style="max-width:130px">${C().donatarias.map(d=>`<option>${esc(d)}</option>`).join('')}</select><input type="date" id="df-${id}" value="${addBiz(S.today,2)}" min="${S.today}" style="width:130px"></span><button class="btn sm" data-ddo="${id}">Donar</button>
   ${L('Sin valor')}<span></span><button class="btn sm r" data-dde="${id}">Destruir</button></div>`}
  case'DEPOSITO':return `<div class="row" style="gap:4px"><button class="btn sm h" data-ap="${id}">Depósito recibido</button><button class="btn sm r" data-rej="${id}">No se encuentra</button></div>`;
  case'DONFACT':return `<label class="btn sm h">Adjuntar factura<input type="file" data-dfac="${r.eq}" hidden accept=".pdf,.xml"></label>`;}}
function clinicStock(c){const l=S.items.filter(e=>e.CLINICA===c);return{disp:l.filter(e=>['PUBLICADO','SUBASTA'].includes(e.p)).length,cong:l.filter(e=>FROZEN.includes(e.p)).length,vend:l.filter(e=>SOLD.includes(e.p)).length}}
function resolve(id,act,val){const r=S.reqs.find(x=>x.id===id);const e=S.items[r.eq];const area=RT[r.type].a;
  r.state={rej:'Rechazada',mod:'Modificada',pct:'Bajar precio',amt:'Bajar precio',auc:'Subasta',dest:'Destruir',don:'Donar'}[act]||'Aprobada';r.res=fd(S.today);r.resD=S.today;
  log('PATCH','/activo360/aprobaciones/'+id,'int',{type:RT[r.type].n,decision:r.state.toUpperCase(),amount:typeof val==='number'?val:r.amount,resolvedBy:AREAS[area],resolvedAt:S.today},'El área resolvió dentro de Activo 360 y el flujo avanza al siguiente paso.');
  if(r.type==='PRECIO'){
    if(act==='rej'){e.p='DESTRUCCION';e.destD=S.today;H(e,'Activo Fijo rechazó la venta · enviado a destrucción certificada','AF','hmn')}
    else{if(act==='mod'){e.price.aut=r50(val);r.amount=e.price.aut;H(e,`Activo Fijo modificó el precio a ${money(e.price.aut)}`,'AF','hmn')}else H(e,`Activo Fijo autorizó ${money(e.price.aut)}`,'AF','hmn');
      e.p='PUBLICADO';e.pub=S.today;H(e,`Publicado en Bazar de Activos · solo colaboradores de ${e.MUNICIPIO}`,'AF','hmn');
      log('POST','/products','pub',{sku:e.ID_ACTIVO,name:eqName(e),price:e.price.aut,stock:1,audience:{segmentation:'Ciudad',items:[e.MUNICIPIO]},pickup:e.CLINICA,buyUrl:'https://activo360.salud-digna.interno/comprar/'+e.ID_ACTIVO},'Alta del equipo en el Bazar, visible solo para su ciudad.');
      log('POST','/posts','pub',{body:`Nuevo en el Bazar de Activos: ${eqName(e)} en ${e.CLINICA}`,audience:{segmentation:'Ciudad',items:[e.MUNICIPIO]},pinnedUntil:addD(S.today,7)},'Publicación en el muro de la ciudad, fijada 7 días.');
      notify('Colaboradores de '+e.MUNICIPIO,`Nuevo en el Bazar de Activos: ${eqName(e)} · ${money(e.price.aut)}`)}}
  if(r.type==='DECISION'){
    if(act==='pct'||act==='amt'){const nv=act==='pct'?r50(e.price.aut*(1-val/100)):r50(val);e.price.aut=nv;e.price.adj=true;e.pub=S.today;r.amount=nv;H(e,`Sin venta · Activo Fijo bajó el precio a ${money(nv)}${act==='pct'?` (−${val} %)`:''}`,'AF','hmn');
      log('PUT','/products/'+e.ID_ACTIVO,'pub',{price:nv},'Actualiza el precio en el Bazar.');notify('Colaboradores de '+e.MUNICIPIO,`Bajó de precio en el Bazar: ${eqName(e)} · ${money(nv)}`)}
    if(act==='auc')startAuction(e,val);
    if(act==='dest'){e.p='DESTRUCCION';e.destD=S.today;e.price=null;H(e,'Sin venta · Activo Fijo decidió destruirlo','AF','hmn');log('DELETE','/products/'+e.ID_ACTIVO,'pub',null,'Retira el equipo del Bazar.')}
    if(act==='don'){r.state='Pendiente';startDon(e,val.org,val.fecha)}}
  if(r.type==='DEPOSITO'){if(act==='rej'){e.p='PAGO';e.pay.rej=(e.pay.rej||0)+1;e.pay.dl=addD(S.today,C().plazo.reintento);H(e,`Ingresos no encontró el depósito · el colaborador tiene ${C().plazo.reintento} días naturales para corregir`,'ING','hmn');notify(e.buyer,`Ingresos no encontró tu depósito de ${e.sale.folio}. Revisa tu váucher y vuelve a subirlo antes del ${fd(e.pay.dl)}.`,'req')}
    else{e.pay.ok=true;e.p='FACTURA';H(e,'Ingresos confirmó el depósito · el equipo sale del stock','ING','hmn');const st=clinicStock(e.CLINICA);notify(e.buyer,`Ingresos confirmó tu pago de ${e.sale.folio}. Facturación prepara tu factura.`,'info');
      log('PUT','/products/'+e.ID_ACTIVO,'pub',{status:'VENDIDO',clinicStock:{clinic:e.CLINICA,available:st.disp,frozen:st.cong,sold:st.vend}},'Actualiza el stock del Bazar de la clínica.');
      log('DELETE','/products/'+e.ID_ACTIVO,'pub',null,'Retira el equipo vendido del Bazar.');newReq('FACTURA',e,{amount:e.pay.amount})}}
  save();render();toast(`${r.id} ${r.state.toLowerCase()} · ${ST[e.p][0]}`)}
after.hgestion=()=>{
  $$('[data-ht]').forEach(b=>b.onclick=()=>{S.hmTab=b.dataset.ht;render()});
  $$('[data-ap]').forEach(b=>b.onclick=()=>resolve(b.dataset.ap,'ap'));
  $$('[data-rej]').forEach(b=>b.onclick=()=>resolve(b.dataset.rej,'rej'));
  $$('[data-mod]').forEach(b=>b.onclick=()=>{const v=+$('#m-'+b.dataset.mod).value;if(!(v>=50)){toast('Escribe el nuevo precio (mínimo $50)');return}resolve(b.dataset.mod,'mod',v)});
  $$('[data-dpc]').forEach(b=>b.onclick=()=>{const v=+$('#pc-'+b.dataset.dpc).value;if(!(v>0&&v<100)){toast('Escribe un porcentaje entre 1 y 99');return}resolve(b.dataset.dpc,'pct',v)});
  $$('[data-dpa]').forEach(b=>b.onclick=()=>{const v=+$('#pa-'+b.dataset.dpa).value;if(!(v>=50)){toast('Escribe el nuevo precio (mínimo $50)');return}resolve(b.dataset.dpa,'amt',v)});
  $$('[data-dau]').forEach(b=>b.onclick=()=>{const v=+$('#sm-'+b.dataset.dau).value;if(!(v>=50)){toast('El precio mínimo de subasta es $50');return}resolve(b.dataset.dau,'auc',v)});
  $$('[data-dde]').forEach(b=>b.onclick=()=>resolve(b.dataset.dde,'dest'));
  $$('[data-ddo]').forEach(b=>b.onclick=()=>{const id=b.dataset.ddo,f=$('#df-'+id).value;if(!f||f<S.today){toast('Elige una fecha a partir de hoy');return}resolve(id,'don',{org:$('#do-'+id).value,fecha:f})});
  $$('[data-dfac]').forEach(inp=>inp.onchange=()=>{if(!inp.files[0])return;attachDonFact(S.items[+inp.dataset.dfac],inp.files[0].name);save();render();toast('Factura adjunta · Fiscal recibió el correo')});
};
VIEWS.hbazar=()=>{
  const vis=S.items.filter(e=>['PUBLICADO','SUBASTA'].includes(e.p)||FROZEN.includes(e.p));const cs=[...new Set(vis.map(e=>e.MUNICIPIO))].sort();
  if(!S.city||!cs.includes(S.city))S.city=cs.slice().sort((a,b)=>vis.filter(e=>e.MUNICIPIO===b).length-vis.filter(e=>e.MUNICIPIO===a).length)[0]||'';
  const list=vis.filter(e=>e.MUNICIPIO===S.city).sort((a,b)=>(FROZEN.includes(a.p)?1:0)-(FROZEN.includes(b.p)?1:0));
  const clins=[...new Set(S.items.filter(e=>e.MUNICIPIO===S.city).map(e=>e.CLINICA))];
  const disp=list.filter(e=>!FROZEN.includes(e.p)).length;
  if(!S.meClinic||!clins.includes(S.meClinic))S.meClinic=clins.slice().sort((x,y)=>clinicStock(y).disp-clinicStock(x).disp)[0];
  return `<div><h1>Bazar de Activos</h1><p class="sub">Publicación automática en Humand, segmentada por ciudad. Al dar “Comprar”, el equipo se congela a nombre del colaborador; cuando Ingresos confirma el depósito, sale del stock de la clínica.</p></div>
  ${hmFrame(`<div class="post" style="margin-bottom:14px"><div class="avatar">SD</div><div style="min-width:0"><div class="row"><b>Comunicación Interna</b><span class="pill p-hm">Fijado en el muro</span></div><p style="margin:4px 0">¡El Bazar de Activos de <b>${esc(S.city||'tu ciudad')}</b> tiene ${disp} equipos de cómputo disponibles! Precios especiales para colaboradores. Se recogen en la clínica indicada.</p><span class="note">Publicado automáticamente por Activo 360 · audiencia: colaboradores de ${esc(S.city)}</span></div></div>
   <div class="hm-frame"><div class="bazar-hero"><div><h2>Bazar de<br>activos</h2></div><div class="pc-art" aria-hidden="true"><div></div></div></div>
   <div style="padding:16px;text-align:center"><p style="margin:0 0 6px">Bienvenido a nuestro <b style="color:var(--sd)">Bazar de Activos</b></p><p style="margin:0"><span class="hl">Revisa que el artículo esté en tu ciudad y te sea fácil recogerlo en el centro de trabajo indicado.</span></p><p style="margin:8px 0 0"><span class="hl">Recuerda que no se generan envíos.</span></p></div></div>
   <div class="row" style="margin:16px 0 10px"><h2>Stock por clínica</h2><span class="sp"></span><label class="note" for="city">Ciudad</label><select id="city">${cs.map(c=>`<option ${c===S.city?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
   <div class="tbl"><table><tr><th>Clínica</th><th class="n">Disponibles</th><th class="n">Congelados</th><th class="n">Vendidos</th></tr>${clins.map(c=>{const s=clinicStock(c);return `<tr><td>${esc(c)}</td><td class="n"><b>${s.disp}</b></td><td class="n">${s.cong}</td><td class="n">${s.vend}</td></tr>`}).join('')}</table></div>
   <div class="row" style="margin:16px 0 10px"><h2>Artículos</h2><span class="sp"></span><label class="note" for="mecl">Tu clínica</label><select id="mecl">${clins.map(c=>`<option ${c===S.meClinic?'selected':''}>${esc(c)}</option>`).join('')}</select></div>
   <p class="note" style="margin:-4px 0 10px">Reglas: solo colaboradores · ${C().max?`máximo ${C().max} equipo(s) por colaborador al año · `:''}prioridad de ${C().prio} días para el personal de la clínica donde está el equipo${C().bloqDev?' · no pueden comprar colaboradores con devoluciones pendientes':''}.</p>
   <div class="prods">${list.map(e=>{if(FROZEN.includes(e.p))return `<div class="prod frozen"><div class="row"><span class="pill p-warn">En proceso de compra</span></div><b>${esc(eqName(e))}</b><div class="spec">${esc(e.ID_ACTIVO)} · ${esc(e.CLINICA)}</div><div class="price">${money(e.pay?.amount)}</div><div class="spec">Congelado mientras se completa la compra. Si no se concreta, vuelve a estar disponible.</div><button class="btn" disabled>No disponible</button></div>`;
     const cp=curPrice(e);return `<div class="prod"><div class="row"><span class="pill ${cp.auction?'p-bad':e.price.adj?'p-warn':'p-sd'}">${cp.auction?'Subasta · cierra '+fd(e.auc.end):e.price.adj?'Bajó de precio':'Precio autorizado'}</span></div><b>${esc(eqName(e))}</b><div class="spec">${e.PROCESADOR?esc(e.PROCESADOR)+' · '+e.RAM_GB+' GB · '+(e.dx?.disco==='retirado'?'sin disco':esc(e.ALMACENAMIENTO))+'<br>':''}${tipo(e)==='Escritorio'?(e.dx?.monitor==='no'?'Sin monitor':esc(e.MONITOR))+' · ':''}estética ${e.dx?.estetica||'A'}</div>
     <div>${!cp.auction&&e.price?.lista>cp.v?`<span class="list-pr">${money2(e.price.lista)}</span> `:''}<span class="price">${cp.auction?(cp.bids?'mejor oferta '+money(cp.v):'desde '+money(e.auc.min)):money2(cp.v)}</span>${!cp.auction&&e.price?.lista>cp.v?`<div class="note">Precio colaborador · opción ${e.price.opt} (−${e.price.dc}% adicional)</div>`:''}</div><div class="spec">Recoger en <b>${esc(e.CLINICA)}</b> · ${esc(e.ID_ACTIVO)}</div>${(()=>{const cb=canBuy(e);return cb.ok?`<button class="btn h" data-buy="${e._i}">${cp.auction?'Ofertar':'Comprar'}</button>`:`<button class="btn" disabled>${esc(cb.msg)}</button>`})()}</div>`}).join('')||'<p class="note">No hay equipos publicados en esta ciudad.</p>'}</div>
   <p class="note" style="margin-top:14px">Si un equipo no se vende en ${C().plazo.sinVenta} días, Activo Fijo decide si baja el precio, lo subasta ${C().plazo.subasta} días hábiles, lo dona o lo destruye.</p>`,'Vista: colaborador')}`;
};
after.hbazar=()=>{$('#city')&&($('#city').onchange=e=>{S.city=e.target.value;S.meClinic=null;render()});$('#mecl')&&($('#mecl').onchange=e=>{S.meClinic=e.target.value;render()});$$('[data-buy]').forEach(b=>b.onclick=()=>{S.buyId=+b.dataset.buy;S.fisDraft=null;go('compra')})};
VIEWS.hfirma=()=>{const pend=Object.entries(S.cartas).map(([emp,L])=>[emp,L[L.length-1]]).filter(([e,v])=>v.st==='Pendiente de firma');
  const firm=Object.entries(S.cartas).flatMap(([emp,L])=>L.filter(v=>v.signed).map(v=>[emp,v])).sort((a,b)=>a[1].signed<b[1].signed?1:-1).slice(0,12);
  const fr=S.reqs.filter(r=>['FIRMA_COL','FIRMA_JEFE'].includes(r.type)&&r.state==='Pendiente');
  const TI=S.mod==='ti';
  return `<div><h1>${TI?'Firma de carta responsiva':'Firma del formato de compra'}</h1><p class="sub">${TI?'Cada colaborador recibe en Humand su carta responsiva consolidada (SGC-N4-347) para firma electrónica. Al firmar, se resguarda y la anterior queda como histórica.':`En Humand se firma el formato de compra SGC-N4-60: primero el colaborador y luego su jefe inmediato, en ${C().plazo.firmas} día hábil. Al firmar, el colaborador recibe los datos bancarios.`}</p></div>
  ${hmFrame(`${TI?'':`<h2 style="margin:0 0 10px">Formatos de compra por firmar</h2><div class="tbl"><table><tr><th>Firma</th><th>Documento</th><th>Enviado</th><th>Vence</th><th>Acción</th></tr>${fr.map(r=>{const e=S.items[r.eq];return `<tr><td><b>${esc(r.type==='FIRMA_COL'?e.buyer.split(' · ')[0]:e.sale.jefe)}</b><div class="note">${r.type==='FIRMA_COL'?'Colaborador':'Jefe inmediato de '+esc(e.buyer.split(' · ')[0])}</div></td><td>Formato SGC-N4-60<div class="note mono">${e.sale.folio}</div><div class="note">${esc(eqName(e))} · ${money(e.pay.amount)}</div></td><td class="mono">${fd(r.created)}</td><td class="mono">${fd(e.sale.firmDl)}</td><td><div class="row" style="gap:4px"><button class="btn sm" data-fsee="${r.id}">Ver</button><button class="btn sm h" data-fsig="${r.id}">Firmar</button></div></td></tr>`}).join('')||'<tr><td colspan="5" class="note">No hay formatos pendientes.</td></tr>'}</table></div>`}
   ${TI?`<h2 style="margin:0 0 10px">Cartas responsivas pendientes</h2><div class="tbl"><table><tr><th>Colaborador</th><th>Documento</th><th>Enviado</th><th class="n">Recordatorios</th><th>Acción</th></tr>${pend.map(([emp,v])=>{const c=colOf(emp);return `<tr><td><b>${esc(c?.name)}</b><div class="note">${emp} · ${esc(c?.area)}</div></td><td>Carta responsiva v${v.v}<div class="note mono">${v.folio} · ${v.items.length} activos</div><div class="note">${esc(v.motivo)}</div></td><td class="mono">${fd(v.d)}</td><td class="n">${v.rem}${v.rem>=3?' <span class="pill p-bad">Escalado</span>':''}</td><td><div class="row" style="gap:4px"><button class="btn sm" data-see="${emp}">Ver</button><button class="btn sm h" data-sign="${emp}">Firmar</button></div></td></tr>`}).join('')||'<tr><td colspan="5" class="note">No hay documentos pendientes.</td></tr>'}</table></div>
   <details style="margin-top:16px"><summary>Cartas firmadas recientemente</summary><div class="tbl" style="margin-top:8px"><table>${firm.map(([emp,v])=>`<tr><td>${esc(colOf(emp)?.name)}</td><td class="mono">${v.folio}</td><td>${cpill(v.st)}</td><td class="mono note">${fd(v.signed)}</td></tr>`).join('')}</table></div></details>`:''}`,'Vista: colaborador')}`};
function signForm(id){const r=S.reqs.find(x=>x.id===id),e=S.items[r.eq];
  log('GET','/documents/{id} (estado de firma)','req',{document:e.sale.folio,signer:r.type==='FIRMA_COL'?'colaborador':'jefe',signatureStatus:'SIGNED'},'Activo 360 consulta si el formato ya se firmó. Por confirmar con Humand: hoy no hay un GET de documentos.');
  if(r.type==='FIRMA_COL'){signCol(e);toast('Formato firmado · se envió a tu jefe inmediato')}else{signJefe(e);toast('Formato firmado · el colaborador recibió los datos bancarios')}save();render()}
after.hfirma=()=>{
  $$('[data-see]').forEach(b=>b.onclick=()=>{const c=colOf(b.dataset.see),v=curCarta(c.emp);$('#drawer').innerHTML=`<div class="drawer"><div><div class="row"><h2>${v.folio}</h2>${cpill(v.st)}<span class="sp"></span><button class="btn sm" data-close>Cerrar</button></div>${cartaDoc(c,v)}<button class="btn h" id="sgn">Firmar electrónicamente</button></div></div>`;bindClose();$('#sgn').onclick=()=>{sign(c.emp);closeDrawer()}});
  $$('[data-sign]').forEach(b=>b.onclick=()=>sign(b.dataset.sign));
  $$('[data-fsee]').forEach(b=>b.onclick=()=>{const r=S.reqs.find(x=>x.id===b.dataset.fsee),e=S.items[r.eq];$('#drawer').innerHTML=`<div class="drawer"><div><div class="row"><h2>${e.sale.folio}</h2><span class="sp"></span><button class="btn sm" data-close>Cerrar</button></div>${formatoDoc(e)}<button class="btn h" id="fsgn">Firmar electrónicamente</button></div></div>`;bindClose();$('#fsgn').onclick=()=>{closeDrawer();signForm(r.id)}});
  $$('[data-fsig]').forEach(b=>b.onclick=()=>signForm(b.dataset.fsig));
};

function sign(emp){const L=S.cartas[emp],v=L[L.length-1];v.st='Firmada';v.signed=S.today;
  log('GET','/documents/{id} (estado de firma)','req',{employeeInternalId:emp,document:v.folio,signatureStatus:'SIGNED'},'Activo 360 consulta si la carta ya se firmó. Por confirmar con Humand: hoy no hay un GET de documentos.');
  log('POST','https://www.googleapis.com/upload/drive/v3/files','g',{carpeta:'Activo 360 / Cartas responsivas / '+emp,archivo:v.folio+'_firmada.pdf'},'Resguardo de la carta firmada; las versiones anteriores se conservan.');
  notify('Sistemas · Mesa de servicio',`${colOf(emp)?.name} firmó su carta ${v.folio}`);save();render();toast(`Carta ${v.folio} firmada y resguardada`)}
VIEWS.hnotif=()=>`<div><h1>Notificaciones</h1><p class="sub">Lo que cada persona o área recibe en Humand: mensajes del bot de Activo 360 (pendientes, recordatorios, citas, escalamientos), publicaciones del muro y documentos por firmar.</p></div>
 ${hmFrame(`<div class="log">${S.notifs.slice(0,150).map(n=>`<div class="logi row"><span class="pill ${n.kind==='rem'?'p-warn':n.kind==='esc'?'p-bad':n.kind==='req'?'p-hm':'p-info'}">${n.kind==='rem'?'Recordatorio':n.kind==='esc'?'Escalamiento':n.kind==='req'?'Solicitud':'Aviso'}</span><span style="flex:1 1 260px;min-width:0">${esc(n.txt)}<div class="note">Para: ${esc(n.to)}</div></span><span class="mono note">${fd(n.d)}</span></div>`).join('')||'<p class="note">Sin notificaciones.</p>'}</div>`,'Bandeja de notificaciones')}`;

/* ================= INTEGRACIÓN ================= */
VIEWS.integracion=()=>{
  const src={pub:['API pública hoy','p-ok'],req:['Por confirmar con Humand','p-warn'],int:['Activo 360','p-info'],g:['Google Workspace','p-ok']};
  const T=(rows)=>`<div class="tbl" style="margin-top:8px"><table><tr><th>Necesidad</th><th>Cómo se resuelve</th></tr>${rows.map(([a,b])=>`<tr><td>${a}</td><td class="mono" style="font-size:12px">${b}</td></tr>`).join('')}</table></div>`;
  return `<div><h1>Integración técnica</h1><p class="sub">Basada en la API pública de Humand (v1, autenticación <span class="mono">Authorization: Basic {api_key}</span>, lista de IPs permitidas y límite de consultas por minuto) y en la respuesta del equipo de Humand. Activo 360 es un desarrollo interno de Salud Digna.</p></div>
  <div class="card"><h2>Cómo se conecta</h2>
   <div class="flow" style="margin-top:10px"><span class="h">Humand: Bazar, formulario de compra, firmas y avisos</span><em>⇄ API pública ⇄</em><span>Activo 360 (servidor interno + BD)</span><em>⇄ Gmail y Drive ⇄</em><span class="g">Sistemas, Facturación y Fiscal</span></div>
   <p class="note" style="margin-top:10px">Lo que hace el colaborador ocurre en Humand: ve el Bazar, llena el formulario de compra en Gestión de Servicios, firma documentos y recibe avisos. Las aprobaciones de Activo Fijo e Ingresos se hacen en Activo 360, porque Humand no permite que un sistema externo cree solicitudes a nombre de alguien. Como Humand no envía webhooks, Activo 360 consulta cada pocos minutos el estado de los formularios y documentos.</p></div>
  <div class="grid g2">
   <div class="card"><h2>Disponible hoy en la API de Humand</h2>${T([
    ['Publicar, congelar y retirar equipo del Bazar','POST · PUT · DELETE /products'],
    ['Publicación en el muro por ciudad','POST /posts (segmentation, sendNotification)'],
    ['Leer la compra que inicia el colaborador','GET /service-management/service-items/{sid}/tasks · GET /service-management/tasks/{taskId} (formAnswer)'],
    ['Leer el váucher adjunto en el formulario','formAnswer.fileAnswerSources'],
    ['Formato y carta responsiva a firma electrónica','POST /documents (signatureStatus: PENDING, signatureCoordinates)'],
    ['Avisos y recordatorios a una persona','Bot de Activo 360 por chat 1 a 1 (API Marty) · POST /posts con segmentationUsers'],
    ['Prellenar el formato con datos del colaborador','GET /users/{employeeInternalId} · /departments · /job-positions'],
    ['Encuesta de satisfacción','GET /forms/{id}/answers'],
    ['Constancia de no adeudo al expediente','POST /users/{employeeInternalId}/documents/files']])}</div>
   <div class="card"><h2>Lo que Humand confirmó que no es posible</h2><ul style="margin:8px 0 0;padding-left:18px;display:flex;flex-direction:column;gap:6px">
    <li><b>Crear o autocompletar solicitudes</b> desde un sistema externo: por seguridad, el sistema actuaría a nombre de un colaborador. <span class="note">Solución: Activo Fijo e Ingresos aprueban en Activo 360 y la compra la inicia el colaborador en Humand.</span></li>
    <li><b>Webhooks</b>: Humand no avisa cuando algo cambia. <span class="note">Solución: Activo 360 consulta el estado cada pocos minutos.</span></li>
    <li><b>Aprobar o rechazar desde fuera</b>: hoy solo existe para vacaciones (<span class="mono">PUT /time-off/requests/{id}/state</span>). Producto evalúa endpoints nuevos, sin fecha comprometida.</li></ul>
    <h2 style="margin-top:16px">Por confirmar con Humand</h2><ol style="margin:8px 0 0;padding-left:18px;display:flex;flex-direction:column;gap:6px">
    <li>¿<span class="mono">/products</span> maneja precio en pesos o solo puntos de canje?</li>
    <li>¿Hay o habrá un GET para saber si un documento ya se firmó? Mientras tanto, la persona confirma la firma en Activo 360.</li>
    <li>¿Podemos tener un usuario bot para mensajes 1 a 1 (API Marty)?</li>
    <li>¿El jefe inmediato viene en el perfil del usuario?</li></ol></div>
  </div>
  <div class="grid g2">
   <div class="card"><h2>Google Workspace</h2>${T([
    ['Avisos y recordatorios a Sistemas, Facturación ('+MAIL_FAC+') y Fiscal','Gmail API · users.messages.send'],
    ['Carpeta por venta con folio y sus documentos','Drive API · files.create'],
    ['Acceso de las áreas a Activo 360','Inicio de sesión con Google (OIDC)']])}</div>
   <div class="card"><h2>Lo que debe incluir el desarrollo interno</h2><ul style="margin:8px 0 0;padding-left:18px;display:flex;flex-direction:column;gap:5px">
    <li>Servidor y base de datos internos, con inventario de clínicas y de personal.</li>
    <li>Consulta periódica a Humand (formularios y documentos) respetando el límite de consultas.</li>
    <li>Cierre diario: alertas a 3 meses, recordatorios, escalamientos, liberación de equipos sin firmas o sin depósito, pregunta a Activo Fijo a los 15 días sin venta y cierre de subastas.</li>
    <li>Generador de PDF del formato SGC-N4-60 y de la carta SGC-N4-347, con versiones.</li>
    <li>Pantallas de aprobación (Activo Fijo, Ingresos), Facturación, Sistemas y Fiscal.</li>
    <li>API key institucional con IPs permitidas y rotación periódica (<span class="mono">/api-keys/rotate</span>).</li></ul></div>
  </div>
  <div class="card"><div class="row"><h2>Bitácora de integración</h2><span class="note">Llamadas que haría Activo 360 a Humand y Google</span></div>
   <div class="log" style="margin-top:10px">${S.log.slice(0,60).map(l=>`<div class="logi"><div class="row"><span class="meth">${l.m}</span><span class="mono" style="min-width:0;overflow-wrap:anywhere">${esc(l.ep)}</span><span class="sp"></span><span class="pill ${(src[l.src]||src.int)[1]}">${(src[l.src]||src.int)[0]}</span><span class="mono note">${fd(l.d)}</span></div><div class="note" style="margin-top:4px">${esc(l.desc)}</div>${l.body?`<pre>${esc(JSON.stringify(l.body,null,2))}</pre>`:''}</div>`).join('')}</div></div>`;
};

/* ================= REPORTE DE TRAZABILIDAD ================= */
function exportReport(){try{
  const M=metrics(),wb=XLSX.utils.book_new(),Y=M.Y;
  const add=(name,rows,widths)=>{const ws=Array.isArray(rows[0])?XLSX.utils.aoa_to_sheet(rows):XLSX.utils.json_to_sheet(rows.length?rows:[{Sin_datos:''}]);if(widths)ws['!cols']=widths.map(w=>({wch:w}));XLSX.utils.book_append_sheet(wb,ws,name)};
  const lostT=M.perdidoDest+M.perdidoSinSeg+M.perdidoEst;const pendR=S.reqs.filter(r=>r.state==='Pendiente'),resR=S.reqs.filter(r=>r.resD);
  const tiA=S.ast;const pendF=Object.values(S.cartas).filter(L=>L[L.length-1].st==='Pendiente de firma').length;
  const ciclo=M.sold.filter(e=>e.p==='ENTREGADO').map(e=>diff(e.hist[0].d,e.hist[e.hist.length-1].d));
  add('Resumen',[['Activo 360 · Reporte de trazabilidad'],['Corte',fd(S.today)],['Generado por','Activo 360'],[],
   ['VENTA LOCAL DE EQUIPO SUSTITUIDO','Valor'],
   ['Clínicas en directorio',DATA.clinics.length],['Equipos en inventario de clínicas',S.items.length],
   [`Equipos a disponer ${Y} (cumplen vida útil)`,M.yearItems.length],[`Valor potencial ${Y}`,Math.round(M.potencial)],[`Meta de recuperación ${Y} (${META*100}%)`,Math.round(M.meta)],
   [`Recuperado ${Y}`,Math.round(M.recuperado)],['Avance vs meta',+(M.meta?M.recuperado/M.meta:0).toFixed(3)],['En proceso de venta',Math.round(M.proceso)],
   ['Equipos vendidos',M.sold.length],['Equipos destruidos',M.destr.length],['Destruidos estando funcionales',M.destFunc.length],
   ['Dinero no recuperado · destrucción de funcionales',Math.round(M.perdidoDest)],['Dinero no recuperado · sin seguimiento',Math.round(M.perdidoSinSeg)],[`Valor detenido · Bazar +${C().plazo.sinVenta} días`,Math.round(M.perdidoEst)],['Dinero no recuperado · total',Math.round(lostT)],
   ['Equipos sin seguimiento',M.sinSeg.length],['Equipos donados',M.donados.length],['Valor donado estimado',Math.round(M.valDon)],['Cumplimiento de tiempos meta',+M.slaPct.toFixed(3)],['Solicitudes fuera de tiempo hoy',M.fuera],['Residuo electrónico reutilizado (kg)',Math.round(M.kgReus)],['Residuo enviado a destrucción (kg)',Math.round(M.kgDest)],['Tasa de reutilización',+M.tasaReus.toFixed(3)],['Satisfacción promedio (1-5)',+M.sat.toFixed(2)],['Encuestas respondidas',M.surv.length],['Ciclo promedio diagnóstico→entrega (días)',ciclo.length?+(sum(ciclo)/ciclo.length).toFixed(1):''],
   ['Solicitudes pendientes (Humand y correo)',pendR.length],['Correos enviados',S.mails.length],['Solicitudes escaladas',pendR.filter(r=>r.esc).length],
   ['Horas-hombre ahorradas (acumulado)',Math.round(M.hhAhorro)],['Horas por venta · proceso actual',+HHM.toFixed(2)],['Horas por venta · Activo 360',+HHA.toFixed(2)],
   [`Proyección red ${+Y+1} · escritorios`,M.redY1],[`Proyección red ${+Y+1} · recuperación esperada`,Math.round(M.redPot1)],[`Proyección red ${+Y+1} · horas-hombre ahorradas`,Math.round(M.hhAnual)],[],
   ['INVENTARIO TECNOLÓGICO','Valor'],['Activos registrados',tiA.length],['Asignados',tiA.filter(a=>a.estado==='Asignado').length],['Por renovar ≤3 meses',tiA.filter(tiSoon).length],
   ['Pendientes de devolución',tiA.filter(a=>a.estado==='Pendiente de devolución').length],['En almacén',tiA.filter(a=>a.estado==='En almacén').length],['Cartas pendientes de firma',pendF],['Versiones de carta generadas',M.cartasGen]],[52,18]);
  const yrs=[0,1,2,3,4,5].map(k=>String(+Y+k));
  add('Proyección',yrs.map(y=>({Año:+y,Escritorios_que_cumplen_5_años:M.proj[y]||0,Clínicas:DATA.clinics.filter(c=>[5,10].some(k=>addY(c.acq,k).startsWith(y))).length,Aptos_para_venta:Math.round((M.proj[y]||0)*C().aptos),Precio_promedio:Math.round(M.avgDesk),Recuperación_esperada:Math.round((M.proj[y]||0)*M.avgDesk*C().aptos),Horas_hombre_ahorradas:Math.round((M.proj[y]||0)*C().aptos*(HHM-HHA))})),[8,30,10,16,22,22]);
  add('Trazabilidad equipos',S.items.map(e=>{const r=curReq(e),last=e.hist[e.hist.length-1];return{ID_ACTIVO:e.ID_ACTIVO,SERIE:e.NUM_SERIE,TIPO:tipo(e),EQUIPO:`${e.MARCA} ${e.MODELO}`,CLINICA:e.CLINICA,CIUDAD:e.MUNICIPIO,DIVISION:e.DIVISION,SERVICIO:e.SERVICIO,ADQUISICION:e.FECHA_ADQUISICION,FIN_VIDA_UTIL:due(e),ESTATUS:ST[stOf(e)][0],FOLIO_VENTA:e.sale?.folio||'',RESPONSABLE_ACTUAL:e.p&&ownerOf(e)?(ownerOf(e)==='JEFE'?e.sale.jefe:ownerOf(e)==='COL'&&e.buyer?e.buyer:AREAS[ownerOf(e)]):'',SOLICITUD:r?.id||'',DIAS_EN_ETAPA:r?diff(r.created,S.today):last?diff(last.d,S.today):'',RECORDATORIOS:r?.rem??'',DESTINO:e.dx?(destino(e.dx)==='VENTA'?'Venta local':destino(e.dx)==='RECUP'?'Recuperación + destrucción':'Destrucción'):'',VALOR_ESTIMADO:estValue(e),PRECIO_SUGERIDO:e.price?.sug??'',PRECIO_AUTORIZADO:e.price?.aut??'',PRECIO_VENTA:SOLD.includes(e.p)?e.pay?.amount:'',COMPRADOR:e.buyer||'',DATOS_FISCALES:e.sale?fiscalTxt(e.sale.fiscal):'',VAUCHER:e.pay?.file||'',FACTURA:e.fac||'',CITA_ENTREGA:e.cita?e.cita.d+' '+e.cita.h:'',ULTIMO_MOVIMIENTO:last?.d||'',DETALLE:last?.t||''}}));
  add('Bitácora de eventos',S.items.flatMap(e=>e.hist.map(h=>({FECHA:h.d,ID_ACTIVO:e.ID_ACTIVO,CLINICA:e.CLINICA,AREA:AREAS[h.a]||h.a,TIPO:h.k==='rem'?'Recordatorio/escalamiento':h.k==='hmn'?'Acción en Humand':'Registro',EVENTO:h.t}))).sort((a,b)=>a.FECHA<b.FECHA?1:-1));
  add('Solicitudes',S.reqs.map(r=>({FOLIO:r.id,TIPO:RT[r.type].n,AREA:AREAS[RT[r.type].a],CANAL:RT[r.type].ch==='correo'?'Activo 360 · correo':RT[r.type].ch==='firma'?'Firma en Humand':'Activo 360 · bot de Humand',ID_ACTIVO:S.items[r.eq].ID_ACTIVO,CLINICA:S.items[r.eq].CLINICA,MONTO:r.amount??'',CREADA:r.created,ESTADO:r.state,RESUELTA:r.resD||'',DIAS:diff(r.created,r.resD||S.today),RECORDATORIOS:r.rem,ESCALADA:r.esc?'Sí':'No'})));
  add('Tiempos por área',['AF','ING','FAC','SIS','FIS'].map(a=>{const rs=S.reqs.filter(r=>RT[r.type].a===a),done=rs.filter(r=>r.resD),p=rs.filter(r=>r.state==='Pendiente');return{AREA:AREAS[a],RESUELTAS:done.length,DIAS_PROMEDIO_RESOLUCION:done.length?+(sum(done,r=>diff(r.created,r.resD))/done.length).toFixed(1):'',PENDIENTES:p.length,DIAS_PROMEDIO_PENDIENTES:p.length?+(sum(p,r=>diff(r.created,S.today))/p.length).toFixed(1):'',RECORDATORIOS:sum(rs,r=>r.rem),ESCALADAS:rs.filter(r=>r.esc).length}}));
  const g={};S.items.forEach(e=>(g[e.CLINICA]??=[]).push(e));
  add('Por clínica',Object.entries(g).map(([c,l])=>{const n=k=>l.filter(e=>stOf(e)===k).length;return{CLINICA:c,CIUDAD:l[0].MUNICIPIO,DIVISION:l[0].DIVISION,EQUIPOS:l.length,VIGENTES:n('VIGENTE'),ALERTA_3M:n('ALERTA'),CUMPLIERON:n('VENCIDO'),EN_BAZAR:n('PUBLICADO'),CONGELADOS:l.filter(e=>FROZEN.includes(e.p)).length,VENDIDOS:l.filter(e=>SOLD.includes(e.p)).length,DESTRUIDOS:l.filter(e=>DESTR.includes(e.p)).length,ESPERADO:Math.round(sum(l.filter(e=>due(e)<=Y+'-12-31'||SOLD.includes(e.p)||DESTR.includes(e.p)||DON.includes(e.p)),estExp)*META),RECUPERADO:sum(l.filter(e=>SOLD.includes(e.p)),e=>e.pay?.amount||0)}}));
  add('Destrucción',M.destr.map(e=>({ID_ACTIVO:e.ID_ACTIVO,CLINICA:e.CLINICA,CIUDAD:e.MUNICIPIO,TIPO:tipo(e),FECHA:e.destD||'',ESTATUS:ST[e.p][0],FUNCIONAL:e.dx?.enciende==='si'?'Sí':'No',COMPONENTES_RECUPERADOS:(e.dx?.comp||[]).join(', '),VALOR_PERDIDO:e.dx?.enciende==='si'?priceCalc(e,e.dx).sug:0,CERTIFICADO:(e.hist.find(h=>/certificado/i.test(h.t))?.t||'').replace(/.*certificado /,'').split(' ')[0]})));
  add('Inventario tecnológico',S.ast.map(a=>{const c=colOf(a.emp);return{NUM_INVENTARIO:a.inv,TIPO:a.tipo,MARCA:a.marca,MODELO:a.modelo,SERIE:a.serie,NUM_EMPLEADO:a.emp||'',COLABORADOR:c?.name||'',AREA:c?.area||'',UBICACION:c?.ubi||'',ENTREGA:a.entrega||'',RENOVACION:a.entrega&&a.emp?tiDue(a):'',ESTADO:a.estado,POR_RENOVAR:tiSoon(a)?'Sí':'',RESPONSABLE_ENTREGA:a.resp}}));
  add('Cartas responsivas',Object.entries(S.cartas).flatMap(([emp,L])=>L.map(v=>({FOLIO:v.folio,NUM_EMPLEADO:emp,COLABORADOR:colOf(emp)?.name||'',VERSION:v.v,EMITIDA:v.d,MOTIVO:v.motivo,ACTIVOS:v.items.length,DETALLE:v.items.map(i=>i.tipo+' '+i.inv).join('; '),ESTADO:v.st,FIRMADA:v.signed||'',RECORDATORIOS:v.rem}))));
  add('Movimientos',S.movs.map(m=>({FECHA:m.d,MOVIMIENTO:m.tipo,NUM_EMPLEADO:m.emp,COLABORADOR:colOf(m.emp)?.name||'',NUM_INVENTARIO:m.inv,ACTIVO:m.activo,DETALLE:m.det,MOTIVO:m.motivo,RESPONSABLE:m.resp})));
  add('Tiempos meta',S.reqs.map(r=>({FOLIO:r.id,TIPO:RT[r.type].n,AREA:AREAS[RT[r.type].a],META_DIAS:slaOf(r),CREADA:r.created,RESUELTA:r.resD||'',DIAS:reqDays(r),CUMPLE:slaOk(r)?'Sí':'No',ESTADO:r.state})));
  add('Encuestas',S.items.filter(e=>e.survey).map(e=>({ID_ACTIVO:e.ID_ACTIVO,CLINICA:e.CLINICA,COLABORADOR:e.buyer,FECHA:e.survey.d,PROCESO_COMPRA:e.survey.q[0],TIEMPO_ENTREGA:e.survey.q[1],ESTADO_EQUIPO:e.survey.q[2],PROMEDIO:+(sum(e.survey.q)/3).toFixed(2),COMENTARIO:e.survey.c})));
  add('Donación',S.items.filter(e=>e.don).map(e=>({ID_ACTIVO:e.ID_ACTIVO,CLINICA:e.CLINICA,TIPO:tipo(e),DONATARIA:e.don.org,ESTATUS:ST[e.p]?.[0]||'',FECHA_PROGRAMADA:e.don.fecha||'',FECHA_ENTREGA:e.don.d||'',FACTURA_DONATARIA:e.don.factura||'',REVISION_FISCAL:e.don.fiscal||'',VALOR_ESTIMADO:estValue(e),KG:kgOf(e)})));
  add('Configuración',[['Parámetro','Valor'],...Object.entries(S.cfg).flatMap(([k,v])=>typeof v==='object'&&!Array.isArray(v)?Object.entries(v).map(([k2,v2])=>[k+'.'+k2,v2]):[[k,Array.isArray(v)?v.join(' | '):v]])],[40,60]);
  add('Correos',S.mails.map(m=>({FECHA:m.d,PARA:m.to,ASUNTO:m.subj,ID_ACTIVO:m.eq!=null?S.items[m.eq].ID_ACTIVO:'',MENSAJE:m.body})));
  add('Integración',S.log.map(l=>({FECHA:l.d,METODO:l.m,ENDPOINT:l.ep,DESCRIPCION:l.desc,DATOS:l.body?JSON.stringify(l.body):''})));
  try{const ws=XLSX.utils.json_to_sheet(asExportRows(),{header:[...AS_COLS(),'ESTATUS ACTIVO 360','PRECIO AUTORIZADO','FOLIO VENTA']});XLSX.utils.book_append_sheet(wb,ws,'AppSheet (estatus)')}catch(_){}
  const name=`Activo360_trazabilidad_${S.today}.xlsx`;XLSX.writeFile(wb,name);toast('Descargando '+name)}catch(err){toast('No se pudo generar el reporte en esta vista')}}

/* ---------- Eventos globales ---------- */
document.addEventListener('click',ev=>{if(ev.target.closest('[data-rep]')){admT(false);exportReport();return}const t=ev.target.closest('[data-v],[data-go],[data-eq]');if(!t)return;
  if(t.dataset.v)go(t.dataset.v);else if(t.dataset.go)go(t.dataset.go);else if(t.dataset.eq!=null&&!ev.target.closest('button,input,select'))openEq(+t.dataset.eq)});
const admT=v=>{$('#admm').hidden=!v;$('#admb').setAttribute('aria-expanded',String(v))};$('#admb').onclick=ev=>{ev.stopPropagation();admT($('#admm').hidden)};document.addEventListener('click',ev=>{if(!ev.target.closest('.adm'))admT(false)});
$$('#mods [data-modulo]').forEach(b=>b.onclick=()=>setMod(b.dataset.modulo));
const THK='activo360-tema';const sysDark=()=>window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches;
function curTheme(){return document.documentElement.dataset.theme||(sysDark()?'dark':'light')}
function paintThm(){const d=curTheme()==='dark';$('#thm').innerHTML=d?'<span aria-hidden="true">☀</span> Modo claro':'<span aria-hidden="true">☾</span> Modo oscuro'}
try{const t=localStorage.getItem(THK);if(t)document.documentElement.dataset.theme=t}catch(e){}
$('#thm').onclick=()=>{const n=curTheme()==='dark'?'light':'dark';document.documentElement.dataset.theme=n;try{localStorage.setItem(THK,n)}catch(e){}paintThm()};paintThm();
$('#d1').onclick=()=>{admT(false);tick(1)};$('#d30').onclick=()=>{admT(false);tick(30)};
$('#reset').onclick=()=>{admT(false);init(true);save();render();toast('Datos restablecidos')};
$('#sim').onclick=()=>{admT(false);if(simulate()){render();toast('Ventas de ejemplo agregadas sobre el inventario')}};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});
load();if(window.A360_SIM&&S.feedStamp&&!S.simDone&&!/^Demo/.test(S.src||''))simulate();render();welcome();TRZ.live=true;
if(GAS)google.script.run.withSuccessHandler(r=>{if(!r)return;if(r.rows&&r.rows.length)S.engs=r.rows.map(x=>({id:String(x[0]),nombre:String(x[1]),correo:String(x[2]),clinicas:String(x[3]).split('|').map(s=>s.trim()).filter(Boolean)}));
  const m=String(r.email||'').toLowerCase(),g=m&&engList().find(x=>String(x.correo).toLowerCase()===m);if(g){S.role='ing';S.asEng=g.id}save();render()}).getIngenieros();
if(GAS&&window.A360_FEED){syncFeed(false);setInterval(()=>syncFeed(false),Math.max(1,+window.A360_POLL||5)*60000);addEventListener('focus',()=>syncFeed(false))}

