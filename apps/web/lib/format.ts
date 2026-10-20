/** Petit formatage lisible pour l'outil QR. */

export function formatOctets(octets: number): string {
  if (octets < 1024) return `${octets} o`;
  const kilo = octets / 1024;
  if (kilo < 1024) return `${kilo.toFixed(kilo < 10 ? 1 : 0)} Ko`;
  const mega = kilo / 1024;
  return `${mega.toFixed(mega < 10 ? 1 : 0)} Mo`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
