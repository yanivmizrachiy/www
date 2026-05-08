(function(){
  var title='ניהול הלו״ז';
  var stableDate=null;

  function todayText(){
    var now=new Date();
    var weekday=new Intl.DateTimeFormat('he-IL',{weekday:'long'}).format(now);
    var date=new Intl.DateTimeFormat('he-IL',{day:'numeric',month:'long',year:'numeric'}).format(now);
    return 'היום '+weekday+' — '+date;
  }

  function createStableDateLine(){
    var current=document.getElementById('clockDate');
    if(!current)return;

    if(current.dataset&&current.dataset.stableToday==='1'){
      stableDate=current;
      return;
    }

    var clone=current.cloneNode(false);
    clone.id='clockDate';
    clone.className=current.className;
    clone.dataset.stableToday='1';
    current.parentNode.replaceChild(clone,current);
    stableDate=clone;
  }

  function update(){
    createStableDateLine();
    if(stableDate)stableDate.textContent=todayText();

    document.querySelectorAll('.todayBanner').forEach(function(el){el.remove();});

    var h=document.querySelector('.pageTitle h1');
    if(h)h.textContent=title;
    document.title=title;
  }

  update();
  setInterval(update,1000);
})();
