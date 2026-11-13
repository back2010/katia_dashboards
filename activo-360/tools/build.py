"""Arma Activo 360 desde src/ -> dist/Activo360.html (un solo archivo) y dist/appscript/ (15 archivos para Apps Script).
Uso: python3 tools/build.py
"""
import base64, json, os, shutil
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
rd = lambda p: open(R + p, encoding='utf-8').read()

shell, css, app = rd('src/shell.html'), rd('src/styles.css'), rd('src/app.js')
xlsx = rd('vendor/xlsx.full.min.js')
clin = json.load(open(R + 'src/data/clinicas.json', encoding='utf-8'))
ash = json.load(open(R + 'src/data/appsheet_demo.json', encoding='utf-8'))
logo = base64.b64encode(open(R + 'src/assets/logo.png', 'rb').read()).decode()
J = lambda o: json.dumps(o, ensure_ascii=True, separators=(',', ':'))

def ascii_js(t):
    """Solo ASCII: el editor de Apps Script corrompe caracteres de control al pegar."""
    out = []
    for c in t:
        o = ord(c)
        if c in '\n\t' or 32 <= o < 127: out.append(c)
        elif o < 0x10000: out.append('\\u%04x' % o)
        else:
            o -= 0x10000; out.append('\\u%04x\\u%04x' % (0xd800 + (o >> 10), 0xdc00 + (o & 0x3ff)))
    return ''.join(out)
xlsx = ascii_js(xlsx).replace('<!--', '<\\!--')
assert '﻿' not in app and '<!--' not in app, 'app.js: quitar BOM o "<!--"'

# ---------- dist/Activo360.html ----------
os.makedirs(R + 'dist/appscript', exist_ok=True)
data_js = 'const DATA = ' + J({'clinics': clin, 'appsheet': ash}) + ';\n'
single = (shell.replace('{{STYLES}}', '<style>\n' + css + '</style>')
               .replace('{{LOGO}}', 'data:image/png;base64,' + logo)
               .replace('{{SCRIPTS}}', '<script>' + xlsx + '</script>\n<script>\n' + data_js + app + '</script>'))
open(R + 'dist/Activo360.html', 'w', encoding='utf-8').write(single)

# ---------- dist/appscript ----------
G = R + 'dist/appscript/'
for f in os.listdir(G): os.remove(G + f)
OK = lambda n: "\n;(window.A360_OK=window.A360_OK||[]).push('%s');\n" % n
files = {'Estilos': '<style>\n' + css + '</style>'}
L = xlsx.split('\n'); n = len(L)
# repartir por tamaño, no por número de líneas
size = [len(l) for l in L]; tot = sum(size); acc = 0; cuts = [0]
for i, sz in enumerate(size):
    acc += sz
    if len(cuts) < 5 and acc >= tot * len(cuts) / 5: cuts.append(i + 1)
cuts.append(n)
# Cada parte va en un <script type="text/plain"> para que HtmlService la acepte como HTML válido
# (createHtmlOutputFromFile rechaza JavaScript suelto); un cargador en Index las une y las ejecuta.
XP = ['\n'.join(L[cuts[k]:cuts[k + 1]]) for k in range(5)]
assert '\n'.join(XP) == xlsx and '</script' not in xlsx.lower()
for k in range(5): files['Xlsx%d' % (k + 1)] = '<script type="text/plain" id="a360-xlsx%d">\n' % (k + 1) + XP[k] + '\n</script>'
XLOAD = ("<script>(function(){var t=[1,2,3,4,5].map(function(k){return document.getElementById('a360-xlsx'+k).textContent.replace(/^\\n/,'').replace(/\\n$/,'')}).join('\\n');"
         "var s=document.createElement('script');s.text=t;document.head.appendChild(s)})();")
rows = ash['rows']; h = len(rows) // 2
files['Datos1'] = '<script>\n/* Activo 360 · Datos1: directorio de clínicas */\nvar A360_CLIN=[\n' + ',\n'.join(J(c) for c in clin) + '\n];' + OK('Datos1') + '</script>'
files['Datos2'] = '<script>\n/* Activo 360 · Datos2: vista AppSheet (parte 1) */\nvar A360_ROWS=[\n' + ',\n'.join(J(r) for r in rows[:h]) + '\n];' + OK('Datos2') + '</script>'
files['Datos3'] = ('<script>\n/* Activo 360 · Datos3: vista AppSheet (parte 2) */\nA360_ROWS=A360_ROWS.concat([\n' + ',\n'.join(J(r) for r in rows[h:])
                   + '\n]);\nconst DATA={clinics:A360_CLIN,appsheet:{cols:' + J(ash['cols']) + ',rows:A360_ROWS}};' + OK('Datos3') + '</script>')
files['Logo'] = ("<script>\n/* Activo 360 · Logo */\ndocument.querySelector('.navlogo').src='data:image/png;base64,'+[\n"
                 + ',\n'.join("'" + logo[k:k + 120] + "'" for k in range(0, len(logo), 120)) + "\n].join('');" + OK('Logo') + '</script>')
A = app.split('\n')
mk = lambda t: next(i for i, l in enumerate(A) if l.startswith(t))
ac = [0, mk('/* ================= INVENTARIO (formato'), mk('/* ================= INVENTARIO TECNOL'), len(A)]
for k in range(3):
    files['App%d' % (k + 1)] = '<script>\n/* Activo 360 · App%d */\n' % (k + 1) + '\n'.join(A[ac[k]:ac[k + 1]]) + OK('App%d' % (k + 1)) + '</script>'
chk = """<script>(function(){var ok=window.A360_OK||[],need=['Xlsx','Datos1','Datos2','Datos3','Logo','App1','App2','App3'],m=need.filter(function(n){return ok.indexOf(n)<0});
if(m.length){var d=document.createElement('div');d.setAttribute('style','position:fixed;left:16px;right:16px;top:16px;z-index:999;padding:16px 18px;border-radius:16px;background:#fde5e1;color:#7a1d12;border:1px solid #c0392b;font:14px/1.45 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.2)');
d.innerHTML='<b>Activo 360 no cargó completo.</b> Vuelve a pegar completo (de principio a fin) y guarda: <b>'+m.map(function(n){return n==='Xlsx'?'Xlsx1 a Xlsx5':n}).join(', ')+'</b>. Después crea una nueva versión de la implementación.';document.body.appendChild(d)}})();</script>"""
scripts = ("<script>window.A360_FEED=<?!= JSON.stringify(feedOn) ?>;window.A360_POLL=<?!= JSON.stringify(pollMin) ?>;window.A360_USER=<?!= JSON.stringify(userName) ?>;</script>\n"
           + "\n".join("<?!= include('Xlsx%d'); ?>" % k for k in range(1, 6)) + "\n" + XLOAD + OK('Xlsx') + "</script>\n"
           + "\n".join("<?!= include('%s'); ?>" % n for n in ['Datos1', 'Datos2', 'Datos3', 'Logo', 'App1', 'App2', 'App3']) + "\n" + chk)
files['Index'] = shell.replace('{{STYLES}}', "<?!= include('Estilos'); ?>").replace('{{LOGO}}', '').replace('{{SCRIPTS}}', scripts)
for k, c in files.items():
    open(G + k + '.html', 'w', encoding='utf-8', newline='\n').write(c)
shutil.copy(R + 'appscript/Code.gs', G + 'Code.gs')
for k in ['Index', 'Estilos'] + ['Xlsx%d' % i for i in range(1, 6)] + ['Datos1', 'Datos2', 'Datos3', 'Logo', 'App1', 'App2', 'App3']:
    print(f"{k:<8} {len(files[k].encode()) // 1024:>4} KB")
print('dist/Activo360.html', len(single.encode()) // 1024, 'KB')
