import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useLocation, Location } from 'react-router-dom';
import api from '../../services/api';
import {
  Box,
  Stack,
  Button,
  Divider,
  IconButton,
  ButtonBase,
  InputAdornment,
  FormControlLabel,
  Typography,
  TextField,
  Checkbox,
  Link,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';
import Logo from 'assets/images/Logo.png';
import paths from 'routes/paths';
import { useAuth } from '../../contexts/AuthContext';

interface AuthLocationState {
  from?: { pathname: string };
}

interface UserCreds {
  email: string;
  password: string;
}

const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation() as Location & { state: AuthLocationState };
  const from = location.state?.from?.pathname ?? '/';

  const { login } = useAuth();     // ⬅️ AuthContext hook

  const [user, setUser] = useState<UserCreds>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/login', user);
      /* ✅ Use context to store token & redirect */
      login(res.data.token);        // stores token, sets isAuthenticated
      navigate(from, { replace: true });
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        alert(axiosErr.response?.data?.message ?? 'Login failed');
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Login failed');
      }
    }
  };

  return (
    <Stack mx="auto" direction="column" alignItems="center" width={1} maxWidth={450}>
      <ButtonBase LinkComponent={Link} href="/" sx={{ mt: 6 }} disableRipple>
        <Image src={Logo} alt="logo" height={92} width={92} />
      </ButtonBase>

      <Typography mt={4} variant="h2" fontWeight={600}>
        E-Learning for Kids
      </Typography>

      {/* Social buttons (unchanged) */}
      <Stack mt={6} spacing={2.5} width={1}>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          fullWidth
          startIcon={<IconifyIcon icon="logos:google-icon" />}
          sx={{ bgcolor: 'info.main', '&:hover': { bgcolor: 'info.main' } }}
        >
          Google
        </Button>
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          startIcon={<IconifyIcon icon="mage:facebook" sx={{ mr: -0.75 }} />}
          sx={{ bgcolor: 'info.main', '&:hover': { bgcolor: 'info.main' } }}
        >
          Facebook
        </Button>
      </Stack>

      <Divider sx={{ my: 4.5 }}>Or</Divider>

      {/* ---------- LOGIN FORM ---------- */}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          id="email"
          name="email"
          type="email"
          color="secondary"
          label="Email Address"
          value={user.email}
          onChange={handleInputChange}
          variant="filled"
          placeholder="mail@example.com"
          autoComplete="email"
          sx={{ mt: 3 }}
          fullWidth
          autoFocus
          required
        />

        <TextField
          id="password"
          name="password"
          label="Password"
          color="secondary"
          type={showPassword ? 'text' : 'password'}
          value={user.password}
          onChange={handleInputChange}
          variant="filled"
          placeholder="Min. 8 characters"
          autoComplete="current-password"
          sx={{ mt: 6 }}
          fullWidth
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                >
                  <IconifyIcon
                    icon={showPassword ? 'mdi:visibility' : 'mdi:visibility-off'}
                    color="neutral.main"
                  />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Stack mt={1.5} alignItems="center" justifyContent="space-between">
          <FormControlLabel
            control={<Checkbox size="large" color="primary" />}
            label="Remember me"
            sx={{ ml: -0.75 }}
          />
          <Link href={paths.resetPassword} fontWeight={600}>
            Reset password?
          </Link>
        </Stack>

        <Button type="submit" variant="contained" size="large" sx={{ mt: 3 }} fullWidth>
          Sign In
        </Button>
      </Box>
    </Stack>
  );
};

export default SignIn;
