class CubeTakeOutGame {
    constructor() {
        this.sourceData = [];
        this.targetData = [];
        this.sourceChart = null;
        this.targetChart = null;
        this.cubeCounter = 1;
        this.takeOutHistory = [];
        this.nextTargetIndex = 0;
        this.pixelRatio = window.devicePixelRatio || 1;
        this.chartInitialized = false;
        this.init();
    }

    init() {
        this.initializeSourceData();
        this.initializeTargetData();
        this.initCharts();
        this.updateCounters();
    }

    initializeSourceData() {
        this.sourceData = [];
        let cubeId = 1;
        
        for (let z = 0; z < 3; z++) {
            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    this.sourceData.push({
                        x: x,
                        y: y,
                        z: z,
                        id: cubeId++,
                        color: null,
                        exists: true
                    });
                }
            }
        }
    }

    initializeTargetData() {
        this.targetData = [];
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 3; y++) {
                this.targetData.push({
                    x: x,
                    y: y,
                    z: 0,
                    id: null,
                    color: null,
                    exists: false
                });
            }
        }
    }

    initCharts() {
        const sourceChartDom = document.getElementById('source-chart');
        const targetChartDom = document.getElementById('target-chart');
        
        // 使用设备像素比初始化图表
        this.sourceChart = echarts.init(sourceChartDom, null, {
            devicePixelRatio: this.pixelRatio,
            width: sourceChartDom.offsetWidth,
            height: sourceChartDom.offsetHeight
        });
        
        this.targetChart = echarts.init(targetChartDom, null, {
            devicePixelRatio: this.pixelRatio,
            width: targetChartDom.offsetWidth,
            height: targetChartDom.offsetHeight
        });
        
        this.updateSourceChart();
        this.updateTargetChart();
        
        // 添加resize监听
        this.setupResizeListener();
        
        // 桌面端点击事件
        this.sourceChart.on('click', (params) => {
            if (params.seriesName.startsWith('level') && params.data.itemStyle.opacity > 0) {
                this.takeOutCube(params.data.x, params.data.y, params.data.z);
            }
        });
        
        this.chartInitialized = true;
    }

    setupResizeListener() {
        window.addEventListener('resize', () => {
            if (this.chartInitialized) {
                setTimeout(() => {
                    this.sourceChart.resize();
                    this.targetChart.resize();
                }, 300);
            }
        });
        
        // 监听设备方向变化
        window.addEventListener('orientationchange', () => {
            if (this.chartInitialized) {
                setTimeout(() => {
                    this.sourceChart.resize();
                    this.targetChart.resize();
                }, 500);
            }
        });
    }

    generateSourceChartData() {
        const stackSeries = [];
        
        for (let level = 0; level < 3; level++) {
            const levelData = [];
            
            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    const cube = this.sourceData.find(c => 
                        c.x === x && c.y === y && c.z === level && c.exists
                    );
                    
                    if (cube) {
                        // 根据层级设置颜色：底层(0)=橘色，中层(1)=蓝色，顶层(2)=绿色
                        let layerColor;
                        if (level === 0) {
                            layerColor = '#FF8C00'; // 橘色 - 底层
                        } else if (level === 1) {
                            layerColor = '#4169E1'; // 蓝色 - 中层
                        } else {
                            layerColor = '#32CD32'; // 绿色 - 顶层
                        }
                        
                        levelData.push({
                            value: [x, y, 1],
                            x: x, y: y, z: level,
                            itemStyle: {
                                color: layerColor,
                                opacity: 0.9,
                                borderColor: '#333',
                                borderWidth: 2
                            },
                            label: {
                                show: true,
                                formatter: cube.id.toString(),
                                color: 'white',
                                fontWeight: 'bold'
                            }
                        });
                    } else {
                        // 不存在的立方体，创建完全透明的占位符
                        levelData.push({
                            value: [x, y, 0],
                            x: x, y: y, z: level,
                            itemStyle: {
                                opacity: 0,
                                color: 'transparent'
                            }
                        });
                    }
                }
            }
            
            stackSeries.push({
                type: 'bar3D',
                name: 'level' + level,
                data: levelData,
                stack: 'cube',
                barSize: [20, 20, 1],
                shading: 'lambert'
            });
        }
        
        return stackSeries;
    }

    generateTargetChartData() {
        const targetSeries = [];
        
        const baseData = [];
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 3; y++) {
                baseData.push([x, y, 0.05]);
            }
        }
        
        targetSeries.push({
            type: 'bar3D',
            name: 'targetBase',
            data: baseData,
            barSize: [12, 12, 0.2], 
            itemStyle: {
                color: 'rgba(200, 200, 200, 0.3)',
                opacity: 1,
                borderColor: '#666',
                borderWidth: 1
            },
            shading: 'color'
        });

        const placedData = [];
        this.targetData.forEach(cube => {
            if (cube.exists) {
                placedData.push({
                    value: [cube.x, cube.y, 1],
                    itemStyle: {
                        color: cube.color,
                        opacity: 1.0,
                        borderColor: '#333',
                        borderWidth: 2
                    },
                    label: {
                        show: true,
                        formatter: cube.id.toString(),
                        color: 'white',
                        fontWeight: 'bold'
                    }
                });
            } else {
                placedData.push({
                    value: [cube.x, cube.y, 0],
                    itemStyle: {
                        opacity: 0
                    }
                });
            }
        });

        targetSeries.push({
            type: 'bar3D',
            name: 'placedCubes',
            data: placedData,
            stack: 'target',
            barSize: [12, 12, 0.2],
            shading: 'color',
            silent: true
        });

        return targetSeries;
    }

    updateSourceChart() {
        const stackSeries = this.generateSourceChartData();

        const option = {
            tooltip: {
                formatter: (params) => {
                    if (params.data.itemStyle.opacity > 0) {
                        return '立方体 #' + (params.label || '?') + '<br/>位置: (' + params.data.x + ', ' + params.data.y + ', ' + params.data.z + ')<br/>点击取出';
                    }
                    return '';
                }
            },
            xAxis3D: {
                type: 'category',
                data: ['0', '1', '2'],
                show: false
            },
            yAxis3D: {
                type: 'category', 
                data: ['0', '1', '2'],
                show: false
            },
            zAxis3D: {
                type: 'value',
                min: 0,
                max: 3.5,
                show: false
            },
            grid3D: {
                boxWidth: 80,
                boxHeight: 80,
                boxDepth: 80,
                show: false,
                viewControl: {
                    alpha: 25,
                    beta: 30,
                    rotateSensitivity: 1,
                    zoomSensitivity: 1,
                    panSensitivity: 1,
                    autoRotate: false,
                    distance: 150,
                    damping: 0.8,
                    minDistance: 50,
                    maxDistance: 300
                }
            },
            series: stackSeries
        };

        this.sourceChart.setOption(option, true);
        
        // 确保图表正确渲染
        if (this.chartInitialized) {
            this.sourceChart.resize();
            setTimeout(() => {
                this.sourceChart.resize();
            }, 100);
        }
    }

    updateTargetChart() {
        const targetSeries = this.generateTargetChartData();

        const option = {
            tooltip: {
                formatter: (params) => {
                    if (params.seriesName === 'placedCubes' && params.data.itemStyle.opacity > 0) {
                        return '立方体 #' + params.label + '<br/>存储位置: (' + params.data[0] + ', ' + params.data[1] + ')';
                    }
                    return '存储位置: (' + params.data[0] + ', ' + params.data[1] + ')<br/>状态: 空闲';
                }
            },
            xAxis3D: {
                type: 'category',
                data: Array.from({length: 10}, (_, i) => i.toString()),
                show: false
            },
            yAxis3D: {
                type: 'category', 
                data: ['0', '1', '2'],
                show: false
            },
            zAxis3D: {
                type: 'value',
                min: 0,
                max: 3,
                show: false
            },
            grid3D: {
                boxWidth: 200,
                boxHeight: 60,
                boxDepth: 60,
                show: false,
                viewControl: {
                    alpha: 25,
                    beta: 15,
                    rotateSensitivity: 1,
                    zoomSensitivity: 1,
                    panSensitivity: 1,
                    autoRotate: false
                }
            },
            series: targetSeries
        };

        this.targetChart.setOption(option, true);
    }

    takeOutCube(x, y, z) {
        const cubeIndex = this.sourceData.findIndex(c => 
            c.x === x && c.y === y && c.z === z && c.exists
        );
        
        if (cubeIndex === -1) return;
        
        const cube = this.sourceData[cubeIndex];
        
        const hasBlockingCube = this.sourceData.some(c => 
            c.x === x && c.y === y && c.z > z && c.exists
        );
        
        if (hasBlockingCube) {
            alert('🚫 上方还有立方体，请先取出上层的立方体！');
            return;
        }

        cube.exists = false;
        
        if (this.nextTargetIndex < 30) {
            const targetX = this.nextTargetIndex % 9;
            const targetY = Math.floor(this.nextTargetIndex / 9);
            
            // 根据原始层级确定颜色，保持与左侧一致
            let preservedColor;
            if (z === 0) {
                preservedColor = '#FF8C00'; // 橘色 - 底层
            } else if (z === 1) {
                preservedColor = '#4169E1'; // 蓝色 - 中层
            } else {
                preservedColor = '#32CD32'; // 绿色 - 顶层
            }
            
            const targetCube = this.targetData.find(c => c.x === targetX && c.y === targetY);
            targetCube.id = cube.id;
            targetCube.color = preservedColor;
            targetCube.exists = true;
            
            this.takeOutHistory.push({
                sourceIndex: cubeIndex,
                targetIndex: this.nextTargetIndex,
                cubeData: { ...cube }
            });
            
            this.nextTargetIndex++;
        }

        setTimeout(() => {
            this.updateSourceChart();
            this.updateTargetChart();
            this.updateCounters();
            this.checkGameComplete();
        }, 50);
    }

    undoLastMove() {
        if (this.takeOutHistory.length === 0) {
            alert('🚫 没有可撤销的操作！');
            return;
        }

        const lastMove = this.takeOutHistory.pop();
        
        this.sourceData[lastMove.sourceIndex].exists = true;
        
        const targetX = lastMove.targetIndex % 10;
        const targetY = Math.floor(lastMove.targetIndex / 10);
        const targetCube = this.targetData.find(c => c.x === targetX && c.y === targetY);
        targetCube.id = null;
        targetCube.color = null;
        targetCube.exists = false;
        
        this.nextTargetIndex--;
        
        setTimeout(() => {
            this.updateSourceChart();
            this.updateTargetChart();
            this.updateCounters();
        }, 50);
    }

    updateCounters() {
        const remainingCubes = this.sourceData.filter(c => c.exists).length;
        const placedCubes = this.targetData.filter(c => c.exists).length;
        
        document.getElementById('source-count').textContent = remainingCubes;
        document.getElementById('target-count').textContent = placedCubes;
        
        const progress = ((27 - remainingCubes) / 27) * 100;
        const progressBar = document.getElementById('progress-bar');
        progressBar.style.width = progress + '%';
        progressBar.textContent = Math.round(progress) + '%';
    }

    checkGameComplete() {
        const remainingCubes = this.sourceData.filter(c => c.exists).length;
        if (remainingCubes === 0) {
            setTimeout(() => {
                alert('🎉 恭喜！你成功取出了所有立方体！\n你是真正的拆解大师！');
            }, 500);
        }
    }

    reset() {
        this.takeOutHistory = [];
        this.nextTargetIndex = 0;
        this.initializeSourceData();
        this.initializeTargetData();
        this.updateSourceChart();
        this.updateTargetChart();
        this.updateCounters();
    }
}

let game;

function initGame() {
    game = new CubeTakeOutGame();
}

function resetGame() {
    if (confirm('🤔 确定要重新开始游戏吗？\n当前进度将会丢失！')) {
        game.reset();
    }
}

function undoLastMove() {
    game.undoLastMove();
}

window.addEventListener('DOMContentLoaded', initGame);