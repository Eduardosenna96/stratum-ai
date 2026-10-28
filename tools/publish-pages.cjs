/* Publish only the self-contained game. Never force-push or expose credentials. */
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const run=(cmd,args,input)=>execFileSync(cmd,args,{cwd:root,input,encoding:'utf8',stdio:['pipe','pipe','pipe']}).trim();
const git=(...args)=>run('git',args);
const api=(method,endpoint,body)=>JSON.parse(run('gh',['api','--method',method,endpoint,...(body?['--input','-']:[])],body?JSON.stringify(body):undefined));
function prepare(){
 const city=process.argv.includes('--city');
 console.log(run(process.execPath,[city?'tools/build-city.cjs':'tools/build.cjs']));
 const html=fs.readFileSync(path.join(root,process.argv.includes('--city')?'dist/Shadowman-Cidade.html':'dist/Shadowman.html'));
 const blob=run('git',['hash-object','-w','--stdin'],html);
 const empty=run('git',['hash-object','-w','--stdin'],'');
 const tree=run('git',['mktree'],`100644 blob ${empty}\t.nojekyll\n100644 blob ${blob}\tindex.html\n`);
 let parent='';try{parent=git('rev-parse','--verify','refs/heads/gh-pages');}catch{}
 let sha;if(parent&&git('rev-parse',`${parent}^{tree}`)===tree)sha=parent;
 else sha=run('git',['commit-tree',tree,...(parent?['-p',parent]:[]),'-m','Publish Shadowman static game']);
 git('update-ref','refs/heads/gh-pages',sha);
 console.log('Branch gh-pages preparada:',sha);
 return sha;
}
try{
 prepare();
 if(process.argv.includes('--prepare-only'))process.exit(0);
 console.log(git('push','origin','gh-pages'));
 if(!process.argv.includes('--configure-pages')){console.log('Push enviado. O GitHub Pages configurado publica automaticamente essa branch.');console.log('Endereço: https://eduardosenna96.github.io/stratum-ai/');console.log('Confirme a conclusão do build antes de anunciar a atualização.');process.exit(0);}
 const repo='repos/Eduardosenna96/stratum-ai';let site;
 try{site=api('GET',repo+'/pages');}catch(error){if(!String(error.stderr||'').includes('HTTP 404'))throw error;}
 const spec={build_type:'legacy',source:{branch:'gh-pages',path:'/'}};
 if(!site)site=api('POST',repo+'/pages',spec);
 else if(site.build_type!=='legacy'||site.source?.branch!=='gh-pages'||site.source?.path!=='/')site=api('PUT',repo+'/pages',spec);
 const build=api('POST',repo+'/pages/builds');
 console.log('Build solicitado:',build.status);
 console.log('Endereço informado pelo GitHub:',site.html_url||'https://eduardosenna96.github.io/stratum-ai/');
 console.log('Ainda é necessário confirmar HTTP 200 e testar o jogo publicado.');
}catch(error){console.error(String(error.stderr||error.message).trim());process.exitCode=1;}
