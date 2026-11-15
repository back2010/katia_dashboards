"""Prueba rápida sin servidor: abre dist/Activo360.html y la versión Apps Script ensamblada,
recorre todas las vistas y falla si hay errores de JavaScript.
Uso: python3 tools/build.py && python3 tools/validate.py
"""
import os, re, sys
from playwright.sync_api import sync_playwright
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
G = R + 'dist/appscript/'
# simula HtmlService: <?!= include('X') ?> y variables de plantilla
idx = open(G + 'Index.html', encoding='utf-8').read()
idx = re.sub(r"<\?!= include\('(\w+)'\); \?>", lambda m: open(G + m.group(1) + '.html', encoding='utf-8').read(), idx)
idx = idx.replace('<?!= JSON.stringify(feedOn) ?>', 'false').replace('<?!= JSON.stringify(pollMin) ?>', '5').replace('<?!= JSON.stringify(userName) ?>', '"Prueba"').replace('<?!= JSON.stringify(simOn) ?>', 'false')
assert '<?' not in idx.split('<script>')[0]
sim = R + 'dist/_appscript_sim.html'; open(sim, 'w', encoding='utf-8').write(idx)
VIEWS = ['pend', 'inventario', 'salidas', 'panel', 'reglas', 'recorrido', 'alertas', 'clinicas', 'ingeniero', 'seguimiento', 'hgestion', 'facturacion',
         'destruccion', 'donacion', 'fiscal', 'config', 'ingenieros', 'hbazar', 'compra', 'hfirma', 'hnotif', 'correos', 'integracion']
ROLES = ['af', 'ingr', 'fac', 'fis', 'sis', 'dir']
bad = 0
with sync_playwright() as p:
    b = p.chromium.launch()
    for f in [R + 'dist/Activo360.html', sim]:
        pg = b.new_page(viewport={'width': 1440, 'height': 900}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + f); pg.wait_for_timeout(1200)
        info = pg.evaluate("""([V,R])=>{document.querySelector('.hola')?.remove();for(const v of V)go(v);
          const pend={};for(const r of R){setRole(r);for(const n of NAVS[r])if(n[0]!=='h')go(n[0]);pend[r]=r==='dir'?'-':tasks().n}
          setRole('ing',engList()[0].id);for(const n of NAVS.ing)go(n[0]);pend.ing=tasks().n;setRole('admin');
          // formularios: abre cada tipo de pendiente y recorre un diagnóstico completo
          const tipos={};for(const q of S.reqs.filter(q=>q.state==='Pendiente'))if(!tipos[q.type]&&['PRECIO','DECISION','VB','DEPOSITO','DONFACT'].includes(q.type)){tipos[q.type]=1;openReq(q.id);closeDrawer()}
          const e=S.items.find(x=>x.p==='CONFIRMADO');S.engClinic=e.CLINICA;S.dxId=e._i;S.dxDraft=null;go('ingeniero');const d=S.dxDraft;d.step=2;render();d.step=3;d.foto=FOTO_EJ;render();sendDx(e,d);
          const rq=S.reqs.find(q=>q.eq===e._i&&q.state==='Pendiente');openReq(rq.id);document.querySelector('#f-ok').click();
          const r2=S.items.find(x=>x.p==='REUSO');fReuso(r2);closeDrawer();const en=S.items.find(x=>x.p==='ENTREGA');if(en){openDelivery(en._i);closeDrawer()}
          const dd=S.items.find(x=>x.p==='DESTRUCCION');if(dd){fRecoleccion(dd);closeDrawer()}const dc=S.items.find(x=>x.p==='RECOLECCION');if(dc){fCert(dc);closeDrawer()}
          const dn=S.items.find(x=>x.p==='DONACION');if(dn){fDonEnt(dn);closeDrawer()}go('salidas');
          setRole('admin');go('recorrido');const esc_=[];for(const x of SCN){for(const m of ['hoy','int']){S.hm=m;S.rec={sc:x[0],k:0,pick:0};openSc();const n=recSteps(recEx(),S.rec).length;for(let k=0;k<n;k++){S.rec.k=k;openSc()}if(m==='hoy')esc_.push(x[0]+':'+n)}}closeDrawer();S.hm='hoy';
          for(const st of ['PUBLICADO','FIRMAS','PAGO','ENTREGADO','REUSADO','DONADO','DESTRUIDO','DEST_VB','CONFIRMADO']){const x=S.items.find(y=>y.p===st);if(x){openEq(x._i);S.rec={eq:x._i,k:null};openSc();closeDrawer()}}
          setRole('af');const pb=S.items.find(y=>y.p==='PUBLICADO'&&y.posted===false);const nPub=tasks().groups?0:0;if(pb){fPublicar(pb);document.querySelector('#f-ok').click()}setRole('admin');go('hfirma');go('compra');go('hbazar');go('panel');
          const flujo={escenarios:esc_.join(' '),publicada:!!(pb&&pb.posted),formularios:Object.keys(tipos).join(','),trasDiagnostico:e.p,precio:e.price&&e.price.aut};
          return {equipos:S.items.length,flujo,pendientes:pend,partes:window.A360_OK||'-',xlsx:typeof XLSX}}""", [VIEWS, ROLES])
        print(os.path.basename(f), info, 'ERRORES:' if errs else 'sin errores', errs[:3])
        bad += len(errs)
    b.close()
os.remove(sim)
sys.exit(1 if bad else 0)
