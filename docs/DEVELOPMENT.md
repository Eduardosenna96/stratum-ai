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
- O pacote único foi validado via HTTP; navegação local file:// depende do navegador do jogador. Não foi publicado um site público.
