/* =========================================================================
   RENDERING — screen router
   ========================================================================= */
function setScreen(name){ state.screen = name; render(); window.scrollTo(0,0); }
function render(){
  const app = document.getElementById('app');
  let html = renderTopbar();
  switch(state.screen){
    case 'landing': html = renderLanding(); break;
    case 'dashboard': html += renderDashboard(); break;
    case 'cases': html += renderCaseSelect(); break;
    case 'investigation': html += renderInvestigation(); break;
    case 'academy': html += renderAcademy(); break;
    case 'leaderboard': html += renderLeaderboard(); break;
  }
  app.innerHTML = html;
  afterRender();
}
function renderTopbar(){
  if(state.screen==='landing') return '';
  return `
  <div class="topbar"><div class="topbar-inner">
    <div class="logo">🔦 SQL DETECTIVE</div>
    <div class="navlinks">
      <button onclick="sfx('click');setScreen('dashboard')" class="${state.screen==='dashboard'?'active':''}">Dashboard</button>
      <button onclick="sfx('click');setScreen('cases')" class="${state.screen==='cases'?'active':''}">Cases</button>
      <button onclick="sfx('click');setScreen('academy')" class="${state.screen==='academy'?'active':''}">SQL Academy</button>
      <button onclick="sfx('click');setScreen('leaderboard')" class="${state.screen==='leaderboard'?'active':''}">Leaderboard</button>
      <button onclick="sfx('click');openAchievements()">Achievements</button>
      <button onclick="toggleSound()">${state.soundOn?'🔊':'🔇'}</button>
    </div>
  </div></div>`;
}

/* ---------- Landing ---------- */
function renderLanding(){
  return `
  <div id="landing" class="crt">
    <div class="grid-bg"></div>
    <div class="beam"></div>
    <div class="stamp">TOP SECRET</div>
    <div class="file-tape">CASE FILE // ACTIVE INVESTIGATION</div>
    <div class="hero">
      <div class="eyebrow">— Database Mystery Adventure —</div>
      <h1>SQL <span>DETECTIVE</span></h1>
      <p>A diamond is missing. Eight suspects. One database holds the truth. Write real SQL to interrogate the evidence and crack the case.</p>
      <div class="hero-actions">
        <button class="btn btn-solid" onclick="sfx('click');startInvestigation()">🔎 Start Investigation</button>
        <button class="btn btn-gold" onclick="sfx('click');openHowTo()">📖 How To Play</button>
        <button class="btn" onclick="sfx('click');setScreen('academy')">🎓 SQL Academy</button>
        <button class="btn" onclick="sfx('click');setScreen('leaderboard')">🏆 Leaderboard</button>
        <button class="btn" onclick="sfx('click');openAchievements()">🏅 Achievements</button>
      </div>
      <div class="wrap" style="max-width:820px">
        <div class="glass pad" style="text-align:left;">
          <div class="panel-title">◆ Briefing</div>
          <p class="story-text" style="margin:0;">The Crown Diamond disappeared from the Grand Museum gala. You'll query a live SQLite database — suspects, evidence, transactions, camera logs — across 8 case files, from <b style="color:var(--green)">SELECT &amp; WHERE</b> up to <b style="color:var(--red)">CTEs &amp; window functions</b>. Every query runs for real, right in your browser.</p>
        </div>
      </div>
    </div>
    <footer class="foot">Built with a real client-side SQLite engine (sql.js) — no server, no risk to any real data.</footer>
  </div>`;
}
function startInvestigation(){
  if(state.playerName==='Detective'){
    const n = prompt('Detective, what should we call you?','Detective');
    if(n && n.trim()) state.playerName = n.trim().slice(0,24);
  }
  setScreen('dashboard');
}

/* ---------- Dashboard ---------- */
function renderDashboard(){
  const lvl = xpLevel();
  const solved = casesSolvedCount();
  const cardsHtml = [...LEVELS, FINAL_CASE].slice(0,4).map(caseCardHtml).join('');
  return `
  <div class="wrap" style="padding:26px 24px 60px;">
    <h2 style="margin:0 0 4px;">Welcome back, ${escapeHtml(state.playerName)}</h2>
    <div class="mono" style="color:var(--muted);font-size:13px;">Detective Level ${lvl} · ${solved}/8 cases closed</div>
    <div class="pbar" style="margin-top:12px;max-width:420px;"><div style="width:${(xpIntoLevel()/500)*100}%"></div></div>

    <div class="statgrid">
      <div class="glass stat"><div class="val">${state.xp}</div><div class="lbl">⭐ XP</div></div>
      <div class="glass stat"><div class="val">${state.coins}</div><div class="lbl">🪙 Coins</div></div>
      <div class="glass stat"><div class="val">${solved}</div><div class="lbl">📁 Cases Solved</div></div>
      <div class="glass stat"><div class="val">${state.streak}🔥</div><div class="lbl">Streak</div></div>
      <div class="glass stat"><div class="val">${accuracy()}%</div><div class="lbl">🎯 Accuracy</div></div>
      <div class="glass stat"><div class="val">${state.unlockedAchievements.length}/${ACHIEVEMENTS.length}</div><div class="lbl">🏅 Achievements</div></div>
    </div>

    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:26px;">
      <div class="panel-title" style="margin:0;">◆ Active Case Files</div>
      <button class="btn btn-sm" onclick="sfx('click');setScreen('cases')">View All Cases →</button>
    </div>
    <div class="case-grid">${cardsHtml}</div>
  </div>`;
}

function caseCardHtml(lvl){
  const isFinal = lvl.id===8;
  const solved = isFinal ? state.finalSolved : levelComplete(state, lvl.id);
  const prevId = lvl.id-1;
  const locked = prevId>=1 ? !(isFinal ? levelComplete(state,7) : (prevId===0?false:levelComplete(state,prevId))) : false;
  const trueLocked = lvl.id===1 ? false : locked;
  const xpReward = isFinal ? lvl.challenge.xp : lvl.challenges.reduce((a,c)=>a+c.xp,0);
  return `
  <div class="glass case-card ${trueLocked?'locked':''} ${solved?'solved':''}" onclick="${trueLocked?'':`sfx('click');openCase(${lvl.id})`}">
    <div class="case-num">${lvl.num}</div>
    <h3>${lvl.title}</h3>
    <div class="case-meta">
      <span class="chip diff-${lvl.difficulty}">${lvl.difficulty}</span>
      <span class="chip">⏱ ${lvl.est}</span>
      <span class="chip">⭐ ${xpReward} XP</span>
    </div>
    <div class="case-meta">${lvl.concepts.map(c=>`<span class="chip">${c}</span>`).join('')}</div>
    <button class="btn btn-sm ${trueLocked?'btn-ghost':'btn-solid'}" style="margin-top:8px;width:100%;justify-content:center;" ${trueLocked?'disabled':''}>
      ${trueLocked?'🔒 Locked':(solved?'↺ Review Case':'▶ Start Case')}
    </button>
  </div>`;
}

/* ---------- Case Selection ---------- */
function renderCaseSelect(){
  const all = [...LEVELS, FINAL_CASE];
  return `
  <div class="wrap" style="padding:26px 24px 60px;">
    <h2 style="margin:0 0 14px;">Case Selection</h2>
    <div class="case-grid">${all.map(caseCardHtml).join('')}</div>
  </div>`;
}
function openCase(id){
  state.currentLevelId = id;
  state.currentChallengeIdx = 0;
  state.viewChallengeIdx = 0;
  state.challengeStartTime = Date.now();
  setScreen('investigation');
}
function switchChallenge(idx){
  if(idx > state.currentChallengeIdx){
    toast('Solve the current query to unlock this one.', 'err');
    sfx('error');
    return;
  }
  state.viewChallengeIdx = idx;
  render();
}

/* ---------- Investigation Room ---------- */
function getCurrentLevel(){ return state.currentLevelId===8 ? FINAL_CASE : LEVELS.find(l=>l.id===state.currentLevelId); }
function getCurrentChallenge(){
  const lvl = getCurrentLevel();
  if(lvl.id===8) return lvl.challenge;
  return lvl.challenges[state.viewChallengeIdx];
}
function renderInvestigation(){
  const lvl = getCurrentLevel();
  if(!lvl) return `<div class="wrap"><p>Pick a case first.</p></div>`;
  const isFinal = lvl.id===8;
  const challenge = getCurrentChallenge();
  const solved = state.solvedChallenges.includes(challenge.id);
  const cluesFound = collectClues(lvl);
  const hintLevel = state.hintsUsed[challenge.id] || 0;

  return `
  <div class="wrap" id="invRoom">
    <div style="display:flex;justify-content:space-between;align-items:center;margin:16px 0;flex-wrap:wrap;gap:8px;">
      <div>
        <div class="mono" style="color:var(--gold);font-size:12px;letter-spacing:2px;">${lvl.num}</div>
        <h2 style="margin:2px 0;">${lvl.title}</h2>
      </div>
      <div style="display:flex;gap:14px;align-items:center;">
        <span class="life">${'❤️'.repeat(state.lives)}${'🖤'.repeat(3-state.lives)}</span>
        <span class="timer" id="timerDisplay">⏱ 00:00</span>
        <button class="btn btn-ghost btn-sm" onclick="sfx('click');setScreen('cases')">← Cases</button>
      </div>
    </div>

    ${isFinal ? '' : `<div style="display:flex;gap:8px;margin:4px 0 14px;flex-wrap:wrap;">
      ${lvl.challenges.map((c,i)=>{
        const isSolved = state.solvedChallenges.includes(c.id);
        const isUnlocked = i <= state.currentChallengeIdx;
        const isViewing = i === state.viewChallengeIdx;
        const cls = isSolved ? 'step-solved' : (isUnlocked ? 'step-open' : 'step-locked');
        const click = isUnlocked ? `sfx('click');switchChallenge(${i})` : `sfx('error');toast('Solve the current query to unlock this one.','err')`;
        return `<button class="step-chip ${cls} ${isViewing?'step-viewing':''}" onclick="${click}">${isSolved?'✅':(isUnlocked?'▶':'🔒')} Query ${i+1}</button>`;
      }).join('')}
    </div>`}

    <div class="inv-grid">
      <!-- LEFT -->
      <div class="glass pad">
        <div class="panel-title">◆ Case Story</div>
        <div class="story-text">${lvl.story}</div>
        <div class="panel-title" style="margin-top:16px;">◆ Objective ${isFinal?'':`(Query ${state.viewChallengeIdx+1}/${lvl.challenges.length})`}</div>
        <div class="objective">${challenge.prompt}</div>
        <div class="panel-title" style="margin-top:16px;">◆ Clues Discovered</div>
        ${cluesFound.length? cluesFound.map(c=>`<div class="clue">✔ ${c}</div>`).join('') : `<div class="story-text">No clues unlocked yet — solve a challenge to reveal one.</div>`}
        <button class="btn btn-gold btn-sm" style="margin-top:10px;width:100%;justify-content:center;" onclick="sfx('click');useHint()" ${solved?'disabled':''}>💡 Get Hint (${hintLevel}/3 used)</button>
        ${hintLevel>0?`<div class="hint-box">${challenge.hints.slice(0,hintLevel).map((h,i)=>`<div style="margin-bottom:4px;"><b>Hint ${i+1}:</b> ${escapeHtml(h)}</div>`).join('')}</div>`:''}
      </div>

      <!-- CENTER -->
      <div class="glass pad">
        <div class="panel-title">◆ SQL Editor</div>
        <div class="editor-wrap">
          <div class="line-nums" id="lineNums">1</div>
          <textarea id="sqlEditor" class="mono" spellcheck="false" placeholder="-- write your SQL query here" oninput="updateLineNums()"></textarea>
        </div>
        <div class="editor-actions">
          <button class="btn btn-solid btn-sm" onclick="sfx('click');runPlayerQuery()">▶ Run Query</button>
          <button class="btn btn-ghost btn-sm" onclick="sfx('click');clearEditor()">✕ Clear</button>
          <button class="btn btn-ghost btn-sm" onclick="sfx('click');resetChallenge()">↺ Reset</button>
          <select class="dd" style="width:auto;" onchange="loadHistory(this.value)">
            <option value="">Query history…</option>
            ${state.queryHistory.slice().reverse().map((q,i)=>`<option value="${state.queryHistory.length-1-i}">${escapeHtml(q.slice(0,40))}</option>`).join('')}
          </select>
        </div>

        <div class="panel-title" style="margin-top:18px;">◆ Result</div>
        <div id="resultArea" class="result-scroll pad" style="min-height:60px;"><span class="story-text">Run a query to see results here.</span></div>
        <div id="feedbackArea" style="margin-top:10px;"></div>
      </div>

      <!-- RIGHT -->
      <div class="glass pad">
        <div class="panel-title">◆ Database Explorer</div>
        ${TABLE_INFO.map(t=>`
          <div class="schema-table">
            <div class="schema-head" onclick="toggleSchema('${t.name}')">📋 ${t.name} <span style="color:var(--muted-2)">▾</span></div>
            <div class="schema-body" id="schema-${t.name}">
              ${t.cols.map(c=>`<div class="col-row">• ${c}</div>`).join('')}
              <button class="btn btn-ghost btn-sm" style="margin-top:6px;width:100%;" onclick="event.stopPropagation();sfx('click');previewTable('${t.name}')">Preview data</button>
            </div>
          </div>`).join('')}
        <div class="panel-title" style="margin-top:14px;">◆ Relationships</div>
        ${RELATIONSHIPS.map(r=>`<div class="col-row" style="color:var(--cyan);">🔗 ${r}</div>`).join('')}
      </div>
    </div>
  </div>`;
}
function collectClues(lvl){
  const ids = lvl.id===8 ? [lvl.challenge.id] : lvl.challenges.map(c=>c.id);
  return ids.filter(id=>state.solvedChallenges.includes(id)).map(id=>{
    const map = {
      '1a':'The suspect list is confirmed — eight names, eight stories.',
      '1b':'Two suspects share the Warehouse District address.',
      '1c':'Alex Morgan, Antiques Dealer, flagged for background check.',
      '2a':'Rita Alvarez and Marcus Webb are the oldest on the list.',
      '2b':'Sam Turner is the youngest suspect present that night.',
      '2c':'Priya Nandan (Curator) and Marcus Webb (Consultant) both had vault-adjacent access.',
      '3a':'Transaction totals per suspect are now visible.',
      '3b':'Two suspects moved over $100,000 — a major red flag.',
      '3c':'Warehouse 7 shows unusually high average transaction value.',
      '4a':'Fingerprints and fibers now have names attached.',
      '4b':'Some suspects have zero evidence tied to them — clean, or careful?',
      '4c':'Camera sightings now cross-reference suspect occupations.',
      '5a':'Several transactions blow past the average by a huge margin.',
      '5b':'The single largest transaction traces to suspect_id 1.',
      '5c':'Evidence at Warehouse 7 narrows the suspect pool sharply.',
      '6a':'One transaction is classified High-risk on its own.',
      '6b':'A three-way profile — evidence + camera + name — is assembled.',
      '6c':'Only one suspect matches Warehouse 7 camera AND big money.',
      '7a':'Running totals confirmed per suspect via CTE.',
      '7b':'Suspect_id 1 ranks #1 in total transaction volume.',
      '7c':'Transaction timeline reconstructed suspect by suspect.',
      '8a':'The net closes: one name matches every condition.',
    };
    return map[id] || 'Clue unlocked.';
  });
}
function toggleSchema(name){
  const el = document.getElementById('schema-'+name);
  el.classList.toggle('open');
}
function previewTable(name){
  const r = runSql(`SELECT * FROM ${name} LIMIT 6;`);
  renderResult(r);
  toast(`Previewing ${name}`, 'info');
}
function updateLineNums(){
  const ta = document.getElementById('sqlEditor');
  const lines = ta.value.split('\\n').length;
  document.getElementById('lineNums').innerHTML = Array.from({length:lines},(_,i)=>i+1).join('<br>');
}
function clearEditor(){
  document.getElementById('sqlEditor').value='';
  updateLineNums();
}
function resetChallenge(){
  clearEditor();
  document.getElementById('resultArea').innerHTML = '<span class="story-text">Run a query to see results here.</span>';
  document.getElementById('feedbackArea').innerHTML = '';
}
function loadHistory(idx){
  if(idx==='') return;
  document.getElementById('sqlEditor').value = state.queryHistory[idx];
  updateLineNums();
}

function renderResult(r){
  const area = document.getElementById('resultArea');
  if(r.error){
    area.innerHTML = `<span class="msg-err">⚠ SQL Error: ${escapeHtml(r.error)}</span>`;
    return;
  }
  if(!r.columns || r.columns.length===0){
    area.innerHTML = `<span class="msg-ok">✔ Statement executed (no rows returned).</span>`;
    return;
  }
  let html = '<table class="result-table"><thead><tr>'+r.columns.map(c=>`<th>${escapeHtml(c)}</th>`).join('')+'</tr></thead><tbody>';
  r.rows.slice(0,200).forEach(row=>{
    html += '<tr>'+row.map(v=>`<td>${v===null?'<i style="color:var(--muted-2)">NULL</i>':escapeHtml(String(v))}</td>`).join('')+'</tr>';
  });
  html += '</tbody></table>';
  area.innerHTML = html;
}

function runPlayerQuery(){
  const sql = document.getElementById('sqlEditor').value.trim();
  if(!sql){ toast('Write a query first, detective.', 'err'); return; }
  const forbidden = /\\b(DROP|ALTER|ATTACH|PRAGMA|VACUUM)\\b/i;
  if(forbidden.test(sql)){
    toast('That command is restricted in this sandbox.', 'err');
    renderResult({error:'Restricted command. DROP / ALTER / ATTACH / PRAGMA / VACUUM are disabled to protect the case files.'});
    sfx('error');
    return;
  }
  state.queryHistory.push(sql);
  const r = runSql(sql);
  renderResult(r);
  const feedback = document.getElementById('feedbackArea');

  if(r.error){
    sfx('error');
    feedback.innerHTML = `<div class="msg-err">❌ Query failed. Check the error above and try again.</div>`;
    return;
  }

  const challenge = getCurrentChallenge();
  const already = state.solvedChallenges.includes(challenge.id);
  state.attempts++;
  const expected = getExpected(challenge);
  const got = normalizeResult(r.columns, r.rows);
  const correct = expected!==null && got===expected;

  if(correct){
    state.correctAttempts++;
    sfx('success'); sfx('clue');
    if(!already){
      const elapsed = (Date.now()-state.challengeStartTime)/1000;
      if(elapsed<25) state.fastSolve = true;
      const hintLevel = state.hintsUsed[challenge.id]||0;
      const xpAwarded = Math.max(40, challenge.xp - hintLevel*20);
      state.xp += xpAwarded;
      state.coins += Math.round(xpAwarded/5);
      state.solvedChallenges.push(challenge.id);
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      feedback.innerHTML = `<div class="msg-ok">✅ Correct! Case advanced. +${xpAwarded} XP earned.</div>
        <button class="btn btn-solid btn-sm" style="margin-top:8px;" onclick="sfx('click');nextStep()">Next Clue →</button>`;
      checkAchievements();
    } else {
      feedback.innerHTML = `<div class="msg-ok">✅ Correct result (already solved).</div>
        <button class="btn btn-solid btn-sm" style="margin-top:8px;" onclick="sfx('click');nextStep()">Continue →</button>`;
    }
  } else {
    state.streak = 0;
    state.lives = Math.max(0, state.lives-1);
    sfx('error');
    feedback.innerHTML = `<div class="msg-err">❌ Not quite the right result yet. The query ran, but it doesn't answer the objective. Try again or use a hint.</div>`;
    if(state.lives===0){
      toast('Out of lives! Resetting to 3 — keep investigating.', 'err');
      state.lives = 3;
    }
  }
  render(); // re-render to refresh clue list / hint counter / lives, then restore editor content
  const ta = document.getElementById('sqlEditor');
  if(ta) ta.value = sql;
  updateLineNums();
  const feedback2 = document.getElementById('feedbackArea');
  feedback2.innerHTML = feedback.innerHTML;
  renderResult(r);
}

function useHint(){
  const challenge = getCurrentChallenge();
  const cur = state.hintsUsed[challenge.id]||0;
  if(cur>=3){ toast('No more hints for this one.', 'info'); return; }
  state.hintsUsed[challenge.id] = cur+1;
  toast('Hint revealed (-20 XP from this challenge\'s reward).', 'gold');
  render();
}

function nextStep(){
  const lvl = getCurrentLevel();
  if(lvl.id===8){
    openFinalReveal();
    return;
  }
  if(state.currentChallengeIdx < lvl.challenges.length-1){
    state.currentChallengeIdx++;
    state.viewChallengeIdx = state.currentChallengeIdx;
    state.challengeStartTime = Date.now();
    render();
    toast('New objective unlocked!', 'info');
  } else {
    sfx('level');
    toast(`${lvl.title} — Case Closed! 🎉`, 'gold');
    setScreen('cases');
  }
}

/* ---------- Final Case Reveal ---------- */
function openFinalReveal(){
  const opts = ['Alex Morgan','Priya Nandan','Marcus Webb','Elena Cross','Jonas Kim','Rita Alvarez','Sam Turner','Dana Wolfe'];
  const locs = ['Warehouse 7','Museum Vault','Harbor Docks','Uptown Gala Hall','Downtown Plaza'];
  const motives = ['Financial Fraud','Jealousy','Revenge','Blackmail','Debt'];
  const evid = ['Transaction #4821','Fingerprint #101','Glove Fiber #112','Camera Log #5'];
  const modalBg = document.createElement('div');
  modalBg.className='modal-bg';
  modalBg.innerHTML = `
  <div class="glass modal">
    <div class="panel-title">◆ Submit Your Findings</div>
    <h3 style="margin:6px 0 12px;">Who committed the theft?</h3>
    <label class="fl">Culprit</label>
    <select class="dd" id="ansCulprit"><option value="">Select…</option>${opts.map(o=>`<option>${o}</option>`).join('')}</select>
    <label class="fl">Location</label>
    <select class="dd" id="ansLocation"><option value="">Select…</option>${locs.map(o=>`<option>${o}</option>`).join('')}</select>
    <label class="fl">Motive</label>
    <select class="dd" id="ansMotive"><option value="">Select…</option>${motives.map(o=>`<option>${o}</option>`).join('')}</select>
    <label class="fl">Key Evidence</label>
    <select class="dd" id="ansEvidence"><option value="">Select…</option>${evid.map(o=>`<option>${o}</option>`).join('')}</select>
    <button class="btn btn-solid" style="width:100%;justify-content:center;margin-top:18px;" onclick="submitFinal()">🔒 Close the Case</button>
    <button class="btn btn-ghost" style="width:100%;justify-content:center;margin-top:8px;" onclick="this.closest('.modal-bg').remove()">Cancel</button>
  </div>`;
  document.body.appendChild(modalBg);
}
function submitFinal(){
  const a = {
    culprit: document.getElementById('ansCulprit').value,
    location: document.getElementById('ansLocation').value,
    motive: document.getElementById('ansMotive').value,
    evidence: document.getElementById('ansEvidence').value,
  };
  const correct = FINAL_CASE.answer;
  const isCorrect = a.culprit===correct.culprit && a.location===correct.location && a.motive===correct.motive && a.evidence===correct.evidence;
  document.querySelector('.modal-bg').remove();
  if(isCorrect){
    state.finalSolved = true;
    state.xp += 500; state.coins += 150;
    sfx('final');
    checkAchievements();
    showCinematicReveal(true);
  } else {
    state.lives = Math.max(0,state.lives-1);
    sfx('error');
    toast('Not quite — review the evidence and try again.', 'err');
  }
}
function showCinematicReveal(win){
  const c = FINAL_CASE.answer;
  const modalBg = document.createElement('div');
  modalBg.className='modal-bg';
  modalBg.innerHTML = `
  <div class="glass modal crt" style="text-align:center;">
    <div class="reveal-hero">
      <div class="eyebrow" style="color:var(--red);">◆ ◆ ◆</div>
      <h1 class="display" style="color:var(--red);font-size:32px;">CASE CLOSED</h1>
      <div class="reveal-field"><b>CULPRIT:</b> ${c.culprit}</div>
      <div class="reveal-field"><b>LOCATION:</b> ${c.location}</div>
      <div class="reveal-field"><b>MOTIVE:</b> ${c.motive}</div>
      <div class="reveal-field"><b>KEY EVIDENCE:</b> ${c.evidence}</div>
      <div class="statgrid" style="margin-top:16px;">
        <div class="glass stat"><div class="val">${state.xp}</div><div class="lbl">Total XP</div></div>
        <div class="glass stat"><div class="val">${state.solvedChallenges.length}</div><div class="lbl">Queries Solved</div></div>
        <div class="glass stat"><div class="val">${accuracy()}%</div><div class="lbl">Accuracy</div></div>
        <div class="glass stat"><div class="val">${state.unlockedAchievements.length}</div><div class="lbl">Achievements</div></div>
      </div>
      <button class="btn btn-solid" style="margin-top:20px;" onclick="this.closest('.modal-bg').remove();setScreen('dashboard')">Return to Headquarters</button>
    </div>
  </div>`;
  document.body.appendChild(modalBg);
}

/* ---------- Achievements ---------- */
function checkAchievements(){
  ACHIEVEMENTS.forEach(a=>{
    if(!state.unlockedAchievements.includes(a.id) && a.cond(state)){
      state.unlockedAchievements.push(a.id);
      sfx('achievement');
      toast(`🏅 Achievement unlocked: ${a.name}`, 'gold');
    }
  });
}
function openAchievements(){
  const modalBg = document.createElement('div');
  modalBg.className='modal-bg';
  modalBg.innerHTML = `
  <div class="glass modal">
    <button class="close-x" onclick="this.closest('.modal-bg').remove()">✕</button>
    <div class="panel-title">◆ Achievements</div>
    <div class="ach-grid">
      ${ACHIEVEMENTS.map(a=>{
        const unlocked = state.unlockedAchievements.includes(a.id);
        return `<div class="glass ach ${unlocked?'':'locked'}"><span class="ico">${a.icon}</span>${a.name}</div>`;
      }).join('')}
    </div>
  </div>`;
  document.body.appendChild(modalBg);
}
function openHowTo(){
  const modalBg = document.createElement('div');
  modalBg.className='modal-bg';
  modalBg.innerHTML = `
  <div class="glass modal">
    <button class="close-x" onclick="this.closest('.modal-bg').remove()">✕</button>
    <div class="panel-title">◆ How To Play</div>
    <h3 style="margin-top:0;">Investigate with real SQL</h3>
    <ol class="story-text" style="line-height:1.8;padding-left:18px;">
      <li>Pick a case file from the Dashboard or Case Selection screen.</li>
      <li>Read the objective on the left, then write a SQL query in the editor.</li>
      <li>Click <b>Run Query</b> — it executes for real against an in-browser SQLite database.</li>
      <li>If your result matches the objective, you'll earn XP and unlock a clue. Wrong results cost a life (lives auto-refill).</li>
      <li>Stuck? Use up to 3 hints — each one lowers the XP reward for that challenge.</li>
      <li>Clear all 7 case files, then take on the Final Case to name the culprit, location, motive and key evidence.</li>
    </ol>
  </div>`;
  document.body.appendChild(modalBg);
}
function toggleSound(){ state.soundOn=!state.soundOn; render(); }

/* ---------- SQL Academy ---------- */
const LESSONS = [
  {name:'SELECT', explain:'SELECT chooses which columns to return from a table.', example:'SELECT name FROM suspects;', challenge:'Show the name and age of every suspect.', solution:'SELECT name, age FROM suspects;'},
  {name:'WHERE', explain:'WHERE filters rows based on a condition.', example:"SELECT * FROM suspects WHERE age < 30;", challenge:'Find suspects younger than 30.', solution:'SELECT * FROM suspects WHERE age < 30;'},
  {name:'ORDER BY', explain:'ORDER BY sorts your results, ascending (ASC) or descending (DESC).', example:'SELECT name, age FROM suspects ORDER BY age DESC;', challenge:'List suspects sorted by age, oldest first.', solution:'SELECT name, age FROM suspects ORDER BY age DESC;'},
  {name:'GROUP BY', explain:'GROUP BY collapses rows sharing a value so you can aggregate them (COUNT, SUM, AVG...).', example:'SELECT location, COUNT(*) FROM suspects GROUP BY location;', challenge:'Count how many suspects live in each location.', solution:'SELECT location, COUNT(*) AS cnt FROM suspects GROUP BY location;'},
  {name:'JOIN', explain:'JOIN combines rows from two tables that share a related column.', example:'SELECT s.name, e.evidence_type FROM suspects s JOIN evidence e ON s.suspect_id = e.suspect_id;', challenge:'List suspect names with their evidence_type via a JOIN.', solution:'SELECT s.name, e.evidence_type FROM suspects s JOIN evidence e ON s.suspect_id = e.suspect_id;'},
  {name:'Subqueries', explain:'A subquery is a query nested inside another query, often used to compute a value to filter on.', example:'SELECT * FROM transactions WHERE amount > (SELECT AVG(amount) FROM transactions);', challenge:'Find transactions above the average transaction amount.', solution:'SELECT * FROM transactions WHERE amount > (SELECT AVG(amount) FROM transactions);'},
  {name:'CTE', explain:'A CTE (WITH ... AS) names a temporary result set you can reference like a table.', example:'WITH big AS (SELECT * FROM transactions WHERE amount > 10000) SELECT * FROM big;', challenge:'Use a CTE to select transactions over $10,000.', solution:'WITH big AS (SELECT * FROM transactions WHERE amount > 10000) SELECT * FROM big;'},
  {name:'Window Functions', explain:'Window functions like RANK() OVER compute a value across a set of rows related to the current row, without collapsing them.', example:'SELECT name, age, RANK() OVER (ORDER BY age DESC) AS age_rank FROM suspects;', challenge:'Rank suspects by age, oldest first, using RANK() OVER.', solution:'SELECT name, age, RANK() OVER (ORDER BY age DESC) AS age_rank FROM suspects;'},
];
let academyState = {};
function renderAcademy(){
  return `
  <div class="wrap" style="padding:26px 24px 60px;">
    <h2 style="margin:0 0 4px;">SQL Academy</h2>
    <div class="mono" style="color:var(--muted);font-size:13px;margin-bottom:18px;">Bite-sized lessons — practice against the live case database.</div>
    ${LESSONS.map((l,i)=>renderLessonCard(l,i)).join('')}
  </div>`;
}
function renderLessonCard(l, i){
  const done = academyState[i];
  return `
  <div class="glass lesson-card">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <h3 style="margin:0;">${l.name} ${done?'<span style="color:var(--green);font-size:13px;">✔ complete</span>':''}</h3>
      <span class="chip">+50 XP</span>
    </div>
    <p class="story-text" style="margin:8px 0;">${l.explain}</p>
    <div class="mono" style="background:#060911;border:1px solid var(--panel-border);padding:9px 12px;border-radius:8px;color:var(--gold);font-size:13px;overflow-x:auto;">${escapeHtml(l.example)}</div>
    <div class="objective" style="margin-top:10px;">Mini challenge: ${l.challenge}</div>
    <textarea id="academyEditor${i}" class="mono" style="width:100%;min-height:70px;background:#060911;color:#7ef7ff;border:1px solid var(--panel-border);border-radius:8px;padding:10px;margin-top:6px;" placeholder="Write your query…"></textarea>
    <div style="display:flex;gap:8px;margin-top:8px;">
      <button class="btn btn-solid btn-sm" onclick="sfx('click');runAcademy(${i})">▶ Run &amp; Check</button>
    </div>
    <div id="academyResult${i}" style="margin-top:8px;"></div>
  </div>`;
}
function runAcademy(i){
  const l = LESSONS[i];
  const sql = document.getElementById('academyEditor'+i).value.trim();
  const out = document.getElementById('academyResult'+i);
  if(!sql){ toast('Write a query first.', 'err'); return; }
  const r = runSql(sql);
  if(r.error){ out.innerHTML = `<div class="msg-err">⚠ ${escapeHtml(r.error)}</div>`; sfx('error'); return; }
  const exp = runSql(l.solution);
  const correct = normalizeResult(r.columns,r.rows) === normalizeResult(exp.columns,exp.rows);
  if(correct){
    sfx('success');
    if(!academyState[i]){ academyState[i]=true; state.xp+=50; state.coins+=10; toast(`Lesson complete! +50 XP`, 'ok'); checkAchievements(); }
    out.innerHTML = `<div class="msg-ok">✅ Correct!</div>`;
  } else {
    sfx('error');
    out.innerHTML = `<div class="msg-err">❌ Not quite — check the example above and try again.</div>`;
  }
}

/* ---------- Leaderboard ---------- */
const MOCK_LB = [
  {name:'ShadowQuery', xp:4820, cases:8, acc:97},
  {name:'IndexHunter', xp:4210, cases:8, acc:94},
  {name:'NullPointer_Jane', xp:3950, cases:7, acc:91},
  {name:'JoinReaper', xp:3600, cases:7, acc:89},
  {name:'CTE_Sarah', xp:3110, cases:6, acc:93},
  {name:'RankAndFile', xp:2800, cases:6, acc:85},
  {name:'DetectiveDrew', xp:2340, cases:5, acc:88},
  {name:'QueryQuinn', xp:1900, cases:4, acc:90},
  {name:'SchemaSleuth', xp:1500, cases:4, acc:82},
  {name:'RowZero', xp:900, cases:2, acc:80},
];
let lbTab = 'alltime';
function renderLeaderboard(){
  const rows = [...MOCK_LB, {name:state.playerName+' (You)', xp:state.xp, cases:casesSolvedCount(), acc:accuracy(), me:true}]
    .sort((a,b)=>b.xp-a.xp);
  return `
  <div class="wrap" style="padding:26px 24px 60px;">
    <h2 style="margin:0 0 14px;">Leaderboard</h2>
    <div class="tabs">
      <button class="${lbTab==='daily'?'active':''}" onclick="setLbTab('daily')">Daily</button>
      <button class="${lbTab==='weekly'?'active':''}" onclick="setLbTab('weekly')">Weekly</button>
      <button class="${lbTab==='alltime'?'active':''}" onclick="setLbTab('alltime')">All-Time</button>
    </div>
    <div class="glass pad">
      <table class="lb">
        <thead><tr><th>Rank</th><th>Detective</th><th>XP</th><th>Cases Solved</th><th>Accuracy</th></tr></thead>
        <tbody>
          ${rows.map((r,i)=>`<tr class="${r.me?'me':''}"><td>#${i+1}</td><td>${escapeHtml(r.name)}</td><td>${r.xp}</td><td>${r.cases}</td><td>${r.acc}%</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p class="mono" style="color:var(--muted-2);font-size:11px;margin-top:10px;">Other detectives shown are illustrative sample data.</p>
  </div>`;
}
function setLbTab(t){ lbTab=t; render(); }

/* ---------- utils ---------- */
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function afterRender(){
  const ta = document.getElementById('sqlEditor');
  if(ta) updateLineNums();
}
