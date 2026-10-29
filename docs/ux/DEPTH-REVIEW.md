# Revisão de profundidade e apoio — Shadowman

## Diagnóstico da versão0.10 (modelo de cenários inteiros)

A reclamação sobre atravessar o muro da escadaria tem causa verificável. O collider de Streets foi criado como reta de(1290,345) a(1640,640), em pixels da arte1672×941. A escada desenhada termina num patamar em aproximadamente(1633,552). A faixa vertical552–640 é a face da alvenaria, não uma continuação de degraus. A rampa física falsa elevava o herói pelo muro. Não é um problema que uma máscara grande de primeiro plano deva esconder.

O apoio antigo usava toda a largura do corpo, percorria várias plataformas e aceitava elevação de32unidades sem exigir que o personagem estivesse no chão. Degraus de20–30pixels nativos são mais estreitos que a largura física do corpo; vários podiam ser selecionados na mesma atualização. Isso pode antecipar contato, elevar no ápice de um salto e produzir salto entre apoios. Um teste que chega ao fim da sala não detecta esse erro de leitura visual.

### Referências conferidas diretamente na arte

- Streets: patamar alto aproximadamentey334, escada1290,334→1633,552 e patamar direito1633..1672,y552. Treads visíveis amostrados em(1380,360),(1400,374),(1420,390),(1440,406),(1460,421),(1480,437),(1520,471),(1560,505),(1600,525),(1620,541). Acesso a partir da rua y640 exige salto ou agarrar a borda do patamar; não subir automaticamente pela face do muro.
- Canal: a escada direita chega aproximadamentea(1640,600), não a(1640,560). Amostras de capas de degraus:(1420,379),(1440,393),(1460,408),(1480,435),(1520,470),(1540,497),(1580,540),(1600,556),(1620,585),(1640,600). A superfície de chegada estava cerca de40pixels acima da imagem.
- Interior: o lance termina perto de920,790, em vez de900,790. Há degraus com separações que chegam a25pixels nativos; não assumir que todos cabem num step-up de14unidades do mundo sem medir. Superfícies de canto e de elevador precisam de inspeção de apoio, não apenas do centro do percurso.
- As escadas verticais visíveis de Streets e Canal têm limites coerentes com as plataformas próximas. A revisão não deve transformar janelas, tetos distantes, parapeitos ou fachadas em apoios só por terem uma borda horizontal.

Amostras são evidência de auditoria, não um atlas final. O usuário mudou o objetivo para tilemap contínuo e parallax durante esta revisão; não foram aplicadas correções locais ao antigo city-level.js e não houve nova publicação desse modelo.

## Critérios para o tilemap contínuo

1. Piso desenhado e piso físico derivam da mesma célula/objeto autorado. Não traçar um percurso imaginado sobre uma pintura panorâmica. A superfície caminhável deve coincidir com a borda superior visível; tolerância máxima definida na unidade do tile, sem aceitar faces verticais como apoio.
2. Selecionar um apoio por atualização pela faixa dos pés. Step-up exige apoio anterior e altura compatível com o degrau real. Saltos ascendentes não devem ser capturados pelo step-up. Pouso descendente usa a primeira superfície cruzada. Descida de escada não deve alternar entre queda e teleporte para cima.
3. Primeiro plano só oclui silhuetas que realmente ficam à frente: postes, grade ou arco com máscara autorada. Não esconder um collider falso com um retângulo de cenário sobre o personagem. Objetos decorativos têm profundidade declarada e não ganham colisão implicitamente.
4. Câmera percorre várias telas sem reutilizar toda uma imagem como sala. Camadas distante, intermediária e próxima têm velocidades distintas verificáveis; HUD permanece fixo. A imagem deve permitir distinguir área percorrível de arquitetura distante.
5. Capturar no mínimo seis situações por movimentos reais: aproximação no chão; salto/agarrão de patamar; primeiro degrau; meio do lance; chegada superior; descida/retorno. Conferir pés, sombra de contato, torso, corrimão e face da parede em cada captura.
6. Cobrir encontros das plataformas com escada, elevador, entrada e saída. A plataforma móvel deve carregar o herói e conservar apoio; não deixar um piso estático invisível no poço. A saída não pode capturar a aproximação a um lance obrigatório.
7. Testar rota completa de ida e retorno sem reposicionar o herói. Separar teste de travessia com inimigos desativados de teste com combate real. Evidências devem dizer qual foi executado. Não anunciar "todos os detalhes revisados" com base apenas em contagem de testes.

## Evidências de inspeção preservadas

Grades ampliadas de inspeção, somente para desenvolvimento: /tmp/streets-stairs-grid.png, /tmp/canal-depth-grid.png e /tmp/terminal-depth-grid.png. Esses arquivos mostram pixels da arte com coordenadas; não são gameplay corrigido nem novos assets para o produto.

## Novo autoramento por tiles

prototype/tile-world.js é um modelo novo: oito salas de3072×960, grade48, plataformas e degraus que serão desenhados a partir dos próprios colliders. Não usa as rampas falsas detectadas nas pinturas. Degraus têm12unidades de altura e48de avanço; piso, madeira e metal são identificados em cada collider. Na Praça, o lance começa numa galeria624 acessível por escada vertical; assim o step-up não captura a rota baixa para o Arquivo. Props de arquitetura ficam em camada back por padrão e não viram apoio. Piso baixo padrão768; galerias624/480/336; Canal tem ponte480 e manutenção816. Roofs possui balcão inferior de recuperação. Fábrica tem um elevador768↔480 que conecta duas passarelas separadas por seu poço.

O teste tests/tile-world.test.cjs valida limites, apoio de entradas/recompensas, pontas de escada, identificação de tiles e dependências das quatro descobertas. Isso valida autoramento e grafo, não substitui travessia física e capturas do runtime novo.

## Evidências do runtime novo

A revisão do tilemap foi executada com imagens reais do navegador e entradas de movimento. Seis capturas inspecionadas: /tmp/shadowman-tile-01-ladder-top.png, -02-gap-landing.png, -03-stair-foot.png, -04-stair-middle.png, -05-stair-top.png e -06-stair-return.png. Degraus visuais usam as mesmas posições e altura12 dos apoios; não há continuação física atravessando a antiga face de muro. Elevador em /tmp/shadowman-tile-07-elevator-top.png. Props são decorativos e ficam atrás dos atores; não são plataformas implícitas.

Validação tests/tile-browser.cjs:28 verificações, incluindo desbloqueios, parallax em velocidades distintas, DPR2, falha opcional não bloqueante e retry essencial. Lança só aplica dano quando seu projétil alcança o alvo; preparação consome12energia e o projétil dissipa no contato. Absorção de inimigo com1HP recupera1vida e45energia; vestígios recuperam energia com teto100. Altura dos drones foi ajustada ao plano do projétil: normais64unidades acima da superfície, Vigia base680 na arena768.

Percurso de geometria:8873ticks, oito salas, quatro descobertas, nenhum dano ou respawn, sem reposicionar o herói; inimigos desativados para isolar apoio. Um segundo percurso mantém drones, projéteis e absorção ativos e alcança o núcleo com vitória real. As métricas finais de combate são registradas pelo próprio tests/tile-route.cjs e informadas ao root; não confundir esse teste automatizado com avaliação humana de dificuldade. Em ambos, câmera percorre as salas de3072unidades e há retorno por escadas e atalhos.

Limites: trata-se de oito salas de um protótipo; arte de props é reaproveitada e nem todo distrito tem kit exclusivo. Esta revisão demonstra a correção de suporte e profundidade nos percursos inspecionados; não afirma acabamento AAA ou revisão de todas as combinações possíveis de entrada.

### Revalidação após exclusividade de J e Q

A rodada com J e Q simultâneos foi substituída: o runtime agora prioriza Q, conclui o ataque em andamento antes de absorver e exige chão/repouso para canalizar. tests/tile-browser.cjs passou31 verificações, incluindo três casos específicos dessa exclusividade.

O controlador LIVE foi corrigido para não desperdiçar lanças sem alvo: ataca inimigo forte alinhado e à frente, para para recarregar quando necessário e se aproxima de inimigo com1HP para absorver. No chefe, combate pela aproximação à esquerda antes de atravessar a arena. Nenhuma alteração de posição/vida/energia do herói ou HP dos inimigos é usada nesse percurso; viradas também usam comandos.

Resultado LIVE final:9697ticks, oito salas, quatro descobertas, sete eventos de dano, nenhum respawn, vitória real e4HP restantes. Esse resultado substitui a antiga vitória obtida com o controlador que segurava J e Q juntos. Uma tentativa intermediária falhou porque atravessava o chefe e permanecia longe de um alvo com1HP; o problema do controlador e a correção foram informados ao root, sem reduzir a dificuldade do encontro.
