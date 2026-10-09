(() => {
  "use strict";
  const $ = selector => document.querySelector(selector);
  const node = (tag, className, text) => { const element=document.createElement(tag); if(className)element.className=className; if(text!==undefined)element.textContent=text; return element; };
  let state, data, savedData, activeSection=0, selectedEntries={}, busy=false, previewKey, previewUrl, previewTimer, previewVersion=0, removeAction;
  const clone = value => structuredClone(value);
  const get = (object,path) => path.reduce((value,key)=>value?.[key],object);
  const set = (object,path,value) => { let target=object; path.slice(0,-1).forEach(key=>{if(!target[key] || typeof target[key]!=="object")target[key]={};target=target[key];}); target[path.at(-1)]=value; };
  const local = value => typeof value==="string" ? value : value?.en || value?.mr || "";
  const dirty = () => JSON.stringify(data)!==savedData;
  const api = async (path,body) => {
    const response=await fetch(`/api/${path}`,body===undefined ? {cache:"no-store"} : {method:"POST",headers:{"Content-Type":"application/json","X-Editor-Token":state.token},body:JSON.stringify(body)});
    const result=await response.json(); if(!response.ok)throw new Error(result.error || "This action could not be completed."); return result;
  };
  const message = (text,error=false) => { const panel=$("#message");panel.textContent=text;panel.hidden=!text;panel.classList.toggle("error",error); };
  const status = () => {
    const changed=dirty(); $("#save-status").textContent=busy ? "Working…" : changed ? "Unsaved changes" : state.savedAt ? "Draft saved" : "Ready to edit";
    $("#save-status").classList.toggle("unsaved",changed);
    $("#save-draft").disabled=busy || !changed; $("#review-publish").disabled=busy || changed;
  };
  const setBusy=value=>{busy=value;status();};
  const changed = () => { status(); clearTimeout(previewTimer);previewTimer=setTimeout(updatePreview,450); };
  function siteName() { return local(data.name) || data.businessName || "Your website"; }

  async function initialize() {
    try {
      state=await api("bootstrap");data=clone(state.data);savedData=JSON.stringify(data);
      $("#site-name").textContent=siteName();document.title=`${siteName()} · Website editor`;
      $("#github-owner").value=state.publishing.owner || "";$("#github-repository").value=state.publishing.repository || "";$("#github-branch").value=state.publishing.branch || "main";
      const nav=$("#section-nav");nav.replaceChildren();
      state.schema.sections.forEach((section,index)=>{
        const button=node("button","section-button");button.type="button";button.append(node("span","",section.icon || "◇"),node("div","",section.title));
        button.addEventListener("click",()=>{activeSection=index;renderSection();});nav.append(button);
      });
      renderSection();status();await updatePreview();
      if(state.lastPublish)message(`Last publication: ${new Date(state.lastPublish.publishedAt).toLocaleString()} · ${state.lastPublish.status==="setup_required" ? "GitHub Pages setup still needed" : "Uploaded to GitHub"}.`);
    } catch(error) { message(error.message,true);$("#section-title").textContent="The editor could not load";$("#section-description").textContent="Open this editor using edit.cmd, then reload this page."; }
  }
  function renderSection() {
    const section=state.schema.sections[activeSection];
    [...$("#section-nav").children].forEach((button,index)=>button.setAttribute("aria-current",String(index===activeSection)));
    $("#section-title").textContent=section.title;$("#section-description").textContent=section.description || "";$("#section-eyebrow").textContent=section.collection ? "KEEP YOUR WEBSITE UP TO DATE" : "MAKE IT YOUR OWN";
    const container=$("#section-fields");container.replaceChildren();
    if(section.collection){renderCollection(section,container);return;}
    const card=node("div","fields-card");section.fields.forEach(field=>card.append(renderField(field,data,field.path)));container.append(card);
  }
  function renderField(field,object,path) {
    const wrapper=node("div","field-wrapper");const value=get(object,path);
    if(field.type==="localized") {
      const group=node("div","localized-field");group.append(node("span","localized-title",field.label));const grid=node("div","field-grid");
      for(const language of ["en","mr"]){
        const label=node("label","language-label",language==="en"?"English":"मराठी");
        const input=node(field.multiline?"textarea":"input");if(!field.multiline)input.type="text";else input.rows=3;
        input.value=typeof value==="string" ? language==="en"?value:"" : value?.[language] || "";input.maxLength=12000;input.lang=language;
        input.addEventListener("input",()=>{let localized=get(object,path);if(typeof localized==="string")localized={en:localized,mr:""};if(!localized)localized={en:"",mr:""};localized[language]=input.value;set(object,path,localized);changed();});
        label.append(input);grid.append(label);
      }
      group.append(grid);if(field.help)group.append(node("span","field-description",field.help));wrapper.append(group);return wrapper;
    }
    if(field.type==="boolean") {
      const label=node("label","checkbox-label"),input=node("input");input.type="checkbox";input.checked=!!value;
      const text=node("span");text.append(node("strong","",field.label));if(field.help)text.append(node("small","",field.help));
      input.addEventListener("change",()=>{set(object,path,input.checked);changed();});label.append(input,text);wrapper.append(label);return wrapper;
    }
    const label=node("label","",field.label);
    const input=node(field.type==="textarea"?"textarea":field.type==="select"?"select":"input");
    if(field.type==="select")field.options.forEach(option=>{const entry=node("option","",typeof option==="string"?option:option.label);entry.value=typeof option==="string"?option:option.value;input.append(entry);});
    else if(field.type!=="textarea")input.type=["email","url","time","number"].includes(field.type)?field.type:"text";
    input.value=value ?? "";input.required=!!field.required;
    if(field.type==="number"){input.min=field.min ?? 0;input.max=field.max ?? 9999;input.step=1;}else input.maxLength=12000;
    if(field.type==="textarea")input.rows=4;
    if(field.placeholder)input.placeholder=field.placeholder;
    input.addEventListener(field.type==="select"?"change":"input",()=>{set(object,path,field.type==="number"?Number(input.value):input.value);changed();});
    label.append(input);if(field.help)label.append(node("span","field-description",field.help));wrapper.append(label);
    if(field.type==="image") {
      const tools=node("div","image-tools");const image=node("img","image-thumb");image.alt="Selected image";image.hidden=!value;if(value)image.src=new URL(value,location.origin+"/").href;
      const uploadLabel=node("label","upload-label","Upload image");const upload=node("input");upload.type="file";upload.accept="image/jpeg,image/png,image/webp";
      upload.addEventListener("change",async()=>{
        const file=upload.files[0];if(!file)return;
        if(file.size>8_000_000){message("Choose an image smaller than 8 MB.",true);return;}
        setBusy(true);upload.disabled=true;
        try {
          const encoded=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(",")[1]);reader.onerror=reject;reader.readAsDataURL(file);});
          const result=await api("upload",{data:encoded});set(object,path,result.path);input.value=result.path;image.src=`/${result.path}`;image.hidden=false;changed();message("Image added to this computer. Save the draft to keep it in this entry.");
        } catch(error){message(error.message,true);}finally{setBusy(false);upload.disabled=false;}
      });
      input.addEventListener("input",()=>{image.hidden=!input.value;if(input.value)image.src=new URL(input.value,location.origin+"/").href;});
      uploadLabel.append(upload);tools.append(image,uploadLabel,node("span","","JPG, PNG, or WebP · up to 8 MB"));wrapper.append(tools);
    }
    return wrapper;
  }
  function entryName(item,index) { return local(item.title) || local(item.name) || `Entry ${index+1}`; }
  function renderCollection(section,container) {
    const entries=data[section.collection] || [],bar=node("div","collection-bar");bar.append(node("p","",`${entries.length} ${entries.length===1?"entry":"entries"}`));
    const add=node("button","button secondary",`+ ${section.addLabel || "Add entry"}`);add.type="button";
    add.addEventListener("click",()=>{const item=clone(section.template);if("id" in item)item.id=crypto.randomUUID();entries.push(item);data[section.collection]=entries;selectedEntries[section.collection]=entries.length-1;changed();renderSection();});
    bar.append(add);container.append(bar);
    if(!entries.length){container.append(node("div","collection-empty",section.emptyMessage || "Add the first entry to get started. It will appear on the website after you publish."));return;}
    const selected=Math.min(selectedEntries[section.collection] || 0,entries.length-1);selectedEntries[section.collection]=selected;
    const list=node("div","entry-list");entries.forEach((item,index)=>{const button=node("button","entry-button",entryName(item,index));button.type="button";button.setAttribute("aria-pressed",String(index===selected));button.addEventListener("click",()=>{selectedEntries[section.collection]=index;renderSection();});list.append(button);});container.append(list);
    const card=node("div","fields-card");card.append(node("h3","",entryName(entries[selected],selected)));
    section.fields.forEach(field=>card.append(renderField(field,entries[selected],field.path)));
    const actions=node("div","entry-actions"),move=node("div");
    [-1,1].forEach(direction=>{const button=node("button","",direction===-1?"↑ Move earlier":"↓ Move later");button.type="button";button.disabled=selected+direction<0 || selected+direction>=entries.length;button.addEventListener("click",()=>{[entries[selected],entries[selected+direction]]=[entries[selected+direction],entries[selected]];selectedEntries[section.collection]=selected+direction;changed();renderSection();});move.append(button);});
    const remove=node("button","remove-entry","Remove entry");remove.type="button";remove.addEventListener("click",()=>{removeAction=()=>{entries.splice(selected,1);selectedEntries[section.collection]=Math.max(0,selected-1);changed();renderSection();};$("#remove-dialog").showModal();});
    actions.append(move,remove);card.append(actions);container.append(card);
  }
  async function saveDraft() {
    if(busy || !dirty())return;
    if(!$("#content-form").reportValidity())return;
    const snapshot=clone(data);setBusy(true);
    try{const result=await api("save",{data:snapshot,revision:state.revision});state.revision=result.revision;state.savedAt=result.savedAt;savedData=JSON.stringify(snapshot);$("#site-name").textContent=siteName();message("Draft saved on this computer. The published website has not changed.");await updatePreview();}
    catch(error){message(error.message,true);}finally{setBusy(false);}
  }
  async function updatePreview() {
    if(!data)return;
    const version=++previewVersion;$("#preview-status").textContent="Updating preview…";
    try{const result=await api("preview",{data:clone(data),key:previewKey});if(version!==previewVersion)return;previewKey=result.key;previewUrl=result.url;$("#preview-status").textContent="Loading draft preview…";$("#preview").src=`${result.url}?v=${Date.now()}`;$("#open-preview").disabled=false;fitPreview();}
    catch(error){if(version===previewVersion)$("#preview-status").textContent="Save valid content to refresh the preview.";}
  }
  $("#save-draft").addEventListener("click",saveDraft);
  $("#content-form").addEventListener("submit",event=>{event.preventDefault();saveDraft();});
  $("#review-publish").addEventListener("click",()=>{
    if(dirty()){message("Save your latest changes before publishing.",true);return;}
    $("#publication-review").hidden=true;$("#publication-result").hidden=true;$("#publishing-form").hidden=false;$("#publish-dialog").showModal();
  });
  $("#close-publish").addEventListener("click",()=>{if(!busy)$("#publish-dialog").close();});
  $("#connect-github").addEventListener("click",async()=>{
    const button=$("#connect-github");button.disabled=true;$("#github-status").textContent="Checking the account signed in on this computer…";
    try{const result=await api("connect",{owner:$("#github-owner").value});$("#github-owner").value=result.login;$("#github-status").textContent=`Signed in as ${result.name} (${result.login}).`;}
    catch(error){$("#github-status").textContent=error.message;}finally{button.disabled=false;}
  });
  $("#publishing-form").addEventListener("submit",async event=>{
    event.preventDefault();if(busy || !event.currentTarget.reportValidity())return;setBusy(true);$("#prepare-publish").disabled=true;$("#github-status").textContent="Reviewing the saved draft and GitHub repository…";
    try {
      const review=await api("prepare-publish",{owner:$("#github-owner").value,repository:$("#github-repository").value,branch:$("#github-branch").value,revision:state.revision});
      const panel=$("#publication-review");panel.replaceChildren(node("h3","","Your website is ready to publish"));
      panel.append(node("p","",`${review.target.owner}/${review.target.repository} · ${review.target.branch}\n${review.changed.length} website files will be updated.`));
      if(review.createsRepository)panel.append(node("p","","A new public GitHub repository will be created for this website."));
      panel.append(node("p","",`Website address: ${review.publicUrl}`));
      const list=node("ul");review.changed.forEach(file=>list.append(node("li","",file.path)));panel.append(list);
      const publish=node("button","button primary","Publish these changes ↗");publish.type="button";publish.addEventListener("click",()=>publishWebsite(review.ticket,publish));panel.append(publish);panel.hidden=false;$("#github-status").textContent="Review the destination and changes below.";
    } catch(error){$("#github-status").textContent=error.message;}finally{setBusy(false);$("#prepare-publish").disabled=false;}
  });
  async function publishWebsite(ticket,button) {
    setBusy(true);button.disabled=true;button.textContent="Publishing…";$("#publishing-form").classList.add("busy");
    try {
      const result=await api("publish",{ticket});const panel=$("#publication-result");panel.replaceChildren();panel.hidden=false;
      panel.append(node("h3","",result.status==="setup_required"?"Content uploaded. One setup step remains.":"Your changes are on GitHub."));
      panel.append(node("p","",result.status==="setup_required"?`GitHub Pages setup could not finish automatically.\n${result.setupError}\nOpen the Pages settings below and choose the publishing branch with / (root).`:"GitHub Pages is preparing the website. It can take a few minutes for the changes to appear."));
      for(const [url,text] of [[result.url,"Open website ↗"],[result.actionsUrl,"View deployment progress ↗"],...(result.status==="setup_required"?[[result.settingsUrl,"Open GitHub Pages settings ↗"]]:[])]){const link=node("a","",text);link.href=url;link.target="_blank";link.rel="noopener noreferrer";panel.append(link);}
      $("#publication-review").hidden=true;state.lastPublish=result;message(`Published ${result.filesChanged} changed files to GitHub. ${result.status==="setup_required"?"Complete the Pages setup shown in the publication window.":"The website will update when GitHub Pages finishes deploying."}`);button.textContent="Published";
    } catch(error){$("#github-status").textContent=error.message;button.textContent="Review again to retry";$("#publication-review").hidden=true;}finally{setBusy(false);$("#publishing-form").classList.remove("busy");}
  }
  function fitPreview() {
    const shell=$("#preview-shell"),frame=$("#preview"),width=shell.classList.contains("mobile")?375:1280;
    const scale=Math.min(1,shell.clientWidth/width);if(!scale)return;
    frame.style.width=`${width}px`;frame.style.height=`${shell.clientHeight/scale}px`;frame.style.transform=`scale(${scale})`;frame.style.transformOrigin="top left";
  }
  $("#preview").addEventListener("load",()=>{if(previewUrl)$("#preview-status").textContent="Draft only · your live website is unchanged";fitPreview();});
  new ResizeObserver(fitPreview).observe($("#preview-shell"));
  for(const size of ["desktop","mobile"])$("#preview-"+size).addEventListener("click",()=>{$("#preview-shell").classList.toggle("mobile",size==="mobile");["desktop","mobile"].forEach(other=>$("#preview-"+other).setAttribute("aria-pressed",String(size===other)));fitPreview();});
  $("#open-preview").addEventListener("click",()=>{if(previewUrl)window.open(previewUrl,"_blank","noopener,noreferrer");});
  $("#cancel-remove").addEventListener("click",()=>{$("#remove-dialog").close();removeAction=null;});
  $("#confirm-remove").addEventListener("click",()=>{removeAction?.();removeAction=null;$("#remove-dialog").close();});
  $("#download-backup").addEventListener("click",()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));const link=node("a");link.href=url;link.download=`website-content-${new Date().toISOString().slice(0,10)}.json`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  $("#restore-backup").addEventListener("change",async event=>{
    const file=event.target.files[0];if(!file)return;
    try{if(file.size>2_000_000)throw new Error("Choose a website content backup smaller than 2 MB.");const restored=JSON.parse(await file.text());if(!restored || typeof restored!=="object" || Array.isArray(restored))throw new Error("Choose a valid website content backup.");data=restored.data || restored;selectedEntries={};renderSection();changed();message("Backup loaded into the editor. Check the content, then save the draft.");}
    catch(error){message(error.message,true);}event.target.value="";
  });
  window.addEventListener("beforeunload",event=>{if(data && dirty() || busy){event.preventDefault();event.returnValue="";}});
  $("#publish-dialog").addEventListener("cancel",event=>{if(busy)event.preventDefault();});
  initialize();
})();
