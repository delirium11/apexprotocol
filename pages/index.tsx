import styles from '@/styles/index.module.scss';
import bundle from '@/bundles/barrel_index';
import Image from 'next/image';
import { useIntersectionObserver } from '@/effects/animations_index';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

interface HomeProps
{
    setActiveSection: Dispatch<SetStateAction<boolean>>;
}

export default function Home ({setActiveSection}: HomeProps): React.ReactElement
{
    //Ref to prevent multiple re-renders of the dom.
    const sectionRef = useRef<HTMLElement | null>(null);

    //State variable to control when to load the video.
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

    //Apply some effects from the animations_index library.
    useIntersectionObserver(sectionRef, setActiveSection);

    //Do not load video on mobile.
    function checkWindowSize (): void
    {
        setShowVideo(window.innerWidth > 1024);
    }

    return (
        <main className={styles.homeContainer}>

            <section className={styles.landingContainer} ref={sectionRef}>
                {
                    showVideo &&
                    <video autoPlay muted loop playsInline>
                        <source src='/videos/landing_video.mp4' type='video/mp4'/>
                    </video>
                }
            </section>

            <section className={styles.midContainer}></section>

            <section className={styles.infoContainer}>
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