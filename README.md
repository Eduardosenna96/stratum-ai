# Shadowman — As sombras despertam · 0.4

Jogo original de plataforma e poderes de sombra, de Eduardo Senna / Senna Comics.

**Jogar:** https://eduardosenna96.github.io/stratum-ai/?v=0.4

A fase 1 agora conecta seis regiões: Cais das Sombras, Rua dos Lampiões, Telhados do Relógio, Ponte dos Ecos, Pátio das Máquinas e Terminal 08. São 9600 unidades de percurso com ruas, telhados, manutenção do canal, elevador, três fragmentos e um chefe. O atlas ampliado de 36 peças organiza a arquitetura de cada setor. Drones Órbita anunciam seus disparos; o Vigia anuncia a investida.

## Controles

| Ação | Tecla |
|---|---|
| Andar | ← → ou A / D |
| Saltar | Espaço, W ou ↑; solte cedo para salto menor |
| Conjurar sombras | J |
| Deslocamento sombrio | K |
| Pausar / continuar | P ou Escape |

Em telas de toque, os botões aparecem abaixo do jogo; a opção de tela cheia mantém os controles visíveis. Colete os fragmentos no pátio, sob a ponte e no gerador. Escadas são percorridas automaticamente ao andar. Para alcançar o gerador, suba no elevador e salte para a plataforma à direita. Os caminhos superiores e inferiores se reencontram. Fragmentos e pontos seguros recuperam uma vida; ao morrer é possível continuar com o progresso já coletado. O som começa desligado. Não há salvamento após fechar o navegador.

## HTML independente

`npm run build` cria `dist/Shadowman.html`, com CSS, JavaScript, dados da fase, recortes e três PNGs embutidos. Abra esse arquivo no navegador, sem servidor ou rede. O ZIP do código também funciona extraído: abra `index.html` mantendo scripts e pasta assets juntos.

Para desenvolver, use Node.js 18+ e `npm start` (porta 3000; `PORT` opcional). Não há dependências npm de execução para instalar.

## Verificação

```sh
npm test
npm run build
npm run test:browser
```

Os testes do navegador exigem servidor em execução, Playwright e Chromium, já disponíveis no runtime cloud. `CHROMIUM_PATH` e `BASE_URL` permitem outros caminhos/portas. Há **9 testes de mecânica e 20 cenários no navegador**. O percurso completo está em `tests/phase-route.cjs`: faz ida e volta sem teleporte, pega os três fragmentos e usa o elevador. Nesse teste, inimigos são desligados para isolar geometria; combate e projéteis têm verificações próprias.

`npm run watch` roda regras e recompila ao editar, sem chamadas de IA. O fluxo econômico do agente está em `skills/shadowman-development/SKILL.md`.

## Arquivos principais

- `level.js`: geometria, setores, rotas, pontos seguros, elevador e encontros.
- `game.js`: física, combate, estado e renderização.
- `assets/phase-01-complete-atlas.png`: arquitetura aprovada; original preservado.
- `assets/phase-01-atlas.js/json`: recortes explícitos para as linhas irregulares do atlas.
- `docs/phase-01/full-map.png`: composição visual que orienta o percurso.
- `docs/DEVELOPMENT.md`: decisões e limites.

O fundo distante permanece procedural; a cidade próxima usa os novos assets. Personagem, mapa e drones usam arte gerada com a referência fornecida pelo criador. Esta é uma fase de protótipo, não um jogo comercial final. O build HTML foi validado via HTTP e sem requests externos de assets.
