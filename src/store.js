const store = Vue.reactive({
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true',
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
    
    // 初始化检查：如果是 admin 登录状态，强制更新其头像路径以修复旧缓存
    init() {
        if (this.isLoggedIn && this.user && this.user.username === 'admin') {
            this.user.avatar = 'public/images/avatars/avatar-admin.svg';
            localStorage.setItem('user', JSON.stringify(this.user));
        }
    },
    
    // 全局弹窗控制
    showLoginModal: false,
    showUpgradeModal: false,
    showAgreementModal: false,
    agreementType: 'service', // 'service' 或 'privacy'

    // 当前处理的临时音频
    pendingAudio: null,

    // 方法：登录验证 (拦截弹窗逻辑)
    login(username, password) {
        // 硬编码管理员校验，管理员具备专业版 Pro 权限
        if (username === 'admin' && password === '710049') {
            const adminUser = {
                username: 'admin',
                email: 'admin@soundscore.ai',
                avatar: 'public/images/avatars/avatar-admin.svg',
                isPro: true // 专业版权限标识
            };
            this._setLoginState(adminUser);
            return true;
        }
        
        // 校验普通注册用户
        const localUsersStr = localStorage.getItem('users');
        if (localUsersStr) {
            const users = JSON.parse(localUsersStr);
            const foundUser = users.find(u => u.username === username && u.password === password);
            if (foundUser) {
                // 普通用户没有专业版权限
                const normalUser = {
                    ...foundUser,
                    isPro: false 
                };
                this._setLoginState(normalUser);
                return true;
            }
        }
        return false; // 账号密码错误
    },

    // 方法：注册用户 (纯前端模拟)
    register(userData) {
        const localUsersStr = localStorage.getItem('users');
        let users = localUsersStr ? JSON.parse(localUsersStr) : [];
        
        // 简单校验查重
        if (users.find(u => u.username === userData.username)) {
            return { success: false, message: '用户名已存在' };
        }
        
        // 存入新用户
        users.push(userData);
        localStorage.setItem('users', JSON.stringify(users));
        
        // 注册即登录
        const newUser = {
            ...userData,
            isPro: false // 新注册用户默认非专业版
        };
        this._setLoginState(newUser);
        return { success: true };
    },

    // 内部方法：设置登录状态
    _setLoginState(userData) {
        this.user = userData;
        this.isLoggedIn = true;
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
    },

    // 升级为 Pro 专业版
    upgradeToPro() {
        if (this.user) {
            this.user.isPro = true;
            localStorage.setItem('user', JSON.stringify(this.user));
            
            // 如果是普通注册用户，也更新本地用户列表里的数据
            const localUsersStr = localStorage.getItem('users');
            if (localUsersStr) {
                const users = JSON.parse(localUsersStr);
                const userIndex = users.findIndex(u => u.username === this.user.username);
                if (userIndex !== -1) {
                    users[userIndex].isPro = true;
                    localStorage.setItem('users', JSON.stringify(users));
                }
            }
        }
    },

    // 方法：退出登录
    logout() {
        // 双重弹窗逻辑：编辑界面下询问是否保存
        if (window.appInstance && window.appInstance.currentPage === 'workspace') {
            if (confirm("是否保存曲谱编辑进度？")) {
                console.log("编辑进度已保存");
                // 此处可执行相关保存逻辑
            }
        }
        
        // 全局退出确认弹窗
        if (confirm("确定要退出登录吗？")) {
            this.isLoggedIn = false;
            this.user = null;
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('user');
            
            // 全局路由拦截：回退到首页
            if (window.appInstance) {
                window.appInstance.currentPage = 'home';
            }
        }
    }
});