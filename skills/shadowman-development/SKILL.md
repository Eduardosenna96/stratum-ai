---
name: shadowman-development
description: Continue o desenvolvimento e a revisão econômica do jogo Shadowman da Senna Comics.
---

# Shadowman: ciclo de desenvolvimento

Este projeto usa o Shadowman de Eduardo Senna: capuz e traje negros, rosto oculto, olhos azuis, infinito azul no peito e poderes de sombra. Sem espada. Cenário: cidade gótica industrial, canais, pontes e Terminal 08. Preserve o personagem e os assets aprovados.

## Trabalho autônomo com orçamento

- Trabalhe no checkout existente. Não crie worktrees sem pedido explícito.
- Leia README.md e docs/DEVELOPMENT.md e inspecione git status antes de editar.
- Escolha uma entrega pequena e completa: controles, colisões e legibilidade antes de mais conteúdo.
- Use no máximo um agente de QA por ciclo. Só delegue quando o usuário ou outras instruções autorizarem; esta regra limita, não concede autorização.
- Reutilize a arte e as ferramentas disponíveis. Não gere imagens, instale pacotes ou baixe skills sem necessidade concreta. Evite chamadas repetidas e dumps de código.
- Não prometa processamento contínuo: agentes trabalham durante a sessão. O watcher local automatiza testes/build, não cria código com IA.

## Implementação

- Simulação em 60 Hz separada de renderização; teclado e toque usam os mesmos comandos.
- Preserve buffer de salto, coyote time, salto variável, startup/ativo/recuperação e dano único por alvo por golpe.
- Direção do dash e investida do chefe fica travada ao iniciar. Antecipação visual deve preceder dano.
- Queda sempre aplica dano ambiental, mesmo durante invulnerabilidade.
- Fragmentos ativam ponto seguro; derrota permite continuar e preserva fragmentos. Chefe só desperta após os três fragmentos.
- Sem dependências de runtime externas, fontes remotas ou segredos. Use APIs do navegador e Node.js padrão.
- A sprite sheet original não deve ser substituída por formas simplificadas sem comunicar. `assets/sprites.json` registra as células; `assets/README.md` descreve limites.

## Verificação e encerramento

1. `npm test` — testes das regras. Confirme os testes executados, não apenas o exit code.
2. `npm run build` — HTML único com imagem embutida e checksum.
3. `npm start`; `npm run test:browser` — Chromium/Playwright já disponíveis na máquina cloud. Só execute outra bateria completa se mudança ou falha justificar.
4. Inspecione screenshots quando a arte/layout mudar. Verifique os percursos elevados e pelo menos um teste mobile.
5. Corrija os bloqueios e rode de novo os testes afetados. Registre limitações reais, nunca testes não executados.
6. Entregue `dist/Shadowman.html` e o pacote fonte. Não confunda servidor local com site público ou anexo garantido. Nunca prometa publicação ou restauração em nova máquina sem verificação.

Pare ao completar o objetivo e passar os testes relevantes. Registre próximos passos em docs/DEVELOPMENT.md, sem expandir indefinidamente o escopo.

## Fase 1 completa

O mapa atual é definido em `level.js`; use os seis quadros aprovados e seus recortes explícitos. Preserve as rotas por ruas, telhados e canal e os seus reencontros. Escadas têm subida automática e o elevador carrega o jogador. Use os recortes de `level.scenes[].crop`; as divisórias da prancha limpa não são uniformes. Ao modificar geometria, valide `tests/phase-route.cjs` de ponta a ponta e na volta, com coleta e elevador. Esse teste isola geometria desligando inimigos; não descreva isso como validação da dificuldade completa.

## Correção de fidelidade0.5

O mapa0.4 foi rejeitado visualmente. A referência obrigatória é `docs/phase-01/full-map.png`, não só o kit de peças. Leia `docs/phase-01/FIDELITY.md`. Para a montagem atual, cenários inteiros vêm de `assets/storyboard-clean.png`; `level.js` traça superfícies na arte e alinha alturas globais entre salas. Antes de publicar, compare os seis ambientes com a prancha e confira botas/pisos e escala, além dos testes. Não reinserir skyline genérica ou recompor livremente a arquitetura aprovada.
