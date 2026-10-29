# Fase1 — pré-produção e revisão de assets

Esta entrega separa arte, dados e integração. Nenhum novo jogo substitui o visual anterior. O catálogo em review/index.html usa Phaser3.90 para reproduzir poses e sequências; não é a integração de movimento/combate/mapa.

## Conteúdo concreto

- 5 atlas de personagens em JSONHash compatível com Phaser: base do herói, escalada/ataque, estados extras, drone e Vigia.
- Mais dois atlas JSONPhaser:36peças de cenário e6materiais de tiles.
- 85quadros de personagem catalogados e29sequências:17do herói e6de cada inimigo. Estados derivados e VFXpendentes são declarados, não apresentados como desenhos inéditos.
- Tempos porquadro, pivôs normalizados, escala no mundo e indicação deespelhamento.
- 8mapas.TMJ editáveis noTiled, materiais.TSJ, preview de materiais e colisões exatas como objetos, incluindo degraus12px.
- Planta completa, conexões, dependências de poderes, recompensas, escadas, elevador e atalhos em maps/world.json.
- Referência da cidade e materiais/artes originais preservados em assets. PNGmaster e WebPsemperdas.

## Organização para a engine

Scenes coordenam carregamento/áreas. Actors representam entidades. Components têm responsabilidades isoladas. States e Data definem comportamento. Esta organização é inspirada em padrões comuns da Unreal; o runtime do catálogo é Phaser, sem alegar integração com Unreal.

AnimationComponent e ShadowActor funcionam no catálogo. Movement/Combat/Interaction serão implementados depois da revisão; não há componentes vazios fingindo integração concluída. atlasmeta.worldScale é extensão de dados do projeto, não um parâmetro nativo doPhaser.

## Antes de integrar

1. Revisar cada sequência no catálogo, em velocidade normal e reduzida, com pivôs visíveis.
2. Conferir caminhada derivada da corrida, estabilidade da escalada e cortes de VFXnas bordas das células.
3. Aprovar arte e passagem de apoios antes de construir o cenário final; planta técnica não aprova o acabamento de blocos rejeitado.
4. Só então ligar física, controles, poderes, IA e encontros ao mapa. Validar uma rota pequena antes de integrar todas as áreas.

manifest.json lista as pendências honestamente. audit.json valida dimensões/limites dosquadros, não qualidade artística nem diversão. Gere novamente com node tools/build-phase1-kit.cjs. Os arquivos de produção não alteram o jogo público.
