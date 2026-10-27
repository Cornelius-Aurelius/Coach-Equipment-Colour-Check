import {STAGES,TOTAL,stageAt,initialState,hint,answer,next,grade} from './game-core.mjs';
const $=id=>document.getElementById(id);
const APP='ca-coach-equipment-v2';
const safeStore={get(k){try{return localStorage.getItem(APP+':'+k)}catch{return null}},set(k,v){try{localStorage.setItem(APP+':'+k,String(v))}catch{}}};
const colors={red:'#f04f67',green:'#32b56b',lightGreen:'#83dd77',yellow:'#f9cf43',blue:'#398bf8',purple:'#9459d5',black:'#1e2736',white:'#f6fafb',lightGrey:'#c3cfd8',navy:'#29395d',orange:'#f68b42'};
let state=null,selectedMode='matchday',best=Number(safeStore.get('best'))||0,helpWasOpen=false;
function announce(msg){$('live').textContent=msg;}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function iconFor(kind){return kind==='cones'?'△':kind==='bibs'?'▣':kind==='balls'?'◉':'⬟';}
function itemGraphic(item,kind){const bg=colors[item.color]||colors.blue, text=['black','navy','blue','green','purple','red'].includes(item.color)?'#ffffff':'#18263d';const pat=item.pattern==='stripes'?'repeating-linear-gradient(135deg, transparent 0 13px,rgba(255,255,255,.43) 13px 18px)':'repeating-radial-gradient(circle at center,transparent 0 11px,rgba(0,0,0,.30) 11px 13px,transparent 13px 23px)';let label=item.mark?`<span class="gear-mark">${esc(item.mark)}</span>`:'';
 return `<div class="gear ${esc(kind)} ${item.pattern?esc(item.pattern):''}" style="--gear:${bg};--ink:${text};--pattern:${item.pattern?pat:'none'}" aria-hidden="true"><span class="gear-sheen"></span>${label}</div>`;}
function renderCards(stage){$('scenarioA').innerHTML=`<p class="equipment-label">STATION 01</p><div class="equipment-illustration">${itemGraphic(stage.a,stage.kind)}</div><strong>${esc(stage.a.tag)}</strong><span class="equipment-meta">${esc(stage.a.color.replace(/([A-Z])/g,' $1').toUpperCase())} ${stage.a.mark?' · SYMBOL '+esc(stage.a.mark):' · NO EXTRA CUE'}</span>`;
 $('scenarioB').innerHTML=`<p class="equipment-label">STATION 02</p><div class="equipment-illustration">${itemGraphic(stage.b,stage.kind)}</div><strong>${esc(stage.b.tag)}</strong><span class="equipment-meta">${esc(stage.b.color.replace(/([A-Z])/g,' $1').toUpperCase())} ${stage.b.mark?' · SYMBOL '+esc(stage.b.mark):' · NO EXTRA CUE'}</span>`;}
function updateHud(){if(!state)return;
 $('hudStage').textContent=`${Math.min(state.index+1,TOTAL)} / ${TOTAL}`;
 $('hudScore').textContent=state.score.toLocaleString('en-GB');$('hudStreak').textContent=String(state.streak);
 $('hudLives').textContent=state.mode==='practice'?'∞':('♥'.repeat(state.lives)+'♡'.repeat(3-state.lives));$('hudBest').textContent=best.toLocaleString('en-GB');
 $('progressFill').style.width=`${((state.index+1)/TOTAL)*100}%`;
 document.querySelector('.progress-track').setAttribute('aria-valuenow',String(state.index+1));
}
function renderRound(){if(!state||state.phase!=='playing')return;
 const stage=stageAt(state.index);
 $('chapterName').textContent=stage.chapter.toUpperCase();$('scenarioTitle').textContent=stage.title;$('scenarioContext').textContent=stage.setting;$('roundNo').textContent=`DRILL ${String(state.index+1).padStart(2,'0')}`;
 renderCards(stage);$('scenarioGrid').classList.remove('greyscale');$('hintBtn').disabled=false;$('hintBtn').textContent='◐ Check light–dark contrast';
 $('feedback').className='feedback feedback-prompt';$('feedback').innerHTML='<span class="feedback-symbol">◎</span><div><strong>Coach, what’s your call?</strong><p>Choose CLEAR SETUP when the cues are reliable, or COLOUR RISK when equipment could cause confusion.</p></div>';
 $('safeBtn').disabled=false;$('riskBtn').disabled=false;$('nextBtn').hidden=true;
 $('choiceGroup').hidden=false;$('helpNote').textContent='Contrast preview is a simple grayscale aid—not a colour-blindness simulation.';
 updateHud();$('safeBtn').focus({preventScroll:true});announce(`Drill ${state.index+1}. ${stage.title}. Choose clear setup or colour risk.`);
}
function showEnd(){state={...state,phase:'finished'};
 if(state.mode==='matchday'&&state.score>best){best=state.score;safeStore.set('best',best)}
 updateHud();$('resultsLabel').textContent=state.mode==='practice'?'PRACTICE COMPLETE':state.lives===0?'FULL-TIME — TRAIN AGAIN':'FULL-TIME — DRILL COMPLETE';
 $('resultsGrade').textContent=grade(state);$('resultsScore').textContent=state.mode==='practice'?`${state.correct} / ${TOTAL} correct`:`${state.score.toLocaleString('en-GB')} points · ${state.correct} / ${TOTAL} correct`;
 $('resultsAdvice').textContent=state.correct===TOTAL?'You spotted every scenario. Keep checking the actual conditions and asking players for feedback.':'Every review makes the next training session clearer. Try again, or practise without losing lives.';
 $('endOverlay').hidden=false;$('rematchBtn').focus({preventScroll:true});announce(`Session complete. ${state.correct} of ${TOTAL} correct. ${grade(state)}.`);
}
function choose(choice){if(!state||state.phase!=='playing'||!$('startOverlay').hidden||!$('pauseOverlay').hidden||!$('learnOverlay').hidden)return;
 const stage=stageAt(state.index);state=answer(state,choice);const {last}=state;
 $('safeBtn').disabled=true;$('riskBtn').disabled=true;$('hintBtn').disabled=true;$('choiceGroup').hidden=true;
 $('feedback').className=`feedback ${last.accurate?'feedback-success':'feedback-error'}`;
 $('feedback').innerHTML=`<span class="feedback-symbol">${last.accurate?'✓':'!'}</span><div><strong>${last.accurate?'GOOD CALL!':'REVIEW THE CUES'}</strong><p>${esc(stage.reason)}</p><p class="feedback-tip"><b>Coach tip:</b> ${esc(stage.tip)}</p>${state.mode==='matchday'?`<span class="points">${last.accurate?'+'+last.points+' points':'No points this drill'}</span>`:''}</div>`;
 $('nextBtn').textContent=state.lives===0||state.index===TOTAL-1?'See results':'Next drill →';$('nextBtn').hidden=false;$('nextBtn').focus({preventScroll:true});
 updateHud();announce(`${last.accurate?'Correct':'Not quite'}. ${stage.reason}`);
}
function proceed(){if(!state||state.phase!=='feedback')return;state=next(state);if(state.phase==='finished')showEnd();else renderRound();}
function begin(mode){selectedMode=mode;state=initialState(mode);$('startOverlay').hidden=true;$('endOverlay').hidden=true;$('pauseOverlay').hidden=true;$('learnOverlay').hidden=true;$('modePill').textContent=mode==='practice'?'PRACTICE MODE':'MATCHDAY CHALLENGE';renderRound();}
function pause(){if(!state||!$('pauseOverlay').hidden||!$('startOverlay').hidden||!$('endOverlay').hidden||!$('learnOverlay').hidden)return;$('pauseOverlay').hidden=false;$('resumeBtn').focus({preventScroll:true});announce('Paused');}
function resume(){$('pauseOverlay').hidden=true;$('safeBtn').focus({preventScroll:true});announce('Resumed');}
function showHelp(){helpWasOpen=!$('pauseOverlay').hidden;$('learnOverlay').hidden=false;$('learnClose').focus({preventScroll:true});}
function closeHelp(){$('learnOverlay').hidden=true;($('pauseOverlay').hidden?$('safeBtn'):$('resumeBtn')).focus({preventScroll:true});}
$('startMatchday').addEventListener('click',()=>begin('matchday'));$('startPractice').addEventListener('click',()=>begin('practice'));
$('safeBtn').addEventListener('click',()=>choose('safe'));$('riskBtn').addEventListener('click',()=>choose('risk'));
$('nextBtn').addEventListener('click',proceed);$('hintBtn').addEventListener('click',()=>{if(!state||state.phase!=='playing')return;state=hint(state);$('scenarioGrid').classList.toggle('greyscale');$('hintBtn').textContent=$('scenarioGrid').classList.contains('greyscale')?'◑ Return to colour':'◐ Check light–dark contrast';$('helpNote').textContent='Grayscale previews light–dark contrast only. It cannot diagnose or replicate someone’s colour vision. Hint use halves the points for this drill.';});
$('pauseBtn').addEventListener('click',()=>{$('pauseOverlay').hidden?pause():resume()});$('resumeBtn').addEventListener('click',resume);
$('helpBtn').addEventListener('click',showHelp);$('learnClose').addEventListener('click',closeHelp);$('helpStart').addEventListener('click',()=>{closeHelp();if(!state)begin('matchday')});
$('restartBtn').addEventListener('click',()=>begin(state?.mode||'matchday'));$('rematchBtn').addEventListener('click',()=>begin('matchday'));$('practiceAgainBtn').addEventListener('click',()=>begin('practice'));
document.addEventListener('keydown',event=>{
 if(event.altKey||event.ctrlKey||event.metaKey)return;
 if(event.key==='Escape'){if(!$('learnOverlay').hidden)closeHelp();else if(!$('pauseOverlay').hidden)resume();else pause();return}
 if(!state||!$('startOverlay').hidden||!$('learnOverlay').hidden||!$('pauseOverlay').hidden||!$('endOverlay').hidden)return;
 if(state.phase==='feedback'&&(event.key==='Enter'||event.key===' ')){event.preventDefault();proceed();return}
 if(state.phase!=='playing')return;
 if(event.key==='1'||event.key.toLowerCase()==='c'){choose('safe')}
 if(event.key==='2'||event.key.toLowerCase()==='r'){choose('risk')}
 if(event.key.toLowerCase()==='h'){$('hintBtn').click()}
});
$('hudBest').textContent=best.toLocaleString('en-GB');$('resultsLabel').textContent='';
renderCards(stageAt(0));$('startMatchday').focus({preventScroll:true});