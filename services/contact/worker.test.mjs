import test from 'node:test';
import assert from 'node:assert/strict';
import worker, {handle} from './worker.mjs';
const env={ALLOWED_ORIGINS:'https://parametric.space',CONTACT_TO:'info@parametric.space',CONTACT_FROM:'Parametric Space <contact@parametric.space>',RESEND_API_KEY:'test-only',CONTACT_RATE_LIMITER:{limit:async()=>({success:true})}};
const valid={name:'Test User',email:'sender@example.com',message:'A project enquiry',website:'',submissionId:'12345678-1234-1234-1234-123456789012'};
function req(body=valid,origin='https://parametric.space'){return new Request('https://service.test/contact',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1'},body:JSON.stringify(body)});}
const noSend=()=>{throw Error('Should not send');};
test('valid enquiry uses fixed destination and visitor reply-to',async()=>{let sent;const r=await handle(req({...valid,to:'attacker@example.com'}),env,async(url,options)=>{sent=JSON.parse(options.body);assert.equal(url,'https://api.resend.com/emails');assert.match(options.headers['Idempotency-Key'],/^contact\//);return Response.json({id:'test'});});assert.equal(r.status,200);assert.deepEqual(sent.to,['info@parametric.space']);assert.equal(sent.reply_to,valid.email);assert.equal(r.headers.get('Access-Control-Allow-Origin'),'https://parametric.space');});
test('rejects foreign origins without CORS grant',async()=>{const r=await handle(req(valid,'https://evil.test'),env,noSend);assert.equal(r.status,403);assert.equal(r.headers.get('Access-Control-Allow-Origin'),null);});
test('rejects invalid email and honeypot',async()=>{for(const data of [{...valid,email:'bad'},{...valid,website:'spam'},{...valid,name:'x\nInjected'},{...valid,message:' '}])assert.equal((await handle(req(data),env,noSend)).status,400);});
test('bounds streamed bodies regardless of Content-Length',async()=>{assert.equal((await handle(req({...valid,message:'x'.repeat(22000)}),env,noSend)).status,413);});
test('throttles abuse',async()=>{assert.equal((await handle(req(),{...env,CONTACT_RATE_LIMITER:{limit:async()=>({success:false})}},noSend)).status,429);});
test('missing service credentials fail closed',async()=>{assert.equal((await handle(req(),{...env,RESEND_API_KEY:''},noSend)).status,503);});
test('provider failure never reports success',async()=>{assert.equal((await handle(req(),env,async()=>new Response('failed',{status:500}))).status,502);});
test('retries preserve idempotency and changed payload changes key',async()=>{const keys=[];const send=async(u,o)=>{keys.push(o.headers['Idempotency-Key']);return Response.json({id:'test'});};await handle(req(),env,send);await handle(req(),env,send);await handle(req({...valid,message:'Changed'}),env,send);assert.equal(keys[0],keys[1]);assert.notEqual(keys[0],keys[2]);});
test('preflight allows only approved origin',async()=>{const r=await handle(new Request('https://service.test/contact',{method:'OPTIONS',headers:{Origin:'https://parametric.space'}}),env,noSend);assert.equal(r.status,204);assert.equal(r.headers.get('Access-Control-Allow-Methods'),'POST');});

test('Worker runtime context is not used as email transport', async()=>{const original=globalThis.fetch;globalThis.fetch=async()=>Response.json({id:'test'});try{assert.equal((await worker.fetch(req(),env,{waitUntil(){}})).status,200);}finally{globalThis.fetch=original;}});
