const Profile = {
    template: `
        <div class="flex-grow flex flex-col py-10 px-4 md:px-8 max-w-7xl mx-auto w-full relative z-10">
            <!-- 头部背景装饰 -->
            <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-[300px] bg-brand rounded-full mix-blend-screen filter blur-[150px] opacity-[0.05] pointer-events-none"></div>

            <div class="flex items-center justify-between mb-8 relative z-10">
                <h1 class="text-3xl font-bold">个人中心</h1>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                <!-- 左侧：用户信息与会员状态 -->
                <div class="space-y-6">
                    <!-- 用户基本信息 -->
                    <div class="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg relative overflow-hidden">
                        <div v-if="store.user?.isPro" class="absolute top-0 right-0 w-24 h-24 bg-brand rounded-full filter blur-[40px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
                        
                        <div class="flex items-center mb-6">
                            <div class="w-20 h-20 bg-dark border-2 rounded-full overflow-hidden mr-4 shadow-lg" :class="store.user?.isPro ? 'border-brand shadow-[0_0_15px_rgba(255,42,109,0.3)]' : 'border-gray-600'">
                                <img :src="store.user?.avatar || 'public/images/avatars/avatar-user.svg'" alt="User Avatar" class="w-full h-full object-cover">
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold">{{ store.user?.username || '未登录' }}</h2>
                                <p class="text-sm text-gray-400 mt-1">{{ store.user?.email || '未绑定邮箱' }}</p>
                            </div>
                        </div>
                        
                        <div class="pt-4 border-t border-dark-border">
                            <button @click="handleLogout" class="w-full py-2 rounded-lg border border-dark-border hover:bg-dark hover:border-gray-500 text-gray-300 transition text-sm font-bold">
                                退出登录
                            </button>
                        </div>
                    </div>

                    <!-- 个人简介 (新增，撑起高度) -->
                    <div class="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg relative overflow-hidden flex flex-col h-[144px]">
                        <h3 class="text-lg font-bold mb-4">个人简介</h3>
                        <p class="text-sm text-gray-400 leading-relaxed overflow-y-auto pr-2 custom-scrollbar">
                            {{ store.user?.bio || '这家伙很懒，什么都没留下。' }}
                        </p>
                    </div>

                    <!-- 会员状态 -->
                    <div class="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg relative overflow-hidden">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-bold">订阅计划</h3>
                            <span v-if="store.user?.isPro" class="bg-brand/20 text-brand px-3 py-1 rounded-full text-xs border border-brand/50 font-bold"><i class="fa-solid fa-crown mr-1"></i> 专业版 Pro</span>
                            <span v-else class="bg-dark px-3 py-1 rounded-full text-xs border border-dark-border text-gray-400">基础版</span>
                        </div>
                        
                        <div class="mb-6">
                            <div class="text-sm text-gray-400 mb-2 flex justify-between">
                                <span>本月处理额度</span>
                                <span v-if="store.user?.isPro" class="text-brand font-bold">无限</span>
                                <span v-else>0 / 10 次</span>
                            </div>
                            <div class="w-full bg-dark rounded-full h-2 overflow-hidden border border-dark-border">
                                <div v-if="store.user?.isPro" class="bg-brand h-2 rounded-full w-full profile-pro-gradient"></div>
                                <div v-else class="bg-gray-500 h-2 rounded-full" style="width: 0%"></div>
                            </div>
                        </div>
                        
                        <button v-if="!store.user?.isPro" @click="store.showUpgradeModal = true" class="w-full py-3 rounded-lg bg-brand hover:bg-[#FF4B82] text-white transition text-sm font-bold shadow-lg flex items-center justify-center">
                            <i class="fa-solid fa-crown mr-2"></i> 升级专业版
                        </button>
                        <div v-else class="text-center text-xs text-brand font-bold mt-2">
                            尊贵的 Pro 用户，您已解锁所有功能。
                        </div>
                    </div>
                </div>

                <!-- 右侧：统计与设置 -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- 数据统计 -->
                    <div class="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg">
                        <h3 class="text-lg font-bold mb-6">创作数据</h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="bg-dark border border-dark-border rounded-xl p-4 text-center relative overflow-hidden group">
                                <div class="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition"></div>
                                <div class="text-gray-400 text-sm mb-1 relative z-10">总项目数</div>
                                <div class="text-2xl font-bold text-white relative z-10">{{ store.user?.isPro ? '128' : '0' }}</div>
                            </div>
                            <div class="bg-dark border border-dark-border rounded-xl p-4 text-center relative overflow-hidden group">
                                <div class="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition"></div>
                                <div class="text-gray-400 text-sm mb-1 relative z-10">分离音轨</div>
                                <div class="text-2xl font-bold text-brand relative z-10">{{ store.user?.isPro ? '640' : '0' }}</div>
                            </div>
                            <div class="bg-dark border border-dark-border rounded-xl p-4 text-center relative overflow-hidden group">
                                <div class="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition"></div>
                                <div class="text-gray-400 text-sm mb-1 relative z-10">导出乐谱</div>
                                <div class="text-2xl font-bold text-white relative z-10">{{ store.user?.isPro ? '85' : '0' }}</div>
                            </div>
                            <div class="bg-dark border border-dark-border rounded-xl p-4 text-center relative overflow-hidden group">
                                <div class="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition"></div>
                                <div class="text-gray-400 text-sm mb-1 relative z-10">使用时长</div>
                                <div class="text-2xl font-bold text-white relative z-10">{{ store.user?.isPro ? '1024h' : '0h' }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- 账号设置 -->
                    <div class="bg-dark-card border border-dark-border rounded-2xl p-6 shadow-lg">
                        <h3 class="text-lg font-bold mb-6">账号设置</h3>
                        
                        <div class="space-y-4">
                            <div @click="showPasswordModal = true" class="flex items-center justify-between p-4 bg-dark border border-dark-border rounded-xl hover:border-gray-600 transition cursor-pointer group">
                                <div>
                                    <h4 class="font-bold text-white text-sm group-hover:text-brand transition">修改密码</h4>
                                    <p class="text-xs text-gray-500 mt-1">定期修改密码有助于保护账号安全</p>
                                </div>
                                <i class="fa-solid fa-chevron-right text-gray-500 group-hover:text-brand transition"></i>
                            </div>
                            
                            <div @click="showNotificationModal = true" class="flex items-center justify-between p-4 bg-dark border border-dark-border rounded-xl hover:border-gray-600 transition cursor-pointer group">
                                <div>
                                    <h4 class="font-bold text-white text-sm group-hover:text-brand transition">通知设置</h4>
                                    <p class="text-xs text-gray-500 mt-1">管理邮件与站内信通知</p>
                                </div>
                                <i class="fa-solid fa-chevron-right text-gray-500 group-hover:text-brand transition"></i>
                            </div>

                            <div @click="showPreferenceModal = true" class="flex items-center justify-between p-4 bg-dark border border-dark-border rounded-xl hover:border-gray-600 transition cursor-pointer group">
                                <div>
                                    <h4 class="font-bold text-white text-sm group-hover:text-brand transition">偏好设置</h4>
                                    <p class="text-xs text-gray-500 mt-1">编辑器默认主题、快捷键等</p>
                                </div>
                                <i class="fa-solid fa-chevron-right text-gray-500 group-hover:text-brand transition"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 修改密码弹窗 -->
            <transition name="fade">
                <div v-if="showPasswordModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="showPasswordModal = false">
                    <div class="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                        <button @click="showPasswordModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-white"><i class="fa-solid fa-times"></i></button>
                        <h3 class="text-xl font-bold mb-6 text-white"><i class="fa-solid fa-lock mr-2 text-brand"></i>修改密码</h3>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-bold text-gray-400 mb-2">当前密码</label>
                                <input type="password" v-model="passwordForm.old" class="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand transition" placeholder="请输入当前密码">
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-gray-400 mb-2">新密码</label>
                                <input type="password" v-model="passwordForm.new" class="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand transition" placeholder="设置新密码 (不少于8位)">
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-gray-400 mb-2">确认新密码</label>
                                <input type="password" v-model="passwordForm.confirm" class="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand transition" placeholder="请再次输入新密码">
                            </div>
                            <p v-if="passwordError" class="text-red-500 text-sm mt-2">{{ passwordError }}</p>
                        </div>
                        
                        <div class="mt-8 flex justify-end space-x-4">
                            <button @click="showPasswordModal = false" class="px-5 py-2 rounded-lg border border-dark-border text-gray-300 hover:bg-dark transition font-bold text-sm">取消</button>
                            <button @click="handleSavePassword" class="px-5 py-2 rounded-lg bg-brand text-white hover:bg-[#FF4B82] transition font-bold text-sm shadow-[0_0_15px_rgba(255,42,109,0.3)]">确认修改</button>
                        </div>
                    </div>
                </div>
            </transition>

            <!-- 通知设置弹窗 -->
            <transition name="fade">
                <div v-if="showNotificationModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="showNotificationModal = false">
                    <div class="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                        <button @click="showNotificationModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-white"><i class="fa-solid fa-times"></i></button>
                        <h3 class="text-xl font-bold mb-6 text-white"><i class="fa-solid fa-bell mr-2 text-brand"></i>通知设置</h3>
                        
                        <div class="space-y-4">
                            <div class="flex items-center justify-between p-4 bg-dark border border-dark-border rounded-xl">
                                <div>
                                    <h4 class="font-bold text-white text-sm">系统更新</h4>
                                    <p class="text-xs text-gray-500 mt-1">接收版本更新和新功能上线的通知</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" v-model="notifySettings.system" class="sr-only peer">
                                    <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                                </label>
                            </div>
                            <div class="flex items-center justify-between p-4 bg-dark border border-dark-border rounded-xl">
                                <div>
                                    <h4 class="font-bold text-white text-sm">分离完成提醒</h4>
                                    <p class="text-xs text-gray-500 mt-1">当 AI 处理完大型音频任务后发送通知</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" v-model="notifySettings.task" class="sr-only peer">
                                    <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                                </label>
                            </div>
                            <div class="flex items-center justify-between p-4 bg-dark border border-dark-border rounded-xl">
                                <div>
                                    <h4 class="font-bold text-white text-sm">营销与活动邮件</h4>
                                    <p class="text-xs text-gray-500 mt-1">接收打折促销或会员活动信息</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" v-model="notifySettings.marketing" class="sr-only peer">
                                    <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
                                </label>
                            </div>
                        </div>
                        
                        <div class="mt-8 flex justify-end space-x-4">
                            <button @click="showNotificationModal = false" class="px-5 py-2 rounded-lg bg-brand text-white hover:bg-[#FF4B82] transition font-bold text-sm shadow-[0_0_15px_rgba(255,42,109,0.3)]">保存设置</button>
                        </div>
                    </div>
                </div>
            </transition>

            <!-- 偏好设置弹窗 -->
            <transition name="fade">
                <div v-if="showPreferenceModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" @click.self="showPreferenceModal = false">
                    <div class="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                        <button @click="showPreferenceModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-white"><i class="fa-solid fa-times"></i></button>
                        <h3 class="text-xl font-bold mb-6 text-white"><i class="fa-solid fa-sliders mr-2 text-brand"></i>偏好设置</h3>
                        
                        <div class="space-y-6">
                            <div>
                                <label class="block text-sm font-bold text-gray-400 mb-3">默认导出格式</label>
                                <div class="grid grid-cols-2 gap-4">
                                    <div @click="prefSettings.exportFormat = 'pdf'" :class="['border rounded-xl p-3 text-center cursor-pointer transition', prefSettings.exportFormat === 'pdf' ? 'border-brand bg-brand/10 text-brand' : 'border-dark-border bg-dark text-gray-400 hover:border-gray-500']">
                                        <i class="fa-solid fa-file-pdf text-2xl mb-2"></i>
                                        <div class="text-sm font-bold">PDF 文档</div>
                                    </div>
                                    <div @click="prefSettings.exportFormat = 'midi'" :class="['border rounded-xl p-3 text-center cursor-pointer transition', prefSettings.exportFormat === 'midi' ? 'border-brand bg-brand/10 text-brand' : 'border-dark-border bg-dark text-gray-400 hover:border-gray-500']">
                                        <i class="fa-solid fa-file-audio text-2xl mb-2"></i>
                                        <div class="text-sm font-bold">MIDI 文件</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-bold text-gray-400 mb-3">界面主题 (暂未开放)</label>
                                <select disabled class="w-full bg-dark border border-dark-border rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed outline-none appearance-none">
                                    <option>深色模式 (Dark)</option>
                                    <option>浅色模式 (Light)</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="mt-8 flex justify-end space-x-4">
                            <button @click="showPreferenceModal = false" class="px-5 py-2 rounded-lg bg-brand text-white hover:bg-[#FF4B82] transition font-bold text-sm shadow-[0_0_15px_rgba(255,42,109,0.3)]">保存偏好</button>
                        </div>
                    </div>
                </div>
            </transition>

        </div>
    `,
    data() {
        return {
            showPasswordModal: false,
            showNotificationModal: false,
            showPreferenceModal: false,
            passwordForm: {
                old: '',
                new: '',
                confirm: ''
            },
            passwordError: '',
            notifySettings: {
                system: true,
                task: true,
                marketing: false
            },
            prefSettings: {
                exportFormat: 'pdf',
                theme: 'dark'
            }
        };
    },
    computed: {
        store() {
            return store;
        }
    },
    methods: {
        handleLogout() {
            store.logout();
        },
        handleSavePassword() {
            this.passwordError = '';
            if (!this.passwordForm.old || !this.passwordForm.new || !this.passwordForm.confirm) {
                this.passwordError = '请填写完整所有密码字段';
                return;
            }
            if (this.passwordForm.new.length < 8) {
                this.passwordError = '新密码长度不能少于8位';
                return;
            }
            if (this.passwordForm.new !== this.passwordForm.confirm) {
                this.passwordError = '两次输入的新密码不一致';
                return;
            }
            
            // 模拟保存成功
            alert('密码修改成功，请妥善保管！');
            this.passwordForm = { old: '', new: '', confirm: '' };
            this.showPasswordModal = false;
        }
    },
    mounted() {
        if (!store.isLoggedIn) {
            this.$emit('require-login', 'profile');
        }
    }
};