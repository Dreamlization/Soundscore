const Workspace = {
    data() {
        return {
            store,
            aiProcessing: true,
            aiProgress: 0,
            aiInterval: null,
            
            // 混音台轨道数据
            tracks: [
                { id: 'vocal', name: '人声 Vocal', icon: 'fa-microphone', active: false, mute: false, solo: false, volume: 80, disabled: true },
                { id: 'drum', name: '鼓组 Drum', icon: 'fa-drum', active: false, mute: false, solo: false, volume: 90, disabled: false },
                { id: 'guitar', name: '吉他 Guitar', icon: 'fa-guitar', active: true, mute: false, solo: false, volume: 75, disabled: false },
                { id: 'bass', name: '贝斯 Bass', icon: 'fa-wave-square', active: false, mute: false, solo: false, volume: 85, disabled: false },
                { id: 'piano', name: '键盘 Piano', icon: 'fa-keyboard', active: false, mute: false, solo: false, volume: 70, disabled: false },
                { id: 'other', name: '其他 Other', icon: 'fa-music', active: false, mute: false, solo: false, volume: 60, disabled: false }
            ],
            
            // 当前音频信息
            audioInfo: {
                name: store.pendingAudio ? store.pendingAudio.name : 'Demo_RHCP_Cover.mp3',
                bpm: store.pendingAudio?.isTeaching ? 139 : (Math.floor(Math.random() * (180 - 100 + 1)) + 100),
                timeSignature: '4/4',
                duration: store.pendingAudio?.isTeaching ? 223 : 225, // 03:43 = 223 seconds, or fallback to 03:45
                src: store.pendingAudio?.src || null
            },
            
            // 真实音频播放器实例字典
            audioPlayers: {},
            
            // 播放器状态
            isPlaying: false,
            currentTime: 0,
            playbackRate: 1.0,
            showPlaybackRates: false,
            playInterval: null,
            isMuted: false,
            masterVolume: 80,

            // 编辑器状态
            currentMode: 'drag', // drag | remark | erase | add
            currentSymbol: null,
            simplifyChord: false,
            isRotated: false, // 控制放置的音符是否逆转 180°
            
            // 保存状态
            showSaveModal: false,
            saveProgress: 0,
            saveSuccess: false,
            saveInterval: null,
            
            // 导出弹窗
            showExportModal: false,
            exportFormat: 'pdf',
            exportTrack: 'all',
            
            // 分页与拖拽
            currentPage: 1,
            dragTarget: null,
            dragMeasureEl: null,

            // 撤销/重做栈
            historyStack: [],
            redoStack: [],

            // 曲谱数据 (38行，每行2个小节，每个小节3条辅助线)
            staveLines: Array.from({length: 38}, (_, lineIdx) => {
                return {
                    id: lineIdx,
                    measures: [
                        { id: lineIdx * 2, chord: this.getRandomChord(), notes: this.generateRandomNotes() },
                        { id: lineIdx * 2 + 1, chord: this.getRandomChord(), notes: this.generateRandomNotes() }
                    ]
                }
            })
        };
    },
    computed: {
        activeTrack() {
            return this.tracks.find(t => t.active);
        },
        formattedCurrentTime() {
            const m = Math.floor(this.currentTime / 60).toString().padStart(2, '0');
            const s = Math.floor(this.currentTime % 60).toString().padStart(2, '0');
            return `${m}:${s}`;
        },
        formattedDuration() {
            const m = Math.floor(this.audioInfo.duration / 60).toString().padStart(2, '0');
            const s = Math.floor(this.audioInfo.duration % 60).toString().padStart(2, '0');
            return `${m}:${s}`;
        },
        canSimplifyChord() {
            return this.activeTrack && (this.activeTrack.id === 'guitar' || this.activeTrack.id === 'piano');
        },
        // 计算播放进度指示块的行号和横向位置
        playbackPosition() {
            const timePerLine = this.audioInfo.duration / this.staveLines.length; // 每行代表的秒数
            
            if (this.currentTime >= this.audioInfo.duration) {
                return { lineIndex: this.staveLines.length - 1, percentage: 100 };
            }

            const currentLineIndex = Math.floor(this.currentTime / timePerLine);
            const timeInCurrentLine = this.currentTime % timePerLine;
            const percentage = (timeInCurrentLine / timePerLine) * 100;
            
            return {
                lineIndex: currentLineIndex,
                percentage: percentage
            };
        },
        currentPageLines() {
            if (this.currentPage === 1) {
                return this.staveLines.slice(0, 8);
            } else {
                const start = 8 + (this.currentPage - 2) * 10;
                return this.staveLines.slice(start, start + 10);
            }
        },
        totalPages() {
            const remaining = Math.max(0, this.staveLines.length - 8);
            return 1 + Math.ceil(remaining / 10);
        },
        signatureType() {
            // 计算项目名称长度对 3 取模的结果
            const nameLength = this.audioInfo.name ? this.audioInfo.name.length : 0;
            return nameLength % 3;
        }
    },
    methods: {
        // 初始化多轨音频
        initMultiTracks() {
            this.audioPlayers = {};
            const trackFiles = {
                vocal: 'public/audios/人声_01.mp3',
                drum: 'public/audios/鼓组_01.mp3',
                guitar: 'public/audios/吉他_01.mp3',
                bass: 'public/audios/贝斯_01.mp3',
                piano: 'public/audios/钢琴_01.mp3',
                other: 'public/audios/其他_01.mp3'
            };
            
            let maxDuration = 0;
            
            this.tracks.forEach(track => {
                const audioSrc = trackFiles[track.id] || this.audioInfo.src;
                if (!audioSrc) return;
                const audio = new Audio(audioSrc);
                audio.volume = this.calculateTrackVolume(track);
                
                audio.addEventListener('loadedmetadata', () => {
                    if (audio.duration > maxDuration) {
                        maxDuration = audio.duration;
                        this.audioInfo.duration = maxDuration;
                    }
                });
                
                this.audioPlayers[track.id] = audio;
            });
        },
        calculateTrackVolume(track) {
            if (this.isMuted || track.mute) return 0;
            const anySolo = this.tracks.some(t => t.solo);
            if (anySolo && !track.solo) return 0;
            return (track.volume / 100) * (this.masterVolume / 100);
        },
        updateAllVolumes() {
            this.tracks.forEach(track => {
                if (this.audioPlayers[track.id]) {
                    this.audioPlayers[track.id].volume = this.calculateTrackVolume(track);
                }
            });
        },
        saveHistory() {
            // 深拷贝当前谱面状态，压入历史栈
            const snapshot = JSON.stringify(this.staveLines);
            this.historyStack.push(snapshot);
            // 限制历史记录最多 50 步，防止内存占用过大
            if (this.historyStack.length > 50) {
                this.historyStack.shift();
            }
            // 一旦有新操作，清空重做栈
            this.redoStack = [];
        },
        undo() {
            if (this.historyStack.length === 0) return;
            // 保存当前状态到重做栈
            const currentState = JSON.stringify(this.staveLines);
            this.redoStack.push(currentState);
            
            // 弹出上一状态并恢复
            const previousState = this.historyStack.pop();
            this.staveLines = JSON.parse(previousState);
        },
        redo() {
            if (this.redoStack.length === 0) return;
            // 保存当前状态到历史栈
            const currentState = JSON.stringify(this.staveLines);
            this.historyStack.push(currentState);
            
            // 弹出重做状态并恢复
            const nextState = this.redoStack.pop();
            this.staveLines = JSON.parse(nextState);
        },
        isNote(symbol) {
            return ['𝅝', '𝅗𝅥', '𝅘𝅥', '𝅘𝅥𝅮', '𝅘𝅥𝅯', '𝅘𝅥𝅰'].includes(symbol);
        },
        generateRandomNotes(prevMeasureLastNoteY = 50) {
            // 1. 音符符号和其对应的长度权值 (1到6对应: 32, 16, 8, 4, 2, 1)
            const noteTypes = [
                { symbol: '𝅝', weight: 32 }, // 第1个
                { symbol: '𝅗𝅥', weight: 16 }, // 第2个
                { symbol: '𝅘𝅥', weight: 8 },  // 第3个
                { symbol: '𝅘𝅥𝅮', weight: 4 },  // 第4个
                { symbol: '𝅘𝅥𝅯', weight: 2 },  // 第5个
                { symbol: '𝅘𝅥𝅰', weight: 1 }   // 第6个
            ];

            const totalMeasureWeight = 96;
            let currentWeight = 0;
            const selectedNotes = [];
            let lastNoteIndex = -1;

            // 2. 按概率分布和总长96生成小节内音符序列
            while (currentWeight < totalMeasureWeight) {
                const remainingWeight = totalMeasureWeight - currentWeight;
                let candidate;
                
                // 筛选能放得下的候选音符
                const validCandidates = noteTypes.filter(n => n.weight <= remainingWeight);
                if (validCandidates.length === 0) break; // 理论上权值为1总能放下，以防万一

                // 概率分布：81% 第3个, 10% 第2个, 6% 第4个, 3% 第1个
                // 剩余概率为0，所以第5和第6个不参与随机生成（符合要求）
                const rand = Math.random();
                let typeIndex;
                if (rand < 0.81) typeIndex = 2; // 第3个 (8)
                else if (rand < 0.91) typeIndex = 1; // 第2个 (16)
                else if (rand < 0.97) typeIndex = 3; // 第4个 (4)
                else typeIndex = 0; // 第1个 (32)

                // 限制：第一个不会连续出现
                if (typeIndex === 0 && lastNoteIndex === 0) {
                    typeIndex = 2; // 强制换成概率最高的第3个
                }

                candidate = noteTypes[typeIndex];
                
                // 如果随机到的候选超出剩余容量，强制降级使用能放下的最大合法音符
                if (candidate.weight > remainingWeight) {
                    candidate = validCandidates[0]; // validCandidates 是按权值从大到小排列的
                    typeIndex = noteTypes.findIndex(n => n.symbol === candidate.symbol);
                }

                selectedNotes.push(candidate);
                currentWeight += candidate.weight;
                lastNoteIndex = typeIndex;
            }

            // 3. 计算位置 (水平与垂直)
            const result = [];
            let currentXWeight = 0;
            
            // 垂直方向边界设定 (假设0%是顶线，100%是底线，共9个位置，步长12.5%)
            // 顶线三格: -3 * 12.5 = -37.5%, 底线三格: 100 + 3 * 12.5 = 137.5%
            const stepSize = 12.5;
            const minY = -3 * stepSize;
            const maxY = 100 + 3 * stepSize;
            const middleY = 50;

            let currentY = prevMeasureLastNoteY;
            let currentTrendDir = 0; // 0: 平, 1: 升(Y减小), -1: 降(Y增加)
            let currentTrendCount = 0;

            for (let i = 0; i < selectedNotes.length; i++) {
                const note = selectedNotes[i];
                
                // --- 水平位置计算 ---
                // X 坐标基准：起始占位 + 当前累积权值占总长度的百分比
                // 根据需求：音符后排列下一个音符的水平距离要根据两个音符的赋值之和与完整小节长度之比决定
                // 这里用当前累积权值加自身权值一半的中心点计算 X (加上基础偏移避免贴紧边缘)
                let xPercent = 5 + (currentXWeight / totalMeasureWeight) * 90;
                
                // 特殊处理最后一个音符，如果正好排满，稍微向左一点避免超出右边界
                if (currentXWeight + note.weight >= totalMeasureWeight && i === selectedNotes.length - 1) {
                     xPercent = Math.min(xPercent, 95);
                }
                
                // --- 垂直跟随逻辑计算 ---
                if (i === 0) {
                    // 每当一个小节起头时，音符的位置相对上一小节末尾音符向中线方向移动 2 格
                    let moveDir = 0;
                    if (currentY > middleY) {
                        currentY -= 2 * stepSize;
                        moveDir = 1; // 升 (Y变小)
                        if (currentY < middleY) currentY = middleY; // 防止越过中线
                    } else if (currentY < middleY) {
                        currentY += 2 * stepSize;
                        moveDir = -1; // 降 (Y变大)
                        if (currentY > middleY) currentY = middleY;
                    }
                    
                    // 更新趋势状态
                    if (moveDir !== 0) {
                        if (currentTrendDir === moveDir) {
                            currentTrendCount++;
                        } else {
                            currentTrendDir = moveDir;
                            currentTrendCount = 1;
                        }
                    } else {
                        currentTrendDir = 0;
                        currentTrendCount = 0;
                    }
                } else {
                    // 非小节首位音符，按概率分布高差
                    // 20%概率为0，15%概率为+1，15%概率为-1，15%概率为+2，15%概率为-2，5%概率-3，5%概率+3，5%概率+4，5%概率-4
                    let r = Math.random();
                    let diffSteps = 0;
                    if (r < 0.20) diffSteps = 0;
                    else if (r < 0.35) diffSteps = 1;
                    else if (r < 0.50) diffSteps = -1;
                    else if (r < 0.65) diffSteps = 2;
                    else if (r < 0.80) diffSteps = -2;
                    else if (r < 0.85) diffSteps = -3;
                    else if (r < 0.90) diffSteps = 3;
                    else if (r < 0.95) diffSteps = 4;
                    else diffSteps = -4;

                    // 补充规则：不会出现连续超过3次的不升和不降 (即 diffSteps = 0 不能连续出现超过3次)
                    let candidateDir = 0;
                    if (diffSteps < 0) candidateDir = 1; // 升
                    else if (diffSteps > 0) candidateDir = -1; // 降
                    else candidateDir = 0; // 平
                    
                    // 如果持平趋势即将超过3次，强制改变高度
                    if (candidateDir === 0 && currentTrendDir === 0 && currentTrendCount >= 3) {
                        // 强制改变高度 (随机升降1格)
                        if (Math.random() < 0.5) {
                            diffSteps = 1;
                            candidateDir = -1;
                        } else {
                            diffSteps = -1;
                            candidateDir = 1;
                        }
                    }

                    // 更新趋势状态
                    if (candidateDir !== 0) {
                        if (currentTrendDir === candidateDir) {
                            currentTrendCount++;
                        } else {
                            currentTrendDir = candidateDir;
                            currentTrendCount = 1;
                        }
                    } else {
                        currentTrendDir = 0;
                        currentTrendCount = 0;
                    }

                    currentY += diffSteps * stepSize;
                }

                // 边界检测：当音符超过底线三格或顶线三格时自动回到底线/顶线位置
                if (currentY < minY) currentY = 0; // 回到顶线位置
                if (currentY > maxY) currentY = 100; // 回到底线位置

                result.push({
                    id: Date.now() + Math.random(),
                    x: xPercent,
                    y: currentY,
                    symbol: note.symbol,
                    weight: note.weight // 方便调试追踪
                });
                
                currentXWeight += note.weight;
            }

            return result;
        },
        getRandomChord(instrument) {
            const guitarChords = ['C', 'G', 'D', 'A', 'E', 'Em', 'Am', 'F', 'G7'];
            const keyboardChords = ['C', 'G', 'F', 'Am', 'Dm', 'Em', 'Cmaj7', 'G7', 'Fmaj7'];
            const pool = instrument === '吉他' ? guitarChords : keyboardChords;
            return pool[Math.floor(Math.random() * pool.length)];
        },
        calculateChordsForMeasure(measure, instrument) {
            // 根据小节内的音符数量（生成的 + 手动添加的）计算和弦数量
            const totalNotes = (measure.notes?.length || 0) + (measure.userNotes?.length || 0);
            const chordCount = Math.max(1, Math.floor(totalNotes / 3)); // 至少显示 1 个
            
            measure.chords = Array.from({length: chordCount}, () => this.getRandomChord(instrument));
        },
        switchTrack(trackId) {
            const target = this.tracks.find(t => t.id === trackId);
            if (target.disabled) {
                alert('该音轨功能暂未开放，无法选择');
                return;
            }
            this.tracks.forEach(t => t.active = false);
            target.active = true;
            // 重新生成曲谱数据
            this.staveLines.forEach(line => {
                line.measures.forEach(m => {
                    m.chord = this.getRandomChord();
                    m.notes = this.generateRandomNotes();
                });
            });
            // 关闭简化和弦
            if (!this.canSimplifyChord) {
                this.simplifyChord = false;
            }
        },
        toggleMuteTrack(track) {
            track.mute = !track.mute;
            if (track.mute) {
                track.solo = false;
            }
            this.updateAllVolumes();
        },
        toggleSolo(track) {
            track.solo = !track.solo;
            if (track.solo) {
                track.mute = false;
                this.tracks.forEach(t => {
                    if (t.id !== track.id) {
                        t.mute = true;
                        t.solo = false;
                    }
                });
            } else {
                this.tracks.forEach(t => t.mute = false);
            }
            this.updateAllVolumes();
        },
        handleTrackVolumeInput(track, event) {
            track.volume = parseInt(event.target.value);
            this.updateAllVolumes();
        },
        setMode(mode) {
            if (this.simplifyChord && (mode === 'add' || mode === 'erase' || mode === 'rotate')) {
                return; // 简化和弦模式下锁定编辑
            }
            
            // 如果在 add 和 rotate 之间切换，保留当前选中的符号
            if ((this.currentMode === 'add' || this.currentMode === 'rotate') && (mode === 'add' || mode === 'rotate')) {
                this.currentMode = mode;
            } else {
                this.currentMode = mode;
                this.currentSymbol = null;
            }
        },
        selectSymbol(symbol) {
            if (this.simplifyChord) return;
            
            // 如果在逆转模式下点击当前已选中的同一个符号，则退出逆转模式，回到正常添加模式
            if (this.currentMode === 'rotate' && this.currentSymbol === symbol) {
                this.currentMode = 'add';
            } else if (this.currentMode !== 'rotate') {
                this.currentMode = 'add';
            }
            
            this.currentSymbol = symbol;
        },
        toggleSimplify() {
            if (!this.canSimplifyChord) return;
            this.simplifyChord = !this.simplifyChord;
            
            if (this.simplifyChord) {
                // 进入简化模式时，实时计算每个小节的和弦
                this.staveLines.forEach(line => {
                    line.measures.forEach(m => {
                        this.calculateChordsForMeasure(m, this.activeTrack.name.split(' ')[0]);
                    });
                });
                
                if (this.currentMode === 'add' || this.currentMode === 'erase') {
                    this.currentMode = 'drag';
                }
            }
        },
        handleMeasureClick(event, measure) {
            if (this.simplifyChord) return;
            
            const rect = event.currentTarget.getBoundingClientRect();
            let x = ((event.clientX - rect.left) / rect.width) * 100;
            let y = ((event.clientY - rect.top) / rect.height) * 100;
            
            if (this.currentMode === 'remark') {
                // 在五线谱上方点击添加备注 (只允许点击上半部分)
                if (y < 50) {
                    this.saveHistory();
                    if (!measure.remarks) measure.remarks = [];
                    measure.remarks.push({ id: Date.now(), x, text: '', show: true });
                }
            } else if ((this.currentMode === 'add' || this.currentMode === 'rotate') && this.currentSymbol) {
                this.saveHistory();
                // 吸附逻辑
                // 水平：不再强制吸附，保留鼠标点击处的 X 坐标
                x = Math.max(5, Math.min(95, x)); // 仅避免超出边界太远
                
                // 垂直：吸附到线或间 (5条线 + 4个间 = 9个位置)
                const ySteps = 8;
                const yStepSize = 100 / ySteps;
                y = Math.round(y / yStepSize) * yStepSize;
                
                if (!measure.userNotes) measure.userNotes = [];
                measure.userNotes.push({ id: Date.now(), x, y, symbol: this.currentSymbol, isRotated: this.currentMode === 'rotate' });
            }
        },
        removeRemark(measure, rIdx) {
            this.saveHistory();
            measure.remarks.splice(rIdx, 1);
        },
        removeUserNote(measure, nIdx) {
            if (this.currentMode === 'erase') {
                this.saveHistory();
                measure.userNotes.splice(nIdx, 1);
            }
        },
        removeSysNote(measure, nIdx) {
            if (this.currentMode === 'erase') {
                this.saveHistory();
                measure.notes.splice(nIdx, 1);
            }
        },
        getCursorStyle() {
            if ((this.currentMode === 'add' || this.currentMode === 'rotate') && this.currentSymbol) {
                // 使用自定义 SVG 作为鼠标指针
                const isNoteType = this.isNote(this.currentSymbol);
                const fontSize = isNoteType ? '48px' : '32px';
                const yOffset = isNoteType ? '48' : '32';
                
                // 处理光标图标的逆转
                const transform = this.currentMode === 'rotate' ? 'transform="rotate(180 32 32)"' : '';
                
                const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><text x="32" y="${yOffset}" font-family="'Bravura', 'Noto Music', 'Apple Symbols', 'Segoe UI Symbol', 'Symbola', serif, sans-serif" font-size="${fontSize}" fill="rgba(255,42,109,0.5)" text-anchor="middle" ${transform}>${this.currentSymbol}</text></svg>`;
                const encodedSvg = encodeURIComponent(svg.trim());
                return `url('data:image/svg+xml;utf8,${encodedSvg}') 32 32, crosshair`;
            }
            if (this.currentMode === 'drag') return 'grab';
            if (this.currentMode === 'remark') return 'text';
            if (this.currentMode === 'erase') return 'crosshair';
            return 'default';
        },
        startDrag(event, type, measure, item) {
            if (this.currentMode !== 'drag') return;
            this.saveHistory();
            this.dragTarget = { type, measure, item };
            this.dragMeasureEl = event.currentTarget.closest('.group');
            document.addEventListener('mousemove', this.handleDragMove);
            document.addEventListener('mouseup', this.stopDrag);
            event.preventDefault();
        },
        handleDragMove(event) {
            if (!this.dragTarget || !this.dragMeasureEl) return;
            const rect = this.dragMeasureEl.getBoundingClientRect();
            let x = ((event.clientX - rect.left) / rect.width) * 100;
            let y = ((event.clientY - rect.top) / rect.height) * 100;
            
            x = Math.max(5, Math.min(95, x));
            
            if (this.dragTarget.type === 'remark') {
                y = Math.min(y, 49); // 备注吸附在顶部
            } else {
                const ySteps = 8;
                const yStepSize = 100 / ySteps;
                y = Math.round(y / yStepSize) * yStepSize;
            }
            
            this.dragTarget.item.x = x;
            if (this.dragTarget.type !== 'remark') {
                this.dragTarget.item.y = y;
            }
        },
        stopDrag() {
            this.dragTarget = null;
            this.dragMeasureEl = null;
            document.removeEventListener('mousemove', this.handleDragMove);
            document.removeEventListener('mouseup', this.stopDrag);
        },
        // 播放控制
        togglePlay() {
            if (this.isPlaying) {
                this.pausePlayback();
            } else {
                this.startPlayback();
            }
        },
        startPlayback() {
            this.isPlaying = true;
            
            const players = Object.values(this.audioPlayers);
            if (players.length > 0) {
                // 多轨音频播放逻辑
                players.forEach(player => {
                    player.playbackRate = this.playbackRate;
                    player.play().catch(e => {
                        console.error("音频播放失败", e);
                        this.isPlaying = false;
                    });
                });
                
                this.playInterval = setInterval(() => {
                    const referencePlayer = players[0];
                    if (referencePlayer) {
                        this.currentTime = referencePlayer.currentTime;
                        if (this.currentTime >= this.audioInfo.duration) {
                            this.pausePlayback();
                            this.currentTime = this.audioInfo.duration;
                        } else {
                            // 自动翻页逻辑
                            const timePerLine = this.audioInfo.duration / this.staveLines.length;
                            const currentLineIndex = Math.floor(this.currentTime / timePerLine);
                            let targetPage = 1;
                            if (currentLineIndex >= 8) {
                                targetPage = 2 + Math.floor((currentLineIndex - 8) / 10);
                            }
                            if (this.currentPage !== targetPage && targetPage <= this.totalPages) {
                                this.currentPage = targetPage;
                            }
                        }
                    }
                }, 50); // 更高频率同步
            } else {
                // 模拟进度条播放逻辑
                this.playInterval = setInterval(() => {
                    if (this.currentTime >= this.audioInfo.duration) {
                        this.pausePlayback();
                        this.currentTime = this.audioInfo.duration;
                    } else {
                        this.currentTime += 0.1 * this.playbackRate; // 100ms * playbackRate
                        
                        // 自动翻页逻辑
                        const timePerLine = this.audioInfo.duration / this.staveLines.length;
                        const currentLineIndex = Math.floor(this.currentTime / timePerLine);
                        let targetPage = 1;
                        if (currentLineIndex >= 8) {
                            targetPage = 2 + Math.floor((currentLineIndex - 8) / 10);
                        }
                        if (this.currentPage !== targetPage && targetPage <= this.totalPages) {
                            this.currentPage = targetPage;
                        }
                    }
                }, 100);
            }
        },
        pausePlayback() {
            this.isPlaying = false;
            clearInterval(this.playInterval);
            Object.values(this.audioPlayers).forEach(player => player.pause());
        },
        seek(seconds) {
            this.currentTime = Math.max(0, Math.min(this.currentTime + seconds, this.audioInfo.duration));
            Object.values(this.audioPlayers).forEach(player => player.currentTime = this.currentTime);
        },
        handleSeek(event) {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const percentage = x / rect.width;
            this.currentTime = percentage * this.audioInfo.duration;
            Object.values(this.audioPlayers).forEach(player => player.currentTime = this.currentTime);
        },
        setPlaybackRate(rate) {
            this.playbackRate = rate;
            this.showPlaybackRates = false;
            Object.values(this.audioPlayers).forEach(player => player.playbackRate = rate);
        },
        togglePlaybackRates() {
            this.showPlaybackRates = !this.showPlaybackRates;
        },
        toggleMute() {
            this.isMuted = !this.isMuted;
            this.updateAllVolumes();
        },
        handleMasterVolumeInput(event) {
            const val = parseInt(event.target.value);
            this.masterVolume = val;
            this.isMuted = val === 0;
            this.updateAllVolumes();
        },
        saveProject() {
            this.showSaveModal = true;
            this.saveProgress = 0;
            this.saveSuccess = false;
            
            // 模拟 2 秒保存进度
            const totalTime = 2000;
            const updateInterval = 50;
            const step = (100 * updateInterval) / totalTime;
            
            this.saveInterval = setInterval(() => {
                this.saveProgress += step;
                if (this.saveProgress >= 100) {
                    this.saveProgress = 100;
                    this.saveSuccess = true;
                    clearInterval(this.saveInterval);
                    
                    // 保存成功后停留 1.5 秒自动关闭
                    setTimeout(() => {
                        this.showSaveModal = false;
                    }, 1500);
                }
            }, updateInterval);
        },
        handleExportClick(format) {
            if ((format === 'midi' || format === 'gp' || format === 'mscz') && !store.user?.isPro) {
                store.showUpgradeModal = true;
                return;
            }
            this.exportFormat = format;
        },
        startAiProcessing() {
            this.aiProgress = 0;
            this.aiProcessing = true;
            this.aiInterval = setInterval(() => {
                this.aiProgress += Math.floor(Math.random() * 10) + 2;
                if (this.aiProgress >= 100) {
                    this.aiProgress = 100;
                    clearInterval(this.aiInterval);
                    setTimeout(() => {
                        this.aiProcessing = false;
                        if (store.autoOpenExport) {
                            this.showExportModal = true;
                            store.autoOpenExport = false;
                        }
                        store.pendingAudio = null; // 清除临时音频
                    }, 800);
                }
            }, 200);
        },
        executeFunExport() {
            this.showExportModal = false;
            
            const link = document.createElement('a');
            
            // 根据导出的轨道选择真实的 PDF 文件路径
            let pdfFile = '输出.pdf'; // 默认 fallback
            const effectiveTrack = this.exportTrack === 'vocal' ? 'all' : this.exportTrack;
            switch (effectiveTrack) {
                case 'all':
                    pdfFile = '真昼月明总谱.pdf';
                    break;
                case 'guitar':
                    pdfFile = '吉他谱.pdf';
                    break;
                case 'bass':
                    pdfFile = '贝斯谱.pdf';
                    break;
                case 'drum':
                    pdfFile = '鼓谱.pdf';
                    break;
                case 'piano':
                    pdfFile = '键盘谱.pdf';
                    break;
                case 'other':
                    pdfFile = '其他声谱.pdf';
                    break;
            }
            
            link.href = `public/docs/${pdfFile}`;
            
            const formatExt = this.exportFormat === 'mscz' ? 'musicxml' : this.exportFormat;
            const trackName = effectiveTrack === 'all' ? 'FullScore' : effectiveTrack;
            
            // 为了避免在同一标签页直接跳转，强制使用新标签页打开，同时设置 download 属性以提示浏览器下载
            link.target = '_blank';
            link.download = `${this.audioInfo.name}_${trackName}_Pro_Export.${formatExt}`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    },
    mounted() {
        if (!store.isLoggedIn) {
            this.$emit('require-login', 'home');
            return;
        }
        
        // 初始化多轨音频对象
        this.initMultiTracks();
        
        this.startAiProcessing();
    },
    beforeUnmount() {
        clearInterval(this.aiInterval);
        clearInterval(this.playInterval);
        Object.values(this.audioPlayers).forEach(player => player.pause());
        this.audioPlayers = {};
    },
    template: `
        <div class="flex-grow flex flex-col h-screen overflow-hidden bg-dark">
            
            <!-- AI 处理过渡态 -->
            <div v-if="aiProcessing" class="absolute inset-0 z-[60] bg-[#121212] flex flex-col items-center justify-center">
                <div class="relative w-32 h-32 mb-8">
                    <!-- 波纹动效 -->
                    <div class="absolute inset-0 rounded-full border border-brand/50 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                    <div class="absolute inset-0 rounded-full border border-brand/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] delay-75"></div>
                    <div class="absolute inset-0 rounded-full bg-brand/20 flex items-center justify-center">
                        <i class="fa-solid fa-microchip text-4xl text-brand text-glow"></i>
                    </div>
                </div>
                <h2 class="text-2xl font-bold mb-4 text-glow">AI 正在努力解析音频中，请稍候...</h2>
                <div class="w-64 bg-dark-card border border-dark-border rounded-full h-2 overflow-hidden mb-8 shadow-[0_0_15px_rgba(255,42,109,0.3)]">
                    <div class="bg-brand h-2 rounded-full transition-all duration-200" :style="{ width: aiProgress + '%' }"></div>
                </div>
                <p class="text-brand font-bold text-lg mb-6">{{ aiProgress }}%</p>
            </div>

            <!-- 全局导航栏 (工作台专属) -->
            <header class="w-full h-14 bg-dark-card border-b border-dark-border flex items-center justify-between px-4 z-40 shrink-0">
                <div class="flex items-center space-x-6">
                    <div class="flex items-center space-x-2 cursor-pointer group" @click="$emit('navigate', 'home')">
                        <img src="public/images/ui/logo_white.png" alt="声谱工坊 Logo" class="h-14 object-contain group-hover:scale-105 transition-transform duration-300">
                    </div>
                    <div class="w-px h-4 bg-gray-700"></div>
                    <div class="text-sm font-bold text-gray-300 flex items-center">
                        <i class="fa-solid fa-music mr-2 text-brand"></i>
                        {{ audioInfo.name }}
                    </div>
                </div>
                
                <div class="flex items-center space-x-6 text-xs font-bold text-gray-400">
                    <div class="flex items-center"><i class="fa-regular fa-clock mr-1"></i> 时长: {{ formattedDuration }}</div>
                    <div class="flex items-center"><i class="fa-solid fa-bolt mr-1"></i> BPM: {{ audioInfo.bpm }}</div>
                    <div class="flex items-center"><i class="fa-solid fa-layer-group mr-1"></i> 拍号: {{ audioInfo.timeSignature }}</div>
                </div>
                
                <div class="flex items-center space-x-4">
                    <button @click="$emit('navigate', 'projects')" class="text-sm text-gray-400 hover:text-white transition"><i class="fa-regular fa-folder-open mr-1"></i> 我的项目</button>
                    <div class="w-7 h-7 rounded-full border border-dark-border overflow-hidden cursor-pointer hover:border-brand transition" @click="$emit('navigate', 'profile')">
                        <img :src="store.user?.avatar" alt="User" class="w-full h-full object-cover">
                    </div>
                </div>
            </header>

            <!-- 工具栏 -->
            <div class="w-full h-12 bg-[#1A1A1A] border-b border-dark-border flex items-center justify-between px-4 z-30 shrink-0">
                <!-- 左侧：模式选择 -->
                <div class="flex space-x-2">
                    <button @click="setMode('drag')" :class="['w-8 h-8 rounded flex items-center justify-center transition', currentMode === 'drag' ? 'bg-brand text-white' : 'text-gray-400 hover:bg-dark hover:text-white']" title="拖动模式">
                        <i class="fa-solid fa-hand"></i>
                    </button>
                    <button @click="setMode('remark')" :class="['w-8 h-8 rounded flex items-center justify-center transition', currentMode === 'remark' ? 'bg-brand text-white' : 'text-gray-400 hover:bg-dark hover:text-white']" title="备注模式">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button @click="setMode('erase')" :class="['w-8 h-8 rounded flex items-center justify-center transition', currentMode === 'erase' ? 'bg-brand text-white' : 'text-gray-400 hover:bg-dark hover:text-white', simplifyChord ? 'opacity-50 cursor-not-allowed' : '']" title="擦除模式">
                        <i class="fa-solid fa-eraser"></i>
                    </button>
                    <!-- 逆转模式 -->
                    <button @click="setMode('rotate')" :class="['w-8 h-8 rounded flex items-center justify-center transition', currentMode === 'rotate' ? 'bg-brand text-white' : 'text-gray-400 hover:bg-dark hover:text-white', simplifyChord ? 'opacity-50 cursor-not-allowed' : '']" title="逆转模式">
                        <i class="fa-solid fa-right-left -rotate-45"></i>
                    </button>
                </div>
                
                <!-- 中间：乐理符号库 -->
                <div class="flex items-center space-x-1 bg-dark px-2 py-1 rounded-lg border border-dark-border overflow-x-auto" :class="simplifyChord ? 'opacity-50 pointer-events-none' : ''">
                    <!-- 6种音符 -->
                    <button v-for="note in ['𝅝', '𝅗𝅥', '𝅘𝅥', '𝅘𝅥𝅮', '𝅘𝅥𝅯', '𝅘𝅥𝅰']" :key="note"
                            @click="selectSymbol(note)"
                            :class="['w-7 h-7 rounded flex items-center justify-center transition text-xl font-music leading-none', currentSymbol === note ? 'bg-gray-700 text-brand shadow-inner' : 'text-gray-400 hover:bg-gray-800']"
                            title="添加音符">
                        <span class="-mt-1">{{ note }}</span>
                    </button>
                    <div class="w-px h-4 bg-gray-700 mx-2"></div>
                    <!-- 9种符号 -->
                    <button v-for="sym in ['♯', '♭', '♮', '𝄾', '𝄐', '·', '⁀', '>', '𝄇']" :key="sym"
                            @click="selectSymbol(sym)"
                            :class="['w-7 h-7 rounded flex items-center justify-center transition text-lg font-music leading-none', currentSymbol === sym ? 'bg-gray-700 text-brand shadow-inner' : 'text-gray-400 hover:bg-gray-800']"
                            title="添加符号">
                        <span class="-mt-1">{{ sym }}</span>
                    </button>
                </div>

                <!-- 右侧：高级操作 -->
                <div class="flex items-center space-x-3">
                    <!-- 撤销重做按钮 -->
                    <div class="flex items-center space-x-1 mr-4 border-r border-dark-border pr-4">
                        <button @click="undo" :disabled="historyStack.length === 0" :class="['w-8 h-8 rounded flex items-center justify-center transition', historyStack.length === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:bg-dark hover:text-white']" title="撤销 (Undo)">
                            <i class="fa-solid fa-rotate-left"></i>
                        </button>
                        <button @click="redo" :disabled="redoStack.length === 0" :class="['w-8 h-8 rounded flex items-center justify-center transition', redoStack.length === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:bg-dark hover:text-white']" title="恢复 (Redo)">
                            <i class="fa-solid fa-rotate-right"></i>
                        </button>
                    </div>

                    <div class="flex items-center space-x-2 mr-2">
                        <span class="text-xs font-bold" :class="canSimplifyChord ? 'text-gray-300' : 'text-gray-600'">一键简化和弦</span>
                        <div @click="toggleSimplify" :class="['w-10 h-5 rounded-full relative cursor-pointer transition-colors', !canSimplifyChord ? 'bg-gray-800 cursor-not-allowed' : simplifyChord ? 'bg-brand' : 'bg-gray-600']">
                            <div :class="['absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform', simplifyChord ? 'transform translate-x-5' : '']"></div>
                        </div>
                    </div>
                    <button @click="saveProject" class="px-3 py-1.5 bg-dark border border-dark-border rounded text-xs font-bold hover:border-brand transition">保存项目</button>
                    <button @click="showExportModal = true" class="px-3 py-1.5 bg-brand text-white rounded text-xs font-bold hover:bg-[#FF4B82] transition shadow-[0_0_10px_rgba(255,42,109,0.3)]">导出 MIDI/PDF</button>
                </div>
            </div>

            <!-- 主体区域：混音台 + 谱面 -->
            <div class="flex-grow flex overflow-hidden">
                <!-- 左侧智能混音台 -->
                <div class="w-64 bg-dark-card border-r border-dark-border flex flex-col shrink-0 overflow-y-auto relative z-20">
                    <div class="px-4 py-5 min-h-16 flex items-center border-b border-dark-border bg-dark/50 sticky top-0 z-[100] backdrop-blur">
                        <h3 class="text-sm font-bold text-gray-300">独立乐器音轨</h3>
                    </div>
                    <div class="p-2 space-y-1">
                        <div v-for="track in tracks" :key="track.id" 
                             :class="['p-3 rounded-xl border transition-all relative z-0 group overflow-hidden', track.active ? 'bg-dark border-brand shadow-[inset_4px_0_0_#FF2A6D]' : 'bg-transparent border-transparent hover:bg-dark-border', track.disabled ? 'opacity-50 cursor-not-allowed' : '']">
                            
                            <!-- 点击提取乐谱的热区 (最底层 z-0) -->
                            <div class="absolute inset-0 cursor-pointer z-0" @click="switchTrack(track.id)"></div>
                            
                            <!-- 文字与图标层 (z-10) -->
                            <div class="flex items-center space-x-2 mb-2 relative z-10 pointer-events-none">
                                <div :class="['w-6 h-6 rounded flex items-center justify-center text-xs', track.active ? 'bg-brand/20 text-brand' : 'bg-gray-800 text-gray-400']">
                                    <i :class="['fa-solid', track.icon]"></i>
                                </div>
                                <span :class="['text-sm font-bold', track.active ? 'text-white' : 'text-gray-400']">{{ track.name }}</span>
                            </div>
                            
                            <!-- MS及导出 控制按钮 (最上层 z-[60]，绝对定位在右上角) -->
                            <div class="absolute top-3 right-3 flex space-x-1 pointer-events-auto z-[60]">
                                <button @click="toggleMuteTrack(track)" :class="['w-6 h-6 rounded text-xs font-bold transition', track.mute ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-dark-card text-gray-500 hover:text-white border border-dark-border']">M</button>
                                <button @click="toggleSolo(track)" :class="['w-6 h-6 rounded text-xs font-bold transition', track.solo ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : 'bg-dark-card text-gray-500 hover:text-white border border-dark-border']">S</button>
                            </div>
                            
                            <!-- 悬浮提取按钮蒙层 (倒数第二层 z-20，盖在文字上但低于操作按钮，不透明度 50%) -->
                            <div v-if="!track.disabled" class="absolute inset-0 bg-brand/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer z-20" @click="switchTrack(track.id)">
                                <span class="text-white font-bold text-sm shadow-sm pointer-events-none"><i class="fa-solid fa-file-waveform mr-1"></i> 提取该轨乐谱</span>
                            </div>
                            
                            <!-- 音量条 (最上层 z-[60]) -->
                            <div class="flex items-center space-x-2 relative z-[60] mt-4">
                                <i class="fa-solid fa-volume-low text-[10px] text-gray-500 pointer-events-none"></i>
                                <div class="w-full relative h-1.5 flex items-center">
                                    <div class="absolute left-0 h-full bg-gray-500 rounded-full pointer-events-none" :style="{ width: track.volume + '%' }"></div>
                                    <input type="range" min="0" max="100" :value="track.volume" @input="handleTrackVolumeInput(track, $event)" class="w-full h-1.5 bg-gray-800 rounded-full appearance-none cursor-pointer accent-gray-400 pointer-events-auto relative z-10 bg-transparent">
                                </div>
                                <span class="text-[10px] text-gray-500 w-6 text-right pointer-events-none">{{ track.volume }}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 中心谱面区 (A4 风格) -->
                <div class="flex-grow bg-[#E5E5E5] relative overflow-auto p-4 md:p-8" :style="{ cursor: getCursorStyle() }" :class="currentMode === 'drag' ? 'active:cursor-grabbing' : ''">
                    
                    <!-- 左翻页 -->
                    <button v-if="currentPage > 1" @click="currentPage--" class="fixed left-[300px] top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/10 hover:bg-black/30 rounded-full flex items-center justify-center text-gray-700 hover:text-black z-50 transition backdrop-blur-sm shadow-md">
                        <i class="fa-solid fa-chevron-left text-2xl"></i>
                    </button>
                    <!-- 右翻页 -->
                    <button v-if="currentPage < totalPages" @click="currentPage++" class="fixed right-8 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/10 hover:bg-black/30 rounded-full flex items-center justify-center text-gray-700 hover:text-black z-50 transition backdrop-blur-sm shadow-md">
                        <i class="fa-solid fa-chevron-right text-2xl"></i>
                    </button>

                    <!-- 固定页数标记 -->
                    <div class="fixed bottom-24 right-8 bg-dark-card border border-dark-border text-white px-4 py-1.5 rounded-full z-50 text-sm font-mono shadow-lg flex items-center space-x-2">
                        <span>Page</span>
                        <span class="text-brand font-bold">{{ currentPage }}</span>
                        <span>/</span>
                        <span>{{ totalPages }}</span>
                    </div>

                    <div class="max-w-4xl mx-auto bg-white min-h-full shadow-2xl pb-20 relative">
                        
                        <!-- 谱面头部信息 (仅第一页显示) -->
                        <div v-if="currentPage === 1" class="text-center pt-12 pb-6 text-black border-b-2 border-gray-300 mx-8 mb-8">
                            <h1 class="text-3xl font-serif font-bold mb-2">{{ audioInfo.name }}</h1>
                            <div class="flex justify-between px-4 text-sm font-serif font-bold text-gray-700 mt-4">
                                <span>{{ activeTrack?.name.split(' ')[0] || '乐谱' }} {{ audioInfo.timeSignature }}</span>
                                <span>BPM = {{ audioInfo.bpm }}</span>
                            </div>
                        </div>
                        <div v-else class="h-16"></div>

                        <!-- 紧凑多行五线谱容器 -->
                        <div class="px-8 pt-8 space-y-10 relative z-10">
                            <!-- 每行乐谱 -->
                            <div v-for="line in currentPageLines" :key="line.id" class="w-full relative">
                                
                                <!-- 播放进度指示块 (与当前行匹配时显示) -->
                                <div v-if="playbackPosition.lineIndex === line.id" 
                                     class="absolute top-[-10px] bottom-[-10px] bg-brand/30 w-6 z-0 rounded transition-all duration-75"
                                     :style="{ left: playbackPosition.percentage + '%' }">
                                </div>

                                <!-- 小节和弦标记层 (仅在不开启一键简化时保留占位空间) -->
                                <div class="h-6 mb-2"></div>

                                <!-- 五线谱本体结构 -->
                                <div class="relative w-full h-20 border-l-2 border-r-2 border-black flex z-10">
                                    
                                    <!-- 5条水平黑线 -->
                                    <div class="absolute inset-0 flex flex-col justify-between py-0">
                                        <div v-for="i in 5" class="w-full border-b border-black"></div>
                                    </div>
                                    
                                    <!-- 谱号 (动态高音或低音) -->
                                    <div class="absolute left-1 top-0 bottom-0 flex items-center justify-center pointer-events-none z-20 text-[4rem] text-black font-music opacity-80 workspace-clef">
                                        {{ audioInfo.name.length % 2 === 1 ? '𝄞' : '𝄢' }}
                                        
                                        <!-- 动态追加的符号 (基于名称长度取模计算) -->
                                        <div v-if="signatureType === 1" class="absolute left-full top-1/4 -ml-4 -mt-6 text-3xl font-music font-bold text-black opacity-80 workspace-signature">
                                            <div class="leading-none">♭</div>
                                            <div class="leading-none ml-2 mt-1">♭</div>
                                        </div>
                                        <div v-else-if="signatureType === 2" class="absolute left-full top-1/4 -ml-4 -mt-6 text-3xl font-music font-bold text-black opacity-80 workspace-signature">
                                            <div class="leading-none">♭</div>
                                        </div>
                                    </div>

                                    <!-- 小节容器 (每行 2 个小节，黑实线分割) -->
                                    <div v-for="(measure, mIdx) in line.measures" :key="measure.id" 
                                         class="flex-1 relative cursor-pointer group"
                                         :class="mIdx === 0 ? 'border-r-2 border-black ml-12' : ''"
                                         @click="handleMeasureClick($event, measure)">
                                         
                                        <!-- 小节内的 3 条灰色辅助线 (四等分) -->
                                        <div class="absolute inset-0 flex justify-evenly pointer-events-none">
                                            <div v-for="i in 3" :key="i" class="h-full border-r border-dashed border-gray-400 opacity-50"></div>
                                        </div>

                                        <!-- 乐理符号占位区 (模拟生成的音符) -->
                                        <div class="absolute inset-0 pointer-events-none" :class="simplifyChord ? 'opacity-50' : 'opacity-100'">
                                            <!-- 原本的占位音符 -->
                                            <div v-for="(note, nIdx) in measure.notes" :key="'orig_'+note.id"
                                                 :class="['absolute font-music text-black select-none transition-transform', currentMode === 'erase' ? 'hover:text-red-500 hover:scale-125 pointer-events-auto cursor-pointer' : currentMode === 'drag' ? 'pointer-events-auto hover:text-brand' : 'pointer-events-none', isNote(note.symbol) ? 'text-[3.5rem]' : 'text-3xl']"
                                                 :style="{ left: note.x + '%', top: note.y + '%', transform: 'translate(-50%, -50%) ' + (note.isRotated ? 'rotate(180deg)' : '') }"
                                                 @click.stop="removeSysNote(measure, nIdx)"
                                                 @mousedown.stop="startDrag($event, 'note', measure, note)">
                                                 {{ note.symbol }}
                                            </div>
                                            
                                            <!-- 用户手动添加的音符 -->
                                            <div v-if="measure.userNotes">
                                                <div v-for="(uNote, unIdx) in measure.userNotes" :key="uNote.id"
                                                     :class="['absolute font-music text-black select-none transition-transform', currentMode === 'erase' ? 'hover:text-red-500 hover:scale-125 pointer-events-auto cursor-pointer' : currentMode === 'drag' ? 'pointer-events-auto hover:text-brand' : 'pointer-events-none', isNote(uNote.symbol) ? 'text-[3.5rem]' : 'text-3xl']"
                                                     :style="{ left: uNote.x + '%', top: uNote.y + '%', transform: 'translate(-50%, -50%) ' + (uNote.isRotated ? 'rotate(180deg)' : '') }"
                                                     @click.stop="removeUserNote(measure, unIdx)"
                                                     @mousedown.stop="startDrag($event, 'userNote', measure, uNote)">
                                                     {{ uNote.symbol }}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- 简化和弦时的标记群 -->
                                        <div v-if="simplifyChord" class="absolute inset-0 pointer-events-none flex justify-evenly items-center px-4">
                                            <div v-for="(chord, cIdx) in measure.chords" :key="'chord_'+cIdx" class="text-3xl font-serif text-brand font-bold bg-white/80 px-2 rounded backdrop-blur-sm z-20 shadow-sm border border-brand/20">
                                                {{ chord }}
                                            </div>
                                        </div>

                                        <!-- 用户备注层 -->
                                        <div v-if="measure.remarks && !simplifyChord" class="absolute inset-0 pointer-events-none">
                                            <div v-for="(remark, rIdx) in measure.remarks" :key="remark.id"
                                                 class="absolute pointer-events-auto z-30 flex flex-col items-center justify-end"
                                                 :style="{ left: remark.x + '%', top: '0', transform: 'translate(-50%, -100%)' }">
                                                 
                                                 <!-- 文本框或文本显示 (在书签上方，贴近标记) -->
                                                 <div v-if="remark.show" class="mb-0.5 flex items-center justify-center">
                                                     <input v-if="currentMode === 'remark'" type="text" v-model="remark.text" class="bg-white/90 border border-gray-300 rounded px-1 text-black text-xs outline-none w-20 font-bold font-serif text-center shadow-sm" placeholder="输入备注..." @click.stop @mousedown.stop>
                                                     <span v-else class="text-black text-xs font-bold px-1 whitespace-nowrap font-serif">{{ remark.text || '空备注' }}</span>
                                                     <button v-if="currentMode === 'remark'" @click.stop="removeRemark(measure, rIdx)" class="text-red-500 ml-1 hover:text-red-700" @mousedown.stop><i class="fa-solid fa-times text-[10px]"></i></button>
                                                 </div>
                                                 
                                                 <!-- 书签标记点 (倒置五边形，尖端向下吸附在线上) -->
                                                 <div @click.stop="currentMode !== 'remark' ? remark.show = !remark.show : null" 
                                                      @mousedown.stop="startDrag($event, 'remark', measure, remark)"
                                                      class="w-3 h-4 bg-brand cursor-pointer shadow-sm hover:bg-[#FF4B82] transition-colors workspace-remark-bg" 
                                                      title="备注标记"></div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- 底部页码标记 (白纸区域内) -->
                        <div class="absolute bottom-8 left-0 right-0 text-center text-gray-500 font-serif font-bold text-lg tracking-widest opacity-80">
                            - {{ currentPage }} -
                        </div>
                    </div>
                </div>
            </div>

            <!-- 底部播放控制区 -->
            <div class="w-full h-20 bg-dark-card border-t border-dark-border flex items-center px-6 z-30 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                <!-- 基础控制 -->
                <div class="flex items-center space-x-4 w-1/4">
                    <button @click="seek(-10)" class="w-10 h-10 rounded-full bg-dark border border-dark-border flex items-center justify-center text-gray-400 hover:text-brand hover:border-brand transition" title="快退 10s">
                        <i class="fa-solid fa-backward-fast"></i>
                    </button>
                    <button @click="togglePlay" class="w-14 h-14 rounded-full bg-brand flex items-center justify-center text-white hover:bg-[#FF4B82] transition shadow-[0_0_15px_rgba(255,42,109,0.4)]">
                        <i :class="['fa-solid text-xl', isPlaying ? 'fa-pause' : 'fa-play ml-1']"></i>
                    </button>
                    <button @click="seek(10)" class="w-10 h-10 rounded-full bg-dark border border-dark-border flex items-center justify-center text-gray-400 hover:text-brand hover:border-brand transition" title="快进 10s">
                        <i class="fa-solid fa-forward-fast"></i>
                    </button>
                </div>
                
                <!-- 全局时间轴 -->
                <div class="flex-grow flex items-center space-x-4 px-6">
                    <span class="text-xs font-bold text-gray-400 w-10 text-right font-mono">{{ formattedCurrentTime }}</span>
                    <div class="flex-grow h-2 bg-dark rounded-full cursor-pointer relative border border-dark-border group" @click="handleSeek">
                        <div class="absolute top-0 left-0 h-full bg-brand rounded-full pointer-events-none" :style="{ width: (currentTime / audioInfo.duration * 100) + '%' }"></div>
                        <!-- 滑块块 -->
                        <div class="absolute top-1/2 transform -translate-y-1/2 -ml-2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,42,109,0.8)] opacity-0 group-hover:opacity-100 transition-all pointer-events-none" :style="{ left: (currentTime / audioInfo.duration * 100) + '%' }"></div>
                    </div>
                    <span class="text-xs font-bold text-gray-400 w-10 font-mono">{{ formattedDuration }}</span>
                </div>
                
                <!-- 播放倍速与其他 -->
                <div class="w-1/4 flex justify-end items-center space-x-4">
                    <div class="relative">
                        <button @click="togglePlaybackRates" class="text-xs font-bold text-gray-400 hover:text-white transition w-10 text-center bg-dark-card border border-dark-border rounded py-1 relative z-10">{{ playbackRate }}x</button>
                        
                        <!-- 弹出倍速选项 -->
                        <transition name="fade">
                            <div v-if="showPlaybackRates" class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-dark-card border border-dark-border rounded-lg shadow-xl overflow-hidden z-50 py-1">
                                <button v-for="rate in [0.5, 0.75, 1.0, 1.25, 1.5, 2.0]" :key="rate" 
                                        @click="setPlaybackRate(rate)" 
                                        :class="['block w-full px-4 py-1.5 text-xs font-bold transition hover:bg-dark', playbackRate === rate ? 'text-brand' : 'text-gray-400 hover:text-white']">
                                    {{ rate }}x
                                </button>
                            </div>
                        </transition>
                    </div>
                    <button @click="toggleMute" :class="['transition relative z-10', isMuted ? 'text-brand drop-shadow-[0_0_8px_rgba(255,42,109,0.8)]' : 'text-gray-400 hover:text-white']">
                        <i :class="['fa-solid', isMuted ? 'fa-volume-xmark' : 'fa-volume-high']"></i>
                    </button>
                    <div class="w-24 flex items-center relative h-1.5">
                        <div class="absolute left-0 h-full bg-gray-500 rounded-full pointer-events-none" :style="{ width: (isMuted ? 0 : masterVolume) + '%' }"></div>
                        <input type="range" 
                               min="0" max="100" 
                               :value="isMuted ? 0 : masterVolume"
                               @input="handleMasterVolumeInput"
                               class="w-full h-1.5 bg-dark-card rounded-full appearance-none cursor-pointer accent-gray-400 relative z-10 bg-transparent">
                    </div>
                </div>
            </div>

            <!-- 保存进度弹窗 -->
            <transition name="fade">
                <div v-if="showSaveModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
                    <div class="bg-dark-card border border-dark-border rounded-2xl w-full max-w-sm p-8 shadow-2xl text-center">
                        <div v-if="!saveSuccess">
                            <i class="fa-solid fa-cloud-arrow-up text-4xl text-brand mb-4 animate-bounce"></i>
                            <h3 class="text-xl font-bold text-white mb-4">正在保存项目...</h3>
                            <div class="w-full bg-dark border border-dark-border rounded-full h-2 overflow-hidden mb-2">
                                <div class="bg-brand h-2 rounded-full transition-all duration-75" :style="{ width: saveProgress + '%' }"></div>
                            </div>
                            <p class="text-sm text-gray-400">{{ Math.floor(saveProgress) }}%</p>
                        </div>
                        <div v-else>
                            <i class="fa-solid fa-circle-check text-5xl text-green-500 mb-4"></i>
                            <h3 class="text-xl font-bold text-white mb-2">保存成功</h3>
                            <p class="text-sm text-gray-400">已同步至云端</p>
                        </div>
                    </div>
                </div>
            </transition>

            <!-- 导出配置弹窗 -->
            <transition name="fade">
                <div v-if="showExportModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
                    <div class="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
                        <button @click="showExportModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-white transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-dark">
                            <i class="fa-solid fa-times text-xl"></i>
                        </button>
                        
                        <h2 class="text-2xl font-bold mb-6 text-white">导出配置</h2>
                        
                        <div class="space-y-6">
                            <!-- 格式选择 -->
                            <div>
                                <label class="block text-sm font-bold text-gray-400 mb-3">格式选择</label>
                                <div class="grid grid-cols-2 gap-3">
                                    <div @click="handleExportClick('pdf')" :class="['border rounded-xl p-3 cursor-pointer transition', exportFormat === 'pdf' ? 'border-brand bg-brand/10' : 'border-dark-border bg-dark hover:border-gray-500']">
                                        <div class="font-bold text-white mb-1">PDF 乐谱</div>
                                        <div class="text-xs text-gray-500">基础阅览格式</div>
                                    </div>
                                    <div @click="handleExportClick('midi')" :class="['border rounded-xl p-3 cursor-pointer transition relative overflow-hidden', exportFormat === 'midi' ? 'border-brand bg-brand/10' : 'border-dark-border bg-dark hover:border-gray-500']">
                                        <div class="absolute top-0 right-0 bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg">Pro</div>
                                        <div class="font-bold text-white mb-1">MIDI 文件</div>
                                        <div class="text-xs text-gray-500">支持导入 DAW</div>
                                    </div>
                                    <div @click="handleExportClick('gp')" :class="['border rounded-xl p-3 cursor-pointer transition relative overflow-hidden', exportFormat === 'gp' ? 'border-brand bg-brand/10' : 'border-dark-border bg-dark hover:border-gray-500']">
                                        <div class="absolute top-0 right-0 bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg">Pro</div>
                                        <div class="font-bold text-white mb-1">Guitar Pro</div>
                                        <div class="text-xs text-gray-500">.gp 格式文件</div>
                                    </div>
                                    <div @click="handleExportClick('mscz')" :class="['border rounded-xl p-3 cursor-pointer transition relative overflow-hidden', exportFormat === 'mscz' ? 'border-brand bg-brand/10' : 'border-dark-border bg-dark hover:border-gray-500']">
                                        <div class="absolute top-0 right-0 bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg">Pro</div>
                                        <div class="font-bold text-white mb-1">MusicXML</div>
                                        <div class="text-xs text-gray-500">通用打谱格式</div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 导出范围 -->
                            <div>
                                <label class="block text-sm font-bold text-gray-400 mb-3">导出范围</label>
                                <select v-model="exportTrack" class="w-full bg-dark border border-dark-border rounded-lg py-3 px-4 text-sm text-white focus:border-brand transition outline-none">
                                    <option value="all">总谱 (所有可见音轨)</option>
                                    <option value="guitar">仅 吉他 Guitar</option>
                                    <option value="bass">仅 贝斯 Bass</option>
                                    <option value="drum">仅 鼓组 Drum</option>
                                    <option value="piano">仅 键盘 Piano</option>
                                    <option value="other">仅 其他 Other</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="mt-8 flex space-x-4">
                            <button @click="showExportModal = false" class="flex-1 bg-dark border border-dark-border text-white py-4 rounded-xl hover:bg-gray-800 transition font-bold text-lg">取消</button>
                            <button @click="executeFunExport" class="flex-1 bg-brand text-white py-4 rounded-xl hover:bg-[#FF4B82] transition shadow-[0_0_20px_rgba(255,42,109,0.4)] font-bold text-lg">确认导出</button>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    `
};
