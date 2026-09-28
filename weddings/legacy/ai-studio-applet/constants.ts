import { Language } from "./types";

export const CITIES = [
  'Santos',
  'São Vicente',
  'Praia Grande',
  'Guarujá',
  // 'Outra'/'Other' is handled dynamically in the component
];

export const CHURCHES: Record<string, string[]> = {
  Santos: [
    'Basílica do Embaré',
    'Catedral de Santos',
    'Santuário do Valongo',
    'Igreja do Coração de Maria',
    'Capela da Santa Casa',
  ],
  'São Vicente': [
    'Matriz de São Vicente Mártir',
    'Igreja Nossa Senhora das Graças',
  ],
  'Praia Grande': [
    'Matriz Santo Antônio',
    'Paróquia Nossa Senhora das Graças',
  ],
  'Guarujá': [
    'Matriz de Guarujá',
    'Paróquia Nossa Senhora de Fátima',
  ],
};

export const TRANSLATIONS = {
  pt: {
    title: "Weddings",
    subtitle: "Coral & Orquestra",
    stepCounter: "Passo",
    of: "de",
    back: "Voltar",
    next: "Próximo",
    sending: "Enviando...",
    submit: "Solicitar Orçamento",
    copyright: "Weddings Coral & Orquestra. Todos os direitos reservados.",
    other: "Outra",
    select: "Selecione...",
    
    // Success
    successTitle: "Obrigado!",
    successMessage: "Recebemos suas informações com sucesso. Nossa equipe preparará uma proposta única para o seu grande dia e entrará em contato via WhatsApp em breve.",
    backHome: "Voltar ao Início",

    // Step 1
    s1Title: "Vamos começar?",
    s1Name: "Nome Completo",
    s1NamePlace: "Como você gostaria de ser chamado?",
    s1Phone: "WhatsApp / Celular",
    s1PhonePlace: "+55 (13) 99999-9999",
    s1PhoneHelp: "Insira o código do país se for número internacional.",
    s1Email: "Email",
    s1EmailPlace: "seu@email.com",

    // Step 2
    s2Title: "Quando será o grande dia?",
    s2Subtitle: "Datas disponíveis a partir de agora",

    // Step 3
    s3Title: "Onde será a cerimônia?",
    s3City: "Cidade",
    s3Church: "Igreja / Local",
    s3CustomLabel: "Qual o nome da igreja ou local?",
    s3CustomPlace: "Digite o nome do local",

    // Step 4
    s4Title: "Sonho & Realidade",
    s4Budget: "Estimativa de Investimento Musical",
    s4Vision: "Sua visão para a cerimônia",
    s4VisionPlace: "Descreva brevemente o que você sonha... (Ex: Quero algo emocionante com violinos, ou algo grandioso com trompetes)",

    // Step 5
    s5Title: "Perfil Musical",
    s5Subtitle: "Selecione até",
    s5Subtitle2: "3 estilos",
    s5Subtitle3: "que mais combinam com o casal. Criaremos um perfil personalizado para vocês.",
    s5Profile: "Perfil Sugerido:",

    // Step 6
    s6Title: "A Música Especial",
    s6Quote: "\"A música tem o poder de eternizar momentos.\"",
    s6Label: "Qual música marcou a história de vocês?",
    s6Place: "Aquela música que tocou no primeiro beijo, no pedido de namoro ou casamento...",
    
    // Profiles
    pEclectic: "Eclético",
    pClassic: "Clássico & Tradicional",
    pModern: "Romântico & Moderno",
    pAuthentic: "Autêntico & Personalizado",
  },
  en: {
    title: "Weddings",
    subtitle: "Choir & Orchestra",
    stepCounter: "Step",
    of: "of",
    back: "Back",
    next: "Next",
    sending: "Sending...",
    submit: "Request Quote",
    copyright: "Weddings Choir & Orchestra. All rights reserved.",
    other: "Other",
    select: "Select...",

    // Success
    successTitle: "Thank You!",
    successMessage: "We have successfully received your information. Our team will prepare a unique proposal for your big day and will contact you via WhatsApp shortly.",
    backHome: "Back to Start",

    // Step 1
    s1Title: "Let's get started?",
    s1Name: "Full Name",
    s1NamePlace: "How would you like to be called?",
    s1Phone: "WhatsApp / Mobile",
    s1PhonePlace: "+1 (555) 000-0000",
    s1PhoneHelp: "Please include country code for international numbers.",
    s1Email: "Email",
    s1EmailPlace: "you@email.com",

    // Step 2
    s2Title: "When is the big day?",
    s2Subtitle: "Dates available starting from now",

    // Step 3
    s3Title: "Where is the ceremony?",
    s3City: "City",
    s3Church: "Church / Venue",
    s3CustomLabel: "What is the name of the church or venue?",
    s3CustomPlace: "Type the venue name",

    // Step 4
    s4Title: "Dream & Reality",
    s4Budget: "Estimated Music Budget",
    s4Vision: "Your vision for the ceremony",
    s4VisionPlace: "Briefly describe what you dream of... (Ex: I want something emotional with violins, or something grand with trumpets)",

    // Step 5
    s5Title: "Musical Profile",
    s5Subtitle: "Select up to",
    s5Subtitle2: "3 styles",
    s5Subtitle3: "that match the couple best. We will create a custom profile for you.",
    s5Profile: "Suggested Profile:",

    // Step 6
    s6Title: "The Special Song",
    s6Quote: "\"Music has the power to make moments eternal.\"",
    s6Label: "Which song marks your history?",
    s6Place: "That song that played during your first kiss, the proposal, or a special date...",

    // Profiles
    pEclectic: "Eclectic",
    pClassic: "Classic & Traditional",
    pModern: "Romantic & Modern",
    pAuthentic: "Authentic & Personalized",
  }
};

export const getBudgetRanges = (lang: Language) => {
  if (lang === 'en') {
    return [
      'Up to R$ 3.000',
      'R$ 3.000 to R$ 5.000',
      'R$ 5.000 to R$ 8.000',
      'R$ 8.000 to R$ 12.000',
      'Above R$ 12.000',
    ];
  }
  return [
    'Até R$ 3.000',
    'R$ 3.000 a R$ 5.000',
    'R$ 5.000 a R$ 8.000',
    'R$ 8.000 a R$ 12.000',
    'Acima de R$ 12.000',
  ];
};

export const getMusicStyles = (lang: Language) => {
  if (lang === 'en') {
    return [
      { id: 'classic', label: 'Traditional Classical', tags: ['Solemnity', 'Tradition'] },
      { id: 'modern', label: 'Pop & Modern (Coldplay, Ed Sheeran)', tags: ['Romance', 'Current'] },
      { id: 'movies', label: 'Movie/Series Themes (Bridgerton, Disney)', tags: ['Emotion', 'Cinematic'] },
      { id: 'gospel', label: 'Gospel / Worship', tags: ['Faith', 'Worship'] },
      { id: 'jazz', label: 'Jazz / Soul', tags: ['Sophistication', 'Elegance'] },
      { id: 'rock', label: 'Classic Rock (Queen, Beatles)', tags: ['Personality', 'Energy'] },
      { id: 'mpb', label: 'Brazilian Music (MPB)', tags: ['Poetry', 'Identity'] },
      { id: 'celta', label: 'Celtic / Medieval', tags: ['Mystical', 'Unique'] },
      { id: 'catholic', label: 'Traditional Catholic', tags: ['Liturgical', 'Sacred'] },
      { id: 'instrumental', label: 'Instrumental Only', tags: ['Lightness', 'Instrumental'] },
    ];
  }
  return [
    { id: 'classic', label: 'Clássico Tradicional', tags: ['Solenidade', 'Tradição'] },
    { id: 'modern', label: 'Pop & Moderno (Coldplay, Ed Sheeran)', tags: ['Romantismo', 'Atualidade'] },
    { id: 'movies', label: 'Temas de Filmes/Séries (Bridgerton, Disney)', tags: ['Emoção', 'Cinematográfico'] },
    { id: 'gospel', label: 'Gospel / Louvor', tags: ['Fé', 'Adoração'] },
    { id: 'jazz', label: 'Jazz / Soul', tags: ['Sofisticação', 'Elegância'] },
    { id: 'rock', label: 'Rock Clássico (Queen, Beatles)', tags: ['Personalidade', 'Energia'] },
    { id: 'mpb', label: 'Música Brasileira (MPB)', tags: ['Poesia', 'Identidade'] },
    { id: 'celta', label: 'Celta / Medieval', tags: ['Místico', 'Diferenciado'] },
    { id: 'catholic', label: 'Católico Tradicional', tags: ['Litúrgico', 'Sagrado'] },
    { id: 'instrumental', label: 'Apenas Instrumental', tags: ['Leveza', 'Instrumental'] },
  ];
};

// Helper to generate dynamic dates
export const getFutureDateRanges = (lang: Language) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11
  
  const options: string[] = [];

  const semesterLabel = lang === 'en' ? 'Semester' : 'Semestre';
  const onwardsLabel = lang === 'en' ? 'onwards' : 'em diante';

  // Logic to show logical next steps based on current time
  if (currentMonth < 6) {
    options.push(`2º ${semesterLabel} ${currentYear}`);
  }
  
  options.push(`1º ${semesterLabel} ${currentYear + 1}`);
  options.push(`2º ${semesterLabel} ${currentYear + 1}`);
  options.push(`Jan-Mar ${currentYear + 1}`);
  options.push(`Abr-Jun ${currentYear + 1}`);
  options.push(`Jul-Set ${currentYear + 1}`);
  options.push(`Out-Dez ${currentYear + 1}`);
  options.push(`${currentYear + 2} ${onwardsLabel}`);

  return options;
};