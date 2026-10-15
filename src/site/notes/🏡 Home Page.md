---
{"dg-publish":true,"permalink":"/home-page/","title":{"pt":"🏡 Página Inicial","en":"🏡 Home Page"},"tags":["gardenEntry"],"dg-note-properties":{"permalink":"/home/","tags":["gardenEntry"],"dgShowComments":false,"dgShowLinkCards":true,"navOrder":1,"title":{"pt":"🏡 Página Inicial","en":"🏡 Home Page"}}}
---

<style>
  .mst-card{
    --mst-tile-w:560px;
    position:relative;height:120px;border-radius:16px;margin:24px 0;overflow:hidden;
    box-shadow:0 4px 20px rgba(0,0,0,.14),0 2px 8px rgba(0,0,0,.08);
    background:linear-gradient(90deg,#ffffff 0 25%,#000000 25% 50%,#0a0818 50% 75%,#fffdf9 75% 100%);
  }
  .mst-layer{position:absolute;inset:0;overflow:hidden;display:flex;align-items:center}
  .mst-track{
    display:flex;width:max-content;
    animation:mst-scroll 12s linear infinite;
    will-change:transform;backface-visibility:hidden;
  }
  .mst-tile{
    display:inline-flex;align-items:center;justify-content:flex-start;gap:.3em;
    flex:0 0 auto;width:var(--mst-tile-w);font-size:2.8rem;line-height:1;
    white-space:nowrap;transform:translateZ(0);
  }
  .mst-tile::after{
    content:"Mike's Stash";display:inline-block;line-height:1;
  }
  .mst-s1{clip-path:inset(0 75% 0 0)}
  .mst-s2{clip-path:inset(0 50% 0 25%)}
  .mst-s3{clip-path:inset(0 25% 0 50%)}
  .mst-s4{clip-path:inset(0 0 0 75%)}
  .mst-light{font-family:'JetBrains Mono','Courier New',monospace;font-weight:700;color:#4a7a12}
  .mst-dark{font-family:'JetBrains Mono','Courier New',monospace;font-weight:700;color:#b8e62e}
  .mst-lunara{
    font-family:'Allura','Cormorant Garamond',cursive;
    font-weight:400;letter-spacing:.01em;color:#e8e6ff;
  }
  .mst-lunara .mst-tile::after{font-size:1.505em;letter-spacing:inherit}
  .mst-nyxa{font-family:'Daft Font',Impact,sans-serif;font-weight:400;color:#e21b23}
  .mst-nyxa .mst-tile::after{
    content:"MIKE'S STASH";font-size:1.301em;letter-spacing:.015em;
  }
  @keyframes mst-scroll{
    from{transform:translate3d(0,0,0)}
    to{transform:translate3d(calc(-1 * var(--mst-tile-w)),0,0)}
  }
</style>

<div class="mst-card">
  <div class="mst-layer mst-s1"><div class="mst-track mst-light"><span class="mst-tile"></span><span class="mst-tile"></span><span class="mst-tile"></span></div></div>
  <div class="mst-layer mst-s2"><div class="mst-track mst-dark"><span class="mst-tile"></span><span class="mst-tile"></span><span class="mst-tile"></span></div></div>
  <div class="mst-layer mst-s3"><div class="mst-track mst-lunara"><span class="mst-tile"></span><span class="mst-tile"></span><span class="mst-tile"></span></div></div>
  <div class="mst-layer mst-s4"><div class="mst-track mst-nyxa"><span class="mst-tile"></span><span class="mst-tile"></span><span class="mst-tile"></span></div></div>
</div>

[[🎨 Drawings & Life Logs\|🎨 Drawings & Life Logs]]
[[🐱 Asher\|🐱 Asher]]
[[🌌 Web Haven\|🌌 Web Haven]]
[[☕︎ Other Projects & Tutorials\|☕︎ Other Projects & Tutorials]]
[[🎧 Playlists\|🎧 Playlists]]
[[ℹ️ Sobre\|ℹ️ Sobre]]