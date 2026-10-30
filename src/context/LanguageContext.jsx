import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Navbar
    nav_dashboard: 'Dashboard',
    nav_transactionsEmployer: 'Jobs & Payments',
    nav_transactionsWorker: 'My Jobs & Pay',
    nav_login: 'Log In',
    nav_signup: 'Sign Up',
    nav_logout: 'Logout',
    nav_freeBadge: '100% Free · 0% Commission',

    // Landing Page
    hero_badge: '🎉 Launch Offer: 100% Free Platform — 0% Commission!',
    hero_title1: 'Hire verified workers as easy as',
    hero_titleHighlight: 'ordering a ride.',
    hero_subtitle:
      'KaziLink connects employers with nearby temporary & skilled workers instantly. Pay workers directly (M-Pesa, Airtel Money, Mixx by Yas, or Cash) with 0% platform fees.',
    hero_btnHire: 'I Want to Hire',
    hero_btnWork: 'I Want to Work',
    stats_jobsCompleted: 'Jobs Completed',
    stats_activeWorkers: 'Active Workers',
    stats_avgRating: 'Avg Rating',
    stats_commission: 'Platform Fee (Free!)',
    how_title: 'How KaziLink Works',
    how_subtitle: 'Connecting employers and gig workers in three simple, transparent steps.',
    how_step1Title: '1. Post a Job for Free',
    how_step1Desc: 'Describe what you need, where you need it, and the exact amount you will pay the worker.',
    how_step2Title: '2. Instant Match',
    how_step2Desc: 'Nearby workers see your job immediately, apply in seconds, and you pick the best fit.',
    how_step3Title: '3. Direct Payment (0% Fee)',
    how_step3Desc: 'Once the job is done, pay the worker directly via M-Pesa, Airtel, Mixx, or Cash — we charge 0% commission! Both sides confirm on KaziLink to build verified trust.',
    trust_title: 'Built for Trust & Transparency',
    trust_desc: 'No hidden fees, no middleman cuts. Workers keep 100% of what they earn, and every completed job builds a verified reputation.',
    footer_rights: 'All rights reserved. Global Gig Economy Platform.',

    // Auth - Login & Register
    login_title: 'Welcome back',
    login_or: 'Or',
    login_createAccount: 'create a new account',
    login_email: 'Email address',
    login_password: 'Password',
    login_forgot: 'Forgot your password?',
    login_submit: 'Sign In',
    reg_title: 'Create an Account',
    reg_haveAccount: 'Already have an account?',
    reg_signIn: 'Sign in',
    reg_wantWork: 'I Want to Work',
    reg_wantHire: 'I Want to Hire',
    reg_fullNameWorker: 'Full Name',
    reg_fullNameEmployer: 'Company or Full Name',
    reg_phone: 'Phone Number (for direct payment/contact)',
    reg_city: 'City / Location (e.g. Dar es Salaam, Nairobi...)',
    reg_passwordPlaceholder: 'Secure Password (min 6 chars)',
    reg_submit: 'Create Free Account',

    // Employer Dashboard
    emp_title: 'Employer Dashboard',
    emp_welcome: 'Welcome back',
    emp_btnTransactions: 'Jobs & Payments',
    emp_btnPostJob: 'Post a New Job',
    emp_statActive: 'Active Jobs',
    emp_statApplicants: 'Total Applicants',
    emp_statCompleted: 'Jobs Completed',
    emp_statFee: 'Platform Fee',
    emp_recentJobs: 'Your Posted Jobs & Applicants',
    emp_loadingJobs: 'Loading jobs...',
    emp_noJobsTitle: 'No jobs posted yet',
    emp_noJobsDesc: 'Create your first gig for free to start receiving applications from nearby workers.',
    emp_workersNeeded: 'workers needed',
    emp_accepted: 'accepted',
    emp_applicantsHeader: 'Applicants',
    emp_noApplicantsYet: 'No applicants yet — workers nearby will see this job.',
    emp_btnAcceptWorker: 'Accept Worker',
    emp_workerAccepted: 'Accepted ✓',

    // Post Job
    pj_headerTitle1: 'Post a',
    pj_headerTitle2: 'New Job',
    pj_headerSub: '100% Free to post. Workers receive 100% of the pay directly from you.',
    pj_step1: 'Basics',
    pj_step2: 'Schedule',
    pj_step3: 'Pay',
    pj_step4: 'Review',
    pj_jobTitle: 'Job Title *',
    pj_category: 'Category *',
    pj_selectCategory: 'Select a category',
    pj_description: 'Description *',
    pj_location: 'Location Address *',
    pj_workersNeeded: 'Number of Workers Needed *',
    pj_specialReq: 'Special Requirements',
    pj_jobDate: 'Job Date *',
    pj_startTime: 'Start Time *',
    pj_duration: 'Duration (hours) *',
    pj_deadlineDate: 'Application Deadline Date *',
    pj_deadlineTime: 'Application Deadline Time *',
    pj_payPerWorker: 'Pay Per Worker (TSh) *',
    pj_totalDirectPay: 'Total Direct Payout to Worker(s)',
    pj_zeroCommissionNote: '🎉 Platform Fee: TSh 0 (0% Commission — You pay the worker directly after the job is done!)',
    pj_paymentMethod: 'Preferred Direct Payment Method *',
    pj_reviewPost: 'Review & Post',
    pj_btnNext: 'Next →',
    pj_btnBack: '← Back',
    pj_btnPost: '🚀 Post Job for Free',
    pj_posting: 'Posting…',
    pj_successTitle: 'Job Posted Successfully!',
    pj_successDesc: 'Workers in your area can now see and apply to your job immediately.',
    pj_viewDashboard: 'View Dashboard',
    pj_postAnother: 'Post Another Job',

    // Employer Transactions (Direct P2P)
    etx_title: 'Direct Job Payments',
    etx_subtitle: '0% Commission — Pay workers directly upon job completion and confirm here to build verified trust.',
    etx_noTxTitle: 'No active job assignments yet',
    etx_noTxDesc: 'When you accept a worker on your dashboard, their job progress and direct payment confirmation will appear here.',
    etx_workerLabel: 'Worker',
    etx_phoneLabel: 'Phone',
    etx_totalPay: 'Worker Pay (100%)',
    etx_platformFee: 'Platform Fee (0%)',
    etx_freeLabel: 'FREE (TSh 0)',
    etx_netWorker: 'Worker Receives Directly',
    etx_btnMarkPaid: 'I Have Paid Worker Directly',
    etx_waitingWorkerStart: 'Worker has been accepted and can now start the job.',
    etx_jobInProgress: 'Worker is currently performing the job.',
    etx_waitingWorkerConfirm: 'You marked this as paid! Waiting for the worker to click "Confirm Payment Received".',
    etx_paymentConfirmed: 'Direct Payment Confirmed by Both Sides',
    etx_btnRateWorker: 'Rate & Endorse Worker',

    // Worker Dashboard
    wd_title: 'Worker Dashboard',
    wd_ready: 'Ready to earn 100% of your pay,',
    wd_availNow: 'Available Now',
    wd_availWeek: 'Available This Week',
    wd_busy: 'Busy',
    wd_viewProfile: 'View My Profile',
    wd_myJobs: 'My Active Jobs',
    wd_statNearby: 'Jobs Nearby',
    wd_statApplied: 'My Applications',
    wd_statCompleted: 'Jobs Completed',
    wd_statEarned: 'Total Earned (100%)',
    wd_skillsTitle: 'My Skills',
    wd_skillsDesc: 'Add skills to your profile to stand out to employers. Completing jobs verifies your skills.',
    wd_skillPlaceholder: 'e.g., Forklift Operation, Cleaning, Plumbing...',
    wd_addSkill: 'Add Skill',
    wd_selfReported: '(Self-reported)',
    wd_noSkills: 'No skills added yet.',
    wd_recGigs: 'Available Gigs For You (0% Fee — Keep 100% Pay)',
    wd_spotsLeft: 'spots left',
    wd_applyNow: 'Apply Now',
    wd_applied: 'Applied ✓',
    wd_acceptedBadge: 'Accepted! Go to My Jobs →',

    // Worker Transactions (My Jobs & Direct Payment Confirmation)
    wtx_title: 'My Jobs & Direct Payments',
    wtx_subtitle: 'Track your accepted jobs, mark completion, and confirm when the employer pays you directly (0% commission deducted).',
    wtx_noJobsTitle: 'No accepted jobs yet',
    wtx_noJobsDesc: 'Once an employer accepts your application, the job will appear here so you can start right away.',
    wtx_employerLabel: 'Employer',
    wtx_youEarn: 'You Receive Directly (100% — No Cut)',
    wtx_zeroFeeNote: 'Platform fee: TSh 0 (0% Commission) · Paid directly by employer',
    wtx_btnStartJob: 'Start Job Now',
    wtx_btnMarkComplete: 'Mark Job Completed',
    wtx_btnConfirmReceipt: 'Confirm I Received Payment',
    wtx_waitingEmployerPay: 'Job completed! The employer will now pay you directly (M-Pesa/Airtel/Cash) and mark it paid.',
    wtx_employerMarkedPaid: 'Employer marked that they paid you! Please confirm below once you receive the money.',
    wtx_paidSuccess: 'Payment Confirmed! 100% added to your verified track record.',
  },
  sw: {
    // Navbar
    nav_dashboard: 'Dashibodi',
    nav_transactionsEmployer: 'Kazi na Malipo',
    nav_transactionsWorker: 'Kazi Zangu na Malipo',
    nav_login: 'Ingia',
    nav_signup: 'Jisajili Bure',
    nav_logout: 'Toka',
    nav_freeBadge: 'Bure 100% · Makato 0%',

    // Landing Page
    hero_badge: '🎉 Ofa ya Uzinduzi: Mfumo ni Bure 100% — Hakuna Makato (0% Commission)!',
    hero_title1: 'Pata mfanyakazi au kibarua kwa urahisi kama',
    hero_titleHighlight: 'kuita usafiri.',
    hero_subtitle:
      'KaziLink inawaunganisha waajiri na mafundi au wafanyakazi wa muda mfupi waliopo karibu papo hapo. Mlipe mfanyakazi moja kwa moja (M-Pesa, Airtel Money, Mixx by Yas, au Cash) bila makato yoyote!',
    hero_btnHire: 'Natafuta Mfanyakazi',
    hero_btnWork: 'Natafuta Kazi',
    stats_jobsCompleted: 'Kazi Zilizokamilika',
    stats_activeWorkers: 'Wafanyakazi Hai',
    stats_avgRating: 'Wastani wa Ubora',
    stats_commission: 'Makato ya Mfumo (Bure!)',
    how_title: 'Jinsi KaziLink Inavyofanya Kazi',
    how_subtitle: 'Kuunganisha waajiri na wafanyakazi kwa hatua tatu rahisi na za kuaminika.',
    how_step1Title: '1. Posti Kazi Bure',
    how_step1Desc: 'Eleza kazi unayohitaji, mahali ilipo, na kiasi kamili utakachomlipa mfanyakazi.',
    how_step2Title: '2. Pata Mfanyakazi Papo Hapo',
    how_step2Desc: 'Wafanyakazi wa karibu wanaona kazi yako mara moja, wanaomba, na unamchagua anayekufaa.',
    how_step3Title: '3. Malipo ya Moja kwa Moja (Makato 0%)',
    how_step3Desc: 'Kazi ikikamilika, mlipe mfanyakazi moja kwa moja kwa M-Pesa, Airtel, Mixx, au Cash — hatukati kamisheni yoyote! Pande zote mbili zinathibitisha kwenye mfumo kujenga uaminifu.',
    trust_title: 'Imeundwa Kujenga Uaminifu (Trust)',
    trust_desc: 'Hakuna gharama zilizofichika wala makato ya kati. Mfanyakazi anapata 100% ya jasho lake, na kila kazi inajenga rekodi inayoaminika.',
    footer_rights: 'Haki zote zimehifadhiwa. Jukwaa la Kazi na Ajira za Muda Mfupi.',

    // Auth - Login & Register
    login_title: 'Karibu tena',
    login_or: 'Au',
    login_createAccount: 'fungua akaunti mpya bure',
    login_email: 'Barua pepe (Email)',
    login_password: 'Nenosiri (Password)',
    login_forgot: 'Umesahau nenosiri?',
    login_submit: 'Ingia Sasa',
    reg_title: 'Fungua Akaunti Bure',
    reg_haveAccount: 'Je, tayari una akaunti?',
    reg_signIn: 'Ingia hapa',
    reg_wantWork: 'Natafuta Kazi (Worker)',
    reg_wantHire: 'Natafuta Mfanyakazi (Employer)',
    reg_fullNameWorker: 'Jina Kamili',
    reg_fullNameEmployer: 'Jina la Kampuni au Jina Kamili',
    reg_phone: 'Namba ya Simu (kwa mawasiliano na malipo)',
    reg_city: 'Mji / Eneo (mfano: Dar es Salaam, Arusha, Mwanza...)',
    reg_passwordPlaceholder: 'Nenosiri Imara (angalau herufi 6)',
    reg_submit: 'Jisajili Bure',

    // Employer Dashboard
    emp_title: 'Dashibodi ya Mwajiri',
    emp_welcome: 'Karibu tena',
    emp_btnTransactions: 'Kazi na Malipo',
    emp_btnPostJob: 'Posti Kazi Mpya',
    emp_statActive: 'Kazi Zinazoendelea',
    emp_statApplicants: 'Waombaji Wote',
    emp_statCompleted: 'Kazi Zilizokamilika',
    emp_statFee: 'Makato ya Mfumo',
    emp_recentJobs: 'Kazi Ulizoposti na Waombaji',
    emp_loadingJobs: 'Inapakia kazi...',
    emp_noJobsTitle: 'Bado hujaposti kazi yoyote',
    emp_noJobsDesc: 'Posti kazi yako ya kwanza bure kabisa ili uanze kupokea maombi kutoka kwa wafanyakazi wa karibu.',
    emp_workersNeeded: 'wafanyakazi wanahitajika',
    emp_accepted: 'wamekubaliwa',
    emp_applicantsHeader: 'Waombaji wa Kazi Hii',
    emp_noApplicantsYet: 'Bado hakuna mwombaji — wafanyakazi wa karibu wataiona kazi hii.',
    emp_btnAcceptWorker: 'Mkubali Mfanyakazi',
    emp_workerAccepted: 'Amekubaliwa ✓',

    // Post Job
    pj_headerTitle1: 'Posti',
    pj_headerTitle2: 'Kazi Mpya',
    pj_headerSub: 'Kuposti ni Bure 100%. Mfanyakazi anapokea 100% ya malipo moja kwa moja kutoka kwako.',
    pj_step1: 'Maelezo',
    pj_step2: 'Ratiba',
    pj_step3: 'Malipo',
    pj_step4: 'Hakiki',
    pj_jobTitle: 'Kichwa cha Kazi *',
    pj_category: 'Kundi la Kazi (Category) *',
    pj_selectCategory: 'Chagua kundi la kazi',
    pj_description: 'Maelezo ya Kazi *',
    pj_location: 'Mahali Kazi Ilipo *',
    pj_workersNeeded: 'Idadi ya Wafanyakazi Wanaohitajika *',
    pj_specialReq: 'Masharti au Vigezo Maalum',
    pj_jobDate: 'Tarehe ya Kazi *',
    pj_startTime: 'Muda wa Kuanza *',
    pj_duration: 'Muda wa Kazi (Masaa) *',
    pj_deadlineDate: 'Mwisho wa Kuomba (Tarehe) *',
    pj_deadlineTime: 'Mwisho wa Kuomba (Saa) *',
    pj_payPerWorker: 'Malipo kwa Kila Mfanyakazi (TSh) *',
    pj_totalDirectPay: 'Jumla Utakayowalipa Wafanyakazi Moja kwa Moja',
    pj_zeroCommissionNote: '🎉 Makato ya Mfumo: TSh 0 (0% Commission — Unamlipa mfanyakazi moja kwa moja kazi ikikamilika!)',
    pj_paymentMethod: 'Njia ya Kumlipa Mfanyakazi Moja kwa Moja *',
    pj_reviewPost: 'Hakiki na Posti',
    pj_btnNext: 'Endelea →',
    pj_btnBack: '← Rudi Nyuma',
    pj_btnPost: '🚀 Posti Kazi Bure',
    pj_posting: 'Inaposti…',
    pj_successTitle: 'Kazi Imepostiwa Kikamilifu!',
    pj_successDesc: 'Wafanyakazi waliopo karibu sasa wanaweza kuiona na kuomba kazi hii mara moja.',
    pj_viewDashboard: 'Nenda kwenye Dashibodi',
    pj_postAnother: 'Posti Kazi Nyingine',

    // Employer Transactions (Direct P2P)
    etx_title: 'Malipo ya Kazi (Moja kwa Moja)',
    etx_subtitle: 'Makato 0% — Mlipe mfanyakazi moja kwa moja akimaliza kazi kisha thibitisha hapa kujenga uaminifu.',
    etx_noTxTitle: 'Bado hakuna mfanyakazi uliyemkubali',
    etx_noTxDesc: 'Ukishamkubali mfanyakazi kwenye dashibodi yako, hatua za kazi na uthibitisho wa malipo vitaonekana hapa.',
    etx_workerLabel: 'Mfanyakazi',
    etx_phoneLabel: 'Simu ya Malipo',
    etx_totalPay: 'Malipo ya Kazi (100%)',
    etx_platformFee: 'Makato ya KaziLink (0%)',
    etx_freeLabel: 'BURE (TSh 0)',
    etx_netWorker: 'Mfanyakazi Anapokea Moja kwa Moja',
    etx_btnMarkPaid: 'Nimemlipa Mfanyakazi Moja kwa Moja',
    etx_waitingWorkerStart: 'Mfanyakazi amekubaliwa na anaweza kuanza kazi sasa.',
    etx_jobInProgress: 'Mfanyakazi anaendelea na kazi kwa sasa.',
    etx_waitingWorkerConfirm: 'Umesema umemlipa! Inasubiri mfanyakazi kubonyeza "Nimepokea Malipo".',
    etx_paymentConfirmed: 'Malipo Yamethibitishwa na Pande Zote Mbili',
    etx_btnRateWorker: 'Mpe Nyota & Maoni Mfanyakazi',

    // Worker Dashboard
    wd_title: 'Dashibodi ya Mfanyakazi',
    wd_ready: 'Uko tayari kupata 100% ya malipo yako,',
    wd_availNow: 'Niko Tayari Sasa (Available Now)',
    wd_availWeek: 'Niko Tayari Wiki Hii',
    wd_busy: 'Niko Bize (Busy)',
    wd_viewProfile: 'Tazama Wasifu Wangu',
    wd_myJobs: 'Kazi Zangu na Malipo',
    wd_statNearby: 'Kazi Zilizopo',
    wd_statApplied: 'Kazi Nilizoomba',
    wd_statCompleted: 'Kazi Nilizokamilisha',
    wd_statEarned: 'Jumla Niliyoingiza (100%)',
    wd_skillsTitle: 'Ujuzi Wangu (Skills)',
    wd_skillsDesc: 'Ongeza ujuzi wako ili waajiri wakuone haraka. Ukikamilisha kazi, ujuzi wako unathibitishwa.',
    wd_skillPlaceholder: 'mfano: Udereva, Usafi, Ujenzi, Umeme...',
    wd_addSkill: 'Ongeza Ujuzi',
    wd_selfReported: '(Umeweka mwenyewe)',
    wd_noSkills: 'Bado hujaongeza ujuzi wowote.',
    wd_recGigs: 'Kazi Zilizopo Kwa Ajili Yako (Makato 0% — Chukua 100% ya Malipo)',
    wd_spotsLeft: 'nafasi zimebaki',
    wd_applyNow: 'Omba Kazi Sasa',
    wd_applied: 'Umeshaomba ✓',
    wd_acceptedBadge: 'Umekubaliwa! Nenda Kazi Zangu →',

    // Worker Transactions (My Jobs & Direct Payment Confirmation)
    wtx_title: 'Kazi Zangu na Uthibitisho wa Malipo',
    wtx_subtitle: 'Fuatilia kazi ulizokubaliwa, weka alama ukimaliza, na thibitisha mwajiri akishakulipa moja kwa moja (Makato 0%).',
    wtx_noJobsTitle: 'Bado huna kazi iliyokubaliwa',
    wtx_noJobsDesc: 'Mwajiri akishakubali ombi lako la kazi, itaonekana hapa ili uanze kazi mara moja.',
    wtx_employerLabel: 'Mwajiri',
    wtx_youEarn: 'Unapokea Moja kwa Moja (100% — Bila Makato)',
    wtx_zeroFeeNote: 'Makato ya mfumo: TSh 0 (0% Commission) · Unalipwa moja kwa moja na mwajiri',
    wtx_btnStartJob: 'Anza Kazi Sasa',
    wtx_btnMarkComplete: 'Nimemaliza Kazi (Mark Completed)',
    wtx_btnConfirmReceipt: 'Thibitisha Nimepokea Malipo',
    wtx_waitingEmployerPay: 'Kazi imekamilika! Mwajiri atakulipa moja kwa moja (M-Pesa/Airtel/Cash) na kuweka alama amelipa.',
    wtx_employerMarkedPaid: 'Mwajiri ameweka alama kuwa amekulipa! Tafadhali bonyeza hapa chini kuthibitisha kama umepokea.',
    wtx_paidSuccess: 'Malipo Yamethibitishwa! 100% imeongezwa kwenye rekodi yako.',
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('kazilink_lang') || 'sw';
  });

  useEffect(() => {
    localStorage.setItem('kazilink_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (newLang) => {
    if (newLang === 'en' || newLang === 'sw') {
      setLangState(newLang);
    }
  };

  const toggleLang = () => {
    setLangState((prev) => (prev === 'sw' ? 'en' : 'sw'));
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
