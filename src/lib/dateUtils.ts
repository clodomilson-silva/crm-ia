// Utilitário para conversão segura de datas para o Prisma
export function convertToDateTime(dateValue: string | Date | null | undefined): Date | null {
  if (!dateValue) return null;
  
  try {
    // Se já é um objeto Date, retorna como está
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    // Se é uma string, tenta converter
    let dateString = dateValue.toString();
    
    // Se é formato YYYY-MM-DD, adiciona horário para ISO-8601
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      dateString += 'T09:00:00.000Z';
    }
    
    // Cria e valida a data
    const date = new Date(dateString);
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      console.warn(`Data inválida: ${dateValue}`);
      return null;
    }
    
    return date;
  } catch (error) {
    console.error(`Erro ao converter data: ${dateValue}`, error);
    return null;
  }
}
