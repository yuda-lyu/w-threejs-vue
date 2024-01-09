<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">cameraFov</div>
            <a href="//yuda-lyu.github.io/w-threejs-vue/examples/ex-AppCmCameraFov.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-threejs-vue/blob/master/docs/examples/ex-AppCmCameraFov.html" target="_blank" class="item-link">code</a>
        </div>

        <div class="bkp">

            <div style="display:flex; padding-bottom:40px; overflow-x:auto;">

                <div style="position:relative;">
                    <div style="position:absolute; right:2px; top:1px; z-index:1;" v-if="!loading">
                        <button style="margin:0px 3px 3px 0px;" @click="setCameraFov(35)">set to 35</button>
                        <button style="margin:0px 3px 3px 0px;" @click="setCameraFov(50)">set to 50</button>
                    </div>
                    <WThreejsVue
                        :opt="opt"
                        @init="loading=false"
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
                // useAutoRotate: true,
                // cameraType: 'orthographic', //注意orthographic無fov可設定
                cameraFov: 50,
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
        setCameraFov: function(r) {
            let vo = this
            vo.opt.cameraFov = r
        },
    },
}
</script>

<style>
</style>
