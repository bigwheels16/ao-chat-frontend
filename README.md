# AO Web Chat - Frontend

A web-based chat client for Anarchy Online built with Vue 3, Vuetify and Vite.

## Features

### Configurable Tab Messages
Manage multiple custom chat tabs and tailor message routing to suit your playstyle:
- **Create New Tabs**: Click the **`+` (plus)** icon next to the tab list to add a new tab.
- **Configure Tabs**: Click the **gear icon** (`mdi-cog`) floating in the top-right corner of the tab content area to open the **Tab Settings** modal.
- **Rename Tabs**: Enter a custom label in the **Tab Name** field.
- **Message Type Filtering**: Toggle individual message categories on or off for each tab:
  - **System Messages**: Server notices, system alerts, and default status output.
  - **Public Channels**: Vicinity chat, tower battle announcements, and public broadcast channels.
  - **Org Messages**: Organization channel chat.
  - **Private Channels**: Custom player-hosted private chat groups.
  - **Tells**: Direct private messages sent to or received from other players.
  - **Buddy Notifications**: Buddy logon, logoff, and status updates.
- **Delete Tabs**: Delete unwanted tabs by clicking **Delete Tab** in the Tab Settings modal (the last remaining tab cannot be deleted).
- **Persistent Settings**: All custom tabs, names, and filter configurations are saved in the browser's `localStorage` (`aochat_tabs_config`) and restored automatically across sessions.

#### Default Tab Presets
When launching the client for the first time, four standard tabs are pre-configured:
| Tab Name | Enabled Message Types |
| :--- | :--- |
| **General** | System Messages, Public Channels, Org Messages, Private Channels, Tells, Buddy Notifications |
| **Tells** | Tells only |
| **Org** | Org Messages only |
| **Buddy Log** | Buddy Notifications only |

---

### Additional Features
- **Server Selection**: Log in to any chat server the backend lists (RK5, RK2019); the last server used is remembered.
- **Character Selection**: Choose from available characters on your account upon connecting.
- **Buddy List Management**: Real-time buddy list tracking online/offline status with add and remove functionality.
- **Rich Text & Blob Popups**: Formatted item/script blob popups and colored chat messages adhering to Anarchy Online chat standards.
- **Chat Input & History**: Input bar with command handling, channel switching, and keyboard navigation.

---

## Project Setup

Requires Node.js 24.

```bash
npm ci
```

The app reads the backend's WebSocket URL from `VUE_APP_WEBSOCKET_URL` when it is built or served, for example `wss://aochat-api.jkbff.com/connect`. Set it in the environment or in a `.env.local` file; production builds fail without it.

### Development server with hot reload
```bash
npm run serve
```

### Production build into `dist`
```bash
npm run build
```

### Serve the production build locally
```bash
npm run preview
```

### Lints and fixes files
```bash
npm run lint
```

### Unit tests
```bash
npm test
```

### Customize Configuration
See the [Vite configuration reference](https://vite.dev/config/).
