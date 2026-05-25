import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { Box, IconButton, Typography}  from '@mui/material';

export interface IncrementerProps {
  title?: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  isDisabled?: boolean;
}

export const Incrementer = ({ title, value, onDecrement, onIncrement, isDisabled }: IncrementerProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
      {title && <Typography variant="subtitle2" sx={{ fontWeight: "700" }}>{title}</Typography>}
      <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <IconButton onClick={onDecrement} disabled={isDisabled}><RemoveIcon /></IconButton>
        <Typography sx={{ px: 2, fontWeight: 600 }}>{value}</Typography>
        <IconButton onClick={onIncrement} disabled={isDisabled}><AddIcon /></IconButton>
      </Box>
    </Box>
  );
};