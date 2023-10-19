/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundColor : {
        'main' : '#1A1A1A',
        'secondary' : '#333333',
        'my-green' : '#81A3A7',
        'my-blue' : '#A7BCC7',
    },
    textColor : {
      'main-text' : '#F5F5F5',
      'second-text' : '#999999',
      'blue-text': '#A7BCC7',
      'green-text' : "#81A3A7",
    },
    borderColor : {
      'main-border' : '#F5F5F5',
      'second' : '#999999',
    }
  },
  plugins: [],
}
}