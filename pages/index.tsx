import styles from '@/styles/index.module.scss';
import bundle from '@/bundles/barrel_index';
import Image from 'next/image';

export default function Home (): React.ReactElement
{
    return (
        <main id='home' className={styles.homeContainer}>

            <section id='landingContainer' className={styles.landingContainer}>
                <video autoPlay muted loop playsInline className={styles.videoContent}>
                    {/* <source src='/videos/landingVideo.mp4' type='video/mp4'/> */}
                </video>
            </section>

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