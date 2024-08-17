function hideGlobalFeed(){
	if(!location.pathname.match(/^\/home/)){
		return
	}
	let toggle = document.querySelector(".feed-type-toggle");
	if(!toggle){
		setTimeout(hideGlobalFeed,100);
		return
	}
	toggle.children[1].style.display = "none";
	if(toggle.children[1].classList.contains("active")){
		toggle.children[0].click()
	}
	let a = document.querySelector(".recent-threads");
	if(!a){
		setTimeout(hideGlobalFeed,100);
		return
	}
	a.style.display = "none";
	a = document.querySelector(".recent-reviews");
	if(!a){
		setTimeout(hideGlobalFeed,100);
		return
	}
	a.style.display = "none";
}
function hideReviews(){
    // to turn off:
    // await cookieStore.set('showScores', true)
    const showScores = document.cookie
    .split("; ")
    .find((row) => row.startsWith("showScores="))
    ?.split("=")[1]
    const displayOption = showScores == 'true' ? '' : 'none';
	let a = document.querySelectorAll(".score");
	if (a.length > 0 && !document.URL.match(/\/robert\//)) {
        a.forEach(s => s.style.display = displayOption);
    }
    a = document.querySelectorAll(".follow");
	if (a.length > 0) {
        a.forEach(n => hideSpanScore(n, displayOption));
    }
	a = document.querySelector(".content");
	if (a && a.children && a.children.length > 1) {
        a.children[1].style.display = "none";
    }
	a = document.querySelector(".threads");
	if (a) { a.style.display = "none"; }
	a = document.querySelector(".reviews");
	if (a) { a.style.display = "none"; }
	a = document.querySelectorAll(".grid-section-wrap");
	if (a && a.length > 2 && a[2] && a[2].children && a[2].children.length > 2 && a[2].children[2]){
        a = a[2].children[2].querySelector('.link')
        if (a) { a.style.display = "none"; }
    }
}
function hideSpanScore(node, displayOption) {
    let spans = Array.from(node.getElementsByTagName('span'));
    spans.forEach(s => {
        if (s.textContent.includes('\/')) { s.style.display = displayOption; }
    });
}
