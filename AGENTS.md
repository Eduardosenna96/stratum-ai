# Shadowman / Senna Comics

Leia skills/shadowman-development/SKILL.md antes de desenvolver. Preserve o Shadowman de Eduardo Senna: capuz negro, rosto oculto, olhos azuis, infinito azul no peito, poderes de sombra e nenhuma espada. Usuário autorizou um especialista de desenvolvimento/QA; no máximo um agente de apoio por rodada, sem expansão sem necessidade.

## Modelo atual

prototype/index.html + tile-world.js + tile-render.js + world.js. Raiz index.html encaminha para o jogo. Oito salas3072×960 usam tilemap48 e degraus12. A arte não define colisão: plataformas desenhadas e físicas vêm dos mesmos dados. Não volte a colocar retas invisíveis sobre fachadas/escadas pintadas. Leia docs/ux/DEPTH-REVIEW.md e docs/phase-01/FIDELITY.md.

Parallax: far0.14, mid0.43, mundo1. PNGs são masters; WebPs sem perdas são usados em runtime. Reaproveite as folhas entre mapas e confira pivôs, mãos, pés e apoios. AtaqueJ é projétil de sombra; Q é absorção parada, exclusiva do disparo. Não causar dano com hitbox invisível de ataque antigo.

## Validação

- npm test: autoria/sintaxe atuais.
- npm run build: exporta mapa e cria HTML independente + site com hashes.
- npm run test:browser: browser atual.
- node tests/tile-route.cjs: geometria isolada e combate ativo, sem reposicionar herói.
- node tests/city-build.cjs: contrato de entrega.

Inspecione capturas reais de aproximação, salto, borda, degraus, chegada, retorno, escada e elevador. Testes mecânicos não demonstram fidelidade visual nem diversão. Não publique só porque um teste passou. Registre mudanças e limitações em docs/DEVELOPMENT.md. Não prometa processamento contínuo de IA ou qualidade AAA. Testes/build antigos são preservados com scripts legacy; não usá-los como prova do modelo atual.
