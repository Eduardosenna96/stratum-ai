> **Etapa atual: kit da fase 1 antes da integração.** A versão pública voltou ao visual0.10 após rejeição da0.11. O trabalho novo está em production/phase-01, numa branch separada, com catálogo Phaser, atlas/metadados e mapas editáveis. Veja production/phase-01/README.md. Não considerar o tilemap renderizado0.11 abaixo como aparência aprovada.

# Shadowman — produção da fase1

Jogo original de Eduardo Senna / Senna Comics. **Jogo restaurado:** https://eduardosenna96.github.io/stratum-ai/?v=restaurado-010

**Catálogo de assets:** https://eduardosenna96.github.io/stratum-ai/phase1-kit/

As instruções abaixo descrevem o modelo experimental0.11 preservado nas fontes, não a versão pública restaurada.

Oito áreas conectadas de3072×960, com mapas de várias telas, caminhos altos e baixos, poderes, atalhos e progresso salvo no navegador. A cidade usa tilemap: apoios e desenho das plataformas vêm dos mesmos dados. Fundos distantes, prédios intermediários e plano jogável têm velocidades de parallax distintas. O capuz, os olhos azuis e o infinito do Shadowman são preservados; ele combate com sombras.

## Como jogar

- Setas ou A/D: mover. Espaço: saltar; segure para salto mais alto.
- Shift: andar com cuidado. ↑/↓: escadas; ↑ sobe bordas e ↓ solta.
- J: lança de sombra; segurar repete. Cada lança custa12energia.
- Q: segurar parado para absorver. Inimigos com1vida ou vestígios próximos recuperam energia; finalizar um inimigo por absorção também cura1vida. Sem alvo, canalizar recupera energia lentamente. Absorção e disparo são ações separadas.
- E: entrar/interagir. K: Passo Sombrio após encontrar a habilidade.
- M: mapa. P/Escape: pausa. Controles por toque aparecem em telas menores.

Atravesse os vãos do Cais para chegar à Praça. Encontre o Arquivo à direita, suba pela escada e pegue o Passo. Volte à Praça, entre no Canal e procure o Tentáculo na galeria de baixo. A rota alta leva ao Selo da Torre. Na Fábrica, o elevador alcança a Câmara da Névoa. Névoa e Selo abrem o Terminal. Derrote o Vigia e ative o núcleo.

Poderes e atalhos são salvos. Cada entrada de sala é um ponto seguro que recupera vida/energia. O mundo novo usa armazenamento separado das versões anteriores. Se o navegador bloquear o armazenamento, o jogo informa a limitação e continua funcionando sem salvar.

## Executar e construir

Sem dependências de runtime externas. `npm start` abre servidor na porta3000; `/` encaminha ao jogo atual. Ao abrir fontes locais, use index.html da raiz ou prototype/index.html mantendo as pastas juntas.

`npm run build` cria `dist/Shadowman-Cidade.html`, independente com imagens embutidas, e `dist/city-site/`, com HTML leve e assets separados por hash. `npm run export:tilemap` exporta os dados para assets/city-world.json. PNGs são masters; WebPs de runtime foram comprimidos sem perdas. `node tools/publish-pages.cjs --city` publica a entrega web na branch gh-pages existente, sem force-push.

## Verificar

`npm test` valida sintaxe e autoria do mapa. Com servidor local e Playwright/Chromium disponíveis:

- `npm run test:browser`: habilidades, progressão, animação, parallax, carregamento e interface.
- `node tests/tile-route.cjs`: ida/volta com geometria isolada e passagem com combate ativo. As duas modalidades são identificadas separadamente.
- `node tests/city-build.cjs`: referências, hashes e HTML independente.

`npm run watch` verifica autoria/build após mudanças locais, sem chamadas de IA. Não cria nem corrige código sozinho.

## Fontes e limites

prototype/tile-world.js autora mapas e conexões; tile-render.js desenha camadas/tilemap; world.js controla física, poderes e interface. Assets têm atlas/metadados de personagem, cenários e materiais. docs/ux/DEPTH-REVIEW.md registra revisão visual e limites.

Este é um jogo curto de oito áreas, não a campanha futura de24salas. Props são reaproveitados entre regiões, e o Vigia ainda é um encontro simples. Referências de travessia e controles incluem Prince of Persia, Castlevania e Super Mario World, com código, personagem e arte próprios. Modelos anteriores estão preservados no histórico e docs/archive; `npm run build:legacy` e `npm run test:legacy` são específicos do modelo antigo.
