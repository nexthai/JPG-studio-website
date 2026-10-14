import React from 'react';
const paths = {
 arrow:<><path d="M4 12h16M14 6l6 6-6 6"/></>,
 check:<path d="m5 12 5 5L20 7"/>,
 calendar:<><rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8 3v4m8-4v4M4 10h16"/></>,
 target:<><circle cx="11" cy="13" r="8"/><circle cx="11" cy="13" r="4"/><path d="m11 13 9-9m-5 0h5v5"/></>,
 chart:<><path d="M5 20v-5m5 5V9m5 11V4m5 16V7"/></>,
 phone:<><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/></>,
 layers:<><path d="m12 3 10 5-10 5L2 8l10-5Zm-9 10 9 5 9-5M3 18l9 5 9-5"/></>,
 clock:<><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></>,
 pen:<><path d="m4 20 1-6L17 2l5 5-12 12-6 1Zm11-16 5 5M5 14l5 5"/></>,
 apps:<><path d="m8 3 10 18M16 3 6 21M3 15h18"/></>,
 market:<path d="m3 17 6-7 5 4 7-10"/>,
 recipe:<><path d="M7 17v4h10v-4M6 17v-5a4 4 0 0 1-1-8 5 5 0 0 1 7-2 5 5 0 0 1 7 2 4 4 0 0 1-1 8v5H6Z"/></>,
 heart:<path d="M20 4c-3-3-6 0-8 2-2-2-5-5-8-2-5 5 3 12 8 16 5-4 13-11 8-16Z"/>,
 apple:<path d="M16 2c0 2-2 4-4 4 0-2 2-4 4-4ZM17 7c2 0 3 1 4 2-4 2-3 6 0 7-1 4-3 6-5 6-2 0-2-1-4-1s-2 1-4 1C4 22 1 15 3 10c2-4 5-4 9-2 2-1 3-1 5-1Z"/>,
 close:<path d="m6 6 12 12M6 18 18 6"/>,
 menu:<path d="M4 6h16M4 12h16M4 18h16"/>,
 left:<path d="m15 5-7 7 7 7"/>,
 right:<path d="m9 5 7 7-7 7"/>,
 mail:<><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m3 6 9 7 9-7"/></>,
};
export default function Icon({name, size=22, className=''}) { return <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill={name==='apple'?'currentColor':'none'} stroke={name==='apple'?'none':'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]||paths.apps}</svg> }
