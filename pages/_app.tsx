import '@/styles/globals.scss';
import Head from 'next/head';
import Navbar from '@/comps/navbar';
import type { AppProps } from 'next/app';

export default function App ({Component, pageProps}: AppProps): React.ReactElement
{
    return (
        <>
            <Head>
                <title>Apex Protocol</title>
                <meta name="description" content="apex protocol"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <Navbar/>
            <Component {...pageProps}/>
        </>
    ) 
}