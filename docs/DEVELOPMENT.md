# Shadowman 0.2 — desenvolvimento

## Entrega desta rodada

Uma fase de cerca de 2–5 minutos: Distrito das Docas → Ponte dos Ecos → Terminal 08. Três fragmentos em rotas elevadas, pontos seguros, cinco Ecos e um chefe. O percurso exige saltar e explorar; a colisão acompanha superfícies horizontais de telhados. Plataformas superiores têm colisão apenas no topo, permitindo saltar através delas por baixo.

O herói usa a sprite sheet aprovada. Inimigos são provisórios. A cidade é procedural com paralaxe e edifícios em cache. Há chuva e partículas; tremor/chuva respeitam a preferência de movimento reduzido. Som sintetizado é opcional e só ativa por ação do usuário.

## Regras deliberadas

- Física fixa em 60 Hz, aceleração/desaceleração, salto de altura variável.
- Tolerância após sair da borda: 6 ticks; buffer de salto: 8 ticks.
- Ataque: 7 ticks de preparação, ativo em 7–15, recuperação até 32. Cada alvo recebe no máximo um hit por ataque.
- Dash de 14 ticks, recarga de 65, direção fixada ao iniciar. Não impede dano por queda.
- Fragmento restaura uma vida e define ponto seguro no chão, mantendo o progresso ao morrer. Continuar restaura vida e o chefe; recomeçar limpa tudo.
- O chefe alterna sinal → investida reta → recuperação. A direção é definida ao terminar o sinal; abaixo de metade da vida ele acelera. É possível atacar nas demais fases, mas a recuperação é a janela segura.
- P/Escape e perda de foco pausam. Ao voltar, o jogador confirma para continuar.

## Fluxo econômico

`npm run watch` executa testes/build em mudanças locais e não consome tokens de IA. Ele não cria nem corrige código sozinho. A skill local em `skills/shadowman-development/SKILL.md` registra o ciclo para sessões futuras.

Nenhum pacote npm foi instalado: projeto usa Node padrão, browser usa Canvas e Web Audio. A máquina cloud já oferece Playwright/Chromium para QA. Em outra máquina, os testes de navegador precisam do pacote Playwright e de Chromium; eles não são requisitos para jogar.

## Próximos ciclos, em ordem

1. Testar a dificuldade com jogadores e ajustar distâncias/antecipações usando evidências.
2. Criar sprite sheet original do Eco e do Vigia mantendo escala e linguagem visual.
3. Melhorar transições de aterrissagem e dash com quadros dedicados.
4. Acrescentar uma rota secreta e uma habilidade, se a fase base estiver validada.

Não adicionar campanha, inventário complexo ou geração de arte em lote antes de estabilizar a fase. Nenhum processo de IA permanece trabalhando depois de encerrar a sessão. Publicação pública e download pela interface são capacidades separadas do build.

## Evidências da rodada 0.2

- 9 regras automatizadas e 14 cenários no Chromium passaram.
- Os três percursos elevados foram feitos com simulação de saltos, sem reposicionar o herói entre plataformas.
- Testado teclado real no build independente, toque em 390 × 844 e controles em tela cheia em 844 × 390.
- Inspecionadas capturas desktop e mobile; o canvas é pequeno em retrato, sendo paisagem/tela cheia a melhor opção no celular.
- Corrigido um teste que consultava a velocidade antes do próximo tick do buffer de salto; o teste agora aguarda a física, sem alterar a mecânica para fazê-lo passar.
- O pacote único foi validado via HTTP; navegação local file:// depende do navegador do jogador. O site está publicado no GitHub Pages: https://eduardosenna96.github.io/stratum-ai/.

## Publicação estática

`node tools/publish-pages.cjs --prepare-only` cria localmente uma branch `gh-pages` com apenas `index.html` independente e `.nojekyll`, sem trocar o checkout de desenvolvimento nem criar worktrees. Repetir com o mesmo conteúdo reaproveita o mesmo commit. Sem a opção, o script faz push sem força; o GitHub Pages já configurado publica a branch automaticamente. `--configure-pages` é reservado para configuração inicial pela API. Requer a autenticação GitHub já fornecida pelo ambiente e acesso de rede a `api.github.com`; depois é preciso validar o endereço retornado, normalmente `eduardosenna96.github.io/stratum-ai/`.

Uma branch publicada não prova que o Pages está ativo. Somente entregar endereço de jogo após confirmar a página e o funcionamento. Se houver falha de rede/permissão, preservar o material preparado e explicar o requisito específico. Não solicitar tokens antes de testar a autenticação existente.

## Reconstrução 0.3

Assets modulares da cidade substituem os blocos provisórios no plano de jogo. A skyline distante em cache foi mantida para paralaxe. Drones Órbita patrulham em limites fixos, flutuam, anunciam tiros com o olho vermelho e disparam pela mira registrada no início do aviso. Projéteis são limitados a 20, expiram e colidem com o jogador ou com telhados. O contato é consumido mesmo se o jogador estiver protegido. Ao morrer, o drone passa por seis quadros de destruição; o Vigia conserva o padrão de investida reta para preservar a legibilidade do chefe.

As mesmas rotas de salto, pontos seguros e controles são preservadas. O build offline agora inclui três PNGs e o atlas de recortes. O utilitário de limites de alpha não altera imagens.

Validação 0.3: 9 regras automatizadas e 18 cenários de navegador passaram. Os quatro cenários novos cobrem recortes dos atlas, drones/antecipação/mira, destruição e ciclo completo dos projéteis. Nenhum erro JavaScript foi registrado.

## Fase completa 0.4

O mapa de 4000 unidades foi substituído por um percurso autorado de 9600, com seis regiões. `level.js` separa geometria de mecânicas/renderização. O atlas completo de 36 peças substitui o atlas genérico anterior no runtime; as linhas irregulares usam recortes explícitos. Cada região tem marcos próprios e as passarelas têm suporte visual. A textura de alvenaria é cacheada para preservar detalhe sem esticar fachadas inteiras.

Subida automática resolve degraus de até19 unidades. O elevador da fábrica percorre500↔315 e carrega o personagem enquanto ele está apoiado; saltos e colisões ainda usam a mesma simulação fixa. A ponte tem rota superior e manutenção inferior; escadas reconectam ambas. Recompensas opcionais estão nos telhados. Novos pontos seguros são ativados uma vez e preservam o ponto mais avançado durante retorno.

Validação: 9 testes de mecânica, 20 no Chromium, incluindo percurso físico completo ida/volta, três chaves, elevador por900ticks, combate, projéteis, pausa, toque, tela cheia e HTML com os3PNGs embutidos. Foram inspecionadas seis capturas de setores. Um fixture antigo usava posição agora ocupada por um drone; o teste passou a usar a borda real da fase, sem mudar a engine para contornar o caso. A dificuldade da fase ainda precisa ser avaliada por jogadores; o teste de percurso desativa inimigos para medir apenas travessia.

## Estrutura de metroidvania proposta

Pedido do usuário: substituir sensação de sequência linear por cidade interligada, vertical, com habilidades e itens que liberam caminhos. Documentação em docs/world/STRUCTURE.md e grafo de 24 salas em docs/world/world-structure.json. Verificação lógica encontrou todas as 24 salas e cinco recompensas, respeitando três atalhos com abertura do lado distante. Não é implementação nem validação de travessia. Primeiro recorte de produção: oito salas, Passo, bloqueio, retorno, portas pareadas e salvamento; não ampliar todas as salas antes dessa base.

## Protótipo Cidade Interligada 0.6

Nova experiência separada em prototype/index.html e prototype/world.js, preservando a versão anterior no código. Oito salas reutilizam os seis quadros limpos; Arquivo, Câmara e Terminal ainda compartilham a mesma arte de interior. Não são os 24 ambientes finais nem reprodução exata do mockup recente. Portas pareadas com E, Passo desbloqueável e dash com recarga, pontos altos de Tentáculo como transições entre salas, Névoa como requisito de passagem, Selo da Torre, dois atalhos abertos do lado distante, mapa de salas descobertas, elevador, escadas e agarrar/subir bordas. Tentáculo e Névoa ainda não têm animação/mecânica contínua dedicada. Combate usa a conjuração existente, drones com aviso de30ticks e projétil com mira travada. Núcleo final exige derrotar Vigia.

Salvamento local versionado shadowman-city-v06 guarda sala, descobertas, atalhos e conclusão. Reentrada restaura vida na entrada da sala. Novo percurso pede confirmação porque apaga esse progresso. Se armazenamento falhar, jogo continua e informa limitação.

Validação: 22 verificações direcionadas de mecânica/portas/atalhos, recarga preserva quatro descobertas, capturas desktop/mobile e nenhum erro JavaScript. Percurso físico de2563ticks pelas oito salas e quatro descobertas, sem reposicionamento do herói; inimigos são desativados nesse percurso para isolar travessia. Testes direcionados reposicionam para medir regras isoladas. Testes antigos:11passaram. HTML independente por HTTP com PNGs embutidos passou; navegação file:// foi bloqueada pela política do Chromium gerenciado, portanto não foi comprovada neste ambiente. Build npm run build:city; testes npm run test:city. Publicador --city seleciona este HTML sem alterar o build antigo.

## Correção de carregamento e fidelidade 0.7

Usuário rejeitou visual0.6 por não corresponder ao mockup e pediu nitidez e funcionamento. Cenários individuais1672×941 substituem os recortes~700×340: cidade mantém a composição do mockup semHUD/atores estáticos; Canal e Terminal são complementos. HUD funcional é desenhado separado; canvas16:9 com backingstore ajustado ao CSS e DPR até2. Geometria própria em prototype/city-level.js foi traçada diretamente nas novas cenas. Oito salas ainda compartilham três ambientes; o Vigia é um encontro simples, e novos ciclos dos poderes não foram integrados.

Falha reproduzida na0.6: PNGopcional do drone rejeitava Promise.all, play ficava desabilitado e renderapagava a mensagem. Agora herói+cena atual são essenciais; drone só inicia após esses dois, possui fallback, outras cenas não bloqueiam início. Falha essencial fica visível, com retry e timeout20s. Novo schema de armazenamento v07 evita posições incompatíveis com a nova geometria; progresso0.6 não é apagado, mas esta versão começa separado.

Entrega pública: indexHTML3149bytes, scripts e5PNGs com hash, carregamento separado; não significa que o jogo inteiro tenha3KiB. Offline preservado em dist/Shadowman-Cidade.html16.71MiB, testado porHTTP. Contrato build passou. Agente especialista autorizado pelo usuário revisou31 verificações de browser, DPR2, falhas/retry e salvamento. Percurso físico de2467ticks pelas8salas com4descobertas, semreposicionarherói e semquedas/danoambiental; inimigosdesativados nesse percurso, combate medido separadamente. Capturas reais Cais, Canal, Terminal e mobile inspecionadas; pisos/escadas e composição conferidos. Nenhuma pesquisa externa ou nova skill instalada nesta rodada;3gerações dearte dedicadas às correções, um agente deQA. Não declarar qualidade/afiliação DC ouNintendo.

## Sensação de movimento e combate 0.8

Usuário pediu referência de Castlevania e jogos modernos e mencionou REA/projeto pronto, sem nome/link identificável. Pergunta de esclarecimento foi enviada; por enquanto não há integração com código externo. Nenhuma pesquisa ou geração de arte nesta rodada. Melhorias independentes no código atual: câmera1.35x acompanha personagem em passo fixo com antecipação de direção e limites da sala; HUD permanece em coordenadas de tela. Aceleração/frenagem, buffer e repetição de ataques ao segurarJ, pausa deimpacto3ticks, partículas e tremor respeitando prefers-reduced-motion. Layout e progressão são os mesmos; storagev07 permanece compatível.

QA limitado ao agente já autorizado:38checks de navegador passaram (7novos para movimento, câmera, hold/buffer e impacto). Percurso físico de2480ticks pelas8salas,4descobertas, semreposicionarherói, zeroquedas/danoambiental; inimigosdesativados para isolar travessia. Captura real próxima e HUD inspecionados. Não equivale à reconstrução completa, nem valida diversão/dificuldade com jogadores. Uma integração externa continua dependendo de identificar o projeto que o usuário mencionou.

Esclarecimento recebido antes da publicação0.8: usuário confirmou “Usar Castlevania como referência”. Não há projeto externo para integrar; seguir com código e universo próprios. A pendência de identificação registrada acima está resolvida.

## UX de travessia0.9

Referência atual do usuário: PrinceofPersia, com travessia experienciável, removendo os ovais azuis da captura. Eliminados todos os contornos/ícones de portal; relíquias agora usam pedestal∞. Hints só na proximidade e mensagens de bloqueio mantêm prioridade. PassagemCais/Ruas automática ao caminhar, com proteção de retorno. Arquivo continuaE: torná-lo automático capturava o acesso à escada dosTelhados, risco encontrado na revisão e corrigido antes da entrega.

Shift caminha a1.8 versus4.6 e segura personagem antes de passo semapoio; saltar permite sair. Subida de borda usa trajetória contínua de16ticks; agarrar não é bloqueado por invulnerabilidade. As poses ainda são reaproveitadas, não há sheet dedicada deescalada. Detalhes e limites em docs/ux/TRAVESSIA.md.

Validação final root: tests/city-browser.cjs passou, incluindo subida gradual, Shift/limite de borda e passagemsemretorno, além das regressões. Percurso físico2490ticks/8salas/4descobertas/zeroquedas, semreposicionar; inimigosdesativados para isolar travessia. Buildcontract passou com entrada3248bytes. Captura realv09inspecionada semovais. Agente existente colaborou na revisão e testes; conclusão feita pelo root após indisponibilidade doagente. Não houve pesquisa externa nem geração de imagens. Isto continua protótipo de8salas/3cenários, não implementação completa de PrinceofPersia.

## Sprite sheet e resposta de controles0.10

Usuário pediu escalada correta, ataque menos estranho e resposta deSuperMarioWorld. É referência de comportamento, sem ROM/código/arte deMario ou parâmetros alegados como extraídos dele. Uma geração de imagem criou assets/shadowman-motion.png; sem pesquisa externa. Atlas explícito em shadowman-motion.json: escalada de costas com alternância espelhada, palma sombria em quatro fases. Runtime usa nova folha na escada e no ataque; remove arco de ataque procedural. Dano usa direção travada do golpe e alcance63 compatível com efeito visível, uma aplicação poralvo/golpe. Ataque é bloqueado durante estados deescalada/borda/subida.

Corrida avança por distância real emvezde relógio; escalada só anima quando há deslocamento e para na pose atual. Salto escolhe fase por velocidade vertical e usa corte gradual ao soltarEspaço; pouso tem pose curta. Mapa/câmera/código original permanecem; movimento completo não pretende reproduzir exatamenteSuperMarioWorld. Todas as salas reutilizam as folhas; apoios são revistos a cada mudança degeometria.

Novo arquivo de animação é terceiro asset essencial com timeout/retry, total6PNGs no build.13testes específicos passaram para escalada, pausa da pose, ataque/recuperação/direção, corrida/repouso e diferença de altura do salto. Regressões de browser passaram. Percurso físico completo2490ticks/8salas/4descobertas, zeroquedas, inimigosdesativados, semreposicionamento. Buildcontract passou; offline19.58MiB e entradaweb3251bytes com assetsseparados. Capturas reais de escalada/ataque inspecionadas com simulação pausada pelo hook de teste para capturar fase exata. Poses de agarrar/subir borda continuam provisórias; não confundir com animação completa de todos os estados.

## Reconstrução tilemap/parallax e poderes0.11

A crítica do usuário mostrou que retas sobre escadas pintadas ainda cruzavam muros. Auditoria do especialista confirmou três desalinhos nas cenas anteriores; não foram escondidos com máscaras. O novo prototype/tile-world.js autora oito áreas3072×960 com grid48, degraus12, apoios explícitos, rotas superiores/inferiores, elevador, poderes e atalhos. tile-render.js desenha plataformas usando esses mesmos retângulos. Fundo far0.14, mid0.43 e mundo1 seguem a câmera em velocidades distintas. Props reaproveitados têm escala limitada para evitar borrão; materiais usam atlas próprio.

Folha extra de personagem cobre borda/subida, reação, derrota, dash e absorção. As duas folhas aprovadas continuam em uso. Atlas/materiais/metadados e assets/city-world.json acompanham o projeto. Foram criadas quatro imagens nesta reconstrução (far, mid, estados extras e materiais); nenhum asset adicional foi gerado após o pedido final de economia. PNGs masters preservados e oito WebPs sem perdas reduzem transferência. Site tem entrada3583bytes e assets separados; o tamanho do jogo completo não é3KiB. Offline15.96MiB preservado.

J lança sombra à distância,12energia porprojétil, um dano ao atingir. Q absorve parado, exclusivamente do disparo; ataque emcurso termina antes de canalizar. Inimigo1HP próximo pode ser finalizado para curar1vida e recuperar45energia; vestígios recuperam30; canalização semalvo recupera energia lentamente. Estado/pose e dano correspondem à ação. Núcleo final usa mecanismo desenhado, não barra/portal neon. Caminhar/retomarfecha mapa. Derrota porcombate tem breve dissolução antes de voltar ao ponto seguro.

Validação: testes deautoria passaram;31checks de navegador após exclusividadeJ/Q passaram com especialista. Geometria:8873ticks, oitoáreas/quatrodescobertas, zero dano/respawn, inimigosdesativados, semreposicionar. Seis capturas físicas deescada/chegada/retorno +elevador foram inspecionadas pelo especialista; root também revisou imagens. A vitória antiga segurandoJ+Q foi DESCARTADA após corrigir exclusividade. Conclusão LIVEfinal executada pelo root:9696ticks,7eventos dedano,zerorespawns,quatrodescobertas,vitóriareal done=true e4vida restante, usando comandos e inimigosativos; semeditarposição. Isso comprova possibilidade de conclusão, não diversão/dificuldade com jogadores. Limites: oitoáreas de jogo curto, props compartilhados e encontro final simples; não declarar campanha24salas ou perfeição.

Fluxo local agora aponta ao modelo atual: npmtest/autoria, build/tilemap, browser/tile e testes antigos soblegacy. indexraiz e servidor encaminham para o jogo atual. Watcher observa prototype e exportador evita reescreverJSON idêntico (sem ciclo de rebuild). Especialista atingiu limite durante a última rodada; root concluiu a única validação pendente sem novos agentes, pesquisas ou imagens. Pergunta posterior sobre engine registrada: o atual é Canvas próprio; Unreal/Phaser não foram integrados nem prometidos como existentes.

## Replanejamento fase1 — assets antes de integração

Usuário rejeitou visual0.11. Foi criado commit novo no gh-pages restaurando exatamente a árvore do site0.10; sem forcepush, fontes0.11 preservadas. Deployment de restauração confirmado no run40799755032. Depois usuário definiu ordem: preparar movimentos do herói/monstros, sprite sheets e mapa/tileset da fase inteira, só depois integrar emPhaser, com organização inspirada emUnreal.

Branch separada codex/phase1-production-kit. Uma geração nova foi necessária para Vigia; demais folhas/materiais reaproveitados. Phaser3.90 oficial foi obtido por npm e incluído emvendor comMIT; não foi integrado ao jogo. Catálogo real Phaser reproduz atlas e pivôs; framework de Actor/AnimationComponent/AssetReviewScene é somente revisão, sem física/combate. O kit contém85frames,29clips (incluindo derivados declarados),8mapas.TMJ, materiais.TSJ e conexões. Bounds/refs/estados validados por tests/phase1-kit.cjs. Browser percorreu29sequências/108referências semerroJS. Mapa e referência artística ficam separados: planta técnica não aprova os blocos visuais rejeitados.

Pendências artísticas são explícitas no manifesto: caminhada derivada, poses espelhadas, estabilidade de apoio e cortes deVFX. Não chamar isso de animação final/perfeita nem integrar ocultando pendências. Próxima etapa depende da revisão do kit, seguindo a ordem pedida. A publicação do catálogo usa pasta phase1-kit separada e deve preservar byte-a-byte index/arquivos do jogo restaurado.
