# Shadowman — As sombras despertam

Jogo original de plataforma e combate de sombras de Eduardo Senna / Senna Comics. Uma fase na cidade gótica industrial do Terminal 08, com exploração vertical e um chefe. O protagonista usa a sprite sheet aprovada, com capuz negro, olhos e infinito azuis. Não usa espada.

## Jogar

Se baixou o código pelo GitHub, extraia o ZIP e abra **`index.html`**. Mantenha as pastas `assets`, os scripts e o CSS juntos.

Para a distribuição em arquivo único, abra `dist/Shadowman.html` no navegador. O arquivo contém a arte e não precisa de rede, Node ou instalação. Para regenerá-lo: `npm run build` (Node.js 18+).

Para desenvolver e jogar pelo servidor local:

```sh
npm start
```

Porta padrão 3000; `PORT` permite escolher outra. Não é necessário executar `npm install`. Servidor local não constitui publicação pública.

## Controles

| Ação | Tecla |
|---|---|
| Andar | ← → ou A / D |
| Saltar | Espaço, W ou ↑; solte cedo para saltar mais baixo |
| Conjurar sombras | J |
| Deslocamento sombrio | K |
| Pausar / continuar | P ou Escape |

Em telas de toque, os botões aparecem abaixo do jogo; tela cheia é opcional. Recupere os três fragmentos nos telhados e enfrente o Vigia. Fragmentos ativam pontos seguros e recuperam uma vida. Morrer permite continuar com os fragmentos já coletados; recomeçar a fase limpa o progresso. O som começa desligado. Não há salvamento após fechar o navegador.

## Verificar e melhorar

```sh
npm test
npm run build
npm run test:browser
```

O teste de navegador requer o servidor em execução, Playwright e Chromium. Ambos já estão presentes na máquina cloud; a resolução do runner tenta a instalação local e o runtime cloud. `CHROMIUM_PATH` e `BASE_URL` permitem outros caminhos/portas. Testes usam hooks disponíveis somente com `?test=1`.

`npm run watch` verifica as regras e refaz o HTML ao editar fontes, sem chamadas de IA e sem gastar tokens. O fluxo para o agente está em [skills/shadowman-development/SKILL.md](skills/shadowman-development/SKILL.md).

Veja [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) para decisões e próximos passos, e [assets/README.md](assets/README.md) para limites da animação. Esta é uma fase de protótipo, não um jogo comercial final. A arte do herói foi gerada com referência à capa fornecida pelo criador.

## Verificação desta versão

9 testes de regras e 18 cenários de navegador passaram. O HTML independente foi carregado via HTTP com o sprite embutido e sem requests externos de assets. Não houve erros JavaScript. O watcher também foi exercitado na inicialização e após uma alteração local. O workflow de GitHub Actions testa e empacota; o QA do navegador foi executado no ambiente cloud.

## Reconstrução 0.3

A cidade agora usa `assets/city-atlas.png` (24 peças) e os inimigos usam `assets/drone-atlas.png` (24 quadros): voo, alerta, tiro e destruição. O Vigia é uma variante ampliada do drone. O fundo distante continua procedural; telhados, fachadas, janelas e elementos das docas usam o atlas. Tiros têm mira anunciada, trajetória fixa, recarga e colisão com terreno. As condições de vitória, pontos seguros e controles foram preservadas.

Os dois atlas originais foram preservados. `tools/describe-atlases.py` apenas descreve limites de alpha e gera `assets/atlases.js/json` para recortes no Canvas, sem alterar a arte; só esse utilitário opcional usa Pillow. O build HTML embute os três PNGs e os metadados, sem requests externos.

Jogue a versão publicada em https://eduardosenna96.github.io/stratum-ai/. A atualização da branch `gh-pages` dispara a publicação automática; o script `tools/publish-pages.cjs` usa esse fluxo sem API adicional.
