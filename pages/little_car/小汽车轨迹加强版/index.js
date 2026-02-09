// 默认路线（来自小汽车轨迹）
// const DEFAULT_ROUTE = [
//     [103.867632,36.061201],
//     [103.867114,36.058954],
//     [103.865487,36.057903],
//     [103.864049,36.059125],
//     [103.863415,36.058031],
//     [103.859928,36.058962],
//     [103.858967,36.056727],
//     [103.857699,36.053652],
//     [103.856431,36.050063],
//     [103.854743,36.045194],
//     [103.853647,36.041705],
//     [103.852651,36.039054],
//     [103.85164,36.036235],
//     [103.853119,36.035926],
//     [103.853406,36.035959]
// ];

// const DEFAULT_ROUTE = [
//     [103.866402,36.063551],
//     [103.861787,36.064714],
//     [103.864873,36.073434],
//     [103.858011,36.074815],
//     [103.856153,36.072611],
//     [103.851748,36.071109],
//     [103.847882,36.068566],
//     [103.848272,36.062752],
//     [103.845725,36.06251],
//     [103.845545,36.06205],
//     [103.848662,36.061081],
//     [103.852198,36.059433],
//     [103.857322,36.058343],
//     [103.85906,36.057786],
//     [103.860978,36.062437],
//     [103.863585,36.062292],
//     [103.865023,36.062849],
//     [103.866342,36.063576]
// ]


const DEFAULT_ROUTE = [
    [103.866402, 36.063551]
    ,[103.861787, 36.064714]
    ,[103.864873, 36.073434]
    ,[103.858011, 36.074815]
    ,[103.856153, 36.072611]
    ,[103.851748, 36.071109]
    ,[103.847882, 36.068566]
    ,[103.848272, 36.062752]
    ,[103.850403, 36.062909]
    ,[103.851714, 36.063498]
    ,[103.853479, 36.063041]
    ,[103.856135, 36.062703]
    ,[103.858127, 36.062584]
    ,[103.859586, 36.062487]
    ,[103.860978, 36.062437]
    ,[103.863585, 36.062292]
    ,[103.865023, 36.062849]
    ,[103.866342, 36.063576]
]

// localStorage 键名
const ROUTES_STORAGE_KEY = 'amap_car_routes';
const CURRENT_ROUTE_KEY = 'amap_current_route';

// 全局变量
let map, marker, polyline, passedPolyline, polyEditor;
let currentRoute = [];
let currentRouteName = 'default';
let isAnimating = false;
let savedRoutes = {};

// 初始化地图
function initMap() {
    map = new AMap.Map("container", {
        resizeEnable: true,
        center: [103.867632, 36.061201],
        zoom: 17
    });

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
}

// 加载所有保存的路线
function loadAllRoutes() {
    try {
        const savedData = localStorage.getItem(ROUTES_STORAGE_KEY);
        const currentRouteData = localStorage.getItem(CURRENT_ROUTE_KEY);
        
        if (savedData) {
            savedRoutes = JSON.parse(savedData);
        } else {
            savedRoutes = {};
        }
        
        // 确保默认路线存在
        savedRoutes['default'] = [...DEFAULT_ROUTE];
        
        if (currentRouteData) {
            currentRouteName = currentRouteData;
        } else {
            currentRouteName = 'default';
        }
        
        // 加载当前路线
        if (savedRoutes[currentRouteName]) {
            currentRoute = [...savedRoutes[currentRouteName]];
        } else {
            currentRouteName = 'default';
            currentRoute = [...DEFAULT_ROUTE];
        }
        
        updateRouteDropdown();
        updateRouteStatus();
        updateRouteInfo();
        
        console.log('已加载所有路线:', savedRoutes);
        console.log('当前路线:', currentRouteName, currentRoute);
        
    } catch (error) {
        console.warn('加载路线失败，使用默认设置:', error);
        savedRoutes = { 'default': [...DEFAULT_ROUTE] };
        currentRouteName = 'default';
        currentRoute = [...DEFAULT_ROUTE];
        updateRouteDropdown();
        updateRouteStatus();
        updateRouteInfo();
    }
}

// 保存所有路线到localStorage
function saveAllRoutes() {
    try {
        localStorage.setItem(ROUTES_STORAGE_KEY, JSON.stringify(savedRoutes));
        localStorage.setItem(CURRENT_ROUTE_KEY, currentRouteName);
        console.log('所有路线已保存:', savedRoutes);
    } catch (error) {
        console.error('保存路线失败:', error);
    }
}

// 生成自动路线名称
function generateRouteName() {
    let counter = 1;
    let name = `custom${counter}`;
    
    while (savedRoutes[name]) {
        counter++;
        name = `custom${counter}`;
    }
    
    return name;
}

// 更新路线状态显示
function updateRouteStatus() {
    const statusEl = document.getElementById('routeStatus');
    if (statusEl) {
        const displayName = currentRouteName === 'default' ? '默认路线' : currentRouteName;
        statusEl.textContent = `当前使用: ${displayName}`;
    }
}

// 更新路线信息显示
function updateRouteInfo() {
    const infoEl = document.getElementById('routeInfo');
    if (infoEl) {
        infoEl.textContent = `路线点数: ${currentRoute.length}`;
    }
}

// 更新路线下拉菜单
function updateRouteDropdown() {
    const selectEl = document.getElementById('routeSelect');
    if (!selectEl) return;
    
    // 清空现有选项
    selectEl.innerHTML = '';
    
    // 添加默认路线
    const defaultOption = document.createElement('option');
    defaultOption.value = 'default';
    defaultOption.textContent = '默认路线';
    selectEl.appendChild(defaultOption);
    
    // 添加自定义路线
    for (const [name, route] of Object.entries(savedRoutes)) {
        if (name !== 'default') {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = `${name} (${route.length}点)`;
            selectEl.appendChild(option);
        }
    }
    
    // 设置当前选中的路线
    selectEl.value = currentRouteName;
}

// 创建标记点
function createMarker() {
    if (marker) {
        marker.setMap(null);
    }
    
    marker = new AMap.Marker({
        map: map,
        position: currentRoute[0],
        icon: "http://webapi.amap.com/images/car.png",
        offset: new AMap.Pixel(-26, -13),
        autoRotation: true,
        angle: -90,
    });

    marker.on('moving', function (e) {
        if (passedPolyline) {
            passedPolyline.setPath(e.passedPath);
        }
    });
}

// 创建路线
function createPolyline() {
    if (polyline) {
        polyline.setMap(null);
    }
    if (passedPolyline) {
        passedPolyline.setMap(null);
    }

    // 主路线
    polyline = new AMap.Polyline({
        map: map,
        path: currentRoute,
        showDir: true,
        strokeColor: "#28F",
        strokeWeight: 6,
        isOutline: true,
        outlineColor: '#ffeeff',
        borderWeight: 3,
        strokeStyle: "solid",
        lineJoin: 'round',
        lineCap: 'round',
        zIndex: 50,
    });

    // 已走过的路线
    passedPolyline = new AMap.Polyline({
        map: map,
        strokeColor: "#AF5",
        strokeWeight: 6,
    });

    // 创建编辑器
    // if (polyEditor) {
    //     polyEditor.setTarget(null);
    // }
    polyEditor = new AMap.PolyEditor(map, polyline);

    // 编辑器事件
    polyEditor.on('addnode', function(event) {
        console.log('添加节点');
    });

    polyEditor.on('adjust', function(event) {
        console.log('调整节点');
    });

    polyEditor.on('removenode', function(event) {
        console.log('删除节点');
    });

    polyEditor.on('end', function(event) {
        console.log('编辑结束');
        // 获取编辑后的路径
        const newPath = event.target.getPath();
        currentRoute = newPath.map(point => [point.lng, point.lat]);
        
        // 更新路线信息显示
        updateRouteInfo();
        
        // 如果编辑的是已保存的路线，自动保存修改
        if (currentRouteName !== 'default') {
            savedRoutes[currentRouteName] = [...currentRoute];
            saveAllRoutes();
        }
    });

    // 调整视野
    map.setFitView([polyline]);
}

// 重新渲染
function refreshRoute() {
    // 重新设置地图中心和视野
    if (currentRoute.length > 0) {
        createMarker();
        createPolyline();
        map.setCenter(currentRoute[0]);
        map.setFitView([polyline]);
    }
}

// 动画控制函数
function startAnimation() {
    if (isAnimating) {
        marker.stopMove();
    }
    
    if (currentRoute.length < 2) {
        alert('路线点数太少，无法开始动画');
        return;
    }
    
    marker.moveAlong(currentRoute, 200);
    isAnimating = true;
}

function pauseAnimation() {
    if (marker && isAnimating) {
        marker.pauseMove();
    }
}

function resumeAnimation() {
    if (marker && isAnimating) {
        marker.resumeMove();
    }
}

function stopAnimation() {
    if (marker) {
        marker.stopMove();
        isAnimating = false;
        // 重置标记到起点
        if (currentRoute.length > 0) {
            marker.setPosition(currentRoute[0]);
        }
        // 清空已走过的路线
        if (passedPolyline) {
            passedPolyline.setPath([]);
        }
    }
}

// 使用默认路线
function useDefaultRoute() {
    stopAnimation();
    currentRouteName = 'default';
    currentRoute = [...DEFAULT_ROUTE];
    refreshRoute();
    updateRouteStatus();
    updateRouteInfo();
    updateRouteDropdown();
    saveAllRoutes();
}

// 保存当前路线
function saveRoute() {
    if (currentRoute.length === 0) {
        alert('当前没有路线可保存');
        return;
    }
    
    // 弹窗获取路线名称
    let routeName = prompt('请输入路线名称（留空则自动生成）:', '');
    
    // 如果用户点击了取消
    if (routeName === null) {
        return;
    }
    
    // 如果没有输入名称，自动生成
    if (routeName.trim() === '') {
        routeName = generateRouteName();
    } else {
        routeName = routeName.trim();
        // 检查是否与现有路线重名
        if (savedRoutes[routeName]) {
            const overwrite = confirm(`路线"${routeName}"已存在，是否覆盖？`);
            if (!overwrite) {
                return;
            }
        }
    }
    
    // 防止覆盖默认路线
    if (routeName === 'default') {
        alert('不能使用"default"作为路线名称');
        return;
    }
    
    // 保存路线
    savedRoutes[routeName] = [...currentRoute];
    currentRouteName = routeName;
    
    saveAllRoutes();
    updateRouteStatus();
    updateRouteInfo();
    updateRouteDropdown();
    
    alert(`路线"${routeName}"已保存`);
}

// 加载选中的路线
function loadSelectedRoute() {
    const selectEl = document.getElementById('routeSelect');
    if (!selectEl) return;
    
    const selectedName = selectEl.value;
    if (savedRoutes[selectedName]) {
        stopAnimation();
        currentRouteName = selectedName;
        currentRoute = [...savedRoutes[selectedName]];
        
        refreshRoute();
        updateRouteStatus();
        updateRouteInfo();
        saveAllRoutes();
    }
}

// 删除当前路线
function deleteCurrentRoute() {
    if (currentRouteName === 'default') {
        alert('不能删除默认路线');
        return;
    }
    
    const confirm_delete = confirm(`确定要删除路线"${currentRouteName}"吗？`);
    if (confirm_delete) {
        delete savedRoutes[currentRouteName];
        
        // 切换到默认路线
        useDefaultRoute();
        
        alert(`路线"${currentRouteName}"已删除`);
    }
}

// 清空所有自定义路线
function clearAllRoutes() {
    const confirm_clear = confirm('确定要清除所有自定义路线吗？（默认路线不会被删除）');
    if (confirm_clear) {
        // 只保留默认路线
        savedRoutes = { 'default': [...DEFAULT_ROUTE] };
        
        useDefaultRoute();
        
        alert('所有自定义路线已清除');
    }
}

// 初始化
function init() {
    initMap();
    loadAllRoutes();
    refreshRoute();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);