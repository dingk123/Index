
    //创建地图
    var map = new AMap.Map('container');

    AMapUI.loadUI(['control/BasicControl'], function(BasicControl) {

        //添加一个缩放控件
        map.addControl(new BasicControl.Zoom({
            position: 'lt'
        }));

        //缩放控件，显示Zoom值
        map.addControl(new BasicControl.Zoom({
            position: 'lb',
            showZoomNum: true
        }));

        //图层切换控件
        map.addControl(new BasicControl.LayerSwitcher({
            position: 'rt'
        }));
    });
    