import IconifyIcon from 'components/base/IconifyIcon';
import Image from 'components/base/Image';
import sitemap from 'routes/sitemap';
import Logo from 'assets/images/Logo.png';
import Profile from 'assets/images/Profile.png';
import { useAuth } from '../../../contexts/AuthContext';
import { Box, Link, List, Chip, Stack, Badge, Button, Tooltip, ListItem, IconButton, Typography, ButtonBase, ListItemIcon, ListItemText, ListItemButton } from '@mui/material';


interface DrawerItemsProps {
  expand: boolean;
}

const DrawerItems = ({ expand }: DrawerItemsProps) => {
  const { logout, user } = useAuth();
  return (
    <>
      <Stack
        py={4}
        position="sticky"
        top={0}
        alignItems="center"
        justifyContent="center"
        bgcolor="info.lighter"
        zIndex={1200}
      >
        <ButtonBase component={Link} href="/" disableRipple>
          <Stack
            direction={expand ? 'row' : 'column'}
            spacing={expand ? 1.75 : 1.25}
            alignItems="center"
            justifyContent="center"
          >
            <Image src={Logo} alt="logo" height={44} width={44} />
            <Typography variant="h4" letterSpacing={1} fontWeight={600}>
              E-Kids
            </Typography>
          </Stack>
        </ButtonBase>
      </Stack>

      <List component="nav" sx={{ mb: 30, pt: 1.5 }}>
        {sitemap.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              LinkComponent={Link}
              href={item.path}
              sx={(theme) => ({
                minHeight: 48,
                mx: 1.25,
                my: 0.25,
                borderRadius: 2,
                transition: 'background-color 0.2s ease',
                ...(item.active && item.path === '/'
                  ? {
                      background: `linear-gradient(90deg, ${theme.palette.gradients.secondary.main} 0%, ${theme.palette.gradients.secondary.state} ${expand ? '22.5%' : '62%'})`,
                    }
                  : {
                      '&:hover': {
                        bgcolor: 'action.hover',
                        '& .MuiListItemText-primary': { color: 'primary.main' },
                        '& svg': { color: theme.palette.primary.main },
                      },
                    }),
              })}
            >
              <ListItemIcon sx={{ width: 48 }}>
                {item.icon &&
                  (item.messages ? (
                    <Badge
                      variant="dot"
                      sx={(theme) => ({
                        '& .MuiBadge-badge': {
                          top: 4,
                          right: 3,
                          border: 2,
                          borderColor: theme.palette.info.lighter,
                          bgcolor: expand ? 'text.disabled' : 'error.dark',
                        },
                      })}
                    >
                      <IconifyIcon
                        icon={item.icon}
                        color={item.active ? 'primary.main' : 'text.disabled'}
                      />
                    </Badge>
                  ) : (
                    <IconifyIcon
                      icon={item.icon}
                      color={item.active ? 'primary.main' : 'text.disabled'}
                    />
                  ))}
              </ListItemIcon>

              <ListItemText
                primary={item.subheader}
                sx={[
                  expand
                    ? {
                        opacity: 1,
                      }
                    : {
                        opacity: 0,
                      },
                  {
                    '& .MuiListItemText-primary': {
                      color: item.active ? 'primary.main' : 'text.disabled',
                    },
                  },
                ]}
              />
              {item.messages && (
                <Chip
                  label={item.messages}
                  color="error"
                  size="small"
                  sx={{
                    minWidth: 32,
                    height: 24,
                    opacity: expand ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box mt="auto" px={2.35} pb={5}>
        <Stack spacing={2} alignItems="center">
          <Stack
            spacing={1.5}
            width={1}
            direction={expand ? 'row' : 'column'}
            alignItems="center"
            justifyContent={expand ? 'flex-start' : 'center'}
          >
            <Image src={Profile} height={44} width={44} sx={{ borderRadius: 3 }} />
            <Box sx={[expand ? { display: 'block', minWidth: 0 } : { display: 'none' }]}>
              <Typography
                mb={-0.5}
                variant="body2"
                color="text.primary"
                fontWeight={700}
                noWrap
              >
                {user?.email?.split('@')[0] || 'Administrator'}
              </Typography>
              <Typography mt={-0.5} variant="caption" color="text.disabled" fontWeight={400}>
                Admin
              </Typography>
            </Box>
          </Stack>

          {expand ? (
            <Button
              fullWidth
              variant="outlined"
              color="error"
              onClick={logout}
              startIcon={<IconifyIcon icon="majesticons:logout" />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Logout
            </Button>
          ) : (
            <Tooltip title="Logout" placement="right">
              <IconButton onClick={logout} aria-label="Logout">
                <IconifyIcon icon="majesticons:logout" color="error.main" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>
    </>
  );
};

export default DrawerItems;
