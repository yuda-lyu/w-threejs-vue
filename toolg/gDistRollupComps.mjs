import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'


let fdSrc = './src/components/'
let fdTar = './dist'


rollupFiles({
    fns: 'WThreejsVue.vue',
    fdSrc,
    fdTar,
    format: 'umd',
    //nameDistType: 'kebabCase',
    hookNameDist: () => {
        return 'w-threejs-vue'
    },
    globals: {
    },
    external: [
    ],
})

