// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Computer Graphics Notes',
  tagline: 'Coding exam revision for Computer Graphics and Visualization',
  favicon: 'img/favicon.ico',

  // GitHub Pages deployment config
  url: 'https://tino-ryan.github.io', // your GitHub Pages root
  baseUrl: '/cvg-notes/',             // repository name

  organizationName: 'tino-ryan',     // GitHub username
  projectName: 'cvg-notes',          // Repository name
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/tino-ryan/cvg-notes/tree/main/',
        },
        blog: false, // disable blog completely
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'CG Notes',
        logo: {
          alt: 'CG Notes Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Notes',
          },
          {
            href: 'https://github.com/tino-ryan/cvg-notes',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Notes',
            items: [
              {
                label: 'All Topics',
                to: '/docs/01-introduction',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/tino-ryan/cvg-notes',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} CG Notes. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
