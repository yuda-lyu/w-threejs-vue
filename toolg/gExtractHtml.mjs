import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import getFiles from 'w-package-tools/src/getFiles.mjs'
import cleanFolder from 'w-package-tools/src/cleanFolder.mjs'
import parseVueCode from 'w-package-tools/src/parseVueCode.mjs'
import extractHtml from 'w-package-tools/src/extractHtml.mjs'


let fdSrc = './src/'
let fdTestHtml = './test-html/'
let fdTestSrc = './test-action/'


function writeHtml(v) {

    function getAppTmp() {
        return v.tmp
    }

    function procHtml(h) {

        //change cmp name
        h = w.replace(h, 'WThreejsVue', 'w-threejs-vue')

        return h
    }

    //opt
    let opt = {
        title: `example for ${v.casename}`,
        head: `
    
        <!-- extractHtml已自動添加@babel/polyfill與vue -->
    
        <!-- fontawesome -->
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.2/css/all.min.css" rel="stylesheet">
    
        <!-- mdi, 各組件使用mdi/js會於轉單頁時改為mdi icon, 故需引用mdi/css -->
        <link href="https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css" rel="stylesheet">
    
        <!-- google, 各組件使用mdi/js故不需引用 -->
        <link _href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900" rel="stylesheet">
        <link _href="https://fonts.googleapis.com/css?family=Material+Icons" rel="stylesheet">
    
        <!-- w-threejs-vue -->
        <script src="../dist/w-threejs-vue.umd.js"></script>
    
        <!-- lodash -->
        <script src="https://cdn.jsdelivr.net/npm/lodash@latest/lodash.min.js"></script>

        <!-- wsemi -->
        <script src="https://cdn.jsdelivr.net/npm/wsemi@latest/dist/wsemi.umd.min.js"></script>
    
        <!-- data -->
        <script src="https://cdn.jsdelivr.net/npm/w-demores/res/data/dataRain.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/w-demores/res/data/dataRainClip.js"></script>

        <!-- w-jsonview-tree -->
        <script src="https://cdn.jsdelivr.net/npm/w-jsonview-tree@latest/dist/w-jsonview-tree.umd.js"></script>
        <script>
            let jv=window['w-jsonview-tree']
        </script>
    
        <style>
            .item-link {
                display: inline-block;
                margin: 10px 10px 0px 0px;
                padding: 5px 10px;
                font-size: 0.8rem;
                color: #fff;
                background-color: #443a65;
                cursor: pointer;
                text-decoration: none;
            }
            .bkh { /* 寬 */
                padding:20px;
            }
            @media screen and (max-width:800px){ /* 中 */
                .bkh {
                    padding:10px;
                }
            }
            @media screen and (max-width:400px){ /* 窄 */
                .bkh {
                    padding:5px;
                }
            }
            .bkp { /* 寬 */
                padding:0px 20px;
            }
            @media screen and (max-width:800px){ /* 中 */
                .bkp {
                    padding:0px 10px;
                }
            }
            @media screen and (max-width:400px){ /* 窄 */
                .bkp {
                    padding:0px 5px;
                }
            }
        </style>
    
        `,
        appTag: `div`,
        appClass: `bkh`,
        appStyle: ``,
        appTmp: getAppTmp(),
        installVue: `Vue.component('w-threejs-vue', window['w-threejs-vue'])`,
        newVue: ``,
        data: v.data,
        mounted: v.mounted,
        computed: v.computed,
        methods: v.methods,
        action: v.action,
        procHtml,
        fpHtml: `${fdTestHtml}${v.fn}.html`,
        fpAction: `${fdTestSrc}${v.fn}.action.json`,
    }

    //extractHtml
    extractHtml(opt)

}


function extractApp(fn) {

    //casename
    let casename = fn.replace('.vue', '')

    //read
    let hh = fs.readFileSync(fdSrc + fn, 'utf8')

    // //取代example與code
    // hh = w.replace(hh, '{filename}', casename)

    // //複寫回去, 因開發階段懶得手動改全部, 故得用程式改
    // fs.writeFileSync(fdSrc + fn, hh, 'utf8')

    //parseVueCode
    let { tmp, mounted, data, computed, methods, action } = parseVueCode(hh)

    //writeHtml
    writeHtml({
        fn: `ex-${casename}`,
        casename,
        tmp,
        mounted,
        data,
        computed,
        methods,
        action,
    })

}


function main() {
    //由jsdoc產製之wsemi.html, 自動添加將example轉換成codepen線上編輯功能

    //cleanFolder
    cleanFolder(fdTestHtml)
    //cleanFolder(fdTestSrc)

    //getFiles
    let ltfs = getFiles(fdSrc)

    //filter
    ltfs = _.filter(ltfs, function(v) {
        return v.indexOf('App') >= 0
    })
    _.pull(ltfs, 'App.vue')
    //console.log(ltfs)

    //extractApp
    _.each(ltfs, function(v) {
        console.log('extracting: ' + fdSrc + v)
        extractApp(v)
    })

}
main()
