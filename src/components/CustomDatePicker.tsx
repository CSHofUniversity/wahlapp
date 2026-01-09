// src/components/CustomDatePicker.tsx

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";

interface Props {
  label: string;
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  format?: string;
}

// TODO evtl minDate und maxDate als Prop auslagern umd Zeitraum zu definieren.

export function CustomDatePicker({
  label,
  value,
  onChange,
  required = false,
  error = false,
  helperText = " ",
  format = "DD.MM.YYYY",
}: Props) {
  return (
    <DatePicker
      label={label}
      value={value}
      onChange={(v) => onChange(v)}
      format={format}
      slotProps={{
        textField: {
          variant: "standard",
          fullWidth: true,
          required,
          error,
          helperText,
        },
      }}
    />
  );
}
