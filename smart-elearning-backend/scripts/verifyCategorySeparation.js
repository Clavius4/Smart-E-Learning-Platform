// In-container: confirm per-category level is independent & preserved, using the
// LEGIT path (pass the literacy assessment) now that self-promotion is blocked.
require('dotenv').config();
const mongoose=require('mongoose');const http=require('http');
const Assessment=require('../models/assessment');
const req=(m,p,{token,body}={})=>new Promise((res,rej)=>{const d=body?JSON.stringify(body):null;const r=http.request({host:'localhost',port:5000,path:'/api'+p,method:m,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}),...(d?{'Content-Length':Buffer.byteLength(d)}:{})}},x=>{let b='';x.on('data',c=>b+=c);x.on('end',()=>{let j=null;try{j=b?JSON.parse(b):null}catch{j={raw:b}}res({status:x.statusCode,data:j})})});r.on('error',rej);if(d)r.write(d);r.end()});
const fails=[];const chk=(c,m)=>{console.log((c?'  \x1b[32m✓\x1b[0m ':'  \x1b[31m✗ ')+m+(c?'':'\x1b[0m'));if(!c)fails.push(m)};
(async()=>{
  await mongoose.connect(process.env.DATABASE_URL);
  const a=await Assessment.findOne({level:'intermediate',category:'literacy'}).lean();
  const answers=a.questions.map(q=>q.type==='dragdrop'?{selectedPairs:(q.pairs||[]).map(p=>({drag:p.drag,drop:p.drop}))}:{selected:q.correctAnswerIndex});
  const email=`sep_${Date.now()}@t.local`,password='Passw0rd!23';
  await req('POST','/student/signup',{body:{firstName:'S',lastName:'ep',email,password,confirmPassword:password}});
  await req('POST','/student/verify-otp',{body:{email,otp:'123456'}});
  const token=(await req('POST','/student/login',{body:{email,password}})).data.token;
  await req('POST','/profile/onboarding',{token,body:{learningStyle:'literacy',interests:[],difficultyPreference:'intermediate',avatar:1}});
  // LEGIT promotion: pass literacy intermediate assessment
  const g=await req('GET','/assessments/level/intermediate',{token});
  await req('POST',`/assessments/submit/${g.data.assessment._id}`,{token,body:{answers}});
  let r=await req('GET','/course/courses-level/intermediate',{token});
  chk(r.status===200,`LITERACY proven intermediate -> intermediate accessible (${r.status})`);
  // switch to numeracy
  r=await req('PUT','/profile/update-learning-style',{token,body:{learningStyle:'numeracy'}});
  chk(r.data?.user?.difficultyPreference==='beginner',`switch to NUMERACY resets to beginner (${r.data?.user?.difficultyPreference})`);
  r=await req('GET','/course/courses-level/intermediate',{token});
  chk(r.status===403,`NUMERACY intermediate blocked (${r.status})`);
  // switch back
  r=await req('PUT','/profile/update-learning-style',{token,body:{learningStyle:'literacy'}});
  chk(r.data?.user?.difficultyPreference==='intermediate',`switch back -> LITERACY intermediate RESTORED (${r.data?.user?.difficultyPreference})`);
  console.log(fails.length===0?'\x1b[32mCATEGORY SEPARATION CONFIRMED\x1b[0m':`\x1b[31m${fails.length} FAILED\x1b[0m`);
  await mongoose.disconnect();process.exit(fails.length?1:0);
})().catch(e=>{console.error(e.message);process.exit(1)});
