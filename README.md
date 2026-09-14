# AO Web Chat - Frontend

A web-based chat client for Anarchy Online built with Vue.js and Vuetify.

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
- **Character Selection**: Choose from available characters on your account upon connecting.
- **Buddy List Management**: Real-time buddy list tracking online/offline status with add and remove functionality.
- **Rich Text & Blob Popups**: Formatted item/script blob popups and colored chat messages adhering to Anarchy Online chat standards.
- **Chat Input & History**: Input bar with command handling, channel switching, and keyboard navigation.

---

## Project Setup

```bash
npm install
```

### Compiles and hot-reloads for development
```bash
npm run serve
```

### Compiles and minifies for production
```bash
npm run build
```

### Lints and fixes files
```bash
npm run lint
```

### Customize Configuration
See [Vue CLI Configuration Reference](https://cli.vuejs.org/config/).
