(() => {
  "use strict";
  const config = window.MANDAL_CONFIG || {};
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const english = {};
  $$('[data-i18n]').forEach(node => { english[node.dataset.i18n] = node.innerText; });
  $$('[data-placeholder]').forEach(node => { english[node.dataset.placeholder] = node.placeholder; });
  $$('[data-alt]').forEach(node => { english[node.dataset.alt] = node.alt; });
  Object.assign(english, {
    contactTitle: "A small message.\nA new connection.", allDays: "All days", day: "Day", all: "All updates",
    devotional: "Devotional", cultural: "Cultural", community: "Community", festival: "Festival",
    showMore: "Show the full programme", showLess: "Show fewer events", noEvents: "No events match your search. Try another day or a different word.",
    noProgramme: "The festival programme will be announced here.", noNotices: "Announcements will appear here soon.",
    readNotice: "Read the notice", noGallery: "Memories from past celebrations will be added here.",
    preview: "Preview", cultureGuests: "Art & culture", communityGuests: "Public & community life",
    guestsComing: "Visit records coming soon", guestArchive: "GUEST ARCHIVE", visitStory: "About the visit", visitDate: "Visit date",
    sponsorEnquire: "Enquire about this space", sponsorWebsite: "Visit website",
    draftReady: "Your message draft is ready. Review it, then copy or download it to share with the mandal.",
    noContactYet: "The official contact email will be added here. Your draft has not been sent.",
    emailDraft: "Open email draft", copyMessage: "Copy message", downloadMessage: "Download message", copied: "Message copied. Ready to share.",
    copyFailed: "Select the message above and copy it with Ctrl+C (or touch and hold on mobile).",
    downloaded: "Download prepared.", sampleHeading: "SAMPLE PROGRAMME — dates and timings are not confirmed.",
    programmeHeading: "FESTIVAL PROGRAMME", messageHeading: "Message for", name: "Name", email: "Email", topic: "Topic", message: "Message",
    morning: "Morning aarti", evening: "Evening aarti", previousImage: "Previous image", nextImage: "Next image",
    close: "Close", closeGallery: "Close gallery", openMenu: "Open menu", closeMenu: "Close menu",
    sampleDetail: "Sample content · Official arrangements will be confirmed by the mandal.",
  });
  const marathi = {
    skip: "मुख्य मजकुराकडे जा", brandTagline: "भक्ती · समाज · परंपरा", navAbout: "आपले मंडळ", navProgramme: "कार्यक्रम", navUpdates: "सूचना", navGallery: "आठवणी", navSponsors: "प्रायोजक", planVisit: "दर्शनासाठी या",
    heroLineOne: "श्रद्धेची परंपरा.", heroLineTwo: "आनंदाचा उत्सव.", heroDescription: "आरतीचा नाद. ताज्या फुलांचा सुगंध. एकत्र येण्याचा आनंद. आपल्या घरासारख्या वाटणाऱ्या या उत्सवात आपले स्वागत आहे.",
    exploreProgramme: "कार्यक्रम पाहा", reliveMemories: "आठवणींना उजाळा द्या", heroWelcome: "एक बाप्पा. एक मोठा परिवार.", heroWelcomeDetail: "या उत्सवात प्रत्येकाचे स्वागत आहे.", artSideLabel: "श्रद्धेचा मंगल उत्सव",
    ganpatiAlt: "झेंडूच्या माळांनी सजलेल्या मंदिराच्या कमानीखाली विराजमान श्री गणेशाचे मूळ चित्र",
    sampleNote: "वेबसाइटचे पूर्वदर्शन · कार्यक्रम, सूचना, प्रायोजक आणि संग्रह नमुन्यासाठी आहेत. मंडळाची अधिकृत माहिती लवकरच जोडली जाईल.",
    morningAarti: "सकाळची आरती", eveningAarti: "सायंकाळची आरती", festivalDates: "गणेशोत्सव", findMandal: "मंडळाचे ठिकाण",
    aboutEyebrow: "उत्सवापलीकडचे नाते", aboutTitleOne: "मनात भक्ती.", aboutTitleTwo: "सोबत आपुलकी.", aboutDetail: "मंडळातील सर्व घडामोडींचे हे आपले घर: रोजचे धार्मिक विधी, सांस्कृतिक संध्या, समाजोपयोगी उपक्रम आणि पुढच्या वर्षापर्यंत जपलेल्या आठवणी.", joinCelebration: "या, उत्सवात सहभागी व्हा",
    valueDevotion: "दररोजची भक्ती", valueDevotionText: "आरती, प्रार्थना आणि मनःशांतीचे क्षण.", valueCulture: "आपल्या संस्कृतीचा उत्सव", valueCultureText: "पिढ्यांना जोडणारे संगीत, कला आणि परंपरा.", valueCommunity: "आपुलकीचा समुदाय", valueCommunityText: "समाजासाठी एकत्र येऊन योगदान देऊया.",
    programmeEyebrow: "प्रत्येक दिवस, काहीतरी खास", programmeTitle: "उत्सवाचे कार्यक्रम", downloadProgramme: "कार्यक्रम डाउनलोड करा", searchProgramme: "कार्यक्रम शोधा", searchPlaceholder: "कार्यक्रम शोधा…", programmeNote: "रोजच्या सकाळच्या आणि सायंकाळच्या आरत्या आपल्याला एकत्र आणतात. विशेष कार्यक्रम येथे पाहा; निश्चित तारखा आणि वेळा येथे अद्ययावत केल्या जातील.",
    updatesEyebrow: "मंडळाकडून", updatesTitle: "उत्सवाची ताजी माहिती", updatesIntro: "दर्शनापूर्वी जाणून घ्याव्यात अशा घोषणा, सूचना आणि महत्त्वाची माहिती.",
    galleryEyebrow: "वर्षे बदलतात. भावना कायम राहतात.", galleryTitleOne: "एक उत्सव.", galleryTitleTwo: "हजारो आठवणी.", galleryIntro: "मागील वर्षांचे बाप्पा, सजावट, मिरवणुका आणि एकत्र येण्याचे आनंदी क्षण पाहा.", galleryHint: "आठवण निवडा आणि जवळून पाहा", artworkNote: "नमुना चित्रे · ही चित्रे मंडळाच्या स्वतःच्या छायाचित्रे आणि व्हिडिओंनी बदला.",
    visitorsEyebrow: "खास पाहुणे, समान श्रद्धा", visitorsTitleOne: "बाप्पाचा आशीर्वाद.", visitorsTitleTwo: "पाहुण्यांचा सहवास.", visitorsIntro: "दर्शनासाठी आलेले कलाकार, मान्यवर आणि सामाजिक नेतृत्व यांच्या भेटींच्या आठवणी जपण्याची जागा.", visitorsNote: "पडताळलेली नावे, भेटीच्या तारखा, छायाचित्रे आणि माहिती या संग्रहात जोडली जाईल.",
    sponsorsEyebrow: "आपल्या सर्वांच्या सहकार्याने", sponsorsTitle: "उत्सवामागचे मदतीचे हात", becomeSponsor: "मंडळात जाहिरात द्या", sponsorsIntro: "आपल्या परंपरेला बळ देणाऱ्या स्थानिक व्यवसायांसाठी आणि सहयोगींसाठी खास जागा.", advertisement: "जाहिरातीसाठी जागा", adTitle: "आपला व्यवसाय. आपला समुदाय.", adText: "उत्सवाचे बॅनर, प्रायोजक परिचय आणि वार्षिक संग्रहातून कुटुंबांपर्यंत पोहोचा.", enquireAds: "जाहिरातीबद्दल चौकशी करा",
    visitEyebrow: "प्रत्येकासाठी खुले दरवाजे", visitTitleOne: "दर्शनासाठी या.", visitTitleTwo: "आनंद अनुभवण्यासाठी थांबा.", visitIntro: "कुटुंबासोबत या, मित्रांसोबत या आणि मनात प्रार्थना घेऊन या. मंडळात आपले प्रेमपूर्वक स्वागत आहे.", getDirections: "मार्ग पाहा", visitGuidanceTitle: "दर्शनापूर्वी काही गोष्टी", visitTipOne: "दर्शन रांगेत स्वयंसेवकांच्या सूचनांचे पालन करा.", visitTipTwo: "मंडळाचा परिसर स्वच्छ आणि प्लास्टिकमुक्त ठेवा.", visitTipThree: "प्रवेशाची सुविधा आणि आगमनासंबंधी सूचना पाहा.",
    contactEyebrow: "संपर्क साधूया", contactTitle: "एक छोटा संदेश.\nएक नवे नाते.", contactIntro: "स्वयंसेवक व्हा, जाहिरातीबद्दल चौकशी करा किंवा मंडळासोबत एखादी आठवण शेअर करा.", yourName: "आपले नाव", yourEmail: "ईमेल पत्ता", contactTopic: "मला…", topicGeneral: "एक प्रश्न विचारायचा आहे", topicVolunteer: "स्वयंसेवक म्हणून सहभागी व्हायचे आहे", topicAdvertise: "जाहिरात किंवा प्रायोजकत्व द्यायचे आहे", topicMemory: "आठवण किंवा मान्यवरांची भेट शेअर करायची आहे", yourMessage: "आपला संदेश", prepareMessage: "संदेश तयार करा", formNote: "आपल्याला वाचून पाहण्यासाठी संदेशाचा मसुदा तयार होतो. कोणताही संदेश आपोआप पाठवला जात नाही.", namePlaceholder: "पूर्ण नाव", messagePlaceholder: "आम्हाला थोडी अधिक माहिती सांगा…",
    faqEyebrow: "दर्शनापूर्वी थोडी मदत", faqTitle: "उपयुक्त माहिती", faqOne: "रोजच्या आरतीच्या वेळा कुठे पाहता येतील?", faqOneAnswer: "सकाळच्या आणि सायंकाळच्या आरतीच्या वेळा पानाच्या सुरुवातीला दिल्या आहेत. विशेष कार्यक्रम कार्यक्रम विभागात पाहा. या पूर्वदर्शनातील वेळा मंडळाकडून निश्चित होईपर्यंत नमुन्यासाठी आहेत.", faqTwo: "स्वयंसेवक किंवा प्रायोजक कसे व्हावे?", faqTwoAnswer: "संपर्क फॉर्ममध्ये स्वयंसेवक किंवा जाहिरात/प्रायोजकत्वाचा पर्याय निवडा. अधिकृत संपर्क जोडल्यावर आपला संदेश तपासून मंडळाला पाठवता येईल.", faqThree: "मागील वर्षांची छायाचित्रे शेअर करता येतील का?", faqThreeAnswer: "होय. संपर्क फॉर्ममध्ये आठवण किंवा मान्यवरांची भेट शेअर करण्याचा पर्याय निवडा आणि वर्ष व प्रसंग सांगा. स्वतःची किंवा प्रसिद्ध करण्याची परवानगी असलेली छायाचित्रे मंडळाशी शेअर करा.",
    footerTagline: "भक्ती. उत्सव. आपुलकी.", navVisitors: "खास पाहुणे", navContact: "संपर्क", footerNote: "आपल्या समुदायासाठी, भक्तिभावाने.", backToTop: "सुरुवातीला जा", watchVideo: "व्हिडिओ पाहा",
    allDays: "सर्व दिवस", day: "दिवस", all: "सर्व सूचना", devotional: "धार्मिक", cultural: "सांस्कृतिक", community: "सामाजिक", festival: "उत्सव", showMore: "सर्व कार्यक्रम पाहा", showLess: "कमी कार्यक्रम पाहा", noEvents: "शोधाशी जुळणारा कार्यक्रम सापडला नाही. दुसरा दिवस किंवा वेगळा शब्द वापरा.", noProgramme: "उत्सवाचे कार्यक्रम लवकरच येथे जाहीर होतील.", noNotices: "सूचना लवकरच येथे प्रसिद्ध केल्या जातील.", readNotice: "सूचना वाचा", noGallery: "मागील उत्सवांच्या आठवणी येथे जोडल्या जातील.",
    preview: "नमुना", cultureGuests: "कला आणि संस्कृती", communityGuests: "सार्वजनिक आणि सामाजिक जीवन", guestsComing: "भेटींची माहिती लवकरच", guestArchive: "मान्यवरांच्या भेटींचा संग्रह", visitStory: "भेटीबद्दल", visitDate: "भेटीची तारीख", sponsorEnquire: "या जागेबद्दल चौकशी करा", sponsorWebsite: "वेबसाइट पाहा",
    draftReady: "आपल्या संदेशाचा मसुदा तयार आहे. तो तपासा, नंतर मंडळाला पाठवण्यासाठी कॉपी किंवा डाउनलोड करा.", noContactYet: "अधिकृत संपर्क ईमेल येथे जोडला जाईल. आपला मसुदा पाठवला गेलेला नाही.", emailDraft: "ईमेलचा मसुदा उघडा", copyMessage: "संदेश कॉपी करा", downloadMessage: "संदेश डाउनलोड करा", copied: "संदेश कॉपी झाला. आता शेअर करू शकता.", copyFailed: "वरील संदेश निवडून Ctrl+C वापरा किंवा मोबाइलवर दाबून ठेवा.", downloaded: "डाउनलोड तयार आहे.", sampleHeading: "नमुना कार्यक्रम — तारखा आणि वेळा निश्चित नाहीत.", programmeHeading: "उत्सवाचे कार्यक्रम", messageHeading: "यांच्यासाठी संदेश", name: "नाव", email: "ईमेल", topic: "विषय", message: "संदेश", morning: "सकाळची आरती", evening: "सायंकाळची आरती", previousImage: "मागील चित्र", nextImage: "पुढील चित्र", close: "बंद करा", closeGallery: "चित्रसंग्रह बंद करा", openMenu: "मेनू उघडा", closeMenu: "मेनू बंद करा", sampleDetail: "नमुना माहिती · अधिकृत व्यवस्था मंडळाकडून निश्चित केली जाईल.",
  };
  let language = config.defaultLanguage === "mr" ? "mr" : "en";
  try { const saved = localStorage.getItem("mahaganapati-language"); if (["en", "mr"].includes(saved)) language = saved; } catch { /* Private browsing can disable storage. */ }
  let selectedDay = "all", selectedNotice = "all", showAllEvents = false;
  let selectedYear = null, galleryIndex = 0, messageData = null, toastTimer;
  const programme = (config.programme || []).slice().sort((a, b) => a.day - b.day || String(a.time).localeCompare(String(b.time)));
  const years = [...new Set((config.gallery || []).map(item => item.year))].sort((a, b) => b - a);
  selectedYear = years[0] ?? null;
  const t = key => config.copy?.[language]?.[key] ?? (language === "mr" ? marathi[key] : english[key]) ?? english[key] ?? key;
  const local = value => typeof value === "string" ? value : value?.[language] ?? value?.en ?? value?.mr ?? "";
  const number = value => new Intl.NumberFormat(language === "mr" ? "mr-IN" : "en-IN", { useGrouping: false }).format(value);
  const node = (tag, className, text) => {
    const result = document.createElement(tag);
    if (className) result.className = className;
    if (text !== undefined) result.textContent = text;
    return result;
  };
  const safeUrl = value => {
    if (typeof value !== "string" || !value) return "";
    try { const url = new URL(value); return url.protocol === "https:" ? url.href : ""; } catch { return ""; }
  };
  const imageSource = value => {
    if (typeof value !== "string") return "";
    if (/^(?:\.\/)?assets\/[a-zA-Z0-9_./-]+\.(?:svg|png|jpe?g|webp|avif)$/i.test(value) && !value.includes("..")) return value;
    return safeUrl(value);
  };
  const externalLink = (url, text, className = "text-link") => {
    const link = node("a", className);
    link.href = url; link.target = "_blank"; link.rel = "noopener noreferrer";
    link.append(node("span", "", text), node("span", "", "↗"));
    return link;
  };
  const tab = (value, label, active, onClick) => {
    const button = node("button", "filter-tab", label);
    button.type = "button";
    button.dataset.value = value;
    button.setAttribute("aria-pressed", String(active));
    button.addEventListener("click", onClick);
    return button;
  };
  const updateTabs = (container, value) => $$('button', container).forEach(button => button.setAttribute("aria-pressed", String(button.dataset.value === String(value))));
  const time = value => {
    const [hours, minutes] = String(value).split(":").map(Number);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return String(value || "");
    return new Intl.DateTimeFormat(language === "mr" ? "mr-IN" : "en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" }).format(new Date(Date.UTC(2000, 0, 1, hours, minutes)));
  };

  function translate() {
    document.documentElement.lang = language;
    $$('[data-i18n]').forEach(element => { element.textContent = t(element.dataset.i18n); });
    $$('[data-placeholder]').forEach(element => { element.placeholder = t(element.dataset.placeholder); });
    $$('[data-alt]').forEach(element => { element.alt = t(element.dataset.alt); });
    $$('[data-config]').forEach(element => { element.textContent = local(config[element.dataset.config]); });
    document.title = `${local(config.name)} · ${t("footerTagline")}`;
    $(".language-current").textContent = language === "en" ? "EN" : "मराठी";
    $(".language-other").textContent = language === "en" ? "मराठी" : "EN";
    $("#language-toggle").setAttribute("aria-label", language === "en" ? "मराठीमध्ये पाहा" : "Switch to English");
    $("#sample-note").hidden = !config.sampleContent;
    $(".artwork-note").hidden = !config.sampleContent;
    $("#day-filters").setAttribute("aria-label", language === "mr" ? "दिवसानुसार कार्यक्रम निवडा" : "Filter programme by day");
    $("#notice-filters").setAttribute("aria-label", language === "mr" ? "सूचनांचा प्रकार निवडा" : "Filter announcements");
    $("#year-filters").setAttribute("aria-label", language === "mr" ? "उत्सवाचे वर्ष निवडा" : "Choose a celebration year");
    $("#main-nav").setAttribute("aria-label", language === "mr" ? "मुख्य मेनू" : "Main navigation");
    $("#menu-toggle").setAttribute("aria-label", t($("#menu-toggle").getAttribute("aria-expanded") === "true" ? "closeMenu" : "openMenu"));
    $$("[data-close-dialog]").forEach(button => button.setAttribute("aria-label", t("close")));
    $("#gallery-previous").setAttribute("aria-label", t("previousImage"));
    $("#gallery-next").setAttribute("aria-label", t("nextImage"));
    $("#copyright-year").textContent = number(new Date().getFullYear());
    const mapsUrl = safeUrl(config.mapsUrl);
    $("#directions-link").hidden = !mapsUrl;
    if (mapsUrl) $("#directions-link").href = mapsUrl;
    renderDayFilters(); renderProgramme(); renderNoticeFilters(); renderNotices(); renderYearFilters(); renderGallery(); renderVisitors(); renderSponsors();
    if (messageData) renderMessageDraft();
    if ($("#gallery-dialog").open) updateLightbox();
    if ($("#detail-dialog").open) $("#detail-dialog").close();
  }

  function renderDayFilters() {
    const container = $("#day-filters");
    container.replaceChildren(tab("all", t("allDays"), selectedDay === "all", () => { selectedDay = "all"; showAllEvents = false; updateTabs(container, selectedDay); renderProgramme(); }));
    [...new Set(programme.map(event => event.day))].forEach(day => container.append(tab(day, `${t("day")} ${number(day)}`, selectedDay === day, () => {
      selectedDay = day; showAllEvents = false; updateTabs(container, day); renderProgramme();
    })));
  }

  function renderProgramme() {
    const container = $("#programme-list");
    const query = $("#programme-search").value.trim().toLocaleLowerCase();
    const events = programme.filter(event => (selectedDay === "all" || event.day === selectedDay) &&
      `${local(event.title)} ${local(event.description)} ${t(event.category)}`.toLocaleLowerCase().includes(query));
    container.replaceChildren();
    if (!events.length) { container.append(node("p", "empty-state", programme.length ? t("noEvents") : t("noProgramme"))); return; }
    const visible = showAllEvents ? events : events.slice(0, 5);
    visible.forEach(event => {
      const row = node("article", "programme-row");
      const day = node("div", "event-day"); day.append(node("span", "", t("day")), node("strong", "", number(event.day)));
      const info = node("div", "event-info"); info.append(node("h3", "", local(event.title)), node("p", "", local(event.description)));
      const categoryClass = event.category === "cultural" ? " culture" : event.category === "community" ? " community" : "";
      row.append(day, node("p", "event-time", time(event.time)), info, node("span", `event-category${categoryClass}`, t(event.category)));
      container.append(row);
    });
    if (events.length > 5) {
      const wrapper = node("div", "more-events");
      const more = node("button", "button button-outline", t(showAllEvents ? "showLess" : "showMore"));
      more.type = "button"; more.setAttribute("aria-expanded", String(showAllEvents));
      more.addEventListener("click", () => { showAllEvents = !showAllEvents; renderProgramme(); if (!showAllEvents) $("#programme").scrollIntoView({ behavior: "smooth" }); });
      wrapper.append(more); container.append(wrapper);
    }
  }

  function renderNoticeFilters() {
    const container = $("#notice-filters"); container.replaceChildren();
    ["all", ...new Set((config.notices || []).map(notice => notice.category))].forEach(category => container.append(tab(category, t(category), selectedNotice === category, () => {
      selectedNotice = category; updateTabs(container, category); renderNotices();
    })));
  }

  function renderNotices() {
    const container = $("#notice-grid"); container.replaceChildren();
    const notices = (config.notices || []).filter(notice => selectedNotice === "all" || notice.category === selectedNotice);
    if (!notices.length) { container.append(node("p", "empty-state", t("noNotices"))); return; }
    notices.forEach(notice => {
      const card = node("article", "notice-card");
      const meta = node("div", "notice-meta");
      meta.append(node("span", `notice-tag notice-category-${notice.category}`, t(notice.category).toLocaleUpperCase()), node("span", "notice-date", local(notice.date)));
      const read = node("button", "text-link"); read.type = "button";
      read.append(node("span", "", t("readNotice")), node("span", "", "→"));
      read.addEventListener("click", () => showDetail(local(notice.title), `${t(notice.category)} · ${local(notice.date)}`, local(notice.body)));
      card.append(meta, node("h3", "", local(notice.title)), node("p", "", local(notice.summary)), read); container.append(card);
    });
  }

  function showDetail(title, meta, body, image, videoUrl) {
    const content = $("#detail-content"); content.replaceChildren();
    if (imageSource(image)) { const photo = node("img"); photo.src = imageSource(image); photo.alt = title; content.append(photo); }
    content.append(node("p", "eyebrow", meta), node("h2", "", title), node("p", "", body));
    if (safeUrl(videoUrl)) content.append(externalLink(safeUrl(videoUrl), t("watchVideo")));
    if (config.sampleContent) content.append(node("p", "small-note", t("sampleDetail")));
    const dialog = $("#detail-dialog"); dialog.setAttribute("aria-label", title); openDialog(dialog);
  }

  function renderYearFilters() {
    const container = $("#year-filters"); container.replaceChildren();
    years.forEach(year => container.append(tab(year, number(year), selectedYear === year, () => {
      selectedYear = year; updateTabs(container, year); renderGallery();
    })));
  }
  const yearMemories = () => (config.gallery || []).filter(memory => memory.year === selectedYear);
  function renderGallery() {
    const container = $("#gallery-grid"); container.replaceChildren();
    const memories = yearMemories();
    if (!memories.length) { container.append(node("p", "empty-state", t("noGallery"))); return; }
    memories.forEach((memory, index) => {
      const card = node("button", "gallery-card"); card.type = "button";
      card.setAttribute("aria-label", `${local(memory.title)} · ${number(memory.year)}`);
      const image = node("img"); image.src = imageSource(memory.image) || "assets/ganpati.svg"; image.alt = local(memory.alt); image.loading = "lazy";
      const caption = node("div", "gallery-card-caption");
      caption.append(node("span", "gallery-category", local(memory.category)), node("h3", "", local(memory.title)), node("p", "", `${local(config.name)} · ${number(memory.year)}`));
      const open = node("span", "gallery-open", "↗"); open.setAttribute("aria-hidden", "true");
      card.append(image, caption, open);
      card.addEventListener("click", () => { galleryIndex = index; updateLightbox(); openDialog($("#gallery-dialog")); });
      container.append(card);
    });
  }
  function updateLightbox() {
    const memories = yearMemories(), memory = memories[galleryIndex]; if (!memory) return;
    $("#lightbox-image").src = imageSource(memory.image) || "assets/ganpati.svg";
    $("#lightbox-image").alt = local(memory.alt);
    $("#lightbox-meta").textContent = `${number(memory.year)} · ${local(memory.category)} · ${number(galleryIndex + 1)} / ${number(memories.length)}`;
    $("#lightbox-title").textContent = local(memory.title);
    $("#lightbox-description").textContent = local(memory.description);
    $("#gallery-dialog").setAttribute("aria-label", local(memory.title));
    const url = safeUrl(memory.videoUrl); $("#lightbox-video").hidden = !url;
    if (url) $("#lightbox-video").href = url;
    $("#gallery-previous").disabled = memories.length < 2; $("#gallery-next").disabled = memories.length < 2;
  }
  function moveGallery(direction) {
    const count = yearMemories().length; if (!count) return;
    galleryIndex = (galleryIndex + direction + count) % count; updateLightbox();
  }

  function renderVisitors() {
    const container = $("#visitor-grid"); container.replaceChildren();
    if (!(config.visitors || []).length) {
      ["cultureGuests", "communityGuests"].forEach(kind => {
        const card = node("div", "visitor-placeholder");
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"); svg.setAttribute("viewBox", "0 0 120 140"); svg.setAttribute("aria-hidden", "true");
        const circle = document.createElementNS(svg.namespaceURI, "circle"); circle.setAttribute("cx", "60"); circle.setAttribute("cy", "42"); circle.setAttribute("r", "24"); circle.setAttribute("fill", "none"); circle.setAttribute("stroke", "currentColor"); circle.setAttribute("stroke-width", "1.5");
        const path = document.createElementNS(svg.namespaceURI, "path"); path.setAttribute("d", "M16 131v-16c0-26 18-43 44-43s44 17 44 43v16M37 78l23 21 23-21M47 65v10M73 65v10"); path.setAttribute("fill", "none"); path.setAttribute("stroke", "currentColor"); path.setAttribute("stroke-width", "1.5");
        svg.append(circle, path);
        card.append(node("span", "", t("guestArchive")), svg, node("h3", "", t(kind)), node("p", "", t("guestsComing"))); container.append(card);
      }); return;
    }
    config.visitors.forEach(visitor => {
      const card = node("article", "visitor-card");
      if (imageSource(visitor.image)) { const image = node("img"); image.src = imageSource(visitor.image); image.alt = local(visitor.name); image.loading = "lazy"; card.append(image); }
      const body = node("div"); const name = local(visitor.name);
      body.append(node("h3", "", name), node("p", "", local(visitor.role)), node("p", "", `${t("visitDate")}: ${local(visitor.date)}`));
      const read = node("button", "text-link", `${t("visitStory")} →`); read.type = "button";
      read.addEventListener("click", () => showDetail(name, `${local(visitor.role)} · ${local(visitor.date)}`, local(visitor.story), visitor.image, visitor.videoUrl));
      body.append(read); card.append(body); container.append(card);
    });
  }

  function renderSponsors() {
    const container = $("#sponsor-grid"); container.replaceChildren();
    (config.sponsors || []).forEach(sponsor => {
      const card = node("article", "sponsor-card");
      card.append(node("span", "sponsor-tier", local(sponsor.tier)));
      if (imageSource(sponsor.image)) { const image = node("img"); image.src = imageSource(sponsor.image); image.alt = local(sponsor.name); image.loading = "lazy"; card.append(image); }
      else card.append(node("h3", "sponsor-wordmark", local(sponsor.name)));
      card.append(node("p", "", local(sponsor.description)));
      const url = safeUrl(sponsor.url);
      if (url) card.append(externalLink(url, t("sponsorWebsite")));
      else if (sponsor.placeholder) {
        const link = node("a", "text-link", `${t("sponsorEnquire")} ↗`); link.href = "#contact";
        link.addEventListener("click", () => { $("#contact-topic").value = "advertise"; }); card.append(link);
      }
      container.append(card);
    });
  }

  function openDialog(dialog) { dialog.showModal(); document.body.classList.add("modal-open"); }
  $$("dialog").forEach(dialog => {
    dialog.addEventListener("close", () => { if (!$$("dialog").some(item => item.open)) document.body.classList.remove("modal-open"); });
    dialog.addEventListener("click", event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
  });
  $$('[data-close-dialog]').forEach(button => button.addEventListener("click", () => button.closest("dialog").close()));
  $("#gallery-previous").addEventListener("click", () => moveGallery(-1));
  $("#gallery-next").addEventListener("click", () => moveGallery(1));
  document.addEventListener("keydown", event => {
    if ($("#gallery-dialog").open && ["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); moveGallery(event.key === "ArrowLeft" ? -1 : 1); }
    if (event.key === "Escape") closeMenu();
  });

  function toast(text) {
    clearTimeout(toastTimer); $("#toast").textContent = text; $("#toast").hidden = false;
    toastTimer = setTimeout(() => { $("#toast").hidden = true; }, 4500);
  }
  function downloadFile(filename, contents) {
    const blob = new Blob(["\uFEFF", contents], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob), link = node("a"); link.href = url; link.download = filename;
    document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast(t("downloaded"));
  }
  $("#download-programme").addEventListener("click", () => {
    const lines = [local(config.name), t("programmeHeading"), local(config.festivalLabel), ""];
    if (config.sampleContent) lines.push(t("sampleHeading"), "");
    lines.push(`${t("morning")}: ${local(config.morningAarti)}`, `${t("evening")}: ${local(config.eveningAarti)}`, "");
    programme.forEach(event => lines.push(`${t("day")} ${number(event.day)} · ${time(event.time)} · ${local(event.title)}`, `  ${local(event.description)}`, ""));
    lines.push(local(config.address)); downloadFile(`kalanagarcha-mahaganapati-programme-${language}.txt`, lines.join("\n"));
  });
  const topics = { general: "topicGeneral", volunteer: "topicVolunteer", advertise: "topicAdvertise", memory: "topicMemory" };
  function buildMessage() {
    return `${t("messageHeading")} ${local(config.name)}\n\n${t("name")}: ${messageData.name}\n${t("email")}: ${messageData.email}\n${t("topic")}: ${t(topics[messageData.topic] || "topicGeneral")}\n\n${t("message")}:\n${messageData.message}`;
  }
  function renderMessageDraft() {
    const result = $("#contact-result"); result.hidden = false; result.replaceChildren(node("p", "", t("draftReady")));
    const draft = buildMessage(); const preview = node("pre", "", draft); preview.tabIndex = 0; result.append(preview);
    const actions = node("div", "draft-actions");
    const contactEmail = typeof config.contactEmail === "string" && /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(config.contactEmail) ? config.contactEmail : "";
    if (contactEmail) {
      const link = node("a", "button button-dark", `${t("emailDraft")} ↗`);
      link.href = `mailto:${encodeURIComponent(contactEmail)}?subject=${encodeURIComponent(`${local(config.name)} · ${t(topics[messageData.topic] || "topicGeneral")}`)}&body=${encodeURIComponent(draft)}`;
      actions.append(link);
    } else result.append(node("p", "", t("noContactYet")));
    const copy = node("button", "button button-outline", t("copyMessage")); copy.type = "button";
    copy.addEventListener("click", async () => {
      try {
        if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(draft); toast(t("copied"));
      } catch {
        const selection = window.getSelection(), range = document.createRange(); range.selectNodeContents(preview); selection.removeAllRanges(); selection.addRange(range); preview.focus(); toast(t("copyFailed"));
      }
    });
    const save = node("button", "button button-outline", t("downloadMessage")); save.type = "button";
    save.addEventListener("click", () => downloadFile(`mandal-message-${language}.txt`, draft));
    actions.append(copy, save); result.append(actions);
  }
  $("#contact-form").addEventListener("submit", event => {
    event.preventDefault(); const form = event.currentTarget;
    const nameInput = form.elements.name, messageInput = form.elements.message;
    nameInput.setCustomValidity(nameInput.value.trim() ? "" : (language === "mr" ? "कृपया आपले नाव लिहा." : "Please enter your name."));
    messageInput.setCustomValidity(messageInput.value.trim() ? "" : (language === "mr" ? "कृपया आपला संदेश लिहा." : "Please enter a message."));
    if (!form.reportValidity()) return;
    const data = new FormData(form); messageData = { name: String(data.get("name")).trim(), email: String(data.get("email")).trim(), topic: String(data.get("topic")), message: String(data.get("message")).trim() };
    renderMessageDraft(); $("#contact-result").scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
  $$("#contact-form input, #contact-form textarea").forEach(input => input.addEventListener("input", () => input.setCustomValidity("")));
  $("#contact-form").addEventListener("input", () => { messageData = null; $("#contact-result").hidden = true; });
  $$('[data-contact-topic]').forEach(link => link.addEventListener("click", () => { $("#contact-topic").value = link.dataset.contactTopic; }));
  $("#programme-search").addEventListener("input", () => { showAllEvents = false; renderProgramme(); });
  $("#language-toggle").addEventListener("click", () => {
    language = language === "en" ? "mr" : "en";
    try { localStorage.setItem("mahaganapati-language", language); } catch { /* Preference is optional. */ }
    translate();
  });
  function closeMenu() {
    $("#main-nav").classList.remove("open"); $("#menu-toggle").setAttribute("aria-expanded", "false"); $("#menu-toggle").setAttribute("aria-label", t("openMenu"));
  }
  $("#menu-toggle").addEventListener("click", () => {
    const open = $("#menu-toggle").getAttribute("aria-expanded") !== "true";
    $("#menu-toggle").setAttribute("aria-expanded", String(open)); $("#main-nav").classList.toggle("open", open); $("#menu-toggle").setAttribute("aria-label", t(open ? "closeMenu" : "openMenu"));
  });
  $$("#main-nav a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("click", event => { if (!event.target.closest(".site-header")) closeMenu(); });
  window.addEventListener("resize", () => { if (window.innerWidth > 760) closeMenu(); });
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach(entry => $$("#main-nav a").forEach(link => link.classList.toggle("active", link.hash === `#${entry.target.id}`)));
    }, { rootMargin: "-15% 0px -65% 0px", threshold: 0 });
    $$('main section[id]').forEach(section => observer.observe(section));
  }
  translate();
})();
