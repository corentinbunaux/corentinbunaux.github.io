import './../styles/globals.css';

export default function App({ Component, pageProps }) {
    return (
      <>
      <style jsx global>
      {`
        body {
          background-color: #1a1a1a;
        }
      `}
    </style>
    <Component {...pageProps} />
    </>
    );
  }
  