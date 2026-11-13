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
idx = idx.replace('<?!= JSON.stringify(feedOn) ?>', 'false').replace('<?!= JSON.stringify(pollMin) ?>', '5').replace('<?!= JSON.stringify(userName) ?>', '"Prueba"')
assert '<?' not in idx.split('<script>')[0]
sim = R + 'dist/_appscript_sim.html'; open(sim, 'w', encoding='utf-8').write(idx)
VIEWS = ['panel', 'alertas', 'clinicas', 'inventario', 'ingeniero', 'seguimiento', 'hgestion', 'facturacion', 'destruccion', 'donacion',
         'fiscal', 'config', 'hbazar', 'compra', 'hfirma', 'hnotif', 'correos', 'integracion', 'ti', 'carta']
bad = 0
with sync_playwright() as p:
    b = p.chromium.launch()
    for f in [R + 'dist/Activo360.html', sim]:
        pg = b.new_page(viewport={'width': 1440, 'height': 900}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + f); pg.wait_for_timeout(1200)
        info = pg.evaluate("""(V)=>{document.querySelector('.hola')?.remove();for(const v of V)go(v);go('panel');
          return {equipos:S.items.length,historicos:S.prev.length,alertas:alerts().length,partes:window.A360_OK||'-',xlsx:typeof XLSX}}""", VIEWS)
        print(os.path.basename(f), info, 'ERRORES:' if errs else 'sin errores', errs[:3])
        bad += len(errs)
    b.close()
os.remove(sim)
sys.exit(1 if bad else 0)
