# Shadowman / Senna Comics

Para desenvolver este jogo, leia `skills/shadowman-development/SKILL.md` e siga o ciclo econômico descrito ali. O usuário autorizou um agente de QA com escopo limitado; não expanda para vários agentes sem necessidade concreta.

Preserve o Shadowman de Eduardo Senna: capuz negro, olhos azuis, infinito azul no peito e poderes de sombra. Não introduza espada. Reutilize `assets/shadowman.png` e mantenha cenário de cidade industrial gótica.

Não há dependências de execução para instalar. `npm test` verifica nove regras; `npm run build` cria o HTML único. `npm run test:browser` verifica 18 cenários e exige servidor local, Chromium e Playwright, já disponíveis no runtime cloud. Rode verificações proporcionais e confirme os resultados reais.

Registre mudanças e limites em `docs/DEVELOPMENT.md`. Não prometa publicação, download pela interface ou execução contínua de IA sem capacidade comprovada. Use o checkout existente; não crie worktrees sem solicitação.
