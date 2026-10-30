const TODAY=new Date();const H=h=>new Date(TODAY-h*36e5);
const U=["Unidade Centro","Unidade Shopping","Unidade Rodovia","Unidade Bairro Norte"];
const C=[
["C-0401","Ana P.",0,4,0,4,4,2,1,60,["Primeiro dia"]],["C-0402","Bruno S.",1,9,1,9,8,4,2,140,["Primeiro dia","Semana 1"]],
["C-0403","Carla M.",2,12,2,12,9,5,2,170,["Semana 1"]],["C-0404","Diego L.",0,17,1,14,12,7,3,230,["Semana 1","Quiz mestre"]],
["C-0405","Elisa R.",3,22,3,16,11,6,2,190,["Semana 1"]],["C-0406","Felipe T.",1,31,2,20,16,9,4,310,["Semana 1","Quiz mestre"]],
["C-0407","Gabi N.",2,35,6,21,12,5,1,120,["Semana 1"]],["C-0408","Hugo C.",0,46,2,24,20,12,5,420,["Semana 1","Quiz mestre","30 dias"]],
["C-0409","Iara V.",3,52,4,25,19,10,4,350,["Semana 1","30 dias"]],["C-0410","João K.",1,63,3,27,22,13,6,480,["Semana 1","30 dias","Quiz mestre"]],
["C-0411","Lia F.",2,78,5,29,23,14,6,510,["Semana 1","30 dias"]],["C-0412","Marcos D.",0,90,0,30,26,16,7,590,["Semana 1","30 dias","Quiz mestre","90 dias"]]
].map(a=>({id:a[0],nome:a[1],u:a[2],dia:a[3],lc:a[4],env:a[5],resp:a[6],pil:a[7],quiz:a[8],pts:a[9],conq:a[10],start:new Date(TODAY-(a[3]-1)*864e5)}));
const CAT={cans:"Cansaço ou sobrecarga",adap:"Dúvidas ou dificuldades de adaptação",desm:"Desmotivação",conf:"Conflito",grav:"Situação grave ou sensível"};
const SEP=k=>k==="conf"||k==="grav";
const A=[
{id:"AL-101",c:"C-0405",cat:"cans",h:3,resp:"Gerente direto",prazo:"3d",st:"pend",res:"Relata cansaço após turnos seguidos.",ev:[["Geração",3],["Encaminhamento",3]]},
{id:"AL-102",c:"C-0407",cat:"desm",h:30,resp:"Líder de turno",prazo:"hoje",st:"wait",res:"Menciona pouca vontade de continuar nas tarefas.",ev:[["Geração",30],["Encaminhamento",30],["Lembrete (24h)",6]]},
{id:"AL-103",c:"C-0403",cat:"conf",h:5,resp:"RH (canal separado)",prazo:"hoje",st:"pend",res:"Relato envolvendo a chefia. Restrito ao RH/Direção.",ev:[["Geração",5],["Encaminhamento",5]]},
{id:"AL-104",c:"C-0402",cat:"adap",h:60,resp:"Gerente direto",prazo:"3d",st:"ok",res:"Dúvidas sobre o uso de equipamentos.",ret:7,ev:[["Geração",60],["Encaminhamento",60],["Lembrete (24h)",36],["Retorno: Conversei",24],["Encerramento",23]]},
{id:"AL-105",c:"C-0409",cat:"adap",h:20,resp:"Líder de turno",prazo:"3d",st:"pend",res:"Dificuldade de entender o fluxo de pedidos.",ev:[["Geração",20],["Encaminhamento",20]]},
{id:"AL-106",c:"C-0410",cat:"cans",h:100,resp:"Gerente direto",prazo:"3d",st:"ok",res:"Cansaço no fim de semana de maior movimento.",ret:30,ev:[["Geração",100],["Encaminhamento",100],["Lembrete (24h)",76],["Retorno: Conversei",70],["Encerramento",69]]},
{id:"AL-107",c:"C-0406",cat:"grav",h:4,resp:"Direção (canal separado)",prazo:"hoje",st:"pend",res:"Situação sensível. Restrito ao RH/Direção.",ev:[["Geração",4],["Encaminhamento",4]]},
{id:"AL-108",c:"C-0411",cat:"desm",h:200,resp:"Gerente direto",prazo:"3d",st:"ok",res:"Fala em desânimo com a rotina.",ret:12,ev:[["Geração",200],["Encaminhamento",200],["Retorno: Conversei",188],["Encerramento",187]]}
];
const cb=id=>C.find(x=>x.id===id);const fmt=h=>H(h).toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
const overdue=a=>a.st!=="ok"&&a.h>(a.prazo==="hoje"?24:72);
const stA=a=>a.st==="ok"?["t-ok","✔ Atendimento registrado"]:overdue(a)||a.st==="wait"?["t-wait","⏳ Aguardando retorno"+(overdue(a)?" · fora do prazo":"")]:["t-pend","● Alerta pendente"];
const pendCount=id=>A.filter(a=>a.c===id&&a.st!=="ok").length;
function stC(c){if(c.dia>=90)return["t-done","✔ Jornada concluída"];const al=A.filter(a=>a.c===c.id);if(al.some(a=>a.st!=="ok"&&(overdue(a)||a.st==="wait")))return["t-wait","⏳ Aguardando retorno"];if(al.some(a=>a.st!=="ok"))return["t-pend","● Alerta pendente"];if(al.length)return["t-ok","✔ Atendimento registrado"];return["t-go","▶ Em andamento"]}
const pct=d=>Math.max(0,Math.min(100,Math.round(d/90*100)));
const next=d=>[7,15,30,45,60,90].find(x=>x>d)||null;
const pages={visao:"Visão geral",colab:"Colaboradores",alertas:"Alertas",jornada:"Acompanhamento da jornada",ind:"Indicadores",conf:"Configurações"};
const ico={visao:"▦",colab:"☺",alertas:"⚑",jornada:"➤",ind:"▤",conf:"⚙"};
let page="visao",filt={},sort={k:"dia",d:1},q="";
const $=s=>document.querySelector(s),e=s=>String(s).replace(/[&<>]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[m]));
const tag=t=>`<span class="tag ${t[0]}">${t[1]}</span>`;
function toast(m){const t=document.createElement("div");t.className="toast";t.setAttribute("role","status");t.textContent=m;document.body.append(t);setTimeout(()=>t.remove(),3200)}
function go(p,f){page=p;filt=f||{};q="";closeP();$("#view").innerHTML='<div class="load">Carregando…</div>';render()}
function nav(){$("#nav").innerHTML=Object.keys(pages).map(k=>`<button data-p="${k}" ${k===page?'aria-current="page"':''}><i>${ico[k]}</i>${pages[k]}</button>`).join("");document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>go(b.dataset.p))}
function unitSel(){const s=$("#fu");s.innerHTML='<option value="">Todas as unidades</option>'+U.map((u,i)=>`<option value="${i}">${u}</option>`).join("");s.onchange=()=>render()}
const unitF=()=>$("#fu").value;
const cs=()=>C.filter(c=>unitF()===""||c.u==+unitF());
const as=()=>A.filter(a=>unitF()===""||cb(a.c).u==+unitF());
function render(){nav();$("#ttl").textContent=pages[page];const pc=A.filter(a=>a.st!=="ok").length;$("#bc").textContent=pc;
$("#sub").textContent="Olá, Marina. "+(page==="alertas"?"Quem precisa de atenção agora?":"Acompanhe os novos colaboradores.");
$("#dt").textContent=TODAY.toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"long",year:"numeric"});
setTimeout(()=>{$("#view").innerHTML={visao,colab,alertas,jornada,ind,conf}[page]();bind()},180)}
function alertRow(a){const c=cb(a.c),t=stA(a);return`<div class="row"><div class="g"><b>${a.id} · ${c.nome}</b> <small>${CAT[a.cat]} · ${U[c.u]} · ${a.resp}</small><small>Contato recomendado ${a.prazo==="hoje"?"ainda hoje":"nos próximos 3 dias"}</small></div>${tag(t)}<button class="btn o" data-al="${a.id}">Abrir</button></div>`}
function visao(){const L=cs(),AA=as();const em=L.filter(c=>c.dia<90),ap=AA.filter(a=>a.st!=="ok"),at=AA.filter(a=>a.st==="ok"),cc=L.filter(c=>c.dia>=90);
const k=(n,t,i,f,hot)=>`<button class="kpi ${hot?"hot":""}" data-go="${f}"><span class="ic">${i}</span><div class="n">${n}</div><div class="t">${t}</div></button>`;
return`<div class="note">Dados de demonstração fictícios. Totais dos cards = registros das tabelas.</div><div class="kpis">${k(L.length,"Colaboradores na jornada","☺","colab")}${k(em.length,"Jornadas em andamento","▶","colab:andamento")}${k(ap.length,"Alertas pendentes","⚑","alertas:pend",1)}${k(at.length,"Alertas atendidos","✔","alertas:ok")}${k(cc.length,"Jornadas concluídas","★","colab:concl")}</div>
<div class="grid2"><div class="card pri"><h2>Alertas que precisam de atenção</h2>${ap.length?ap.sort((a,b)=>overdue(b)-overdue(a)||b.h-a.h).map(alertRow).join(""):'<div class="empty">Nenhum alerta pendente.</div>'}</div>
<div class="card"><h2>Jornadas em andamento</h2>${em.sort((a,b)=>a.dia-b.dia).map(c=>`<div class="row"><div class="g"><b>${c.nome}</b> <small>Dia ${c.dia} de 90 · próxima etapa: ${next(c.dia)?"dia "+next(c.dia):"—"}</small><div class="bar" role="progressbar" aria-valuenow="${pct(c.dia)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct(c.dia)}%"></i></div></div></div>`).join("")}</div></div>`}
function colab(){const f=filt;return`<div class="card"><div class="tools"><input type="search" id="q" placeholder="Buscar por nome ou ID" aria-label="Buscar" value="${e(q)}"><select id="fd" aria-label="Faixa de dias"><option value="">Todos os dias</option><option value="0-15">Dias 1–15</option><option value="16-45">Dias 16–45</option><option value="46-89">Dias 46–89</option><option value="90-90">Dia 90</option></select><select id="fs" aria-label="Situação"><option value="">Toda situação</option><option>Em andamento</option><option>Alerta pendente</option><option>Aguardando retorno</option><option>Atendimento registrado</option><option>Jornada concluída</option></select></div><div class="tw" id="tb"></div></div>`}
function table(){const d=$("#fd").value,s=$("#fs").value;let L=cs().filter(c=>(c.nome+c.id).toLowerCase().includes(q.toLowerCase()));
if(d){const[a,b]=d.split("-").map(Number);L=L.filter(c=>c.dia>=a&&c.dia<=b)}
if(s)L=L.filter(c=>stC(c)[1].includes(s));
if(filt.t==="andamento")L=L.filter(c=>c.dia<90);if(filt.t==="concl")L=L.filter(c=>c.dia>=90);
L.sort((a,b)=>{const v=x=>sort.k==="u"?x.u:sort.k==="pend"?pendCount(x.id):x[sort.k]||0;return(v(a)-v(b))*sort.d});
const th=(k,l)=>`<th><button data-s="${k}">${l}${sort.k===k?(sort.d>0?" ▲":" ▼"):""}</button></th>`;
if(!L.length)return'<div class="empty">Nenhum colaborador encontrado. Ajuste os filtros.</div>';
return`<table><thead><tr><th>Colaborador</th>${th("u","Unidade")}${th("start","Início")}${th("dia","Dia")}<th>Progresso</th>${th("lc","Último check-in")}${th("pend","Alertas pend.")}<th>Situação</th></tr></thead><tbody>${L.map(c=>`<tr class="c" tabindex="0" data-c="${c.id}"><td><b>${c.nome}</b> <small>${c.id}</small></td><td>${U[c.u]}</td><td>${c.start.toLocaleDateString("pt-BR")}</td><td>${c.dia}</td><td><div class="bar"><i style="width:${pct(c.dia)}%"></i></div> ${pct(c.dia)}%</td><td>${c.lc===0?"Hoje":c.lc+" d atrás"}</td><td>${pendCount(c.id)}</td><td>${tag(stC(c))}</td></tr>`).join("")}</tbody></table>`}
function alertas(){return`<div class="note">Alertas são possíveis sinais identificados pela IA. Não são diagnósticos. Prazo recomendado não é prazo legal.</div><div class="card pri"><div class="tools"><select id="fa" aria-label="Estado"><option value="">Todos os estados</option><option value="pend">Pendentes</option><option value="wait">Aguardando retorno</option><option value="ok">Atendidos</option></select><select id="fc" aria-label="Categoria"><option value="">Todas as categorias</option>${Object.entries(CAT).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select></div><div id="al"></div></div>`}
function alList(){const s=$("#fa").value,c=$("#fc").value;let L=as().filter(a=>(!s||(s==="ok"?a.st==="ok":s==="wait"?a.st!=="ok"&&(overdue(a)||a.st==="wait"):a.st!=="ok"))&&(!c||a.cat===c));
return L.length?L.sort((a,b)=>b.h-a.h).map(alertRow).join(""):'<div class="empty">Nenhum alerta neste filtro.</div>'}
function jornada(){const L=cs();const stg=[[0,6,"Dias 1–6"],[7,14,"Dia 7"],[15,29,"Dia 15"],[30,44,"Dia 30"],[45,59,"Dia 45"],[60,89,"Dia 60"],[90,90,"Dia 90"]];
const hist=as().filter(a=>a.st==="ok");
return`<div class="note">O assistente complementa os encontros presenciais (dias 7, 15, 30, 45, 60 e 90). Mensagens diárias nos primeiros 10 dias e depois mais espaçadas. Check-in sem resposta não indica desmotivação ou risco.</div>
<div class="stages">${stg.map(s=>`<div class="stage"><b>${L.filter(c=>c.dia>=(s[0]||1)&&c.dia<=s[1]).length}</b>${s[2]}<br><small>colaboradores na etapa</small></div>`).join("")}</div><br>
<div class="grid2"><div class="card"><h2>Check-ins e próximos marcos</h2><div class="tw"><table><tr><th>Colaborador</th><th>Realizados</th><th>Pendentes</th><th>Próximo marco</th><th>Alertas abertos</th></tr>${L.map(c=>`<tr><td>${c.nome}</td><td>${c.resp}</td><td>${c.env-c.resp}</td><td>${next(c.dia)?"Dia "+next(c.dia)+" (em "+(next(c.dia)-c.dia)+" d)":"Concluído"}</td><td>${pendCount(c.id)}</td></tr>`).join("")}</table></div></div>
<div class="card"><h2>Histórico de atendimentos</h2>${hist.length?hist.map(a=>`<div class="row"><div class="g"><b>${a.id} · ${cb(a.c).nome}</b><small>${CAT[a.cat]} · retorno em ${a.ret} h</small></div>${tag(["t-ok","✔ Conversei"])}</div>`).join(""):'<div class="empty">Sem atendimentos registrados.</div>'}</div></div>`}
function ind(){const L=cs(),AA=as(),env=L.reduce((s,c)=>s+c.env,0),resp=L.reduce((s,c)=>s+c.resp,0);const ret=AA.filter(a=>a.st==="ok").map(a=>a.ret);
const m=(l,v)=>`<div class="card"><div class="t" style="color:var(--mut)">${l}</div><div style="font-family:Impact;font-size:28px">${v}</div></div>`;
return`<div class="kpis">${m("Colaboradores acompanhados",L.length)}${m("Alertas gerados",AA.length)}${m("Alertas atendidos",AA.filter(a=>a.st==="ok").length)}${m("Alertas pendentes",AA.filter(a=>a.st!=="ok").length)}${m("Tempo médio até o 1º retorno",ret.length?Math.round(ret.reduce((a,b)=>a+b)/ret.length)+" h":"Sem dados disponíveis")}${m("Alertas sem retorno após 24 h",AA.filter(a=>a.st!=="ok"&&a.h>24).length)}${m("Taxa de resposta aos check-ins",env?Math.round(resp/env*100)+"%":"Sem dados disponíveis")}</div>
<div class="card"><h2>Engajamento (área secundária)</h2><p class="note">Pontos refletem participação e aprendizado. Não medem desempenho, risco ou qualidade profissional. Sem ranking.</p><div class="kpis">${m("Pílulas concluídas",L.reduce((s,c)=>s+c.pil,0))}${m("Quizzes concluídos",L.reduce((s,c)=>s+c.quiz,0))}${m("Pontos acumulados (total)",L.reduce((s,c)=>s+c.pts,0))}${m("Conquistas desbloqueadas",L.reduce((s,c)=>s+c.conq.length,0))}</div></div>
<p class="sub" style="color:var(--mut)">Os números descrevem o processo e não indicam causa de desligamentos ou de permanência. Filtro de período é ilustrativo nesta demonstração.</p>`}
function conf(){return`<div class="card"><h2>Privacidade e transparência</h2><p>• Participação voluntária; o colaborador é informado do que é compartilhado e com quem.<br>• O colaborador é avisado sempre que um alerta é gerado.<br>• Conflito com a chefia e situações graves seguem canal separado (RH/Direção).<br>• Conversas completas não ficam disponíveis por padrão.<br>• Sem pontuação de risco individual, diagnóstico ou vigilância.</p></div><div class="card"><h2>Integrações</h2><p>WhatsApp, IA e banco de dados: <b>não conectados</b>. Esta tela simula as interações com dados fictícios.</p></div>`}
function closeP(){$("#ov").innerHTML=""}
function panel(h){$("#ov").innerHTML=`<div class="scrim" id="sc"></div><aside class="panel" role="dialog" aria-modal="true" style="display:block;color:var(--ink);background:var(--card)">${h}<p><button class="btn o" id="cl">Fechar</button></p></aside>`;$("#sc").onclick=$("#cl").onclick=closeP;$("#cl").focus()}
function openC(id){const c=cb(id),al=A.filter(a=>a.c===id);panel(`<h2 style="font-size:24px">${c.nome} · ${c.id}</h2><p>${U[c.u]} · dia ${c.dia} de 90 ${tag(stC(c))}</p><h3>Check-ins</h3><p>${c.resp} respondidos de ${c.env} enviados. Último: ${c.lc===0?"hoje":c.lc+" d atrás"}.</p><h3>Engajamento</h3><p>${c.pil} pílulas · ${c.quiz} quizzes · ${c.pts} pontos<br>Conquistas: ${c.conq.join(", ")}</p><h3>Alertas relacionados</h3>${al.length?al.map(a=>`<div class="row"><div class="g"><b>${a.id}</b> <small>${CAT[a.cat]}</small></div>${tag(stA(a))}${SEP(a.cat)?'<span class="lock">restrito</span>':`<button class="btn o" data-al="${a.id}">Abrir</button>`}</div>`).join(""):"<p>Nenhum alerta.</p>"}<p class="lock">Conversas e relatos completos não são exibidos aqui.</p>`);bindAl()}
function openA(id){const a=A.find(x=>x.id===id),c=cb(a.c);panel(`<h2 style="font-size:24px">${a.id}</h2><p>${tag(stA(a))}</p><p><b>${c.nome}</b> · ${U[c.u]}<br>Gerado em ${fmt(a.h)}<br>Categoria: ${CAT[a.cat]}<br>Responsável: ${a.resp}<br>Sugestão: contato ${a.prazo==="hoje"?"ainda hoje":"nos próximos 3 dias"}</p><h3>Resumo</h3><p>${e(a.res)}</p>${SEP(a.cat)?'<p class="note">Canal separado: não é encaminhado ao gerente direto, para proteger quem fez o relato.</p>':""}<h3>Linha do tempo</h3><div class="tl">${a.ev.map(x=>`<div><b>${x[0]}</b><br><small>${fmt(x[1])}</small></div>`).join("")}</div>${a.st==="ok"?"":`<p><b>Registrar retorno do responsável</b></p><button class="btn" data-r="conv">Conversei</button> <button class="btn y" data-r="nao">Não consegui</button>`}`);
document.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>confirmR(a,b.dataset.r))}
function confirmR(a,r){const m=document.createElement("div");m.className="modal";m.innerHTML=`<div role="alertdialog" aria-modal="true"><h3 style="font-size:22px">Confirmar retorno</h3><p>Registrar “${r==="conv"?"Conversei":"Não consegui"}” para ${a.id}?${r==="nao"?" O alerta continuará visível para acompanhamento.":""}</p><button class="btn" id="ok">Confirmar</button> <button class="btn o" id="no">Cancelar</button></div>`;document.body.append(m);$("#ok").focus();$("#no").onclick=()=>m.remove();
$("#ok").onclick=()=>{m.remove();if(r==="conv"){a.st="ok";a.ret=Math.max(1,a.h);a.ev.push(["Retorno: Conversei",0],["Encerramento",0]);toast("Retorno registrado. Alerta encerrado.")}else{a.st="wait";a.ev.push(["Retorno: Não consegui",0]);toast("Registrado. O alerta continua em acompanhamento.")}render();openA(a.id)}}
function bindAl(){document.querySelectorAll("[data-al]").forEach(b=>b.onclick=()=>openA(b.dataset.al))}
function bind(){bindAl();document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{const[p,t]=b.dataset.go.split(":");go(p,{t});if(p==="alertas")setTimeout(()=>{if(t){$("#fa").value=t==="ok"?"ok":"pend";$("#al").innerHTML=alList();bindAl()}},260)});
if(page==="colab"){const draw=()=>{$("#tb").innerHTML=table();document.querySelectorAll("[data-c]").forEach(r=>{r.onclick=()=>openC(r.dataset.c);r.onkeydown=ev=>{if(ev.key==="Enter")openC(r.dataset.c)}});document.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{sort={k:b.dataset.s,d:sort.k===b.dataset.s?-sort.d:1};draw()})};
$("#q").oninput=ev=>{q=ev.target.value;draw()};$("#fd").onchange=$("#fs").onchange=draw;draw()}
if(page==="alertas"){const d=()=>{$("#al").innerHTML=alList();bindAl()};$("#fa").onchange=$("#fc").onchange=d;d()}}
$("#bell").onclick=()=>go("alertas",{t:"pend"});
unitSel();render();