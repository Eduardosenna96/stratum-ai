# Shadowman — Cidade Interligada · protótipo 0.7

**Jogar:** https://eduardosenna96.github.io/stratum-ai/?v=0.7

Novo modelo de exploração em oito salas conectadas, com poderes desbloqueáveis, retornos, atalhos e progresso salvo neste navegador. E entra/interage; Espaço pula; setas/A D movem; ↑ ↓ usam escadas; J ataca; K usa Passo após conquistá-lo; M abre mapa; P pausa. O objetivo inicial é encontrar o Passo no Arquivo e voltar à Praça para liberar o Canal.

Agora usa três cenários individuais de1672×941, incluindo a composição do mockup de gameplay aprovado, em oito salas. A proporção16:9 é preservada e o canvas respeita DPR até2. Ainda não é a cidade final de24salas; interiores e exteriores são compartilhados entre salas. Tentáculo e Névoa são requisitos de travessias entre salas neste teste; as animações próprias ainda serão integradas.

Fonte: prototype/index.html, prototype/world.js e prototype/city-level.js. O site usa HTML leve, scripts e imagens separados com hashes; o HTML offline continua disponível pelo build. Build independente: `npm run build:city` → dist/Shadowman-Cidade.html. Testes: `npm run test:city` com servidor local. Publicar: `node tools/publish-pages.cjs --city`. Estrutura futura: docs/world/STRUCTURE.md.

---

# Modelo anterior — As sombras despertam · 0.5

Jogo de plataforma e poderes de sombra, de Eduardo Senna / Senna Comics.

Código do modelo anterior preservado em index.html, game.js e level.js. A URL pública agora serve o novo protótipo; o parâmetro de versão não seleciona versões antigas.

Esta correção utiliza a própria arte da prancha aprovada como seis cenários completos: Cais, Ruas, Telhados, Canal, Fábrica e Terminal08. Pisos, escadas e plataformas foram traçados sobre a imagem. A câmera mostra um ambiente por vez; as alturas globais de entrada/saída são alinhadas para manter o personagem nas mesmas coordenadas físicas durante as transições. O herói tem cerca de5% da largura da tela, conforme a referência.

## Controles

| Ação | Tecla |
|---|---|
| Andar | ← → ou A / D |
| Saltar | Espaço; solte cedo para salto menor |
| Escalar escadas/correntes | ↑ ↓ ou W / S |
| Conjurar sombras | J |
| Deslocamento sombrio | K |
| Pausar / continuar | P ou Escape |

↑ também salta quando não há escada próxima. Os controles de toque incluem subir/descer. Colete os fragmentos junto à fonte, na plataforma sob a ponte e diante do reator. Para sair do canal, volte à escada à esquerda. Na fábrica, o elevador liga o andar baixo ao superior; a escada da passarela permite explorar a parte mais alta. O Vigia paira, anuncia o mergulho, avança em direção fixa e fica vulnerável ao pousar.

Fragmentos e pontos seguros recuperam vida. Ao morrer é possível continuar com os fragmentos coletados. Não há salvamento após fechar o navegador. Som é opcional e começa desligado.

## HTML e desenvolvimento

`npm run build` cria `dist/Shadowman.html` com imagem, código e dados embutidos; não há requests externos de assets. O arquivo funciona sem servidor ou instalação. Se baixar o ZIP de fontes, extraia tudo e abra `index.html` mantendo os arquivos juntos.

Para desenvolver: Node.js18+; `npm start` usa a porta3000 (`PORT` opcional). Não é necessário instalar dependências de runtime.

```sh
npm test
npm run build
npm run test:browser
```

Os testes de navegador usam Playwright/Chromium disponíveis na máquina cloud. `CHROMIUM_PATH` e `BASE_URL` permitem outras instalações. `tests/phase-route.cjs` verifica ida/volta, fragmentos, escadas e elevador com inimigos desativados para isolar travessia; combate tem testes próprios. `npm run watch` executa regras e build ao editar sem chamadas de IA.

## Referências e fontes

- `docs/phase-01/full-map.png`: prancha aprovada.
- `assets/storyboard-clean.png`: edição da prancha para cenários, sem anotações.
- `docs/phase-01/FIDELITY.md`: critérios obrigatórios de comparação visual.
- `level.js`: recortes, pisos, escadas, elevador e encontros.
- `tools/trace-scenes.html`: ferramenta de inspeção com coordenadas e colisões.
- `skills/shadowman-development/SKILL.md`: fluxo econômico de continuidade.

A versão0.4 foi substituída por não reproduzir a composição aprovada. A correção0.5 ainda é um protótipo: arte limpa por IA pode ter diferenças locais da prancha original e a dificuldade precisa de avaliação com jogadores. Não confundir testes de mecânica com comprovação de fidelidade visual.
