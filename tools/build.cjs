/* Build one offline HTML plus a source archive. No packages or network required. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
let html=read('docs/archive/index-v05.html'),js=read('game.js');
for(const name of ['shadowman.png','storyboard-clean.png','drone-atlas.png']){
 const image=fs.readFileSync(path.join(root,'assets',name)).toString('base64');
 js=js.replace("'assets/"+name+"'",JSON.stringify('data:image/png;base64,'+image));
}
for(const name of ['assets/atlases.js','level.js'])html=html.replace('<script src="'+name+'"></script>','<script>'+read(name)+'</script>');
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+read('style.css')+'</style>');
html=html.replace('<script src="game.js"></script>','<script>'+js.replace(/<\/script/gi,'<\\/script')+'</script>');
fs.mkdirSync(path.join(root,'dist'),{recursive:true});
fs.writeFileSync(path.join(root,'dist/Shadowman.html'),html);
const hash=crypto.createHash('sha256').update(html).digest('hex');
fs.writeFileSync(path.join(root,'dist/SHA256SUMS'),hash+'  Shadowman.html\n');
console.log(`Build offline: dist/Shadowman.html (${(Buffer.byteLength(html)/1024/1024).toFixed(2)} MiB)\nSHA-256 ${hash}`);
