# Critério obrigatório de fidelidade

A prancha aprovada é `full-map.png`. A versão0.4 usava o mesmo kit, mas alterava composição, escala e caminhos; por isso ela não atende ao visual aprovado. Aprovar testes mecânicos não substitui a comparação com a referência.

## Base0.5

`assets/storyboard-clean.png` remove as anotações da prancha, preservando arquitetura e enquadramento. Os seis recortes são explícitos, pois o processamento da imagem alterou levemente as divisórias. O runtime usa cada quadro como cenário inteiro. Pisos/escadas são traçados em coordenadas da arte; nenhum fundo urbano genérico substitui os ambientes.

A câmera enquadra uma sala por vez. As alturas globais das salas são deslocadas para alinhar saída e entrada: a câmera muda de enquadramento, mas o personagem continua nas coordenadas físicas, sem teleporte. A escala visual do herói foi reduzida para cerca de5% da largura do quadro. ↑/↓ permitem usar as escadas visíveis.

## Comparação por quadro

1. Cais: guindaste à esquerda, armazém à direita, ponte de madeira contínua, escadaria no lado direito.
2. Ruas: fachadas altas, arco e fonte no centro, rua baixa contínua e escada lateral.
3. Telhados: relógio central, descida para o vale e subida do outro lado; balcão superior à direita.
4. Canal: ponte grande acima, caminho de manutenção abaixo, água e escada real conectando os caminhos.
5. Fábrica: fachadas industriais, reator baixo, elevador no poço e passarela superior.
6. Terminal: ambiente interior com arco enorme, piso amplo e fenda azul à direita. Não inserir skyline urbano neste quadro.

Antes de publicar: verificar seis screenshots contra a referência, ajustar botas aos pisos, testar ida/volta, chaves, escadas, elevador e combate. Não esconder divergência visual com uma contagem de testes. A arte limpa é uma edição assistida por IA, não uma cópia pixel a pixel; alterações residuais devem ser examinadas.
