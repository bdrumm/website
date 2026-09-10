import zipfile,xml.etree.ElementTree as E,json,sys
from pathlib import Path
z=zipfile.ZipFile(sys.argv[1]);ns={'m':'http://schemas.microsoft.com/3dmanufacturing/core/2015/02'}
root=E.fromstring(z.read('3D/3dmodel.model')); parts=[]
for j,f in enumerate(['3D/Objects/object_1.model','3D/Objects/object_2.model']):
 r=E.fromstring(z.read(f));objs=r.findall('.//m:object',ns)
 comps=root.findall('.//m:object',ns)[j].findall('.//m:component',ns)
 for k,o in enumerate(objs):
  vs=[[float(v.get(a)) for a in 'xyz'] for v in o.findall('.//m:vertex',ns)]
  if k==1:
   t=list(map(float,comps[k].get('transform').split()))
   vv=[[sum(v[a]*t[a*3+b] for a in range(3))+t[9+b] for b in range(3)] for v in vs]
   # Undo the body component's bed orientation to place the eye in body coordinates.
   vs=[[v[0],v[2],-v[1]] if j==0 else [-v[0],-v[2],-v[1]] for v in vv]
  vs=[[-x,-zz,y+(18.7579994 if j==0 else -18.7579994)] for x,y,zz in vs]
  ts=[[int(t.get(a)) for a in ['v1','v2','v3']] for t in o.findall('.//m:triangle',ns)]
  parts.append({'name':('Left' if j==0 else 'Right')+(' eye highlight' if k else ' body'),'vertices':vs,'triangles':ts,'eye':k==1,'paint':[t.get('paint_color','') for t in o.findall('.//m:triangle',ns)]})
Path(sys.argv[2]).write_text(json.dumps(parts,separators=(',',':')))
print([(p['name'],len(p['triangles'])) for p in parts])
