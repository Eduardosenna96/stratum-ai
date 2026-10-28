"""Inspect original art and write source rectangles; never alter PNG pixels."""
from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parent.parent
im=Image.open(root/'assets/phase-01-complete-atlas.png')
assert im.size==(1254,1254)
rows=[0,249,478,694,854,1032,1254]
names=[['wharf','wooden-pier','crane','cargo-warehouse','cargo-stack','dock-stairs'],['storefront','balcony-house','street-arch','stone-stairs','fountain-lamp','courtyard-gate'],['slate-roof','terrace','chimneys','fire-escape','clocktower','roof-connector'],['stone-bridge','steel-span','broken-bridge','canal-lock','drain','bridge-railing'],['factory-roof','boiler','catwalk','lift','exhaust-pipes','factory-wall'],['terminal-gate','control-mechanism','reactor','tunnel','arena-wall','shadow-alcove']]
frames={}
for row in range(6):
 for col in range(6):
  x=col*209;y=rows[row];w=209;h=rows[row+1]-y
  a=im.getchannel('A').crop((x,y,x+w,y+h))
  box=a.point(lambda v:255 if v>75 else 0).getbbox() or (0,0,w,h)
  frames[names[row][col]]={'x':x+box[0],'y':y+box[1],'w':box[2]-box[0],'h':box[3]-box[1]}
(root/'assets/phase-01-atlas.json').write_text(json.dumps(frames,indent=2)+'\n')
(root/'assets/phase-01-atlas.js').write_text('/* Explicit row boundaries for the approved irregular atlas. */\nwindow.SHADOWMAN_PHASE_ATLAS='+json.dumps(frames,separators=(',',':'))+';\n')
print('36 source rectangles derived from explicit irregular rows; original PNG unchanged.')
