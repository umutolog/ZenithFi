import React, { useState } from 'react';
import { HOPE_TOKEN_SOL, ZENITH_VAULT_SOL, ZENITH_VAULT_TEST_SOL, DEPLOY_SCRIPT_JS } from '../constants/contractCode';
import { Copy, Check, Terminal, Download, ShieldCheck, FileCode } from 'lucide-react';

export const ContractViewer: React.FC = () => {
  const activeFileInit = 'ZenithVault.sol';
  const [activeFile, setActiveFile] = useState<'HopeToken.sol' | 'ZenithVault.sol' | 'ZenithVault.t.sol' | 'deploy_global.js'>(activeFileInit);
  const [copied, setCopied] = useState(false);

  const getCode = () => {
    switch (activeFile) {
        case 'HopeToken.sol': return HOPE_TOKEN_SOL;
        case 'ZenithVault.sol': return ZENITH_VAULT_SOL;
        case 'ZenithVault.t.sol': return ZENITH_VAULT_TEST_SOL;
        case 'deploy_global.js': return DEPLOY_SCRIPT_JS;
        default: return '';
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([getCode()], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = activeFile;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="h-full flex flex-col space-y-8 pt-8 animate-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
                <h2 className="text-4xl font-display font-[800] text-zenith-navy leading-none tracking-tight">Transparency</h2>
                <p className="text-zenith-subtext mt-2 font-medium">Verified source code, security proofs, and immutable logic.</p>
            </div>
             <div className="glass-panel p-1.5 rounded-2xl flex gap-1 shadow-sm">
                {(['HopeToken.sol', 'ZenithVault.sol', 'ZenithVault.t.sol', 'deploy_global.js'] as const).map((file) => (
                    <button
                        key={file}
                        onClick={() => setActiveFile(file)}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                            activeFile === file ? 'bg-zenith-navy text-white shadow-md' : 'text-zenith-subtext hover:bg-white/50 hover:text-zenith-navy'
                        }`}
                    >
                        {file === 'ZenithVault.t.sol' ? <ShieldCheck size={12} /> : <FileCode size={12} />}
                        {file}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex-1 glass-panel rounded-[32px] overflow-hidden flex flex-col relative bg-white/60 shadow-2xl ring-1 ring-white/50">
            {/* Code Header */}
            <div className="bg-white/40 border-b border-white/50 px-6 py-4 flex justify-between items-center backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zenith-navy text-white flex items-center justify-center shadow-lg">
                         <Terminal size={14} />
                    </div>
                    <span className="text-xs font-mono font-bold text-zenith-navy tracking-wide">
                        {activeFile === 'ZenithVault.t.sol' ? 'tests/' : 'src/'}{activeFile}
                    </span>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 text-xs font-bold text-zenith-subtext hover:text-zenith-navy bg-white/50 hover:bg-white px-3 py-2 rounded-lg transition-all border border-transparent hover:border-white/60"
                    >
                        <Download size={14} />
                        Download
                    </button>
                    <button 
                        onClick={handleCopy}
                        className="flex items-center gap-2 text-xs font-bold text-zenith-subtext hover:text-zenith-navy bg-white/50 hover:bg-white px-3 py-2 rounded-lg transition-all border border-transparent hover:border-white/60"
                    >
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-8 bg-white/40 custom-scrollbar">
                <pre className="text-xs md:text-sm font-mono leading-relaxed text-zenith-navy selection:bg-zenith-accent/20">
                    <code>
                        {getCode()}
                    </code>
                </pre>
            </div>
        </div>
    </div>
  );
};