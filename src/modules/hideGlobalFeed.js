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
	const displayOption = showScores == 'true' || document.URL.match(/\/robert\//) ? '' : 'none';
	let a = document.querySelectorAll(".score");
	if (a.length > 0) {
		a.forEach(s => s.style.display = displayOption);
	}
	a = document.querySelectorAll(".form.score")
	if (a.length > 0) {
		a.forEach(s => s.style.display = '');
	}
	a = document.querySelectorAll(".follow");
	if (a.length > 0) {
		a.forEach(n => hideSpanScore(n, displayOption));
	}
	const showReviews = document.cookie
		.split("; ")
		.find((row) => row.startsWith("showReviews="))
		?.split("=")[1]
	// description
	a = document.querySelector(".content");
	if (a && a.children && a.children.length > 1) {
		a.children[1].style.display = displayOption;
	}
	const reviewDisplayOption = showReviews == 'true' || document.URL.match(/\/robert\//) ? '' : 'none';
	a = document.querySelector(".threads");
	if (a) { a.style.display = reviewDisplayOption; }
	a = document.querySelector(".reviews");
	if (a) { a.style.display = reviewDisplayOption; }
	a = document.querySelectorAll(".grid-section-wrap");
	if (a && a.length > 2 && a[2] && a[2].children && a[2].children.length > 2 && a[2].children[2]){
		a = a[2].children[2].querySelector('.link')
		if (a) { a.style.display = reviewDisplayOption; }
	}
	addShowScoreButton(showScores == 'true')
}
function hideSpanScore(node, displayOption) {
	let spans = Array.from(node.getElementsByTagName('span'));
	spans.forEach(s => {
		if (s.textContent.includes('\/')) { s.style.display = displayOption; }
	});
}
function addShowScoreButton(showScores) {
	const a = document.getElementById("nav");
	if (!a){
		setTimeout(addShowScoreButton,100);
		return;
	}
	const footer = a.querySelector('.user-wrap .dropdown .footer');
	if (!footer){
		setTimeout(addShowScoreButton,100);
		return;
	}
	const checkbox = a.querySelector('.showScoresLabel');
	if (checkbox){
		return;
	}
	const showScoresLabel = create("span",'showScoresLabel','Show Scores',footer);
    const showScoresCheckbox = createCheckbox(footer,'showScoresCheckbox',showScores);
    showScoresLabel.onclick = function() {
        showScoresCheckbox.click()
    }
	showScoresCheckbox.onclick = function() {
		cookieStore.set('showScores', showScoresCheckbox.checked)
	}
}
