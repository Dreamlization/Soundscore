const About = {
    template: `
        <div class="flex-grow flex flex-col items-center py-10 px-4 relative z-10 w-full overflow-hidden">
            <!-- Background Decoration -->
            <div class="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none"></div>
            <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-[400px] bg-brand rounded-full mix-blend-screen filter blur-[200px] opacity-[0.05] pointer-events-none"></div>
            
            <div class="text-center mb-8 relative z-10">
                <div class="w-20 h-20 bg-dark-card border border-dark-border shadow-[0_0_30px_rgba(255,42,109,0.2)] rounded-full flex items-center justify-center mx-auto mb-6 hover:scale-110 transition duration-500">
                    <i class="fa-solid fa-wave-square text-4xl text-brand text-glow"></i>
                </div>
                <h1 class="text-4xl font-extrabold mb-4 tracking-tight">关于<span class="text-brand">声谱工坊</span></h1>
                <p class="text-base text-gray-400 max-w-3xl mx-auto leading-relaxed">我们致力于用前沿的人工智能技术，打破音乐创作的门槛。<br>无论你是职业制作人还是音乐爱好者，都能在这里快速提取灵感、解构音轨，让每一次创作更高效。</p>
            </div>
            
            <h2 class="text-3xl font-bold mb-6 text-glow">核心团队</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mb-10 relative z-10">
                
                <!-- 产品总经理 -->
                <div class="bg-dark-card border border-dark-border rounded-3xl p-8 flex flex-col items-center text-center group hover:border-brand/50 hover:shadow-[0_0_30px_rgba(255,42,109,0.15)] transition duration-500 transform hover:-translate-y-2">
                    <div class="w-28 h-28 rounded-full overflow-hidden mb-5 border-4 border-dark group-hover:border-brand transition duration-500 relative bg-[#FFE4E1]">
                        <div class="absolute inset-0 bg-brand/20 opacity-0 group-hover:opacity-100 transition z-10 mix-blend-overlay"></div>
                        <img src="public/images/ui/yanlinzihan.jpg" alt="严林子涵" class="w-full h-full object-cover">
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-2">严林子涵</h3>
                    <p class="text-brand font-bold text-sm mb-4 uppercase tracking-wider">市场、商业运营与场景规划</p>
                    <p class="text-gray-400 text-sm leading-relaxed">作为项目的市场把关人，主导产品整体规划与用户体验设计，负责项目的商业流程与体验构建，确保产品在市场上能够站得住脚，并符合真实用户的使用逻辑。</p>
                </div>

                <!-- 算法负责人 -->
                <div class="bg-dark-card border border-dark-border rounded-3xl p-8 flex flex-col items-center text-center group hover:border-brand/50 hover:shadow-[0_0_30px_rgba(255,42,109,0.15)] transition duration-500 transform hover:-translate-y-2">
                    <div class="w-28 h-28 rounded-full overflow-hidden mb-5 border-4 border-dark group-hover:border-brand transition duration-500 relative bg-[#FFF0F5]">
                        <div class="absolute inset-0 bg-brand/20 opacity-0 group-hover:opacity-100 transition z-10 mix-blend-overlay"></div>
                        <img src="public/images/ui/wangxinyang.jpg" alt="王欣阳" class="w-full h-full object-cover">
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-2">王欣阳</h3>
                    <p class="text-brand font-bold text-sm mb-4 uppercase tracking-wider">资源、视觉设计与专业需求</p>
                    <p class="text-gray-400 text-sm leading-relaxed">作为项目的产品总经理，深度参与用户画像构建、提供专业视角需求、定义产品形态、产品功能，负责了产品的核心视觉设计、并提供核心的内容素材。</p>
                </div>

                <!-- 前端工程师 -->
                <div class="bg-dark-card border border-dark-border rounded-3xl p-8 flex flex-col items-center text-center group hover:border-brand/50 hover:shadow-[0_0_30px_rgba(255,42,109,0.15)] transition duration-500 transform hover:-translate-y-2">
                    <div class="w-28 h-28 rounded-full overflow-hidden mb-5 border-4 border-dark group-hover:border-brand transition duration-500 relative bg-[#F0F8FF]">
                        <div class="absolute inset-0 bg-brand/20 opacity-0 group-hover:opacity-100 transition z-10 mix-blend-overlay"></div>
                        <img src="public/images/ui/yuguo.jpg" alt="余果" class="w-full h-full object-cover">
                    </div>
                    <h3 class="text-2xl font-bold text-white mb-2">余果</h3>
                    <p class="text-brand font-bold text-sm mb-4 uppercase tracking-wider">论证、技术开发与产品落地</p>
                    <p class="text-gray-400 text-sm leading-relaxed">作为项目的前端工程师，负责将所有概念、架构和互动逻辑转化为最终可交互的网页产品，将乐谱渲染、混音台等操作呈现在浏览器中。</p>
                </div>
            </div>
            
            <!-- 查看详细分工按钮 -->
            <div class="mb-12 text-center relative z-10">
                <button @click="showRoleDetails = true" class="px-8 py-3 rounded-full bg-transparent border-2 border-brand text-brand hover:bg-brand hover:text-white font-bold transition duration-300 shadow-[0_0_15px_rgba(255,42,109,0.3)] hover:shadow-[0_0_25px_rgba(255,42,109,0.6)]">
                    <i class="fa-solid fa-users-viewfinder mr-2"></i> 点击查看详细分工
                </button>
            </div>
            
            <div class="bg-[#111] border border-dark-border rounded-3xl p-10 max-w-4xl w-full text-center relative overflow-hidden shadow-2xl z-10 group hover:border-brand/30 transition duration-500 mb-10">
                <div class="absolute inset-0 bg-[url('public/images/ui/about-bg.jpg')] bg-cover bg-center opacity-[0.03] group-hover:opacity-10 transition duration-500"></div>
                <h2 class="text-3xl font-extrabold mb-4 relative z-10">联系我们</h2>
                <p class="text-gray-400 mb-8 text-lg relative z-10">有任何商务合作、模型授权或技术交流意向，欢迎随时通过邮件与我们取得联系。</p>
                <a href="mailto:unrealdreamer@126.com" class="relative z-10 inline-flex items-center px-8 py-4 bg-dark-card border border-dark-border hover:border-brand hover:bg-brand text-white rounded-xl transition duration-300 font-bold text-lg shadow-lg">
                    <i class="fa-solid fa-envelope mr-3 animate-bounce"></i> unrealdreamer@126.com
                </a>
            </div>

            <!-- 详细分工弹窗 -->
            <div v-if="showRoleDetails" class="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm p-4" @click.self="showRoleDetails = false">
                <div class="bg-dark-card border border-dark-border rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                    <div class="flex justify-between items-center p-6 border-b border-dark-border bg-dark">
                        <h2 class="text-2xl font-bold text-white flex items-center"><i class="fa-solid fa-list-check text-brand mr-3"></i> 团队详细分工</h2>
                        <button @click="showRoleDetails = false" class="text-gray-400 hover:text-white transition bg-gray-800 hover:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center">
                            <i class="fa-solid fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="p-8 overflow-y-auto custom-scrollbar flex-grow text-gray-300 space-y-8 text-sm leading-relaxed">
                        
                        <!-- 严林子涵 -->
                        <div>
                            <h3 class="text-xl font-bold text-brand mb-3 flex items-center"><i class="fa-solid fa-user-tie mr-2"></i> 严林子涵-市场、商业运营与场景规划</h3>
                            <p class="mb-4 text-gray-400 bg-dark p-4 rounded-lg border border-dark-border">作为项目的市场把关人，主导产品整体规划与用户体验设计，负责项目的商业流程与体验构建，确保产品在市场上能够站得住脚，并符合真实用户的使用逻辑。</p>
                        </div>

                        <!-- 王欣阳 -->
                        <div>
                            <h3 class="text-xl font-bold text-brand mb-3 flex items-center"><i class="fa-solid fa-laptop-code mr-2"></i> 王欣阳：资源、视觉设计与专业需求</h3>
                            <p class="mb-4 text-gray-400 bg-dark p-4 rounded-lg border border-dark-border">作为项目的产品总经理，深度参与用户画像构建、提供专业视角需求、定义产品形态、产品功能，负责了产品的核心视觉设计、并提供核心的内容素材。</p>
                        </div>

                        <!-- 余果 -->
                        <div>
                            <h3 class="text-xl font-bold text-brand mb-3 flex items-center"><i class="fa-solid fa-code mr-2"></i> 余果-论证、技术开发与产品落地</h3>
                            <p class="mb-4 text-gray-400 bg-dark p-4 rounded-lg border border-dark-border">作为项目的前端工程师，负责将所有概念、架构和互动逻辑转化为最终可交互的网页产品，将乐谱渲染、混音台等操作呈现在浏览器中。</p>
                        </div>

                        <!-- 阶段参与情况表格 -->
                        <div>
                            <h3 class="text-lg font-bold text-white mb-4 border-b border-dark-border pb-2">各阶段项目参与情况</h3>
                            <div class="overflow-x-auto rounded-xl border border-dark-border">
                                <table class="w-full text-center border-collapse">
                                    <thead>
                                        <tr class="bg-dark text-gray-400 text-xs uppercase tracking-wider">
                                            <th class="p-4 border-b border-r border-dark-border w-28 whitespace-nowrap text-center">阶段</th>
                                            <th class="p-4 border-b border-r border-dark-border w-1/3 text-center">严林子涵</th>
                                            <th class="p-4 border-b border-r border-dark-border w-1/3 text-center">王欣阳</th>
                                            <th class="p-4 border-b border-dark-border w-1/3 text-center">余果</th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-dark-card divide-y divide-dark-border">
                                        <tr class="hover:bg-dark/50 transition">
                                            <td class="p-4 border-r border-dark-border text-center font-bold text-white bg-dark/30 whitespace-nowrap">论证阶段</td>
                                            <td class="p-4 border-r border-dark-border text-center">主导市场分析部分，设计并制定可持续的运营模式；</td>
                                            <td class="p-4 border-r border-dark-border text-center">明确用户画像，论证受众需要的“最小工作流”是否成立；</td>
                                            <td class="p-4 text-center">优化项目灵感，参与对用户画像、最小工作流的调整与精简；</td>
                                        </tr>
                                        <tr class="hover:bg-dark/50 transition">
                                            <td class="p-4 border-r border-dark-border text-center font-bold text-white bg-dark/30 whitespace-nowrap">立项阶段</td>
                                            <td class="p-4 border-r border-dark-border text-center">实际执行主题专家访谈，为项目提供权威视角的行业输入；</td>
                                            <td class="p-4 border-r border-dark-border text-center">确立产品核心概念，提出产品核心需求，主导财务分析，进一步协同优化用户建模与情景设计；</td>
                                            <td class="p-4 text-center">明确前端能够实现与无法实现的需求，据此优化展示细节、情景设计，整合项目文档；</td>
                                        </tr>
                                        <tr class="hover:bg-dark/50 transition">
                                            <td class="p-4 border-r border-dark-border text-center font-bold text-white bg-dark/30 whitespace-nowrap">开发阶段</td>
                                            <td class="p-4 border-r border-dark-border text-center">负责基础的用户建模及情景设计、迭代过程中的实际体验反馈、搭建真实的使用场景；</td>
                                            <td class="p-4 border-r border-dark-border text-center">主导视觉设计，从专业需求角度搭建初期的信息架构；</td>
                                            <td class="p-4 text-center">明确开发和迭代流程，将信息框架抽象为需求文档，对接并实现视觉设计，利用AI编程工具负责项目整体的网页前端开发；</td>
                                        </tr>
                                        <tr class="hover:bg-dark/50 transition">
                                            <td class="p-4 border-r border-dark-border text-center font-bold text-white bg-dark/30 whitespace-nowrap">迭代阶段</td>
                                            <td class="p-4 border-r border-dark-border text-center">推进信息框架落地、深化用户建模、情景设计及运营模式；从商业逻辑和用户场景的角度进行产品测试，并提出修改意见；</td>
                                            <td class="p-4 border-r border-dark-border text-center">统筹并制作项目所需的所有乐谱及音频素材；从视觉还原度、交互体验和功能实现的角度进行验收，并提出修改意见；</td>
                                            <td class="p-4 text-center">主导完成多轮迭代与返修，组织团队内部验收，根据实际使用体验进行产品迭代与测试，负责收集团队反馈，针对需求进行代码调试、bug修复与页面优化。</td>
                                        </tr>
                                        <tr class="hover:bg-dark/50 transition">
                                            <td class="p-4 border-r border-dark-border text-center font-bold text-white bg-dark/30 whitespace-nowrap">&nbsp;</td>
                                            <td class="p-4 border-r border-dark-border text-brand/90 text-center">负责各个阶段的时间安排和任务规划；负责梳理第一次汇报展示内容及PPT制作。</td>
                                            <td class="p-4 border-r border-dark-border text-brand/90 text-center">负责全部乐谱与音频资源的收集、提取与分离；负责梳理第一次汇报展示内容及PPT制作</td>
                                            <td class="p-4 text-brand/90 text-center">负责最终网页交互产品的呈现与交付，负责具体的产品汇报和产品功能介绍。</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 团队开发工作流协作说明 -->
                        <div class="pt-6">
                            <h3 class="text-lg font-bold text-white mb-4 border-b border-dark-border pb-2">团队开发工作流协作说明</h3>
                            <div class="bg-gradient-to-br from-dark to-dark-card p-6 rounded-xl border border-dark-border shadow-inner">
                                <p class="mb-4">团队共同讨论完成了项目创意、用户画像、最小工作流等论证部分；分工完成了商业、专业与用户等角度的可行性分析，严林子涵和王欣阳完成初步架构、设计图及音视频资源后，打包交接给余果进行产品文档的修改、整合。</p>
                                <p>余果利用AI工具产出初版网页，形成可视化 demo，团队成员共同展开内部测试，提出互动中不合设计或与使用逻辑不符的部分，形成了详细修改意见和优化建议，并在此过程中形成新的需求，通过不断迭代完善进行适配，经过数轮的紧密配合与打磨，最终完成高质量的产品交付。</p>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>

        </div>
    `,
    data() {
        return {
            showRoleDetails: false
        }
    }
};
