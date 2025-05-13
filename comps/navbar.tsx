import styles from '@/styles/navbar.module.scss';
import bundle from '@/bundles/barrel_navbar';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FaDiscord, FaXTwitter } from 'react-icons/fa6';
import 
{ 
    collectUsers, 
    connectUsers, 
    disconnectUsers, 
    extractErrorMessage 
} from '@/utilities/contract';

export default function Navbar(): React.ReactElement
{
    const [wallet, setWallet] = useState<string | null>(null);
    const [hovered, setHovered] = useState<boolean>(false);

    useEffect
    (
        () =>
        {
            //Return if no browser provider extension is installed.
            if (typeof window === 'undefined' || !window.ethereum) return;

            //Collect wallets upon first mount.
            handleWallets();

            //Collect wallets when account change is detected.
            window.ethereum.on('accountsChanged', handleWallets);

            //Remove the event listeners on component dismount.
            return () =>
            {
                if (window.ethereum.removeListener)
                {
                    window.ethereum.removeListener('accountsChanged', handleWallets);
                }
            }
        }, []
    )

    async function handleWallets(): Promise<void>
    {
        const wallets: string[] = await collectUsers();
        setWallet(wallets.length > 0 ? wallets[0].toUpperCase() : null);
    }

    async function handleConnect(): Promise<void>
    {
        try
        {
            await connectUsers();
        } catch (error: any)
        {
            console.log(extractErrorMessage(error));
        }
    }

    async function handleDisconnect(): Promise<void>
    {
        try
        {
            await disconnectUsers();
        } catch (error: any)
        {
            console.log(extractErrorMessage(error));
        }
    }

    return (

        <nav
            id='navbar'
            className={styles.navbarContainer}
        >
            <ul>
                <Link href='/'>
                    <Image 
                        src={bundle.placeholder} 
                        draggable={false} 
                        alt='mascot'
                    />
                </Link>
            </ul>

            <ul>
                <Link href='/'>HOME</Link>
                <Link href='/#about'>ABOUT</Link>
                <Link href='/#faq'>FAQ</Link>
                <Link href='/checker'>CHECKER</Link>
                <Link href='/mint'>MINT</Link>
            </ul>

            <ul>
                <button 
                    onClick={wallet ? handleDisconnect : handleConnect}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    {
                        wallet ? (hovered ? 'DISCONNECT' : wallet.slice(-6)) : 'CONNECT'
                    }
                </button>
                <Link href='/'><FaDiscord/></Link>
                <Link href='/'><FaXTwitter/></Link>
            </ul>

        </nav>

    )
}