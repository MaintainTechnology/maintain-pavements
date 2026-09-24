/** Node-only soundtrack generation. Never import from the Remotion bundle. */
import {existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, openSync, closeSync, unlinkSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseEnv} from 'node:util';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const studio = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const stateDir = resolve(studio, '.veo');
const rawDir = resolve(stateDir, 'superbase-music-raw');
const outputDir = resolve(studio, 'public/audio');
const ledgerPath = resolve(stateDir, 'superbase-music.json');
const lockPath = `${ledgerPath}.lock`;
const outputPath = resolve(outputDir, 'superbase-bed.wav');
const MODEL = 'lyria-3.5';
const BASE = 'https://generativelanguage.googleapis.com/v1beta';
const RATE = 0.08;
const DURATION = 72;
const PRICING = 'https://ai.google.dev/gemini-api/docs/pricing';
const DOCS = 'https://ai.google.dev/gemini-api/docs/music-generation';
const prompt = [
  'Compose a polished original 72-second instrumental background score for an Australian pavement-stabilisation process film. No singing, no speech, no lyrics, no vocal chops, no choir, no recognizable songs, and no imitation of any artist.',
  'Sound: restrained modern industrial documentary music; organic muted percussion, a warm rounded electric bass, understated piano and marimba plucks, soft textured synthesizer pads. Steady 100 BPM, 4/4, quietly confident forward motion. An optimistic, professional and grounded mood. Clean stereo production, real musical development, no trailer drama, no distorted guitars, no giant drops or cymbal crashes.',
  '[0:00-0:06] Sparse tactile pulse and warm pads establish the scene, gentle entrance.',
  '[0:06-0:22] Add warm bass and a restrained kick and brushed percussion groove, sparse tasteful piano motif with plenty of space for construction footage.',
  '[0:22-0:38] Introduce a light repeating plucked figure and subtle harmonic lift while the ground is mixed and graded. Keep dynamics even.',
  '[0:38-0:56] Full but restrained arrangement for rolling and compaction, subtle percussion variation every four bars, steady forward momentum.',
  '[0:56-1:04] Open up the harmony with a hopeful resolution for curing and the completed surface, gradually thin the percussion.',
  '[1:04-1:12] A calm resolved end-card outro with warm piano and sustained pad. No abrupt ending. The final chord decays smoothly to silence at 1:12.',
].join('\n');
const flags = new Set(process.argv.slice(2));
if ([...flags].some((flag) => !['--generate', '--status', '--preflight', '--process'].includes(flag))) throw new Error('Usage: node scripts/generate-superbase-music.mjs [--generate|--status|--preflight|--process]');
mkdirSync(stateDir, {recursive:true});
mkdirSync(rawDir, {recursive:true});
mkdirSync(outputDir, {recursive:true});
let ledger = existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, 'utf8')) : {
  schemaVersion:1, job:'superbase-complete-music', model:MODEL, maxGenerationRequests:1,
  requestedDurationSeconds:DURATION, usdPerRequest:RATE, pricingSource:PRICING,
  pricingCheckedOn:'2026-09-24', documentationSource:DOCS, billedCostUSD:null,
  billingNote:'Estimate from published per-song price. Actual billing has not been read.', requests:[],
};
if (ledger.model !== MODEL || ledger.maxGenerationRequests !== 1 || !Array.isArray(ledger.requests) || ledger.requests.length > 1) throw new Error('Unexpected music ledger; refusing any generation.');
const totals = () => ({generationRequests:ledger.requests.length, completedGenerations:ledger.requests.filter((request) => request.generated).length, estimatedGeneratedCostUSD:ledger.requests.filter((request) => request.generated).length * RATE, maximumAttemptedCostUSD:ledger.requests.length * RATE, maximumPlanCostUSD:RATE, billedCostUSD:null});
function save() {
  ledger.updatedAt = new Date().toISOString(); ledger.cost = totals();
  writeFileSync(`${ledgerPath}.tmp`, JSON.stringify(ledger,null,2)+'\n');
  renameSync(`${ledgerPath}.tmp`,ledgerPath);
}
const status = () => ({model:MODEL, cost:totals(), requests:ledger.requests.map(({status,generated})=>({status,generated})), output:ledger.output});
if(flags.has('--status')) {console.log(JSON.stringify(status(),null,2));process.exit(0);}
if(!flags.has('--generate') && !flags.has('--preflight') && !flags.has('--process')) {
  console.log(JSON.stringify({model:MODEL,maxGenerationRequests:1,estimatedMaximumUSD:RATE,requestedDurationSeconds:DURATION,prompt,usage:'--generate submits or resumes this one-request plan. Failed/uncertain submissions consume the only slot; there is no automatic POST retry. --process only remasters saved audio.'},null,2)); process.exit(0);
}
let key;
const clean = (value) => String(value).split(key || 'SECRET_NOT_LOADED').join('[REDACTED]').replace(/AIza[A-Za-z0-9_-]+/g,'[REDACTED]').replace(/https?:\/\/\S+/g,'[URL]').slice(0,600);
function run(binary,args) {
  const result = spawnSync(binary,args,{encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024});
  if(result.error || result.status!==0) throw new Error(`${binary} failed: ${clean(result.error?.message || result.stderr)}`);
  return result;
}
const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
const ffprobe = process.env.FFPROBE_PATH || 'ffprobe';
function probe(file) {return JSON.parse(run(ffprobe,['-v','error','-show_streams','-show_format','-of','json',file]).stdout);}
function loudness(file,filter) {
  const result = run(ffmpeg,['-hide_banner','-nostdin','-i',file,'-af',filter,'-f','null','-']);
  const match = result.stderr.match(/\{\s*"input_i"[\s\S]*?\}/);
  if(!match) throw new Error('Could not read loudness measurement.');
  return JSON.parse(match[0]);
}
function processAudio() {
  const request=ledger.requests[0];
  if(!request?.rawFile || !existsSync(resolve(studio,request.rawFile))) throw new Error('No generated audio saved. No additional generation will be made.');
  const source=resolve(studio,request.rawFile);
  const metadata=probe(source), sourceDuration=Number(metadata.format.duration);
  if(!Number.isFinite(sourceDuration) || sourceDuration<8) throw new Error('Generated music is too short or invalid.');
  const arrangement=resolve(rawDir,'arranged.wav');
  let loops=1;
  if(sourceDuration<DURATION) {
    const overlap=Math.min(2,sourceDuration/6);
    loops=Math.ceil((DURATION-overlap)/(sourceDuration-overlap));
    const inputs=Array.from({length:loops},()=>['-i',source]).flat();
    const filters=[];
    for(let i=0;i<loops-1;i++) filters.push(`${i===0?'[0:a]':`[xf${i-1}]`}[${i+1}:a]acrossfade=d=${overlap}:c1=qsin:c2=qsin[xf${i}]`);
    run(ffmpeg,['-hide_banner','-loglevel','error','-nostdin','-y',...inputs,'-filter_complex',filters.join(';'),'-map',`[xf${loops-2}]`,'-t',String(DURATION),'-ac','2','-ar','48000','-c:a','pcm_s24le',arrangement]);
  } else run(ffmpeg,['-hide_banner','-loglevel','error','-nostdin','-y','-i',source,'-t',String(DURATION),'-ac','2','-ar','48000','-c:a','pcm_s24le',arrangement]);
  const shape=`highpass=f=40,lowpass=f=15000,afade=t=in:st=0:d=2,afade=t=out:st=${DURATION-3}:d=3`;
  const measurement=loudness(arrangement,`${shape},loudnorm=I=-20:TP=-3.2:LRA=7:print_format=json`);
  const normalize=`loudnorm=I=-20:TP=-3.2:LRA=7:measured_I=${measurement.input_i}:measured_TP=${measurement.input_tp}:measured_LRA=${measurement.input_lra}:measured_thresh=${measurement.input_thresh}:offset=${measurement.target_offset}:linear=true:print_format=summary`;
  run(ffmpeg,['-hide_banner','-loglevel','error','-nostdin','-y','-i',arrangement,'-af',`${shape},${normalize}`,'-t',String(DURATION),'-ac','2','-ar','48000','-c:a','pcm_s16le',outputPath]);
  const finalProbe=probe(outputPath);
  const finalLoudness=loudness(outputPath,'loudnorm=I=-20:TP=-3.2:LRA=7:print_format=json');
  const audio=finalProbe.streams.find((stream)=>stream.codec_type==='audio');
  const duration=Number(finalProbe.format.duration);
  if(Math.abs(duration-DURATION)>0.02 || audio?.channels!==2 || audio?.sample_rate!=='48000' || audio?.codec_name!=='pcm_s16le' || Number(finalLoudness.input_tp)>-3 || Math.abs(Number(finalLoudness.input_i)+20)>1) throw new Error('Music mastering verification failed.');
  run(ffmpeg,['-v','error','-nostdin','-i',outputPath,'-f','null','-']);
  ledger.output={file:'public/audio/superbase-bed.wav',sha256:createHash('sha256').update(readFileSync(outputPath)).digest('hex'),durationSeconds:duration,channels:audio.channels,sampleRate:Number(audio.sample_rate),codec:audio.codec_name,integratedLoudnessLUFS:Number(finalLoudness.input_i),truePeakDBTP:Number(finalLoudness.input_tp),loudnessRangeLU:Number(finalLoudness.input_lra),fadeInSeconds:2,fadeOutSeconds:3,sourceDurationSeconds:sourceDuration,loopCopies:loops,crossfadeSeconds:loops>1?Math.min(2,sourceDuration/6):0};
  save();
  writeFileSync(resolve(outputDir,'superbase-bed.manifest.json'),JSON.stringify({schemaVersion:1,title:'SuperBase process bed',provenance:{type:'AI-generated music',provider:'Google Gemini API',model:MODEL,generatedAt:request.completedAt,prompt,documentationSource:DOCS},cost:totals(),pricingSource:PRICING,licensing:{note:'Generated for this project using the supplied Gemini API account. No external recordings or requested artist imitation. Use is subject to the provider terms; no independent royalty-free or exclusivity claim is made.',terms:'https://ai.google.dev/gemini-api/terms'},mastering:ledger.output},null,2)+'\n');
  console.log(JSON.stringify({message:'Music bed mastered and fully decoded.',...status()},null,2));
}
async function api(path,body) {
  const response=await fetch(`${BASE}/${path}`,{method:body?'POST':'GET',headers:{'x-goog-api-key':key,'Content-Type':'application/json','Api-Revision':'2026-05-20'},...(body?{body:JSON.stringify(body)}:{}),redirect:'error',signal:AbortSignal.timeout(body?600000:60000)});
  const data=await response.json();
  if(!response.ok){const error=new Error(`HTTP ${response.status}: ${clean(data.error?.message || 'Gemini music request failed')}`);error.httpStatus=response.status;throw error;}
  return data;
}
function capture(response,request) {
  if(response.id) request.interactionId=response.id;
  request.status=response.status || 'response-received'; save();
  const blocks=(response.steps || []).filter((step)=>step.type==='model_output').flatMap((step)=>step.content || []);
  const audio=response.output_audio || blocks.find((block)=>block.type==='audio' && block.data);
  if(audio?.data) {
    const rawFile=resolve(rawDir,'generated-audio.bin');
    const bytes=Buffer.from(audio.data,'base64');
    if(bytes.length<1000)throw new Error('Generated music data is empty.');
    writeFileSync(rawFile,bytes);
    request.generated=true;request.status='completed';request.completedAt=new Date().toISOString();
    request.rawFile='.veo/superbase-music-raw/generated-audio.bin';request.mimeType=audio.mime_type || audio.mimeType || null;
    request.structure=blocks.filter((block)=>block.type==='text').map((block)=>clean(block.text)).join('\n');save();
    return true;
  }
  return false;
}
let lock;
try {
  lock=openSync(lockPath,'wx');
  if(flags.has('--process')) {processAudio();}
  else {
    const envPath=resolve(studio,'.env');
    const env=existsSync(envPath)?parseEnv(readFileSync(envPath,'utf8')):{};
    key=env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if(!key)throw new Error('GEMINI_API_KEY is missing; never expose it through a Remotion environment variable.');
    const model=await api(`models/${MODEL}`);
    if(!model.name?.endsWith(MODEL))throw new Error('Unexpected music model response.');
    console.log(`Read-only model preflight passed: ${MODEL}; maximum one generation at estimated US$${RATE.toFixed(2)}.`);
    if(!flags.has('--preflight')) {
      let request=ledger.requests[0];
      if(!request) {
        request={status:'submitting',submittedAt:new Date().toISOString(),prompt,estimatedCostUSD:RATE};
        ledger.requests.push(request);save();
        console.log('Submitting the single music generation. No automatic POST retry.');
        try {capture(await api('interactions',{model:MODEL,input:prompt}),request);}
        catch(error){request.status=error.httpStatus?'failed':'submission-uncertain';request.error=clean(error.message);save();throw error;}
      }
      if(!request.generated && request.interactionId && !['failed','cancelled'].includes(request.status)) {
        for(let attempt=0;attempt<20 && !request.generated;attempt++) {
          console.log(`Music is ${request.status}; read-only retrieval ${attempt+1}/20.`);
          await new Promise((resolvePromise)=>setTimeout(resolvePromise,15000));
          capture(await api(`interactions/${encodeURIComponent(request.interactionId)}`),request);
          if(['failed','cancelled','requires_action'].includes(request.status))break;
        }
      }
      if(request.generated) processAudio();
      else throw new Error(`Music status: ${request.status}. The one-request cap is consumed; no replacement generation was submitted.`);
    }
  }
} catch(error) {console.error(clean(error.message));process.exitCode=1;}
finally {if(lock!==undefined){closeSync(lock);unlinkSync(lockPath);}}
