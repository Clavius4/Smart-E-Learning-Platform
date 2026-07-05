import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tsconfigPaths(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
      },
    }),
  ],
  define:
    command === 'serve'
      ? {
          'process.env.NODE_ENV': JSON.stringify('development'),
        }
      : undefined,
  // Pre-bundle the MUI/emotion stack in one pass; piecemeal discovery
  // produces dep chunks whose lazy init ordering breaks at runtime
  // ("createTheme_default is not a function"). Every runtime import
  // specifier (including deep paths — each is its own optimizer entry)
  // must be listed, otherwise late discovery triggers an incremental
  // re-optimization that can corrupt the chunk graph.
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/material/styles',
      '@mui/material/Alert',
      '@mui/material/AppBar',
      '@mui/material/Avatar',
      '@mui/material/Badge',
      '@mui/material/Box',
      '@mui/material/Button',
      '@mui/material/ButtonBase',
      '@mui/material/Card',
      '@mui/material/CardMedia',
      '@mui/material/Checkbox',
      '@mui/material/Chip',
      '@mui/material/Divider',
      '@mui/material/Drawer',
      '@mui/material/Fade',
      '@mui/material/FormControlLabel',
      '@mui/material/Grid',
      '@mui/material/Grow',
      '@mui/material/IconButton',
      '@mui/material/InputAdornment',
      '@mui/material/Link',
      '@mui/material/List',
      '@mui/material/ListItem',
      '@mui/material/ListItemAvatar',
      '@mui/material/ListItemButton',
      '@mui/material/ListItemIcon',
      '@mui/material/ListItemText',
      '@mui/material/Menu',
      '@mui/material/MenuItem',
      '@mui/material/Pagination',
      '@mui/material/Paper',
      '@mui/material/Rating',
      '@mui/material/Stack',
      '@mui/material/TextField',
      '@mui/material/Toolbar',
      '@mui/material/Tooltip',
      '@mui/material/Typography',
      '@mui/material/Zoom',
      // NOTE: never add the '@mui/icons-material' barrel here (or import it
      // in src/) — pre-bundling ~10k icon modules OOMs the 4GB prod server.
      '@mui/icons-material/AccessTime',
      '@mui/icons-material/Assignment',
      '@mui/icons-material/Book',
      '@mui/icons-material/ChevronLeft',
      '@mui/icons-material/ChevronRight',
      '@mui/icons-material/Delete',
      '@mui/icons-material/DoneAll',
      '@mui/icons-material/EmojiEvents',
      '@mui/icons-material/Event',
      '@mui/icons-material/FilterList',
      '@mui/icons-material/Login',
      '@mui/icons-material/MenuBook',
      '@mui/icons-material/NotificationsActive',
      '@mui/icons-material/Person',
      '@mui/icons-material/PersonAdd',
      '@mui/icons-material/Refresh',
      '@mui/icons-material/School',
      '@mui/icons-material/Today',
      '@mui/icons-material/ViewAgenda',
      '@mui/icons-material/ViewModule',
      '@mui/icons-material/Visibility',
      '@mui/x-data-grid',
      '@emotion/react',
      '@emotion/styled',
    ],
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  preview: {
    port: 5000,
  },
  base: '/admin/',
}));
