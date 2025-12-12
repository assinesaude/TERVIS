export type QuestionCategory =
  | 'bulario'
  | 'general'
  | 'exam_analysis'
  | 'symptom_check'
  | 'prescription_reading'
  | 'other';

const BULARIO_KEYWORDS = [
  'bula',
  'bulário',
  'medicamento',
  'remédio',
  'posologia',
  'indicação',
  'indicações',
  'contraindicação',
  'contraindicações',
  'precaução',
  'precauções',
  'interação',
  'interações',
  'efeito adverso',
  'efeitos adversos',
  'efeito colateral',
  'efeitos colaterais',
  'dose',
  'dosagem',
  'administração',
  'período de carência',
  'periodo de carencia',
  'carência',
  'retirada',
  'anvisa',
  'mapa',
  'veterinário',
  'veterinario',
  'vet',
  'animal',
  'agrofit',
  'defensivo',
  'composição',
  'princípio ativo',
  'principio ativo',
  'fabricante',
  'laboratório',
  'laboratorio',
  'genérico',
  'generico',
  'similar',
  'referência',
  'referencia',
  'comprimido',
  'cápsula',
  'capsula',
  'xarope',
  'suspensão',
  'injetável',
  'injetavel',
  'pomada',
  'creme',
  'gel',
  'solução',
  'gotas',
  'ampola',
  'seringa',
  'medicação',
  'tarja',
  'receita',
  'prescrição',
  'antibiótico',
  'antibiotico',
  'anti-inflamatório',
  'antiinflamatorio',
  'analgésico',
  'analgesico',
  'dipirona',
  'paracetamol',
  'ibuprofeno',
  'amoxicilina',
  'azitromicina',
  'cefalexina',
  'dexametasona',
  'prednisolona',
  'ivermectina',
];

export function classifyQuestion(question: string): QuestionCategory {
  const normalizedQuestion = question
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const foundKeywords = BULARIO_KEYWORDS.filter(keyword => {
    const normalizedKeyword = keyword
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return normalizedQuestion.includes(normalizedKeyword);
  });

  if (foundKeywords.length >= 1) {
    return 'bulario';
  }

  if (
    normalizedQuestion.includes('exame') ||
    normalizedQuestion.includes('resultado') ||
    normalizedQuestion.includes('laudo')
  ) {
    return 'exam_analysis';
  }

  if (
    normalizedQuestion.includes('sintoma') ||
    normalizedQuestion.includes('sinto') ||
    normalizedQuestion.includes('dor')
  ) {
    return 'symptom_check';
  }

  if (
    normalizedQuestion.includes('prescricao') ||
    normalizedQuestion.includes('receita medica')
  ) {
    return 'prescription_reading';
  }

  return 'general';
}
