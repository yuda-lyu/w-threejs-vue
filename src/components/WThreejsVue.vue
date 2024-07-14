<template>
    <div :style="`display:inline-block; width:${widthInp}px; min-width:${widthInp}px; height:${heightInp}px; overflow-y:hidden;`">

        <div style="position:relative; width:0px; height:0px;" v-if="loading">
            <div style="position:absolute; top:0px; left:0px;">
                <WIconLoading></WIconLoading>
            </div>
        </div>

        <div style="position:relative;">

            <div
                ref="panel"
                :style="`position:relative; width:${widthInp}px; height:${heightInp}px; opacity:${loading?0:1};`"
                v-domresize
                @domresize="resizePanel"
            ></div>

            <div
                :style="`position:absolute; top:0px; left:0px;`"
                v-if="!loading"
            >

                <div style="padding:10px; display:flex; align-items:flex-start;">

                    <!-- 設定區 -->
                    <WGroupIconCheck
                        :items="useItems"
                        :dir="'vertical'"
                        :iconColor="'#aaa'"
                        :iconColorHover="'#ccc'"
                        :iconColorFocus="'#ccc'"
                        :iconColorActive="'#fff'"
                        :backgroundColor="'#000'"
                        :backgroundColorHover="'#111'"
                        :backgroundColorFocus="'#111'"
                        :backgroundColorActive="'#444'"
                        :seplineColor="'#333'"
                        :tooltipTextFontSize="'0.7rem'"
                        :value="itemsSelects"
                        _input="updateItem"
                        @click="ckItem"
                    ></WGroupIconCheck>

                    <template v-if="useLegend">

                        <div :style="`padding-left:10px;`"></div>

                        <!-- 圖例區 -->
                        <div :style="`padding:5px; border-radius:4px; background:${useLegnedBackgroundColor};`">
                            <div :style="`${useLegnedHeight}`">

                                <div
                                    :style="``"
                                    :key="'km-'+km"
                                    v-for="(m,km) in meshs"
                                >

                                    <div style="display:flex; align-items:center; padding:3px;">

                                        <WIcon
                                            style="cursor:pointer;"
                                            :icon="m.visible?mdiEyeOutline:mdiEyeOffOutline"
                                            :color="'#ccc'"
                                            :colorHover="'#ddd'"
                                            :size="20"
                                            @click="toggleMeshVisible(m,km)"
                                        ></WIcon>

                                        <div style="padding-left:5px;"></div>

                                        <WColorSelect
                                            :colorBlockBorderColor="'#888'"
                                            :showColorText="false"
                                            _colorTextColor="'#ddd'"
                                            :panelBackgroundColor="'#111'"
                                            :toolBackgroundColor="'#222'"
                                            :menuIconColor="'#666'"
                                            :menuIconColorHover="'#777'"
                                            :menuIconColorActive="'#ddd'"
                                            :borderColor="'#333'"
                                            :borderColorHover="'#333'"
                                            :borderColorActive="'#444'"
                                            :backgroundColor="'#111'"
                                            :menuBackgroundColor="'#111'"
                                            :menuBackgroundColorHover="'#222'"
                                            :menuBackgroundColorActive="'#333'"
                                            :menuTextColor="'#b2b2b2'"
                                            :menuTextColorHover="'#ccc'"
                                            :menuTextColorActive="'#ddd'"
                                            :menuTextFontSize="'0.75rem'"
                                            :inputBorderColor="'#444'"
                                            :inputBorderColorHover="'#555'"
                                            :inputBorderColorActive="'#666'"
                                            :inputBackgroundColor="'#000'"
                                            :inputBackgroundColorHover="'#111'"
                                            :inputBackgroundColorActive="'#222'"
                                            :inputTextColor="'#999'"
                                            :inputLabelColor="'#888'"
                                            :barProgColor="'#888'"
                                            :barProgBackgroundColor="'#222'"
                                            :barSliderBackgroundColor="'#ccc'"
                                            :barSliderBackgroundColorHover="'#ddd'"
                                            :btnTextColor="'#eee'"
                                            :btnTextColorHover="'#fff'"
                                            :btnTextColorActive="'#fff'"
                                            :btnBackgroundColor="'#444'"
                                            :btnBackgroundColorHover="'#555'"
                                            :btnBackgroundColorActive="'#555'"
                                            :value="getMeshColor(m)"
                                            @input="(c)=>{setMeshColor(m,km,c)}"
                                        ></WColorSelect>

                                        <div style="padding-left:5px;"></div>

                                        <div :style="`color:${m.labelTextColor}; font-size:${m.labelTextFontSize}; font-family:${m.labelTextFontFamily};`">
                                            {{m.labelText}}
                                        </div>

                                    </div>

                                </div>

                            </div>
                        </div>

                    </template>

                </div>

            </div>

        </div>

    </div>
</template>

<script>
import { mdiCogOutline, mdiAxis, mdiAxisZRotateCounterclockwise, mdiGrid, mdiProjectorScreenOutline, mdiPackageVariantClosed, mdiListBoxOutline, mdiEyeOutline, mdiEyeOffOutline } from '@mdi/js/mdi.js'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import find from 'lodash-es/find.js'
import toUpper from 'lodash-es/toUpper.js'
import keys from 'lodash-es/keys.js'
import pull from 'lodash-es/pull.js'
import isEqual from 'lodash-es/isEqual.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import waitFun from 'wsemi/src/waitFun.mjs'
import haskey from 'wsemi/src/haskey.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isEle from 'wsemi/src/isEle.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import delay from 'wsemi/src/delay.mjs'
import strleft from 'wsemi/src/strleft.mjs'
import strdelleft from 'wsemi/src/strdelleft.mjs'
import oc from 'wsemi/src/color.mjs'
import domResize from 'w-component-vue/src/js/domResize.mjs'
import WIconLoading from 'w-component-vue/src/components/WIconLoading.vue'
import WGroupIconCheck from 'w-component-vue/src/components/WGroupIconCheck.vue'
import WIcon from 'w-component-vue/src/components/WIcon.vue'
import WColorSelect from 'w-component-vue/src/components/WColorSelect.vue'
import plot3d from '../js/plot3d.mjs'


let pathXY = `M 11.846997,18.39162 H 10.298964 L 7.0132374,12.771255 3.7275112,18.39162 H 2.1683717 L 6.2340948,11.441753 2.4024562,4.8687472 H 3.9504895 L 7.0132374,10.102848 10.064879,4.8687472 h 1.548034 L 7.7821281,11.441753 Z M 22.650766,4.8687472 18.552578,11.922776 v 6.468844 h -1.436971 v -6.450037 l -4.13236,-7.0728358 h 1.548034 l 3.285725,5.6203648 3.285727,-5.6203648 z`
let pathXZ = `M 11.271926,18.568104 H 9.7408431 L 6.4910943,12.996958 3.2413455,18.568104 H 1.6992781 L 5.7204831,11.679099 1.9307994,5.1636556 H 3.4618823 L 6.4910943,10.351919 9.5093217,5.1636556 H 11.040404 L 7.2515659,11.679099 Z m 10.465779,0 h -8.889914 v -0.57002 L 19.886379,6.3137351 H 13.067483 V 5.1636556 h 8.670222 V 5.7429974 L 14.698273,17.418742 h 7.039432 z`
let pathYZ = `M 22.049294,18.372083 H 12.678108 V 17.831045 L 20.097742,6.7407687 H 12.910584 V 5.6491633 h 9.13871 v 0.549886 L 14.628768,17.281159 h 7.420526 z M 11.249404,5.6491633 6.976656,12.285907 v 6.086176 H 5.4784775 V 12.303601 L 1.1701008,5.6491633 H 2.7840719 L 6.2097526,10.937053 9.635433,5.6491633 Z`


/**
 * @vue-prop {Object} [options={}] 輸入設定物件，預設{}
 */
export default {
    directives: {
        domresize: domResize(),
    },
    components: {
        WIconLoading,
        WGroupIconCheck,
        WIcon,
        WColorSelect,
    },
    props: {
        opt: {
            type: Object,
            default: () => {},
        },
    },
    data: function() {
        return {
            mdiEyeOutline,
            mdiEyeOffOutline,

            loading: true,

            timer: null,

            // items,
            itemsSelectIds: [],
            itemsSelects: [],

            useSetting: true,
            useAutoRotate: false,
            useHelperAxes: true,
            useHelperGrid: true,
            usePerspective: true,
            useAxis: false,
            useLegend: true,

            optTemp: null,

            meshs: [],

            ev: null,

            menuSettingIcon: '',
            menuSettingTooltip: '',
            menuHelperAxesIcon: '',
            menuHelperAxesTooltip: '',
            menuHelperGridIcon: '',
            menuHelperGridTooltip: '',
            menuPerspectiveIcon: '',
            menuPerspectiveTooltip: '',
            menuAxisIcon: '',
            menuAxisTooltip: '',
            menuAutoRotateIcon: '',
            menuAutoRotateTooltip: '',
            menuViewXYIcon: '',
            menuViewXYTooltip: '',
            menuViewXZIcon: '',
            menuViewXZTooltip: '',
            menuViewYZIcon: '',
            menuViewYZTooltip: '',
            menuLegendIcon: '',
            menuLegendTooltip: '',

            useLegnedBackgroundColor: '',
            useLegnedHeight: '',

        }
    },
    mounted: function() {
        let vo = this
        let t
        vo.timer = setInterval(() => {

            // vo.useSetting

            t = vo.getParam('useHelperAxes')
            if (vo.useHelperAxes !== t) {
                vo.useHelperAxes = t
            }

            t = vo.getParam('useAutoRotate')
            if (vo.useAutoRotate !== t) {
                vo.useAutoRotate = t
            }

            t = vo.getParam('useHelperGrid')
            if (vo.useHelperGrid !== t) {
                vo.useHelperGrid = t
            }

            t = vo.getParam('cameraType') === 'perspective'
            if (vo.usePerspective !== t) {
                vo.usePerspective = t
            }

            t = vo.getParam('useAxis')
            if (vo.useAxis !== t) {
                vo.useAxis = t
            }

            // vo.useLegend

            t = vo.getMeshs()
            if (!isEqual(vo.meshs, t)) {
                vo.meshs = t
                // console.log('meshs', vo.meshs)
            }

            vo.syncItemsSelectIds()

            vo.updateItemsSelects(false)

        }, 50)
    },
    beforeDestroy: function() {
        let vo = this
        clearInterval(vo.timer)
        vo.dispose()
    },
    watch: {
        'opt': {
            handler(value) {
                // console.log('watch opt handler', cloneDeep(value))

                let vo = this

                if (vo.loading) {
                    // console.log('init')

                    //init
                    vo.init()
                        .finally(() => {

                            //save
                            vo.optTemp = cloneDeep(vo.opt)

                        })

                }
                else {
                    // console.log('modify')

                    //modify, vue監聽obj需要原本有鍵而值有變化才能偵測, 若需要用modify得須於設定opt時預先給予初始值
                    vo.modify()
                        .finally(() => {

                            //save
                            vo.optTemp = cloneDeep(vo.opt)

                        })

                }


            },
            immediate: true,
            deep: true,
        }
    },
    computed: {

        widthInp: function() {
            //console.log('computed widthInp')

            let vo = this

            //w
            let w = 0
            let wOpt = get(vo, 'opt.width', '')
            if (isnum(wOpt)) {
                w = cdbl(wOpt)
            }

            return w
        },

        heightInp: function() {
            //console.log('computed heightInp')

            let vo = this

            //h
            let h = 0
            let hOpt = get(vo, 'opt.height', '')
            if (isnum(hOpt)) {
                h = cdbl(hOpt)
            }

            return h
        },

        items: function() {
            let vo = this
            let rs = [
                {
                    id: 'setting',
                    icon: vo.menuSettingIcon,
                    tooltip: vo.menuSettingTooltip,
                },
                {
                    id: 'helperAxes',
                    icon: vo.menuHelperAxesIcon,
                    tooltip: vo.menuHelperAxesTooltip,
                },
                {
                    id: 'helperGrid',
                    icon: vo.menuHelperGridIcon,
                    tooltip: vo.menuHelperGridTooltip,
                },
                {
                    id: 'perspective',
                    icon: vo.menuPerspectiveIcon,
                    tooltip: vo.menuPerspectiveTooltip,
                },
                {
                    id: 'axis',
                    icon: vo.menuAxisIcon,
                    tooltip: vo.menuAxisTooltip,
                },
                {
                    id: 'viewxy',
                    icon: vo.menuViewXYIcon,
                    tooltip: vo.menuViewXYTooltip,
                },
                {
                    id: 'viewxz',
                    icon: vo.menuViewXZIcon,
                    tooltip: vo.menuViewXZTooltip,
                },
                {
                    id: 'viewyz',
                    icon: vo.menuViewYZIcon,
                    tooltip: vo.menuViewYZTooltip,
                },
                {
                    id: 'autoRotate',
                    icon: vo.menuAutoRotateIcon,
                    tooltip: vo.menuAutoRotateTooltip,
                },
                {
                    id: 'legend',
                    icon: vo.menuLegendIcon,
                    tooltip: vo.menuLegendTooltip,
                },
            ]
            // console.log('computed gen items', rs)
            return rs
        },

        useItems: function() {
            let vo = this
            let rs = []
            if (vo.useSetting) {
                rs = cloneDeep(vo.items)
            }
            else {
                rs = [cloneDeep(vo.items[0])]
            }
            // console.log('computed gen useItems', rs)
            return rs
        },

    },
    methods: {

        resizePanel: function(msg) {
            // console.log('methods resizePanel', msg)

            let vo = this

            //check
            if (vo.ev === null) {
                return
            }

            //resize
            let fun = get(vo, 'ev.resize')
            if (isfun(fun)) {

                //resize
                fun()

                //emit
                vo.$emit('resize', msg)

            }


        },

        syncItemsSelectIds: function() {
            let vo = this

            let ids = []
            if (vo.useSetting) {
                ids.push('setting')
            }
            if (vo.useHelperAxes) {
                ids.push('helperAxes')
            }
            if (vo.useHelperGrid) {
                ids.push('helperGrid')
            }
            if (vo.usePerspective) {
                ids.push('perspective')
            }
            if (vo.useAxis) {
                ids.push('axis')
            }
            if (vo.useAutoRotate) {
                ids.push('autoRotate')
            }
            if (vo.useLegend) {
                ids.push('legend')
            }

            //check
            if (isEqual(vo.itemsSelectIds, ids)) {
                return
            }

            //save
            vo.itemsSelectIds = ids
            // console.log('syncItemsSelectIds itemsSelectIds', cloneDeep(vo.itemsSelectIds))

        },

        updateItemsSelects: function(force = false) {
            let vo = this

            //check
            let ids = map(vo.itemsSelects, 'id')
            if (!force && isEqual(vo.itemsSelectIds, ids)) {
                return
            }

            let rs = []
            each(vo.itemsSelectIds, (id) => {
                let r = find(vo.items, { id })
                if (iseobj(r)) {
                    rs.push(r)
                }
                else {
                    // console.log(`invalid id[${id}]`)
                }
            })

            //save
            vo.itemsSelects = rs
            // console.log('updateItemsSelects itemsSelects', cloneDeep(vo.itemsSelects))

        },

        updateMenus: function() {
            let vo = this

            let menuSettingIcon = get(vo, 'opt.menuSettingIcon', '')
            if (!isestr(menuSettingIcon)) {
                menuSettingIcon = mdiCogOutline
            }

            let menuSettingTooltip = get(vo, 'opt.menuSettingTooltip', '')
            if (!isestr(menuSettingTooltip)) {
                menuSettingTooltip = 'Settings'
            }

            let menuHelperAxesIcon = get(vo, 'opt.menuHelperAxesIcon', '')
            if (!isestr(menuHelperAxesIcon)) {
                menuHelperAxesIcon = mdiAxis
            }

            let menuHelperAxesTooltip = get(vo, 'opt.menuHelperAxesTooltip', '')
            if (!isestr(menuHelperAxesTooltip)) {
                menuHelperAxesTooltip = 'Help axes'
            }

            let menuHelperGridIcon = get(vo, 'opt.menuHelperGridIcon', '')
            if (!isestr(menuHelperGridIcon)) {
                menuHelperGridIcon = mdiGrid
            }

            let menuHelperGridTooltip = get(vo, 'opt.menuHelperGridTooltip', '')
            if (!isestr(menuHelperGridTooltip)) {
                menuHelperGridTooltip = 'Help grid'
            }

            let menuPerspectiveIcon = get(vo, 'opt.menuPerspectiveIcon', '')
            if (!isestr(menuPerspectiveIcon)) {
                menuPerspectiveIcon = mdiProjectorScreenOutline
            }

            let menuPerspectiveTooltip = get(vo, 'opt.menuPerspectiveTooltip', '')
            if (!isestr(menuPerspectiveTooltip)) {
                menuPerspectiveTooltip = 'Perspective'
            }

            let menuAxisIcon = get(vo, 'opt.menuAxisIcon', '')
            if (!isestr(menuAxisIcon)) {
                menuAxisIcon = mdiPackageVariantClosed
            }

            let menuAxisTooltip = get(vo, 'opt.menuAxisTooltip', '')
            if (!isestr(menuAxisTooltip)) {
                menuAxisTooltip = 'Axis'
            }

            let menuAutoRotateIcon = get(vo, 'opt.menuAutoRotateIcon', '')
            if (!isestr(menuAutoRotateIcon)) {
                menuAutoRotateIcon = mdiAxisZRotateCounterclockwise
            }

            let menuAutoRotateTooltip = get(vo, 'opt.menuAutoRotateTooltip', '')
            if (!isestr(menuAutoRotateTooltip)) {
                menuAutoRotateTooltip = 'Auto rotate'
            }

            let menuViewXYIcon = get(vo, 'opt.menuViewXYIcon', '')
            if (!isestr(menuViewXYIcon)) {
                menuViewXYIcon = pathXY
            }

            let menuViewXYTooltip = get(vo, 'opt.menuViewXYTooltip', '')
            if (!isestr(menuViewXYTooltip)) {
                menuViewXYTooltip = 'XY plane'
            }

            let menuViewXZIcon = get(vo, 'opt.menuViewXZIcon', '')
            if (!isestr(menuViewXZIcon)) {
                menuViewXZIcon = pathXZ
            }

            let menuViewXZTooltip = get(vo, 'opt.menuViewXZTooltip', '')
            if (!isestr(menuViewXZTooltip)) {
                menuViewXZTooltip = 'XZ plane'
            }

            let menuViewYZIcon = get(vo, 'opt.menuViewYZIcon', '')
            if (!isestr(menuViewYZIcon)) {
                menuViewYZIcon = pathYZ
            }

            let menuViewYZTooltip = get(vo, 'opt.menuViewYZTooltip', '')
            if (!isestr(menuViewYZTooltip)) {
                menuViewYZTooltip = 'YZ plane'
            }

            let menuLegendIcon = get(vo, 'opt.menuLegendIcon', '')
            if (!isestr(menuLegendIcon)) {
                menuLegendIcon = mdiListBoxOutline
            }

            let menuLegendTooltip = get(vo, 'opt.menuLegendTooltip', '')
            if (!isestr(menuLegendTooltip)) {
                menuLegendTooltip = 'Legend'
            }

            //save
            vo.menuSettingIcon = menuSettingIcon
            vo.menuSettingTooltip = menuSettingTooltip
            vo.menuHelperAxesIcon = menuHelperAxesIcon
            vo.menuHelperAxesTooltip = menuHelperAxesTooltip
            vo.menuHelperGridIcon = menuHelperGridIcon
            vo.menuHelperGridTooltip = menuHelperGridTooltip
            vo.menuPerspectiveIcon = menuPerspectiveIcon
            vo.menuPerspectiveTooltip = menuPerspectiveTooltip
            vo.menuAxisIcon = menuAxisIcon
            vo.menuAxisTooltip = menuAxisTooltip
            vo.menuAutoRotateIcon = menuAutoRotateIcon
            vo.menuAutoRotateTooltip = menuAutoRotateTooltip
            vo.menuViewXYIcon = menuViewXYIcon
            vo.menuViewXYTooltip = menuViewXYTooltip
            vo.menuViewXZIcon = menuViewXZIcon
            vo.menuViewXZTooltip = menuViewXZTooltip
            vo.menuViewYZIcon = menuViewYZIcon
            vo.menuViewYZTooltip = menuViewYZTooltip
            vo.menuLegendIcon = menuLegendIcon
            vo.menuLegendTooltip = menuLegendTooltip

            //vo.items會因為computed自動變更, 故不須另外處理

            //updateItemsSelects, vo.itemsSelects只通過timer偵測id來變更, 若有更新icon或tooltip因id不變而不須變更, 故此處須使用強制變更
            vo.updateItemsSelects(true)

        },

        refreshLegend: function() {
            let vo = this

            //legnedBackgroundColor
            let legnedBackgroundColor = get(vo, 'opt.legnedBackgroundColor', '')
            if (!isestr(legnedBackgroundColor)) {
                legnedBackgroundColor = 'rgba(90,90,90,0.5)'
            }

            vo.useLegnedBackgroundColor = oc.toRgbaString(legnedBackgroundColor)
            // console.log('useLegnedBackgroundColor', vo.useLegnedBackgroundColor)

            //legnedHeight
            let legnedHeight = get(vo, 'opt.legnedHeight', null)

            //legnedHeightMax
            let legnedHeightMax = get(vo, 'opt.legnedHeightMax', null)

            let useLegnedHeight = ''
            if (isnum(legnedHeight)) {
                legnedHeight = cdbl(legnedHeight)
                useLegnedHeight += `height:${legnedHeight}px;`
            }
            if (isnum(legnedHeightMax)) {
                legnedHeightMax = cdbl(legnedHeightMax)
                useLegnedHeight += `max-height:${legnedHeightMax}px;`
            }
            if (isnum(legnedHeight) || isnum(legnedHeightMax)) {
                useLegnedHeight += `overflow-y:auto;`
            }
            vo.useLegnedHeight = useLegnedHeight
            // console.log('useLegnedHeight', vo.useLegnedHeight)

        },

        init: async function() {
            let vo = this

            async function core() {

                //dispose
                vo.dispose()

                //waitFun
                await waitFun(() => {
                    return isEle(vo.$refs.panel)
                })
                // console.log('vo.$refs.panel', vo.$refs.panel)

                //show loading
                vo.loading = true

                //optPlot3d
                let optPlot3d = cloneDeep(vo.opt)
                optPlot3d.domPanel = vo.$refs.panel

                //items
                let items = get(optPlot3d, 'items', [])
                // console.log('items', items)

                //plot3d
                let ev = await plot3d(items, optPlot3d)

                //on
                ev.on('init', () => {
                    // console.log('init')
                    vo.$emit('init')

                    //updateMenus
                    vo.updateMenus()

                    //refreshLegend
                    vo.refreshLegend()

                    //hide loading
                    vo.loading = false

                })
                ev.on('loading', (msg) => {
                    // console.log('loading', msg)
                    vo.$emit('loading', msg)
                })
                ev.on('dispose', () => {
                    // console.log('dispose')
                    vo.$emit('dispose')
                })
                ev.on('change-view-angle', (msg) => {
                    // console.log('change-view-angle')
                    vo.$emit('change-view-angle', msg)
                })

                //save
                vo.ev = ev

            }

            //core
            await core()
                .catch((err) => {
                    console.log(err)
                })

        },

        modify: async function () {
            let vo = this

            async function core() {

                //check
                if (vo.ev === null) {
                    return
                }

                //delay
                await delay(300)

                //ks, ksTemp
                let ks = keys(vo.opt)
                let ksTemp = keys(vo.optTemp)
                // console.log('ks', ks)
                // console.log('ksTemp', ksTemp)

                //rs
                let rs = []
                each(ks, (k) => {

                    //vNew, vOld
                    let vNew = get(vo, `opt.${k}`, null)
                    let vOld = get(vo, `optTemp.${k}`, null)

                    //check
                    if (!isEqual(vNew, vOld)) {
                        rs.push({
                            type: 'mod',
                            k,
                            vOld,
                            vNew,
                        })
                    }

                    //pull
                    pull(ksTemp, k)

                })
                each(ksTemp, (k) => {
                    let vOld = get(vo, `optTemp.${k}`, null)
                    rs.push({
                        type: 'del',
                        k,
                        vOld,
                        vNew: null,
                    })
                })
                // console.log('rs', rs)

                //kpSet
                let kpSet = {

                    width: '', //由vue處理不需要另外處理
                    height: '', //由vue處理不需要另外處理

                    backgroundColor: 'ev.setBackgroundColor',

                    useAutoRotate: 'ev.setUseAutoRotate',
                    autoRotateDeg: 'ev.setAutoRotateDeg',

                    useHelperAxes: 'ev.setUseHelperAxes',
                    helperAxesLengthRatio: 'ev.setHelperAxesLengthRatio',

                    useHelperGrid: 'ev.setUseHelperGrid',
                    helperGridLengthRatio: 'ev.setHelperGridLengthRatio',
                    helperGridDensity: 'ev.setHelperGridDensity',
                    helperGridPositionRatioZ: 'ev.setHelperGridPositionRatioZ',

                    useLightAmbient: 'ev.setUseLightAmbient',
                    lightAmbientColor: 'ev.setLightAmbientColor',

                    useLightPoint: 'ev.setUseLightPoint',
                    lightPointPoss: 'ev.setLightPointPoss',
                    lightPointColor: 'ev.setLightPointColor',
                    lightPointIntensity: 'ev.setLightPointIntensity',
                    lightPointDistance: 'ev.setLightPointDistance',
                    lightPointDecay: 'ev.setLightPointDecay',

                    useLightDirection: 'ev.setUseLightDirection',
                    lightDirectionColor: 'ev.setLightDirectionColor',
                    lightDirectionIntensity: 'ev.setLightDirectionIntensity',
                    lightDirectionPos: 'ev.setLightDirectionPos',

                    useAxis: 'ev.setUseAxis',
                    axisXTitle: 'ev.setAxisXTitle',
                    axisXTitleColor: 'ev.setAxisXTitleColor',
                    axisXTitleFontSize: 'ev.setAxisXTitleFontSize',
                    axisXTitleFontFamily: 'ev.setAxisXTitleFontFamily',
                    axisXTitleDistance: 'ev.setAxisXTitleDistance',
                    axisXLineColor: 'ev.setAxisXLineColor',
                    axisXLineWidth: 'ev.setAxisXLineWidth',
                    axisXTickLineColor: 'ev.setAxisXTickLineColor',
                    axisXTickLineWidth: 'ev.setAxisXTickLineWidth',
                    axisXTickLineLength: 'ev.setAxisXTickLineLength',
                    axisXTickNum: 'ev.setAxisXTickNum',
                    axisXTickLabelDistance: 'ev.setAxisXTickLabelDistance',
                    axisXTickLabelDig: 'ev.setAxisXTickLabelDig',
                    axisXTickLabelColor: 'ev.setAxisXTickLabelColor',
                    axisXTickLabelFontSize: 'ev.setAxisXTickLabelFontSize',
                    axisXTickLabelFontFamily: 'ev.setAxisXTickLabelFontFamily',
                    axisXGridLineColor: 'ev.setAxisXGridLineColor',
                    axisXGridLineWidth: 'ev.setAxisXGridLineWidth',
                    axisYTitle: 'ev.setAxisYTitle',
                    axisYTitleColor: 'ev.setAxisYTitleColor',
                    axisYTitleFontSize: 'ev.setAxisYTitleFontSize',
                    axisYTitleFontFamily: 'ev.setAxisYTitleFontFamily',
                    axisYTitleDistance: 'ev.setAxisYTitleDistance',
                    axisYLineColor: 'ev.setAxisYLineColor',
                    axisYLineWidth: 'ev.setAxisYLineWidth',
                    axisYTickLineColor: 'ev.setAxisYTickLineColor',
                    axisYTickLineWidth: 'ev.setAxisYTickLineWidth',
                    axisYTickLineLength: 'ev.setAxisYTickLineLength',
                    axisYTickNum: 'ev.setAxisYTickNum',
                    axisYTickLabelDistance: 'ev.setAxisYTickLabelDistance',
                    axisYTickLabelDig: 'ev.setAxisYTickLabelDig',
                    axisYTickLabelColor: 'ev.setAxisYTickLabelColor',
                    axisYTickLabelFontSize: 'ev.setAxisYTickLabelFontSize',
                    axisYTickLabelFontFamily: 'ev.setAxisYTickLabelFontFamily',
                    axisYGridLineColor: 'ev.setAxisYGridLineColor',
                    axisYGridLineWidth: 'ev.setAxisYGridLineWidth',
                    axisZTitle: 'ev.setAxisZTitle',
                    axisZTitleColor: 'ev.setAxisZTitleColor',
                    axisZTitleFontSize: 'ev.setAxisZTitleFontSize',
                    axisZTitleFontFamily: 'ev.setAxisZTitleFontFamily',
                    axisZTitleDistance: 'ev.setAxisZTitleDistance',
                    axisZLineColor: 'ev.setAxisZLineColor',
                    axisZLineWidth: 'ev.setAxisZLineWidth',
                    axisZTickLineColor: 'ev.setAxisZTickLineColor',
                    axisZTickLineWidth: 'ev.setAxisZTickLineWidth',
                    axisZTickLineLength: 'ev.setAxisZTickLineLength',
                    axisZTickNum: 'ev.setAxisZTickNum',
                    axisZTickLabelDistance: 'ev.setAxisZTickLabelDistance',
                    axisZTickLabelDig: 'ev.setAxisZTickLabelDig',
                    axisZTickLabelColor: 'ev.setAxisZTickLabelColor',
                    axisZTickLabelFontSize: 'ev.setAxisZTickLabelFontSize',
                    axisZTickLabelFontFamily: 'ev.setAxisZTickLabelFontFamily',
                    axisZGridLineColor: 'ev.setAxisZGridLineColor',
                    axisZGridLineWidth: 'ev.setAxisZGridLineWidth',

                    cameraType: 'ev.setCameraType',
                    // cameraPos: 'ev.setCameraPos', //因cameraPos跟cameraPolarAngle與cameraAzimuthAngle衝突, 故僅提供設定cameraPolarAngle與cameraAzimuthAngle
                    cameraFov: 'ev.setCameraFov',
                    cameraNear: 'ev.setCameraNear',
                    cameraFar: 'ev.setCameraFar',
                    cameraOrthographicRatio: 'ev.setCameraOrthographicRatio',
                    cameraAzimuthAngle: 'ev.setCameraAzimuthAngle', //因可通過ui改變導致vue無法監聽變數有變而觸發computed, 故建議直接使用setCameraAzimuthAngle變更
                    cameraPolarAngle: 'ev.setCameraPolarAngle', //因可通過ui改變導致vue無法監聽變數有變而觸發computed, 故建議直接使用setCameraPolarAngle變更

                    menuSettingIcon: 'updateMenus',
                    menuSettingTooltip: 'updateMenus',
                    menuHelperAxesIcon: 'updateMenus',
                    menuHelperAxesTooltip: 'updateMenus',
                    menuHelperGridIcon: 'updateMenus',
                    menuHelperGridTooltip: 'updateMenus',
                    menuPerspectiveIcon: 'updateMenus',
                    menuPerspectiveTooltip: 'updateMenus',
                    menuAxisIcon: 'updateMenus',
                    menuAxisTooltip: 'updateMenus',
                    menuAutoRotateIcon: 'updateMenus',
                    menuAutoRotateTooltip: 'updateMenus',
                    menuViewXYIcon: 'updateMenus',
                    menuViewXYTooltip: 'updateMenus',
                    menuViewXZIcon: 'updateMenus',
                    menuViewXZTooltip: 'updateMenus',
                    menuViewYZIcon: 'updateMenus',
                    menuViewYZTooltip: 'updateMenus',
                    menuLegendIcon: 'updateMenus',
                    menuLegendTooltip: 'updateMenus',

                    legnedBackgroundColor: 'refreshLegend',
                    legnedHeight: 'refreshLegend',
                    legnedHeightMax: 'refreshLegend',

                }

                //call
                each(rs, (v) => {
                    let k = v.k
                    if (haskey(kpSet, k)) {
                        let cf = kpSet[k]
                        // console.log('call', k, cf)
                        let fun = get(vo, cf)
                        if (isfun(fun)) {
                            try {
                                fun(v.vNew)
                            }
                            catch (err) {
                                console.log(err)
                            }
                        }
                    }
                    else {
                        console.log(`尚未建置 ${k} 之 set 函數`)
                    }
                })

            }

            //core
            await core()
                .catch((err) => {
                    console.log(err)
                })

        },

        dispose: function() {
            let vo = this

            //使用setTimeout讓記憶體脫勾, 避免被computed視為連動
            setTimeout(() => {

                //check
                if (vo.ev === null) {
                    return
                }

                //dispose
                let fun = get(vo, 'ev.dispose')
                if (isfun(fun)) {
                    vo.ev.dispose()
                    vo.ev = null
                    // console.log('dispose')
                }

            }, 1)

        },

        getInst: function() {
            let vo = this
            return get(vo, 'ev')
        },

        getMeshs: function() {
            let vo = this
            let fun = get(vo, 'ev.getMeshsInfor')
            let meshs = []
            if (isfun(fun)) {
                meshs = fun()
                // console.log('meshs', meshs)
            }
            return meshs
        },

        getMeshColor: function(m) {
            // let vo = this
            let c = get(m, 'color', '')
            c = oc.toRgbaString(c)
            return c
        },

        setMeshColor: function(m, km, c) {
            let vo = this
            vo.ev.setMeshColor(km, c)
        },

        toggleMeshVisible: function(m, km) {
            let vo = this
            vo.ev.setMeshVisible(km, !m.visible)
        },

        strUpperHead: function(c) {
            // let vo = this
            let c0 = strleft(c, 1)
            c0 = toUpper(c0)
            let c1 = strdelleft(c, 1)
            return `${c0}${c1}`
        },

        getParam: function(key) {
            let vo = this
            let r = null
            key = vo.strUpperHead(key)
            let fun = get(vo, `ev.get${key}`)
            if (isfun(fun)) {
                r = fun()
            }
            return r
        },

        setParam: function(key, v1, v2) {
            let vo = this
            key = vo.strUpperHead(key)
            let fun = get(vo, `ev.set${key}`)
            if (isfun(fun)) {
                fun(v1, v2)
            }
        },

        toggleParam: function(key) {
            let vo = this
            let b = vo.getParam(key)
            b = !b
            vo.setParam(key, b)
        },

        ckItem: function(item) {
            let vo = this

            //kp
            let kp = {
                setting: () => {
                    vo.useSetting = !vo.useSetting
                },
                helperAxes: () => {
                    vo.toggleParam('useHelperAxes')
                },
                helperGrid: () => {
                    vo.toggleParam('useHelperGrid')
                },
                perspective: () => {
                    if (vo.usePerspective) {
                        vo.setParam('cameraType', 'orthographic')
                    }
                    else {
                        vo.setParam('cameraType', 'perspective')
                    }
                },
                axis: () => {
                    vo.toggleParam('useAxis')
                },
                autoRotate: () => {
                    vo.toggleParam('useAutoRotate')
                },
                viewxy: () => {
                    vo.setParam('cameraViewAngle', 0, 0)
                },
                viewxz: () => {
                    vo.setParam('cameraViewAngle', 0, 90)
                },
                viewyz: () => {
                    vo.setParam('cameraViewAngle', 90, 90)
                },
                legend: () => {
                    vo.useLegend = !vo.useLegend
                },
            }

            //id
            let id = get(item, 'id', '')
            // console.log('id', id)

            //fun
            let fun = get(kp, id)

            //call
            if (isfun(fun)) {
                fun()
            }
            else {
                console.log('item', item)
                console.log('kp', kp)
                console.log(`invalid id[${id}]`)
            }

        },

    },
}
</script>

<style scoped>
</style>
