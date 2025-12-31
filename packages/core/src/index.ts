
export type NoiseType = 'white' | 'pink' | 'brown';

export class AudioEngine {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private analyzer: AnalyserNode | null = null;
    private fadeGain: GainNode | null = null;

    // 8D & Lo-Fi Effects Nodes
    private panner: StereoPannerNode | null = null;
    private lofiFilter: BiquadFilterNode | null = null;
    private vinylSource: AudioBufferSourceNode | null = null;
    private vinylGain: GainNode | null = null;
    private vinylBuffer: AudioBuffer | null = null;

    // New Effects Nodes
    private echoDelay: DelayNode | null = null;
    private echoFeedback: GainNode | null = null;
    private echoGain: GainNode | null = null;
    private reverbNode: ConvolverNode | null = null;
    private reverbGain: GainNode | null = null;
    private distortionNode: WaveShaperNode | null = null;

    private crackleIntensity: number = 0.2;
    private popIntensity: number = 0.3;

    // Noise components
    private noiseSource: AudioBufferSourceNode | null = null;
    private noiseGain: GainNode | null = null;
    private buffers: Record<NoiseType, AudioBuffer | null> = {
        white: null,
        pink: null,
        brown: null,
    };

    // Tone components
    private carrierOsc: OscillatorNode | null = null;
    private lfoOsc: OscillatorNode | null = null;
    private leftOsc: OscillatorNode | null = null;
    private rightOsc: OscillatorNode | null = null;
    private merger: ChannelMergerNode | null = null;
    private toneGain: GainNode | null = null;
    private toneModulator: GainNode | null = null;

    private eightDTick: number = 0;

    constructor() { }

    public getContext(): AudioContext {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.fadeGain = this.ctx.createGain();
            this.analyzer = this.ctx.createAnalyser();
            this.panner = this.ctx.createStereoPanner();
            this.lofiFilter = this.ctx.createBiquadFilter();
            this.lofiFilter.type = 'lowpass';
            this.lofiFilter.frequency.value = 20000;

            this.echoDelay = this.ctx.createDelay(1.0);
            this.echoDelay.delayTime.value = 0.4;
            this.echoFeedback = this.ctx.createGain();
            this.echoFeedback.gain.value = 0.3;
            this.echoGain = this.ctx.createGain();
            this.echoGain.gain.value = 0;

            this.echoDelay.connect(this.echoFeedback);
            this.echoFeedback.connect(this.echoDelay);
            this.echoDelay.connect(this.echoGain);

            this.reverbNode = this.ctx.createConvolver();
            this.generateReverbIR();
            this.reverbGain = this.ctx.createGain();
            this.reverbGain.gain.value = 0;
            this.reverbNode.connect(this.reverbGain);

            this.distortionNode = this.ctx.createWaveShaper();
            this.distortionNode.curve = this.makeDistortionCurve(0);
            this.distortionNode.oversample = '4x';

            this.analyzer.fftSize = 256;

            this.fadeGain.connect(this.distortionNode);
            this.distortionNode.connect(this.echoDelay);
            this.distortionNode.connect(this.reverbNode);
            this.distortionNode.connect(this.lofiFilter);
            this.echoGain.connect(this.lofiFilter);
            this.reverbGain.connect(this.lofiFilter);
            this.lofiFilter.connect(this.panner);
            this.panner.connect(this.masterGain);
            this.masterGain.connect(this.analyzer);
            this.analyzer.connect(this.ctx.destination);

            this.generateBuffers();
            this.start8DAnimation();
        }
        return this.ctx;
    }

    public getAnalyzer() { return this.analyzer; }

    private generateBuffers() {
        if (!this.ctx) return;
        const sampleRate = this.ctx.sampleRate;
        const duration = 5;
        const length = duration * sampleRate;

        const noiseGenerators = {
            white: () => Math.random() * 2 - 1,
            pink: (() => {
                let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
                return () => {
                    const white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    const out = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
                    b6 = white * 0.115926;
                    return out;
                };
            })(),
            brown: (() => {
                let lastOut = 0.0;
                return () => {
                    const white = Math.random() * 2 - 1;
                    const out = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = out;
                    return out * 3.5;
                };
            })()
        };

        (['white', 'pink', 'brown'] as NoiseType[]).forEach(type => {
            const buffer = this.ctx!.createBuffer(2, length, sampleRate);
            for (let c = 0; c < 2; c++) {
                const data = buffer.getChannelData(c);
                const gen = noiseGenerators[type];
                for (let i = 0; i < length; i++) data[i] = gen();
            }
            this.buffers[type] = buffer;
        });

        this.vinylBuffer = this.ctx.createBuffer(1, length, sampleRate);
        const vData = this.vinylBuffer.getChannelData(0);
        for (let i = 0; i < length; i++) {
            let sample = (Math.random() * 2 - 1) * (0.002 + this.crackleIntensity * 0.01);
            if (Math.random() > (1.0 - this.popIntensity * 0.0005)) {
                sample += (Math.random() * 2 - 1) * (0.1 + this.popIntensity * 0.4);
            }
            vData[i] = sample;
        }
    }

    private start8DAnimation() {
        const loop = () => {
            if (this.ctx && this.panner) {
                let speedFactor = 0.005;
                if (this.analyzer) {
                    const data = new Uint8Array(this.analyzer.frequencyBinCount);
                    this.analyzer.getByteFrequencyData(data);
                    const average = data.reduce((a, b) => a + b) / data.length;
                    speedFactor = 0.002 + (average / 255) * 0.015;
                }
                this.eightDTick += speedFactor;
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    private generateReverbIR() {
        if (!this.ctx || !this.reverbNode) return;
        const length = this.ctx.sampleRate * 2.5;
        const impulse = this.ctx.createBuffer(2, length, this.ctx.sampleRate);
        for (let i = 0; i < 2; i++) {
            const channelData = impulse.getChannelData(i);
            for (let j = 0; j < length; j++) {
                channelData[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, 2);
            }
        }
        this.reverbNode.buffer = impulse;
    }

    private makeDistortionCurve(amount: number) {
        const k = amount * 100;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }
        return curve;
    }

    public setEchoVolume(vol: number) {
        if (this.echoGain && this.ctx) this.echoGain.gain.setTargetAtTime(vol * 0.6, this.ctx.currentTime, 0.1);
    }

    public setReverbVolume(vol: number) {
        if (this.reverbGain && this.ctx) this.reverbGain.gain.setTargetAtTime(vol * 0.5, this.ctx.currentTime, 0.1);
    }

    public setDistortionAmount(amount: number) {
        if (this.distortionNode && this.ctx) this.distortionNode.curve = this.makeDistortionCurve(amount);
    }

    public setLofiPopIntensity(intensity: number) {
        this.popIntensity = intensity;
        if (this.ctx && this.vinylSource) {
            this.generateBuffers();
            const currentVol = this.vinylGain ? this.vinylGain.gain.value : 0.2;
            this.startVinyl(currentVol);
        }
    }

    public set8DActive(active: boolean, speed?: number) {
        if (!this.ctx || !this.panner) return;
        if (active) {
            const panUpdate = () => {
                if (!active) return;
                this.panner!.pan.setTargetAtTime(Math.sin(this.eightDTick), this.ctx!.currentTime, 0.1);
                requestAnimationFrame(panUpdate);
            };
            panUpdate();
        } else {
            this.panner.pan.setTargetAtTime(0, this.ctx.currentTime, 0.2);
        }
    }

    public toggle8D(active: boolean, speed?: number) {
        this.set8DActive(active, speed);
    }

    public setLofiActive(active: boolean, crackleVol: number = 0.2) {
        if (!this.ctx || !this.lofiFilter) return;
        this.crackleIntensity = crackleVol;
        if (active) {
            this.lofiFilter.frequency.setTargetAtTime(2500, this.ctx.currentTime, 0.5);
            this.startVinyl(crackleVol);
        } else {
            this.lofiFilter.frequency.setTargetAtTime(20000, this.ctx.currentTime, 0.5);
            this.stopVinyl();
        }
    }

    public setLoFi(active: boolean, vol?: number) {
        this.setLofiActive(active, vol);
    }

    public setLofiCrackleVolume(vol: number) {
        this.crackleIntensity = vol;
        if (this.vinylGain && this.ctx) this.vinylGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
    }

    private startVinyl(vol: number) {
        if (!this.ctx || !this.vinylBuffer) return;
        this.stopVinyl();
        this.vinylSource = this.ctx.createBufferSource();
        this.vinylSource.buffer = this.vinylBuffer;
        this.vinylSource.loop = true;
        this.vinylGain = this.ctx.createGain();
        this.vinylGain.gain.value = vol;
        this.vinylSource.connect(this.vinylGain);
        this.vinylGain.connect(this.masterGain!);
        this.vinylSource.start();
    }

    private stopVinyl() {
        if (this.vinylSource) {
            try { this.vinylSource.stop(); } catch (e) { }
            this.vinylSource.disconnect();
            this.vinylSource = null;
        }
    }

    public stopAll() {
        this.stopNoise();
        this.stopTone();
        this.stopVinyl();
        if (this.ctx) this.masterGain?.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }

    public setMasterVolume(vol: number, muted: boolean = false) {
        if (this.masterGain && this.ctx) {
            const targetVol = muted ? 0 : vol;
            this.masterGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.1);
        }
    }

    public startNoise(type: NoiseType, vol: number = 0.5) {
        this.stopNoise();
        const ctx = this.getContext();
        const buffer = this.buffers[type];
        if (!buffer) return;
        this.noiseSource = ctx.createBufferSource();
        this.noiseSource.buffer = buffer;
        this.noiseSource.loop = true;
        this.noiseGain = ctx.createGain();
        this.noiseGain.gain.value = vol;
        this.noiseSource.connect(this.noiseGain);
        this.noiseGain.connect(this.fadeGain!);
        this.noiseSource.start();
    }

    public stopNoise() {
        if (this.noiseSource) {
            try { this.noiseSource.stop(); } catch (e) { }
            this.noiseSource.disconnect();
            this.noiseSource = null;
        }
    }

    public setNoiseVolume(vol: number) {
        if (this.noiseGain && this.ctx) this.noiseGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
    }

    public startTone(freq: number, vol: number, type: 'isochronic' | 'binaural' = 'isochronic') {
        this.stopTone();
        const ctx = this.getContext();
        this.toneGain = ctx.createGain();
        this.toneGain.gain.value = vol * 0.4;

        if (type === 'isochronic') {
            this.carrierOsc = ctx.createOscillator();
            this.carrierOsc.frequency.value = 200;
            this.lfoOsc = ctx.createOscillator();
            this.lfoOsc.type = 'square';
            this.lfoOsc.frequency.value = freq;
            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 0.5;
            this.toneModulator = ctx.createGain();
            this.toneModulator.gain.value = 0.5;
            this.lfoOsc.connect(lfoGain);
            lfoGain.connect(this.toneModulator.gain);
            this.carrierOsc.connect(this.toneModulator);
            this.toneModulator.connect(this.toneGain);
            this.carrierOsc.start();
            this.lfoOsc.start();
        } else {
            const carrier = 200;
            this.leftOsc = ctx.createOscillator();
            this.leftOsc.frequency.value = carrier - (freq / 2);
            this.rightOsc = ctx.createOscillator();
            this.rightOsc.frequency.value = carrier + (freq / 2);
            this.merger = ctx.createChannelMerger(2);
            this.leftOsc.connect(this.merger, 0, 0);
            this.rightOsc.connect(this.merger, 0, 1);
            this.merger.connect(this.toneGain);
            this.leftOsc.start();
            this.rightOsc.start();
        }
        this.toneGain.connect(this.fadeGain!);
    }

    public stopTone() {
        [this.carrierOsc, this.lfoOsc, this.leftOsc, this.rightOsc].forEach(osc => {
            if (osc) {
                try { osc.stop(); } catch (e) { }
                osc.disconnect();
            }
        });
        this.carrierOsc = this.lfoOsc = this.leftOsc = this.rightOsc = null;
        if (this.merger) this.merger.disconnect();
        this.merger = null;
    }

    public setToneFrequency(hz: number, type: 'isochronic' | 'binaural' = 'isochronic') {
        if (!this.ctx) return;
        if (type === 'isochronic' && this.lfoOsc) {
            this.lfoOsc.frequency.setTargetAtTime(hz, this.ctx.currentTime, 0.1);
        } else if (type === 'binaural' && this.leftOsc && this.rightOsc) {
            const carrier = 200;
            this.leftOsc.frequency.setTargetAtTime(carrier - (hz / 2), this.ctx.currentTime, 0.1);
            this.rightOsc.frequency.setTargetAtTime(carrier + (hz / 2), this.ctx.currentTime, 0.1);
        }
    }

    public setToneVolume(vol: number) {
        if (this.toneGain && this.ctx) this.toneGain.gain.setTargetAtTime(vol * 0.4, this.ctx.currentTime, 0.1);
    }

    public resume() {
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    }

    public async exportAsWav(
        type: NoiseType,
        noiseVolume: number,
        toneFrequency: number,
        toneVolume: number,
        duration: number,
        toneType: 'isochronic' | 'binaural'
    ): Promise<Blob> {
        const offlineCtx = new OfflineAudioContext(2, duration * 44100, 44100);
        const noiseBuffer = this.buffers[type];
        if (noiseBuffer) {
            const s = offlineCtx.createBufferSource();
            s.buffer = noiseBuffer;
            s.loop = true;
            const g = offlineCtx.createGain();
            g.gain.value = noiseVolume;
            s.connect(g);
            g.connect(offlineCtx.destination);
            s.start();
        }
        if (toneVolume > 0) {
            const tg = offlineCtx.createGain();
            tg.gain.value = toneVolume * 0.4;
            if (toneType === 'isochronic') {
                const c = offlineCtx.createOscillator(); c.frequency.value = 200;
                const l = offlineCtx.createOscillator(); l.frequency.value = toneFrequency; l.type = 'square';
                const lg = offlineCtx.createGain(); lg.gain.value = 0.5;
                const m = offlineCtx.createGain(); m.gain.value = 0.5;
                l.connect(lg); lg.connect(m.gain); c.connect(m); m.connect(tg);
                c.start(); l.start();
            } else {
                const lo = offlineCtx.createOscillator(); lo.frequency.value = 200 - (toneFrequency / 2);
                const ro = offlineCtx.createOscillator(); ro.frequency.value = 200 + (toneFrequency / 2);
                const merge = offlineCtx.createChannelMerger(2);
                lo.connect(merge, 0, 0); ro.connect(merge, 0, 1); merge.connect(tg);
                lo.start(); ro.start();
            }
            tg.connect(offlineCtx.destination);
        }
        const rendered = await offlineCtx.startRendering();
        return this.bufferToWav(rendered);
    }

    private bufferToWav(buffer: AudioBuffer): Blob {
        const numChannels = 2;
        const sampleRate = 44100;
        const blockAlign = 4;
        const dataLength = buffer.length * blockAlign;
        const bufferLength = 44 + dataLength;
        const arrayBuffer = new ArrayBuffer(bufferLength);
        const view = new DataView(arrayBuffer);
        const writeString = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
        writeString(0, 'RIFF'); view.setUint32(4, bufferLength - 8, true);
        writeString(8, 'WAVE'); writeString(12, 'fmt ');
        view.setUint32(16, 16, true); view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true); view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true); view.setUint16(32, blockAlign, true);
        view.setUint16(34, 16, true); writeString(36, 'data'); view.setUint32(40, dataLength, true);
        let offset = 44;
        for (let i = 0; i < buffer.length; i++) {
            for (let channel = 0; channel < numChannels; channel++) {
                const s = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
                view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                offset += 2;
            }
        }
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }
}

export const audioEngine = new AudioEngine();
