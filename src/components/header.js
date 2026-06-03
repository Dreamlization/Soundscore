const AppHeader = {
    props: ['currentPage'],
    data() { 
        return { 
            store,
            showDropdown: false,
            dropdownTimer: null
        } 
    },
    template: `
        <header class="w-full h-16 border-b border-dark-border bg-[#121212] z-50 sticky top-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjMTIxMjEyIi8+PHBhdGggZD0iTTAgMjBMMjAgME0tMSAxTDEgLTFNMjEgMTlMMTkgMjEiIHN0cm9rZT0iI0ZGMkE2RDA1IiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=')]">
            <div class="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                <!-- 左侧：Logo 与品牌名 -->
                <div class="flex items-center space-x-3 cursor-pointer group header-logo-offset" @click="$emit('navigate', 'home')">
                    <img src="public/images/ui/logo_white.png" alt="声谱工坊 Logo" class="h-20 object-contain group-hover:scale-105 transition-transform duration-300">
                </div>

                <!-- 中间：主导航 -->
                <nav class="hidden md:flex space-x-8">
                    <a href="#" @click.prevent="$emit('navigate', 'home')" :class="['text-sm font-bold transition hover:text-brand', currentPage === 'home' ? 'text-brand border-b-2 border-brand pb-1' : 'text-gray-300']">首页</a>
                    <a href="#" v-if="store.isLoggedIn" @click.prevent="$emit('navigate', 'projects')" :class="['text-sm font-bold transition hover:text-brand', currentPage === 'projects' ? 'text-brand border-b-2 border-brand pb-1' : 'text-gray-300']">我的项目</a>
                    <a href="#" v-if="store.isLoggedIn" @click.prevent="$emit('navigate', 'profile')" :class="['text-sm font-bold transition hover:text-brand', currentPage === 'profile' ? 'text-brand border-b-2 border-brand pb-1' : 'text-gray-300']">个人中心</a>
                    <a href="#" @click.prevent="$emit('navigate', 'about')" :class="['text-sm font-bold transition hover:text-brand', currentPage === 'about' ? 'text-brand border-b-2 border-brand pb-1' : 'text-gray-300']">关于我们</a>
                </nav>

                <!-- 右侧：用户操作区 -->
                <div class="flex items-center space-x-4">
                    <!-- 未登录态 -->
                    <template v-if="!store.isLoggedIn">
                        <button @click="store.showLoginModal = true" class="px-5 py-2 rounded-full border border-dark-border hover:border-brand text-sm font-bold transition">登录 / 注册</button>
                    </template>
                    
                    <!-- 已登录态 -->
                    <template v-else>
                        <div class="flex items-center space-x-3 ml-4 border-l border-dark-border pl-4 relative" 
                             @mouseenter="handleMouseEnter" 
                             @mouseleave="handleMouseLeave">
                             
                            <!-- 问候语 -->
                            <span class="text-sm font-bold text-gray-300">你好，<span class="text-white">{{ store.user?.username || '用户' }}</span></span>
                            
                            <div class="w-9 h-9 rounded-full border border-dark-border overflow-hidden cursor-pointer hover:border-brand transition flex items-center justify-center bg-dark-card"
                                 @click="$emit('navigate', 'profile')">
                                <img v-if="store.user?.avatar" :src="store.user.avatar" alt="User" class="w-full h-full object-cover">
                                <i v-else class="fa-solid fa-user text-gray-400"></i>
                            </div>
                            
                            <!-- 下拉菜单 (防抖处理) -->
                            <transition name="fade">
                                <div v-show="showDropdown" 
                                     class="absolute right-0 top-full mt-2 w-48 bg-dark-card border border-dark-border rounded-xl shadow-xl py-2 z-50">
                                    <div class="px-4 py-2 border-b border-dark-border mb-1">
                                        <div class="text-sm font-bold text-white truncate">{{ store.user?.username || '用户' }}</div>
                                        <div class="text-xs mt-1" :class="store.user?.isPro ? 'text-brand' : 'text-gray-500'">
                                            {{ store.user?.isPro ? 'Pro 专业版' : '普通用户' }}
                                        </div>
                                    </div>
                                    <a href="#" @click.prevent="store.logout(); showDropdown = false" class="block px-4 py-2 text-sm text-red-400 hover:bg-dark hover:text-red-300 transition"><i class="fa-solid fa-arrow-right-from-bracket mr-2 w-4"></i>退出登录</a>
                                </div>
                            </transition>
                        </div>
                    </template>
                </div>
            </div>
        </header>
    `,
    methods: {
        handleMouseEnter() {
            clearTimeout(this.dropdownTimer);
            this.showDropdown = true;
        },
        handleMouseLeave() {
            this.dropdownTimer = setTimeout(() => {
                this.showDropdown = false;
            }, 200); // 200ms 防抖
        }
    }
};