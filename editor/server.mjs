import { createServer } from "node:http";
import { readFile, writeFile, mkdir, rename, readdir, realpath } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { randomBytes, randomUUID, createHash, timingSafeEqual } from "node:crypto";
import { spawn } from "node:child_process";

const json = value => JSON.stringify(value, null, 2);
const hash = value => createHash("sha256").update(value).digest("hex");
const mimeTypes = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".svg":"image/svg+xml", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".webp":"image/webp", ".avif":"image/avif", ".gif":"image/gif" };
const fail = (message, status = 400) => Object.assign(new Error(message), { status });
const configSource = (variable, data) => `// Public website data. Managed by the local website editor. Never add secrets.\nwindow.${variable} = ${json(data).replaceAll("<", "\\u003c").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029")};\n`;
const readJson = async (path, fallback) => { try { return JSON.parse(await readFile(path, "utf8")); } catch (error) { if (error.code === "ENOENT") return fallback; throw error; } };
const atomicWrite = async (path, data) => { const temporary = `${path}.${randomUUID()}.tmp`; await writeFile(temporary, data); await rename(temporary, path); };
const gitHash = buffer => createHash("sha1").update(`blob ${buffer.length}\0`).update(buffer).digest("hex");
const escapeHtml = value => String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;");
export function renderPublicHtml(html, data) {
  const local=value=>typeof value==="string" ? value : value?.en;
  html=html.replace(/<([a-z][\w:-]*)\b([^>]*\bdata-(copy|config|i18n)="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/gi,(original,tag,attributes,kind,key)=>{
    const value=kind==="copy" ? data.copy?.[key] : kind==="config" ? local(data[key]) : data.copy?.[key]?.en;
    if(typeof value!=="string")return original;
    return `<${tag}${attributes}>${escapeHtml(value.replaceAll("{{businessName}}",data.businessName || ""))}</${tag}>`;
  });
  if(data.businessName)html=html.replace(/(<span\b[^>]*\bdata-brand\b[^>]*>)[\s\S]*?(<\/span>)/gi,(_,open,close)=>open+escapeHtml(data.businessName)+close);
  const title=data.businessName ? `${data.businessName} — Business Growth Coaching` : `${local(data.name) || "Ganpati mandal"} · ${data.copy?.footerTagline?.en || "Faith. Festivity. Togetherness."}`;
  html=html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${escapeHtml(title)}</title>`);
  if(typeof data.description==="string")html=html.replace(/(<meta\b[^>]*(?:name="description"|property="og:description")[^>]*content=")[^"]*("[^>]*>)/gi,(_,open,close)=>open+escapeHtml(data.description)+close);
  if(data.businessName)html=html.replace(/(<meta\b[^>]*property="og:title"[^>]*content=")[^"]*("[^>]*>)/gi,(_,open,close)=>open+escapeHtml(title)+close);
  return html;
}

export function validateData(data, schema) {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw fail("Website data must be an object.");
  const validateField = (value, field, label) => {
    if (field.type === "localized") {
      if (typeof value === "string") { if (value.length > 12000) throw fail(`${label} is too long.`); return; }
      if (!value || typeof value !== "object" || Array.isArray(value)) throw fail(`${label} needs English and Marathi text.`);
      for (const [key, text] of Object.entries(value)) if (!["en", "mr"].includes(key) || typeof text !== "string" || text.length > 12000) throw fail(`${label} contains invalid language data.`);
    } else if (field.type === "boolean") { if (typeof value !== "boolean") throw fail(`${label} must be a checkbox value.`); }
    else if (field.type === "number") {
      if (!Number.isInteger(value) || value < (field.min ?? 0) || value > (field.max ?? 9999)) throw fail(`${label} must be between ${field.min ?? 0} and ${field.max ?? 9999}.`);
    } else {
      if (typeof value !== "string" || value.length > 12000) throw fail(`${label} must be text, up to 12,000 characters.`);
      if (field.type === "url" && value && !/^https:\/\//i.test(value)) throw fail(`${label} must start with https://.`);
      if (field.type === "image" && value && !(/^https:\/\//i.test(value) || /^(?:\.\/)?assets\/[\w./-]+\.(?:svg|png|jpe?g|webp|gif|avif)$/i.test(value) && !value.includes(".."))) throw fail(`${label} needs an uploaded image or an HTTPS image URL.`);
      if (field.type === "select" && !field.options.some(option => (typeof option === "string" ? option : option.value) === value)) throw fail(`${label} has an invalid choice.`);
      if (field.type === "time" && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) throw fail(`${label} needs a valid time.`);
      if (field.type === "email" && value && !/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(value)) throw fail(`${label} needs a valid email address.`);
    }
    if (field.required && (typeof value === "string" ? !value.trim() : field.type === "localized" ? !Object.values(value).some(text => text.trim()) : value == null)) throw fail(`${label} is required.`);
  };
  const valueAt = (object, path) => path.reduce((value, key) => value?.[key], object);
  for (const section of schema.sections) {
    if (section.collection) {
      const items = data[section.collection];
      if (!Array.isArray(items) || items.length > 500) throw fail(`${section.title} must contain at most 500 entries.`);
      items.forEach((item, index) => { if (!item || typeof item !== "object" || Array.isArray(item)) throw fail(`${section.title} entry ${index + 1} is invalid.`); section.fields.forEach(field => validateField(valueAt(item, field.path), field, `${section.title}, entry ${index + 1}: ${field.label}`)); });
    } else section.fields.forEach(field => validateField(valueAt(data, field.path), field, field.label));
  }
  const checkKeys = object => { if (!object || typeof object !== "object") return; for (const key of Object.keys(object)) { if (["__proto__", "constructor", "prototype"].includes(key)) throw fail("Invalid data key."); checkKeys(object[key]); } };
  checkKeys(data);
  if (Buffer.byteLength(JSON.stringify(data)) > 2_000_000) throw fail("Website data is too large.");
  return data;
}

export function startEditorServer({root, port, variable, defaultPublishing = {}, credentialProvider, githubFetch = globalThis.fetch, openEditor = false}) {
  root = resolve(root);
  const privateRoot = resolve(root, ".editor-data"), draftPath = resolve(privateRoot, "draft.json"), settingsPath = resolve(privateRoot, "publishing.json");
  const csrfToken = randomBytes(32).toString("hex"), tickets = new Map(), previews = new Map();
  let mutating = false;
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error("Use a port between 0 and 65535.");
  const readCurrent = async () => {
    const source = await readFile(resolve(root, "site.config.js"), "utf8");
    const body = source.match(/\{[\s\S]*\}/)?.[0];
    try { return JSON.parse(body); } catch { throw fail("site.config.js must contain the editor’s JSON data format.", 500); }
  };
  const readState = async () => { const draft = await readJson(draftPath, null); const data = draft?.data ?? await readCurrent(); return { data, revision: hash(JSON.stringify(data)), savedAt: draft?.savedAt ?? null }; };
  const publicFiles = async data => {
    const files = new Map();
    files.set("index.html",Buffer.from(renderPublicHtml(await readFile(resolve(root,"index.html"),"utf8"),data)));
    for (const file of ["styles.css", "app.js", ".nojekyll"]) files.set(file, await readFile(resolve(root, file)));
    files.set("site.config.js", Buffer.from(configSource(variable, data)));
    const referencedUploads=new Set(JSON.stringify(data).match(/assets\/uploads\/[a-zA-Z0-9_.-]+/g) || []);
    const assets = async (directory, prefix) => {
      for (const entry of await readdir(directory, {withFileTypes:true})) {
        if (entry.isSymbolicLink()) continue;
        const path = resolve(directory, entry.name), name = `${prefix}/${entry.name}`;
        if (entry.isDirectory()) await assets(path, name);
        else if (entry.isFile() && mimeTypes[extname(entry.name).toLowerCase()] && (!name.startsWith("assets/uploads/") || referencedUploads.has(name))) files.set(name, await readFile(path));
      }
    };
    await assets(resolve(root, "assets"), "assets"); return files;
  };
  const snapshotHash = files => hash([...files].map(([name, contents]) => `${name}:${hash(contents)}`).sort().join("\n"));
  const settings = async () => ({branch:"main", ...defaultPublishing, ...await readJson(settingsPath, {})});
  function credential(owner) {
    if (credentialProvider) return credentialProvider(owner);
    return new Promise((resolveCredential, reject) => {
      const process = spawn("git", ["credential", "fill"], {cwd:root, windowsHide:true, stdio:["pipe","pipe","pipe"], env:{...globalThis.process.env, GIT_TERMINAL_PROMPT:"0", GCM_INTERACTIVE:"Never"}});
      let output = "", settled = false;
      const timer = setTimeout(() => { process.kill(); if (!settled) { settled = true; reject(fail("GitHub sign-in timed out. Sign in through Git Credential Manager, then try again.")); } }, 20000);
      process.stdout.on("data", chunk => { output += chunk; if (output.length > 100000) process.kill(); });
      process.stderr.resume();
      process.on("error", () => { clearTimeout(timer); if (!settled) { settled = true; reject(fail("Git is not available. Install Git for Windows and sign in to GitHub first.")); } });
      process.on("close", code => {
        clearTimeout(timer); if (settled) return; settled = true;
        const values = Object.fromEntries(output.split(/\r?\n/).filter(line => line.includes("=")).map(line => { const index = line.indexOf("="); return [line.slice(0,index), line.slice(index+1)]; }));
        output = "";
        if (code !== 0 || !values.password) { reject(fail("No saved GitHub sign-in was found. Use Git Credential Manager or your Git account switcher to sign in, then retry.")); return; }
        resolveCredential(values.password);
      });
      process.stdin.end(`protocol=https\nhost=github.com\n${owner ? `username=${owner}\n` : ""}\n`);
    });
  }
  const targetFrom = body => {
    const owner = String(body.owner || "").trim(), repository = String(body.repository || "").trim(), branch = String(body.branch || "main").trim();
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,38}$/.test(owner) || !/^[a-zA-Z0-9_.-]{1,100}$/.test(repository) || repository === "." || repository === ".." || !/^[a-zA-Z0-9][a-zA-Z0-9_/-]{0,100}$/.test(branch) || branch.includes("//") || branch.endsWith("/")) throw fail("Enter a valid GitHub username, repository name, and branch.");
    return {owner, repository, branch};
  };
  const github = token => async (path, method = "GET", body, allow404 = false) => {
    let response;
    try { response = await githubFetch(`https://api.github.com${path}`, {method, headers:{Accept:"application/vnd.github+json", Authorization:`Bearer ${token}`, "User-Agent":"Local-Website-Editor", "X-GitHub-Api-Version":"2026-03-10", ...(body ? {"Content-Type":"application/json"} : {})}, body:body ? JSON.stringify(body) : undefined, signal:AbortSignal.timeout(25000)}); }
    catch { throw fail("GitHub could not be reached. Check the internet connection and retry.", 502); }
    const result = await response.json().catch(() => ({}));
    if (allow404 && response.status === 404) return null;
    if (!response.ok) throw fail(`GitHub ${response.status}: ${String(result.message || "Request failed").slice(0,240)}`, response.status === 401 || response.status === 403 ? 403 : 502);
    return result;
  };
  const authorizeTarget = async (target, api) => {
    const user = await api("/user");
    if (user.login.toLowerCase() !== target.owner.toLowerCase()) throw fail(`Signed in as ${user.login}. Select that account or sign in as ${target.owner}.`, 403);
    return user;
  };
  const reply = (response, status, data) => { const buffer = Buffer.from(JSON.stringify(data)); response.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Content-Length":buffer.length,"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}); response.end(buffer); };
  const readBody = async request => {
    let length = 0; const chunks = [];
    for await (const chunk of request) { length += chunk.length; if (length > 12_000_000) throw fail("Request is too large.", 413); chunks.push(chunk); }
    try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { throw fail("Invalid JSON request."); }
  };

  const server = createServer(async (request,response) => {
    try {
      const allowedHosts = [`127.0.0.1:${port}`,`localhost:${port}`];
      if (!allowedHosts.includes(request.headers.host)) throw fail("Invalid local host.",403);
      const origin = `http://${request.headers.host}`;
      const url = new URL(request.url,origin), pathname = decodeURIComponent(url.pathname);
      if (pathname.startsWith("/api/")) {
        if (request.headers["sec-fetch-site"] === "cross-site" || request.headers.origin && request.headers.origin !== origin) throw fail("Open the editor on this computer to continue.",403);
        if (request.method === "GET" && pathname === "/api/bootstrap") {
          const state = await readState(), schema = await readJson(resolve(root,"editor/schema.json"));
          reply(response,200,{...state,token:csrfToken,variable,schema,publishing:await settings(),lastPublish:await readJson(resolve(privateRoot,"last-publish.json"),null),html:await readFile(resolve(root,"index.html"),"utf8")}); return;
        }
        if (request.method !== "POST") throw fail("Method not allowed.",405);
        if (!String(request.headers["content-type"] || "").startsWith("application/json")) throw fail("JSON content is required.",415);
        const supplied = String(request.headers["x-editor-token"] || "");
        if (supplied.length !== csrfToken.length || !timingSafeEqual(Buffer.from(supplied),Buffer.from(csrfToken))) throw fail("Reload the editor to restore your local session.",403);
        const body = await readBody(request);
        if (mutating) throw fail("Another change is in progress. Please retry in a moment.",409);
        mutating = true;
        try {
          await mkdir(privateRoot,{recursive:true});
          if (pathname === "/api/preview") {
            validateData(body.data,await readJson(resolve(root,"editor/schema.json")));
            for(const [key,value] of previews) if(value.expires<Date.now())previews.delete(key);
            const key=previews.has(body.key) ? body.key : randomBytes(16).toString("hex");
            previews.set(key,{data:body.data,expires:Date.now()+1800000});
            reply(response,200,{key,url:`/preview/${key}/`}); return;
          }
          if (pathname === "/api/save") {
            const current = await readState(); if (body.revision !== current.revision) throw fail("This draft changed in another window. Reload before saving.",409);
            const schema = await readJson(resolve(root,"editor/schema.json")); validateData(body.data,schema);
            await mkdir(resolve(privateRoot,"backups"),{recursive:true});
            await writeFile(resolve(privateRoot,"backups",`${Date.now()}-${randomUUID()}.json`),json(current.data));
            const draft = {data:body.data,savedAt:new Date().toISOString()}; await atomicWrite(draftPath,json(draft));
            reply(response,200,{revision:hash(JSON.stringify(body.data)),savedAt:draft.savedAt}); return;
          }
          if (pathname === "/api/upload") {
            const buffer = Buffer.from(String(body.data || ""),"base64");
            if (buffer.length === 0 || buffer.length > 8_000_000) throw fail("Choose an image smaller than 8 MB.");
            let extension;
            if (buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) extension="png";
            else if (buffer[0]===255 && buffer[1]===216 && buffer[2]===255) extension="jpg";
            else if (buffer.subarray(0,4).toString()==="RIFF" && buffer.subarray(8,12).toString()==="WEBP") extension="webp";
            else throw fail("Choose a JPG, PNG, or WebP image.");
            const directory = resolve(root,"assets/uploads"); await mkdir(directory,{recursive:true});
            const filename = `${randomUUID()}.${extension}`; await writeFile(resolve(directory,filename),buffer);
            reply(response,200,{path:`assets/uploads/${filename}`}); return;
          }
          if (pathname === "/api/connect") {
            const owner=String(body.owner || "").trim(); if (owner && !/^[a-zA-Z0-9-]{1,39}$/.test(owner)) throw fail("Enter a valid GitHub username.");
            const api=github(await credential(owner)), user=await api("/user");
            if (owner && user.login.toLowerCase()!==owner.toLowerCase()) throw fail(`Signed in as ${user.login}, not ${owner}.`,403);
            reply(response,200,{login:user.login,name:user.name || user.login}); return;
          }
          if (pathname === "/api/prepare-publish") {
            const target=targetFrom(body), state=await readState();
            if (body.revision!==state.revision) throw fail("Save or reload the current draft before publishing.",409);
            validateData(state.data,await readJson(resolve(root,"editor/schema.json")));
            const api=github(await credential(target.owner)); await authorizeTarget(target,api);
            const endpoint=`/repos/${target.owner}/${target.repository}`, repo=await api(endpoint,"GET",undefined,true);
            if (repo && repo.private) throw fail("This publisher is for a public website repository. Choose a public repository.");
            if (repo && repo.permissions?.push === false) throw fail("This GitHub account cannot publish to the selected repository.",403);
            const ref=repo ? await api(`${endpoint}/git/ref/heads/${target.branch}`,"GET",undefined,true) : null;
            if (repo && !ref && repo.size > 0) throw fail(`The repository has no ${target.branch} branch. Enter its existing publishing branch.`);
            const commit=ref ? await api(`${endpoint}/git/commits/${ref.object.sha}`) : null;
            const tree=commit ? await api(`${endpoint}/git/trees/${commit.tree.sha}?recursive=1`) : null;
            if (tree?.truncated) throw fail("This repository is too large for the website publisher.");
            const files=await publicFiles(state.data), remoteHashes=new Map((tree?.tree || []).filter(item=>item.type==="blob").map(item=>[item.path,item.sha]));
            const changed=[...files].filter(([path,buffer])=>remoteHashes.get(path)!==gitHash(buffer)).map(([path,buffer])=>({path,bytes:buffer.length}));
            const ticket=randomBytes(24).toString("hex");
            for(const [key,value] of tickets) if(value.expires<Date.now())tickets.delete(key);
            tickets.set(ticket,{target,revision:state.revision,snapshot:snapshotHash(files),head:ref?.object.sha || null,tree:commit?.tree.sha || null,repositoryId:repo?.id || null,changed,expires:Date.now()+300000});
            let pages=null;
            try { if(repo)pages=await api(`${endpoint}/pages`,"GET",undefined,true); } catch(error) { if(error.status!==403)throw error; }
            reply(response,200,{ticket,target,createsRepository:!repo,changed,publicUrl:pages?.html_url || `https://${target.owner}.github.io/${target.repository}/`,repositoryUrl:`https://github.com/${target.owner}/${target.repository}`}); return;
          }
          if (pathname === "/api/publish") {
            const ticket=tickets.get(body.ticket); tickets.delete(body.ticket);
            if (!ticket || ticket.expires<Date.now()) throw fail("Publication review expired. Review the draft again.",409);
            const state=await readState(), files=await publicFiles(state.data);
            if (state.revision!==ticket.revision || snapshotHash(files)!==ticket.snapshot) throw fail("The website changed after the review. Review it again before publishing.",409);
            const {target}=ticket, api=github(await credential(target.owner)); const user=await authorizeTarget(target,api);
            const endpoint=`/repos/${target.owner}/${target.repository}`;
            let repo=await api(endpoint,"GET",undefined,true);
            if (ticket.repositoryId && repo?.id!==ticket.repositoryId || !ticket.repositoryId && repo) throw fail("The repository changed after the review. Review publication again.",409);
            let ref=repo ? await api(`${endpoint}/git/ref/heads/${target.branch}`,"GET",undefined,true) : null;
            if ((ref?.object.sha || null)!==ticket.head) throw fail("GitHub changed after the review. Review publication again to include the latest version.",409);
            if (!repo) repo=await api("/user/repos","POST",{name:target.repository,private:false,auto_init:false,description:localName(state.data),has_wiki:false,has_projects:false});
            if (!ref) {
              await api(`${endpoint}/contents/.nojekyll`,"PUT",{message:"Initialize website publication",content:"",branch:target.branch});
              ref=await api(`${endpoint}/git/ref/heads/${target.branch}`);
            }
            let publishedSha=ref.object.sha;
            if (ticket.changed.length) {
              const parent=await api(`${endpoint}/git/commits/${ref.object.sha}`);
              const entries=[];
              for(const {path} of ticket.changed) {
                const buffer=files.get(path), text=[".html",".css",".js",".svg"].includes(extname(path)) || path===".nojekyll";
                if(text) entries.push({path,mode:"100644",type:"blob",content:buffer.toString("utf8")});
                else { const blob=await api(`${endpoint}/git/blobs`,"POST",{content:buffer.toString("base64"),encoding:"base64"}); entries.push({path,mode:"100644",type:"blob",sha:blob.sha}); }
              }
              const tree=await api(`${endpoint}/git/trees`,"POST",{base_tree:parent.tree.sha,tree:entries});
              const commit=await api(`${endpoint}/git/commits`,"POST",{message:"Publish website updates from the local editor",tree:tree.sha,parents:[ref.object.sha],author:{name:user.name || user.login,email:`${user.id}+${user.login}@users.noreply.github.com`}});
              await api(`${endpoint}/git/refs/heads/${target.branch}`,"PATCH",{sha:commit.sha,force:false}); publishedSha=commit.sha;
            }
            // Record the confirmed commit before attempting Pages setup, which can fail independently.
            await atomicWrite(resolve(root,"site.config.js"),configSource(variable,state.data));
            await atomicWrite(settingsPath,json(target));
            let pages,status="queued",setupError="";
            try {
              pages=await api(`${endpoint}/pages`,"GET",undefined,true);
              if (!pages) pages=await api(`${endpoint}/pages`,"POST",{build_type:"legacy",source:{branch:target.branch,path:"/"}});
              else if(pages.source?.branch!==target.branch || pages.source?.path!=="/" || pages.build_type!=="legacy") { await api(`${endpoint}/pages`,"PUT",{build_type:"legacy",source:{branch:target.branch,path:"/"}}); pages=await api(`${endpoint}/pages`); }
            } catch(error) { status="setup_required"; setupError=error.message; }
            const result={status,committed:true,commit:publishedSha,url:pages?.html_url || `https://${target.owner}.github.io/${target.repository}/`,settingsUrl:`https://github.com/${target.owner}/${target.repository}/settings/pages`,actionsUrl:`https://github.com/${target.owner}/${target.repository}/actions`,setupError,publishedAt:new Date().toISOString(),filesChanged:ticket.changed.length};
            await atomicWrite(resolve(privateRoot,"last-publish.json"),json(result)); reply(response,200,result); return;
          }
          throw fail("Unknown editor action.",404);
        } finally { mutating=false; }
      }
      if (!["GET","HEAD"].includes(request.method)) throw fail("Method not allowed.",405);
      const previewMatch=pathname.match(/^\/preview\/([a-f0-9]{32})\/(config\.js)?$/);
      if(previewMatch) {
        const preview=previews.get(previewMatch[1]); if(!preview || preview.expires<Date.now())throw fail("Refresh the preview in the editor.",404);
        const isConfig=!!previewMatch[2];
        const content=isConfig ? configSource(variable,preview.data) : renderPublicHtml(await readFile(resolve(root,"index.html"),"utf8"),preview.data).replace("<head>",'<head><base href="/">').replace(/src=["']site\.config\.js["']/i,`src="/preview/${previewMatch[1]}/config.js"`);
        response.writeHead(200,{"Content-Type":isConfig ? mimeTypes[".js"] : mimeTypes[".html"],"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}); response.end(request.method==="HEAD" ? undefined : content); return;
      }
      let relative=pathname==="/" ? "index.html" : pathname.slice(1);
      if (["editor","editor/"].includes(relative)) relative="editor/index.html";
      const allowed=["index.html","styles.css","app.js","site.config.js","editor/index.html","editor/editor.css","editor/editor.js"].includes(relative) || /^assets\/[\w./-]+$/.test(relative) && !relative.includes("..") && !!mimeTypes[extname(relative).toLowerCase()];
      if (!allowed) throw fail("Not found.",404);
      const path=await realpath(resolve(root,relative)).catch(()=>{throw fail("Not found.",404);});
      if (!path.startsWith(root+sep)) throw fail("Not found.",404);
      const buffer=relative==="index.html" ? Buffer.from(renderPublicHtml(await readFile(path,"utf8"),await readCurrent())) : await readFile(path);
      response.writeHead(200,{"Content-Type":mimeTypes[extname(path).toLowerCase()],"Content-Length":buffer.length,"Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer",...(relative.startsWith("editor/") ? {"Content-Security-Policy":"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' https: data:; frame-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"} : {})});
      response.end(request.method==="HEAD" ? undefined : buffer);
    } catch(error) { if(!response.headersSent) reply(response,error.status || 500,{error:error.status ? error.message : "The editor could not complete this action. Check that the project files are writable and retry."}); else response.end(); }
  });
  const localName=data=>typeof data.name==="string" ? data.name : data.name?.en || data.businessName || "Website";
  const openEditorPage=()=>{
    if(!openEditor)return;
    const url=`http://localhost:${port}/editor/`;
    const launcher=process.platform==="win32" ? spawn("cmd.exe",["/c","start","",url],{windowsHide:true,stdio:"ignore"}) : spawn(process.platform==="darwin"?"open":"xdg-open",[url],{stdio:"ignore"});
    launcher.on("error",()=>console.log(`Open ${url} in your browser.`));
  };
  server.listen(port,"127.0.0.1",()=>{port=server.address().port;console.log(`Website: http://localhost:${port}\nEditor:  http://localhost:${port}/editor/`);openEditorPage();});
  server.on("error",error=>{console.error(error.code==="EADDRINUSE" ? `Port ${port} is busy. Use the running editor or try: node server.mjs ${port+1}` : error.message);if(error.code==="EADDRINUSE")openEditorPage();process.exitCode=1;});
  return server;
}
