import { Button, CircularProgress } from '@mui/material';
import type { ButtonProps } from '@mui/material';

interface LoadingButtonProps extends ButtonProps {
  children?: React.ReactNode;
  isLoading?: boolean;
};

export const LoadingButton = ({ children, isLoading, ...rest }: LoadingButtonProps) => {
  return (
    <Button {...rest}>
      {!isLoading && children}
      {isLoading && <CircularProgress color="secondary"/>}
    </Button>
  );
}
