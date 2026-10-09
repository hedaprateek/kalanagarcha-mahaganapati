import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, relative } from "node:path";
import { once } from "node:events";
import { startEditorServer, validateData, renderPublicHtml } from "./server.mjs";

const schema={sections:[{title:"Details",fields:[{path:["name"],label:"Name",type:"text",required:true},{path:["description"],label:"Description",type:"textarea"},{path:["url"],label:"Website",type:"url"}]},{title:"Events",collection:"programme",fields:[{path:["day"],label:"Day",type:"number",min:1,max:30},{path:["title"],label:"Title",type:"localized"}]}]};
const initial={name:"Example mandal",description:"A community celebration.",url:"",programme:[{day:1,title:{en:"Welcome",mr:"स्वागत"}}]};
function mockGitHub({exists=true,pagesFailure=false}={}) {
  const state={exists,head:exists?"a".repeat(40):null,calls:[],treeEntries:[],commits:0,pages:exists};
  const fetch=async (url,options={})=>{
    const path=new URL(url).pathname,method=options.method || "GET",body=options.body ? JSON.parse(options.body) : null;
    state.calls.push({path,method,body});
    const respond=(data,status=200)=>new Response(status===204?null:JSON.stringify(data),{status,headers:{"Content-Type":"application/json"}});
    if(path==="/user")return respond({login:"owner",name:"Site owner",id:123});
    if(path==="/user/repos" && method==="POST"){assert.equal(body.private,false);state.exists=true;return respond({id:1,private:false,permissions:{push:true}},201);}
    if(path==="/repos/owner/website")return state.exists?respond({id:1,size:state.head?10:0,private:false,permissions:{push:true}}):respond({message:"Not Found"},404);
    if(path==="/repos/owner/website/git/ref/heads/main")return state.head?respond({object:{sha:state.head}}):respond({message:"Not Found"},404);
    if(path==="/repos/owner/website/contents/.nojekyll" && method==="PUT"){state.head="i".repeat(40);return respond({commit:{sha:state.head}},201);}
    if(path.startsWith("/repos/owner/website/git/commits/") && method==="GET")return respond({tree:{sha:"b".repeat(40)}});
    if(path.startsWith("/repos/owner/website/git/trees/") && method==="GET")return respond({tree:[{path:"unrelated.txt",type:"blob",sha:"c".repeat(40)}],truncated:false});
    if(path==="/repos/owner/website/git/blobs" && method==="POST")return respond({sha:"d".repeat(40)},201);
    if(path==="/repos/owner/website/git/trees" && method==="POST"){assert.equal(body.base_tree,"b".repeat(40));state.treeEntries=body.tree;return respond({sha:"e".repeat(40)},201);}
    if(path==="/repos/owner/website/git/commits" && method==="POST"){state.commits++;assert.deepEqual(body.parents,[state.head]);return respond({sha:"f".repeat(40)},201);}
    if(path==="/repos/owner/website/git/refs/heads/main" && method==="PATCH"){assert.equal(body.force,false);state.head=body.sha;return respond({object:{sha:state.head}});}
    if(path==="/repos/owner/website/pages"){
      if(method==="GET")return state.pages?respond({html_url:"https://owner.github.io/website/",source:{branch:"main",path:"/"},build_type:"legacy"}):respond({message:"Not Found"},404);
      if(pagesFailure)return respond({message:"Pages permission required"},403);
      state.pages=true;return respond({html_url:"https://owner.github.io/website/"},201);
    }
    throw new Error(`Unexpected mock request ${method} ${path}`);
  };
  return {state,fetch};
}
async function fixture(t,options={}) {
  const root=await mkdtemp(resolve(tmpdir(),"website-editor-test-"));
  await mkdir(resolve(root,"assets"));await mkdir(resolve(root,"editor"));
  const original=`window.MANDAL_CONFIG = ${JSON.stringify(initial)};\n`;
  await writeFile(resolve(root,"site.config.js"),original);await writeFile(resolve(root,"editor/schema.json"),JSON.stringify(schema));
  for(const [name,contents] of [["index.html",'<html><head><script defer src="site.config.js"></script></head><body>Website</body></html>'],["styles.css","body{color:green}"],["app.js","console.log('website')"],[".nojekyll",""],["assets/favicon.svg",'<svg xmlns="http://www.w3.org/2000/svg"></svg>'],["editor/index.html","Editor"],["editor/editor.css",""],["editor/editor.js",""]])await writeFile(resolve(root,name),contents);
  const mock=mockGitHub(options);
  const server=startEditorServer({root,port:0,variable:"MANDAL_CONFIG",credentialProvider:async()=>"fake-test-credential",githubFetch:mock.fetch});await once(server,"listening");
  const origin=`http://127.0.0.1:${server.address().port}`;
  const bootstrap=await (await fetch(`${origin}/api/bootstrap`)).json();
  const request=async(path,body,headers={})=>{
    const response=await fetch(`${origin}/api/${path}`,{method:"POST",headers:{"Content-Type":"application/json","X-Editor-Token":bootstrap.token,...headers},body:JSON.stringify(body)});
    return {status:response.status,data:await response.json()};
  };
  const prepare=()=>request("prepare-publish",{owner:"owner",repository:"website",branch:"main",revision:bootstrap.revision});
  t.after(async()=>{
    await new Promise(resolveClose=>{server.close(resolveClose);server.closeAllConnections();});
    // Delete only the verified temporary directory created by this test.
    const inside=relative(tmpdir(),root);assert.ok(inside.startsWith("website-editor-test-") && !inside.includes(".."));
    await rm(root,{recursive:true,force:true});
  });
  return {root,origin,original,bootstrap,request,prepare,mock};
}

test("validation rejects executable URLs, out-of-range event days, and prototype keys",()=>{
  assert.equal(validateData(structuredClone(initial),schema).name,initial.name);
  assert.throws(()=>validateData({...initial,url:"javascript:alert(1)"},schema),/https/);
  assert.throws(()=>validateData({...initial,programme:[{day:0,title:"Invalid"}]},schema),/between/);
  assert.throws(()=>validateData(JSON.parse(JSON.stringify(initial).replace('{','{"__proto__":{},')),schema),/Invalid data key/);
});
test("published HTML keeps editable text and metadata accurate without running JavaScript",()=>{
  const html='<title>Old</title><meta name="description" content="Old"><meta property="og:title" content="Old"><span data-brand>Old</span><em><span data-copy="headline">Old copy</span></em>';
  const rendered=renderPublicHtml(html,{businessName:'New & <Coach>',description:'Updated "description"',copy:{headline:'Welcome {{businessName}}'}});
  assert.match(rendered,/New &amp; &lt;Coach&gt;/);assert.match(rendered,/Updated &quot;description&quot;/);assert.ok(!rendered.includes('>Old<'));assert.match(rendered,/<em><span data-copy="headline">Welcome New &amp; &lt;Coach&gt;<\/span><\/em>/);
});
test("saving preserves the published source and rejects stale draft revisions",async t=>{
  const f=await fixture(t),updated={...initial,name:"Updated mandal"};
  const saved=await f.request("save",{revision:f.bootstrap.revision,data:updated});assert.equal(saved.status,200);
  assert.equal(await readFile(resolve(f.root,"site.config.js"),"utf8"),f.original);
  const stale=await f.request("save",{revision:f.bootstrap.revision,data:initial});assert.equal(stale.status,409);
  const latest=await (await fetch(`${f.origin}/api/bootstrap`)).json();assert.equal(latest.data.name,"Updated mandal");assert.equal(latest.revision,saved.data.revision);
});
test("write endpoints reject missing session tokens and cross-origin requests",async t=>{
  const f=await fixture(t);
  assert.equal((await f.request("save",{data:initial,revision:f.bootstrap.revision},{"X-Editor-Token":""})).status,403);
  assert.equal((await f.request("save",{data:initial,revision:f.bootstrap.revision},{Origin:"https://other.example"})).status,403);
  for(const path of ["/.editor-data/original-config.json","/editor/server.mjs","/editor/schema.json","/package.json"]){assert.equal((await fetch(f.origin+path)).status,404);}
});
test("draft preview uses a separate escaped configuration and leaves live content unchanged",async t=>{
  const f=await fixture(t),updated={...initial,name:'Draft </script><script>alert(1)</script>'};
  const preview=await f.request("preview",{data:updated});assert.equal(preview.status,200);
  const html=await (await fetch(f.origin+preview.data.url)).text();assert.match(html,/<base href="\/">/);assert.match(html,/\/preview\/[a-f0-9]{32}\/config\.js/);
  const config=await (await fetch(f.origin+preview.data.url+"config.js")).text();assert.ok(!config.includes("</script>"));assert.ok(config.includes("\\u003c"));
  assert.equal(await readFile(resolve(f.root,"site.config.js"),"utf8"),f.original);
});
test("uploads use generated filenames and reject non-image content",async t=>{
  const f=await fixture(t);
  assert.equal((await f.request("upload",{data:Buffer.from("<script>bad()</script>").toString("base64")})).status,400);
  const png="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jlp0AAAAASUVORK5CYII=";
  const upload=await f.request("upload",{name:"../../private.js",data:png});assert.equal(upload.status,200);assert.match(upload.data.path,/^assets\/uploads\/[a-f0-9-]+\.png$/);
  assert.equal((await fetch(f.origin+"/"+upload.data.path)).status,200);
  const review=await f.prepare();assert.ok(!review.data.changed.some(file=>file.path===upload.data.path));
});
test("publishing requires a reviewed snapshot and does not force-overwrite remote changes",async t=>{
  const f=await fixture(t),review=await f.prepare();assert.equal(review.status,200);
  assert.ok(!review.data.changed.some(file=>file.path.startsWith("editor/") || file.path.startsWith(".editor-data/")));
  f.mock.state.head="9".repeat(40);
  const publish=await f.request("publish",{ticket:review.data.ticket});assert.equal(publish.status,409);assert.equal(f.mock.state.commits,0);
  assert.equal((await f.request("publish",{ticket:review.data.ticket})).status,409);
});
test("changes to local source after publication review require a fresh review",async t=>{
  const f=await fixture(t),review=await f.prepare();await writeFile(resolve(f.root,"styles.css"),"body{color:blue}");
  const publish=await f.request("publish",{ticket:review.data.ticket});assert.equal(publish.status,409);assert.equal(f.mock.state.commits,0);
});
test("publishing uploads only public files and preserves the remote tree",async t=>{
  const f=await fixture(t),review=await f.prepare();const result=await f.request("publish",{ticket:review.data.ticket});
  assert.equal(result.status,200);assert.equal(result.data.committed,true);assert.equal(result.data.status,"queued");assert.equal(f.mock.state.head,"f".repeat(40));
  assert.deepEqual(f.mock.state.treeEntries.map(item=>item.path).sort(),[".nojekyll","app.js","assets/favicon.svg","index.html","site.config.js","styles.css"].sort());
  assert.equal(f.mock.state.commits,1);assert.match(await readFile(resolve(f.root,"site.config.js"),"utf8"),/Managed by the local website editor/);
  const status=JSON.parse(await readFile(resolve(f.root,".editor-data/last-publish.json"),"utf8"));assert.equal(status.commit,result.data.commit);assert.ok(!JSON.stringify(status).includes("fake-test-credential"));
});
test("new repositories can publish and report Pages setup failure separately",async t=>{
  const f=await fixture(t,{exists:false,pagesFailure:true}),review=await f.prepare();assert.equal(review.data.createsRepository,true);
  const result=await f.request("publish",{ticket:review.data.ticket});assert.equal(result.status,200);assert.equal(result.data.committed,true);assert.equal(result.data.status,"setup_required");assert.match(result.data.setupError,/Pages permission/);
  assert.ok(f.mock.state.exists);assert.equal(f.mock.state.commits,1);assert.match(await readFile(resolve(f.root,"site.config.js"),"utf8"),/Managed by the local website editor/);
});
