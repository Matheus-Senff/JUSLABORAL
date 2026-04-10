export function maskCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2');
}

export function maskCurrency(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function maskPercentage(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 5);
  if (!digits) return '';
  const num = parseInt(digits, 10) / 100;
  return `${num.toFixed(2)}%`;
}

export function maskNUP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 20);
  return digits
    .replace(/(\d{7})(\d)/, '$1-$2')
    .replace(/(\d{2})\.?(\d)/, '$1.$2')
    .replace(/(\d{4})\.?(\d)/, '$1.$2')
    .replace(/(\d{1})\.?(\d)/, '$1.$2')
    .replace(/(\d{2})$/, '$1');
}
