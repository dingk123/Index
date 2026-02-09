// 侧边栏导航配置
const NAVIGATION_CONFIG = [
    { name: '基础控件', path: '../little_car/index.html', folder: '' },
    { name: '初始化+缩放控件', path: '../little_car/初始化+缩放控件/index.html', folder: '初始化+缩放控件' },
    { name: '各省年收入', path: '../little_car/各省年收入/index.html', folder: '各省年收入' },
    { name: '缩放+图层控件', path: '../little_car/缩放+图层控件/index.html', folder: '缩放+图层控件' },
    { name: '多边形绘制', path: '../little_car/多边形绘制/index.html', folder: '多边形绘制' },
    { name: '拖拽选址', path: '../little_car/拖拽选址/index.html', folder: '拖拽选址' },
    { name: '小汽车轨迹', path: '../little_car/小汽车轨迹/index.html', folder: '小汽车轨迹' },
    { name: '小汽车轨迹加强版', path: '../little_car/小汽车轨迹加强版/index.html', folder: '小汽车轨迹加强版' }
];

// 获取当前页面路径
function getCurrentPath() {
    const path = window.location.pathname;
    const segments = path.split('/');
    return segments[segments.length - 2] || '';
}

// 创建侧边栏HTML
function createSidebar() {
    const currentFolder = getCurrentPath();
    
    const sidebarHTML = `
        <div class="sidebar-overlay" id="sidebarOverlay"></div>
        <button class="sidebar-toggle" id="sidebarToggle">☰ 菜单</button>
        <div class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <h3 class="sidebar-title">Amap JSAPI UI 示例</h3>
            </div>
            <ul class="sidebar-nav">
                ${NAVIGATION_CONFIG.map(item => `
                    <li>
                        <a href="${item.path}" ${item.folder === currentFolder ? 'class="active"' : ''}>
                            ${item.name}
                        </a>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
    
    return sidebarHTML;
}

// 初始化侧边栏
function initSidebar() {
    // 添加CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = '../sidebar.css';
    document.head.appendChild(cssLink);
    
    // 添加HTML
    document.body.insertAdjacentHTML('afterbegin', createSidebar());
    
    // 绑定事件
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const body = document.body;
    
    function toggleSidebar() {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
        
        if (window.innerWidth <= 768) {
            if (sidebar.classList.contains('open')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        } else {
            body.classList.toggle('sidebar-active', sidebar.classList.contains('open'));
        }
    }
    
    toggle.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
    
    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            toggleSidebar();
        }
    });
    
    // 窗口大小改变时调整
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            overlay.classList.remove('active');
            body.style.overflow = '';
            if (sidebar.classList.contains('open')) {
                body.classList.add('sidebar-active');
            }
        } else {
            body.classList.remove('sidebar-active');
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initSidebar);