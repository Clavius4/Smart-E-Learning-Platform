import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Logo from 'assets/images/Logo.png';

interface LogoLoaderProps {
  fullscreen?: boolean;
}

const LogoLoader = ({ fullscreen = false }: LogoLoaderProps) => {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      width={1}
      minHeight={fullscreen ? '100vh' : '70vh'}
      spacing={1}
    >
      <Box
        component="img"
        src={Logo}
        alt="Loading"
        height={56}
        width={56}
        sx={{
          animation: 'logo-bounce 1s ease-in-out infinite',
          '@keyframes logo-bounce': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-22px)' },
          },
        }}
      />
      <Box
        sx={{
          width: 36,
          height: 8,
          borderRadius: '50%',
          bgcolor: 'text.disabled',
          animation: 'logo-shadow 1s ease-in-out infinite',
          '@keyframes logo-shadow': {
            '0%, 100%': { transform: 'scaleX(1)', opacity: 0.3 },
            '50%': { transform: 'scaleX(0.55)', opacity: 0.12 },
          },
        }}
      />
      <Typography variant="caption" color="text.disabled" fontWeight={500} letterSpacing={1} pt={1}>
        Loading...
      </Typography>
    </Stack>
  );
};

export default LogoLoader;
