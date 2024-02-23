<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">menuIcons</div>
            <a href="//yuda-lyu.github.io/w-threejs-vue/examples/ex-AppMuMenuIcons.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-threejs-vue/blob/master/docs/examples/ex-AppMuMenuIcons.html" target="_blank" class="item-link">code</a>
        </div>

        <div class="bkp">

            <div style="display:flex; padding-bottom:40px; overflow-x:auto;">

                <div style="position:relative;">
                    <div style="position:absolute; right:2px; top:1px; text-align:right; z-index:1;" v-if="!loading">
                        <button style="margin:0px 3px 3px 0px;" @click="setMenuIcons(1)">set to set(1)</button>
                        <button style="margin:0px 3px 3px 0px;" @click="setMenuIcons(2)">set to set(2)</button>
                    </div>
                    <WThreejsVue
                        :opt="opt"
                        @init="loading=false"
                    ></WThreejsVue>
                </div>

                <div style="padding:0px 20px;">

                    <div :style="`border:1px solid #ddd; width:590px; min-width:590px; height:${opt.height}px; overflow-y:auto;`">
                        <div style="padding-left:5px;">
                            <div id="optjson" style="font-size:10pt;"></div>
                        </div>
                    </div>

                </div>

            </div>

        </div>

    </div>
</template>

<script>
import WThreejsVue from './components/WThreejsVue.vue'
import jv from 'w-jsonview-tree'

export default {
    components: {
        WThreejsVue,
    },
    data: function() {
        return {
            'loading': true,
            'opt': {
                width: 800,
                height: 600,
                items: [
                    {
                        url: 'https://cdn.jsdelivr.net/npm/w-demores@1.0.25/res/model/stl/3d_wheel-hub.stl',
                        name: 'Wheel Hub',
                        color: 'rgba(214, 92, 92, 0.9)',
                    },
                    {
                        url: 'https://cdn.jsdelivr.net/npm/w-demores@1.0.25/res/model/stl/3d_ushape-connector.stl',
                        name: 'Ushape Connector',
                        color: 'rgba(214, 214, 92, 0.9)',
                    },
                ],
                //須先給予預設值, 切換值才能被vue偵測
                menuSettingIcon: 'fas fa-cog',
                menuAutoRotateIcon: 'fas fa-history',
                menuHelperAxesIcon: 'fas fa-crosshairs',
                menuHelperGridIcon: 'fas fa-border-all',
                menuPerspectiveIcon: 'fas fa-monument',
                menuLegendIcon: 'fas fa-list',
            },
            'action': [
            ],
        }
    },
    mounted: function() {
        let vo = this
        vo.showOptJson()
    },
    watch: {
        opt: {
            handler: function() {
                let vo = this
                vo.showOptJson()
            },
            deep: true,
        },
    },
    methods: {
        showOptJson: function() {
            let vo = this
            jv(vo.opt, document.querySelector('#optjson'), { expanded: true })
        },
        setMenuIconsMode1: function() {
            let vo = this
            vo.opt.menuSettingIcon = 'mdi-cog-outline'
            vo.opt.menuAutoRotateIcon = 'mdi-axis-z-rotate-counterclockwise'
            vo.opt.menuHelperAxesIcon = 'mdi-axis'
            vo.opt.menuHelperGridIcon = 'mdi-grid'
            vo.opt.menuPerspectiveIcon = 'mdi-projector-screen-outline'
            vo.opt.menuLegendIcon = 'mdi-list-box-outline'
        },
        setMenuIconsMode2: function() {
            let vo = this
            vo.opt.menuSettingIcon = 'fas fa-cog'
            vo.opt.menuAutoRotateIcon = 'fas fa-history'
            vo.opt.menuHelperAxesIcon = 'fas fa-crosshairs'
            vo.opt.menuHelperGridIcon = 'fas fa-border-all'
            vo.opt.menuPerspectiveIcon = 'fas fa-monument'
            vo.opt.menuLegendIcon = 'fas fa-list'
        },
        setMenuIcons: function(mode) {
            let vo = this
            if (mode === 2) {
                vo.setMenuIconsMode2()
            }
            else {
                vo.setMenuIconsMode1()
            }
        },
    },
}
</script>

<style>
</style>
