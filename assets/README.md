# Arte do Shadowman

`shadowman.png` é a sprite sheet aprovada nesta conversa: 1536 × 1024, RGBA, 6 colunas × 4 linhas, células de 256 × 256. A imagem original foi copiada sem edição. O canal alpha foi inspecionado: há transparência real; alpha varia de 0 a 254.

Linhas: repouso, corrida, salto e conjuração de sombras. A imagem gerada por IA é uma base artística e ainda tem variação de volume e pose. Não equivale a uma animação final desenhada quadro a quadro. `sprites.json` registra coordenadas e limites de alpha por célula para revisão.

O runtime usa recortes de 256 px, escala fixa e âncoras de pés. Animação da corrida segue movimento; salto seleciona poses pela velocidade vertical; ataque acompanha sua própria linha do tempo. O dash usa uma pose de corrida com rastros, e dano usa piscada. Efeitos longos de sombra são desenhados pelo Canvas para não invadir células vizinhas.

O cenário atual é procedural com skyline em cache, camadas de paralaxe, canal, ponte e docas. Inimigos continuam provisórios. A arte anterior da cidade não estava disponível após a troca de ambiente; nenhuma recuperação foi alegada.

Personagem e universo: Eduardo Senna / Senna Comics.

## Cidade e drones — 0.3

`city-atlas.png`: 1536 × 1024, 6 × 4 células de 256 px, 24 peças. Linhas: telhados/passarelas, fachadas/portas, estruturas e acessórios. `drone-atlas.png`: mesmas dimensões e células; linhas: voo, alerta, disparo/recuperação, dano/destruição. Ambos têm alpha real de 0 a 254 e foram copiados sem edição.

`atlases.json` e `atlases.js` guardam limites dos objetos dentro das células. Nem toda peça é usada como superfície física: a borda horizontal azul marca plataformas com colisão. Correntes, caixas, postes, tanques e gárgulas são decoração sem colisão; escadas não foram implementadas como mecânica. Variação entre quadros ainda pode existir, pois são atlas gerados por IA.
