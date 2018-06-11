module.exports = {
  title: 'DvaJS',
  description: 'React and redux based, lightweight and elm-style framework.',
  themeConfig: {
    repo: 'dvajs/dva',
    lastUpdated: 'Last Updated',
    editLinks: true,
    editLinkText: '在 GitHub 上编辑此页',
    docsDir: 'docs',
    nav: [
      { text: '指南', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: '知识地图', link: '/knowledgemap/' },
      { text: '发布日志', link: 'https://github.com/dvajs/dva/releases' },
    ],
    sidebar: {
      '/guide/': [
        {
          title: '指南',
          collapsable: false,
          children: [
            '',
            'getting-started',
            'examples-and-boilerplates',
            'concepts',
            'introduce-class',
          ],
        },
        {
          title: '社区',
          collapsable: false,
          children: ['fig-show', 'develop-complex-spa', 'source-code-explore'],
        },
      ],
      '/api/': [''],
      '/knowledgemap/': [''],
    },
  },
};
