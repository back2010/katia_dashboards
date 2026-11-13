"""Genera el inventario DEMO (inventado) en formato AppSheet, 50 clínicas -> src/data/appsheet_demo.json
Uso: python3 tools/gen_demo_data.py   (semilla fija: siempre produce los mismos datos)
"""
import json, random, re, sys
from datetime import date, timedelta, datetime

random.seed(20261103)
import os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
CL = json.load(open(R + 'src/data/clinicas.json', encoding='utf-8'))

COLS = ["CENTRO DE TRABAJO","AREA","UBICACIÓN","ESTATUS","# DE SERIE NUEVO EQUIPO","# DE TICKET","DISPOSITIVO","SistemaOperativo","MARCA","MODELO","DISCO DURO (HDD, SSD)","RAM(GB)","PROCESADOR","INSTALACION","FIN DE GARANTIA","# DE SERIE","MODIFICADO EL:","USUARIO","RESPONSIVA","DIRECCION IP","Requisicion","Historial de cambios","PERTENECE A:","Related EquiposADestruirs","Related EquiposADestruirs By DISPOSITIVO","Related Requisiciones By # DE SERIE_requi","Related Requisiciones By SerieNuevoEquipo","Related EquiposParaValidars","ZONA"]

# --- 50 clínicas: las del archivo real + mezcla por división (abiertas antes de 2021)
must = ['CULIACAN','CULIACAN CAÑADAS','CULIACAN COLEGIO MILITAR','CULIACAN LAS TORRES','CULIACAN NAKAYAMA','CULIACAN UNIVERSITARIOS','CULIACAN LA CONQUISTA','GUADALAJARA CIRCUNVALACION','GUADALAJARA TETLAN']
byn = {c['n']: c for c in CL}
sel = [byn[n] for n in must if n in byn]
quota = {'NOROESTE': 4, 'NORTE': 9, 'BAJIO': 8, 'CENTRO': 11, 'SUR': 9}
pool = [c for c in CL if c['n'] not in must and c['ap'] < '2021-01-01' and c['dv'] in quota]
random.shuffle(pool)
for c in pool:
    if quota.get(c['dv'], 0) > 0 and len(sel) < 50:
        sel.append(c); quota[c['dv']] -= 1
assert len(sel) == 50, len(sel)

# --- catálogo por época
CAT = {
 'old12': [('HP','Compaq 6200 Pro SFF PC','Intel(R) Core(TM) i3-2120 CPU @ 3.30GHz',['HDD 500GB','SSD 120GB'],['4GB RAM'])],
 'old14': [('HP','EliteDesk 705 G1 SFF','AMD A6 PRO-7400B R5, 6 Compute Cores 2C+4G',['SSD 120GB','HDD 500GB'],['4GB RAM']),
           ('HP','EliteDesk 705 G1 SFF','AMD A8-6500B APU with Radeon(tm) HD Graphics',['HDD 500GB'],['4GB RAM'])],
 'old16': [('HP','EliteDesk 705 G2 SFF','AMD PRO A6-8550B R5, 6 Compute Cores 2C+4G',['SSD 120GB'],['4GB RAM','8GB RAM']),
           ('HP','ProDesk 600 G2 SFF','Intel(R) Core(TM) i5-6500 CPU @ 3.20GHz',['SSD 120GB'],['8GB RAM'])],
 'old17': [('HP','EliteDesk 705 G3 SFF','AMD PRO A6-9500 R5, 8 COMPUTE CORES 2C+6G',['SSD 120GB','SSD 240GB'],['4GB RAM','8GB RAM'])],
 'old19': [('HP','EliteDesk 705 G4 SFF','AMD Ryzen 3 PRO 2200G with Radeon Vega Graphics',['SSD 240GB'],['8GB RAM']),
           ('HP','EliteDesk 705 G5 SFF','AMD Ryzen 3 PRO 3200G with Radeon Vega Graphics',['SSD 240GB'],['8GB RAM'])],
 2020: [('HP','EliteDesk 705 G5 SFF','AMD Ryzen 3 PRO 3200G with Radeon Vega Graphics',['SSD 240GB'],['8GB RAM']),
        ('HP','ProDesk 405 G6 Small Form Factor PC','AMD Ryzen 3 PRO 4350G with Radeon Graphics',['SSD 240GB'],['8GB RAM'])],
 2021: [('HP','ProDesk 405 G6 Small Form Factor PC','AMD Ryzen 3 PRO 4350G with Radeon Graphics',['SSD 240GB'],['8GB RAM']),
        ('HP','ProDesk 400 G7 Small Form Factor PC','Intel(R) Core(TM) i3-10100 CPU @ 3.60GHz',['SSD 240GB'],['8GB RAM']),
        ('LENOVO','ThinkCentre M75q Gen 2','AMD Ryzen 3 PRO 5350GE RG a 3.60MHz',['M.2 240GB'],['8GB RAM'])],
 2022: [('HP','ProDesk 400 G7 Small Form Factor PC','Intel(R) Core(TM) i3-10100 CPU @ 3.60GHz',['SSD 240GB'],['8GB RAM']),
        ('LENOVO','ThinkCentre M75q Gen 2','AMD Ryzen 3 PRO 5350GE RG a 3.60MHz',['M.2 240GB'],['8GB RAM']),
        ('LENOVO','ThinkCentre M70s Gen 3 11T7S4US00','12th Gen Intel(R) Core(TM) i3-12100',['M.2 240GB','SSD 240GB'],['8GB RAM'])],
 2023: [('LENOVO','ThinkCentre M70s Gen 3 11T7S4US00','12th Gen Intel(R) Core(TM) i3-12100',['M.2 240GB','SSD 240GB'],['8GB RAM']),
        ('LENOVO','ThinkCentre M70s Gen3 11T7S8J600','12th Gen Intel(R) Core(TM) i3-12100',['SSD 240GB'],['8GB RAM']),
        ('HP','PRO SFF 280 G9','12th Gen Intel(R) Core(TM) i3-12100',['SSD 240GB'],['8GB RAM'])],
 2024: [('LENOVO','ThinkCentre M70s Gen 4','13th Gen Intel (R) Core(TM) i3-13100 3.40 GHz',['M.2 240GB','SSD 512GB'],['8GB RAM']),
        ('HP','PRO SFF 280 G9','12th Gen Intel(R) Core(TM) i3-12100',['SSD 240GB'],['8GB RAM'])],
 2025: [('LENOVO','ThinkCentre neo 50s Gen 5','Intel i3-14100 3.5GHz/4C/8T/12M 60W',['M.2 240GB','M.2 480GB'],['8GB RAM']),
        ('LENOVO','ThinkCentre M70s Gen 4','Intel(R) Core(TM) i3-14100 (3.50 GHz)',['M.2 240GB'],['8GB RAM'])],
 2026: [('LENOVO','ThinkCentre neo 50s Gen 5','Intel i3-14100 3.5GHz/4C/8T/12M 60W',['M.2 240GB','M.2 480GB'],['8GB RAM']),
        ('HP','PRO SFF 280 G9','Intel(R) Core(TM) i3-14100 (3.50 GHz)',['SSD 240GB'],['8GB RAM'])],
}
WS = [('HP','Z2 SFF G4 Workstation','Intel(R) Core(TM) i5-9400 CPU @ 2.90GHz',['SSD 512GB','SSD 1TB'],['16GB RAM']),
      ('LENOVO','P340 Workstation (ThinkStation) Small Form Factor','Intel(R) Core(TM) i5-10400 CPU @ 2.90GHz',['SSD 512GB'],['16GB RAM'])]

SVC = {'LABORATORIO':[('RECEPCION LABORATORIO',(2,4)),('TOMA DE MUESTRA',(2,3)),('LABORATORIO',(1,2)),('ENTREGA DE RESULTADOS',(1,1))],
       'ULTRASONIDO':[('ULTRASONIDO',(2,3))],'LENTES':[('OPTOMETRIA',(1,2)),('RECEPCION LENTES',(1,1)),('ASESOR DE LENTES',(0,1)),('TALLER DE LENTES',(0,1))],
       'RAYOS X':[('RAYOS X',(1,1))],'MASTOGRAFIA':[('MASTOGRAFIA',(1,1))],'PAPANICOLAOU':[('PAPANICOLAOU',(1,1))],'DENSITOMETRIA':[('DENSITOMETRIA',(1,1))],
       'TOMOGRAFIA':[('TOMOGRAFIA',(1,1))],'RESONANCIA MAGNETICA':[('RESONANCIA MAGNETICA',(1,1))],'ELECTROCARDIOGRAMA':[('ELECTROCARDIOGRAMA',(0,1))],'NUTRICION':[('NUTRICION',(0,1))]}
BASE = [('SISTEMAS',(1,1)),('AUXILIAR ADMINISTRATIVO',(1,1)),('ALMACEN',(0,1)),('SITE',(0,1)),('DIGITAL',(0,1)),('TURNERO',(0,1))]
HEAVY = {'TOMOGRAFIA','RESONANCIA MAGNETICA'}

AP = ['LOPEZ','FELIX','MENDOZA','BALLARDO','CAMACHO','RUIZ','GARCIA','SOTO','RAMIREZ','HERRERA','VALENZUELA','ESPINOZA','ROJAS','CASTRO','IBARRA','ZAZUETA','MEDINA','OCHOA','NAVARRO','GALLEGOS','SALAZAR','QUINTERO','FLORES','AGUILAR','VEGA','TORRES']
NO = ['RICARDO ALONSO','JOSE ANTONIO','JESUS ALBERTO','LUIS FERNANDO','CARLOS EDUARDO','MARIA FERNANDA','DIANA LAURA','JORGE ARMANDO','OMAR ALEJANDRO','KARLA PATRICIA','ERICK DANIEL','ANA SOFIA','MIGUEL ANGEL','CESAR IVAN','PAOLA GUADALUPE']
engs = []
while len(engs) < 20:
    n = f"{random.choice(AP)} {random.choice(AP)} {random.choice(NO)}"
    if n not in engs: engs.append(n)

used = set()
def serial(marca):
    while True:
        if marca == 'HP':
            s = random.choice(['MXL','4CE','1CZ','8CG']) + ''.join(random.choice('0123456789') for _ in range(4)) + ''.join(random.choice('ABCDEFGHJKLMNPQRSTUVWXYZ0123456789') for _ in range(3))
        else:
            s = random.choice(['MJ0','PC2','MZ0']) + ''.join(random.choice('ABCDEFGHJKLMNPQRSTUVWXYZ0123456789') for _ in range(5))
        if s not in used:
            used.add(s); return s

fmt = lambda d: d.strftime('%d/%m/%Y')
def rdate(y0, m0, y1, m1):
    a = date(y0, m0, 1); b = date(y1, m1, 28)
    return a + timedelta(days=random.randint(0, (b - a).days))
T0 = date(2026, 10, 12)
def modif(after):
    if random.random() < .2: return ''
    d = after + timedelta(days=random.randint(0, max(1, (T0 - after).days)))
    d = min(d, T0)
    return datetime(d.year, d.month, d.day, random.randint(8, 18), random.randint(0, 59), random.randint(0, 59)).strftime('%d/%m/%Y %H:%M:%S')
hexid = lambda: ''.join(random.choice('0123456789abcdef') for _ in range(8))

def yr_pick(ap):
    ys = [2020, 2021, 2022, 2023, 2024, 2025, 2026]
    w = [.02, .17, .17, .17, .17, .2, .1]
    apy = int(ap[:4])
    ws = [x if y >= apy else 0 for y, x in zip(ys, w)]
    return random.choices(ys, ws)[0]

rows = []
for ci, c in enumerate(sel):
    eng = engs[ci % len(engs)] if ci < 40 else engs[ci % 7]
    st = []
    for a, (lo, hi) in BASE: st += [a] * random.randint(lo, hi)
    for s in c['sv']:
        for a, (lo, hi) in SVC.get(s, []): st += [a] * random.randint(lo, hi)
    # recorta a un tamaño realista
    random.shuffle(st)
    st = st[:random.randint(10, 16)]
    st.sort()
    cnt = {}
    for area in st:
        cnt[area] = cnt.get(area, 0) + 1
        ubi = str(cnt[area])
        y = yr_pick(c['ap'])
        if y == 2021: inst = rdate(2021, 4, 2021, 12)
        elif y == 2026: inst = rdate(2026, 1, 2026, 9)
        else: inst = rdate(y, 1, y, 12)
        model = random.choice(WS if area in HEAVY else CAT[y])
        marca, modelo, cpu, disks, rams = model
        status = 'ACTIVO'; nuevo = ''
        r = random.random()
        if y <= 2021 and r < .22:
            status = 'PLAN DE RENOVACION / ENVIADO A CSI'; nuevo = serial('LENOVO')
        elif r > .985:
            status = 'RESGUARDO'
        s = serial(marca)
        row = {k: '' for k in COLS}
        row.update({'CENTRO DE TRABAJO': c['n'], 'AREA': area, 'UBICACIÓN': ubi, 'ESTATUS': status, '# DE SERIE NUEVO EQUIPO': nuevo,
                    'DISPOSITIVO': 'CPU', 'MARCA': marca, 'MODELO': modelo, 'DISCO DURO (HDD, SSD)': random.choice(disks), 'RAM(GB)': random.choice(rams),
                    'PROCESADOR': cpu, 'INSTALACION': fmt(inst), 'FIN DE GARANTIA': fmt(date(inst.year + 3, inst.month, min(inst.day, 28))) if random.random() > .03 else '',
                    '# DE SERIE': s, 'USUARIO': eng if random.random() > .12 else '', 'ZONA': c['dv'],
                    'PERTENECE A:': random.choices(['SALUD DIGNA', '', 'PROVEEDOR'], [.42, .56, .02])[0],
                    'Historial de cambios': ' , '.join(hexid() for _ in range(random.randint(1, 2))) if random.random() < .6 else '',
                    'DIRECCION IP': f"172.{random.randint(1,40)}.{random.randint(1,250)}.{random.randint(20,90)}" if random.random() < .05 else ''})
        if status == 'PLAN DE RENOVACION / ENVIADO A CSI':
            d = T0 - timedelta(days=random.randint(0, 9))
            row['MODIFICADO EL:'] = datetime(d.year, d.month, d.day, random.randint(8, 18), random.randint(0, 59), 0).strftime('%d/%m/%Y %H:%M:%S')
            row['USUARIO'] = eng
        else:
            row['MODIFICADO EL:'] = modif(inst)
        rows.append(row)
        # registro histórico del equipo anterior en esa estación
        if random.random() < .33:
            era = random.choice(['old12', 'old14', 'old16', 'old16', 'old17', 'old17', 'old19'])
            yy = {'old12': 2012, 'old14': 2014, 'old16': 2016, 'old17': 2017, 'old19': 2019}[era]
            if yy < int(c['ap'][:4]): yy = int(c['ap'][:4])
            if yy >= inst.year: continue
            pi = rdate(yy, 1, yy, 12)
            pm = random.choice(CAT[era])
            hs = random.choices(['DESTRUIDO', 'VENDIDO', 'TRANSFERIDO'], [.6, .25, .15])[0]
            h = {k: '' for k in COLS}
            h.update({'CENTRO DE TRABAJO': c['n'], 'AREA': area, 'UBICACIÓN': ubi, 'ESTATUS': hs, 'DISPOSITIVO': 'CPU', 'MARCA': pm[0], 'MODELO': pm[1],
                      'DISCO DURO (HDD, SSD)': random.choice(pm[3]), 'RAM(GB)': random.choice(pm[4]), 'PROCESADOR': pm[2], 'INSTALACION': fmt(pi),
                      'FIN DE GARANTIA': fmt(date(pi.year + 3, pi.month, min(pi.day, 28))), '# DE SERIE': serial(pm[0]),
                      'MODIFICADO EL:': modif(inst), 'USUARIO': eng if random.random() > .3 else '', 'ZONA': c['dv'],
                      'PERTENECE A:': random.choice(['SALUD DIGNA', '']),
                      'Historial de cambios': ' , '.join(hexid() for _ in range(random.randint(1, 2))) if random.random() < .7 else ''})
            if hs == 'DESTRUIDO' and random.random() < .6:
                h['# DE TICKET'] = str(random.choice([random.randint(100080000, 100230000), random.randint(600000, 790000)]))
            rows.append(h)

random.shuffle(rows)
# columnas siempre vacías se conservan en el encabezado (formato real) pero se compactan
out = {'cols': COLS, 'rows': [[r[k] for k in COLS] for r in rows]}
# recorta celdas vacías finales
for rr in out['rows']:
    while rr and rr[-1] == '': rr.pop()
json.dump(out, open(R + 'src/data/appsheet_demo.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
import collections
print(len(rows), collections.Counter(r['ESTATUS'] for r in rows))
print(collections.Counter(r['ZONA'] for r in rows))
act = [r for r in rows if r['ESTATUS'] == 'ACTIVO']
def d(s): dd, mm, yy = map(int, s.split('/')); return date(yy, mm, dd)
due = [d(r['INSTALACION']) for r in act]
print('ACTIVO', len(act), 'venc', sum(1 for x in due if date(x.year + 5, x.month, x.day) <= date(2026, 10, 13)), '<=75d', sum(1 for x in due if date(x.year + 5, x.month, x.day) <= date(2026, 12, 27)))
