/* Two deliveries: a small cache-safe web entry and a self-contained offline HTML. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
const source=path.join(root,'prototype/index.html'),siteDir=path.join(root,'dist/city-site');
const sourceHtml=fs.readFileSync(source,'utf8');
fs.rmSync(siteDir,{recursive:true,force:true});fs.mkdirSync(siteDir,{recursive:true});
const manifest=[];
function emit(name,data){const target=path.join(siteDir,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,data);manifest.push({path:name,bytes:Buffer.byteLength(data),sha256:sha(data)});return name;}
const assetCache=new Map();
function asset(relative){
 const file=path.resolve(path.dirname(source),relative);
 const assetRoot=path.join(root,'assets')+path.sep;
 if(!file.startsWith(assetRoot))throw Error('Asset fora da pasta autorizada: '+relative);
 if(!assetCache.has(file)){
  const data=fs.readFileSync(file),ext=path.extname(file),base=path.basename(file,ext),name='assets/'+base+'.'+sha(data).slice(0,12)+ext;
  const mime=({'.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json'})[ext];
  if(!mime)throw Error('Tipo de asset sem MIME: '+ext);
  emit(name,data);assetCache.set(file,{site:name,offline:'data:'+mime+';base64,'+data.toString('base64')});
 }
 return assetCache.get(file);
}
const scriptTag=/<script\b([^>]*?)src=["']([^"']+)["']([^>]*)>\s*<\/script>/gi;
const assetLiteral=/(["'])((?:\.\.\/)?assets\/[^"'\n]+)\1/g;
let offline=sourceHtml;
const web=sourceHtml.replace(scriptTag,(tag,before,relative,after)=>{
 if(/^(?:https?:)?\/\//.test(relative))throw Error('Scripts externos não são permitidos no build independente.');
 const file=path.resolve(path.dirname(source),relative);
 if(!file.startsWith(root+path.sep))throw Error('Script fora do projeto: '+relative);
 const raw=fs.readFileSync(file,'utf8');
 const siteJS=raw.replace(assetLiteral,(all,quote,relative)=>JSON.stringify(asset(relative.startsWith('assets/')?'../'+relative:relative).site));
 const inlineJS=raw.replace(assetLiteral,(all,quote,relative)=>JSON.stringify(asset(relative.startsWith('assets/')?'../'+relative:relative).offline));
 const name=path.basename(file,'.js')+'.'+sha(siteJS).slice(0,12)+'.js';
 emit(name,siteJS);
 offline=offline.replace(tag,'<script>'+inlineJS.replace(/<\/script/gi,'<\\/script')+'</script>');
 return '<script'+before+'src="'+name+'"'+after+'></script>';
});
if(!manifest.some(x=>x.path.endsWith('.js')))throw Error('Nenhum script local encontrado no HTML.');
emit('index.html',web);
fs.writeFileSync(path.join(root,'dist/Shadowman-Cidade.html'),offline);
fs.writeFileSync(path.join(root,'dist/CITY-SHA256SUMS'),sha(offline)+'  Shadowman-Cidade.html\n');
fs.writeFileSync(path.join(root,'dist/city-build.json'),JSON.stringify({entryBytes:Buffer.byteLength(web),offlineBytes:Buffer.byteLength(offline),offlineSha256:sha(offline),files:manifest},null,2)+'\n');
console.log('Cidade · entrada web '+(Buffer.byteLength(web)/1024).toFixed(1)+' KiB · '+assetCache.size+' imagens separadas');
console.log('Offline dist/Shadowman-Cidade.html · '+(Buffer.byteLength(offline)/1048576).toFixed(2)+' MiB · SHA256 '+sha(offline));
