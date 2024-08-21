//begin "controller.js"
const modules = [];

let current = "";

function handleScripts(url,oldUrl){
	modules.forEach(module => {
		if(useScripts[module.id] && (script_type !== "Boneless" || !module.boneless_disable) && module.urlMatch && module.code && module.urlMatch(url,oldUrl)){
			module.code()
		}
	})
	if(useScripts.additionalTranslation && useScripts.partialLocalisationLanguage !== "English"){
		let nav = document.getElementById("nav");
		if(nav){
			try{
				nav.querySelector('a[href="/home"].link').childNodes[0].textContent = translate("$menu_home");
				nav.querySelector('a[href^="/user/"].link').childNodes[0].textContent = translate("$menu_profile");
				nav.querySelector('a[href$="/animelist"].link').childNodes[0].textContent = translate("$menu_animelist");
				nav.querySelector('a[href$="/mangalist"].link').childNodes[0].textContent = translate("$menu_mangalist");
				nav.querySelector('a[href^="/search/"].link').childNodes[0].textContent = translate("$menu_browse");
				(nav.querySelector('a[href="/forum/overview"].link') || nav.querySelector('a[href="/forum/recent"].link')).childNodes[0].textContent = translate("$menu_forum");
				nav.querySelector('.user-wrap .dropdown a[href="/notifications"] .label').textContent = translate("$mainMenu_notifications");
				nav.querySelector('.user-wrap .dropdown a[href^="/user/"] .label').textContent = translate("$mainMenu_profile");
				nav.querySelector('.user-wrap .dropdown a[href="/settings"] .label').textContent = translate("$mainMenu_settings");
			}
			catch(e){
				console.log(e)
			}
		}
	}
	if((url === "https://anilist.co/notifications" || url === "https://anilist.co/notifications#") && useScripts.notifications){
		enhanceNotifications();
		return
	}
	else if(url === "https://anilist.co/user/" + whoAmI + "/social#my-threads"){
		selectMyThreads()
	}
	else if(url === "https://anilist.co/settings/import" && useScripts.moreImports){
		moreImports()
	}
	else if(url === "https://anilist.co/404"){
		possibleBlocked(oldUrl)
	}
	if(/^https:\/\/anilist\.co\/(anime|manga)\/\d*(\/[\w-]*)?\/social/.test(url)){
		if(useScripts.socialTab){
			enhanceSocialTab();
		}
		if(useScripts.socialTabFeed){
			enhanceSocialTabFeed()
		}
		if(useScripts.activityTimeline){
			addActivityTimeline()
		}
	}
	else{
		stats.element = null;
		stats.count = 0;
		stats.scoreSum = 0;
		stats.scoreCount = 0;
	}
	if(
		/\/stats\/?/.test(url)
		&& useScripts.moreStats
	){
		addMoreStats()
	}
	if(/^https:\/\/anilist\.co\/home#access_token/.test(url)){
		let tokenList = location.hash.split("&").map(a => a.split("="));
		useScripts.accessToken = tokenList[0][1];
		useScripts.save();
		location.replace(location.protocol + "//" + location.hostname + location.pathname);
	}
	if(/^https:\/\/anilist\.co\/home#aniscripts-login/.test(url)){
		if(useScripts.accessToken){
			alert("Already authorized. You can rewoke this under 'apps' in your Anilist settings")
		}
		else{
			location.href = authUrl
		}
	}
	if(/^https:\/\/anilist\.co\/user/.test(url)){
		if(
			useScripts.partialLocalisationLanguage !== "English"
		){
			addFeedFilters_user()
		}
		if(useScripts.completedScore || useScripts.droppedScore){//we also want this script to run on user pages
			addCompletedScores()
		}
		if(useScripts.embedHentai){
			embedHentai()
		}
		if(useScripts.noImagePolyfill || useScripts.SFWmode){
			addImageFallback()
		}
		let adder = function(){
			let banner = document.querySelector(".banner");
			if(banner && banner.style.backgroundImage !== "url(\"undefined\")"){
				if(banner.style.backgroundImage === `url("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7")`){
					//edge case, no avaiable banner to show (private profiles, etc.)
					//do not create banner download icon
					return
				}
				let bannerLink = document.querySelector(".hohDownload") || create("a","hohDownload",null,banner);
				removeChildren(bannerLink);
				const linkPlace = banner.style.backgroundImage.replace("url(","").replace(")","").replace('"',"").replace('"',"");
				bannerLink.href = linkPlace;
				bannerLink.title = translate("$download_banner_tooltip");
				bannerLink.appendChild(svgAssets2.download.cloneNode(true))
				if(linkPlace === "null"){
					bannerLink.style.display = "none"
				}
			}
			else{
				setTimeout(adder,500)
			}
		};adder();
		if(useScripts.milestones){
			meanScoreBack()
		}
		if(useScripts.profileBackground){
			profileBackground()
		}
		if(useScripts.customCSS){
			addCustomCSS()
		}
		if(useScripts.hideGlobalFeed){
			hideReviews()
			setInterval(hideReviews, 2000)
		}
	}
	else{
		customStyle.textContent = ""
	}
	if(
		url.match(/^https:\/\/anilist\.co\/forum\/thread\/.*/)
	){
		if(useScripts.embedHentai){
			embedHentai()
		}
	}
	else if(/^https:\/\/anilist\.co\/forum\/?(overview|search\?.*|recent|new|subscribed)?$/.test(url)){
		if(useScripts.myThreads){
			addMyThreadsLink()
		}
	}
	else if(/^https:\/\/anilist\.co\/staff\/.*/.test(url)){
		if(useScripts.staffPages){
			enhanceStaff()
		}
	}
	else if(
		url.match(/^https:\/\/anilist\.co\/studio\/.*/)
	){
		if(useScripts.studioFavouriteCount){
			enhanceStudio()
		}
		if(useScripts.studioSorting){
			addStudioBrowseSwitch()
		}
	}
	if(
		url.match(/^https:\/\/anilist\.co\/user\/.*\/social/)
	){
		if(useScripts.CSSfollowCounter){
			addFollowCount()
		}
		addSocialThemeSwitch();
	}
	if(
		url.match(/^https:\/\/anilist\.co\/.+\/(anime|manga)list\/?(.*)?$/)
	){
		if(useScripts.viewAdvancedScores){
			viewAdvancedScores(url)
		}
	}
	if(
		url.match(/^https:\/\/anilist\.co\/user\/(.*)\/(anime|manga)list\/compare/)
		&& useScripts.comparissionPage//incorrect spelling to leave backwards compatibility with configs. Doesn't matter as it isn't visible
	){
		addComparisionPage()//this one on the other hand *should* be spelled correctly
	}
	else{
		let possibleHohCompareRemaining = document.querySelector(".hohCompare");
		if(possibleHohCompareRemaining){
			(document.querySelectorAll(".hohCompareUIfragment") || []).forEach(fragment => fragment.remove());
			possibleHohCompareRemaining.remove()
		}
	}
	if(url.match(/^https:\/\/anilist\.co\/search/) && useScripts.CSSverticalNav){
		let lamaDrama = document.querySelector(".nav .browse-wrap .router-link-exact-active.router-link-active");
		if(lamaDrama){
			lamaDrama.classList.remove("router-link-exact-active");
			lamaDrama.classList.remove("router-link-active");
			lamaDrama.parentNode.classList.add("router-link-exact-active");
			lamaDrama.parentNode.classList.add("router-link-active");
			Array.from(document.querySelectorAll(".nav .link")).forEach(link => {
				link.onclick = function(){
					lamaDrama.parentNode.classList.remove("router-link-exact-active");
					lamaDrama.parentNode.classList.remove("router-link-active")
				}
			})
		}
	}
	if(url.match(/^https:\/\/anilist\.co\/search\/staff/)){
		if(useScripts.staffPages){
			enhanceStaffBrowse()
		}
	}
	let mangaAnimeMatch = url.match(/^https:\/\/anilist\.co\/(anime|manga)\/(\d+)\/?([^/]*)?\/?(.*)?/);
	if(mangaAnimeMatch){
		let adder = function(){
			if(!document.URL.match(/^https:\/\/anilist\.co\/(anime|manga)\/?/)){
				return
			}
			let banner = document.querySelector(".media .banner");
			if(banner){
				let bannerLink = document.querySelector(".hohDownload") || create("a","hohDownload",null,banner);
				removeChildren(bannerLink);
				bannerLink.title = translate("$download_banner_tooltip");
				bannerLink.href = banner.style.backgroundImage.replace("url(","").replace(")","").replace('"',"").replace('"',"");
				bannerLink.appendChild(svgAssets2.download.cloneNode(true))
			}
			else{
				setTimeout(adder,500)
			}
		};adder();
		if(useScripts.subTitleInfo){
			addSubTitleInfo()
		}
		if(useScripts.dubMarker && mangaAnimeMatch[1] === "anime"){
			dubMarker()
		}
		else if(useScripts.mangaGuess && mangaAnimeMatch[1] === "manga"){
			mangaGuess(false,parseInt(mangaAnimeMatch[2]))
		}
		if(useScripts.mangaGuess && mangaAnimeMatch[1] === "anime"){
			mangaGuess(true)
		}
		if(useScripts.MALscore || useScripts.MALserial || useScripts.MALrecs){
			addMALscore(mangaAnimeMatch[1],mangaAnimeMatch[2])
		}
		if(useScripts.accessToken){
			addRelationStatusDot(mangaAnimeMatch[2])
		}
		if(useScripts.entryScore && whoAmI){
			addEntryScore(mangaAnimeMatch[2])
		}
		if(useScripts.SFWmode){
			cencorMediaPage(mangaAnimeMatch[2])
		}
		if(useScripts.hideGlobalFeed){
			hideReviews()
			setInterval(hideReviews, 2000)
		}

		const urlID = parseInt(mangaAnimeMatch[2]);
		if(aliases.has(urlID)){
			let alias = aliases.get(urlID);
			let newState = "/" + mangaAnimeMatch[1] + "/" + urlID + "/" + safeURL(alias) + "/";
			if(mangaAnimeMatch[4]){
				newState += mangaAnimeMatch[4]
			}
			history.replaceState({},"",newState);
			current = document.URL;
			let titleReplacer = () => {
				let mangaAnimeMatch2 = document.URL.match(/^https:\/\/anilist\.co\/(anime|manga)\/(\d+)\/?([^/]*)?\/?(.*)?/);
				if(!mangaAnimeMatch2 || mangaAnimeMatch[2] !== mangaAnimeMatch2[2]){
					return
				}
				let mainTitle = document.querySelector("h1");//fragile, just like your heterosexuality
				if(mainTitle){
					mainTitle.id = "hohAliasHeading";
					mainTitle.childNodes[0].textContent = alias
				}
				else{
					setTimeout(titleReplacer,100)
				}
			};
			titleReplacer()
		}
		else{
			let titleReplacer = () => {
				let mangaAnimeMatch2 = document.URL.match(/^https:\/\/anilist\.co\/(anime|manga)\/(\d+)\/?([^/]*)?\/?(.*)?/);
				if(!mangaAnimeMatch2 || mangaAnimeMatch[2] !== mangaAnimeMatch2[2]){
					return
				}
				let mainTitle = document.querySelector("h1");
				if(mainTitle){
					mainTitle.childNodes[0].textContent = mainTitle.childNodes[0].textContent.trim()
				}
				else{
					setTimeout(titleReplacer,1000)
				}
			};
			titleReplacer()
		}

		if(useScripts.socialTab){
			scoreOverviewFixer()
		}
	}
	if(url.match(/^https:\/\/anilist\.co\/home\/?$/)){
		if(useScripts.completedScore || useScripts.droppedScore){
			addCompletedScores()
		}
		if(useScripts.betterListPreview && whoAmI && useScripts.accessToken && (!useScripts.mobileFriendly)){
			betterListPreview()
		}
		if(useScripts.progressBar){
			addProgressBar()
		}
		if(
			(useScripts.feedCommentFilter && (!useScripts.mobileFriendly))
			|| localStorage.getItem("blockList")
			|| useScripts.blockWord
			|| useScripts.statusBorder
			|| useScripts.partialLocalisationLanguage !== "English"
		){
			addFeedFilters()
		}
		if(useScripts.expandRight){
			expandRight()
		}
		if(useScripts.embedHentai){
			embedHentai()
		}
		if(useScripts.hideAWC || useScripts.hideOtherThreads){
			addForumMediaNoAWC()
		}
		else if(useScripts.forumMedia){
			addForumMediaTitle()
		}
		if(useScripts.noImagePolyfill || useScripts.SFWmode){
			addImageFallback()
		}
		if(useScripts.hideGlobalFeed){
			hideGlobalFeed()
			setInterval(hideGlobalFeed, 2000)
		}
		if(useScripts.betterReviewRatings){
			betterReviewRatings()
		}
		if(useScripts.homeScroll){
			let homeButton = document.querySelector(".nav .link[href=\"/home\"]");
			if(homeButton){
				homeButton.onclick = () => {
					if(document.URL.match(/^https:\/\/anilist\.co\/home\/?$/)){
						window.scrollTo({top: 0,behavior: "smooth"})
					}
				}
			}
		}
		linkFixer()
	}
	let activityMatch = url.match(/^https:\/\/anilist\.co\/activity\/(\d+)/);
	if(activityMatch){
		if(useScripts.completedScore || useScripts.droppedScore){
			addCompletedScores()
		}
		if(useScripts.activityTimeline){
			addActivityLinks(activityMatch[1])
		}
		if(useScripts.embedHentai){
			embedHentai()
		}
		if(useScripts.showMarkdown){
			showMarkdown(activityMatch[1])
		}
	}
	if(url.match(/^https:\/\/anilist\.co\/edit/)){//seems to give mixed results. At least it's better than nothing
		window.onbeforeunload = function(){
			return "Page refresh has been intercepted to avoid an accidental loss of work"
		}
	}
	if(useScripts.notifications && useScripts.accessToken && !useScripts.mobileFriendly){
		notificationCake()
	}
	[1,2,3,4,5/*no 6*/,7,8,9,10,11,12,13,14,15,16,17,18,19].forEach(forumCategory => {
		if(url === "https://anilist.co/forum/recent?category=" + forumCategory){
			document.title = translate("$documentTitle_forum_prefix") + " - " + translate("$forumCategory_" + forumCategory) + " · AniList"
		}
	})
}

let useScriptsDefinitions = m4_include(data/legacyModuleDescriptions.json)
let mainLoop = setInterval(() => {
	if(document.URL !== current){
		let oldURL = current + "";
		current = document.URL;
		handleScripts(current,oldURL)
	}
	if(useScripts.expandDescriptions){
		let expandPossible = document.querySelector(".description-length-toggle");
		if(expandPossible){
			expandPossible.click()
		}
	}
},200);
console.log(script_type + " " + scriptInfo.version);
Object.keys(localStorage).forEach(key => {
	if(key.includes("hohListActivityCall")){
		let cacheItem = JSON.parse(localStorage.getItem(key));
		if(cacheItem){
			if(NOW() > cacheItem.time + cacheItem.duration){
				localStorage.removeItem(key)
			}
		}
	}
});

if(useScripts.tweets){
/*
https://developer.twitter.com/en/docs/twitter-for-websites/webpage-properties
According to Twitter, you can opt out from widgets using context data for "personalization".

Not that this tag has any force behind it, but we can at least kindly ask them.
*/
	let dnt_tag = document.createElement("meta");
	dnt_tag.setAttribute("name","twitter:dnt");
	dnt_tag.setAttribute("content","on");
	document.head.appendChild(dnt_tag)
}

if(useScripts[script_type.toLowerCase() + "API"]){
	if(document[script_type.toLowerCase() + "API"]){
		console.warn("Multiple copies of the script running? Shutting down this instance.");
		clearInterval(mainLoop);
		clearInterval(likeLoop);
		clearInterval(tweetLoop);
	}
	document[script_type.toLowerCase() + "API"] = {
		scriptInfo: scriptInfo,
		generalAPIcall: generalAPIcall,//query,variables,callback[,cacheKey[,timeFresh[,useLocalStorage]]]
		authAPIcall: authAPIcall,
		queryPacker: queryPacker,
		api: anilistAPI,//APIv2
		settings: useScripts,//this contains an access token, if granted. Be careful!
		logOut: function(){
			//makes the script forget the access token (but it's still valid)
			//to disable an access token, go to https://anilist.co/settings/apps, and click "revoke app".
			useScripts.accessToken = "";
			useScripts.save()
		}
	}
}

if(useScripts.additionalTranslation && useScripts.partialLocalisationLanguage !== "English"){
	(function(){
		let pNode;
		let checker = function(){
			pNode = document.getElementById("app");
			if(!pNode){
				setTimeout(checker,200);
				return
			}
			let mutationConfig = {
				attributes: false,
				childList: true,
				subtree: false
			};
			let observer = new MutationObserver(function(){
				let editor = document.querySelector(".list-editor");
				if(editor && !editor.classList.contains("hohTranslated")){
					editor.classList.add("hohTranslated");
					editor_translate(editor)//in additionalTranslation.js
				}
			});
			observer.observe(pNode,mutationConfig)
		}
		checker();
	})()
}

function exportModule(module){
	useScriptsDefinitions.push({
		id: module.id,
		description: module.description,
		categories: module.categories,
		visible: module.visible,
		importance: module.importance,
		extendedDescription: module.extendedDescription,
		css: module.css
	});
	if(!hasOwn(useScripts, module.id)){
		useScripts[module.id] = module.isDefault;
		useScripts.save()
	}
	if(module.css && useScripts[module.id]){
		moreStyle.textContent += module.css
	}
	modules.push(module)
}
//end "controller.js"
