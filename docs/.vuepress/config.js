module.exports = {
  base: process.env.NODE_ENV === "development" ? "/" : "/vue-webpage-builder/docs/",
  locales: {
    '/': {
      lang: 'ja-JP',
      title: 'Vue Webpage Builder',
      description: 'Vue.js GUI generator'
    }
  },
  themeConfig: {
    logo: '/logo.png',
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'GitHub', link: 'https://github.com/sterashima78/vue-webpage-builder', target:'_blank' }
    ],
    smoothScroll: true,
    sidebar: {
      '/guide/': [
        {
          title: "ガイド",
          children: [
            '',
            'getting-started',
            'view',
            'functions'
          ]
        }
      ]
    }
  },
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }]
  ],
  markdown: {
    breaks: true
  },
  plugins: [
    [
      '@vuepress/google-analytics',
      {
        'ga': 'G-92W50F4F28'
      }
    ]
  ]
}
