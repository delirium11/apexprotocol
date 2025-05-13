import styles from '@/styles/index.module.scss';
import bundle from '@/bundles/barrel_index';

export default function Home(): React.ReactElement
{
    return (

        <main id='home' className={styles.homeContainer}>

            <section id='catalog' className={styles.catalogContainer}>

                {/* CATALOG CONTENT GOES HERE */}

            </section>

        </main>

    )
}