import { Stack, TextField, MenuItem } from '@mui/material';

const MONTHS = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];

// Date « YYYY-MM » ou « YYYY » (mois facultatif) : un <input type="month">
// natif ne sait pas afficher une année seule, fréquente pour les formations.
export default function DateField({ label, value, onChange, disabled }) {
  const [year = '', month = ''] = String(value || '').split('-');

  // Le mois est conservé même si l'année est encore incomplète (« -05 », « 202-05 ») :
  // on peut choisir le mois avant de saisir l'année.
  const emit = (y, m) => {
    const yy = String(y || '').replace(/\D/g, '').slice(0, 4);
    onChange({ target: { value: m ? `${yy}-${m}` : yy, type: 'text' } });
  };

  return (
    <Stack direction="row" spacing={1}>
      <TextField
        select fullWidth size="small" label={`${label} · mois`} value={month} disabled={disabled}
        onChange={(e) => emit(year, e.target.value)}
      >
        <MenuItem value=""><em>—</em></MenuItem>
        {MONTHS.map((m, i) => (
          <MenuItem key={m} value={String(i + 1).padStart(2, '0')}>{m}</MenuItem>
        ))}
      </TextField>
      <TextField
        size="small" label="Année" value={year} disabled={disabled} placeholder="AAAA"
        onChange={(e) => emit(e.target.value, month)}
        inputProps={{ inputMode: 'numeric', maxLength: 4 }}
        sx={{ width: 96, flexShrink: 0 }}
      />
    </Stack>
  );
}
