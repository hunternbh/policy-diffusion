(() => {
  const kind=document.querySelector('#register-kind');
  if(!kind)return;
  const family=document.querySelector('#register-family'), source=document.querySelector('#register-source'), query=document.querySelector('#register-query');
  const body=document.querySelector('#register-rows'), count=document.querySelector('#register-count'), pageLabel=document.querySelector('#register-page');
  const previous=document.querySelector('#register-prev'), next=document.querySelector('#register-next');
  const labels={"IFRS": "Financial reporting (IFRS)", "GOVERNANCE": "Governance disclosure", "ESG_SCOPED": "Multi-topic sustainability", "CLIMATE_DISCLOSURE": "Climate reporting", "CLIMATE_SECTORAL": "Climate: financial institutions", "SUSTAINABILITY_FINANCIAL": "Sustainability-related financial reporting", "SUSTAINABILITY_INFORMED": "ISSB-informed sector reporting", "XBRL": "Structured financial filing", "AUDIT_REPORTING": "Expanded auditor reporting", "AUDIT_OVERSIGHT": "Audit oversight / rotation", "BENEFICIAL_OWNERSHIP": "Beneficial-ownership registers", "CBCR_CONFIDENTIAL": "Confidential tax CbCR", "CBCR_PUBLIC": "Public tax CbCR: general MNEs", "EXTRACTIVE_PAYMENTS": "Extractive-payment reporting", "SUPPLY_CHAIN": "Supply-chain reporting / due diligence", "DIGITAL_ASSET": "Token-offer / digital-asset rules", "ESG_CSR": "Inherited ESG document"};
  const stateNames={original_source_saved_text_available:'Original saved · text available',linked_official_source_saved_text_available:'Linked official source saved',author_repository_files_saved_text_available:'Author data saved · published proxy',readable_derivative_or_excerpt_only:'Derivative / excerpt only',publication_metadata_only:'Publication metadata only',saved_response_without_readable_source:'Saved response · no readable source',source_unavailable:'Source unavailable',legacy_local_document_saved:'Local legacy document saved'};
  let page=0;
  const size=50;
  const el=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};
  fetch('data/regulations/catalog.json').then(r=>{if(!r.ok)throw new Error('Unavailable');return r.json();}).then(data=>{
    function render(){
      const needle=query.value.trim().toLocaleLowerCase();
      const rows=data[kind.value].filter(r=>(family.value==='all'||r.family===family.value)&&(source.value==='all'||source.value==='saved'&&r.saved||source.value==='excerpt'&&r.excerpt||source.value==='missing'&&!r.saved&&!r.excerpt)&&(!needle||[r.record_id,r.jurisdiction,r.family,labels[r.family],r.mandate,r.scope,r.event_type,r.date].join(' ').toLocaleLowerCase().includes(needle)));
      const pages=Math.max(1,Math.ceil(rows.length/size));page=Math.min(page,pages-1);
      const fragment=document.createDocumentFragment();
      for(const r of rows.slice(page*size,(page+1)*size)){
        const tr=el('tr');
        const country=el('th');country.scope='row';country.append(el('strong',r.jurisdiction),el('span',kind.value==='legacy'?'Inherited ESG document':labels[r.family],'registry-secondary'));tr.append(country);
        const mandate=el('td');mandate.append(el('strong',r.mandate),el('span',r.event_type.replaceAll('_',' '),'registry-secondary'));
        if(r.scope){const detail=el('details');detail.append(el('summary','Scope / requirements'),el('p',r.scope));mandate.append(detail);}tr.append(mandate);
        const date=el('td',r.date===null||r.date===''?'Unresolved':String(r.date));date.append(el('span',r.date_basis.replaceAll('_',' '),'registry-secondary'));tr.append(date);
        const evidence=el('td');evidence.append(el('span',stateNames[r.archive_status]||r.archive_status,`source-badge ${r.saved?'source-saved':r.excerpt?'source-excerpt':'source-missing'}`));
        if(r.source_url&&r.source_url.startsWith('https://')){const link=el('a','Recorded source ↗');link.href=r.source_url;link.target='_blank';link.rel='noopener';evidence.append(link);}else evidence.append(el('span',r.document_name||'Local archive','registry-secondary'));
        tr.append(evidence);
        const record=el('td');const link=el('a','JSON ↓');link.href=`data/regulations/${kind.value==='legacy'?'legacy-records':'records'}/${encodeURIComponent(r.record_id)}.json`;link.setAttribute('download','');link.setAttribute('aria-label',`Download ${r.record_id} JSON`);record.append(link,el('span',r.record_id,'registry-record-id'));tr.append(record);
        fragment.append(tr);
      }
      if(!rows.length){const tr=el('tr'),td=el('td','No records match these filters.');td.colSpan=5;tr.append(td);fragment.append(tr);}
      body.replaceChildren(fragment);
      count.textContent=rows.length?`${page*size+1}–${Math.min((page+1)*size,rows.length)} of ${rows.length} matching ${kind.value==='legacy'?'inherited document codings':'event records'}.`:'No matching records.';
      pageLabel.textContent=`Page ${page+1} of ${pages}`;previous.disabled=page===0;next.disabled=page>=pages-1;
    }
    for(const input of [family,source])input.addEventListener('change',()=>{page=0;render();});
    query.addEventListener('input',()=>{page=0;render();});
    kind.addEventListener('change',()=>{page=0;family.value='all';source.value='all';family.disabled=kind.value==='legacy';render();});
    previous.addEventListener('click',()=>{page--;render();});next.addEventListener('click',()=>{page++;render();});render();
  }).catch(()=>{count.textContent='The catalogue could not be loaded. Use the master JSON, ZIP download and coverage table.';for(const x of [kind,family,source,query])x.disabled=true;});
})();
