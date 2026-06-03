const Projects = {
    data() {
        return {
            store,
            allProjects: [],
            viewMode: 'grid', // 'grid' | 'list'
            showDeleteModal: false,
            projectToDelete: null,
            showCannotDeleteModal: false,
            currentPageNum: 1,
            itemsPerPage: 8
        };
    },
    computed: {
        projects() {
            // 根据登录用户决定渲染哪些项目
            if (this.store.user?.username === 'admin') {
                return this.allProjects;
            } else {
                return [
                    { 
                        id: 101, 
                        name: '月詠み-真昼の月明かり', 
                        duration: '03:43', 
                        date: '2026-04-10 09:00', 
                        cover: 'public/images/covers/project-cover.jpg',
                        isTeaching: true 
                    }
                ];
            }
        },
        totalPages() {
            return Math.ceil(this.projects.length / this.itemsPerPage);
        },
        paginatedProjects() {
            const start = (this.currentPageNum - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.projects.slice(start, end);
        }
    },
    methods: {
        triggerUpload() {
            // 简单模拟跳转回首页上传
            this.$emit('navigate', 'home');
        },
        openProject(id) {
            // 模拟加载项目并进入工作台
            const targetProject = this.projects.find(p => p.id === id);
            store.pendingAudio = { 
                name: targetProject.name,
                isTeaching: targetProject.isTeaching || false,
                src: targetProject.isTeaching ? 'public/audios/月詠み - 真昼の月明かり (正午的月光)_MQ.mp3' : null
            };
            this.$emit('navigate', 'workspace');
        },
        confirmDelete(project) {
            if (project?.isTeaching) {
                this.showCannotDeleteModal = true;
                return;
            }
            this.projectToDelete = project;
            this.showDeleteModal = true;
        },
        exportProject(project) {
            store.pendingAudio = { 
                name: project.name,
                isTeaching: project.isTeaching || false,
                src: project.isTeaching ? 'public/audios/月詠み - 真昼の月明かり (正午的月光)_MQ.mp3' : null
            };
            store.autoOpenExport = true;
            this.$emit('navigate', 'workspace');
        },
        executeDelete() {
            if (this.store.user?.username === 'admin') {
                this.allProjects = this.allProjects.filter(p => p.id !== this.projectToDelete.id);
            }
            // 普通用户不实现真正的删除，仅作演示
            this.showDeleteModal = false;
            this.projectToDelete = null;
            
            // 删除后若当前页空了，退回上一页
            if (this.paginatedProjects.length === 0 && this.currentPageNum > 1) {
                this.currentPageNum--;
            }
        },
        changePage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPageNum = page;
            }
        },
        generateAdminProjects() {
            const projects = [
                { name: '月詠み-真昼の月明かり', isTeaching: true },
                { name: 'Demo_RHCP_Cover.mp3', isTeaching: false },
                { name: 'Hotel_California_Bass.wav' },
                { name: 'Bohemian_Rhapsody_Solo.mp3' },
                { name: 'Stairway_To_Heaven_Stem.flac' },
                { name: 'Smells_Like_Teen_Spirit_Riff.wav' },
                { name: 'Sweet_Child_O_Mine_Drum.mp3' },
                { name: 'Billie_Jean_Vocal_Extract.wav' },
                { name: 'November_Rain_Intro.mp3' },
                { name: 'Wonderwall_Clean_Guitar.wav' },
                { name: 'Back_In_Black_Beat.flac' },
                { name: 'Nothing_Else_Matters.mp3' },
                { name: 'Under_The_Bridge_Acoustic.wav' },
                { name: 'Enter_Sandman_Solo.mp3' },
                { name: 'Creep_Chorus_Stem.wav' },
                { name: 'Come_As_You_Are_Riff.flac' },
                { name: 'Don_t_Stop_Believin.mp3' },
                { name: 'Livin_On_A_Prayer_Keys.wav' },
                { name: 'Sweet_Home_Alabama.mp3' },
                { name: 'Another_Brick_In_The_Wall.wav' },
                { name: 'Eye_Of_The_Tiger_Brass.flac' }
            ];
            
            this.allProjects = projects.map((p, i) => {
                const isTeaching = !!p.isTeaching;
                // 如果是教学项目，直接写死为 03:43
                const minutes = isTeaching ? 3 : Math.floor(Math.random() * 5) + 1;
                const seconds = isTeaching ? '43' : Math.floor(Math.random() * 60).toString().padStart(2, '0');
                const date = new Date(new Date('2026-04-09').getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
                const dateStr = isTeaching ? '2026-04-10 09:00' : `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                
                return {
                    id: i + 1,
                    name: p.name,
                    duration: `0${minutes}:${seconds}`,
                    date: dateStr,
                    cover: `public/images/covers/project-cover-${(i % 20) + 1}.jpg`,
                    isTeaching: isTeaching
                };
            }).sort((a, b) => new Date(b.date) - new Date(a.date));
        }
    },
    mounted() {
        if (!store.isLoggedIn) {
            this.$emit('require-login', 'projects');
        } else {
            this.generateAdminProjects();
        }
    },
    template: `
        <div class="flex-grow flex flex-col py-10 px-4 md:px-8 max-w-7xl mx-auto w-full relative z-10">
            
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
                <h1 class="text-3xl font-bold mb-4 md:mb-0">我的项目</h1>
                
                <div class="flex items-center space-x-4 w-full md:w-auto">
                    <div class="relative flex-grow md:w-64">
                        <i class="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                        <input type="text" placeholder="搜索项目..." class="w-full bg-dark-card border border-dark-border rounded-full py-2 pl-10 pr-4 text-sm text-white focus:border-brand transition outline-none">
                    </div>
                    
                    <div class="flex bg-dark-card border border-dark-border rounded-lg overflow-hidden shrink-0">
                        <button @click="viewMode = 'grid'" :class="['w-10 h-10 flex items-center justify-center transition', viewMode === 'grid' ? 'bg-dark text-brand' : 'text-gray-500 hover:text-white']"><i class="fa-solid fa-border-all"></i></button>
                        <button @click="viewMode = 'list'" :class="['w-10 h-10 flex items-center justify-center transition border-l border-dark-border', viewMode === 'list' ? 'bg-dark text-brand' : 'text-gray-500 hover:text-white']"><i class="fa-solid fa-list"></i></button>
                    </div>
                    
                    <button @click="triggerUpload" class="shrink-0 bg-brand hover:bg-[#FF4B82] text-white px-5 py-2.5 rounded-full font-bold text-sm transition shadow-[0_0_15px_rgba(255,42,109,0.3)] flex items-center">
                        <i class="fa-solid fa-plus mr-2"></i> 新建
                    </button>
                </div>
            </div>

            <!-- 缺省状态 -->
            <div v-if="projects.length === 0" class="flex-grow flex flex-col items-center justify-center py-20">
                <div class="w-32 h-32 bg-dark-card rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <i class="fa-regular fa-folder-open text-5xl text-gray-600"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-300 mb-2">暂无项目</h3>
                <p class="text-gray-500 mb-6 text-sm">快去上传并生成你的第一份乐谱吧</p>
                <button @click="triggerUpload" class="px-6 py-2 border border-brand text-brand hover:bg-brand hover:text-white rounded-full transition font-bold text-sm">
                    去上传音频
                </button>
            </div>

            <!-- 网格视图 -->
            <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div v-for="project in paginatedProjects" :key="project.id" class="bg-dark-card border border-dark-border rounded-2xl overflow-hidden hover:border-gray-500 transition group cursor-pointer" @click="openProject(project.id)">
                    <div class="aspect-video relative overflow-hidden bg-dark">
                        <img :src="project.cover" alt="Cover" class="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition duration-500">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                            <div class="text-xs font-bold text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded w-max mb-1"><i class="fa-regular fa-clock mr-1"></i> {{ project.duration }}</div>
                        </div>
                        
                        <!-- 悬浮播放/编辑按钮 -->
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div class="w-12 h-12 bg-brand rounded-full flex items-center justify-center text-white shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                <i class="fa-solid fa-play ml-1"></i>
                            </div>
                        </div>
                    </div>
                    <div class="p-4">
                        <h3 class="font-bold text-white text-base truncate mb-1" :title="project.name">{{ project.name }}</h3>
                        <p class="text-xs text-gray-500 mb-4">{{ project.date }}</p>
                        <div class="flex items-center justify-between border-t border-dark-border pt-3">
                            <div class="flex space-x-2">
                                <span class="text-[10px] bg-dark border border-dark-border px-2 py-0.5 rounded text-gray-400">分离完成</span>
                            </div>
                            <div class="flex space-x-3">
                                <button @click.stop="exportProject(project)" class="text-gray-400 hover:text-brand transition" title="导出"><i class="fa-solid fa-download"></i></button>
                                <button @click.stop="confirmDelete(project)" class="text-gray-400 hover:text-red-500 transition" title="删除"><i class="fa-regular fa-trash-can"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 列表视图 -->
            <div v-else class="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-dark border-b border-dark-border text-xs text-gray-400 uppercase tracking-wider">
                            <th class="p-4 font-bold">项目名称</th>
                            <th class="p-4 font-bold">状态</th>
                            <th class="p-4 font-bold">时长</th>
                            <th class="p-4 font-bold">最后修改</th>
                            <th class="p-4 font-bold text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody class="text-sm">
                        <tr v-for="project in paginatedProjects" :key="project.id" class="border-b border-dark-border hover:bg-dark transition cursor-pointer" @click="openProject(project.id)">
                            <td class="p-4">
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 rounded bg-gray-800 overflow-hidden shrink-0">
                                        <img :src="project.cover" class="w-full h-full object-cover">
                                    </div>
                                    <span class="font-bold text-white">{{ project.name }}</span>
                                </div>
                            </td>
                            <td class="p-4"><span class="text-xs bg-dark border border-dark-border px-2 py-1 rounded text-gray-400">分离完成</span></td>
                            <td class="p-4 text-gray-400">{{ project.duration }}</td>
                            <td class="p-4 text-gray-400">{{ project.date }}</td>
                            <td class="p-4 text-right">
                                <button @click.stop="exportProject(project)" class="w-8 h-8 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition"><i class="fa-solid fa-download"></i></button>
                                <button @click.stop class="w-8 h-8 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition"><i class="fa-solid fa-pen"></i></button>
                                <button @click.stop="confirmDelete(project)" class="w-8 h-8 rounded-full hover:bg-gray-800 text-gray-400 hover:text-red-500 transition"><i class="fa-regular fa-trash-can"></i></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- 分页控件 -->
            <div v-if="totalPages > 1" class="flex justify-center items-center mt-10 space-x-2">
                <button @click="changePage(currentPageNum - 1)" :disabled="currentPageNum === 1" class="w-10 h-10 rounded-full flex items-center justify-center bg-dark border border-dark-border text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                
                <div class="flex space-x-1">
                    <button v-for="page in totalPages" :key="page" @click="changePage(page)" :class="['w-10 h-10 rounded-full flex items-center justify-center transition font-bold text-sm', currentPageNum === page ? 'bg-brand text-white shadow-[0_0_10px_rgba(255,42,109,0.3)]' : 'bg-dark border border-dark-border text-gray-400 hover:text-white hover:border-gray-500']">
                        {{ page }}
                    </button>
                </div>
                
                <button @click="changePage(currentPageNum + 1)" :disabled="currentPageNum === totalPages" class="w-10 h-10 rounded-full flex items-center justify-center bg-dark border border-dark-border text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
            </div>

            <!-- 删除确认弹窗 -->
            <transition name="fade">
                <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
                    <div class="bg-dark-card border border-dark-border rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
                        <div class="flex items-center justify-center w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-full mb-4 mx-auto">
                            <i class="fa-solid fa-triangle-exclamation text-red-500 text-xl"></i>
                        </div>
                        <h2 class="text-xl font-bold text-center mb-2">删除确认</h2>
                        <p class="text-gray-400 text-center text-sm mb-6">确定要删除项目 <span class="text-white font-bold">{{ projectToDelete?.name }}</span> 吗？此操作不可撤销。</p>
                        
                        <div class="flex space-x-3">
                            <button @click="showDeleteModal = false" class="flex-1 py-2.5 bg-dark border border-dark-border hover:bg-gray-800 text-white rounded-lg transition text-sm font-bold">取消</button>
                            <button @click="executeDelete" class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm font-bold">确认删除</button>
                        </div>
                    </div>
                </div>
            </transition>

            <transition name="fade">
                <div v-if="showCannotDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm" @click.self="showCannotDeleteModal = false">
                    <div class="bg-dark-card border border-dark-border rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-center">
                        <div class="flex items-center justify-center w-12 h-12 bg-gray-500/10 border border-gray-500/30 rounded-full mb-4 mx-auto">
                            <i class="fa-solid fa-circle-info text-gray-300 text-xl"></i>
                        </div>
                        <h2 class="text-xl font-bold text-center mb-2">无法删除演示项目</h2>
                        <p class="text-gray-400 text-center text-sm mb-6">该项目为默认演示内容，用于展示平台功能，暂不支持删除。</p>
                        <button @click="showCannotDeleteModal = false" class="w-full py-2.5 bg-brand hover:bg-[#FF4B82] text-white rounded-lg transition text-sm font-bold">我知道了</button>
                    </div>
                </div>
            </transition>
        </div>
    `
};
