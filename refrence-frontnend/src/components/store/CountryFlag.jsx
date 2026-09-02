import countries from "../../utils/countries.json";

const FLAG_BY_ISO = countries.reduce((acc, country) => {
  if (country?.isoCode) {
    acc[String(country.isoCode).toUpperCase()] = country;
  }
  return acc;
}, {});

export const getCountryByIso = (countryCode = "") => {
  const code = String(countryCode || "").toUpperCase();
  return FLAG_BY_ISO[code] || null;
};

export default function CountryFlag({
  countryCode = "",
  className = "",
  width = 20,
  height = 14
}) {
  const country = getCountryByIso(countryCode);
  const code = String(countryCode || "").toUpperCase();

  if (!country?.flag) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-none border border-[var(--ink)]/15 bg-[var(--ink)]/[0.04] text-[9px] font-semibold text-[var(--ink)]/50 ${className}`}
        style={{ width, height }}
        title={code || "Country"}
        aria-hidden="true"
      >
        {code || "—"}
      </span>
    );
  }

  return (
    <img
      src={country.flag}
      alt={country.name || code}
      title={country.name || code}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={`inline-block object-cover rounded-none border border-[var(--ink)]/10 ${className}`}
      style={{ width, height }}
    />
  );
}