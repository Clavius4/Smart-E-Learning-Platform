import { Typography } from '@mui/material';

const Footer = () => {
  return (
    <Typography
      mt={0.5}
      px={{ xs: 0, md: 3.75 }}
      py={3}
      color="text.secondary"
      variant="body2"
      sx={{ textAlign: { xs: 'center', md: 'right' } }}
      letterSpacing={0.5}
      fontWeight={500}
    >
      © {new Date().getFullYear()} E-Kids Smart Learning. All rights reserved.
    </Typography>
  );
};

export default Footer;
