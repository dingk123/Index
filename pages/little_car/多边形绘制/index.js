
    var map = new AMap.Map('container', {
        resizeEnable: true, //是否监控地图容器尺寸变化
        zoom:11, //初始化地图层级
        center: [116.403322, 39.920255], //初始化地图中心点
    });


    var path = [
    [116.403322, 39.920255],
    [116.410703, 39.897555],
    [116.402292, 39.892353],
    [116.389846, 39.891365],
    ];

    var polygon = new AMap.Polygon({
    path: path,
    strokeColor: "#FF33FF",
    strokeWeight: 3,
    strokeOpacity: 0.2,
    fillOpacity: 0.1,
    fillColor: "#1791fc",
    zIndex: 50,
    });

    map.add(polygon);
    // 缩放地图到合适的视野级别
    map.setFitView([polygon]);

    var polyEditor = new AMap.PolyEditor(map, polygon);

    polyEditor.on("addnode", function (event) {
    log.info("触发事件：addnode");
    });

    polyEditor.on("adjust", function (event) {
    log.info("触发事件：adjust");
    });

    polyEditor.on("removenode", function (event) {
    log.info("触发事件：removenode");
    });

    polyEditor.on("end", function (event) {
    log.info("触发事件： end");
    // event.target 即为编辑后的多边形对象
    });

    // 增加椭圆显示
    var ellipse = new AMap.Ellipse({
    center: [116.4, 39.92],
    radius: [2000, 1000],
    });

    map.add(ellipse);
    // 缩放地图到合适的视野级别
    map.setFitView([ellipse]);
