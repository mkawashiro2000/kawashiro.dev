import React, { useState, useEffect } from 'react';

/**
 * NeofetchLive — neofetch con datos REALES del host, servidos por el edge-api.
 * Logo ASCII de frambuesa + métricas en vivo (modelo, kernel, uptime, temp).
 */

interface SysInfo {
  model: string;
  kernel: string;
  host_uptime: string;
  service_uptime: string;
  mem_used_mb: number;
  mem_total_mb: number;
  cpu_count: number;
  soc_temp: number | null;
  load_avg: number;
}

const GREEN = '#a6e3a1';
const RED = '#f38ba8';
const BLUE = '#89b4fa';
const TEXT = '#cdd6f4';
const FAINT = '#6c7086';

// Frambuesa ASCII: hojas (verde) + fruto (rojo)
const LOGO_LEAVES = ['   .~~.   .~~.', "  '. \\ ' ' / .'"];
const LOGO_BERRY = [
  '   .~ .~~~..~.',
  "  : .~.'~'.~. :",
  ' ~ (   ) (   ) ~',
  "( : '~'.~.'~' : )",
  ' ~ .~ (   ) ~. ~',
  "  (  : '~' :  )",
  "   '~ .~~~. ~'",
  "       '~'",
];

export const NeofetchLive: React.FC = () => {
  const [info, setInfo] = useState<SysInfo | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch('/api/v1/sysinfo')
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => setFailed(true));
  }, []);

  if (failed) {
    return <div style={{ color: RED }}>sysinfo: Edge API unreachable.</div>;
  }
  if (!info) {
    return <div style={{ color: FAINT }}>Querying host hardware...</div>;
  }

  const memPct = Math.round((info.mem_used_mb / info.mem_total_mb) * 100);
  const rows: [string, string][] = [
    ['OS', 'Raspberry Pi OS Lite (Debian Bookworm)'],
    ['Host', info.model],
    ['Kernel', info.kernel],
    ['Uptime', info.host_uptime],
    ['Shell', 'zsh (react-island)'],
    ['CPU', `Cortex-A72 (${info.cpu_count} cores) · load ${info.load_avg}`],
    ['Memory', `${info.mem_used_mb}MB / ${info.mem_total_mb}MB (${memPct}%)`],
    ...(info.soc_temp !== null ? [['SoC Temp', `${info.soc_temp}°C`] as [string, string]] : []),
    ['Serving', 'kawashiro.dev via Cloudflare Tunnel'],
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-x-8 gap-y-2 my-1 font-mono">
      <pre className="leading-tight shrink-0" aria-hidden="true">
        {LOGO_LEAVES.map((l, i) => (
          <div key={`l${i}`} style={{ color: GREEN }}>{l}</div>
        ))}
        {LOGO_BERRY.map((l, i) => (
          <div key={`b${i}`} style={{ color: RED }}>{l}</div>
        ))}
      </pre>
      <div>
        <div>
          <span style={{ color: GREEN }}>mk</span>
          <span style={{ color: FAINT }}>@</span>
          <span style={{ color: GREEN }}>kawashiro.dev</span>
        </div>
        <div style={{ color: FAINT }}>─────────────────</div>
        {rows.map(([k, v]) => (
          <div key={k}>
            <span style={{ color: BLUE }}>{k}</span>
            <span style={{ color: FAINT }}>: </span>
            <span style={{ color: TEXT }}>{v}</span>
          </div>
        ))}
        <div className="mt-1 flex gap-1">
          {['#f38ba8', '#f9e2af', '#a6e3a1', '#94e2d5', '#89b4fa', '#cba6f7'].map((c) => (
            <span key={c} className="inline-block w-4 h-2.5 rounded-sm" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
    </div>
  );
};
