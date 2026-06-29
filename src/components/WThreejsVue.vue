<template>
    <div
        :style="`position:relative; width:${widthInp}px; height:${heightInp}px;`"
        :loading="loading"
    >

        <!-- 圖台區 -->
        <div
            ref="panel"
            :style="`width:${widthInp}px; height:${heightInp}px; opacity:${loading?0:1};`"
            v-domresize
            @domresize="resizePanel"
        ></div>

        <!-- 輔助區 -->
        <!-- 須使用pointer-events:none吃掉事件, 才能點擊選單區透明區域 -->
        <div
            :style="`position:absolute; top:0px; left:0px; pointer-events:none;`"
            v-if="!loading"
        >

            <div :style="`padding:${space+menuYShiftInp}px ${space}px ${space}px ${space}px; display:flex; align-items:flex-start;`">

                <!-- 設定區 -->
                <!-- 須使用pointer-events:auto恢復子元素接收事件, 才能點擊與捲動選單 -->
                <WPanelScrolly
                    :style="`width:${panelItemsIconSize}px; height:${panelItemsHeight}px; pointer-events:auto;`"
                    :bar-opacity="0"
                    :bar-opacity-hover="0.8"
                >

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

                </WPanelScrolly>

                <template v-if="useLegend">

                    <div :style="`padding-left:${space}px;`"></div>

                    <!-- 圖例區 -->
                    <!-- 須使用pointer-events:none吃掉事件, 才能點擊選單區透明區域 -->
                    <div :style="`padding:5px; border-radius:4px; background:${useLegendBackgroundColor}; pointer-events:auto;`">
                        <div :style="`${useLegendHeight}`">

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
</template>

<script>
import { mdiCogOutline, mdiAxis, mdiAxisZRotateCounterclockwise, mdiGrid, mdiProjectorScreenOutline, mdiPackageVariantClosed, mdiListBoxOutline, mdiEyeOutline, mdiEyeOffOutline } from '@mdi/js/mdi.js'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import map from 'lodash-es/map.js'
import keyBy from 'lodash-es/keyBy.js'
import size from 'lodash-es/size.js'
import toUpper from 'lodash-es/toUpper.js'
import keys from 'lodash-es/keys.js'
import pull from 'lodash-es/pull.js'
import isEqual from 'lodash-es/isEqual.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import waitFun from 'wsemi/src/waitFun.mjs'
import haskey from 'wsemi/src/haskey.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isEle from 'wsemi/src/isEle.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import debounce from 'wsemi/src/debounce.mjs'
import strleft from 'wsemi/src/strleft.mjs'
import strdelleft from 'wsemi/src/strdelleft.mjs'
import oc from 'wsemi/src/color.mjs'
import domResize from 'w-component-vue/src/js/domResize.mjs'
import WPanelScrolly from 'w-component-vue/src/components/WPanelScrolly.vue'
import WGroupIconCheck from 'w-component-vue/src/components/WGroupIconCheck.vue'
import WIcon from 'w-component-vue/src/components/WIcon.vue'
import WColorSelect from 'w-component-vue/src/components/WColorSelect.vue'
import plot3d from '../js/plot3d.mjs'


let pathXY = `M 11.846997,18.39162 H 10.298964 L 7.0132374,12.771255 3.7275112,18.39162 H 2.1683717 L 6.2340948,11.441753 2.4024562,4.8687472 H 3.9504895 L 7.0132374,10.102848 10.064879,4.8687472 h 1.548034 L 7.7821281,11.441753 Z M 22.650766,4.8687472 18.552578,11.922776 v 6.468844 h -1.436971 v -6.450037 l -4.13236,-7.0728358 h 1.548034 l 3.285725,5.6203648 3.285727,-5.6203648 z`
let pathXZ = `M 11.271926,18.568104 H 9.7408431 L 6.4910943,12.996958 3.2413455,18.568104 H 1.6992781 L 5.7204831,11.679099 1.9307994,5.1636556 H 3.4618823 L 6.4910943,10.351919 9.5093217,5.1636556 H 11.040404 L 7.2515659,11.679099 Z m 10.465779,0 h -8.889914 v -0.57002 L 19.886379,6.3137351 H 13.067483 V 5.1636556 h 8.670222 V 5.7429974 L 14.698273,17.418742 h 7.039432 z`
let pathYZ = `M 22.049294,18.372083 H 12.678108 V 17.831045 L 20.097742,6.7407687 H 12.910584 V 5.6491633 h 9.13871 v 0.549886 L 14.628768,17.281159 h 7.420526 z M 11.249404,5.6491633 6.976656,12.285907 v 6.086176 H 5.4784775 V 12.303601 L 1.1701008,5.6491633 H 2.7840719 L 6.2097526,10.937053 9.635433,5.6491633 Z`


/**
 * @vue-prop {Object} [opt={}] 輸入設定物件，預設{}
 * @vue-prop {Number} [opt.width] 輸入元件寬度數字，單位px
 * @vue-prop {Number} [opt.height] 輸入元件高度數字，單位px
 * @vue-prop {Array} [opt.items=[]] 輸入3D場景中要渲染的物件資料陣列，預設[]
 * @vue-prop {String} [opt.backgroundColor] 輸入場景背景色字串
 * @vue-prop {Boolean} [opt.useAutoRotate=false] 輸入是否啟用自動旋轉布林值，預設false
 * @vue-prop {Number} [opt.autoRotateDeg] 輸入自動旋轉角度數字，單位度
 * @vue-prop {Boolean} [opt.useHelperAxes=true] 輸入是否顯示輔助軸線布林值，預設true
 * @vue-prop {Number} [opt.helperAxesLengthRatio] 輸入輔助軸線長度比例數字
 * @vue-prop {Boolean} [opt.useHelperGrid=true] 輸入是否顯示輔助網格布林值，預設true
 * @vue-prop {Number} [opt.helperGridLengthRatio] 輸入輔助網格長度比例數字
 * @vue-prop {Number} [opt.helperGridDensity] 輸入輔助網格密度數字
 * @vue-prop {Number} [opt.helperGridPositionRatioZ] 輸入輔助網格Z軸位置比例數字
 * @vue-prop {Boolean} [opt.useLightAmbient] 輸入是否啟用環境光布林值
 * @vue-prop {String} [opt.lightAmbientColor] 輸入環境光顏色字串
 * @vue-prop {Boolean} [opt.useLightPoint] 輸入是否啟用點光源布林值
 * @vue-prop {Array} [opt.lightPointPoss] 輸入點光源位置陣列
 * @vue-prop {String} [opt.lightPointColor] 輸入點光源顏色字串
 * @vue-prop {Number} [opt.lightPointIntensity] 輸入點光源強度數字
 * @vue-prop {Number} [opt.lightPointDistance] 輸入點光源照射距離數字
 * @vue-prop {Number} [opt.lightPointDecay] 輸入點光源衰減率數字
 * @vue-prop {Boolean} [opt.useLightDirection] 輸入是否啟用平行光布林值
 * @vue-prop {String} [opt.lightDirectionColor] 輸入平行光顏色字串
 * @vue-prop {Number} [opt.lightDirectionIntensity] 輸入平行光強度數字
 * @vue-prop {Object} [opt.lightDirectionPos] 輸入平行光位置物件
 * @vue-prop {Boolean} [opt.useAxis=false] 輸入是否顯示座標軸布林值，預設false
 * @vue-prop {String} [opt.axisXTitle] 輸入X軸標題文字字串
 * @vue-prop {String} [opt.axisXTitleColor] 輸入X軸標題顏色字串
 * @vue-prop {String} [opt.axisXTitleFontSize] 輸入X軸標題字型大小字串
 * @vue-prop {String} [opt.axisXTitleFontFamily] 輸入X軸標題字型字串
 * @vue-prop {Number} [opt.axisXTitleDistance] 輸入X軸標題與軸線距離數字
 * @vue-prop {String} [opt.axisXLineColor] 輸入X軸線顏色字串
 * @vue-prop {Number} [opt.axisXLineWidth] 輸入X軸線寬度數字
 * @vue-prop {String} [opt.axisXTickLineColor] 輸入X軸刻度線顏色字串
 * @vue-prop {Number} [opt.axisXTickLineWidth] 輸入X軸刻度線寬度數字
 * @vue-prop {Number} [opt.axisXTickLineLength] 輸入X軸刻度線長度數字
 * @vue-prop {Number} [opt.axisXTickNum] 輸入X軸刻度數量數字
 * @vue-prop {Number} [opt.axisXTickLabelDistance] 輸入X軸刻度標籤與軸線距離數字
 * @vue-prop {Number} [opt.axisXTickLabelDig] 輸入X軸刻度標籤小數位數數字
 * @vue-prop {String} [opt.axisXTickLabelColor] 輸入X軸刻度標籤顏色字串
 * @vue-prop {String} [opt.axisXTickLabelFontSize] 輸入X軸刻度標籤字型大小字串
 * @vue-prop {String} [opt.axisXTickLabelFontFamily] 輸入X軸刻度標籤字型字串
 * @vue-prop {String} [opt.axisXGridLineColor] 輸入X軸網格線顏色字串
 * @vue-prop {Number} [opt.axisXGridLineWidth] 輸入X軸網格線寬度數字
 * @vue-prop {String} [opt.axisYTitle] 輸入Y軸標題文字字串
 * @vue-prop {String} [opt.axisYTitleColor] 輸入Y軸標題顏色字串
 * @vue-prop {String} [opt.axisYTitleFontSize] 輸入Y軸標題字型大小字串
 * @vue-prop {String} [opt.axisYTitleFontFamily] 輸入Y軸標題字型字串
 * @vue-prop {Number} [opt.axisYTitleDistance] 輸入Y軸標題與軸線距離數字
 * @vue-prop {String} [opt.axisYLineColor] 輸入Y軸線顏色字串
 * @vue-prop {Number} [opt.axisYLineWidth] 輸入Y軸線寬度數字
 * @vue-prop {String} [opt.axisYTickLineColor] 輸入Y軸刻度線顏色字串
 * @vue-prop {Number} [opt.axisYTickLineWidth] 輸入Y軸刻度線寬度數字
 * @vue-prop {Number} [opt.axisYTickLineLength] 輸入Y軸刻度線長度數字
 * @vue-prop {Number} [opt.axisYTickNum] 輸入Y軸刻度數量數字
 * @vue-prop {Number} [opt.axisYTickLabelDistance] 輸入Y軸刻度標籤與軸線距離數字
 * @vue-prop {Number} [opt.axisYTickLabelDig] 輸入Y軸刻度標籤小數位數數字
 * @vue-prop {String} [opt.axisYTickLabelColor] 輸入Y軸刻度標籤顏色字串
 * @vue-prop {String} [opt.axisYTickLabelFontSize] 輸入Y軸刻度標籤字型大小字串
 * @vue-prop {String} [opt.axisYTickLabelFontFamily] 輸入Y軸刻度標籤字型字串
 * @vue-prop {String} [opt.axisYGridLineColor] 輸入Y軸網格線顏色字串
 * @vue-prop {Number} [opt.axisYGridLineWidth] 輸入Y軸網格線寬度數字
 * @vue-prop {String} [opt.axisZTitle] 輸入Z軸標題文字字串
 * @vue-prop {String} [opt.axisZTitleColor] 輸入Z軸標題顏色字串
 * @vue-prop {String} [opt.axisZTitleFontSize] 輸入Z軸標題字型大小字串
 * @vue-prop {String} [opt.axisZTitleFontFamily] 輸入Z軸標題字型字串
 * @vue-prop {Number} [opt.axisZTitleDistance] 輸入Z軸標題與軸線距離數字
 * @vue-prop {String} [opt.axisZLineColor] 輸入Z軸線顏色字串
 * @vue-prop {Number} [opt.axisZLineWidth] 輸入Z軸線寬度數字
 * @vue-prop {String} [opt.axisZTickLineColor] 輸入Z軸刻度線顏色字串
 * @vue-prop {Number} [opt.axisZTickLineWidth] 輸入Z軸刻度線寬度數字
 * @vue-prop {Number} [opt.axisZTickLineLength] 輸入Z軸刻度線長度數字
 * @vue-prop {Number} [opt.axisZTickNum] 輸入Z軸刻度數量數字
 * @vue-prop {Number} [opt.axisZTickLabelDistance] 輸入Z軸刻度標籤與軸線距離數字
 * @vue-prop {Number} [opt.axisZTickLabelDig] 輸入Z軸刻度標籤小數位數數字
 * @vue-prop {String} [opt.axisZTickLabelColor] 輸入Z軸刻度標籤顏色字串
 * @vue-prop {String} [opt.axisZTickLabelFontSize] 輸入Z軸刻度標籤字型大小字串
 * @vue-prop {String} [opt.axisZTickLabelFontFamily] 輸入Z軸刻度標籤字型字串
 * @vue-prop {String} [opt.axisZGridLineColor] 輸入Z軸網格線顏色字串
 * @vue-prop {Number} [opt.axisZGridLineWidth] 輸入Z軸網格線寬度數字
 * @vue-prop {String} [opt.cameraType='perspective'] 輸入相機類型字串，可選'perspective'或'orthographic'，預設'perspective'
 * @vue-prop {Number} [opt.cameraFov] 輸入透視相機視野角度數字
 * @vue-prop {Number} [opt.cameraNear] 輸入相機近裁剪面數字
 * @vue-prop {Number} [opt.cameraFar] 輸入相機遠裁剪面數字
 * @vue-prop {Number} [opt.cameraOrthographicRatio] 輸入正交相機比例數字
 * @vue-prop {Number} [opt.cameraAzimuthAngle] 輸入相機方位角(水平角度)數字，因可通過UI改變導致Vue無法監聽變數有變而觸發computed，故建議直接使用setCameraAzimuthAngle變更
 * @vue-prop {Number} [opt.cameraPolarAngle] 輸入相機極角(垂直角度)數字，因可通過UI改變導致Vue無法監聯變數有變而觸發computed，故建議直接使用setCameraPolarAngle變更
 * @vue-prop {Number} [opt.menuYShift=0] 輸入選單區域頂部位移數字，單位px，正值向下移動，預設0
 * @vue-prop {Boolean} [opt.useSetting=true] 輸入是否顯示設定選單布林值，預設true
 * @vue-prop {String} [opt.menuSettingIcon] 輸入設定選單圖示SVG path字串，預設mdiCogOutline
 * @vue-prop {String} [opt.menuSettingTooltip='Settings'] 輸入設定選單tooltip文字字串，預設'Settings'
 * @vue-prop {Boolean} [opt.useMenuItemHelperAxes=true] 輸入是否顯示輔助軸線選單項目布林值，預設true
 * @vue-prop {String} [opt.menuHelperAxesIcon] 輸入輔助軸線圖示SVG path字串，預設mdiAxis
 * @vue-prop {String} [opt.menuHelperAxesTooltip='Help axes'] 輸入輔助軸線tooltip文字字串，預設'Help axes'
 * @vue-prop {Boolean} [opt.useMenuItemHelperGrid=true] 輸入是否顯示輔助網格選單項目布林值，預設true
 * @vue-prop {String} [opt.menuHelperGridIcon] 輸入輔助網格圖示SVG path字串，預設mdiGrid
 * @vue-prop {String} [opt.menuHelperGridTooltip='Help grid'] 輸入輔助網格tooltip文字字串，預設'Help grid'
 * @vue-prop {Boolean} [opt.useMenuItemPerspective=true] 輸入是否顯示透視切換選單項目布林值，預設true
 * @vue-prop {String} [opt.menuPerspectiveIcon] 輸入透視切換圖示SVG path字串，預設mdiProjectorScreenOutline
 * @vue-prop {String} [opt.menuPerspectiveTooltip='Perspective'] 輸入透視切換tooltip文字字串，預設'Perspective'
 * @vue-prop {Boolean} [opt.useMenuItemAxis=true] 輸入是否顯示座標軸選單項目布林值，預設true
 * @vue-prop {String} [opt.menuAxisIcon] 輸入座標軸圖示SVG path字串，預設mdiPackageVariantClosed
 * @vue-prop {String} [opt.menuAxisTooltip='Axis'] 輸入座標軸tooltip文字字串，預設'Axis'
 * @vue-prop {Boolean} [opt.useMenuItemAutoRotate=true] 輸入是否顯示自動旋轉選單項目布林值，預設true
 * @vue-prop {String} [opt.menuAutoRotateIcon] 輸入自動旋轉圖示SVG path字串，預設mdiAxisZRotateCounterclockwise
 * @vue-prop {String} [opt.menuAutoRotateTooltip='Auto rotate'] 輸入自動旋轉tooltip文字字串，預設'Auto rotate'
 * @vue-prop {Boolean} [opt.useMenuItemViewXY=true] 輸入是否顯示XY平面視角選單項目布林值，預設true
 * @vue-prop {String} [opt.menuViewXYIcon] 輸入XY平面視角圖示SVG path字串
 * @vue-prop {String} [opt.menuViewXYTooltip='XY plane'] 輸入XY平面視角tooltip文字字串，預設'XY plane'
 * @vue-prop {Boolean} [opt.useMenuItemViewXZ=true] 輸入是否顯示XZ平面視角選單項目布林值，預設true
 * @vue-prop {String} [opt.menuViewXZIcon] 輸入XZ平面視角圖示SVG path字串
 * @vue-prop {String} [opt.menuViewXZTooltip='XZ plane'] 輸入XZ平面視角tooltip文字字串，預設'XZ plane'
 * @vue-prop {Boolean} [opt.useMenuItemViewYZ=true] 輸入是否顯示YZ平面視角選單項目布林值，預設true
 * @vue-prop {String} [opt.menuViewYZIcon] 輸入YZ平面視角圖示SVG path字串
 * @vue-prop {String} [opt.menuViewYZTooltip='YZ plane'] 輸入YZ平面視角tooltip文字字串，預設'YZ plane'
 * @vue-prop {Boolean} [opt.useLegend=true] 輸入是否顯示圖例布林值，預設true
 * @vue-prop {Boolean} [opt.useMenuItemLegend=true] 輸入是否顯示圖例選單項目布林值，預設true
 * @vue-prop {String} [opt.menuLegendIcon] 輸入圖例圖示SVG path字串，預設mdiListBoxOutline
 * @vue-prop {String} [opt.menuLegendTooltip='Legend'] 輸入圖例tooltip文字字串，預設'Legend'
 * @vue-prop {String} [opt.legendBackgroundColor='rgba(90,90,90,0.5)'] 輸入圖例區域背景色字串，預設'rgba(90,90,90,0.5)'
 * @vue-prop {Number} [opt.legendHeight=null] 輸入圖例區域固定高度數字，單位px，預設null
 * @vue-prop {Number} [opt.legendHeightMax=null] 輸入圖例區域最大高度數字，單位px，預設null
 */
export default {
    directives: {
        domresize: domResize(),
    },
    components: {
        WPanelScrolly,
        WGroupIconCheck,
        WIcon,
        WColorSelect,
    },
    props: {
        opt: {
            type: Object,
            default: () => ({}),
        },
    },
    data: function() {
        return {
            mdiEyeOutline,
            mdiEyeOffOutline,

            loading: true,

            timer: null,
            dbcRefresh: debounce(),
            syncRunning: false,
            syncPending: false,
            disposed: false,

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

            nidInit: 0,
            nidRefresh: 0,
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

            useLegendBackgroundColor: '',
            useLegendHeight: '',

            space: 10,
            panelItemsIconSize: 30,

        }
    },
    mounted: function() {
        let vo = this
        vo.timer = setInterval(() => {
            if (vo.ev === null) {
                return
            }
            vo.refreshControlState()
            vo.refreshMeshsState()
        }, 1000)
    },
    beforeDestroy: function() {
        let vo = this
        vo.disposed = true
        vo.syncPending = false
        clearInterval(vo.timer)
        vo.dispose(true)
    },
    watch: {
        'opt': {
            handler(value) {
                // console.log('watch opt handler', cloneDeep(value))

                let vo = this

                //refreshDebounce
                vo.refreshDebounce()

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

        menuYShiftInp: function() {
            //console.log('computed menuYShiftInp')

            let vo = this

            //y
            let y = get(vo, 'opt.menuYShift', null)
            if (!isnum(y)) {
                y = 0
            }
            y = cdbl(y)

            return y
        },

        useMenuItemHelperAxesInp: function() {
            //console.log('computed useMenuItemHelperAxesInp')

            let vo = this

            //b
            let b = get(vo, 'opt.useMenuItemHelperAxes', null)
            if (!isbol(b)) {
                b = true
            }

            return b
        },

        useMenuItemHelperGridInp: function() {
            //console.log('computed useMenuItemHelperGridInp')

            let vo = this

            //b
            let b = get(vo, 'opt.useMenuItemHelperGrid', null)
            if (!isbol(b)) {
                b = true
            }

            return b
        },

        useMenuItemPerspectiveInp: function() {
            //console.log('computed useMenuItemPerspectiveInp')

            let vo = this

            //b
            let b = get(vo, 'opt.useMenuItemPerspective', null)
            if (!isbol(b)) {
                b = true
            }

            return b
        },

        useMenuItemAxisInp: function() {
            //console.log('computed useMenuItemAxisInp')

            let vo = this

            //b
            let b = get(vo, 'opt.useMenuItemAxis', null)
            if (!isbol(b)) {
                b = true
            }

            return b
        },

        useMenuItemAutoRotateInp: function() {
            //console.log('computed useMenuItemAutoRotateInp')

            let vo = this

            //b
            let b = get(vo, 'opt.useMenuItemAutoRotate', null)
            if (!isbol(b)) {
                b = true
            }

            return b
        },

        useMenuItemViewXYInp: function() {
            //console.log('computed useMenuItemViewXYInp')

            let vo = this

            //b
            let b = get(vo, 'opt.useMenuItemViewXY', null)
            if (!isbol(b)) {
                b = true
            }

            return b
        },

        useMenuItemViewXZInp: function() {
            //console.log('computed useMenuItemViewXZInp')

            let vo = this

            //b
            let b = get(vo, 'opt.useMenuItemViewXZ', null)
            if (!isbol(b)) {
                b = true
            }

            return b
        },

        useMenuItemViewYZInp: function() {
            //console.log('computed useMenuItemViewYZInp')

            let vo = this

            //b
            let b = get(vo, 'opt.useMenuItemViewYZ', null)
            if (!isbol(b)) {
                b = true
            }

            return b
        },

        useMenuItemLegendInp: function() {
            //console.log('computed useMenuItemLegendInp')

            let vo = this

            //b
            let b = get(vo, 'opt.useMenuItemLegend', null)
            if (!isbol(b)) {
                b = true
            }

            return b
        },

        items: function() {
            let vo = this
            let rs = [
                {
                    id: 'setting',
                    icon: vo.menuSettingIcon,
                    tooltip: vo.menuSettingTooltip,
                },
            ]
            if (vo.useMenuItemHelperAxesInp) {
                rs.push({
                    id: 'helperAxes',
                    icon: vo.menuHelperAxesIcon,
                    tooltip: vo.menuHelperAxesTooltip,
                })
            }
            if (vo.useMenuItemHelperGridInp) {
                rs.push({
                    id: 'helperGrid',
                    icon: vo.menuHelperGridIcon,
                    tooltip: vo.menuHelperGridTooltip,
                })
            }
            if (vo.useMenuItemPerspectiveInp) {
                rs.push({
                    id: 'perspective',
                    icon: vo.menuPerspectiveIcon,
                    tooltip: vo.menuPerspectiveTooltip,
                })
            }
            if (vo.useMenuItemAxisInp) {
                rs.push({
                    id: 'axis',
                    icon: vo.menuAxisIcon,
                    tooltip: vo.menuAxisTooltip,
                })
            }
            if (vo.useMenuItemViewXYInp) {
                rs.push({
                    id: 'viewxy',
                    icon: vo.menuViewXYIcon,
                    tooltip: vo.menuViewXYTooltip,
                })
            }
            if (vo.useMenuItemViewXZInp) {
                rs.push({
                    id: 'viewxz',
                    icon: vo.menuViewXZIcon,
                    tooltip: vo.menuViewXZTooltip,
                })
            }
            if (vo.useMenuItemViewYZInp) {
                rs.push({
                    id: 'viewyz',
                    icon: vo.menuViewYZIcon,
                    tooltip: vo.menuViewYZTooltip,
                })
            }
            if (vo.useMenuItemAutoRotateInp) {
                rs.push({
                    id: 'autoRotate',
                    icon: vo.menuAutoRotateIcon,
                    tooltip: vo.menuAutoRotateTooltip,
                })
            }
            if (vo.useMenuItemLegendInp) {
                rs.push({
                    id: 'legend',
                    icon: vo.menuLegendIcon,
                    tooltip: vo.menuLegendTooltip,
                })
            }
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

        panelItemsHeight: function() {
            let vo = this
            let h = 0
            if (vo.useSetting) {
                let n = size(vo.items)
                h = size(vo.items) * vo.panelItemsIconSize + (n - 1) * 1
            }
            else {
                h = vo.panelItemsIconSize
            }
            h = Math.min(h, vo.heightInp - vo.space * 2)
            return h
        },

    },
    methods: {

        resizePanel: function(msg) {
            // console.log('methods resizePanel', msg)

            let vo = this

            //check
            if (vo.disposed || vo.ev === null) {
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

            let itemsById = keyBy(vo.items, 'id')
            let rs = []
            each(vo.itemsSelectIds, (id) => {
                let r = get(itemsById, id)
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

        refreshControlState: function() {
            let vo = this

            let t = vo.getParam('useHelperAxes')
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

            vo.syncItemsSelectIds()
            vo.updateItemsSelects(false)

        },

        refreshMeshsState: function() {
            let vo = this

            let meshs = vo.getMeshs()
            if (!isEqual(vo.meshs, meshs)) {
                vo.meshs = meshs
                // console.log('meshs', vo.meshs)
            }

        },

        updateMenus: function() {
            let vo = this

            let useSetting = get(vo, 'opt.useSetting', null)
            if (!isbol(useSetting)) {
                useSetting = true
            }

            let useLegend = get(vo, 'opt.useLegend', null)
            if (!isbol(useLegend)) {
                useLegend = true
            }

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
            vo.useSetting = useSetting
            vo.useLegend = useLegend
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

            //legendBackgroundColor
            let legendBackgroundColor = get(vo, 'opt.legendBackgroundColor', '')
            if (!isestr(legendBackgroundColor)) {
                legendBackgroundColor = 'rgba(90,90,90,0.5)'
            }

            vo.useLegendBackgroundColor = oc.toRgbaString(legendBackgroundColor)
            // console.log('useLegendBackgroundColor', vo.useLegendBackgroundColor)

            //legendHeight
            let legendHeight = get(vo, 'opt.legendHeight', null)

            //legendHeightMax
            let legendHeightMax = get(vo, 'opt.legendHeightMax', null)

            let useLegendHeight = ''
            if (isnum(legendHeight)) {
                legendHeight = cdbl(legendHeight)
                useLegendHeight += `height:${legendHeight}px;`
            }
            if (isnum(legendHeightMax)) {
                legendHeightMax = cdbl(legendHeightMax)
                useLegendHeight += `max-height:${legendHeightMax}px;`
            }
            if (isnum(legendHeight) || isnum(legendHeightMax)) {
                useLegendHeight += `overflow-y:auto;`
            }
            vo.useLegendHeight = useLegendHeight
            // console.log('useLegendHeight', vo.useLegendHeight)

        },

        init: async function(nid) {
            let vo = this

            //check disposed
            if (vo.disposed) {
                return
            }

            //nid
            if (!isnum(nid)) {
                nid = ++vo.nidInit
            }

            let core = async () => {

                //waitFun
                await waitFun(() => {
                    return vo.disposed || isEle(vo.$refs.panel)
                })
                // console.log('vo.$refs.panel', vo.$refs.panel)
                if (vo.disposed || nid !== vo.nidInit) {
                    return
                }

                //show and emit loading
                vo.loading = true
                vo.$emit('loading', true)

                //optPlot3d
                let optUsed = cloneDeep(vo.opt)
                let optPlot3d = cloneDeep(optUsed)
                optPlot3d.domPanel = vo.$refs.panel

                //items
                let items = get(optPlot3d, 'items', [])
                // console.log('items', items)

                //plot3d
                let ev = await plot3d(items, optPlot3d)
                if (vo.disposed || nid !== vo.nidInit) {
                    ev.dispose()
                    return
                }

                //save
                vo.ev = ev

                //resolveInit
                let resolveInit = () => {}
                let initPromise = new Promise((resolve) => {
                    resolveInit = resolve
                })

                //handleInit
                let initHandled = false
                let handleInit = () => {
                    if (vo.disposed || nid !== vo.nidInit) {
                        resolveInit()
                        return
                    }
                    if (initHandled) {
                        return
                    }
                    initHandled = true
                    // console.log('init')

                    //emit
                    vo.$emit('init')

                    //updateMenus
                    vo.updateMenus()

                    //refreshLegend
                    vo.refreshLegend()

                    //refreshControlState
                    vo.refreshControlState()

                    //refreshMeshsState
                    vo.refreshMeshsState()

                    //save applied opt
                    vo.optTemp = cloneDeep(optUsed)

                    //hide and emit loading
                    vo.loading = false
                    vo.$emit('loading', false)

                    //resolveInit
                    resolveInit()

                }

                //handleError
                let handleError = (err) => {

                    //check
                    if (vo.disposed || nid !== vo.nidInit) {
                        resolveInit()
                        return
                    }
                    // console.log('error', err)

                    //reset and emit loading
                    vo.loading = false
                    vo.$emit('loading', false)

                    //emit
                    vo.$emit('error', err)

                    //resolveInit
                    resolveInit()

                }

                //on
                ev.on('init', handleInit)
                ev.on('prog', (msg) => {
                    if (vo.disposed || nid !== vo.nidInit) {
                        return
                    }
                    // console.log('prog', msg)
                    vo.$emit('prog', msg)
                })
                ev.on('error', handleError)
                ev.on('dispose', () => {
                    if (vo.disposed || nid !== vo.nidInit) {
                        resolveInit()
                        return
                    }
                    // console.log('dispose')
                    vo.$emit('dispose')
                    resolveInit()
                })
                ev.on('change-view-angle', (msg) => {
                    if (vo.disposed || nid !== vo.nidInit) {
                        return
                    }
                    // console.log('change-view-angle')
                    vo.$emit('change-view-angle', msg)
                })
                ev.on('mesh-change', () => {
                    if (vo.disposed || nid !== vo.nidInit) {
                        return
                    }
                    // console.log('mesh-change')
                    vo.refreshMeshsState()
                })
                ev.on('config-change', () => {
                    if (vo.disposed || nid !== vo.nidInit) {
                        return
                    }
                    // console.log('config-change')
                    vo.refreshControlState()
                })

                //check
                if (isfun(ev.getReady) && ev.getReady()) {
                    handleInit()
                }

                //readyError
                let readyError = isfun(ev.getReadyError) ? ev.getReadyError() : null

                //check
                if (readyError) {
                    handleError(readyError)
                }

                //initPromise
                await initPromise

            }

            //core
            await core()
                .catch((err) => {

                    //check
                    if (vo.disposed || nid !== vo.nidInit) {
                        return
                    }

                    //reset and emit loading
                    vo.loading = false
                    vo.$emit('loading', false)

                    //emit
                    vo.$emit('error', err)
                    console.log(err)

                })

        },

        refreshCore: async function (nid) {
            let vo = this

            //check
            if (vo.disposed) {
                return false
            }

            let core = async () => {

                //check ev
                if (vo.ev === null) {
                    let nidInit = ++vo.nidInit
                    await vo.init(nidInit)
                    return true
                }

                //check nid
                if (nid !== vo.nidRefresh) {
                    return false
                }

                //check optTemp
                if (vo.optTemp === null) {
                    vo.optTemp = cloneDeep(vo.opt)
                    return true
                }

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

                    items: 'reloadItems',

                    width: 'resize',
                    height: 'resize',

                    useMenuItemHelperAxes: 'updateMenus',
                    useMenuItemHelperGrid: 'updateMenus',
                    useMenuItemPerspective: 'updateMenus',
                    useMenuItemAxis: 'updateMenus',
                    useMenuItemAutoRotate: 'updateMenus',
                    useMenuItemViewXY: 'updateMenus',
                    useMenuItemViewXZ: 'updateMenus',
                    useMenuItemViewYZ: 'updateMenus',
                    useMenuItemLegend: 'updateMenus',

                    backgroundColor: 'ev.setBackgroundColor',

                    useSetting: 'updateMenus',
                    useLegend: 'updateMenus',

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

                    legendBackgroundColor: 'refreshLegend',
                    legendHeight: 'refreshLegend',
                    legendHeightMax: 'refreshLegend',

                }

                //call
                let needUpdateMenus = false
                let needRefreshLegend = false
                let needResize = false
                let needReloadItems = false
                let itemsToReload = []
                let beginBatchUpdate = get(vo, 'ev.beginBatchUpdate')
                let endBatchUpdate = get(vo, 'ev.endBatchUpdate')
                if (isfun(beginBatchUpdate)) {
                    beginBatchUpdate()
                }
                try {
                    for (let v of rs) {
                        let k = v.k
                        if (haskey(kpSet, k)) {
                            let cf = kpSet[k]
                            // console.log('call', k, cf)
                            if (cf === 'updateMenus') {
                                needUpdateMenus = true
                            }
                            else if (cf === 'refreshLegend') {
                                needRefreshLegend = true
                            }
                            else if (cf === 'resize') {
                                needResize = true
                            }
                            else if (cf === 'reloadItems') {
                                needReloadItems = true
                                itemsToReload = Array.isArray(v.vNew) ? cloneDeep(v.vNew) : []
                            }
                            else {
                                let fun = get(vo, cf)
                                if (isfun(fun)) {
                                    try {
                                        await fun(v.vNew)
                                    }
                                    catch (err) {
                                        console.log(err)
                                    }
                                }
                            }
                        }
                        else {
                            console.log(`尚未建置 ${k} 之 set 函數`)
                        }
                    }
                    if (needReloadItems) {
                        let setMeshs = get(vo, 'ev.setMeshs')
                        if (isfun(setMeshs)) {
                            await setMeshs(itemsToReload)
                        }
                    }
                }
                finally {
                    if (isfun(endBatchUpdate)) {
                        endBatchUpdate()
                    }
                }

                //updateMenus
                if (needUpdateMenus) {
                    vo.updateMenus()
                }

                //refreshLegend
                if (needRefreshLegend) {
                    vo.refreshLegend()
                }

                //resizePanel
                if (needResize) {
                    vo.resizePanel()
                }

                return true
            }

            //core
            let r = false
            await core()
                .then((res) => {
                    r = res
                })
                .catch((err) => {
                    console.log(err)
                })

            return r
        },

        refreshDebounce: function() {
            let vo = this

            //check
            if (vo.disposed) {
                return
            }

            //syncRunning
            if (vo.syncRunning) {
                vo.syncPending = true
            }

            let run = () => {
                vo.refreshLatest()
                    .catch((err) => {
                        console.log(err)
                    })
            }

            //run
            if (vo.ev === null) {
                run() //首次初始化(ev尚未建立)立即執行, 後續變更才debounce節流
            }
            else {
                vo.dbcRefresh(run)
            }

        },

        refreshLatest: async function() {
            let vo = this

            //check disposed
            if (vo.disposed) {
                return
            }

            //check syncRunning
            if (vo.syncRunning) {
                vo.syncPending = true
                return
            }
            vo.syncRunning = true

            //refreshCore
            try {
                do {

                    //check disposed
                    if (vo.disposed) {
                        return
                    }
                    vo.syncPending = false

                    //nid
                    let nid = ++vo.nidRefresh

                    //refreshCore
                    let success = await vo.refreshCore(nid)

                    //save optTemp
                    if (success !== false && !vo.syncPending && nid === vo.nidRefresh && vo.ev !== null) {
                        vo.optTemp = cloneDeep(vo.opt)
                    }

                } while (vo.syncPending)
            }
            finally {
                vo.syncRunning = false
            }

        },

        dispose: function(immediate = false) {
            let vo = this
            let ev = vo.ev

            //check ev
            if (ev === null) {
                return
            }

            let disposeCore = () => {
                let fun = get(ev, 'dispose')
                if (isfun(fun)) {
                    ev.dispose()
                    if (vo.ev === ev) {
                        vo.ev = null
                    }
                    // console.log('dispose')
                }
            }

            //disposeCore
            if (immediate) {
                disposeCore()
                return
            }

            //使用setTimeout讓記憶體脫勾, 避免被computed視為連動
            setTimeout(disposeCore, 1)

        },

        getInst: function() {
            let vo = this
            return get(vo, 'ev')
        },

        resetView: function(opt) {
            let vo = this
            let fun = get(vo, 'ev.resetView')
            if (isfun(fun)) {
                fun(opt)
            }
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
            let fun = get(vo, 'ev.setMeshColor')
            if (isfun(fun)) {
                fun(km, c)
            }
        },

        toggleMeshVisible: function(m, km) {
            let vo = this
            let fun = get(vo, 'ev.setMeshVisible')
            if (isfun(fun)) {
                fun(km, !m.visible)
            }
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
