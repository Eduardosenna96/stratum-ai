# Shadowman / Senna Comics

Para desenvolver este jogo, leia `skills/shadowman-development/SKILL.md` e siga o ciclo econômico descrito ali. O usuário autorizou um agente de QA com escopo limitado; não expanda para vários agentes sem necessidade concreta.

Preserve o Shadowman de Eduardo Senna: capuz negro, olhos azuis, infinito azul no peito e poderes de sombra. Não introduza espada. Reutilize `assets/shadowman.png` e mantenha cenário de cidade industrial gótica.

Não há dependências de execução para instalar. `npm test` verifica as regras atuais; `npm run build` cria o HTML único. `npm run test:browser` verifica o jogo e exige servidor local, Chromium e Playwright, já disponíveis no runtime cloud. Rode verificações proporcionais e confirme os resultados reais.

Registre mudanças e limites em `docs/DEVELOPMENT.md`. Não prometa publicação, download pela interface ou execução contínua de IA sem capacidade comprovada. Use o checkout existente; não crie worktrees sem solicitação.

O mapa completo é autorado em `level.js`. Mudanças em rotas exigem o teste de percurso `tests/phase-route.cjs`, incluindo ida e volta, fragmentos e elevador. Use `level.scenes[].crop` para enquadrar os cenários atuais. O atlas modular anterior não substitui a prancha.

Antes de editar ou publicar o visual, leia `docs/phase-01/FIDELITY.md`. Compare cada sala com `docs/phase-01/full-map.png`; testes mecânicos não demonstram fidelidade visual. A versão0.5 usa os quadros limpos e câmera por sala.
