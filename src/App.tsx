import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  Settings, 
  Layers, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Box, 
  FileText, 
  Trash2, 
  Maximize2, 
  Download, 
  Plus, 
  X, 
  Check, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  Cpu, 
  Zap, 
  Eye, 
  EyeOff, 
  Loader2,
  Menu,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  History,
  Info,
  Terminal,
  Activity,
  User,
  ShieldCheck,
  Globe,
  Compass,
  Palette,
  Mic,
  MicOff,
  Camera,
  CameraOff
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { generateText, generateImage, editImage, generateSpeech, genAI } from './lib/gemini';
import { Asset, SystemSettings, Message } from './types';

// --- Components ---

const Chatterbot = ({ 
  messages, 
  onSendMessage, 
  isProcessing, 
  settings, 
  onUpdateSettings 
}: { 
  messages: Message[], 
  onSendMessage: (text: string) => void, 
  isProcessing: boolean,
  settings: SystemSettings,
  onUpdateSettings: (s: Partial<SystemSettings>) => void
}) => {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 flex flex-col transition-all duration-500 ease-in-out",
      isOpen ? "w-[400px] h-[600px]" : "w-14 h-14"
    )}>
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div 
            key="chat-window"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="flex flex-col h-full glass-dark rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center border border-brand-500/30">
                    <Bot className="w-6 h-6 text-brand-400" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Omni Assistant</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Neural Link Active</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
            >
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-brand-600 text-white rounded-tr-none" 
                      : msg.role === 'system'
                      ? "bg-white/5 text-slate-400 italic text-xs border border-white/5"
                      : "bg-white/10 text-slate-200 rounded-tl-none border border-white/5"
                  )}>
                    <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                      {msg.content}
                    </ReactMarkdown>
                    
                    {msg.isAction && (
                      <div className="mt-4 flex gap-2">
                        <button 
                          onClick={() => onSendMessage("I consent. Apply the changes.")}
                          className="flex-1 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <Check className="w-3 h-3" />
                          Consent
                        </button>
                        <button 
                          onClick={() => onSendMessage("I do not consent. Cancel changes.")}
                          className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <X className="w-3 h-3" />
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </motion.div>
              ))}
              {isProcessing && (
                <div className="flex items-center gap-2 text-brand-400 text-xs animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Processing neural request...
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 bg-white/5 border-t border-white/5">
              <div className="relative flex items-center">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type instructions..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-brand-500/50 transition-all placeholder:text-slate-600"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isProcessing}
                  className="absolute right-2 p-2 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-700 disabled:opacity-50 text-white rounded-xl transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between px-1">
                <div className="flex gap-2">
                  <button type="button" className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                    <Mic className="w-4 h-4" />
                  </button>
                  <button type="button" className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[9px] text-slate-500 uppercase tracking-tighter">
                  Consent Mode: <span className="text-brand-400">{settings.autoApplyChanges ? 'Auto' : 'Manual'}</span>
                </p>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.button
            key="chat-trigger"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20 hover:scale-110 transition-transform group relative"
          >
            <Bot className="w-7 h-7 text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-black flex items-center justify-center text-[8px] font-bold text-white">
              1
            </div>
            <div className="absolute -inset-1 rounded-full border border-brand-500/50 animate-ping opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

const Viewport = ({ 
  activeAsset, 
  isProcessing, 
  onAction 
}: { 
  activeAsset: Asset | null, 
  isProcessing: boolean,
  onAction: (type: string, payload: any) => void
}) => {
  return (
    <div className="flex-1 relative overflow-hidden flex flex-col">
      {/* Main Display */}
      <div className="flex-1 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {activeAsset ? (
            <motion.div 
              key={activeAsset.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative group max-w-full max-h-full"
            >
              {activeAsset.type === 'image' || activeAsset.type === '3d' ? (
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900">
                  <img 
                    src={activeAsset.url} 
                    alt={activeAsset.name}
                    className="max-w-full max-h-[70vh] object-contain"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">{activeAsset.name}</h4>
                        <p className="text-xs text-slate-300 mt-1">{activeAsset.prompt}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-md transition-colors">
                          <Download className="w-4 h-4 text-white" />
                        </button>
                        <button className="p-2 bg-brand-500 hover:bg-brand-600 rounded-lg backdrop-blur-md transition-colors">
                          <Maximize2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeAsset.type === 'video' ? (
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900">
                  <video 
                    src={activeAsset.url} 
                    controls 
                    className="max-w-full max-h-[70vh]"
                  />
                </div>
              ) : activeAsset.type === 'audio' ? (
                <div className="glass p-12 rounded-3xl flex flex-col items-center gap-6 border border-brand-500/20">
                  <div className="w-24 h-24 rounded-full bg-brand-500/10 flex items-center justify-center border border-brand-500/30 animate-pulse">
                    <Music className="w-10 h-10 text-brand-400" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-display font-bold text-white">{activeAsset.name}</h3>
                    <p className="text-sm text-slate-400 mt-2">Spatial Audio Environment Active</p>
                  </div>
                  <audio src={activeAsset.url} controls className="mt-4" />
                </div>
              ) : (
                <div className="glass p-12 rounded-3xl max-w-2xl w-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-brand-500/20 rounded-xl">
                      <FileText className="w-6 h-6 text-brand-400" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-white">{activeAsset.name}</h3>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-slate-300 leading-relaxed">
                      {activeAsset.prompt || "Document content generated by OmniSpatial Forge."}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-6"
            >
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-slate-600" />
                </div>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-4 border border-dashed border-slate-800 rounded-full"
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-display font-bold text-white">Ready for Creation</h2>
                <p className="text-slate-500 max-w-xs mx-auto">
                  Instruct the Omni Assistant to generate 3D renderings, edit photos, or build spatial environments.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3 pt-4">
                {['"Create a 3D cyberpunk city"', '"Upscale this photo"', '"Generate spatial rain sound"'].map((suggestion, i) => (
                  <button 
                    key={i}
                    onClick={() => onAction('suggest', suggestion)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-slate-400 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Actions Bar */}
      <div className="h-20 border-t border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-center px-8 gap-4">
        <button className="flex items-center gap-2 px-5 py-2.5 glass hover:bg-white/10 rounded-xl text-sm transition-all group">
          <ImageIcon className="w-4 h-4 text-brand-400 group-hover:scale-110 transition-transform" />
          <span>Modify Photo</span>
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 glass hover:bg-white/10 rounded-xl text-sm transition-all group">
          <Box className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          <span>3D Render</span>
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 glass hover:bg-white/10 rounded-xl text-sm transition-all group">
          <Video className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
          <span>Animate</span>
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 glass hover:bg-white/10 rounded-xl text-sm transition-all group">
          <Music className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
          <span>Spatial Sound</span>
        </button>
      </div>

      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Cpu className="w-8 h-8 text-brand-400 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-display font-bold text-white">Synthesizing Reality</h3>
                <p className="text-sm text-slate-400 mt-1">Allocating neural compute resources...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Sidebar = ({ 
  assets, 
  activeAssetId, 
  onSelectAsset, 
  onDeleteAsset,
  settings,
  onUpdateSettings
}: { 
  assets: Asset[], 
  activeAssetId: string | null, 
  onSelectAsset: (id: string) => void,
  onDeleteAsset: (id: string) => void,
  settings: SystemSettings,
  onUpdateSettings: (s: Partial<SystemSettings>) => void
}) => {
  const [activeTab, setActiveTab] = useState<'assets' | 'settings'>('assets');

  return (
    <div className="w-80 border-r border-white/5 flex flex-col glass-dark h-full">
      {/* Tabs */}
      <div className="flex p-2 gap-1 border-b border-white/5">
        <button 
          onClick={() => setActiveTab('assets')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all",
            activeTab === 'assets' ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
          )}
        >
          <Layers className="w-4 h-4" />
          Assets
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all",
            activeTab === 'settings' ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
          )}
        >
          <Settings className="w-4 h-4" />
          System
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'assets' ? (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Recent Generations</h3>
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-slate-400">{assets.length}</span>
            </div>
            {assets.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 mx-auto flex items-center justify-center">
                  <History className="w-6 h-6 text-slate-700" />
                </div>
                <p className="text-xs text-slate-600">No assets generated yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {assets.map((asset) => (
                  <motion.div 
                    layout
                    key={asset.id}
                    onClick={() => onSelectAsset(asset.id)}
                    className={cn(
                      "group relative p-3 rounded-2xl border transition-all cursor-pointer",
                      activeAssetId === asset.id 
                        ? "bg-brand-500/10 border-brand-500/30" 
                        : "bg-white/5 border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 border border-white/10">
                        {asset.type === 'image' || asset.type === '3d' ? (
                          <img src={asset.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : asset.type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center bg-red-500/10">
                            <Video className="w-5 h-5 text-red-400" />
                          </div>
                        ) : asset.type === 'audio' ? (
                          <div className="w-full h-full flex items-center justify-center bg-green-500/10">
                            <Music className="w-5 h-5 text-green-400" />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-brand-500/10">
                            <FileText className="w-5 h-5 text-brand-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-white truncate">{asset.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-1 capitalize">{asset.type} • {new Date(asset.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAsset(asset.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-8">
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold px-1">Neural Configuration</h3>
              
              <div className="space-y-6">
                {/* Processing Power */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs text-slate-300 flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-brand-400" />
                      Processing Power
                    </label>
                    <span className="text-[10px] font-mono text-brand-400">{settings.processingPower}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={settings.processingPower}
                    onChange={(e) => onUpdateSettings({ processingPower: parseInt(e.target.value) })}
                    className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>

                {/* Immersion Level */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs text-slate-300 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-yellow-400" />
                      Immersion Level
                    </label>
                    <span className="text-[10px] font-mono text-yellow-400">{settings.immersionLevel}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={settings.immersionLevel}
                    onChange={(e) => onUpdateSettings({ immersionLevel: parseInt(e.target.value) })}
                    className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                  />
                </div>

                {/* Assistant Voice */}
                <div className="space-y-3">
                  <label className="text-xs text-slate-300 flex items-center gap-2 px-1">
                    <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                    Assistant Voice
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'].map((v) => (
                      <button 
                        key={v}
                        onClick={() => onUpdateSettings({ assistantVoice: v as any })}
                        className={cn(
                          "px-3 py-2 rounded-xl text-[10px] border transition-all",
                          settings.assistantVoice === v 
                            ? "bg-purple-500/20 border-purple-500/40 text-purple-300" 
                            : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Apply */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="space-y-1">
                    <h4 className="text-xs font-medium text-white">Autonomous Consent</h4>
                    <p className="text-[9px] text-slate-500">Allow AI to modify system settings</p>
                  </div>
                  <button 
                    onClick={() => onUpdateSettings({ autoApplyChanges: !settings.autoApplyChanges })}
                    className={cn(
                      "w-10 h-5 rounded-full transition-all relative",
                      settings.autoApplyChanges ? "bg-brand-500" : "bg-slate-700"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                      settings.autoApplyChanges ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-brand-500/5 rounded-2xl border border-brand-500/10 space-y-3">
              <div className="flex items-center gap-2 text-brand-400">
                <ShieldCheck className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-tighter">Security Protocol</h4>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                OmniSpatial Forge operates under strict neural safety guidelines. All generative outputs are synthesized in a sandbox environment.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">System Online</span>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500">
          <Info className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      content: "Welcome to **OmniSpatial Forge**. I am your neural assistant. I can help you reimagine photos, design 3D environments, and synthesize spatial audio. How shall we begin?",
      timestamp: Date.now(),
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    theme: 'dark',
    processingPower: 85,
    immersionLevel: 60,
    assistantVoice: 'Kore',
    autoApplyChanges: false,
  });

  const activeAsset = assets.find(a => a.id === activeAssetId) || null;

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      // Orchestrator logic
      const systemInstruction = `
        You are the Omni Assistant for OmniSpatial Forge. 
        You have access to tools for:
        - Generating images (3D renderings, photos)
        - Editing existing images
        - Generating videos
        - Generating spatial audio/music
        - Modifying system settings (processingPower, immersionLevel, theme, autoApplyChanges)
        
        Current System Settings: ${JSON.stringify(settings)}
        
        If the user asks to create something, describe what you are doing and then perform the action.
        If the user asks to change settings, you must ask for consent unless autoApplyChanges is true.
        
        Format your response as markdown. 
        If you are performing an action, include a special tag like [ACTION:TYPE:PROMPT] at the end of your message.
        Types: IMAGE, EDIT, VIDEO, AUDIO, DOC, SETTINGS.
      `;

      const responseText = await generateText(text, systemInstruction);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText.replace(/\[ACTION:.*\]/g, '').trim(),
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Parse actions
      const actionMatch = responseText.match(/\[ACTION:(.*?):(.*?)(?::(.*?))?\]/);
      if (actionMatch) {
        const [_, type, prompt, extra] = actionMatch;
        console.log("Action detected:", type, prompt, extra);

        if (type === 'IMAGE' || type === '3D') {
          const url = await generateImage(prompt);
          if (url) {
            const newAsset: Asset = {
              id: Math.random().toString(36).substr(2, 9),
              type: type === '3D' ? '3d' : 'image',
              url,
              name: prompt.split(' ').slice(0, 3).join(' '),
              timestamp: Date.now(),
              prompt,
            };
            setAssets(prev => [newAsset, ...prev]);
            setActiveAssetId(newAsset.id);
          }
        } else if (type === 'VIDEO') {
          const { generateVideo } = await import('./lib/gemini');
          const url = await generateVideo(prompt);
          if (url) {
            const newAsset: Asset = {
              id: Math.random().toString(36).substr(2, 9),
              type: 'video',
              url,
              name: prompt.split(' ').slice(0, 3).join(' '),
              timestamp: Date.now(),
              prompt,
            };
            setAssets(prev => [newAsset, ...prev]);
            setActiveAssetId(newAsset.id);
          }
        } else if (type === 'AUDIO' || type === 'MUSIC') {
          const { generateMusic } = await import('./lib/gemini');
          const url = await generateMusic(prompt);
          if (url) {
            const newAsset: Asset = {
              id: Math.random().toString(36).substr(2, 9),
              type: 'audio',
              url,
              name: prompt.split(' ').slice(0, 3).join(' '),
              timestamp: Date.now(),
              prompt,
            };
            setAssets(prev => [newAsset, ...prev]);
            setActiveAssetId(newAsset.id);
          }
        } else if (type === 'SETTINGS') {
          try {
            const newSettings = JSON.parse(prompt);
            if (settings.autoApplyChanges) {
              setSettings(prev => ({ ...prev, ...newSettings }));
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'system',
                content: "System settings updated autonomously.",
                timestamp: Date.now(),
              }]);
            } else {
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                content: "I've prepared the requested system modifications. Do you consent to apply these changes?",
                timestamp: Date.now(),
                isAction: true,
              }]);
            }
          } catch (e) {
            console.error("Failed to parse settings action", e);
          }
        } else if (type === 'AUDIO') {
          // Placeholder for audio generation logic
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            content: "Synthesizing spatial audio environment...",
            timestamp: Date.now(),
          }]);
        }
      }

      // Voice feedback
      if (settings.immersionLevel > 50) {
        const audioUrl = await generateSpeech(assistantMsg.content.slice(0, 100), settings.assistantVoice);
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          audio.play().catch(e => console.log("Audio play blocked", e));
        }
      }

    } catch (error) {
      console.error("Neural link error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: "Neural link interrupted. Please check your connection.",
        timestamp: Date.now(),
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-black selection:bg-brand-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.05),transparent_70%)]" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <Sidebar 
        assets={assets} 
        activeAssetId={activeAssetId}
        onSelectAsset={setActiveAssetId}
        onDeleteAsset={(id) => setAssets(prev => prev.filter(a => a.id !== id))}
        settings={settings}
        onUpdateSettings={(s) => setSettings(prev => ({ ...prev, ...s }))}
      />

      <div className="flex-1 flex flex-col relative">
        {/* Top Navigation */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 glass-dark z-10">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">OmniSpatial Forge</h1>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">v2.5.0-spatial</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-green-500" />
                <span className="text-[10px] text-slate-400 font-mono">LATENCY: 24ms</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-brand-400" />
                <span className="text-[10px] text-slate-400 font-mono">REGION: US-EAST</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400">
                <History className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                <User className="w-5 h-5 text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        <Viewport 
          activeAsset={activeAsset} 
          isProcessing={isProcessing}
          onAction={(type, payload) => {
            if (type === 'suggest') handleSendMessage(payload);
          }}
        />

        <Chatterbot 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          isProcessing={isProcessing}
          settings={settings}
          onUpdateSettings={(s) => setSettings(prev => ({ ...prev, ...s }))}
        />
      </div>
    </div>
  );
}
