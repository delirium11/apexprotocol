import styles from '@/styles/index.module.scss';
import bundle from '@/bundles/barrel_index';
import Image from 'next/image';

export default function Home(): React.ReactElement
{
    return (

        <main id='home' className={styles.homeContainer}>

            <section id='catalog' className={styles.catalogContainer}>

                <section>
                    <p>
                        Apex is a next-gen anime PFP collection that continuously 
                        evolves through innovative trait updates. Each Apex is a 
                        dynamic digital asset merging high-quality anime art with 
                        user-driven customizations. Coming soon to Abstract-Chain!
                    </p>

                    <a>Whitelist Application</a>
                </section>

                <section>
                    <div>
                        <Image
                            src={bundle.placeholder}
                            alt='portrait'
                            priority={true}
                            draggable={false}
                        />
                        
                        <p>
                            Apex is a next-gen anime PFP collection that continuously 
                            evolves through innovative trait updates.
                        </p>

                        <a>Marketplace</a>

                    </div>

                    <div>
                        <Image
                            src={bundle.placeholder}
                            alt='portrait'
                            priority={true}
                            draggable={false}
                        />
                        
                        <p>
                            Apex is a next-gen anime PFP collection that continuously 
                            evolves through innovative trait updates.
                        </p>

                        <a>Marketplace</a>

                    </div>

                    <div>
                        <Image
                            src={bundle.placeholder}
                            alt='portrait'
                            priority={true}
                            draggable={false}
                        />
                        
                        <p>
                            Apex is a next-gen anime PFP collection that continuously 
                            evolves through innovative trait updates.
                        </p>

                        <a>Marketplace</a>

                    </div>
                </section>

            </section>

        </main>

    )
}