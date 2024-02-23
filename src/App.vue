<template>
    <div
        style=""
        :changeMenus="changeMenus"
    >


        <template v-if="!isNarrow">
            <a href="https://github.com/yuda-lyu/w-threejs-vue" class="github-corner" style="position:fixed; top:0; right:0; border:0; z-index:10000;" aria-label="View source on GitHub" target="_blank" rel="noreferrer noopener">
                <svg width="80" height="80" viewBox="0 0 250 250" style="fill:rgba(0,0,0,0.25); color:#fff; position: absolute; top: 0; border: 0; right: 0;" aria-hidden="true"><path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path><path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path></svg>
            </a>
        </template>


        <div style="background:#f5f5f5;">

            <div style="width:calc( 100vw - 20px ); overflow-x:auto;" v-if="cmpsL1 && cmpsL1.length>0">
                <WListHorizontal
                    :items="cmpsL1"
                    :itemActive.sync="cmpP1"
                    :itemBackgroundColor="'transparent'"
                    :itemBackgroundColorHover="'#eee'"
                    :itemBackgroundColorActive="'#eee'"
                    :keyText="'name'"
                    :paddingStyle="{v:12,h:20}"
                    @update:itemActive="(v)=>{indP3=0;indP2=0;indP1=getInd(v,cmpsL1)}"
                >
                    <template v-slot:item="props">
                        <div style="">
                            {{props.item.name}}
                        </div>
                    </template>
                </WListHorizontal>
                <div style="height:1px; background:#ddd;"></div>
            </div>


            <div style="width:calc( 100vw - 20px ); overflow-x:auto;" v-if="cmpsL2 && cmpsL2.length>0">
                <div style="height:3px; background:#fff;"></div>
                <WListHorizontal
                    :items="cmpsL2"
                    :itemActive.sync="cmpP2"
                    :itemBackgroundColor="'transparent'"
                    :itemBackgroundColorHover="'#eee'"
                    :itemBackgroundColorActive="'#eee'"
                    :keyText="'name'"
                    :paddingStyle="{v:12,h:20}"
                    @update:itemActive="(v)=>{indP3=0;indP2=getInd(v,cmpsL2)}"
                >
                    <template v-slot:item="props">
                        <div style="">
                            {{props.item.name}}
                        </div>
                    </template>
                </WListHorizontal>
                <div style="height:1px; background:#ddd;"></div>
            </div>

            <div style="width:calc( 100vw - 20px ); overflow-x:auto;" v-if="cmpsL3 && cmpsL3.length>0">
                <div style="height:3px; background:#fff;"></div>
                <WListHorizontal
                    :items="cmpsL3"
                    :itemActive.sync="cmpP3"
                    :itemBackgroundColor="'transparent'"
                    :itemBackgroundColorHover="'#eee'"
                    :itemBackgroundColorActive="'#eee'"
                    :keyText="'name'"
                    :paddingStyle="{v:12,h:20}"
                    @update:itemActive="(v)=>{indP3=getInd(v,cmpsL3)}"
                >
                    <template v-slot:item="props">
                        <div style="">
                            {{props.item.name}}
                        </div>
                    </template>
                </WListHorizontal>
                <div style="height:1px; background:#ddd;"></div>
            </div>

        </div>


        <div class="bkh">

            <AppBasicSize v-if="cmpPick==='size'"></AppBasicSize>

            <AppBasicBackgroundColor v-if="cmpPick==='backgroundColor'"></AppBasicBackgroundColor>

            <AppBasicUseAutoRotate v-if="cmpPick==='useAutoRotate'"></AppBasicUseAutoRotate>

            <AppBasicAutoRotateDeg v-if="cmpPick==='autoRotateDeg'"></AppBasicAutoRotateDeg>

            <AppBasicUploadStl v-if="cmpPick==='uploadStl'"></AppBasicUploadStl>

            <AppCmCameraType v-if="cmpPick==='cameraType'"></AppCmCameraType>

            <AppCmCameraFov v-if="cmpPick==='cameraFov'"></AppCmCameraFov>

            <AppCmCameraNear v-if="cmpPick==='cameraNear'"></AppCmCameraNear>

            <AppCmCameraFar v-if="cmpPick==='cameraFar'"></AppCmCameraFar>

            <AppCmCameraOrthographicRatio v-if="cmpPick==='cameraOrthographicRatio'"></AppCmCameraOrthographicRatio>

            <AppCmSetCameraAzimuthAngle v-if="cmpPick==='setCameraAzimuthAngle'"></AppCmSetCameraAzimuthAngle>

            <AppCmSetCameraPolarAngle v-if="cmpPick==='setCameraPolarAngle'"></AppCmSetCameraPolarAngle>

            <AppCmSetCameraViewAngle v-if="cmpPick==='setCameraViewAngle'"></AppCmSetCameraViewAngle>

            <AppCmGetCameraViewAngle v-if="cmpPick==='getCameraViewAngle'"></AppCmGetCameraViewAngle>

            <AppHpUseHelperAxes v-if="cmpPick==='useHelperAxes'"></AppHpUseHelperAxes>

            <AppHpHelperAxesLengthRatio v-if="cmpPick==='helperAxesLengthRatio'"></AppHpHelperAxesLengthRatio>

            <AppHpUseHelperGrid v-if="cmpPick==='useHelperGrid'"></AppHpUseHelperGrid>

            <AppHpHelperGridLengthRatio v-if="cmpPick==='helperGridLengthRatio'"></AppHpHelperGridLengthRatio>

            <AppHpHelperGridDensity v-if="cmpPick==='helperGridDensity'"></AppHpHelperGridDensity>

            <AppHpHelperGridPositionRatioZ v-if="cmpPick==='helperGridPositionRatioZ'"></AppHpHelperGridPositionRatioZ>

            <AppLtUseLightAmbient v-if="cmpPick==='useLightAmbient'"></AppLtUseLightAmbient>

            <AppLtLightAmbientColor v-if="cmpPick==='lightAmbientColor'"></AppLtLightAmbientColor>

            <AppLtUseLightPoint v-if="cmpPick==='useLightPoint'"></AppLtUseLightPoint>

            <AppLtLightPointPoss v-if="cmpPick==='lightPointPoss'"></AppLtLightPointPoss>

            <AppLtLightPointColor v-if="cmpPick==='lightPointColor'"></AppLtLightPointColor>

            <AppLtLightPointIntensity v-if="cmpPick==='lightPointIntensity'"></AppLtLightPointIntensity>

            <AppLtLightPointDistance v-if="cmpPick==='lightPointDistance'"></AppLtLightPointDistance>

            <AppLtLightPointDecay v-if="cmpPick==='lightPointDecay'"></AppLtLightPointDecay>

            <AppLtUseLightDirection v-if="cmpPick==='useLightDirection'"></AppLtUseLightDirection>

            <AppLtLightDirectionColor v-if="cmpPick==='lightDirectionColor'"></AppLtLightDirectionColor>

            <AppLtLightDirectionIntensity v-if="cmpPick==='lightDirectionIntensity'"></AppLtLightDirectionIntensity>

            <AppLtLightDirectionPos v-if="cmpPick==='lightDirectionPos'"></AppLtLightDirectionPos>

<!-- bbb -->

            <AppMhUseAxis v-if="cmpPick==='useAxis'"></AppMhUseAxis>

            <AppAxAxisXTitle v-if="cmpPick==='axisXTitle'"></AppAxAxisXTitle>

            <AppAxAxisXTitleColor v-if="cmpPick==='axisXTitleColor'"></AppAxAxisXTitleColor>

            <AppAxAxisXTitleFontSize v-if="cmpPick==='axisXTitleFontSize'"></AppAxAxisXTitleFontSize>

            <AppAxAxisXTitleFontFamily v-if="cmpPick==='axisXTitleFontFamily'"></AppAxAxisXTitleFontFamily>

            <AppAxAxisXTitleDistance v-if="cmpPick==='axisXTitleDistance'"></AppAxAxisXTitleDistance>

            <AppAxAxisXLineColor v-if="cmpPick==='axisXLineColor'"></AppAxAxisXLineColor>

            <AppAxAxisXLineWidth v-if="cmpPick==='axisXLineWidth'"></AppAxAxisXLineWidth>

            <AppAxAxisXTickLineColor v-if="cmpPick==='axisXTickLineColor'"></AppAxAxisXTickLineColor>

            <AppAxAxisXTickLineWidth v-if="cmpPick==='axisXTickLineWidth'"></AppAxAxisXTickLineWidth>

            <AppAxAxisXTickLineLength v-if="cmpPick==='axisXTickLineLength'"></AppAxAxisXTickLineLength>

            <AppAxAxisXTickNum v-if="cmpPick==='axisXTickNum'"></AppAxAxisXTickNum>

            <AppAxAxisXTickLabelDistance v-if="cmpPick==='axisXTickLabelDistance'"></AppAxAxisXTickLabelDistance>

            <AppAxAxisXTickLabelDig v-if="cmpPick==='axisXTickLabelDig'"></AppAxAxisXTickLabelDig>

            <AppAxAxisXTickLabelColor v-if="cmpPick==='axisXTickLabelColor'"></AppAxAxisXTickLabelColor>

            <AppAxAxisXTickLabelFontSize v-if="cmpPick==='axisXTickLabelFontSize'"></AppAxAxisXTickLabelFontSize>

            <AppAxAxisXTickLabelFontFamily v-if="cmpPick==='axisXTickLabelFontFamily'"></AppAxAxisXTickLabelFontFamily>

            <AppAxAxisYTitle v-if="cmpPick==='axisYTitle'"></AppAxAxisYTitle>

            <AppAxAxisYTitleColor v-if="cmpPick==='axisYTitleColor'"></AppAxAxisYTitleColor>

            <AppAxAxisYTitleFontSize v-if="cmpPick==='axisYTitleFontSize'"></AppAxAxisYTitleFontSize>

            <AppAxAxisYTitleFontFamily v-if="cmpPick==='axisYTitleFontFamily'"></AppAxAxisYTitleFontFamily>

            <AppAxAxisYTitleDistance v-if="cmpPick==='axisYTitleDistance'"></AppAxAxisYTitleDistance>

            <AppAxAxisYLineColor v-if="cmpPick==='axisYLineColor'"></AppAxAxisYLineColor>

            <AppAxAxisYLineWidth v-if="cmpPick==='axisYLineWidth'"></AppAxAxisYLineWidth>

            <AppAxAxisYTickLineColor v-if="cmpPick==='axisYTickLineColor'"></AppAxAxisYTickLineColor>

            <AppAxAxisYTickLineWidth v-if="cmpPick==='axisYTickLineWidth'"></AppAxAxisYTickLineWidth>

            <AppAxAxisYTickLineLength v-if="cmpPick==='axisYTickLineLength'"></AppAxAxisYTickLineLength>

            <AppAxAxisYTickNum v-if="cmpPick==='axisYTickNum'"></AppAxAxisYTickNum>

            <AppAxAxisYTickLabelDistance v-if="cmpPick==='axisYTickLabelDistance'"></AppAxAxisYTickLabelDistance>

            <AppAxAxisYTickLabelDig v-if="cmpPick==='axisYTickLabelDig'"></AppAxAxisYTickLabelDig>

            <AppAxAxisYTickLabelColor v-if="cmpPick==='axisYTickLabelColor'"></AppAxAxisYTickLabelColor>

            <AppAxAxisYTickLabelFontSize v-if="cmpPick==='axisYTickLabelFontSize'"></AppAxAxisYTickLabelFontSize>

            <AppAxAxisYTickLabelFontFamily v-if="cmpPick==='axisYTickLabelFontFamily'"></AppAxAxisYTickLabelFontFamily>

            <AppAxAxisZTitle v-if="cmpPick==='axisZTitle'"></AppAxAxisZTitle>

            <AppAxAxisZTitleColor v-if="cmpPick==='axisZTitleColor'"></AppAxAxisZTitleColor>

            <AppAxAxisZTitleFontSize v-if="cmpPick==='axisZTitleFontSize'"></AppAxAxisZTitleFontSize>

            <AppAxAxisZTitleFontFamily v-if="cmpPick==='axisZTitleFontFamily'"></AppAxAxisZTitleFontFamily>

            <AppAxAxisZTitleDistance v-if="cmpPick==='axisZTitleDistance'"></AppAxAxisZTitleDistance>

            <AppAxAxisZLineColor v-if="cmpPick==='axisZLineColor'"></AppAxAxisZLineColor>

            <AppAxAxisZLineWidth v-if="cmpPick==='axisZLineWidth'"></AppAxAxisZLineWidth>

            <AppAxAxisZTickLineColor v-if="cmpPick==='axisZTickLineColor'"></AppAxAxisZTickLineColor>

            <AppAxAxisZTickLineWidth v-if="cmpPick==='axisZTickLineWidth'"></AppAxAxisZTickLineWidth>

            <AppAxAxisZTickLineLength v-if="cmpPick==='axisZTickLineLength'"></AppAxAxisZTickLineLength>

            <AppAxAxisZTickNum v-if="cmpPick==='axisZTickNum'"></AppAxAxisZTickNum>

            <AppAxAxisZTickLabelDistance v-if="cmpPick==='axisZTickLabelDistance'"></AppAxAxisZTickLabelDistance>

            <AppAxAxisZTickLabelDig v-if="cmpPick==='axisZTickLabelDig'"></AppAxAxisZTickLabelDig>

            <AppAxAxisZTickLabelColor v-if="cmpPick==='axisZTickLabelColor'"></AppAxAxisZTickLabelColor>

            <AppAxAxisZTickLabelFontSize v-if="cmpPick==='axisZTickLabelFontSize'"></AppAxAxisZTickLabelFontSize>

            <AppAxAxisZTickLabelFontFamily v-if="cmpPick==='axisZTickLabelFontFamily'"></AppAxAxisZTickLabelFontFamily>


<!-- bbb -->

            <AppMhGetMeshsInfor v-if="cmpPick==='getMeshsInfor'"></AppMhGetMeshsInfor>

            <AppMhSetMeshVisible v-if="cmpPick==='setMeshVisible'"></AppMhSetMeshVisible>

            <AppMhSetMeshColor v-if="cmpPick==='setMeshColor'"></AppMhSetMeshColor>

            <AppMhSetMeshLabelVisible v-if="cmpPick==='setMeshLabelVisible'"></AppMhSetMeshLabelVisible>

            <AppMhSetMeshLabelText v-if="cmpPick==='setMeshLabelText'"></AppMhSetMeshLabelText>

            <AppMhSetMeshLabelTextColor v-if="cmpPick==='setMeshLabelTextColor'"></AppMhSetMeshLabelTextColor>

            <AppMhSetMeshLabelTextFontSize v-if="cmpPick==='setMeshLabelTextFontSize'"></AppMhSetMeshLabelTextFontSize>

            <AppMhSetMeshLabelTextFontFamily v-if="cmpPick==='setMeshLabelTextFontFamily'"></AppMhSetMeshLabelTextFontFamily>

            <AppLgLegnedBackgroundColor v-if="cmpPick==='legnedBackgroundColor'"></AppLgLegnedBackgroundColor>

            <AppLgLegnedHeight v-if="cmpPick==='legnedHeight'"></AppLgLegnedHeight>

            <AppLgLegnedHeightMax v-if="cmpPick==='legnedHeightMax'"></AppLgLegnedHeightMax>

            <AppMuMenuIcons v-if="cmpPick==='menuIcons'"></AppMuMenuIcons>

            <AppMuMenuTooltips v-if="cmpPick==='menuTooltips'"></AppMuMenuTooltips>

        </div>


    </div>
</template>

<script>
import get from 'lodash-es/get'
import each from 'lodash-es/each'
// import cloneDeep from 'lodash-es/cloneDeep'
import urlParse from 'wsemi/src/urlParse.mjs'
import WListHorizontal from 'w-component-vue/src/components/WListHorizontal.vue'
import AppBasicSize from './AppBasicSize.vue'
import AppBasicBackgroundColor from './AppBasicBackgroundColor.vue'
import AppBasicUseAutoRotate from './AppBasicUseAutoRotate.vue'
import AppBasicAutoRotateDeg from './AppBasicAutoRotateDeg.vue'
import AppBasicUploadStl from './AppBasicUploadStl.vue'
import AppCmCameraType from './AppCmCameraType.vue'
import AppCmCameraFov from './AppCmCameraFov.vue'
import AppCmCameraNear from './AppCmCameraNear.vue'
import AppCmCameraFar from './AppCmCameraFar.vue'
import AppCmCameraOrthographicRatio from './AppCmCameraOrthographicRatio.vue'
import AppCmSetCameraAzimuthAngle from './AppCmSetCameraAzimuthAngle.vue'
import AppCmSetCameraPolarAngle from './AppCmSetCameraPolarAngle.vue'
import AppCmSetCameraViewAngle from './AppCmSetCameraViewAngle.vue'
import AppCmGetCameraViewAngle from './AppCmGetCameraViewAngle.vue'
import AppHpUseHelperAxes from './AppHpUseHelperAxes.vue'
import AppHpHelperAxesLengthRatio from './AppHpHelperAxesLengthRatio.vue'
import AppHpUseHelperGrid from './AppHpUseHelperGrid.vue'
import AppHpHelperGridLengthRatio from './AppHpHelperGridLengthRatio.vue'
import AppHpHelperGridDensity from './AppHpHelperGridDensity.vue'
import AppHpHelperGridPositionRatioZ from './AppHpHelperGridPositionRatioZ.vue'
import AppLtUseLightAmbient from './AppLtUseLightAmbient.vue'
import AppLtLightAmbientColor from './AppLtLightAmbientColor.vue'
import AppLtUseLightPoint from './AppLtUseLightPoint.vue'
import AppLtLightPointPoss from './AppLtLightPointPoss.vue'
import AppLtLightPointColor from './AppLtLightPointColor.vue'
import AppLtLightPointIntensity from './AppLtLightPointIntensity.vue'
import AppLtLightPointDistance from './AppLtLightPointDistance.vue'
import AppLtLightPointDecay from './AppLtLightPointDecay.vue'
import AppLtUseLightDirection from './AppLtUseLightDirection.vue'
import AppLtLightDirectionColor from './AppLtLightDirectionColor.vue'
import AppLtLightDirectionIntensity from './AppLtLightDirectionIntensity.vue'
import AppLtLightDirectionPos from './AppLtLightDirectionPos.vue'
// bbb

import AppMhUseAxis from './AppMhUseAxis.vue'
import AppAxAxisXTitle from './AppAxAxisXTitle.vue'
import AppAxAxisXTitleColor from './AppAxAxisXTitleColor.vue'
import AppAxAxisXTitleFontSize from './AppAxAxisXTitleFontSize.vue'
import AppAxAxisXTitleFontFamily from './AppAxAxisXTitleFontFamily.vue'
import AppAxAxisXTitleDistance from './AppAxAxisXTitleDistance.vue'
import AppAxAxisXLineColor from './AppAxAxisXLineColor.vue'
import AppAxAxisXLineWidth from './AppAxAxisXLineWidth.vue'
import AppAxAxisXTickLineColor from './AppAxAxisXTickLineColor.vue'
import AppAxAxisXTickLineWidth from './AppAxAxisXTickLineWidth.vue'
import AppAxAxisXTickLineLength from './AppAxAxisXTickLineLength.vue'
import AppAxAxisXTickNum from './AppAxAxisXTickNum.vue'
import AppAxAxisXTickLabelDistance from './AppAxAxisXTickLabelDistance.vue'
import AppAxAxisXTickLabelDig from './AppAxAxisXTickLabelDig.vue'
import AppAxAxisXTickLabelColor from './AppAxAxisXTickLabelColor.vue'
import AppAxAxisXTickLabelFontSize from './AppAxAxisXTickLabelFontSize.vue'
import AppAxAxisXTickLabelFontFamily from './AppAxAxisXTickLabelFontFamily.vue'
import AppAxAxisYTitle from './AppAxAxisYTitle.vue'
import AppAxAxisYTitleColor from './AppAxAxisYTitleColor.vue'
import AppAxAxisYTitleFontSize from './AppAxAxisYTitleFontSize.vue'
import AppAxAxisYTitleFontFamily from './AppAxAxisYTitleFontFamily.vue'
import AppAxAxisYTitleDistance from './AppAxAxisYTitleDistance.vue'
import AppAxAxisYLineColor from './AppAxAxisYLineColor.vue'
import AppAxAxisYLineWidth from './AppAxAxisYLineWidth.vue'
import AppAxAxisYTickLineColor from './AppAxAxisYTickLineColor.vue'
import AppAxAxisYTickLineWidth from './AppAxAxisYTickLineWidth.vue'
import AppAxAxisYTickLineLength from './AppAxAxisYTickLineLength.vue'
import AppAxAxisYTickNum from './AppAxAxisYTickNum.vue'
import AppAxAxisYTickLabelDistance from './AppAxAxisYTickLabelDistance.vue'
import AppAxAxisYTickLabelDig from './AppAxAxisYTickLabelDig.vue'
import AppAxAxisYTickLabelColor from './AppAxAxisYTickLabelColor.vue'
import AppAxAxisYTickLabelFontSize from './AppAxAxisYTickLabelFontSize.vue'
import AppAxAxisYTickLabelFontFamily from './AppAxAxisYTickLabelFontFamily.vue'
import AppAxAxisZTitle from './AppAxAxisZTitle.vue'
import AppAxAxisZTitleColor from './AppAxAxisZTitleColor.vue'
import AppAxAxisZTitleFontSize from './AppAxAxisZTitleFontSize.vue'
import AppAxAxisZTitleFontFamily from './AppAxAxisZTitleFontFamily.vue'
import AppAxAxisZTitleDistance from './AppAxAxisZTitleDistance.vue'
import AppAxAxisZLineColor from './AppAxAxisZLineColor.vue'
import AppAxAxisZLineWidth from './AppAxAxisZLineWidth.vue'
import AppAxAxisZTickLineColor from './AppAxAxisZTickLineColor.vue'
import AppAxAxisZTickLineWidth from './AppAxAxisZTickLineWidth.vue'
import AppAxAxisZTickLineLength from './AppAxAxisZTickLineLength.vue'
import AppAxAxisZTickNum from './AppAxAxisZTickNum.vue'
import AppAxAxisZTickLabelDistance from './AppAxAxisZTickLabelDistance.vue'
import AppAxAxisZTickLabelDig from './AppAxAxisZTickLabelDig.vue'
import AppAxAxisZTickLabelColor from './AppAxAxisZTickLabelColor.vue'
import AppAxAxisZTickLabelFontSize from './AppAxAxisZTickLabelFontSize.vue'
import AppAxAxisZTickLabelFontFamily from './AppAxAxisZTickLabelFontFamily.vue'


//bbb
import AppMhGetMeshsInfor from './AppMhGetMeshsInfor.vue'
import AppMhSetMeshVisible from './AppMhSetMeshVisible.vue'
import AppMhSetMeshColor from './AppMhSetMeshColor.vue'
import AppMhSetMeshLabelVisible from './AppMhSetMeshLabelVisible.vue'
import AppMhSetMeshLabelText from './AppMhSetMeshLabelText.vue'
import AppMhSetMeshLabelTextColor from './AppMhSetMeshLabelTextColor.vue'
import AppMhSetMeshLabelTextFontSize from './AppMhSetMeshLabelTextFontSize.vue'
import AppMhSetMeshLabelTextFontFamily from './AppMhSetMeshLabelTextFontFamily.vue'
import AppLgLegnedBackgroundColor from './AppLgLegnedBackgroundColor.vue'
import AppLgLegnedHeight from './AppLgLegnedHeight.vue'
import AppLgLegnedHeightMax from './AppLgLegnedHeightMax.vue'
import AppMuMenuIcons from './AppMuMenuIcons.vue'
import AppMuMenuTooltips from './AppMuMenuTooltips.vue'


export default {
    components: {
        WListHorizontal,
        AppBasicSize,
        AppBasicBackgroundColor,
        AppBasicUseAutoRotate,
        AppBasicAutoRotateDeg,
        AppBasicUploadStl,
        AppCmCameraType,
        AppCmCameraFov,
        AppCmCameraNear,
        AppCmCameraFar,
        AppCmCameraOrthographicRatio,
        AppCmSetCameraAzimuthAngle,
        AppCmSetCameraPolarAngle,
        AppCmSetCameraViewAngle,
        AppCmGetCameraViewAngle,
        AppHpUseHelperAxes,
        AppHpHelperAxesLengthRatio,
        AppHpUseHelperGrid,
        AppHpHelperGridLengthRatio,
        AppHpHelperGridDensity,
        AppHpHelperGridPositionRatioZ,
        AppLtUseLightAmbient,
        AppLtLightAmbientColor,
        AppLtUseLightPoint,
        AppLtLightPointPoss,
        AppLtLightPointColor,
        AppLtLightPointIntensity,
        AppLtLightPointDistance,
        AppLtLightPointDecay,
        AppLtUseLightDirection,
        AppLtLightDirectionColor,
        AppLtLightDirectionIntensity,
        AppLtLightDirectionPos,

        //bbb
        AppMhUseAxis,
        AppAxAxisXTitle,
        AppAxAxisXTitleColor,
        AppAxAxisXTitleFontSize,
        AppAxAxisXTitleFontFamily,
        AppAxAxisXTitleDistance,
        AppAxAxisXLineColor,
        AppAxAxisXLineWidth,
        AppAxAxisXTickLineColor,
        AppAxAxisXTickLineWidth,
        AppAxAxisXTickLineLength,
        AppAxAxisXTickNum,
        AppAxAxisXTickLabelDistance,
        AppAxAxisXTickLabelDig,
        AppAxAxisXTickLabelColor,
        AppAxAxisXTickLabelFontSize,
        AppAxAxisXTickLabelFontFamily,
        AppAxAxisYTitle,
        AppAxAxisYTitleColor,
        AppAxAxisYTitleFontSize,
        AppAxAxisYTitleFontFamily,
        AppAxAxisYTitleDistance,
        AppAxAxisYLineColor,
        AppAxAxisYLineWidth,
        AppAxAxisYTickLineColor,
        AppAxAxisYTickLineWidth,
        AppAxAxisYTickLineLength,
        AppAxAxisYTickNum,
        AppAxAxisYTickLabelDistance,
        AppAxAxisYTickLabelDig,
        AppAxAxisYTickLabelColor,
        AppAxAxisYTickLabelFontSize,
        AppAxAxisYTickLabelFontFamily,
        AppAxAxisZTitle,
        AppAxAxisZTitleColor,
        AppAxAxisZTitleFontSize,
        AppAxAxisZTitleFontFamily,
        AppAxAxisZTitleDistance,
        AppAxAxisZLineColor,
        AppAxAxisZLineWidth,
        AppAxAxisZTickLineColor,
        AppAxAxisZTickLineWidth,
        AppAxAxisZTickLineLength,
        AppAxAxisZTickNum,
        AppAxAxisZTickLabelDistance,
        AppAxAxisZTickLabelDig,
        AppAxAxisZTickLabelColor,
        AppAxAxisZTickLabelFontSize,
        AppAxAxisZTickLabelFontFamily,


        //bbb

        AppMhGetMeshsInfor,
        AppMhSetMeshVisible,
        AppMhSetMeshColor,
        AppMhSetMeshLabelVisible,
        AppMhSetMeshLabelText,
        AppMhSetMeshLabelTextColor,
        AppMhSetMeshLabelTextFontSize,
        AppMhSetMeshLabelTextFontFamily,
        AppLgLegnedBackgroundColor,
        AppLgLegnedHeight,
        AppLgLegnedHeightMax,
        AppMuMenuIcons,
        AppMuMenuTooltips,
    },
    data: function() {
        let cmps = [
            {
                name: 'basic',
                cmps: [
                    { name: 'size' },
                    { name: 'backgroundColor' },
                    { name: 'useAutoRotate' },
                    { name: 'autoRotateDeg' },
                    { name: 'uploadStl' },
                ],
            },
            {
                name: 'camera',
                cmps: [
                    { name: 'cameraType' },
                    { name: 'cameraFov' },
                    { name: 'cameraNear' },
                    { name: 'cameraFar' },
                    { name: 'cameraOrthographicRatio' },
                    { name: 'setCameraAzimuthAngle' },
                    { name: 'setCameraPolarAngle' },
                    { name: 'setCameraViewAngle' },
                    { name: 'getCameraViewAngle' },
                ],
            },
            {
                name: 'helperAxes',
                cmps: [
                    { name: 'useHelperAxes' },
                    { name: 'helperAxesLengthRatio' },
                ],
            },
            {
                name: 'helperGrid',
                cmps: [
                    { name: 'useHelperGrid' },
                    { name: 'helperGridLengthRatio' },
                    { name: 'helperGridDensity' },
                    { name: 'helperGridPositionRatioZ' },
                ],
            },
            {
                name: 'lightAmbient',
                cmps: [
                    { name: 'useLightAmbient' },
                    { name: 'lightAmbientColor' },
                ],
            },
            {
                name: 'lightPoint',
                cmps: [
                    { name: 'useLightPoint' },
                    { name: 'lightPointPoss' },
                    { name: 'lightPointColor' },
                    { name: 'lightPointIntensity' },
                    { name: 'lightPointDistance' },
                    { name: 'lightPointDecay' },
                ],
            },
            {
                name: 'lightDirection',
                cmps: [
                    { name: 'useLightDirection' },
                    { name: 'lightDirectionColor' },
                    { name: 'lightDirectionIntensity' },
                    { name: 'lightDirectionPos' },
                ],
            },
            {
                name: 'axis',
                cmps: [
                    { name: 'useAxis' },
                    {
                        name: 'axisX',
                        cmps: [
                            { name: 'axisXTitle' },
                            { name: 'axisXTitleColor' },
                            { name: 'axisXTitleFontSize' },
                            { name: 'axisXTitleFontFamily' },
                            { name: 'axisXTitleDistance' },
                            { name: 'axisXLineColor' },
                            { name: 'axisXLineWidth' },
                            { name: 'axisXTickLineColor' },
                            { name: 'axisXTickLineWidth' },
                            { name: 'axisXTickLineLength' },
                            { name: 'axisXTickNum' },
                            { name: 'axisXTickLabelDistance' },
                            { name: 'axisXTickLabelDig' },
                            { name: 'axisXTickLabelColor' },
                            { name: 'axisXTickLabelFontSize' },
                            { name: 'axisXTickLabelFontFamily' },
                        ],
                    },
                    {
                        name: 'axisY',
                        cmps: [
                            { name: 'axisYTitle' },
                            { name: 'axisYTitleColor' },
                            { name: 'axisYTitleFontSize' },
                            { name: 'axisYTitleFontFamily' },
                            { name: 'axisYTitleDistance' },
                            { name: 'axisYLineColor' },
                            { name: 'axisYLineWidth' },
                            { name: 'axisYTickLineColor' },
                            { name: 'axisYTickLineWidth' },
                            { name: 'axisYTickLineLength' },
                            { name: 'axisYTickNum' },
                            { name: 'axisYTickLabelDistance' },
                            { name: 'axisYTickLabelDig' },
                            { name: 'axisYTickLabelColor' },
                            { name: 'axisYTickLabelFontSize' },
                            { name: 'axisYTickLabelFontFamily' },
                        ],
                    },
                    {
                        name: 'axisZ',
                        cmps: [
                            { name: 'axisZTitle' },
                            { name: 'axisZTitleColor' },
                            { name: 'axisZTitleFontSize' },
                            { name: 'axisZTitleFontFamily' },
                            { name: 'axisZTitleDistance' },
                            { name: 'axisZLineColor' },
                            { name: 'axisZLineWidth' },
                            { name: 'axisZTickLineColor' },
                            { name: 'axisZTickLineWidth' },
                            { name: 'axisZTickLineLength' },
                            { name: 'axisZTickNum' },
                            { name: 'axisZTickLabelDistance' },
                            { name: 'axisZTickLabelDig' },
                            { name: 'axisZTickLabelColor' },
                            { name: 'axisZTickLabelFontSize' },
                            { name: 'axisZTickLabelFontFamily' },
                        ],
                    },
                ],
            },
            {
                name: 'mesh',
                cmps: [
                    { name: 'getMeshsInfor' },
                    { name: 'setMeshVisible' },
                    { name: 'setMeshColor' },
                    { name: 'setMeshLabelVisible' },
                    { name: 'setMeshLabelText' },
                    { name: 'setMeshLabelTextColor' },
                    { name: 'setMeshLabelTextFontSize' },
                    { name: 'setMeshLabelTextFontFamily' },
                ],
            },
            {
                name: 'menu',
                cmps: [
                    { name: 'menuIcons' },
                    { name: 'menuTooltips' },
                ],
            },
            {
                name: 'legend',
                cmps: [
                    { name: 'legnedBackgroundColor' },
                    { name: 'legnedHeight' },
                    { name: 'legnedHeightMax' },
                ],
            },
        ]
        return {

            cmpsL1: cmps,
            indP1: null,
            cmpP1: null,

            cmpsL2: null,
            indP2: null,
            cmpP2: null,

            cmpsL3: null,
            indP3: null,
            cmpP3: null,

            cmpsL4: null,

            cmpPick: '',

        }
    },
    mounted: function() {
        let vo = this

        //default
        vo.indP1 = 0
        vo.indP2 = 0
        vo.indP3 = 0

        //urlParse, http://localhost:8080/?cmp=w-set-multi
        let p = urlParse(location.href)
        // console.log('p', p)

        //viewPick
        vo.viewPick(get(p, 'cmp', ''))

    },
    computed: {

        changeMenus: function() {
            let vo = this
            vo.modifyMenus(vo.indP1, vo.indP2, vo.indP3)
            return ''
        },

        isNarrow: function() {
            return window.innerWidth < 1000
        },

    },
    methods: {

        modifyMenus: function() {
            let vo = this

            let cmpPick = ''

            setTimeout(() => {

                // console.log('call P1')
                vo.cmpP1 = get(vo.cmpsL1, vo.indP1, {})
                vo.cmpsL2 = get(vo.cmpP1, `cmps`, [])
                let _cmpPick = get(vo.cmpP1, `name`, '')
                if (_cmpPick) {
                    cmpPick = _cmpPick
                }
                // console.log('vo.cmpP1', cloneDeep(vo.cmpP1))
                // console.log('vo.cmpsL2', cloneDeep(vo.cmpsL2))

            }, 50)

            setTimeout(() => {

                // console.log('call P2')
                let cmps = get(vo.cmpP1, `cmps`, [])
                vo.cmpP2 = get(cmps, vo.indP2, {})
                vo.cmpsL3 = get(vo.cmpP2, `cmps`, [])
                let _cmpPick = get(vo.cmpP2, `name`, '')
                if (_cmpPick) {
                    cmpPick = _cmpPick
                }
                // console.log('vo.cmpP2', cloneDeep(vo.cmpP2))
                // console.log('vo.cmpsL3', cloneDeep(vo.cmpsL3))

            }, 100)

            setTimeout(() => {

                // console.log('call P3')
                let cmps = get(vo.cmpP2, `cmps`, [])
                vo.cmpP3 = get(cmps, vo.indP3, {})
                vo.cmpsL4 = get(vo.cmpP3, `cmps`, [])
                let _cmpPick = get(vo.cmpP3, `name`, '')
                if (_cmpPick) {
                    cmpPick = _cmpPick
                }
                // console.log('vo.cmpP3', cloneDeep(vo.cmpP3))
                // console.log('vo.cmpsL4', cloneDeep(vo.cmpsL4))

                //update
                vo.cmpPick = cmpPick
                // console.log('cmpPick', cmpPick)

            }, 150)

        },

        getInd: function(item, items) {
            // let vo = this
            let ind = -1
            each(items, (v, k) => {
                if (item.name === v.name) {
                    ind = k
                    return false //跳出
                }
            })
            return ind
        },

        viewPick: function(cmpPick) {
            let vo = this
            let _cmpPick = cmpPick
            let r = ''
            let rs = []
            let ls = []
            let pv = (ts) => {
                each(ts, (v, k) => {
                    ls.push(k)

                    //name, _name
                    let name = get(v, `name`, '')
                    let _name = name

                    //cmps
                    let cmps = get(v, `cmps`, [])

                    //push
                    let cls = ls.join('.')
                    let b = _name === _cmpPick
                    rs.push({
                        cls,
                        name,
                        b,
                    })

                    //save
                    if (b) {
                        r = JSON.parse(JSON.stringify(ls))
                    }

                    //遞迴pv
                    if (cmps.length > 0) {
                        pv(cmps)
                    }

                    ls.pop()
                })
            }
            pv(vo.cmpsL1)
            // console.log('rs', rs)
            // console.log('r', r)
            vo.indP1 = get(r, 0, 0)
            vo.indP2 = get(r, 1, 0)
            vo.indP3 = get(r, 2, 0)
        },

    },
}
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
