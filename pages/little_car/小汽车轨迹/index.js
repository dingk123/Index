
    // var marker, lineArr = [
    //     [116.478935,39.997761],
    //     [116.478939,39.997825],[116.478912,39.998549],
    //     [116.478912,39.998549],[116.478998,39.998555],
    //     [116.478998,39.998555],[116.479282,39.99856],
    //     [116.479658,39.998528],[116.480151,39.998453],
    //     [116.480784,39.998302],[116.480784,39.998302],
    //     [116.481149,39.998184],[116.481573,39.997997],
    //     [116.481863,39.997846],[116.482072,39.997718],
    //     [116.482362,39.997718],[116.483633,39.998935],
    //     [116.48367,39.998968],[116.484648,39.999861]];
    var marker, lineArr = [
        [103.867632,36.061201],
        [103.867114,36.058954],
        [103.865487,36.057903],
        [103.864049,36.059125],
        [103.863415,36.058031],
        [103.859928,36.058962],
        [103.858967,36.056727],
        [103.857699,36.053652],
        [103.856431,36.050063],
        [103.854743,36.045194],
        [103.853647,36.041705],
        [103.852651,36.039054],
        [103.85164,36.036235],
        [103.853119,36.035926],
        [103.853406,36.035959]
    ];


    var map = new AMap.Map("container", {
        resizeEnable: true,
        // center: [116.397428, 39.90923],
        center: [103.867632,36.061201],
        zoom: 17
    });

    marker = new AMap.Marker({
        map: map,
        position: [103.867632,36.061201],
        icon: "http://webapi.amap.com/images/car.png",
        offset: new AMap.Pixel(-26, -13),
        autoRotation: true,
        angle:-90,
    });

    // 绘制轨迹
    var polyline = new AMap.Polyline({
        map: map,
        path: lineArr,
        showDir:true,
        strokeColor: "#28F",  //线颜色
        // strokeOpacity: 1,     //线透明度
        strokeWeight: 6,      //线宽
        // strokeStyle: "solid"  //线样式
    });

    var passedPolyline = new AMap.Polyline({
        map: map,
        // path: lineArr,
        strokeColor: "#AF5",  //线颜色
        // strokeOpacity: 1,     //线透明度
        strokeWeight: 6,      //线宽
        // strokeStyle: "solid"  //线样式
    });


    marker.on('moving', function (e) {
        passedPolyline.setPath(e.passedPath);
    });

    map.setFitView();

    function startAnimation () {
        marker.moveAlong(lineArr, 200);
    }

    function pauseAnimation () {
        marker.pauseMove();
    }

    function resumeAnimation () {
        marker.resumeMove();
    }

    function stopAnimation () {
        marker.stopMove();
    }
