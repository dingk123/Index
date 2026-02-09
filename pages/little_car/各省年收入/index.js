
    var map = new AMap.Map('container', {
        mapStyle: 'amap://styles/284e1eba390dfdcaddab6bf7bc6407db',
        zoom: 5,
        pitch: 0,
        features: ['bg', 'road'],
        center: [104.090834, 31.270677],
        viewMode: '3D'
    });

    var layer = new Loca.LabelsLayer({
        fitView: true,
        map: map,
    });

    AMap.plugin('AMap.DistrictSearch', function () {
        var districtSearch = new AMap.DistrictSearch({
            // 关键字对应的行政区级别，country表示国家
            level: 'country',
            //  显示下级行政区级数，1表示返回下一级行政区
            subdistrict: 1
        });

        // 搜索所有省/直辖市信息
        districtSearch.search('中国', function (status, result) {
            // 查询成功时，result即为对应的行政区信息
            getCenter(result);
        });
    });

    // 获取行政区中心位置
    function getCenter(result) {
        var districtList = result.districtList[0].districtList;;
        var dist = {};

        for (var i = 0, len = districtList.length; i < len; i++) {
            dist[districtList[i].name] = [districtList[i].center.lng, districtList[i].center.lat];
        }

        $.get('//a.amap.com/Loca/static/mock/year_income.csv', function (datas) {
            layer.setData(datas, {
                type: 'csv',
                lnglat: function (o) {
                    return dist[o.value['地区']]
                }
            }).setOptions({
                style: {
                    direction: 'center',
                    offset: [0, 0],
                    text: function (data) {
                        return '￥' + parseInt(data.value['2018年'])
                    },
                    fillColor: function (data) {
                        var income = +data.value['2018年'];
                        return income < 20000 ? '#0C6DB0' :
                            income < 50000 ? '#2DABBA' : '#82CF9C';
                    },
                    fontSize: function (data) {
                        var income = +data.value['2018年'];
                        return income < 20000 ? 12 :
                            income < 30000 ? 16 :
                                income < 40000 ? 20 :
                                    income < 50000 ? 24 :
                                        income < 60000 ? 28 : 32;
                    },
                    strokeColor: '#000',
                    strokeWidth: 0,
                    opacity: 1,
                },
                selectStyle: {
                    fontSize: function (data) {
                        var income = +data.value['2018年'];
                        return income < 20000 ? 12 :
                            income < 30000 ? 16 :
                                income < 40000 ? 20 :
                                    income < 50000 ? 24 :
                                        income < 60000 ? 28 : 32;
                    },
                    strokeColor: '#000',
                    strokeWidth: 1,
                }
            }).render();
        });
    }
