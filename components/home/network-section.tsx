import { getPublicNetworkCountries } from "@/lib/api/network";

export async function NetworkSection() {
  const countries = await getPublicNetworkCountries();
  if (countries.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h2 className="text-2xl font-semibold">Mạng lưới quốc gia</h2>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {countries.map((country) => (
          <li key={country.name} className="rounded-md border p-4">
            <p className="font-medium">{country.name}</p>
            {country.city && (
              <p className="text-sm text-muted-foreground">{country.city}</p>
            )}
            {country.note && (
              <p className="text-sm text-muted-foreground">{country.note}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
