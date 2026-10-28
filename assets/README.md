# Arte do Shadowman

`shadowman.png` é a sprite sheet aprovada nesta conversa: 1536 × 1024, RGBA, 6 colunas × 4 linhas, células de 256 × 256. A imagem original foi copiada sem edição. O canal alpha foi inspecionado: há transparência real; alpha varia de 0 a 254.

Linhas: repouso, corrida, salto e conjuração de sombras. A imagem gerada por IA é uma base artística e ainda tem variação de volume e pose. Não equivale a uma animação final desenhada quadro a quadro. `sprites.json` registra coordenadas e limites de alpha por célula para revisão.

O runtime usa recortes de 256 px, escala fixa e âncoras de pés. Animação da corrida segue movimento; salto seleciona poses pela velocidade vertical; ataque acompanha sua própria linha do tempo. O dash usa uma pose de corrida com rastros, e dano usa piscada. Efeitos longos de sombra são desenhados pelo Canvas para não invadir células vizinhas.

O cenário atual é procedural com skyline em cache, camadas de paralaxe, canal, ponte e docas. Inimigos continuam provisórios. A arte anterior da cidade não estava disponível após a troca de ambiente; nenhuma recuperação foi alegada.

Personagem e universo: Eduardo Senna / Senna Comics.
