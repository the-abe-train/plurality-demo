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
        accent: '#012A36',
        button: '#773831'
      },
      dropShadow: {
        'block': "0px 4px 4px rgba(0, 0, 0, 0.25)"
      },
      container: {
        center: true
      }
    },
    // extend: {
    //   colors: {
    //     accent: '#012A36'
    //   }
    // }
  },
  plugins: [],
}