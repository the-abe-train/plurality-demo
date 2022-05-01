module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        header: ['"Amaranth"'],
        sans: ['"Kanit"']
      },
      colors: {
        button: '#012733',
        primary1: '#FDFAF6',
        primary2: '#FFEAE0',
        secondary: '#21092A',
        outline: '#808080'
      },
      dropShadow: {
        'block': "0px 4px 4px rgba(0, 0, 0, 0.25)"
      },
      container: {
        center: true
      },
      gridTemplateColumns: {
        hompage: "5fr 5fr 2fr"
      }
    },
  },
  plugins: [],
}