# Travessia Shadowman — referência Prince of Persia

Pedido: experiência de travessia legível, sem os portais azuis sinalizados na captura. Referência de comportamento, não utilização de código/arte de Prince of Persia. Sem pesquisa externa ou geração de imagens nesta rodada.

Critérios do teste0.9:

- Ambiente permanece visível sem contornos/ícones flutuantes de portas. Contexto aparece só na proximidade.
- Cais/Ruas conectam ao caminhar na direção da saída, com proteção contra retorno imediato. Interior do Arquivo exigeE: sua entrada não pode capturar quem está indo ao pé da escadaria dos Telhados.
- Shift reduz velocidade e impede passo no vazio. Saltar permite sair da borda voluntariamente.
- Contato lateral em queda permite agarrar borda, inclusive durante invulnerabilidade. ↑ inicia subida gradual em16ticks; ↓ solta. Durante subida o personagem tem trajetória contínua até o apoio.
- Mensagem de bloqueio precisa permanecer legível após tentativa; não pode ser apagada pela dica de interação genérica.
- Não alterar geometrias nem inventar novas mecânicas sem testar o retorno e a progressão existentes.

Limites: poses de agarrar/subir ainda reutilizam quadros de salto existentes, sem sprite sheet dedicada. Oito salas compartilham três cenários. Só Cais/Ruas usa transição automática; outros acessos são interações contextuais. Isto é uma revisão deUX, não uma recriação completa dePrinceofPersia nem campanha final.
