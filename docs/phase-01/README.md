# Fase 1 — mapa antes da implementação

Rota escolhida pelo criador: mistura de ruas, telhados e docas. Esta pasta planeja uma fase inteira de 7–10 minutos, com 9600 unidades de comprimento e seis setores distintos. O protótipo anterior de 4000 unidades não representa este mapa.

O percurso vai do Cais das Sombras ao Terminal 08, passando por Rua dos Lampiões, Telhados do Relógio, Ponte dos Ecos e Pátio das Máquinas. A arquitetura deve justificar plataformas e alturas. Ruas formam uma rota principal legível; caminhos por telhados e manutenção do canal se reencontram. A arena final não tem quedas surpresa.

`level-plan.json` descreve funções dos setores, rotas, marcos, pontos seguros e fragmentos. Dimensões e duração são metas de projeto; não foram validadas em gameplay. O elevador industrial e as novas rotas ainda precisam ser implementados. Não anunciar este plano como fase jogável.

O atlas deve acrescentar silhuetas e funções arquitetônicas, não apenas recolorir ou repetir a mesma fachada. A prancha do percurso servirá para revisar a composição inteira antes de montar colisões e encontros.

## Atlas completo da fase

`../../assets/phase-01-complete-atlas.png` contém 36 peças de arquitetura e cenário, organizadas por setor: docas, ruas, telhados, canal/ponte, fábrica e Terminal 08. `atlas-manifest.json` registra o inventário e as dimensões originais. O arquivo foi copiado sem edição.

A prancha gerada tem distribuição visual de 6 × 6, mas os espaçamentos e alturas das linhas não são perfeitamente uniformes. Antes de entrar no runtime, cada peça precisa de recorte explícito, âncora e classificação de colisão. Não tratar a imagem como tileset automaticamente conectado ou declarar a fase montada apenas por gerar o atlas.

## Visão geral do percurso

`full-map.png` apresenta os seis setores numerados em uma prancha dobrada (3 colunas × 2 linhas), com percurso principal em azul e alternativas em dourado. É referência de composição, escala relativa e ritmo; as setas ilustrativas não substituem a topologia de `level-plan.json`. A imagem original mede (2172, 724) pixels e foi copiada sem edição.

O trabalho de planejamento não altera a versão pública do jogo. O próximo passo de implementação é autorar as superfícies e transições do mapa inteiro, em vez de repetir um único conjunto de plataformas.
