<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">getMeshsInfor</div>
            <a href="//yuda-lyu.github.io/w-threejs-vue/examples/ex-AppMhGetMeshsInfor.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-threejs-vue/blob/master/docs/examples/ex-AppMhGetMeshsInfor.html" target="_blank" class="item-link">code</a>
        </div>

        <div class="bkp">

            <div style="display:flex; padding-bottom:40px; overflow-x:auto;">

                <div style="position:relative;">
                    <div style="position:absolute; right:2px; top:1px; text-align:right; z-index:1;" v-if="!loading">
                        <div style="text-align:right;">
                            <button style="margin:0px 3px 3px 0px;" @click="getMeshsInfor()">getMeshsInfor</button>
                        </div>
                        <div style="margin:0px 0px 0px 1px; padding:5px; font-size:0.75rem; color:#000; background:#eee;" v-if="c">
                            <pre style="padding:0px; margin:0px;">{{c}}</pre>
                        </div>
                    </div>
                    <WThreejsVue
                        ref="thr"
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
            'c': '',
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
        getMeshsInfor: function() {
            let vo = this
            try {
                let r = vo.$refs.thr.getInst().getMeshsInfor()
                let c = JSON.stringify(r, null, 2)
                console.log('getMeshsInfor', r, c)
                vo.c = c
            }
            catch (err) {}
        },
    },
}
</script>

<style>
</style>
