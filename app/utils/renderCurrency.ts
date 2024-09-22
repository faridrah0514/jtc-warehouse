export const _renderCurrency = (value: number, useParentheses: boolean = false): string => {
  let number = Number(value);

  // Format the number with 'Rp' currency by default
  let formattedValue = number?.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  });

  // If useParentheses is true, remove 'Rp' and format with parentheses
  if (useParentheses) {
    formattedValue = number?.toLocaleString('id-ID', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    });
    formattedValue = `( ${formattedValue} )`; // Enclose in parentheses
  }

  return formattedValue;
};
