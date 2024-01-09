<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">getCameraViewAngle</div>
            <a href="//yuda-lyu.github.io/w-threejs-vue/examples/ex-AppCmGetCameraViewAngle.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-threejs-vue/blob/master/docs/examples/ex-AppCmGetCameraViewAngle.html" target="_blank" class="item-link">code</a>
        </div>

        <div class="bkp">

            <div style="display:flex; padding-bottom:40px; overflow-x:auto;">

                <div style="position:relative;">
                    <div style="position:absolute; right:2px; top:1px; z-index:1;" v-if="!loading">
                        <div style="padding:2px 5px; font-size:0.75rem; color:#000; background:#eee;">
                            <span>{{az}}</span>, <span>{{polar}}</span>
                        </div>
                    </div>
                    <WThreejsVue
                        ref="thr"
                        :opt="opt"
                        @init="loading=false"
                        @change-view-angle="changeViewAngle"
                    ></WThreejsVue>
                </div>

                <div style="padding-left:20px;">

                    <div :style="`border:1px solid #ddd; width:600px; min-width:600px; height:${opt.height}px; overflow-y:auto;`">
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
            // 'timer': null,
            'az': null,
            'polar': null,
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
            },
            'action': [
            ],
        }
    },
    mounted: function() {
        let vo = this
        vo.showOptJson()
        // vo.timer = setInterval(() => {
        //     vo.getCameraViewAngle()
        // }, 50)
    },
    beforeDestroy: function() {
        // let vo = this
        // clearInterval(vo.timer)
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
        // getCameraViewAngle: function() {
        //     let vo = this
        //     let az = null
        //     let polar = null
        //     try {
        //         let r = vo.$refs.thr.getInst().getCameraViewAngle()
        //         az = r.azimuthAngle.toFixed(2)
        //         polar = r.polarAngle.toFixed(2)
        //     }
        //     catch (err) {}
        //     vo.az = az
        //     vo.polar = polar
        // },
        changeViewAngle: function(r) {
            console.log('changeViewAngle', r)
            let vo = this
            let az = null
            let polar = null
            try {
                az = r.azimuthAngle.toFixed(2)
                polar = r.polarAngle.toFixed(2)
            }
            catch (err) {}
            vo.az = az
            vo.polar = polar
        },
    },
}
</script>

<style>
</style>
