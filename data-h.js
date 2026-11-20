/* Қысқа жазу көмекшісі: P(n,{s:[конспект],t:[[термин,анықтама]],T:[[сұрақ,[жауаптар],дұрыс_индекс,түсіндірме]],Q:[[тұжырым,true/false,түсіндірме]],M:[[а,б]],W:[тапсырмалар],h:"үй тапсырмасы"}) */
window.PARA=window.PARA||{};
window.P=function(n,o){
  const clean=s=>s.replace(/\*\*/g,"");
  PARA[n]={summary:o.s,
    audio:"Параграф "+n+". "+TITLES[n-1]+". "+o.s.map(clean).join(" ")+" Енді білгеніңді тестпен тексер!",
    terms:o.t,
    test:o.T.map(([q,op,a,why])=>({q,o:op,a,why})),
    quiz:o.Q.map(([q,a,why])=>({q,a,why})),
    match:o.M,ws:o.W,
    homework:o.h||("Оқулықтың §"+n+" мәтінін оқы, «Сұрақтар мен тапсырмалар» бөлімін дәптерге орында, терминдерді жаттап ал.")};
};
