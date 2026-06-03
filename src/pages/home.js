const Home = {
    data() {
        return {
            uploading: false,
            uploadProgress: 0,
            dragOver: false,
            uploadInterval: null
        };
    },
    methods: {
        triggerUpload() {
            this.$refs.fileInput.click();
        },
        handleFileSelect(event) {
            const file = event.target.files[0];
            if (file) this.startUpload(file);
        },
        handleDrop(event) {
            this.dragOver = false;
            const file = event.dataTransfer.files[0];
            if (file) this.startUpload(file);
        },
        startUpload(file) {
            // 前端简单校验
            const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/flac', 'audio/x-flac'];
            if (!validTypes.includes(file.type)) {
                alert('不支持该格式，仅支持 MP3/WAV/FLAC');
                return;
            }
            if (file.size > 50 * 1024 * 1024) {
                alert('文件过大，不能超过 50MB');
                return;
            }

            this.uploading = true;
            this.uploadProgress = 0;
            
            // 模拟上传进度
            this.uploadInterval = setInterval(() => {
                this.uploadProgress += Math.floor(Math.random() * 15) + 5;
                if (this.uploadProgress >= 100) {
                    this.uploadProgress = 100;
                    clearInterval(this.uploadInterval);
                    setTimeout(() => {
                        this.finishUpload(file);
                    }, 500);
                }
            }, 300);
        },
        cancelUpload() {
            clearInterval(this.uploadInterval);
            this.uploading = false;
            this.uploadProgress = 0;
            if (this.$refs.fileInput) this.$refs.fileInput.value = '';
        },
        finishUpload(file) {
            this.uploading = false;
            this.uploadProgress = 0;
            
            // 无论用户传入什么音频，统一强制进入目标曲目
            // 路径对应 public/audios 下的真实音频，确保能够正常播放
            store.pendingAudio = {
                name: '月詠み-真昼の月明かり',
                size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                isTeaching: true,
                src: 'public/audios/月詠み - 真昼の月明かり (正午的月光)_MQ.mp3'
            };

            // 路由分发逻辑
            if (store.isLoggedIn) {
                this.$emit('navigate', 'workspace');
            } else {
                store.showLoginModal = true;
            }
        }
    },
    template: `
        <div class="flex-grow flex flex-col items-center justify-start pt-16 px-4 relative z-10 w-full overflow-hidden select-none">
            <!-- 装饰背景 -->
            <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[400px] bg-brand rounded-full mix-blend-screen filter blur-[200px] opacity-10 pointer-events-none"></div>

            <div class="max-w-7xl w-full mx-auto flex flex-col md:flex-row items-center justify-between">
                
                <!-- 左侧：品牌传达与核心操作 -->
                <div class="w-full md:w-1/2 pr-0 md:pr-10 mb-12 md:mb-0 relative z-10 -mt-10">
                    <div class="inline-block px-4 py-1.5 rounded-full border border-brand/30 bg-brand/10 text-brand text-sm font-bold mb-6">
                        AI 模型 v2.0 现已上线
                    </div>
                    
                    <h1 class="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-tight text-brand text-glow">
                        声谱工坊
                    </h1>
                    <p class="text-xl md:text-2xl text-white font-bold mb-8 font-sans whitespace-nowrap">
                        AI 音频扒谱与音色分离工作站
                    </p>
                    <p class="text-gray-400 mb-12 max-w-lg leading-relaxed">
                        声谱工坊可将复杂音频转换为可编辑、可导出的高质量谱面与MIDI文件。为音乐人、教师与创作者省下90%的扒谱时间。
                    </p>

                    <!-- 极速处理入口（上传区域，整个区域可点击） -->
                    <div class="relative bg-dark-card border-2 border-dashed rounded-3xl p-8 transition-all duration-300 group cursor-pointer h-64 flex flex-col justify-center"
                         :class="[dragOver ? 'border-brand bg-brand/5' : 'border-dark-border hover:border-brand/50']"
                         @dragover.prevent="dragOver = true"
                         @dragleave.prevent="dragOver = false"
                         @drop.prevent="handleDrop"
                         @click="triggerUpload">
                         
                        <input type="file" ref="fileInput" class="hidden" accept=".mp3,.wav,.flac" @change="handleFileSelect">
                        
                        <!-- 默认状态 -->
                        <div v-if="!uploading" class="text-center pointer-events-none">
                            <div class="w-20 h-20 bg-dark border border-dark-border rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:border-brand/50 transition-all duration-500 shadow-lg">
                                <i class="fa-solid fa-cloud-arrow-up text-3xl text-brand"></i>
                            </div>
                            <h3 class="text-xl font-bold mb-2">拖拽音频文件至此，或 <span class="text-brand underline">点击上传</span></h3>
                        </div>

                        <!-- 上传处理中状态 -->
                        <div v-else class="text-center py-4" @click.stop>
                            <div class="relative w-24 h-24 mx-auto mb-6">
                                <!-- 呼吸灯扫描动效 -->
                                <div class="absolute inset-0 rounded-full border-4 border-dark-border"></div>
                                <div class="absolute inset-0 rounded-full border-4 border-brand border-t-transparent animate-spin"></div>
                                <div class="absolute inset-0 rounded-full bg-brand/20 animate-pulse flex items-center justify-center">
                                    <span class="text-brand font-bold text-lg">{{ uploadProgress }}%</span>
                                </div>
                            </div>
                            <h3 class="text-xl font-bold mb-2 text-glow text-white">正在读取音频数据...</h3>
                            <p class="text-gray-400 text-sm mb-6">请勿关闭当前页面</p>
                            
                            <button @click="cancelUpload" class="px-6 py-2 rounded-full border border-dark-border hover:border-red-500 hover:text-red-400 transition text-sm font-bold text-gray-400">
                                取消上传
                            </button>
                        </div>
                    </div>
                    
                    <!-- 移动到上传框下方的提示文本 (左对齐，绿色对勾) -->
                    <div class="flex items-center justify-start space-x-4 text-sm text-gray-500 mt-6 font-bold px-2">
                        <span class="flex items-center"><i class="fa-solid fa-circle-check text-green-500 mr-1.5"></i> 仅支持 MP3/WAV/FLAC</span>
                        <span class="text-dark-border">|</span>
                        <span class="flex items-center"><i class="fa-solid fa-circle-check text-green-500 mr-1.5"></i> 单文件最大 50MB</span>
                    </div>
                </div>

                <!-- 右侧：产品展示 (立体空间 3D 倾斜笔记本电脑 Mockup，带键盘面，朝右倾斜) -->
                <div class="w-full md:w-1/2 relative flex justify-center z-10 mt-16 md:mt-0 perspective-[2000px] translate-y-[60px]">
                    
                    <!-- 增强版背景音符与五线谱特效 (深度复现参考图) -->
                    <div class="absolute -inset-20 md:-inset-32 z-0 pointer-events-none overflow-hidden opacity-70 mix-blend-screen">
                        <!-- 大型背景音符符号 -->
                        <i class="fa-solid fa-music absolute text-brand opacity-[0.15] text-[180px] top-5 left-0 transform -rotate-12 blur-sm"></i>
                        <i class="fa-solid fa-music absolute text-brand opacity-20 text-[250px] bottom-10 -right-10 transform rotate-[15deg] blur-md"></i>
                        <i class="fa-solid fa-music absolute text-brand opacity-10 text-[120px] top-1/4 right-0 transform -rotate-[30deg] blur-[2px]"></i>
                        
                        <!-- 更多更明显的飘荡五线谱曲线 -->
                        <svg viewBox="0 0 500 500" class="absolute w-[150%] h-[150%] transform scale-125 -rotate-12 -left-20 -top-10 opacity-60">
                            <!-- 第一组五线谱 -->
                            <path d="M -100,200 C 100,50 300,350 600,150" fill="none" stroke="rgba(255,42,109,0.4)" stroke-width="1.5" />
                            <path d="M -100,210 C 100,60 300,360 600,160" fill="none" stroke="rgba(255,42,109,0.4)" stroke-width="1.5" />
                            <path d="M -100,220 C 100,70 300,370 600,170" fill="none" stroke="rgba(255,42,109,0.4)" stroke-width="1.5" />
                            <path d="M -100,230 C 100,80 300,380 600,180" fill="none" stroke="rgba(255,42,109,0.4)" stroke-width="1.5" />
                            <path d="M -100,240 C 100,90 300,390 600,190" fill="none" stroke="rgba(255,42,109,0.4)" stroke-width="1.5" />
                            
                            <!-- 第二组五线谱 (交叉流动) -->
                            <path d="M -100,350 C 150,450 250,150 600,250" fill="none" stroke="rgba(255,42,109,0.2)" stroke-width="1" />
                            <path d="M -100,360 C 150,460 250,160 600,260" fill="none" stroke="rgba(255,42,109,0.2)" stroke-width="1" />
                            <path d="M -100,370 C 150,470 250,170 600,270" fill="none" stroke="rgba(255,42,109,0.2)" stroke-width="1" />
                            <path d="M -100,380 C 150,480 250,180 600,280" fill="none" stroke="rgba(255,42,109,0.2)" stroke-width="1" />
                            <path d="M -100,390 C 150,490 250,190 600,290" fill="none" stroke="rgba(255,42,109,0.2)" stroke-width="1" />
                        </svg>

                        <!-- 散落的小音符 (不同大小和动画时长) -->
                        <i class="fa-solid fa-music absolute text-brand opacity-60 text-2xl bottom-32 left-[15%] animate-bounce anim-duration-3s"></i>
                        <i class="fa-solid fa-music absolute text-brand opacity-40 text-xl top-40 right-1/4 animate-bounce anim-duration-4s" style="animation-delay: 1s"></i>
                        <i class="fa-solid fa-music absolute text-brand opacity-50 text-3xl top-10 left-[40%] animate-pulse anim-duration-5s"></i>
                        <i class="fa-solid fa-music absolute text-brand opacity-30 text-lg bottom-1/4 right-[10%] animate-bounce anim-duration-3-5s" style="animation-delay: 0.5s"></i>
                        <i class="fa-solid fa-compact-disc absolute text-brand opacity-40 text-4xl bottom-20 right-1/3 transform rotate-45 animate-pulse"></i>
                    </div>

                    <!-- 3D 电脑实体容器 (科技感重构版) -->
                    <div class="relative w-full max-w-[650px] transition-transform duration-700 hover:rotate-y-0 hover:rotate-x-0 z-10 home-3d-container">
                        
                        <!-- 光晕背景层 (增加全息科技感) -->
                        <div class="absolute -inset-10 bg-brand/10 rounded-full blur-[80px] pointer-events-none transform translate-z-[-50px]"></div>

                        <!-- A. 屏幕部分 (超窄边框，玻璃质感) -->
                        <div class="bg-[#0f0f0f] rounded-t-2xl p-1.5 pb-2 border-t border-l border-r border-gray-700/50 relative overflow-hidden shadow-[inset_0_2px_15px_rgba(255,255,255,0.05),_0_20px_40px_rgba(255,42,109,0.3)] backdrop-blur-md home-3d-screen">
                            
                            <!-- 摄像头/呼吸灯 -->
                            <div class="w-1 h-1 rounded-full bg-brand absolute top-1.5 right-1/2 transform translate-x-1/2 opacity-90 shadow-[0_0_8px_#FF2A6D] animate-pulse"></div>
                            
                            <!-- 内部屏幕显示 -->
                            <div class="bg-black rounded-t-xl overflow-hidden border border-gray-800/80 aspect-[16/10] relative shadow-[inset_0_0_30px_rgba(0,0,0,0.9)]">
                                <img src="public/images/ui/editpage.png" alt="工作台实机演示" class="w-full h-full object-fill opacity-95 scale-[1.01] transform origin-center">
                                
                                <!-- 屏幕网格扫描线 (科技感元素) -->
                                <div class="absolute inset-0 bg-[linear-gradient(rgba(255,42,109,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,42,109,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none mix-blend-screen"></div>
                                
                                <!-- 屏幕反光效果 (更通透的玻璃质感) -->
                                <div class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none transform -translate-x-1/4 skew-x-[-30deg]"></div>
                            </div>
                            
                            <!-- 屏幕下方边框/Logo区 -->
                            <div class="h-5 w-full flex items-center justify-center">
                                <div class="text-[7px] tracking-[0.3em] text-gray-500 font-bold uppercase text-glow">SoundScore AI</div>
                            </div>
                        </div>
                        
                        <!-- B. 键盘/底座部分 (金属质感，发光元素) -->
                        <div class="relative w-full aspect-[16/6] bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-b-2xl border-b-4 border-r-4 border-l-2 border-gray-900 shadow-[0_60px_120px_rgba(0,0,0,0.9),_0_30px_60px_rgba(255,42,109,0.2)] home-3d-base">
                             
                             <!-- 发光边缘线 -->
                             <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent"></div>

                             <!-- 键盘凹陷区域 -->
                             <div class="absolute top-3 left-4 right-4 bottom-12 bg-[#0a0a0a] rounded-lg shadow-[inset_0_8px_20px_rgba(0,0,0,0.9)] border border-gray-800/30 p-1.5 flex justify-center">
                                 <!-- 赛博朋克风的发光按键网格 -->
                                 <div class="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIxMCI+PHJlY3QgeD0iMSIgeT0iMSIgd2lkdGg9IjE4IiBoZWlnaHQ9IjgiIHJ4PSIxIiBmaWxsPSIjMTExIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9zdmc+')] opacity-90 relative">
                                     <!-- 键盘背光渐变 -->
                                     <div class="absolute inset-0 bg-gradient-to-t from-brand/20 via-transparent to-transparent mix-blend-screen"></div>
                                 </div>
                             </div>
                             
                             <!-- 触摸板 (带发光边缘) -->
                             <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1/4 h-8 bg-[#111] rounded-md shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] border border-gray-800/50">
                                 <div class="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-brand/30 shadow-[0_0_5px_#FF2A6D]"></div>
                             </div>
                             
                             <!-- 掌托区域高光金属拉丝质感 -->
                             <div class="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white/5 to-transparent pointer-events-none rounded-b-2xl mix-blend-overlay"></div>
                             
                             <!-- 电脑开启指示灯 -->
                             <div class="absolute bottom-1 right-8 w-1.5 h-0.5 bg-brand shadow-[0_0_10px_#FF2A6D] rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 下方：使用教程视频区占位 -->
            <div class="mt-24 md:mt-32 max-w-6xl mx-auto relative px-4">
                <div class="text-center mb-16">
                    <h2 class="text-3xl md:text-5xl font-bold font-serif mb-4">工作流如此简单</h2>
                    <p class="text-gray-400 text-lg">从上传到导出，全自动化处理</p>
                </div>
                
                <!-- 三张倾斜悬挂的步骤图容器 -->
                <div class="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 perspective-[1000px]">
                    <!-- Step 1 -->
                    <div class="relative group cursor-pointer w-full md:w-1/3 transition-all duration-500 hover:scale-105 home-float-img-1">
                        <img src="public/images/ui/step1.png" alt="步骤 1" class="w-full rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-dark-border group-hover:border-brand/50 group-hover:shadow-[0_0_30px_rgba(255,42,109,0.3)] transition-all">
                        <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-gray-400 font-bold group-hover:text-brand transition-colors flex items-center space-x-2">
                            <span class="bg-dark border border-dark-border rounded-full w-6 h-6 flex items-center justify-center text-xs group-hover:border-brand group-hover:bg-brand/20">1</span>
                            <span>上传音频</span>
                        </div>
                    </div>
                    
                    <!-- Step 2 -->
                    <div class="relative group cursor-pointer w-full md:w-1/3 transition-all duration-500 hover:scale-105 z-10 flex justify-center bg-transparent home-float-img-2">
                        <img src="public/images/ui/step2.png" alt="步骤 2" class="w-full object-fill rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.8)] border border-dark-border group-hover:border-brand/50 group-hover:shadow-[0_0_30px_rgba(255,42,109,0.3)] transition-all">
                        <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-gray-400 font-bold group-hover:text-brand transition-colors flex items-center space-x-2">
                            <span class="bg-dark border border-dark-border rounded-full w-6 h-6 flex items-center justify-center text-xs group-hover:border-brand group-hover:bg-brand/20">2</span>
                            <span>AI 处理</span>
                        </div>
                    </div>
                    
                    <!-- Step 3 -->
                    <div class="relative group cursor-pointer w-full md:w-1/3 transition-all duration-500 hover:scale-105 home-float-img-3">
                        <img src="public/images/ui/step3.png" alt="步骤 3" class="w-full rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-dark-border group-hover:border-brand/50 group-hover:shadow-[0_0_30px_rgba(255,42,109,0.3)] transition-all">
                        <div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-gray-400 font-bold group-hover:text-brand transition-colors flex items-center space-x-2">
                            <span class="bg-dark border border-dark-border rounded-full w-6 h-6 flex items-center justify-center text-xs group-hover:border-brand group-hover:bg-brand/20">3</span>
                            <span>编辑与导出</span>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    `
};