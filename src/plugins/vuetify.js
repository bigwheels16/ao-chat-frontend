import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

// Dark theme with the accent colour, drawer shade, primary-coloured controls, underlined fields
// and checkbox spacing the app was designed with; icons are bundled SVGs
export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi }
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          accent: '#FF4081'
        }
      }
    },
    variations: {
      colors: ['accent'],
      lighten: 0,
      darken: 2
    }
  },
  defaults: {
    VNavigationDrawer: { color: '#363636' },
    VCheckbox: { color: 'primary', density: 'comfortable' },
    VTextField: { variant: 'underlined', color: 'primary' },
    VSelect: { variant: 'underlined', color: 'primary' },
    VTextarea: { color: 'primary' }
  }
})
