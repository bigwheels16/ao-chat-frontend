import 'vuetify/styles'
import { createVuetify } from 'vuetify'

// Dark theme with the accent colour, drawer shade, primary-coloured controls, underlined fields
// and checkbox spacing the app was designed with
export default createVuetify({
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
