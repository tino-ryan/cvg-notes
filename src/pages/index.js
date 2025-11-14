import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();

  // Example links to your notes
const notes = [
  { title: 'Basics', path: '/docs/Basics' },
  { title: 'Hierarchical Modelling', path: '/docs/Hierarchical_Modelling' },
  { title: 'Lighting', path: '/docs/Lighting' },
  { title: 'OpenGL Basics', path: '/docs/OpenGL_Basics' },
  { title: 'Programmable Pipeline', path: '/docs/Programmable_Pipeline' },
  { title: 'Textures', path: '/docs/Textures' },
];


  return (
    <Layout
      title={siteConfig.title}
      description="Coding notes for Computer Graphics and Visualization exam">
      <HomepageHeader />
      <main className="container" style={{ padding: '2rem 0' }}>
        <Heading as="h2">Topics</Heading>
        <div className={styles.notesGrid}>
          {notes.map((note) => (
            <Link
              key={note.path}
              className="button button--outline button--lg"
              to={note.path}
              style={{ margin: '0.5rem' }}
            >
              {note.title}
            </Link>
          ))}
        </div>
      </main>
    </Layout>
  );
}
