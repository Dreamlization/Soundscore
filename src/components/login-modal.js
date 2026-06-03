const LoginModal = {
    data() {
        return { 
            store,
            mode: 'login', // 'login' | 'register'
            loginForm: { username: 'admin', password: '710049' },
            registerForm: { 
                username: '', 
                password: '', 
                confirmPassword: '', 
                email: '', 
                bio: '', 
                birthday: '', 
                role: '其他', 
                avatar: 'public/images/avatars/avatar-newuser.svg',
                isRobot: false,
                agreed: false
            },
            showPassword: false,
            showConfirmPassword: false,
            errorMsg: ''
        };
    },
    methods: {
        changeAvatar() {
            // 暂不支持本地上传，仅提供随机头像切换演示
            const seeds = ['Felix', 'Aneka', 'Jack', 'Luna', 'Jasper', 'Milo', 'Oliver', 'Bella'];
            const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];
            this.registerForm.avatar = `public/images/avatars/avatar-newuser.svg`;
        },
        togglePassword() {
            this.showPassword = !this.showPassword;
        },
        toggleConfirmPassword() {
            this.showConfirmPassword = !this.showConfirmPassword;
        },
        switchMode(newMode) {
            this.mode = newMode;
            this.errorMsg = '';
        },
        handleLogin() {
            if(!this.loginForm.username || !this.loginForm.password) {
                this.errorMsg = '请输入账号和密码';
                return;
            }
            if (store.login(this.loginForm.username, this.loginForm.password)) {
                this.$emit('login-success');
                this.$emit('close');
            } else {
                this.errorMsg = '账号或密码错误';
            }
        },
        handleRegister() {
            if(!this.registerForm.username || !this.registerForm.password) {
                this.errorMsg = '请填写必填项'; return;
            }
            if(this.registerForm.password !== this.registerForm.confirmPassword) {
                this.errorMsg = '两次输入的密码不一致'; return;
            }
            if(!this.registerForm.birthday) {
                this.errorMsg = '请选择出生日期'; return;
            }
            if(!this.registerForm.isRobot) {
                this.errorMsg = '请完成人机验证'; return;
            }
            if(!this.registerForm.agreed) {
                this.errorMsg = '请阅读并同意相关协议'; return;
            }
            
            const result = store.register({...this.registerForm});
            if(result.success) {
                this.$emit('login-success');
                this.$emit('close');
            } else {
                this.errorMsg = result.message;
            }
        },
        showAgreement(type) {
            store.agreementType = type;
            store.showAgreementModal = true;
        }
    },
    template: `
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity">
            <div class="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-8 shadow-2xl relative animate-[fadeIn_0.3s_ease-out] overflow-y-auto max-h-[90vh]">
                <!-- 关闭按钮 -->
                <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-white transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 z-10">
                    <i class="fa-solid fa-times text-xl"></i>
                </button>

                <!-- 模式切换 -->
                <div class="flex space-x-6 border-b border-dark-border mb-8">
                    <button @click="switchMode('login')" :class="['pb-3 text-lg font-bold transition', mode === 'login' ? 'text-brand border-b-2 border-brand' : 'text-gray-400 hover:text-white']">登录</button>
                    <button @click="switchMode('register')" :class="['pb-3 text-lg font-bold transition', mode === 'register' ? 'text-brand border-b-2 border-brand' : 'text-gray-400 hover:text-white']">注册账号</button>
                </div>

                <!-- 错误提示 -->
                <div v-if="errorMsg" class="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
                    <i class="fa-solid fa-circle-exclamation mr-2"></i> {{ errorMsg }}
                </div>

                <!-- 登录面板 -->
                <div v-if="mode === 'login'" class="space-y-6">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">账号</label>
                            <div class="relative">
                                <i class="fa-regular fa-user absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                                <input v-model="loginForm.username" type="text" class="w-full bg-dark border border-dark-border rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition" placeholder="admin" @keyup.enter="handleLogin">
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">密码</label>
                            <div class="relative">
                                <i class="fa-solid fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                                <input v-model="loginForm.password" :type="showPassword ? 'text' : 'password'" class="w-full bg-dark border border-dark-border rounded-xl py-3 pl-12 pr-10 text-white focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition [color-scheme:dark]" placeholder="710049" @keyup.enter="handleLogin">
                                <button type="button" @click="togglePassword" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-brand transition outline-none">
                                    <i :class="['fa-solid', showPassword ? 'fa-eye-slash' : 'fa-eye']"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <button @click="handleLogin" class="w-full py-4 rounded-xl bg-brand hover:bg-[#FF4B82] text-white font-bold text-lg transition shadow-[0_0_20px_rgba(255,42,109,0.3)]">登录工作站</button>
                    <div class="text-center text-xs text-gray-500 mt-4">
                        <p>测试管理员账号：admin / 710049</p>
                    </div>
                </div>

                <!-- 注册面板 -->
                <div v-else class="space-y-5">
                    <!-- 用户头像预览 -->
                    <div class="flex justify-center mb-6">
                        <div class="relative group cursor-pointer" @click="changeAvatar" title="点击更换随机预设头像">
                            <div class="w-20 h-20 bg-dark border-2 border-dashed border-gray-600 group-hover:border-brand rounded-full overflow-hidden flex items-center justify-center transition shadow-lg">
                                <img :src="registerForm.avatar" class="w-full h-full object-cover opacity-80 group-hover:opacity-50 transition">
                                <i class="fa-solid fa-arrows-rotate absolute text-white opacity-0 group-hover:opacity-100 transition text-xl"></i>
                            </div>
                            <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-[10px] text-brand opacity-0 group-hover:opacity-100 transition">更换头像</div>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-gray-300 mb-1">用户名 *</label>
                            <input v-model="registerForm.username" type="text" class="w-full bg-dark border border-dark-border rounded-lg py-2.5 px-4 text-sm text-white focus:border-brand transition" placeholder="请输入用户名">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-300 mb-1">密码 *</label>
                            <div class="relative">
                                <input v-model="registerForm.password" :type="showPassword ? 'text' : 'password'" class="w-full bg-dark border border-dark-border rounded-lg py-2.5 pl-4 pr-10 text-sm text-white focus:border-brand transition" placeholder="请输入密码">
                                <button type="button" @click="togglePassword" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-brand transition outline-none">
                                    <i :class="['fa-solid', showPassword ? 'fa-eye-slash' : 'fa-eye']"></i>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-300 mb-1">确认密码 *</label>
                            <div class="relative">
                                <input v-model="registerForm.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" class="w-full bg-dark border border-dark-border rounded-lg py-2.5 pl-4 pr-10 text-sm text-white focus:border-brand transition" placeholder="请再次输入密码">
                                <button type="button" @click="toggleConfirmPassword" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-brand transition outline-none">
                                    <i :class="['fa-solid', showConfirmPassword ? 'fa-eye-slash' : 'fa-eye']"></i>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-300 mb-1">邮箱 (选填)</label>
                            <input v-model="registerForm.email" type="email" class="w-full bg-dark border border-dark-border rounded-lg py-2.5 px-4 text-sm text-white focus:border-brand transition" placeholder="请输入邮箱">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-300 mb-1">出生日期 *</label>
                            <input v-model="registerForm.birthday" type="text" class="w-full bg-dark border border-dark-border rounded-lg py-2.5 px-4 text-sm text-white focus:border-brand transition [color-scheme:dark]" placeholder="请选择出生年/月/日" onfocus="(this.type='date')" onblur="(this.type='text')">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-300 mb-1">用户身份</label>
                            <select v-model="registerForm.role" class="w-full bg-dark border border-dark-border rounded-lg py-2.5 px-4 text-sm text-white focus:border-brand transition appearance-none">
                                <option value="音乐专业学生">音乐专业学生</option>
                                <option value="音乐爱好者">音乐爱好者</option>
                                <option value="音乐从业者">音乐从业者</option>
                                <option value="音乐教师">音乐教师</option>
                                <option value="其他">其他</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-gray-300 mb-1">个人简介 (选填)</label>
                            <textarea v-model="registerForm.bio" class="w-full bg-dark border border-dark-border rounded-lg py-2.5 px-4 text-sm text-white focus:border-brand transition resize-none" rows="2" placeholder="简单介绍一下自己..."></textarea>
                        </div>
                    </div>

                    <!-- 验证与协议 -->
                    <div class="space-y-3 mt-4 bg-dark p-4 rounded-xl border border-dark-border">
                        <label class="flex items-center space-x-3 cursor-pointer group">
                            <div class="relative flex items-center justify-center w-5 h-5">
                                <input type="checkbox" v-model="registerForm.isRobot" class="peer sr-only">
                                <div class="w-5 h-5 bg-dark-card border border-gray-500 rounded peer-checked:bg-brand peer-checked:border-brand transition flex items-center justify-center">
                                    <i class="fa-solid fa-check text-white text-xs opacity-0 peer-checked:opacity-100 transition"></i>
                                </div>
                            </div>
                            <span class="text-sm text-gray-300 group-hover:text-white transition">我承诺不是机器人</span>
                        </label>
                        
                        <label class="flex items-center space-x-3 cursor-pointer group">
                            <div class="relative flex items-center justify-center w-5 h-5">
                                <input type="checkbox" v-model="registerForm.agreed" class="peer sr-only">
                                <div class="w-5 h-5 bg-dark-card border border-gray-500 rounded peer-checked:bg-brand peer-checked:border-brand transition flex items-center justify-center">
                                    <i class="fa-solid fa-check text-white text-xs opacity-0 peer-checked:opacity-100 transition"></i>
                                </div>
                            </div>
                            <span class="text-sm text-gray-300">已阅读并同意 
                                <a href="#" @click.prevent="showAgreement('service')" class="text-brand hover:underline">《用户服务协议》</a> 
                                和 
                                <a href="#" @click.prevent="showAgreement('privacy')" class="text-brand hover:underline">《隐私政策》</a>
                            </span>
                        </label>
                    </div>

                    <button @click="handleRegister" class="w-full py-4 rounded-xl bg-brand hover:bg-[#FF4B82] text-white font-bold text-lg transition shadow-[0_0_20px_rgba(255,42,109,0.3)] mt-6">创建账号</button>
                </div>
            </div>
        </div>
    `
};