/**
 * A placeholder utility for mapping CSV rows to a Contact object.
 * In a real implementation, this would handle various column names
 * and data transformations.
 * @param row A single row from a parsed CSV file.
 * @returns A partial Contact object.
 */
export function mapCsvRowToContact(row: { [key: string]: string }): {
  email: string;
  name?: string;
} {
  const email = row['email'] || row['Email'] || row['E-mail'];
  const name = row['name'] || row['Name'];

  if (!email) {
    throw new Error('CSV row must contain an "email" column.');
  }

  return { email, name };
}
