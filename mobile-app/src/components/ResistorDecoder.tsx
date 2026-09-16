import { useMemo, useState } from 'react';

interface Band {
  name: string;
  hex: string;
  digit: number | null; // significant figure value
  multiplier: number | null; // 10^n
  tolerance: number | null; // percent
}

// Standard resistor color code
const BANDS: Band[] = [
  { name: 'Black', hex: '#000000', digit: 0, multiplier: 1, tolerance: null },
  { name: 'Brown', hex: '#7B3F00', digit: 1, multiplier: 10, tolerance: 1 },
  { name: 'Red', hex: '#E01010', digit: 2, multiplier: 100, tolerance: 2 },
  { name: 'Orange', hex: '#FF7A00', digit: 3, multiplier: 1_000, tolerance: null },
  { name: 'Yellow', hex: '#FFD400', digit: 4, multiplier: 10_000, tolerance: null },
  { name: 'Green', hex: '#00A84F', digit: 5, multiplier: 100_000, tolerance: 0.5 },
  { name: 'Blue', hex: '#0066CC', digit: 6, multiplier: 1_000_000, tolerance: 0.25 },
  { name: 'Violet', hex: '#8B00FF', digit: 7, multiplier: 10_000_000, tolerance: 0.1 },
  { name: 'Grey', hex: '#808080', digit: 8, multiplier: 100_000_000, tolerance: 0.05 },
  { name: 'White', hex: '#F5F5F5', digit: 9, multiplier: 1_000_000_000, tolerance: null },
  { name: 'Gold', hex: '#D4AF37', digit: null, multiplier: 0.1, tolerance: 5 },
  { name: 'Silver', hex: '#C0C0C0', digit: null, multiplier: 0.01, tolerance: 10 },
];

const digitBands = BANDS.filter((b) => b.digit !== null);
const multiplierBands = BANDS.filter((b) => b.multiplier !== null);
const toleranceBands = BANDS.filter((b) => b.tolerance !== null);

function formatOhms(value: number): string {
  if (value >= 1_000_000) return `${trim(value / 1_000_000)} MΩ`;
  if (value >= 1_000) return `${trim(value / 1_000)} kΩ`;
  return `${trim(value)} Ω`;
}
function trim(n: number): string {
  return parseFloat(n.toFixed(3)).toString();
}

export default function ResistorDecoder() {
  const [b1, setB1] = useState(BANDS[2]); // Red = 2
  const [b2, setB2] = useState(BANDS[7]); // Violet = 7
  const [mult, setMult] = useState(BANDS[3]); // Orange = x1k
  const [tol, setTol] = useState(BANDS[1]); // Brown = 1%

  const { value, low, high } = useMemo(() => {
    const base = (b1.digit! * 10 + b2.digit!) * mult.multiplier!;
    const t = tol.tolerance! / 100;
    return { value: base, low: base * (1 - t), high: base * (1 + t) };
  }, [b1, b2, mult, tol]);

  return (
    <div className="card space-y-5">
      <h2 className="font-extrabold text-lg">🎨 Resistor 4-Band Decoder</h2>

      {/* visual resistor */}
      <div className="relative bg-ink-900 rounded-2xl py-8 flex items-center justify-center">
        <div className="absolute left-0 right-0 h-1 bg-neutral-600" />
        <div className="relative flex items-center bg-[#D9C3A0] rounded-lg px-6 py-6 shadow-lg">
          {[b1, b2, mult, tol].map((b, i) => (
            <span
              key={i}
              className="w-3 h-14 mx-1.5 rounded-sm border border-black/20"
              style={{ backgroundColor: b.hex }}
            />
          ))}
        </div>
      </div>

      {/* readout */}
      <div className="text-center bg-ink-900 rounded-2xl py-4">
        <p className="text-3xl font-extrabold text-brand-lime">{formatOhms(value)}</p>
        <p className="text-sm text-neutral-400 mt-1">
          ±{tol.tolerance}% → {formatOhms(low)} … {formatOhms(high)}
        </p>
      </div>

      {/* selectors */}
      <BandSelect label="Band 1 (1st digit)" bands={digitBands} value={b1} onChange={setB1} kind="digit" />
      <BandSelect label="Band 2 (2nd digit)" bands={digitBands} value={b2} onChange={setB2} kind="digit" />
      <BandSelect label="Band 3 (multiplier)" bands={multiplierBands} value={mult} onChange={setMult} kind="mult" />
      <BandSelect label="Band 4 (tolerance)" bands={toleranceBands} value={tol} onChange={setTol} kind="tol" />
    </div>
  );
}

function BandSelect({
  label,
  bands,
  value,
  onChange,
  kind,
}: {
  label: string;
  bands: Band[];
  value: Band;
  onChange: (b: Band) => void;
  kind: 'digit' | 'mult' | 'tol';
}) {
  const desc = (b: Band) =>
    kind === 'digit' ? `${b.name} (${b.digit})` : kind === 'mult' ? `${b.name} (×${b.multiplier})` : `${b.name} (±${b.tolerance}%)`;
  return (
    <div>
      <label className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-400">{label}</label>
      <div className="mt-1 flex items-center gap-2">
        <span className="w-6 h-6 rounded border border-black/30 shrink-0" style={{ backgroundColor: value.hex }} />
        <select
          value={value.name}
          onChange={(e) => onChange(bands.find((b) => b.name === e.target.value)!)}
          className="flex-1 bg-ink-700 rounded-xl px-3 py-2 font-bold text-neutral-100 border-2 border-ink-600 focus:border-brand-blue outline-none"
        >
          {bands.map((b) => (
            <option key={b.name} value={b.name}>
              {desc(b)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
