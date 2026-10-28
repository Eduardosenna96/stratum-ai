# Fase 1 — mapa completo e montagem 0.4

Rota escolhida pelo criador: mistura de ruas, telhados e docas. A fase foi montada em `level.js`, com 9600 unidades de comprimento, seis setores e viewport fixo de 1200 × 600. As primeiras metas de altura/duração foram ajustadas à física real; tempo de jogadores ainda não foi medido.

O percurso vai do Cais das Sombras ao Terminal 08, passando por Rua dos Lampiões, Telhados do Relógio, Ponte dos Ecos e Pátio das Máquinas. Ruas formam uma rota principal legível; caminhos pelos telhados e manutenção do canal se reencontram. A arena final tem chão seguro e largo.

## Arte e recortes

`../../assets/phase-01-complete-atlas.png` contém36 peças por setor. O original1254 ×1254 RGBA foi preservado. `atlas-manifest.json` registra inventário e dimensões. Os espaçamentos não são uma grade uniforme: recortes explícitos são gerados por `tools/describe-phase-atlas.py` em `assets/phase-01-atlas.js/json`.

`full-map.png` apresenta os seis setores numerados em uma prancha dobrada de3colunas ×2linhas, com caminho principal azul e alternativas douradas. A imagem original2172 ×724 foi preservada. Ela orienta a composição e o ritmo; a montagem jogável adapta as posições a saltos, colisões e conexões, sem reproduzir cada pixel do conceito.

## Regras de travessia

- Escadas: subir automaticamente ao andar.
- Ponte: travessia superior ou descer na abertura para buscar o fragmento no canal; a escada da manutenção volta à ponte.
- Fábrica: elevador liga o chão à plataforma do gerador.
- Telhados: recompensas opcionais; ruas abaixo permitem recuperar uma queda.
- Pontos seguros: armazém, relógio, fábrica e entrada do terminal.

## Validação

9 testes de mecânica e20 cenários no Chromium passaram. A suíte fez ida e volta, pegou3 fragmentos e chegou à arena em4838 ticks físicos, sem teleporte ou respawn. Inimigos foram desligados nesse teste para isolar geometria; combate e projéteis têm verificações próprias. O elevador manteve apoio em900 ticks de subida/descida. Foram inspecionadas capturas dos seis setores.

## Correção de fidelidade0.5

A montagem0.4 foi rejeitada por desviar da composição da prancha. O runtime0.5 mostra os seis ambientes inteiros de `assets/storyboard-clean.png`, com pisos/escadas traçados em coordenadas da imagem e escala do personagem corrigida. A câmera muda de sala e altura de enquadramento; o personagem não é teleportado. As saídas/entradas têm a mesma altura física global.

O mapa atual tem7200 unidades horizontais e coordenadas verticais globais ajustadas por ambiente. Os9600 da versão anterior eram uma adaptação que não preservava o quadro; não usá-los como restrição visual. O trajeto foi validado em3876ticks de ida/volta com3fragmentos, escada e elevador, sem respawn; inimigos são desligados nesse teste para isolar geometria. A revisão visual segue `FIDELITY.md`.
