/* Local feedback without AI calls or token consumption. It never edits application code. */
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..');let timer,busy=false,again=false;
function run(){if(busy){again=true;return;}busy=true;const check=spawn(process.execPath,['tests/mechanics.test.cjs'],{cwd:root,stdio:'inherit'});check.on('close',code=>{if(code!==0){busy=false;console.log('Build preservado: corrija os testes antes de reconstruir.');if(again){again=false;run();}return;}const build=spawn(process.execPath,['tools/build.cjs'],{cwd:root,stdio:'inherit'});build.on('close',()=>{busy=false;if(again){again=false;run();}});});}
for(const dir of ['', 'assets','tests','tools'])fs.watch(path.join(root,dir),(event,file)=>{if(!file||!(/\.(js|cjs|html|css|png|json)$/.test(file)))return;clearTimeout(timer);timer=setTimeout(run,350);});
console.log('Shadowman: testes e build automáticos ativos. Ctrl+C encerra. Sem chamadas de IA.');run();
