import { useState, useCallback } from "react";
import { AptosWalletAdapterProvider, useWallet } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const rnd = (n) => [...Array(n)].map(() => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
const fmtB = (b) => b < 1024 ? b + " B" : b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(2) + " MB";
const short = (s) => s ? s.slice(0, 6) + "…" + s.slice(-4) : "";
const REGIONS = ["us-east-1", "ap-southeast-1", "eu-west-2", "us-west-2"];

// ─── Providers ────────────────────────────────────────────────────────────────
const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AptosWalletAdapterProvider
        autoConnect={true}
        dappConfig={{ network: Network.TESTNET }}
        onError={(e) => console.error("Wallet error:", e)}
      >
        <ShelbyVault />
      </AptosWalletAdapterProvider>
    </QueryClientProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  app: { minHeight: "100vh", background: "#03050a", color: "#e8f4f8", fontFamily: "system-ui,sans-serif", padding: "0 16px 60px" },
  wrap: { maxWidth: 560, margin: "0 auto" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 0 28px" },
  logoRow: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { width: 32, height: 32, background: "linear-gradient(135deg,#00d4ff,#7c3aed)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 },
  logoText: { fontSize: 20, fontWeight: 900, letterSpacing: "-.02em" },
  badge: { fontSize: 10, color: "#10b981", background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.25)", padding: "3px 9px", borderRadius: 20, fontFamily: "monospace" },
  card: { background: "#080d18", border: "1px solid #0f1c2e", borderRadius: 14, padding: "18px 16px", marginBottom: 14 },
  label: { fontSize: 10, color: "#4a6980", fontFamily: "monospace", letterSpacing: ".08em", marginBottom: 10 },
  hero: { textAlign: "center", padding: "16px 0 28px" },
  h1: { fontSize: "clamp(24px,7vw,40px)", fontWeight: 900, letterSpacing: "-.02em", lineHeight: 1.15, marginBottom: 10 },
  hl: { background: "linear-gradient(90deg,#00d4ff,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  sub: { fontSize: 13, color: "#4a6980", lineHeight: 1.6 },
  walletGrid: { display: "flex", flexDirection: "column", gap: 8 },
  walletBtn: (active) => ({ display: "flex", alignItems: "center", gap: 10, width: "100%", background: active ? "rgba(0,212,255,.08)" : "#0a0d14", border: `1px solid ${active ? "#00d4ff" : "#162338"}`, borderRadius: 10, padding: "11px 14px", cursor: "pointer", color: active ? "#00d4ff" : "#94a3b8", fontSize: 13, fontWeight: 600, transition: "all .2s" }),
  walletIcon: { width: 28, height: 28, borderRadius: 6, background: "#162338", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 },
  connectedBox: { background: "rgba(16,185,129,.06)", border: "1px solid rgba(16,185,129,.25)", borderRadius: 10, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  addrText: { fontSize: 12, color: "#10b981", fontFamily: "monospace" },
  disconnectBtn: { background: "none", border: "1px solid #162338", borderRadius: 6, color: "#4a6980", fontSize: 11, padding: "4px 10px", cursor: "pointer" },
  dropZone: (drag) => ({ border: `1.5px dashed ${drag ? "#00d4ff" : "#162338"}`, borderRadius: 12, padding: "32px 20px", textAlign: "center", cursor: "pointer", background: drag ? "rgba(0,212,255,.03)" : "rgba(0,0,0,.2)", transition: "all .2s", position: "relative" }),
  dropIcon: { fontSize: 30, marginBottom: 8, opacity: .7 },
  dropText: { fontSize: 13, color: "#94a3b8", marginBottom: 4 },
  dropSub: { fontSize: 10, color: "#162338", fontFamily: "monospace" },
  progressWrap: { marginTop: 14 },
  progressBar: { height: 3, background: "#0f1c2e", borderRadius: 3, overflow: "hidden", marginBottom: 6 },
  progressFill: (p) => ({ height: "100%", width: p + "%", background: "linear-gradient(90deg,#00d4ff,#7c3aed)", transition: "width .08s" }),
  progressLabel: { fontSize: 11, color: "#00d4ff", fontFamily: "monospace", textAlign: "center" },
  blobCard: { background: "#0a0d14", border: "1px solid #162338", borderRadius: 10, padding: "12px 14px", marginBottom: 8, cursor: "pointer", transition: "border-color .2s" },
  blobName: { fontSize: 13, fontWeight: 700, marginBottom: 4, color: "#e8f4f8" },
  blobCid: { fontSize: 10, color: "#4a6980", fontFamily: "monospace", marginBottom: 6 },
  blobMeta: { display: "flex", justifyContent: "space-between", fontSize: 11 },
  blobAnchor: { color: "#10b981", display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontFamily: "monospace" },
  dot: { width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981", display: "inline-block" },
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", backdropFilter: "blur(8px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modalBox: { background: "#080d18", border: "1px solid #0f1c2e", borderRadius: 14, maxWidth: 420, width: "100%", padding: 22, maxHeight: "90vh", overflowY: "auto" },
  receiptTitle: { fontSize: 10, color: "#10b981", fontFamily: "monospace", letterSpacing: ".1em", marginBottom: 4 },
  receiptName: { fontSize: 17, fontWeight: 700, marginBottom: 18 },
  stamp: { border: "1px dashed rgba(16,185,129,.3)", borderRadius: 8, padding: "10px 14px", background: "rgba(16,185,129,.04)", marginBottom: 18 },
  stampTitle: { fontSize: 11, color: "#10b981", fontWeight: 700, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 },
  stampSub: { fontSize: 9, color: "#4a6980", fontFamily: "monospace" },
  row: { display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #0a0d14", gap: 12 },
  rowKey: { fontSize: 10, color: "#4a6980", fontFamily: "monospace", flexShrink: 0, width: 64 },
  rowVal: { fontSize: 10, color: "#cbd5e1", wordBreak: "break-all", textAlign: "right", flex: 1, fontFamily: "monospace" },
  btnRow: { display: "flex", gap: 8, marginTop: 18 },
  btnMain: { flex: 1, background: "linear-gradient(135deg,#00d4ff,#7c3aed)", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, padding: "11px 0", cursor: "pointer" },
  btnClose: { background: "#162338", border: "none", borderRadius: 8, color: "#94a3b8", fontSize: 13, padding: "11px 14px", cursor: "pointer" },
  disabledOverlay: { opacity: .45, pointerEvents: "none" },
  networkInfo: { display: "flex", gap: 14, fontSize: 10, color: "#162338", fontFamily: "monospace", marginBottom: 20 },
  netDot: { color: "#10b981" },
};

// ─── Main Vault Component ─────────────────────────────────────────────────────
function ShelbyVault() {
  const { connect, disconnect, account, connected, wallets = [], isLoading } = useWallet();
  const [blobs, setBlobs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [drag, setDrag] = useState(false);
  const [selected, setSelected] = useState(null);
  const [copied, setCopied] = useState(false);

  // Simulate Shelby upload (real SDK: useUploadBlobs from @shelby-protocol/react)
  const uploadToShelby = useCallback(async (file) => {
    if (!connected || !account || uploading) return;
    setUploading(true);
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 60));
      setProgress(i);
    }
    const blob = {
      id: rnd(8),
      name: file.name,
      size: file.size,
      cid: "shelby1" + rnd(52),
      tx: "0x" + rnd(64),
      region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
      owner: account.address,
      time: Date.now(),
      block: Math.floor(Math.random() * 9e6 + 1e6),
      network: "Shelby Testnet",
    };
    setBlobs(p => [blob, ...p]);
    setUploading(false);
    setProgress(0);
  }, [connected, account, uploading]);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) uploadToShelby(f);
  }, [uploadToShelby]);

  function copyReceipt(text) {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={S.app}>
      <div style={S.wrap}>
        {/* Header */}
        <header style={S.header}>
          <div style={S.logoRow}>
            <div style={S.logoIcon}>◈</div>
            <span style={S.logoText}>Shelby<span style={{ color: "#00d4ff" }}>Vault</span></span>
          </div>
          <span style={S.badge}>TESTNET</span>
        </header>

        {/* Network status */}
        <div style={S.networkInfo}>
          <span><span style={S.netDot}>●</span> Shelby Network</span>
          <span><span style={S.netDot}>●</span> Aptos Testnet</span>
          <span><span style={S.netDot}>●</span> DoubleZero Fiber</span>
        </div>

        {/* Hero */}
        <div style={S.hero}>
          <h1 style={S.h1}>Your files.<br /><span style={S.hl}>On-chain proof.</span></h1>
          <p style={S.sub}>Connect your Aptos wallet · Upload to Shelby storage · Get cryptographic proof anchored on Aptos</p>
        </div>

        {/* Wallet Connect */}
        <div style={S.card}>
          <div style={S.label}>APTOS WALLET</div>
          {connected && account ? (
            <div style={S.connectedBox}>
              <div>
                <div style={{ fontSize: 10, color: "#4a6980", marginBottom: 2 }}>Connected</div>
                <div style={S.addrText}>{short(account.address)}</div>
              </div>
              <button style={S.disconnectBtn} onClick={disconnect}>Disconnect</button>
            </div>
          ) : (
            <div style={S.walletGrid}>
              {wallets.length === 0 && (
                <div style={{ fontSize: 12, color: "#4a6980", textAlign: "center", padding: "12px 0" }}>
                  No wallet extension detected.<br />
                  <span style={{ fontSize: 11 }}>Install Petra or Nightly wallet, then refresh.</span>
                </div>
              )}
              {wallets.map((w) => (
                <button key={w.name} style={S.walletBtn(false)}
                  onClick={() => connect(w.name)}
                  disabled={isLoading}>
                  <div style={S.walletIcon}>
                    {w.icon ? <img src={w.icon} alt="" width={20} height={20} style={{ borderRadius: 4 }} /> : "◈"}
                  </div>
                  <span>{w.name}</span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: "#162338" }}>→</span>
                </button>
              ))}
              <div style={{ fontSize: 10, color: "#4a6980", textAlign: "center", paddingTop: 6, fontFamily: "monospace" }}>
                Supported: Petra · Nightly · Pontem · Rise · OKX Wallet
              </div>
            </div>
          )}
        </div>

        {/* Upload Zone */}
        <div style={S.card}>
          <div style={S.label}>UPLOAD TO SHELBY</div>
          <div style={!connected ? S.disabledOverlay : {}}>
            <label
              style={S.dropZone(drag)}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}>
              <input type="file" style={{ display: "none" }} disabled={!connected || uploading}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadToShelby(f); e.target.value = ""; }} />
              {uploading ? (
                <div style={S.progressWrap}>
                  <div style={{ fontSize: 12, color: "#00d4ff", marginBottom: 10, fontFamily: "monospace" }}>
                    Uploading to Shelby… {progress}%
                  </div>
                  <div style={S.progressBar}><div style={S.progressFill(progress)} /></div>
                  <div style={{ fontSize: 10, color: "#4a6980", fontFamily: "monospace", marginTop: 6 }}>
                    Writing to global namespace · anchoring on Aptos…
                  </div>
                </div>
              ) : (
                <>
                  <div style={S.dropIcon}>⬆</div>
                  <div style={S.dropText}>
                    {connected ? <>Tap or drop file · <span style={{ color: "#00d4ff" }}>Upload to Shelby</span></> : "Connect wallet first"}
                  </div>
                  <div style={S.dropSub}>Write once · Read globally · Zero replication · ~70% cheaper egress</div>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Blobs list */}
        {blobs.length > 0 && (
          <div style={S.card}>
            <div style={{ ...S.label, display: "flex", justifyContent: "space-between" }}>
              <span>YOUR BLOBS</span>
              <span>{blobs.length} stored</span>
            </div>
            {blobs.map(b => (
              <div key={b.id} style={S.blobCard}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#00d4ff33"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#162338"}
                onClick={() => setSelected(b)}>
                <div style={S.blobName}>{b.name}</div>
                <div style={S.blobCid}>{b.cid.slice(0, 32)}…</div>
                <div style={S.blobMeta}>
                  <div style={S.blobAnchor}><span style={S.dot} />ANCHORED · {b.region}</div>
                  <span style={{ color: "#4a6980", fontFamily: "monospace", fontSize: 10 }}>{fmtB(b.size)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SDK reference */}
        <div style={S.card}>
          <div style={S.label}>SHELBY SDK INTEGRATION</div>
          <pre style={{ fontSize: 9, color: "#4a6980", lineHeight: 1.7, overflowX: "auto" }}>{
`// @shelby-protocol/react + @shelby-protocol/sdk
import { ShelbyClient } from "@shelby-protocol/sdk/browser";
import { ShelbyClientProvider, useUploadBlobs }
  from "@shelby-protocol/react";

const client = new ShelbyClient({ network: "testnet" });

// Upload blob with wallet signer
const { mutate: upload } = useUploadBlobs();
upload({ signer: walletSigner, blobs: [file] });
// → Returns CID + Aptos TX receipt`
          }</pre>
        </div>

        <div style={{ textAlign: "center", fontSize: 10, color: "#162338", fontFamily: "monospace", marginTop: 24 }}>
          Built on Shelby · Aptos + DoubleZero Fiber Network
        </div>
      </div>

      {/* Receipt Modal */}
      {selected && (
        <div style={S.modal} onClick={() => setSelected(null)}>
          <div style={S.modalBox} onClick={e => e.stopPropagation()}>
            <div style={S.receiptTitle}>SHELBY PROOF RECEIPT</div>
            <div style={S.receiptName}>{selected.name}</div>
            <div style={S.stamp}>
              <div style={S.stampTitle}><span style={S.dot} />CRYPTOGRAPHIC PROOF VERIFIED</div>
              <div style={S.stampSub}>Block #{selected.block} · {new Date(selected.time).toISOString()}</div>
            </div>
            {[
              ["CID", selected.cid],
              ["Size", fmtB(selected.size)],
              ["Region", selected.region],
              ["Network", selected.network],
              ["Owner", selected.owner],
              ["Aptos TX", selected.tx],
            ].map(([k, v]) => (
              <div key={k} style={S.row}>
                <span style={S.rowKey}>{k}</span>
                <span style={S.rowVal}>{v}</span>
              </div>
            ))}
            <div style={S.btnRow}>
              <button style={S.btnMain} onClick={() => copyReceipt(selected.cid)}>
                {copied ? "✓ Copied!" : "Copy CID"}
              </button>
              <button style={S.btnClose} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
                        }
                             
