import '../styles.css/globals.css';
import '../styles.css/home_page.css';
import '../styles.css/vitrines.css';
import '../styles.css/collection.css';
import '../styles.css/admin_page.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
