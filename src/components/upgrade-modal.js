const UpgradeModal = {
    template: `
        <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity">
            <div class="bg-dark-card border border-dark-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-[fadeIn_0.3s_ease-out]">
                <!-- 关闭按钮 -->
                <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-white transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 z-10">
                    <i class="fa-solid fa-times text-xl"></i>
                </button>

                <div class="p-8">
                    <div class="text-center mb-8">
                        <div class="w-16 h-16 bg-brand/10 border border-brand/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fa-solid fa-crown text-3xl text-brand text-glow"></i>
                        </div>
                        <h2 class="text-3xl font-bold mb-2">解锁更多创作可能</h2>
                        <p class="text-gray-400">选择适合您的订阅计划，体验无限长音频分离与高精扒谱。</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- 基础版 / 免费版 (对比用) -->
                        <div class="border border-dark-border bg-dark rounded-xl p-6 flex flex-col relative overflow-hidden">
                            <div class="absolute top-0 left-0 w-full h-1 bg-gray-500"></div>
                            <h3 class="text-xl font-bold mb-1">基础版</h3>
                            <div class="text-3xl font-extrabold mb-4">免费</div>
                            <ul class="space-y-3 mb-8 flex-grow">
                                <li class="flex items-center text-sm text-gray-300">
                                    <i class="fa-solid fa-check text-gray-500 mr-2"></i> 支持最高 3 分钟音频处理
                                </li>
                                <li class="flex items-center text-sm text-gray-300">
                                    <i class="fa-solid fa-check text-gray-500 mr-2"></i> 基础人声与伴奏分离
                                </li>
                                <li class="flex items-center text-sm text-gray-300">
                                    <i class="fa-solid fa-check text-gray-500 mr-2"></i> MIDI 预览（带水印）
                                </li>
                                <li class="flex items-center text-sm text-gray-300">
                                    <i class="fa-solid fa-check text-gray-500 mr-2"></i> 每月 10 次处理额度
                                </li>
                            </ul>
                            <button class="w-full py-3 rounded-lg border border-dark-border text-gray-400 cursor-not-allowed text-sm font-bold">
                                当前计划
                            </button>
                        </div>

                        <!-- Pro版 -->
                        <div class="border border-brand bg-dark rounded-xl p-6 flex flex-col relative overflow-hidden shadow-[0_0_20px_rgba(255,42,109,0.15)] transform md:scale-105 z-10">
                            <div class="absolute top-0 left-0 w-full h-1 bg-brand"></div>
                            <div class="absolute top-4 right-4 bg-brand text-white text-xs font-bold px-2 py-1 rounded">推荐</div>
                            
                            <h3 class="text-xl font-bold mb-1 text-brand">专业版 Pro</h3>
                            <div class="text-3xl font-extrabold mb-4">¥ 39 <span class="text-base font-normal text-gray-400">/ 月</span></div>
                            
                            <ul class="space-y-3 mb-8 flex-grow">
                                <li class="flex items-center text-sm text-gray-200">
                                    <i class="fa-solid fa-check text-brand mr-2"></i> <span class="font-bold text-white">无限长</span> 音频处理
                                </li>
                                <li class="flex items-center text-sm text-gray-200">
                                    <i class="fa-solid fa-check text-brand mr-2"></i> 5轨高精分离 (人声/鼓/贝斯/键盘/其他)
                                </li>
                                <li class="flex items-center text-sm text-gray-200">
                                    <i class="fa-solid fa-check text-brand mr-2"></i> 无限制高清 MIDI/MusicXML 导出
                                </li>
                                <li class="flex items-center text-sm text-gray-200">
                                    <i class="fa-solid fa-check text-brand mr-2"></i> 智能和弦与曲谱分析
                                </li>
                                <li class="flex items-center text-sm text-gray-200">
                                    <i class="fa-solid fa-check text-brand mr-2"></i> 优先云端处理队列
                                </li>
                            </ul>
                            
                            <button @click="handleUpgrade" class="w-full py-3 rounded-lg bg-brand hover:bg-[#FF4B82] text-white font-bold transition shadow-lg text-sm pink-breathing">
                                立即升级
                            </button>
                        </div>
                    </div>

                    <div class="mt-8 text-center text-xs text-gray-500">
                        <p>升级即代表您同意我们的 <a href="#" @click.prevent="openSubscriptionAgreement" class="text-brand hover:underline">订阅服务条款</a>。</p>
                        <p class="mt-1">购买后支持随时取消订阅，当前周期结束后不再扣费。</p>
                    </div>
                </div>

                <!-- 扫码支付覆盖层 -->
                <div v-if="showPayment" class="absolute inset-0 bg-dark-card flex flex-col items-center justify-center z-50 animate-[fadeIn_0.2s_ease-out] rounded-2xl">
                    <div class="mb-6 flex flex-col items-center">
                        <h3 class="text-2xl font-bold text-center mb-2">扫码支付升级</h3>
                        <div class="bg-white p-4 rounded-xl inline-block mx-auto mb-3">
                            <!-- 收款二维码 -->
                            <img src="public/images/ui/payment.jpg" alt="支付二维码" class="w-40 h-40 object-cover">
                        </div>
                        <p class="text-gray-300 font-bold text-center text-base">请使用 <span class="text-[#1677FF]">支付宝</span> 扫码支付</p>
                    </div>
                    
                    <div class="flex items-center space-x-2 text-brand font-bold animate-pulse mb-6">
                        <i class="fa-solid fa-spinner fa-spin"></i>
                        <span>等待支付结果中...</span>
                    </div>

                    <button @click="cancelPayment" class="px-6 py-2 rounded border border-dark-border text-gray-400 hover:text-white hover:bg-dark transition text-sm">
                        取消支付
                    </button>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            showPayment: false,
            paymentTimer: null
        }
    },
    methods: {
        openSubscriptionAgreement() {
            store.agreementType = 'subscription';
            store.showAgreementModal = true;
        },
        handleUpgrade() {
            if (!store.isLoggedIn) {
                this.$emit('close');
                store.showLoginModal = true;
                return;
            }
            
            // 展示支付二维码覆盖层
            this.showPayment = true;

            // 模拟 5 秒后支付成功并升级的逻辑
            this.paymentTimer = setTimeout(() => {
                this.showPayment = false;
                store.upgradeToPro();
                alert("支付成功！您的账号已升级为 专业版 Pro。");
                this.$emit('close');
            }, 5000);
        },
        cancelPayment() {
            if (this.paymentTimer) {
                clearTimeout(this.paymentTimer);
                this.paymentTimer = null;
            }
            this.showPayment = false;
        }
    }
};