import rollupVueToHtml from 'w-package-tools/src/rollupVueToHtml.mjs'


let opt = {
    title: `w-threejs-vue`,
    head: `

    <!-- rollupVueToHtml已自動添加@babel/polyfill與vue -->

    <!-- fontawesome -->
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.2/css/all.min.css" rel="stylesheet">

    <!-- mdi, 各組件使用mdi/js故不需引用 -->
    <link _href="https://cdn.jsdelivr.net/npm/@mdi/font@7.2.96/css/materialdesignicons.min.css" rel="stylesheet">

    <!-- google, 各組件使用mdi/js故不需引用 -->
    <link _href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900" rel="stylesheet">
    <link _href="https://fonts.googleapis.com/css?family=Material+Icons" rel="stylesheet">

    <!-- lodash -->
    <script src="https://cdn.jsdelivr.net/npm/lodash@latest/lodash.min.js"></script>

    <!-- wsemi -->
    <script src="https://cdn.jsdelivr.net/npm/wsemi@latest/dist/wsemi.umd.min.js"></script>

    <!-- data -->
    <script src="https://cdn.jsdelivr.net/npm/w-demores@1.0.23/res/data/dataRain.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/w-demores@1.0.23/res/data/dataRainClip.js"></script>

    `,
    newVue: ``,
    globals: {
    },
    external: [
    ],
}
rollupVueToHtml('./src/App.vue', './docs/examples/app.html', opt)

