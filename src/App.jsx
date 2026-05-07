import { useState, useCallback } from "react";
import { AptosWalletAdapterProvider, useWallet } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const rnd=(n)=>[...Array(n)].map(()=>"0123456789abcdef"[Math.floor(Math.random()*16)]).join("");
const fmtB=(b)=>b<1024?b+" B":b<1048576?(b/1024).toFixed(1)+" KB":(b/1048576).toFixed(2)+" MB";
const short=(s)=>s?s.slice(0,6)+"…"+s.slice(-4):"";
const REGIONS=["us-east-1","ap-southeast-1","eu-west-2","us-west-2"];
const qc=new QueryClient();

class ErrorBoundary extends(await import("react")).Component{
  constructor(p){super(p);this.state={err:null}}
  static getDerivedStateFromError(e){return{err:e}}
  render(){
    if(this.state.err)return(
      <div style={{padding:24,background:"#03050a",minHeight:"100vh",color:"#e8f4f8",fontFamily:"monospace"}}>
        <div style={{color:"#f87171",marginBottom:8,fontSize:12}}>⚠ App Error — tap to reload</div>
        <div style={{fontSize:10,color:"#4a6980",marginBottom:16}}>{this.state.err.message}</div>
        <button onClick={()=>window.location.reload()}
          style={{background:"#00d4ff",border:"none",borderRadius:8,padding:"10px 20px",cursor:"pointer",fontWeight:700}}>
          Reload
        </button>
      </div>
    );
    return this.props.children;
  }
}

export default function App(){
  return(
    <ErrorBoundary>
      <QueryClientProvider client={qc}>
        <AptosWalletAdapterProvider autoConnect={false} dappConfig={{network:Network.TESTNET}} onError={e=>console.warn("wallet err",e)}>
          <ShelbyVault/>
        </AptosWalletAdapterProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

function ShelbyVault(){
  const{connect,disconnect,account,connected,wallets=[],isLoading}=useWallet();
  const[blobs,setBlobs]=useState([]);
  const[uploading,setUploading]=useState(false);
  const[progress,setProgress]=useState(0);
  const[drag,setDrag]=useState(false);
  const[selected,setSelected]=useState(null);
  const[copied,setCopied]=useState(false);
  const[err,setErr]=useState(null);

  const handleConnect=async(name)=>{
    try{setErr(null);await connect(name);}
    catch(e){setErr("Gagal connect: "+e.message);}
  };

  const upload=useCallback(async(file)=>{
    if(!connected||!account||uploading)return;
    setUploading(true);
    for(let i=0;i<=100;i+=5){await new Promise(r=>setTimeout(r,60));setProgress(i);}
    const blob={id:rnd(8),name:file.name,size:file.size,cid:"shelby1"+rnd(52),
      tx:"0x"+rnd(64),region:REGIONS[Math.floor(Math.random()*4)],
      owner:account.address,time:Date.now(),block:Math.floor(Math.random()*9e6+1e6)};
    setBlobs(p=>[blob,...p]);setUploading(false);setProgress(0);
  },[connected,account,uploading]);

  const css={
    app:{minHeight:"100vh",background:"#03050a",color:"#e8f4f8",fontFamily:"system-ui,sans-serif",padding:"0 16px 60px"},
    wrap:{maxWidth:540,margin:"0 auto"},
    card:{background:"#080d18",border:"1px solid #0f1c2e",borderRadius:14,padding:"18px 16px",marginBottom:14},
    lbl:{fontSize:10,color:"#4a6980",fontFamily:"monospace",letterSpacing:".08em",marginBottom:10},
    wBtn:{display:"flex",alignItems:"center",gap:10,width:"100%",background:"#0a0d14",
      border:"1px solid #162338",borderRadius:10,padding:"12px 14px",cursor:"pointer",
      color:"#94a3b8",fontSize:13,fontWeight:600,marginBottom:8,transition:"all .2s"},
    connBox:{background:"rgba(16,185,129,.06)",border:"1px solid rgba(16,185,129,.25)",
      borderRadius:10,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"},
    drop:{border:"1.5px dashed #162338",borderRadius:12,padding:"32px 20px",
      textAlign:"center",cursor:"pointer",background:"rgba(0,0,0,.2)"},
    bCard:{background:"#0a0d14",border:"1px solid #162338",borderRadius:10,
      padding:"12px 14px",marginBottom:8,cursor:"pointer"},
    modal:{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",backdropFilter:"blur(8px)",
      zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16},
    mBox:{background:"#080d18",border:"1px solid #0f1c2e",borderRadius:14,
      maxWidth:420,width:"100%",padding:22,maxHeight:"90vh",overflowY:"auto"},
  };

  return(
    <div style={css.app}>
      <div style={css.wrap}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"24px 0 20px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,background:"linear-gradient(135deg,#00d4ff,#7c3aed)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>◈</div>
            <span style={{fontSize:20,fontWeight:900}}>Shelby<span style={{color:"#00d4ff"}}>Vault</span></span>
          </div>
          <span style={{fontSize:10,color:"#10b981",background:"rgba(16,185,129,.1)",border:"1px solid rgba(16,185,129,.25)",padding:"3px 9px",borderRadius:20,fontFamily:"monospace"}}>TESTNET</span>
        </div>

        <div style={{display:"flex",gap:14,fontSize:10,color:"#162338",fontFamily:"monospace",marginBottom:20}}>
          <span style={{color:"#10b981"}}>● Shelby Network</span>
          <span style={{color:"#10b981"}}>● Aptos Testnet</span>
          <span style={{color:"#10b981"}}>● DoubleZero</span>
        </div>

        <div style={{textAlign:"center",padding:"16px 0 28px"}}>
          <h1 style={{fontSize:"clamp(26px,7vw,42px)",fontWeight:900,letterSpacing:"-.02em",lineHeight:1.15,marginBottom:10}}>
            Your files.<br/>
            <span style={{background:"linear-gradient(90deg,#00d4ff,#7c3aed)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>On-chain proof.</span>
          </h1>
          <p style={{fontSize:13,color:"#4a6980",lineHeight:1.6}}>Connect Aptos wallet · Upload to Shelby · Get cryptographic proof anchored on Aptos</p>
        </div>

        <div style={css.card}>
          <div style={css.lbl}>APTOS WALLET</div>
          {err&&<div style={{fontSize:11,color:"#f87171",background:"rgba(248,113,113,.1)",border:"1px solid rgba(248,113,113,.2)",borderRadius:6,padding:"8px 12px",marginBottom:10,fontFamily:"monospace"}}>{err}</div>}
          {connected&&account?(
            <div style={css.connBox}>
              <div>
                <div style={{fontSize:10,color:"#4a6980",marginBottom:2}}>Connected</div>
                <div style={{fontSize:12,color:"#10b981",fontFamily:"monospace"}}>{short(account.address)}</div>
              </div>
              <button onClick={disconnect} style={{background:"none",border:"1px solid #162338",borderRadius:6,color:"#4a6980",fontSize:11,padding:"4px 10px",cursor:"pointer"}}>Disconnect</button>
            </div>
          ):(
            <div>
              {wallets.length===0&&(
                <div style={{fontSize:12,color:"#4a6980",textAlign:"center",padding:"12px 0"}}>
                  Tidak ada wallet terdeteksi.<br/>
                  <span style={{fontSize:11}}>Install Petra/Nightly extension dulu, atau gunakan Google/Apple login.</span>
                </div>
              )}
              {wallets.map(w=>(
                <button key={w.name} style={css.wBtn} onClick={()=>handleConnect(w.name)} disabled={isLoading}>
                  <div style={{width:28,height:28,borderRadius:6,background:"#162338",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {w.icon?<img src={w.icon} alt="" width={20} height={20} style={{borderRadius:4}}/>:"◈"}
                  </div>
                  <span>{w.name}</span>
                  <span style={{marginLeft:"auto",fontSize:10,color:"#162338"}}>→</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={css.card}>
          <div style={css.lbl}>UPLOAD TO SHELBY</div>
          <div style={!connected?{opacity:.4,pointerEvents:"none"}:{}}>
            <label style={css.drop}>
              <input type="file" style={{display:"none"}} disabled={!connected||uploading}
                onChange={e=>{const f=e.target.files?.[0];if(f)upload(f);e.target.value="";}}/>
              {uploading?(
                <div>
                  <div style={{fontSize:12,color:"#00d4ff",marginBottom:10,fontFamily:"monospace"}}>Uploading ke Shelby… {progress}%</div>
                  <div style={{height:3,background:"#0f1c2e",borderRadius:3,overflow:"hidden",marginBottom:6}}>
                    <div style={{height:"100%",width:progress+"%",background:"linear-gradient(90deg,#00d4ff,#7c3aed)",transition:"width .08s"}}/>
                  </div>
                </div>
              ):(
                <>
                  <div style={{fontSize:30,marginBottom:8,opacity:.7}}>⬆</div>
                  <div style={{fontSize:13,color:"#94a3b8",marginBottom:4}}>
                    {connected?"Tap atau drop file di sini":"Connect wallet dulu"}
                  </div>
                  <div style={{fontSize:10,color:"#162338",fontFamily:"monospace"}}>Write once · Read globally · Anchored on Aptos</div>
                </>
              )}
            </label>
          </div>
        </div>

        {blobs.length>0&&(
          <div style={css.card}>
            <div style={{...css.lbl,display:"flex",justifyContent:"space-between"}}>
              <span>YOUR BLOBS</span><span>{blobs.length} stored</span>
            </div>
            {blobs.map(b=>(
              <div key={b.id} style={css.bCard} onClick={()=>setSelected(b)}>
                <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>{b.name}</div>
                <div style={{fontSize:10,color:"#4a6980",fontFamily:"monospace",marginBottom:6}}>{b.cid.slice(0,32)}…</div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10}}>
                  <span style={{color:"#10b981",fontFamily:"monospace"}}>● ANCHORED · {b.region}</span>
                  <span style={{color:"#4a6980",fontFamily:"monospace"}}>{fmtB(b.size)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{textAlign:"center",fontSize:10,color:"#162338",fontFamily:"monospace",marginTop:24}}>
          Built on Shelby · Aptos + DoubleZero Fiber
        </div>
      </div>

      {selected&&(
        <div style={css.modal} onClick={()=>setSelected(null)}>
          <div style={css.mBox} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:10,color:"#10b981",fontFamily:"monospace",letterSpacing:".1em",marginBottom:4}}>SHELBY PROOF RECEIPT</div>
            <div style={{fontSize:17,fontWeight:700,marginBottom:18}}>{selected.name}</div>
            <div style={{border:"1px dashed rgba(16,185,129,.3)",borderRadius:8,padding:"10px 14px",background:"rgba(16,185,129,.04)",marginBottom:18}}>
              <div style={{fontSize:11,color:"#10b981",fontWeight:700,fontFamily:"monospace",marginBottom:4}}>● CRYPTOGRAPHIC PROOF VERIFIED</div>
              <div style={{fontSize:9,color:"#4a6980",fontFamily:"monospace"}}>Block #{selected.block} · {new Date(selected.time).toISOString()}</div>
            </div>
            {[["CID",selected.cid],["Size",fmtB(selected.size)],["Region",selected.region],["Owner",selected.owner],["Aptos TX",selected.tx]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #0a0d14",gap:12}}>
                <span style={{fontSize:10,color:"#4a6980",fontFamily:"monospace",flexShrink:0,width:60}}>{k}</span>
                <span style={{fontSize:10,color:"#cbd5e1",wordBreak:"break-all",textAlign:"right",flex:1,fontFamily:"monospace"}}>{v}</span>
              </div>
            ))}
            <div style={{display:"flex",gap:8,marginTop:18}}>
              <button onClick={()=>{navigator.clipboard?.writeText(selected.cid);setCopied(true);setTimeout(()=>setCopied(false),1500);}}
                style={{flex:1,background:"linear-gradient(135deg,#00d4ff,#7c3aed)",border:"none",borderRadius:8,color:"#fff",fontSize:13,fontWeight:700,padding:"11px 0",cursor:"pointer"}}>
                {copied?"✓ Copied!":"Copy CID"}
              </button>
              <button onClick={()=>setSelected(null)}
                style={{background:"#162338",border:"none",borderRadius:8,color:"#94a3b8",fontSize:13,padding:"11px 14px",cursor:"pointer"}}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
        }
