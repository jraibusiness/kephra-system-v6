// Conteúdo da proposta — mantido fiel ao PDF original da Chef Mariana.
module.exports = {
  titulo: 'Plano Mensal Personalizado',
  subtitulo: 'Alimentação personalizada para 2 pessoas',
  dias: 'Segunda a sexta-feira',
  intro:
    'Uma proposta pensada para unir praticidade, variedade e comida de verdade. As preparações são elaboradas pela chef Mariana, com técnica, cuidado e foco em refeições saborosas que funcionem bem tanto no consumo fresco quanto no congelamento.',
  plano: {
    preco: '450',
    inclui: ['40 marmitas de almoço', '20 para cada pessoa · 20 dias úteis'],
    shopper: 'Compras realizadas pela Caçarola conforme lista e planejamento do cardápio.',
    ingredientes: 'Não inclusos no valor do serviço; serão pagos pelo casal.',
  },
  semanas: [
    {
      n: 1, tema: 'Frescor e leveza',
      dias: [
        ['Frango grelhado com ervas', 'Cuscuz marroquino com legumes', 'Legumes assados'],
        ['Salmão em papillote com limão e ervas', 'Purê de mandioquinha', 'Brócolis e couve-flor'],
        ['Carne bovina grelhada ao molho de ervas', 'Batata rústica', 'Mix de legumes'],
        ['Frango ao estilo asiático com gengibre e gergelim', 'Arroz de jasmim', 'Legumes salteados'],
        ['Moqueca leve de peixe', 'Arroz', 'Farofa de castanhas e ervas'],
      ],
    },
    {
      n: 2, tema: 'Viagem gastronômica',
      dias: [
        ['Frango coreano agridoce leve', 'Arroz', 'Legumes salteados'],
        ['Almôndegas de carne magra ao molho de tomate', 'Purê de batata-doce', 'Brócolis'],
        ['Salmão grelhado com molho de limão', 'Cuscuz marroquino', 'Vagem'],
        ['Carne oriental com legumes', 'Arroz integral', 'Gergelim e cebolinha'],
        ['Frango ao curry suave', 'Arroz basmati', 'Legumes'],
      ],
    },
    {
      n: 3, tema: 'Comfort food com técnica',
      dias: [
        ['Bife bourguignon', 'Purê de batata', 'Cenouras assadas'],
        ['Frango assado com alho, ervas e limão', 'Batatinhas assadas', 'Vagem'],
        ['Ragu de carne', 'Polenta cremosa', 'Legumes'],
        ['Hambúrguer artesanal de carne magra', 'Batata rústica assada', 'Legumes'],
        ['Escondidinho de carne seca com abóbora cabotiá', 'Salada fresca'],
      ],
    },
    {
      n: 4, tema: 'Preparações especiais',
      dias: [
        ['Frango recheado com espinafre e ricota', 'Purê de batata-doce', 'Legumes assados'],
        ['Carne desfiada ao molho', 'Arroz integral', 'Abóbora assada'],
        ['Peixe assado com crosta de ervas', 'Cuscuz marroquino', 'Legumes'],
        ['Frango xadrez em versão leve', 'Arroz', 'Legumes'],
        ['Nhoque de batata-doce com ragu de carne', 'Legumes verdes'],
      ],
    },
  ],
  diasSemana: [['Seg', 'Segunda'], ['Ter', 'Terça'], ['Qua', 'Quarta'], ['Qui', 'Quinta'], ['Sex', 'Sexta']],
  complemento: {
    texto:
      'Para complementar os 10 dias de almoço, o casal poderá incluir uma produção adicional. A composição será combinada previamente conforme preferências e rotina.',
    itens: [
      ['5', 'travessas de jantar', 'aproximadamente 10 dias de jantar para duas pessoas'],
      ['10', 'dias de lanches', 'para o casal'],
      ['1', 'torta na travessa', ''],
    ],
    opcoes: [
      { id: 'semanal', nome: 'Entrega semanal', valor: 400, desc: 'Maior frequência de entrega e organização das porções ao longo do mês.' },
      { id: 'quinzenal', nome: 'Entrega quinzenal', valor: 300, desc: 'Duas entregas no período, reduzindo deslocamentos e facilitando o armazenamento.' },
      { id: 'mensal', nome: 'Entrega mensal', valor: 200, desc: 'Toda a produção é entregue junto com as marmitas do mês.' },
    ],
    travessas: 'As opções são sugestões e podem variar conforme o cardápio e a preferência do casal.',
    lanches: 'Os lanches serão definidos previamente e podem alternar entre sanduíches e outras preparações práticas.',
  },
  cronograma: [
    ['13/10/2026', '1ª entrega', 'Primeiro plano mensal'],
    ['aprox. 23/11/2026', '2ª entrega', 'Segundo plano mensal'],
    ['Após o fim do ano', 'Reavaliação', 'Reavaliação do formato para 2027, com possibilidade de migração para o plano quinzenal.'],
  ],
  armazenamento:
    'Na modalidade de entrega mensal, toda a produção contratada é organizada e entregue em uma única ocasião. A partir do recebimento, o armazenamento e a conservação dos alimentos ficam sob responsabilidade do cliente, seguindo as orientações de conservação fornecidas pela Caçarola. As vasilhas/embalagens e a logística de devolução serão combinadas previamente entre as partes.',
  observacao:
    'Este é um cardápio inicial sugerido. As preparações podem ser ajustadas conforme preferências, rotina e eventuais orientações nutricionais do casal.',
  assinatura: 'comida de verdade, feita com carinho e técnica.',
  chef: 'Mariana · Chef de Cozinha · PUC-PR',
  whats: '(11) 98855-0641',
  whatsLink:
    'https://wa.me/5511988550641?text=' +
    encodeURIComponent('Olá, Mariana! Recebi a proposta do Plano Mensal Personalizado da Caçarola.'),
};
