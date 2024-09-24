export const _renderCurrency = (
  value: number, 
  useParentheses: boolean = false, 
  showCurrencySymbol: boolean = true // Option to toggle currency symbol, default is true
): string => {
  let number = Number(value);

  // Format the number with or without 'Rp' currency symbol
  let formattedValue = number?.toLocaleString('id-ID', {
    style: showCurrencySymbol ? 'currency' : 'decimal', // Use currency style only if showCurrencySymbol is true
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  });

  // If useParentheses is true, format without the 'Rp' and add parentheses
  if (useParentheses) {
    formattedValue = number?.toLocaleString('id-ID', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    });
    formattedValue = `( ${formattedValue} )`; // Enclose in parentheses
  }

  return formattedValue;
};
