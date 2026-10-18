'use strict';
(() => {
  const outcome = document.querySelector('#outcome');
  const family = document.querySelector('#family');
  const chart = document.querySelector('#comparison-chart');
  const summary = document.querySelector('#chart-summary');
  const NS = 'http://www.w3.org/2000/svg';
  const names = {log_spread: 'Log spread', log_impact: 'Log price impact', zero_fraction: 'Zero-return fraction'};
  const make = (tag, attrs = {}, content) => {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    if (content !== undefined) el.textContent = content;
    return el;
  };
  const number = (raw) => raw === '' || raw === null || raw === undefined ? null : Number(raw);
  const format = value => value === null || !Number.isFinite(value) ? 'Not estimated' : (value > 0 ? '+' : '') + value.toFixed(4);
  fetch('data/report-data.json').then(r => {
    if (!r.ok) throw new Error('Report data could not be loaded');
    return r.json();
  }).then(data => {
    function render() {
      const selected = outcome.value;
      const codes = Object.keys(data.labels).filter(code => family.value === 'all' || code === family.value);
      const rows = codes.map(code => {
        const row = data.comparisons.find(d => d.family === code && d.outcome === selected && Number(d.horizon) === 1);
        return {code, label: data.labels[code], row, estimate: number(row?.estimate), lo: number(row?.loco_low), hi: number(row?.loco_high)};
      });
      const values = rows.flatMap(d => [d.estimate, d.lo, d.hi]).filter(x => x !== null && Number.isFinite(x));
      let min = Math.min(0, ...values), max = Math.max(0, ...values);
      if (min === max) { min = selected === 'zero_fraction' ? -.01 : -.1; max = -min; }
      const span = max - min;
      min -= span * .1; max += span * .1;
      const W = 1050, left = 190, right = 175, top = 33, rowH = 41, bottom = 61;
      const H = top + rowH * rows.length + bottom;
      const x = value => left + ((value - min) / (max - min)) * (W - left - right);
      const svg = make('svg', {viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-labelledby': 'plot-title plot-desc'});
      svg.append(make('title', {id:'plot-title'}, `${names[selected]}: conditional liquidity comparisons`));
      svg.append(make('desc', {id:'plot-desc'}, 'Dots show g+1 versus g−1 comparisons; lines show assignment-cluster deletion sensitivity, not confidence intervals. Four policy families lack primary support. Exact estimates and support are in Table 3.'));
      const axisY = top + rowH * rows.length;
      for (let i = 0; i <= 5; i++) {
        const val = min + (max-min)*i/5, px = x(val);
        svg.append(make('line', {x1:px,y1:top-18,x2:px,y2:axisY,stroke:'#e1e6dc','stroke-width':1}));
        svg.append(make('text', {x:px,y:axisY+23,'text-anchor':'middle',fill:'#657473','font-size':11,'font-family':'system-ui'}, val.toFixed(selected === 'zero_fraction' ? 3 : 2)));
      }
      svg.append(make('line', {x1:x(0),y1:top-18,x2:x(0),y2:axisY,stroke:'#718c80','stroke-dasharray':'4 4','stroke-width':1.5}));
      svg.append(make('text', {x:W-right+28,y:14,fill:'#657473','font-size':10,'font-family':'system-ui'}, 'COMPARISON'));
      rows.forEach((d, i) => {
        const cy = top + i * rowH + 12;
        if (i % 2 === 0) svg.append(make('rect', {x:0,y:cy-16,width:W,height:rowH,fill:'#f6f7f2'}));
        svg.append(make('text', {x:0,y:cy+4,fill:'#20373b','font-size':12,'font-family':'system-ui'}, d.label));
        if (d.estimate === null) {
          svg.append(make('text', {x:left+15,y:cy+4,fill:'#7c8682','font-size':11,'font-family':'system-ui'}, '— insufficient support'));
          svg.append(make('text', {x:W-right+28,y:cy+4,fill:'#7c8682','font-size':11,'font-family':'system-ui'}, 'Not estimated'));
          return;
        }
        const group = make('g');
        group.append(make('title', {}, `${d.label}: ${format(d.estimate)}; deletion range ${format(d.lo)} to ${format(d.hi)}; ${d.row.treated_country_cohort_count} treated countries, ${d.row.supported_cohorts} cohorts. Not a confidence interval.`));
        if (d.lo !== null && d.hi !== null) {
          group.append(make('line', {x1:x(d.lo),x2:x(d.hi),y1:cy,y2:cy,stroke:'#90aa9e','stroke-width':3}));
          for (const v of [d.lo, d.hi]) group.append(make('line', {x1:x(v),x2:x(v),y1:cy-5,y2:cy+5,stroke:'#90aa9e','stroke-width':1.5}));
        }
        group.append(make('circle', {cx:x(d.estimate),cy,r:5.3,fill:d.estimate<0?'#276955':'#a55336',stroke:'#fffefb','stroke-width':1.5}));
        group.append(make('text', {x:W-right+28,y:cy+4,fill:'#20373b','font-size':12,'font-family':'ui-monospace,Consolas,monospace'}, format(d.estimate)));
        svg.append(group);
      });
      // Draw the zero reference above the alternating row backgrounds.
      svg.append(make('line', {x1:x(0),y1:top-18,x2:x(0),y2:axisY,stroke:'#718c80','stroke-dasharray':'4 4','stroke-width':1,opacity:.45}));
      svg.append(make('text', {x:(left+W-right)/2,y:H-9,'text-anchor':'middle',fill:'#5c6c6e','font-size':11,'font-family':'system-ui'}, selected==='zero_fraction' ? 'Change in fraction of zero-return days' : 'Change in log points'));
      chart.replaceChildren(svg);
      const valid = rows.filter(r => r.estimate !== null);
      const negative = valid.filter(r => r.estimate < 0).length;
      summary.textContent = valid.length ? `${names[selected]} · ${valid.length} supported ${valid.length===1?'family':'families'} · ${negative} negative ${negative===1?'comparison':'comparisons'}. Primary horizon: g+1 relative to g−1.` : `${names[selected]} · No supported primary comparison for ${data.labels[family.value]}. This is missing evidence, not a zero effect.`;
      document.querySelectorAll('#table-3 tbody tr').forEach(tr => {
        tr.hidden = family.value !== 'all' && tr.dataset.family !== family.value;
      });
    }
    outcome.addEventListener('change',render);
    family.addEventListener('change',render);
    render();
  }).catch(() => {
    summary.textContent = 'The interactive data could not be loaded. All comparisons remain available in Table 3 and the downloadable CSV.';
    outcome.disabled = true; family.disabled = true;
  });
})();
