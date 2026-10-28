"""Inspect alpha bounds only; original artwork is never modified."""
from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parent.parent
names=['roof-left','roof-middle','roof-right','catwalk','dock','broken-roof','wall','window','double-window','niche','door','tunnel','ladder','bridge-support','chain','pipe','railing','water-tank','lamp','crate','chimney','gargoyle','rift','bollard']
data={'city':{},'drone':[]}
for kind,file in [('city','city-atlas.png'),('drone','drone-atlas.png')]:
 im=Image.open(root/'assets'/file).convert('RGBA');assert im.size==(1536,1024),im.size
 print(file,im.size,'alpha',im.getchannel('A').getextrema())
 for row in range(4):
  for col in range(6):
   x=col*256;y=row*256
   alpha=im.getchannel('A').crop((x,y,x+256,y+256))
   bounds=alpha.point(lambda a:255 if a>75 else 0).getbbox() or (0,0,256,256)
   rect={'x':x+bounds[0],'y':y+bounds[1],'w':bounds[2]-bounds[0],'h':bounds[3]-bounds[1]}
   if kind=='city':data['city'][names[row*6+col]]=rect
   else:data['drone'].append(rect)
(root/'assets/atlases.json').write_text(json.dumps(data,indent=2))
(root/'assets/atlases.js').write_text('/* Source rectangles: derived from alpha, without modifying art. */\nwindow.SHADOWMAN_ASSETS='+json.dumps(data,separators=(',',':'))+';\n')
