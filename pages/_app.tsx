import { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import '../styles/components.css';
import '../styles/layout.css';
import '../styles/collections.css';
import '../styles/showcase-shelf.css';
import '../styles/responsive.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}