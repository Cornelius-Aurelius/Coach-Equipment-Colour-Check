/** Pure educational logic for Coach Equipment Colour Check by Cornelius Aurelius. */
export const STAGES = Object.freeze([
  {id:1,chapter:'Kick-off',title:'Two-colour cone gates',setting:'Warm-up • natural grass',kind:'cones',a:{color:'red',tag:'Gate A',mark:''},b:{color:'green',tag:'Gate B',mark:''},safe:false,reason:'Red and green cones with no extra symbol or number can be difficult to distinguish. Add clear symbols, labels or contrasting gate markers.',tip:'Never rely on cone colour alone.'},
  {id:2,chapter:'Kick-off',title:'Marked training bibs',setting:'Small-sided game • daylight',kind:'bibs',a:{color:'blue',tag:'Team A',mark:'A',pattern:'stripes'},b:{color:'yellow',tag:'Team B',mark:'B',pattern:'dots'},safe:true,reason:'The strong contrast is reinforced by different large letters and patterns. Players can identify teams without colour alone.',tip:'Choose contrasting bibs and add labels.'},
  {id:3,chapter:'Kick-off',title:'Grass-side markers',setting:'Passing drill • grass pitch',kind:'markers',a:{color:'green',tag:'Marker 1',mark:''},b:{color:'lightGreen',tag:'Marker 2',mark:''},safe:false,reason:'Green and light-green markers can blend with a grass pitch. Use a more contrasting marker and a second cue.',tip:'Check equipment against the pitch background.'},
  {id:4,chapter:'Matchday',title:'Simple high-contrast gates',setting:'Movement drill • mixed light',kind:'cones',a:{color:'black',tag:'Gate X',mark:'X',pattern:'stripes'},b:{color:'yellow',tag:'Gate O',mark:'O',pattern:'dots'},safe:true,reason:'Different shapes, high contrast and visible letter identifiers make these gates easier to tell apart.',tip:'Combine colour, shape and contrast.'},
  {id:5,chapter:'Matchday',title:'Blue or purple?',setting:'Team possession • under floodlights',kind:'bibs',a:{color:'blue',tag:'Side 1',mark:''},b:{color:'purple',tag:'Side 2',mark:''},safe:false,reason:'Blue and purple can be confusing, especially when both bibs look identical in shape and lack other cues.',tip:'Avoid closely matched hues and use symbols.'},
  {id:6,chapter:'Matchday',title:'Numbered target balls',setting:'Finishing practice • indoor hall',kind:'balls',a:{color:'white',tag:'Ball 1',mark:'1',pattern:'stripes'},b:{color:'black',tag:'Ball 2',mark:'2',pattern:'dots'},safe:true,reason:'Large numbers, distinct patterns and strong contrast provide more than one way to identify the target.',tip:'Make numbers legible while moving.'},
  {id:7,chapter:'Matchday',title:'White and pale grey markers',setting:'Coordination drill • bright sun',kind:'markers',a:{color:'white',tag:'Route A',mark:''},b:{color:'lightGrey',tag:'Route B',mark:''},safe:false,reason:'Two pale shades can wash out in bright light. Without shapes or numbers, the intended route is less clear.',tip:'Check light–dark contrast as well as hue.'},
  {id:8,chapter:'Final whistle',title:'Shape-coded stations',setting:'Multi-station circuit • daylight',kind:'cones',a:{color:'blue',tag:'Triangle gate',mark:'▲',pattern:'stripes'},b:{color:'yellow',tag:'Circle gate',mark:'●',pattern:'dots'},safe:true,reason:'The different symbols and strong colour contrast let coaches call “triangle” or “circle” instead of a colour.',tip:'Pair a visual cue with a spoken instruction.'},
  {id:9,chapter:'Final whistle',title:'Dark training groups',setting:'Evening practice • shaded pitch',kind:'bibs',a:{color:'navy',tag:'Group 1',mark:''},b:{color:'black',tag:'Group 2',mark:''},safe:false,reason:'Navy and black can look similar in shade or poor lighting. Add bright labels or replace one set of bibs.',tip:'Recheck the setup when the lighting changes.'},
  {id:10,chapter:'Final whistle',title:'Identifiable passing targets',setting:'Fast passing • artificial turf',kind:'markers',a:{color:'yellow',tag:'Target 3',mark:'3',pattern:'rings'},b:{color:'blue',tag:'Target 4',mark:'4',pattern:'stripes'},safe:true,reason:'The numbered, patterned targets give players reliable cues even when a colour is difficult to tell apart.',tip:'Use numbers and patterns in fast drills.'},
  {id:11,chapter:'Final whistle',title:'Orange or red cone?',setting:'Obstacle course • mixed weather',kind:'cones',a:{color:'orange',tag:'Lane 1',mark:''},b:{color:'red',tag:'Lane 2',mark:''},safe:false,reason:'Red and orange equipment can become hard to separate during play. Use more contrast and a clear secondary cue.',tip:'Red/orange colour-only instructions can fail.'},
  {id:12,chapter:'Final whistle',title:'Coach’s final equipment check',setting:'Team warm-up • varied lighting',kind:'bibs',a:{color:'blue',tag:'Home',mark:'H',pattern:'stripes'},b:{color:'yellow',tag:'Away',mark:'A',pattern:'dots'},safe:true,reason:'High contrast plus visible letters and patterns support quick, confident decisions. Verify this setup with the actual players and lighting.',tip:'Ask players what they can see before starting.'}
]);
export const TOTAL=STAGES.length;
export function stageAt(index){return STAGES[((index%TOTAL)+TOTAL)%TOTAL];}
export function correctChoice(stage,choice){return (choice==='safe')===stage.safe;}
export function initialState(mode='matchday'){
 if(!['matchday','practice'].includes(mode))throw new Error('Unknown mode');
 return {mode,index:0,score:0,streak:0,lives:mode==='practice'?Infinity:3,correct:0,misses:0,usedHint:false,phase:'playing'};
}
export function hint(state){if(state.phase!=='playing')return state;return {...state,usedHint:true};}
export function answer(state,choice){
 if(state.phase!=='playing')return state;
 if(!['safe','risk'].includes(choice))throw new Error('Invalid choice');
 const accurate=correctChoice(stageAt(state.index),choice);
 const points=accurate?(state.mode==='practice'?0:(state.usedHint?60:100)+Math.min(100,state.streak*20)):0;
 const lives=accurate?state.lives:Math.max(0,state.lives-1);
 return {...state,score:state.score+points,streak:accurate?state.streak+1:0,correct:state.correct+(accurate?1:0),misses:state.misses+(!accurate?1:0),lives,phase:'feedback',last:{accurate,choice,points}};
}
export function next(state){
 if(state.phase!=='feedback')return state;
 if(state.mode==='matchday'&&state.lives===0)return {...state,phase:'finished'};
 if(state.index>=TOTAL-1)return {...state,phase:'finished'};
 return {...state,index:state.index+1,usedHint:false,last:undefined,phase:'playing'};
}
export function grade(state){const percent=state.correct/TOTAL;
 if(percent===1)return 'ELITE COACH';if(percent>=.83)return 'MATCHDAY READY';if(percent>=.58)return 'SMART SCOUT';return 'KEEP LEARNING';}