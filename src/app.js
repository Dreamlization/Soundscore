const app = Vue.createApp({
    data() {
        return {
            currentPage: 'home',
            store,
            showEntryTip: false
        };
    },
    created() {
        // 执行 store 的初始化检查，修复可能损坏的缓存数据
        if (typeof this.store.init === 'function') {
            this.store.init();
        }
        try {
            if (!sessionStorage.getItem('soundscore_entry_tip_shown')) {
                sessionStorage.setItem('soundscore_entry_tip_shown', '1');
                this.showEntryTip = true;
            }
        } catch (e) {
            this.showEntryTip = true;
        }
    },
    methods: {
        handleRequireLogin(page) {
            this.currentPage = 'home';
            store.showLoginModal = true;
        },
        handleLoginSuccess() {
            if (store.pendingAudio) {
                this.currentPage = 'workspace';
            }
        },
        showAgreement(type) {
            store.agreementType = type;
            store.showAgreementModal = true;
        },
        closeEntryTip() {
            this.showEntryTip = false;
        }
    },
    mounted() {
        // 全局快捷键绑定示例 (例如：空格键播放/暂停)
        window.addEventListener('keydown', (e) => {
            if (this.currentPage === 'workspace' && e.code === 'Space') {
                e.preventDefault();
                // 由于目前组件通信简单处理，不直接在这里调 workspace 的方法
                // 实际项目中可借助 mitt 或 vuex/pinia 实现事件总线
            }
        });
    }
});

// 注册全局组件
app.component('app-header', AppHeader);
app.component('login-modal', LoginModal);
app.component('upgrade-modal', UpgradeModal);
app.component('agreement-modal', AgreementModal);

// 注册页面组件
app.component('page-home', Home);
app.component('page-workspace', Workspace);
app.component('page-projects', Projects);
app.component('page-profile', Profile);
app.component('page-about', About);

window.appInstance = app.mount('#app');
