// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Computer Graphics Notes',
  tagline: 'Coding exam revision for Computer Graphics and Visualization',
  favicon: 'img/favicon.ico',

  // GitHub Pages config
  url: 'https://tino-ryan.github.io',
  baseUrl: '/cvg-notes/',
  trailingSlash: false, // avoids extra slashes

  organizationName: 'tino-ryan',
  projectName: 'cvg-notes',
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw', // keeps build strict for safety
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
        blog: false,
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
                { label: 'Basics', to: '/docs/Basics' },
                { label: 'Hierarchical Modelling', to: '/docs/Hierarchical_Modelling' },
                { label: 'Lighting', to: '/docs/Lighting' },
                { label: 'OpenGL Basics', to: '/docs/OpenGL_Basics' },
                { label: 'Programmable Pipeline', to: '/docs/Programmable_Pipeline' },
                { label: 'Textures', to: '/docs/Textures' },  // Changed from lowercase
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
