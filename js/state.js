/* =========================================================================
   STATE
   ========================================================================= */
const state = {
  screen:'landing',
  playerName:'Detective',
  xp:0, coins:0, lives:3, streak:0, bestStreak:0,
  solvedChallenges:[], hintsUsed:{}, attempts:0, correctAttempts:0,
  unlockedAchievements:[], finalSolved:false, fastSolve:false,
  currentLevelId:null, currentChallengeIdx:0, viewChallengeIdx:0,
  challengeStartTime:null, queryHistory:[], soundOn:true,
};

let db = null;
function xpLevel(){ return Math.floor(state.xp/500)+1; }
function xpIntoLevel(){ return state.xp % 500; }
function accuracy(){ return state.attempts===0?100:Math.round((state.correctAttempts/state.attempts)*100); }
function casesSolvedCount(){ return LEVELS.filter(l=>levelComplete(state,l.id)).length + (state.finalSolved?1:0); }

/* =========================================================================
   SOUND (WebAudio synth — no external files needed)
   ========================================================================= */
let actx=null;
function audioCtx(){ if(!actx){ try{ actx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return actx; }
function beep(freq=440, dur=0.12, type='sine', gain=0.05){
  if(!state.soundOn) return;
  const ctx = audioCtx(); if(!ctx) return;
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.type=type; o.frequency.value=freq; g.gain.value=gain;
  o.connect(g); g.connect(ctx.destination);
  o.start(); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+dur);
  o.stop(ctx.currentTime+dur+0.02);
}
function sfx(kind){
  switch(kind){
    case 'click': beep(320,0.05,'square',0.03); break;
    case 'success': beep(660,0.09,'sine',0.05); setTimeout(()=>beep(880,0.14,'sine',0.05),90); break;
    case 'error': beep(160,0.18,'sawtooth',0.05); break;
    case 'clue': beep(520,0.08,'triangle',0.05); setTimeout(()=>beep(720,0.1,'triangle',0.05),80); break;
    case 'level': beep(440,0.1,'sine',0.05); setTimeout(()=>beep(660,0.1,'sine',0.05),100); setTimeout(()=>beep(880,0.18,'sine',0.06),200); break;
    case 'achievement': beep(700,0.08,'square',0.04); setTimeout(()=>beep(1000,0.16,'square',0.05),90); break;
    case 'final': [440,550,660,880,1100].forEach((f,i)=>setTimeout(()=>beep(f,0.16,'sine',0.06), i*110)); break;
  }
}

/* =========================================================================
   TOASTS
   ========================================================================= */
function toast(msg, kind='info'){
  const wrap = document.getElementById('toastWrap');
  const el = document.createElement('div');
  el.className = 'toast '+kind;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(()=>el.remove(), 3700);
}
