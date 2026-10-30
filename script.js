/* NOIR — functional glass calculator */
const expressionEl=document.querySelector('#expression');
const resultEl=document.querySelector('#result');
const keypad=document.querySelector('#keypad');
const historyList=document.querySelector('#historyList');
const clearHistoryBtn=document.querySelector('#clearHistory');
const themeBtn=document.querySelector('#themeBtn');
const historyCount=document.querySelector('#historyCount');
const SYMBOLS={'+':'+','-':'−','*':'×','/':'÷'};
const MAX_LENGTH=14;
let state=createFreshState();
let history=loadHistory();
function createFreshState(){return{current:'0',previous:'',operator:null,overwrite:false,error:false}}
function appendDigit(digit){if(state.error)clearAll();if(state.overwrite){state.current=digit;state.overwrite=false}else if(state.current==='0'){state.current=digit}else if(state.current.length<MAX_LENGTH){state.current+=digit}}
function appendDecimal(){if(state.error)clearAll();if(state.overwrite){state.current='0.';state.overwrite=false}else if(!state.current.includes('.'))state.current+='.'}
function chooseOperator(operator){if(state.error)return;if(state.operator&&!state.overwrite){const value=calculate();if(value===null)return showError();state.current=value}state.previous=state.current;state.operator=operator;state.overwrite=true;updateDisplay()}
function toggleSign(){if(state.error||state.current==='0')return;state.current=state.current.startsWith('-')?state.current.slice(1):'-'+state.current}
function percent(){if(state.error)return;state.current=String(Number((parseFloat(state.current)/100).toFixed(10)));state.overwrite=true}
function deleteLast(){if(state.error)return clearAll();if(state.overwrite)return;state.current=state.current.slice(0,-1);if(state.current===''||state.current==='-')state.current='0'}
function clearAll(){state=createFreshState()}
function calculate(){const a=Number(state.previous),b=Number(state.current);let value;switch(state.operator){case'+':value=a+b;break;case'-':value=a-b;break;case'*':value=a*b;break;case'/':if(b===0)return null;value=a/b;break;default:return null}if(!Number.isFinite(value))return null;return String(Number(value.toPrecision(12)))}
function showError(){state=createFreshState();state.current='Error';state.error=true}
function equals(){if(!state.operator||state.overwrite||state.error)return;const expression=`${state.previous} ${SYMBOLS[state.operator]} ${state.current}`;const value=calculate();if(value===null)return showError();addToHistory(expression,value);state.current=value;state.previous='';state.operator=null;state.overwrite=true}
function updateDisplay(){resultEl.textContent=state.current;resultEl.classList.toggle('small',state.current.length>10);expressionEl.textContent=state.operator?`${state.previous} ${SYMBOLS[state.operator]}`:'';keypad.querySelectorAll('.operator').forEach(button=>button.classList.toggle('active',button.dataset.value===state.operator))}
function loadHistory(){try{const saved=JSON.parse(localStorage.getItem('noirCalcHistory')||'[]');return Array.isArray(saved)?saved.slice(0,8):[]}catch{return[]}}
function addToHistory(expression,result){history.unshift({expression,result});history=history.slice(0,8);try{localStorage.setItem('noirCalcHistory',JSON.stringify(history))}catch{}renderHistory()}
function renderHistory(){historyList.replaceChildren();historyCount.textContent=String(history.length).padStart(2,'0');if(!history.length){const empty=document.createElement('li');empty.className='empty';empty.textContent='Your calculations will appear here. Start with a simple sum.';historyList.append(empty);return}history.forEach(item=>{const li=document.createElement('li');const button=document.createElement('button');button.className='history-item';button.type='button';button.dataset.result=item.result;const expression=document.createElement('span');expression.textContent=`${item.expression} =`;const result=document.createElement('strong');result.textContent=item.result;button.append(expression,result);li.append(button);historyList.append(li)})}
keypad.addEventListener('click',event=>{const button=event.target.closest('.key');if(!button)return;const{action,value}=button.dataset;switch(action){case'digit':appendDigit(value);break;case'decimal':appendDecimal();break;case'operator':chooseOperator(value);break;case'equals':equals();break;case'clear':clearAll();break;case'delete':deleteLast();break;case'sign':toggleSign();break;case'percent':percent();break}updateDisplay()});
historyList.addEventListener('click',event=>{const item=event.target.closest('.history-item');if(!item)return;state=createFreshState();state.current=item.dataset.result;state.overwrite=true;updateDisplay()});
clearHistoryBtn.addEventListener('click',()=>{history=[];try{localStorage.removeItem('noirCalcHistory')}catch{}renderHistory()});
function applyTheme(theme){document.body.dataset.theme=theme;themeBtn.querySelector('.theme-icon').textContent=theme==='dark'?'☼':'◐';try{localStorage.setItem('noirCalcTheme',theme)}catch{}}
themeBtn.addEventListener('click',()=>applyTheme(document.body.dataset.theme==='dark'?'light':'dark'));
document.addEventListener('keydown',event=>{if(event.ctrlKey||event.metaKey||event.altKey)return;const key=event.key;let selector=null;if(/^[0-9]$/.test(key))selector=`[data-value="${key}"]`;else if(['+','-','*','/'].includes(key))selector=`[data-value="${key}"]`;else if(key==='.'||key===',')selector='[data-action="decimal"]';else if(key==='Enter'||key==='=')selector='[data-action="equals"]';else if(key==='Backspace')selector='[data-action="delete"]';else if(key==='Escape')selector='[data-action="clear"]';else if(key==='%')selector='[data-action="percent"]';if(!selector)return;event.preventDefault();const button=keypad.querySelector(selector);if(!button)return;button.classList.add('pressed');setTimeout(()=>button.classList.remove('pressed'),120);button.click()});
let savedTheme='dark';try{savedTheme=localStorage.getItem('noirCalcTheme')||'dark'}catch{}applyTheme(savedTheme);renderHistory();updateDisplay();
