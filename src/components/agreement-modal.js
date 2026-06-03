const AgreementModal = {
    props: ['type'], // 'service' | 'privacy'
    data() {
        return {
            content: {
                service: {
                    title: '用户服务协议',
                    text: `
                        <h3 class="font-bold text-white mb-2">1. 服务条款确认</h3>
                        <p class="mb-4">欢迎使用声谱工坊（SoundScore AI）提供的服务。本协议是您与声谱工坊之间关于使用本平台服务所订立的协议。请您仔细阅读本协议，当您点击“同意”或实际使用本服务时，即表示您已阅读并接受本协议的全部约束。</p>
                        
                        <h3 class="font-bold text-white mb-2">2. 服务内容</h3>
                        <p class="mb-4">声谱工坊主要提供基于人工智能技术的音频音色分离与自动扒谱服务。我们保留随时变更、中断或终止部分或全部服务的权利。</p>
                        
                        <h3 class="font-bold text-white mb-2">3. 用户行为规范</h3>
                        <p class="mb-4">用户承诺上传的音频文件符合国家法律法规，不侵犯任何第三方的合法权益（包括但不限于著作权、肖像权、名誉权等）。用户仅可将处理后的结果用于个人学习、研究或欣赏，严禁用于任何商业谋利或非法用途。</p>
                        
                        <h3 class="font-bold text-white mb-2">4. 知识产权声明</h3>
                        <p class="mb-4">本平台提供的所有 AI 算法模型、界面设计、图文素材等均受版权法保护。用户不得擅自逆向工程、反编译或提取平台核心代码。</p>

                        <h3 class="font-bold text-white mb-2">5. 免责条款</h3>
                        <p class="mb-4">由于 AI 技术的局限性，我们无法保证分离结果和生成的乐谱达到 100% 的准确率。对于因使用本服务而产生的任何直接或间接损失，平台不承担赔偿责任。</p>
                    `
                },
                subscription: {
                    title: '订阅服务条款',
                    text: `
                        <h3 class="font-bold text-white mb-2">1. 订阅说明</h3>
                        <p class="mb-4">专业版 Pro 订阅服务是声谱工坊为您提供的高级音频处理与扒谱特权服务。订阅费用在您确认购买时通过您的支付账户扣除。</p>
                        
                        <h3 class="font-bold text-white mb-2">2. 自动续费</h3>
                        <p class="mb-4">若您选择包月或包年服务，您的订阅将在当前计费周期结束前 24 小时内自动续期并扣费，除非您在计费周期结束前至少 24 小时取消订阅。</p>
                        
                        <h3 class="font-bold text-white mb-2">3. 退款政策</h3>
                        <p class="mb-4">由于本平台提供的服务属于数字化商品，一经购买且服务已生效，通常情况下不支持退款。若因平台重大技术故障导致您无法正常使用服务，您可联系客服申请部分退款补偿。</p>
                        
                        <h3 class="font-bold text-white mb-2">4. 权限与限制</h3>
                        <p class="mb-4">Pro 会员专享的无限制音频处理、高精分轨导出等特权仅限订阅账号本人使用，严禁转借、合租或用于任何破坏平台公平性及安全性的自动化脚本行为。</p>
                    `
                },
                privacy: {
                    title: '隐私政策',
                    text: `
                        <h3 class="font-bold text-white mb-2">1. 信息收集</h3>
                        <p class="mb-4">为了向您提供基础的账号注册与登录服务，我们可能会收集您的用户名、邮箱地址、密码等必要信息。这些信息将经过加密处理并存储在您的本地浏览器（LocalStorage）中（在当前测试阶段）。</p>
                        
                        <h3 class="font-bold text-white mb-2">2. 音频数据处理</h3>
                        <p class="mb-4">当您使用“极速处理”或在“工作台”上传音频时，音频文件仅作为临时数据传输至我们的处理节点。<strong>我们承诺：所有上传的音频文件在 AI 分析完成后会被立即自动销毁，我们绝不会永久存储、分享或用于训练任何未授权的模型。</strong></p>
                        
                        <h3 class="font-bold text-white mb-2">3. 信息的保护</h3>
                        <p class="mb-4">我们将采取合理可行的安全防护措施保护您的个人信息，防止信息遭到未经授权的访问、公开披露、使用、修改、损坏或丢失。</p>
                        
                        <h3 class="font-bold text-white mb-2">4. 未成年人保护</h3>
                        <p class="mb-4">我们非常重视对未成年人个人信息的保护。如果您是未满18周岁的未成年人，应在监护人的陪同下阅读本政策并使用我们的服务。</p>
                    `
                }
            }
        }
    },
    template: `
        <div class="fixed inset-0 z-[110] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity">
            <div class="bg-dark-card border border-dark-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative animate-[fadeIn_0.3s_ease-out]">
                <!-- 头部 -->
                <div class="flex items-center justify-between p-6 border-b border-dark-border">
                    <h2 class="text-2xl font-bold text-white">{{ content[type].title }}</h2>
                    <button @click="$emit('close')" class="text-gray-400 hover:text-white transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-dark">
                        <i class="fa-solid fa-times text-xl"></i>
                    </button>
                </div>
                
                <!-- 内容区 -->
                <div class="p-6 overflow-y-auto flex-grow text-gray-400 text-sm leading-relaxed" v-html="content[type].text">
                </div>
                
                <!-- 底部 -->
                <div class="p-6 border-t border-dark-border bg-dark rounded-b-2xl flex justify-end">
                    <button @click="$emit('close')" class="px-6 py-2.5 bg-brand hover:bg-[#FF4B82] text-white font-bold rounded-xl transition shadow-lg">
                        我已阅读并知晓
                    </button>
                </div>
            </div>
        </div>
    `
};