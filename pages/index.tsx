import styles from '@/styles/index.module.scss';
import bundle from '@/bundles/barrel_index';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Home (): React.ReactElement
{
    const [showVideo, setShowVideo] = useState<boolean>(false);

    useEffect
    (
        () =>
        {
            checkWindowSize();
            window.addEventListener('resize', checkWindowSize);
            return () => window.removeEventListener('resize', checkWindowSize);
        }, []
    )

    function checkWindowSize (): void
    {
        setShowVideo(window.innerWidth > 1024);
    }

    return (
        <main id='home' className={styles.homeContainer}>

            <section id='landingContainer' className={styles.landingContainer}>
                {
                    showVideo &&
                    <video autoPlay muted loop playsInline>
                        <source src='/videos/landing_video.mp4' type='video/mp4'/>
                    </video>
                }
            </section>

            <section id='midContainer' className={styles.midContainer}></section>

            <section id='infoContainer' className={styles.infoContainer}>
                <div>
                    <h1>WE ARE APEX</h1>
                    <p>
                        Apex is a next-gen anime PFP collection that continuously 
                        evolves through innovative trait updates. Each Apex is a 
                        dynamic digital asset merging high-quality anime art with 
                        user-driven customizations. Coming soon to Abstract-Chain!
                    </p>
                    <span>
                        <button>Whitepaper</button>
                        <button>Whitelist Form</button>
                    </span>
                </div>
            </section>
        
        </main>
    );
}