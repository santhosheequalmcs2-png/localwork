/* LocalWork hackathon demo.
   This app uses localStorage for demonstration only. It does NOT provide secure authentication,
   server-side storage, real messaging, or real booking delivery. Never use real passwords here. */
const STORAGE = {users:"localwork_demo_users_v1", current:"localwork_demo_current_v1", bookings:"localwork_demo_bookings_v1", custom:"localwork_demo_custom_workmen_v1"};
const categories = [
  {name:"Electrician",icon:"⚡",caption:"Wiring & repairs"},
  {name:"Plumber",icon:"🔧",caption:"Leaks & fittings"},
  {name:"Carpenter",icon:"🪚",caption:"Woodwork & furniture"},
  {name:"Painter",icon:"🖌️",caption:"Walls & finishes"},
  {name:"Mechanic",icon:"🛠️",caption:"Vehicle repairs"},
  {name:"Cleaning",icon:"🧹",caption:"Home & office"},
  {name:"Construction",icon:"🧱",caption:"Building work"},
  {name:"Other",icon:"🧰",caption:"Other local skills"}
];
const demoWorkmen = [
 {id:"demo-1",name:"Arun Kumar",service:"Electrician",location:"Anna Nagar, Chennai",experience:6,description:"Electrical repairs, fan and light installation, switchboard work, and basic home wiring. I focus on careful work and clear communication.",phone:"9000000001",email:"arun.demo@example.com",availability:"Available",rating:4.8,reviews:24,skills:["Wiring","Fan installation","Switchboards"],avatar:"👨‍🔧",demo:true},
 {id:"demo-2",name:"Meena Ravi",service:"Plumber",location:"T. Nagar, Chennai",experience:5,description:"Home plumbing, tap replacement, leak checks, sink fitting, and bathroom maintenance.",phone:"9000000002",email:"meena.demo@example.com",availability:"Available",rating:4.7,reviews:18,skills:["Leak repair","Tap fitting","Pipes"],avatar:"👩‍🔧",demo:true},
 {id:"demo-3",name:"Karthik S",service:"Carpenter",location:"Velachery, Chennai",experience:8,description:"Furniture assembly, shelf installation, door adjustments, and small custom woodwork projects.",phone:"9000000003",email:"karthik.demo@example.com",availability:"Busy",rating:4.9,reviews:31,skills:["Furniture","Shelves","Door repair"],avatar:"🧑‍🔧",demo:true},
 {id:"demo-4",name:"Priya M",service:"Painter",location:"Adyar, Chennai",experience:4,description:"Interior wall painting, touch-ups, surface preparation, and neat finishing for small homes and rooms.",phone:"9000000004",email:"priya.demo@example.com",availability:"Available",rating:4.6,reviews:12,skills:["Interior painting","Touch-ups","Finishing"],avatar:"👩‍🎨",demo:true},
 {id:"demo-5",name:"Rafiq Ahmed",service:"Mechanic",location:"Guindy, Chennai",experience:7,description:"Basic two-wheeler servicing, brake checks, oil changes, and routine maintenance.",phone:"9000000005",email:"rafiq.demo@example.com",availability:"Available",rating:4.7,reviews:20,skills:["Two-wheelers","Routine service","Brake checks"],avatar:"👨‍🔧",demo:true},
 {id:"demo-6",name:"Lakshmi P",service:"Cleaning",location:"Mylapore, Chennai",experience:3,description:"Home deep cleaning, kitchen cleaning, and move-in or move-out cleaning assistance.",phone:"9000000006",email:"lakshmi.demo@example.com",availability:"Available",rating:4.5,reviews:9,skills:["Home cleaning","Kitchen","Deep cleaning"],avatar:"🧹",demo:true},
 {id:"demo-7",name:"Suresh Babu",service:"Construction",location:"Porur, Chennai",experience:10,description:"Small masonry jobs, tile repair, plaster patching, and general renovation assistance.",phone:"9000000007",email:"suresh.demo@example.com",availability:"Busy",rating:4.8,reviews:27,skills:["Masonry","Tile repair","Renovation"],avatar:"👷",demo:true},
 {id:"demo-8",name:"Naveen Raj",service:"Electrician",location:"Tambaram, Chennai",experience:2,description:"Home electrical troubleshooting, light fitting, and basic appliance connection support.",phone:"9000000008",email:"naveen.demo@example.com",availability:"Available",rating:4.4,reviews:6,skills:["Light fitting","Troubleshooting","Appliances"],avatar:"🧑‍🔧",demo:true}
];
let selectedRole = "customer";
let authMode = "register";
let currentProfileId = null;
let lastResultsSource = "customer";
let activeCategory = "";
let toastTimer = null;
const $ = id => document.getElementById(id);
const read = (key, fallback) => { try { const value=localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const allCustom = () => read(STORAGE.custom, []);
const allWorkmen = () => [...demoWorkmen, ...allCustom().filter(w=>w.role==="workman").map(w=>({...w,demo:false}))];
const currentUser = () => read(STORAGE.current, null);
const allUsers = () => read(STORAGE.users, []);
const initialsAvatar = name => name && name.trim() ? "🧑‍🔧" : "👤";

function showView(viewId) {
  document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));
  $(viewId).classList.remove("hidden");
  $("header-login").classList.toggle("hidden", !!currentUser());
  $("header-logout").classList.toggle("hidden", !currentUser());
  window.scrollTo({top:0,behavior:"smooth"});
}
function toast(message) {
  $("toast").textContent=message; $("toast").classList.remove("hidden");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>$("toast").classList.add("hidden"),3200);
}
function goHome(){showView("home-view");}
function openAuth(mode="register", role=null) {
  authMode=mode;
  if(role) selectedRole=role;
  updateAuthMode();
  showView("auth-view");
}
function updateAuthMode(){
  $("tab-register").classList.toggle("active",authMode==="register");
  $("tab-login").classList.toggle("active",authMode==="login");
  $("role-picker").classList.toggle("hidden",authMode==="login" || !!selectedRole);
  $("auth-form").classList.toggle("hidden",authMode==="register" && !selectedRole);
  $("register-fields").classList.toggle("hidden",authMode!=="register");
  $("login-fields").classList.toggle("hidden",authMode!=="login");
  $("password-fields").classList.toggle("hidden",authMode!=="register");
  $("workman-fields").classList.toggle("hidden",authMode!=="register" || selectedRole!=="workman");
  $("form-title").textContent=authMode==="login"?"Log in to LocalWork":`Register as ${selectedRole==="workman"?"a Workman":"a Customer"}`;
  $("form-subtitle").textContent=authMode==="login"?"Welcome back. Enter your demo account details.":"A few details to get started.";
  $("submit-auth").textContent=authMode==="login"?"Log in":"Register as "+(selectedRole==="workman"?"Workman":"Customer");
  $("form-error").classList.add("hidden");
}
function renderCategories(targetId, small=false){
  $(targetId).innerHTML=categories.map(c=>`<button class="category-card ${activeCategory===c.name?"selected":""}" data-category="${escapeHTML(c.name)}"><span class="category-icon">${c.icon}</span><strong>${escapeHTML(c.name)}</strong><small>${escapeHTML(c.caption)}</small></button>`).join("");
  $(targetId).querySelectorAll("[data-category]").forEach(btn=>btn.addEventListener("click",()=>{
    activeCategory=activeCategory===btn.dataset.category?"":btn.dataset.category;
    if(targetId==="home-categories"){openAuth("register","customer");$("search-service").value=activeCategory;renderCategories("dashboard-categories",true);renderResults();}
    else {renderCategories("dashboard-categories",true);$("search-service").value=activeCategory;renderResults();}
  }));
}
function loginUser(user){write(STORAGE.current,{id:user.id,role:user.role,email:user.email});routeByRole();}
function routeByRole(){
  const user=currentUser();
  if(!user){goHome();return;}
  $("header-login").classList.add("hidden");$("header-logout").classList.remove("hidden");
  if(user.role==="customer"){showView("customer-view");$("customer-welcome").textContent=`Welcome${user.name?" back, "+user.name.split(" ")[0]:""}! Find local help.`;renderCategories("dashboard-categories",true);renderResults();}
  else {showView("workman-view");renderWorkmanDashboard();}
}
async function hashDemoPassword(password, salt){
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
async function handleRegister(){
  const name=$("full-name").value.trim(), email=$("email").value.trim().toLowerCase(), phone=$("phone").value.trim(), location=$("location").value.trim(), password=$("password").value, confirm=$("confirm-password").value;
  const err=$("form-error"); let message="";
  if(!name||!email||!phone||!location||!password||!confirm) message="Please complete all required fields.";
  else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) message="Enter a valid email address.";
  else if(!/^[+\d\s()-]{8,18}$/.test(phone)) message="Enter a valid phone number (at least 8 digits).";
  else if(password.length<8) message="Use at least 8 characters for your demo password.";
  else if(password!==confirm) message="The passwords do not match.";
  else if(allUsers().some(u=>u.email===email)) message="An account with this email already exists in this browser. Try logging in.";
  if(selectedRole==="workman" && !message){
    if(!$("service").value) message="Choose the type of work you provide.";
    else if($("experience").value==="" || Number($("experience").value)<0 || Number($("experience").value)>70) message="Enter experience between 0 and 70 years.";
    else if(!$("description").value.trim()) message="Add a short description of your skills.";
  }
  if(message){err.textContent=message;err.classList.remove("hidden");return;}
  const passwordSalt = crypto.getRandomValues(new Uint8Array(16)).reduce((s,b)=>s+b.toString(16).padStart(2,"0"),"");
  const passwordHash = await hashDemoPassword(password, passwordSalt);
  const user={id:"user-"+Date.now(),role:selectedRole,name,email,phone,location,service:selectedRole==="workman"?$("service").value:"",experience:selectedRole==="workman"?Number($("experience").value):0,description:selectedRole==="workman"?$("description").value.trim():"",availability:selectedRole==="workman"?$("availability").value:"Available",skills:selectedRole==="workman"?$("description").value.trim().split(/[,.]/).map(s=>s.trim()).filter(Boolean).slice(0,4):[],avatar:initialsAvatar(name),demo:false, passwordSalt, passwordHash};
  // Demo only: a salted browser-side hash avoids saving the plain-text password, but is NOT production authentication.
  const users=allUsers();users.push(user);write(STORAGE.users,users);
  if(user.role==="workman"){const custom=allCustom();custom.push(user);write(STORAGE.custom,custom);}
  loginUser(user);toast("Demo account created. Welcome to LocalWork!");
}
async function handleLogin(){
  const email=$("login-email").value.trim().toLowerCase(), password=$("login-password").value;
  const err=$("form-error");
  const candidate=allUsers().find(u=>u.email===email);
  const candidateHash = candidate && candidate.passwordSalt && candidate.passwordHash ? await hashDemoPassword(password, candidate.passwordSalt) : "";
  const user = candidate && candidateHash === candidate.passwordHash ? candidate : null;
  if(!email||!password){err.textContent="Enter your email and password.";err.classList.remove("hidden");return;}
  if(!user){err.textContent="No matching demo account found. Register first in this browser.";err.classList.remove("hidden");return;}
  loginUser(user);toast("Logged in to demo mode.");
}
function renderResults(){
  const service=$("search-service").value.trim().toLowerCase(), location=$("search-location").value.trim().toLowerCase();
  let list=allWorkmen().filter(w=>(!service||w.service.toLowerCase().includes(service)||w.name.toLowerCase().includes(service)||((w.skills||[]).join(" ").toLowerCase().includes(service)))&&(!location||w.location.toLowerCase().includes(location)));
  if(activeCategory && !service) list=list.filter(w=>w.service.toLowerCase()===activeCategory.toLowerCase());
  $("results-title").textContent=service||location?`Results${service?" for "+$("search-service").value:""}${location?" near "+$("search-location").value:""}`:"Workmen to explore";
  $("result-count").textContent=`${list.length} profile${list.length===1?"":"s"}`;
  if(!list.length){$("workman-results").innerHTML='<div class="no-results"><strong>No matching profiles yet</strong>Try a different service or area. The demo data mainly uses Chennai neighbourhoods.</div>';return;}
  $("workman-results").innerHTML=list.map(w=>workmanCard(w)).join("");
  $("workman-results").querySelectorAll("[data-profile]").forEach(b=>b.addEventListener("click",()=>openProfile(b.dataset.profile,"customer-view")));
  $("workman-results").querySelectorAll("[data-contact]").forEach(b=>b.addEventListener("click",()=>contactWorkman(b.dataset.contact)));
  $("workman-results").querySelectorAll("[data-book]").forEach(b=>b.addEventListener("click",()=>openBooking(b.dataset.book)));
}
function workmanCard(w){
 return `<article class="workman-card"><div class="card-top"><div class="avatar">${escapeHTML(w.avatar||"🧑‍🔧")}</div><div><h3>${escapeHTML(w.name)}</h3><div class="service-label">${escapeHTML(w.service)}</div></div></div><p>${escapeHTML((w.description||"Local service professional.").slice(0,115))}${(w.description||"").length>115?"…":""}</p><div class="card-meta"><span>⌖ ${escapeHTML(w.location)}</span><span>◷ ${Number(w.experience)||0} yrs exp.</span><span>${w.availability==="Available"?"● Available":"● Busy"}</span></div><div class="card-meta">${w.demo?`<span class="rating">★ ${w.rating} (${w.reviews} demo reviews)</span>`:"<span>Rating not yet available</span>"}<span>${w.demo?"Sample profile":"User profile"}</span></div><div class="card-actions"><button class="btn btn-light" data-profile="${escapeHTML(w.id)}">View profile</button><button class="btn btn-primary" data-contact="${escapeHTML(w.id)}">Contact</button></div></article>`;
}
function openProfile(id, source="customer-view"){
 const w=allWorkmen().find(p=>p.id===id);if(!w){toast("This profile could not be found.");return;}
 currentProfileId=id;lastResultsSource=source;
 $("profile-back").onclick=()=>{showView(lastResultsSource);if(lastResultsSource==="customer-view")renderResults();else renderWorkmanDashboard();};
 const skills=(w.skills||[]).length?w.skills:[w.service,"Local service","Customer support"];
 $("profile-detail").innerHTML=`<article class="profile-detail-card"><div class="profile-detail-head"><div class="avatar">${escapeHTML(w.avatar||"🧑‍🔧")}</div><div><span class="demo-tag">${w.demo?"FICTIONAL DEMO PROFILE":"COMMUNITY PROFILE"}</span><h1>${escapeHTML(w.name)}</h1><p>${escapeHTML(w.service)} · ${escapeHTML(w.location)}</p></div></div><div class="profile-detail-grid"><div><div class="eyebrow">ABOUT THE WORKMAN</div><h2>Skills & introduction</h2><p class="profile-description">${escapeHTML(w.description||"No introduction has been added yet.")}</p><div class="skill-chips">${skills.map(s=>`<span class="skill-chip">${escapeHTML(s)}</span>`).join("")}</div><div style="margin-top:30px"><div class="eyebrow">RATINGS & REVIEWS</div><h2>${w.demo?`★ ${w.rating} / 5 — illustrative demo rating`:"No rating yet"}</h2>${w.demo?`<div class="demo-review"><strong>Sample review summary</strong><p>This profile uses fictional demonstration data. These are not genuine customer reviews.</p><small>DEMO CONTENT — NOT A REAL REVIEW</small></div>`:'<p class="muted">Ratings and reviews will appear here when a real review system is configured.</p>'}</div></div><aside class="profile-sidebox"><div class="eyebrow">QUICK DETAILS</div><div class="profile-facts"><div class="profile-fact"><span>◷</span><div><strong>${Number(w.experience)||0} years</strong><small>Experience</small></div></div><div class="profile-fact"><span>⌖</span><div><strong>${escapeHTML(w.location)}</strong><small>Service area</small></div></div><div class="profile-fact"><span>●</span><div><strong>${escapeHTML(w.availability||"Not specified")}</strong><small>Availability</small></div></div><div class="profile-fact"><span>☎</span><div><strong>${escapeHTML(w.phone||"Not provided")}</strong><small>Demo contact detail</small></div></div></div><button class="btn btn-primary" data-profile-book="${escapeHTML(w.id)}">Request booking</button><button class="btn btn-light" data-profile-contact="${escapeHTML(w.id)}">Contact workman</button><p class="fine-print">${w.demo?"Fictional profile and contact details. Do not call or message.":"Contact is a demo action; no message is delivered."}</p></aside></div></article>`;
 $("profile-detail").querySelector("[data-profile-book]").addEventListener("click",()=>openBooking(id));
 $("profile-detail").querySelector("[data-profile-contact]").addEventListener("click",()=>contactWorkman(id));
 showView("profile-view");
}
function contactWorkman(id){
 const w=allWorkmen().find(p=>p.id===id);if(!w)return;
 if(w.demo){toast("Demo contact only: "+w.name+"'s phone and email are fictional.");return;}
 toast("Demo contact: use the displayed contact details to discuss the job. No message is sent by LocalWork.");
}
function openBooking(id){
 const w=allWorkmen().find(p=>p.id===id);if(!w)return;
 if(!currentUser()||currentUser().role!=="customer"){toast("Log in as a customer to request a booking.");openAuth("register","customer");return;}
 currentProfileId=id;$("booking-for").textContent=`Requesting a booking with ${w.name} (${w.service}).`;
 $("booking-customer").value=currentUser().name||"";$("booking-phone").value=currentUser().phone||"";$("booking-address").value=currentUser().location||"";
 $("booking-date").min=new Date().toISOString().slice(0,10);$("booking-date").value="";
 $("booking-notes").value="";$("booking-error").classList.add("hidden");$("booking-modal").classList.remove("hidden");
}
function saveBooking(){
 const customer=$("booking-customer").value.trim(),phone=$("booking-phone").value.trim(),address=$("booking-address").value.trim(),date=$("booking-date").value;
 let message="";if(!customer||!phone||!address||!date)message="Please complete your name, phone, address, and preferred date.";
 else if(date<new Date().toISOString().slice(0,10))message="Choose today or a future date.";
 if(message){$("booking-error").textContent=message;$("booking-error").classList.remove("hidden");return;}
 const request={id:"booking-"+Date.now(),workmanId:currentProfileId,customerId:currentUser().id,customer,phone,address,date,time:$("booking-time").value,notes:$("booking-notes").value.trim(),status:"Demo request saved"};
 const bookings=read(STORAGE.bookings,[]);bookings.push(request);write(STORAGE.bookings,bookings);
 $("booking-modal").classList.add("hidden");toast("Demo booking saved in this browser. The workman was not notified.");
}
function renderWorkmanDashboard(){
 const user=currentUser();if(!user||user.role!=="workman")return;
 const latest=allWorkmen().find(w=>w.id===user.id)||user;
 $("workman-avatar").textContent=latest.avatar||"🧑‍🔧";
 $("workman-profile-summary").innerHTML=`<div class="profile-facts"><div class="profile-fact"><span>◉</span><div><strong>${escapeHTML(latest.name)}</strong><small>${escapeHTML(latest.email)}</small></div></div><div class="profile-fact"><span>☎</span><div><strong>${escapeHTML(latest.phone)}</strong><small>Contact number</small></div></div><div class="profile-fact"><span>⌖</span><div><strong>${escapeHTML(latest.location)}</strong><small>Service area</small></div></div><div class="profile-fact"><span>🔧</span><div><strong>${escapeHTML(latest.service)}</strong><small>${Number(latest.experience)||0} years of experience</small></div></div></div><p class="profile-description">${escapeHTML(latest.description)}</p>`;
 $("availability-status").value=latest.availability||"Available";$("availability-label").textContent=latest.availability||"Available";
 const bookings=read(STORAGE.bookings,[]).filter(b=>b.workmanId===user.id);
 $("workman-bookings").innerHTML=bookings.length?bookings.map(b=>`<div class="demo-review"><strong>${escapeHTML(b.date)} · ${escapeHTML(b.time)}</strong><p>${escapeHTML(b.customer)} — ${escapeHTML(b.address)}</p><small>DEMO REQUEST · NOT SENT OR CONFIRMED</small></div>`).join(""):"No booking requests for this account yet. Requests made to fictional sample profiles will not appear here.";
}
function openEditProfile(){
 const user=currentUser();if(!user||user.role!=="workman")return;
 const w=allWorkmen().find(p=>p.id===user.id)||user;
 $("edit-name").value=w.name||"";$("edit-phone").value=w.phone||"";$("edit-location").value=w.location||"";$("edit-service").value=w.service||"Other";$("edit-experience").value=w.experience??0;$("edit-description").value=w.description||"";$("edit-error").classList.add("hidden");$("edit-modal").classList.remove("hidden");
}
function saveProfile(){
 const user=currentUser(),name=$("edit-name").value.trim(),phone=$("edit-phone").value.trim(),location=$("edit-location").value.trim(),service=$("edit-service").value,experience=Number($("edit-experience").value),description=$("edit-description").value.trim();
 let error="";if(!name||!phone||!location||!description)error="Please complete all profile fields.";else if(!/^[+\d\s()-]{8,18}$/.test(phone))error="Enter a valid phone number.";else if($("edit-experience").value===""||experience<0||experience>70)error="Experience must be between 0 and 70 years.";
 if(error){$("edit-error").textContent=error;$("edit-error").classList.remove("hidden");return;}
 const updated={...user,name,phone,location,service,experience,description,skills:description.split(/[,.]/).map(s=>s.trim()).filter(Boolean).slice(0,4)};
 write(STORAGE.users,allUsers().map(u=>u.id===user.id?updated:u));
 write(STORAGE.current,{id:updated.id,role:updated.role,email:updated.email});
 write(STORAGE.custom,allCustom().map(w=>w.id===user.id?updated:w).concat(allCustom().some(w=>w.id===user.id)?[]:[updated]));
 $("edit-modal").classList.add("hidden");renderWorkmanDashboard();toast("Your demo profile has been updated.");
}
function logout(){localStorage.removeItem(STORAGE.current);activeCategory="";goHome();toast("You have logged out.");}
function init(){
 renderCategories("home-categories");$("header-login").addEventListener("click",()=>openAuth("login",null));
 $("header-logout").addEventListener("click",logout);
 document.querySelectorAll('[data-action="home"]').forEach(b=>b.addEventListener("click",e=>{e.preventDefault();goHome();}));
 document.querySelectorAll('[data-action="choose-customer"]').forEach(b=>b.addEventListener("click",()=>openAuth("register","customer")));
 document.querySelectorAll('[data-action="choose-workman"]').forEach(b=>b.addEventListener("click",()=>openAuth("register","workman")));
 document.querySelectorAll('[data-action="services"]').forEach(b=>b.addEventListener("click",e=>{e.preventDefault();goHome();document.getElementById("services").scrollIntoView({behavior:"smooth"});}));
 document.querySelectorAll('[data-action="how"]').forEach(b=>b.addEventListener("click",e=>{e.preventDefault();goHome();document.getElementById("how-it-works").scrollIntoView({behavior:"smooth"});}));
 $("tab-register").addEventListener("click",()=>{authMode="register";selectedRole=null;updateAuthMode();});
 $("tab-login").addEventListener("click",()=>{authMode="login";selectedRole=null;updateAuthMode();});
 document.querySelectorAll("[data-role]").forEach(b=>b.addEventListener("click",()=>{selectedRole=b.dataset.role;authMode="register";updateAuthMode();}));
 $("back-to-roles").addEventListener("click",()=>{selectedRole=null;authMode="register";updateAuthMode();});
 $("auth-form").addEventListener("submit",e=>{e.preventDefault();authMode==="login"?handleLogin():handleRegister();});
 $("show-password").addEventListener("change",()=>["password","confirm-password"].forEach(id=>$(id).type=$("show-password").checked?"text":"password"));
 $("search-button").addEventListener("click",()=>{activeCategory="";renderCategories("dashboard-categories",true);renderResults();});
 $("search-service").addEventListener("keydown",e=>{if(e.key==="Enter"){activeCategory="";renderResults();}});
 $("search-location").addEventListener("keydown",e=>{if(e.key==="Enter")renderResults();});
 $("clear-filters").addEventListener("click",()=>{$("search-service").value="";$("search-location").value="";activeCategory="";renderCategories("dashboard-categories",true);renderResults();});
 $("edit-profile-button").addEventListener("click",openEditProfile);$("edit-profile-form").addEventListener("submit",e=>{e.preventDefault();saveProfile();});
 $("availability-status").addEventListener("change",e=>{const user=currentUser();if(!user)return;const updatedUsers=allUsers().map(u=>u.id===user.id?{...u,availability:e.target.value}:u);write(STORAGE.users,updatedUsers);write(STORAGE.custom,allCustom().map(w=>w.id===user.id?{...w,availability:e.target.value}:w));$("availability-label").textContent=e.target.value;renderWorkmanDashboard();toast("Availability updated in demo mode.");});
 $("preview-profile-button").addEventListener("click",()=>{const u=currentUser();if(u)openProfile(u.id,"workman-view");});
 $("profile-back").addEventListener("click",()=>showView(lastResultsSource));
 $("booking-form").addEventListener("submit",e=>{e.preventDefault();saveBooking();});
 document.querySelectorAll('[data-action="close-edit"]').forEach(b=>b.addEventListener("click",()=>$("edit-modal").classList.add("hidden")));
 document.querySelectorAll('[data-action="close-booking"]').forEach(b=>b.addEventListener("click",()=>$("booking-modal").classList.add("hidden")));
 ["edit-modal","booking-modal"].forEach(id=>$(id).addEventListener("click",e=>{if(e.target.id===id)$(id).classList.add("hidden");}));
 document.addEventListener("keydown",e=>{if(e.key==="Escape")document.querySelectorAll(".modal").forEach(m=>m.classList.add("hidden"));});
 const today=new Date().toISOString().slice(0,10);$("booking-date").min=today;
 const session=currentUser();if(session){const user=allUsers().find(u=>u.id===session.id);if(user)routeByRole();else{localStorage.removeItem(STORAGE.current);goHome();}}else goHome();
}

/* English/Tamil interface translation. User-entered names and descriptions are preserved. */
const LANGUAGE_STORAGE_KEY = "localwork_language_v1";
let currentLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) === "ta" ? "ta" : "en";
const languageText = {
"Services":"சேவைகள்", "How it works":"எப்படி செயல்படுகிறது", "Log in":"உள்நுழை", "Log out":"வெளியேறு",
"Local skills. Local opportunities.":"உள்ளூர் திறன்கள். உள்ளூர் வாய்ப்புகள்.", "Good work is":"நல்ல வேலை",
"closer than you think.":"நீங்கள் நினைப்பதைவிட அருகில் உள்ளது.",
"Find nearby professionals for everyday jobs—or help your skills find their next customer.":"அன்றாட வேலைகளுக்கான அருகிலுள்ள நிபுணர்களைக் கண்டறியுங்கள் — அல்லது உங்கள் திறன்களுக்கு அடுத்த வாடிக்கையாளரைக் கண்டுபிடியுங்கள்.",
"Find a workman":"வேலைக்காரரைத் தேடுங்கள்", "Join as a workman":"வேலைக்காரராக இணையுங்கள்",
"Built to support local work and small businesses":"உள்ளூர் வேலைகளையும் சிறு தொழில்களையும் ஆதரிக்க உருவாக்கப்பட்டது",
"Local services":"உள்ளூர் சேவைகள்", "One neighbourhood.":"ஒரே பகுதி.", "Many useful skills.":"பல பயனுள்ள திறன்கள்.",
"Search nearby skills":"அருகிலுள்ள திறன்களைத் தேடுங்கள்", "Compare profiles":"சுயவிவரங்களை ஒப்பிடுங்கள்", "Contact directly":"நேரடியாகத் தொடர்புகொள்ளுங்கள்",
"WHAT DO YOU NEED?":"உங்களுக்கு என்ன தேவை?", "Help for the jobs on your list.":"உங்கள் பட்டியலில் உள்ள வேலைகளுக்கான உதவி.",
"Choose a category to start exploring local services.":"உள்ளூர் சேவைகளைப் பார்க்க ஒரு வகையைத் தேர்ந்தெடுக்கவும்.",
"SIMPLE BY DESIGN":"எளிமையாக வடிவமைக்கப்பட்டது", "Local help, in three steps.":"மூன்று படிகளில் உள்ளூர் உதவி.",
"Tell us what you need":"உங்களுக்கு என்ன தேவை என்று கூறுங்கள்", "Search by service and the area where the work is needed.":"தேவையான சேவையையும் வேலை செய்ய வேண்டிய பகுதியையும் வைத்து தேடுங்கள்.",
"Explore workman profiles":"வேலைக்காரர்களின் சுயவிவரங்களைப் பாருங்கள்", "Review skills, experience, and contact details before you decide.":"முடிவு செய்வதற்கு முன் திறன்கள், அனுபவம் மற்றும் தொடர்பு விவரங்களைப் பாருங்கள்.",
"Connect directly":"நேரடியாக இணைந்திடுங்கள்", "Send a booking request or contact the workman to discuss the job.":"முன்பதிவு கோரிக்கையை அனுப்புங்கள் அல்லது வேலையைப் பற்றி பேச வேலைக்காரரைத் தொடர்புகொள்ளுங்கள்.",
"LOCALWORK'S PURPOSE":"LocalWork-இன் நோக்கம்", "More visibility for local skills.":"உள்ளூர் திறன்களுக்கு அதிகமான தெரிவுநிலை.",
"Our hackathon project supports the spirit of UN Sustainable Development Goal 8.3: productive activity, entrepreneurship, and small-business growth.":"எங்கள் ஹேக்கத்தான் திட்டம் ஐ.நா. நிலையான வளர்ச்சி இலக்கு 8.3-ன் நோக்கத்தை ஆதரிக்கிறது: உற்பத்திசார் செயல்பாடு, தொழில்முனைவு மற்றும் சிறு தொழில் வளர்ச்சி.",
"College hackathon demo · Sample profiles are fictional.":"கல்லூரி ஹேக்கத்தான் மாதிரி · எடுத்துக்காட்டு சுயவிவரங்கள் கற்பனையானவை.",
"← Back to home":"← முகப்புக்குத் திரும்பு", "WELCOME TO LOCALWORK":"LOCALWORK-க்கு வரவேற்கிறோம்",
"Local talent.":"உள்ளூர் திறமை.", "Real possibility.":"உண்மையான வாய்ப்பு.",
"Create a demo account to explore the customer or workman experience.":"வாடிக்கையாளர் அல்லது வேலைக்காரர் அனுபவத்தைப் பார்க்க ஒரு மாதிரி கணக்கை உருவாக்குங்கள்.",
"Demo mode: accounts are stored only in this browser.":"மாதிரி முறை: கணக்குகள் இந்த உலாவியில் மட்டுமே சேமிக்கப்படும்.",
"Create account":"கணக்கை உருவாக்கு", "How will you use LocalWork?":"LocalWork-ஐ எவ்வாறு பயன்படுத்துவீர்கள்?",
"Choose an account type to see the right form.":"சரியான படிவத்தைப் பார்க்க கணக்கு வகையைத் தேர்ந்தெடுக்கவும்.",
"I am a Customer":"நான் ஒரு வாடிக்கையாளர்", "Find and contact local workmen":"உள்ளூர் வேலைக்காரர்களைக் கண்டறிந்து தொடர்புகொள்ளுங்கள்",
"I am a Workman":"நான் ஒரு வேலைக்காரர்", "Showcase your skills and services":"உங்கள் திறன்களையும் சேவைகளையும் காட்டுங்கள்",
"← Change account type":"← கணக்கு வகையை மாற்று", "Create your account":"உங்கள் கணக்கை உருவாக்குங்கள்",
"A few details to get started.":"தொடங்க சில விவரங்கள் தேவை.", "Full name":"முழுப் பெயர்", "Email address":"மின்னஞ்சல் முகவரி",
"Phone number":"தொலைபேசி எண்", "10-digit phone":"10 இலக்க தொலைபேசி எண்", "Location or area":"இடம் அல்லது பகுதி",
"Type of work":"வேலை வகை", "Choose a service":"சேவையைத் தேர்ந்தெடுக்கவும்", "Years of experience":"அனுபவ ஆண்டுகள்",
"Availability":"கிடைக்கும் நிலை", "Available":"கிடைக்கிறார்", "Busy":"பணியில் இருக்கிறார்",
"Short description of your skills":"உங்கள் திறன்களின் சுருக்கமான விளக்கம்", "Describe the services you provide...":"நீங்கள் வழங்கும் சேவைகளை விவரிக்கவும்...",
"Password":"கடவுச்சொல்", "Confirm password":"கடவுச்சொல்லை உறுதிப்படுத்தவும்", "Show passwords":"கடவுச்சொற்களைக் காட்டு",
"At least 8 characters":"குறைந்தது 8 எழுத்துகள்", "Repeat password":"கடவுச்சொல்லை மீண்டும் உள்ளிடவும்",
"Enter your demo password":"மாதிரி கடவுச்சொல்லை உள்ளிடவும்", "Use the email and password you registered with in this browser.":"இந்த உலாவியில் பதிவு செய்த மின்னஞ்சல் மற்றும் கடவுச்சொல்லைப் பயன்படுத்துங்கள்.",
"Register":"பதிவு செய்", "Demo only. Do not use a real or reused password. This front-end demo is not secure authentication.":"மாதிரிக்காக மட்டும். உண்மையான அல்லது மீண்டும் பயன்படுத்தும் கடவுச்சொல்லை பயன்படுத்த வேண்டாம். இது பாதுகாப்பான அங்கீகார அமைப்பு அல்ல.",
"CUSTOMER SPACE":"வாடிக்கையாளர் பகுதி", "Find the right local help.":"சரியான உள்ளூர் உதவியைக் கண்டறியுங்கள்.",
"Search by service and the area you need help in.":"சேவையையும் உங்களுக்கு உதவி தேவைப்படும் பகுதியையும் வைத்து தேடுங்கள்.", "DEMO DATA":"மாதிரி தரவு",
"What service do you need?":"உங்களுக்கு எந்த சேவை தேவை?", "Enter your area":"உங்கள் பகுதியை உள்ளிடுங்கள்", "Search workmen →":"வேலைக்காரர்களைத் தேடு →",
"BROWSE BY CATEGORY":"வகைப்படி தேடுங்கள்", "What needs fixing?":"எதைச் சரிசெய்ய வேண்டும்?", "Clear filters":"வடிகட்டிகளை நீக்கு",
"LOCAL SKILLS":"உள்ளூர் திறன்கள்", "Workmen to explore":"பார்க்க வேண்டிய வேலைக்காரர்கள்", "Fictional sample profiles for demonstration. Ratings are illustrative demo data.":"விளக்கத்திற்கான கற்பனை சுயவிவரங்கள். மதிப்பீடுகள் மாதிரித் தரவு மட்டுமே.",
"WORKMAN SPACE":"வேலைக்காரர் பகுதி", "Your skills deserve to be seen.":"உங்கள் திறன்கள் அனைவருக்கும் தெரிய வேண்டும்.", "Manage your profile and let local customers learn about your work.":"உங்கள் சுயவிவரத்தை நிர்வகித்து, உள்ளூர் வாடிக்கையாளர்கள் உங்கள் வேலையை அறிய உதவுங்கள்.", "DEMO ACCOUNT":"மாதிரி கணக்கு",
"YOUR PROFILE":"உங்கள் சுயவிவரம்", "Profile details":"சுயவிவர விவரங்கள்", "Edit profile":"சுயவிவரத்தைத் திருத்து", "View profile as a customer ↗":"வாடிக்கையாளராக சுயவிவரத்தைப் பார் ↗",
"YOUR WORK STATUS":"உங்கள் வேலை நிலை", "Let customers know whether you can take a job.":"நீங்கள் புதிய வேலையை ஏற்க முடியுமா என்பதை வாடிக்கையாளர்களுக்குத் தெரிவியுங்கள்.",
"Shown on your profile":"உங்கள் சுயவிவரத்தில் காட்டப்படும்", "Tip":"குறிப்பு", "Add a clear description of your skills and keep your contact details up to date.":"உங்கள் திறன்களைத் தெளிவாக விவரித்து, தொடர்பு விவரங்களைப் புதுப்பித்துக் கொள்ளுங்கள்.",
"YOUR IMPACT":"உங்கள் பங்களிப்பு", "Supporting local work":"உள்ளூர் வேலைகளுக்கு ஆதரவு", "LocalWork is designed to help local professionals gain visibility and connect with potential customers.":"உள்ளூர் நிபுணர்கள் அதிகம் அறியப்படவும் வாடிக்கையாளர்களுடன் இணையவும் LocalWork வடிவமைக்கப்பட்டுள்ளது.",
"IN THIS BROWSER":"இந்த உலாவியில்", "Booking requests":"முன்பதிவு கோரிக்கைகள்", "Booking requests created in this demo will appear here when linked to this workman.":"இந்த மாதிரியில் இந்த வேலைக்காரருடன் இணைக்கப்பட்ட முன்பதிவு கோரிக்கைகள் இங்கே தோன்றும்.",
"← Back to results":"← முடிவுகளுக்குத் திரும்பு", "KEEP IT UP TO DATE":"புதுப்பித்த நிலையில் வைத்திருங்கள்", "Edit your profile":"உங்கள் சுயவிவரத்தைத் திருத்துங்கள்",
"Skills and description":"திறன்கள் மற்றும் விளக்கம்", "Save changes":"மாற்றங்களைச் சேமி", "LET'S GET THE JOB STARTED":"வேலையைத் தொடங்குவோம்", "Request a booking":"முன்பதிவைக் கோருங்கள்",
"Your name":"உங்கள் பெயர்", "Service address / area":"சேவை முகவரி / பகுதி", "Preferred date":"விரும்பும் தேதி", "Preferred time":"விரும்பும் நேரம்",
"Morning (9 AM–12 PM)":"காலை (9–12 மணி)", "Afternoon (12 PM–4 PM)":"பிற்பகல் (12–4 மணி)", "Evening (4 PM–7 PM)":"மாலை (4–7 மணி)",
"Describe the job":"வேலையை விவரிக்கவும்", "What would you like the workman to help with?":"எந்த வேலையில் உதவி வேண்டும்?", "Save demo booking request":"மாதிரி முன்பதிவு கோரிக்கையைச் சேமி",
"This request is saved only in this browser. It is not sent to the workman.":"இந்தக் கோரிக்கை இந்த உலாவியில் மட்டுமே சேமிக்கப்படும். வேலைக்காரருக்கு அனுப்பப்படாது.", "Close":"மூடு",
"Wiring & repairs":"மின்கம்பி வேலை மற்றும் பழுதுபார்ப்பு", "Leaks & fittings":"கசிவுகள் மற்றும் பொருத்துதல்", "Woodwork & furniture":"மரவேலை மற்றும் மரச்சாமான்கள்", "Walls & finishes":"சுவர் பூச்சு மற்றும் இறுதிப்பணி", "Vehicle repairs":"வாகனப் பழுதுபார்ப்பு", "Home & office":"வீடு மற்றும் அலுவலகம்", "Building work":"கட்டுமான வேலை", "Other local skills":"பிற உள்ளூர் திறன்கள்",
"Electrician":"மின்சாரப் பணியாளர்", "Plumber":"குழாய் பணியாளர்", "Carpenter":"தச்சர்", "Painter":"பெயிண்டர்", "Mechanic":"மெக்கானிக்", "Cleaning":"சுத்தம் செய்தல்", "Construction":"கட்டுமானம்", "Other":"மற்றவை",
"View profile":"சுயவிவரத்தைப் பார்", "Contact":"தொடர்பு", "Rating not yet available":"மதிப்பீடு இன்னும் இல்லை", "Sample profile":"மாதிரி சுயவிவரம்", "User profile":"பயனர் சுயவிவரம்",
"ABOUT THE WORKMAN":"வேலைக்காரரைப் பற்றி", "Skills & introduction":"திறன்கள் மற்றும் அறிமுகம்", "RATINGS & REVIEWS":"மதிப்பீடுகள் மற்றும் விமர்சனங்கள்", "illustrative demo rating":"விளக்கத்திற்கான மாதிரி மதிப்பீடு", "No rating yet":"இன்னும் மதிப்பீடு இல்லை", "Sample review summary":"மாதிரி விமர்சனச் சுருக்கம்", "DEMO CONTENT — NOT A REAL REVIEW":"மாதிரி உள்ளடக்கம் — உண்மையான விமர்சனம் அல்ல",
"QUICK DETAILS":"விரைவு விவரங்கள்", "Experience":"அனுபவம்", "Service area":"சேவைப் பகுதி", "Demo contact detail":"மாதிரி தொடர்பு விவரம்", "Request booking":"முன்பதிவைக் கோரு", "Contact workman":"வேலைக்காரரைத் தொடர்புகொள்",
"Fictional profile and contact details. Do not call or message.":"கற்பனை சுயவிவரம் மற்றும் தொடர்பு விவரங்கள். அழைக்கவோ செய்தி அனுப்பவோ வேண்டாம்.", "Contact is a demo action; no message is delivered.":"தொடர்பு செயல் மாதிரிக்காக மட்டுமே; செய்தி அனுப்பப்படாது.",
"Local service professional.":"உள்ளூர் சேவை நிபுணர்.", "No introduction has been added yet.":"அறிமுகம் இன்னும் சேர்க்கப்படவில்லை.", "years of experience":"ஆண்டுகள் அனுபவம்", "Contact number":"தொடர்பு எண்", "Not specified":"குறிப்பிடப்படவில்லை", "Not provided":"வழங்கப்படவில்லை",
"Please complete all required fields.":"தேவையான அனைத்து புலங்களையும் நிரப்புங்கள்.", "Enter a valid email address.":"சரியான மின்னஞ்சல் முகவரியை உள்ளிடுங்கள்.", "Enter a valid phone number (at least 8 digits).":"சரியான தொலைபேசி எண்ணை உள்ளிடுங்கள் (குறைந்தது 8 இலக்கங்கள்).",
"Use at least 8 characters for your demo password.":"மாதிரி கடவுச்சொல்லில் குறைந்தது 8 எழுத்துகள் இருக்க வேண்டும்.", "The passwords do not match.":"கடவுச்சொற்கள் பொருந்தவில்லை.", "An account with this email already exists in this browser. Try logging in.":"இந்த மின்னஞ்சலுக்கு இந்த உலாவியில் ஏற்கனவே கணக்கு உள்ளது. உள்நுழைய முயற்சிக்கவும்.",
"Choose the type of work you provide.":"நீங்கள் செய்யும் வேலை வகையைத் தேர்ந்தெடுக்கவும்.", "Enter experience between 0 and 70 years.":"0 முதல் 70 ஆண்டுகளுக்குள் அனுபவத்தை உள்ளிடுங்கள்.", "Add a short description of your skills.":"உங்கள் திறன்களைச் சுருக்கமாக விவரிக்கவும்.", "Demo account created. Welcome to LocalWork!":"மாதிரி கணக்கு உருவாக்கப்பட்டது. LocalWork-க்கு வரவேற்கிறோம்!",
"Log in to LocalWork":"LocalWork-இல் உள்நுழையுங்கள்", "Welcome back. Enter your demo account details.":"மீண்டும் வரவேற்கிறோம். உங்கள் மாதிரி கணக்கு விவரங்களை உள்ளிடுங்கள்.", "Register as a Workman":"வேலைக்காரராகப் பதிவு செய்", "Register as a Customer":"வாடிக்கையாளராகப் பதிவு செய்",
"Enter your email and password.":"உங்கள் மின்னஞ்சல் மற்றும் கடவுச்சொல்லை உள்ளிடுங்கள்.", "No matching demo account found. Register first in this browser.":"பொருந்தும் மாதிரி கணக்கு கிடைக்கவில்லை. இந்த உலாவியில் முதலில் பதிவு செய்யுங்கள்.", "Logged in to demo mode.":"மாதிரி முறையில் உள்நுழைந்துள்ளீர்கள்.", "This profile could not be found.":"இந்த சுயவிவரத்தைக் கண்டறிய முடியவில்லை.",
"Demo contact only: ":"மாதிரி தொடர்பு மட்டும்: ", "'s phone and email are fictional.":" அவர்களின் தொலைபேசி மற்றும் மின்னஞ்சல் கற்பனையானவை.", "Demo contact: use the displayed contact details to discuss the job. No message is sent by LocalWork.":"மாதிரி தொடர்பு: வேலையைப் பற்றி பேச காட்டப்பட்ட தொடர்பு விவரங்களைப் பயன்படுத்துங்கள். LocalWork செய்தி அனுப்பாது.",
"Log in as a customer to request a booking.":"முன்பதிவு கோர வாடிக்கையாளராக உள்நுழையுங்கள்.", "Please complete your name, phone, address, and preferred date.":"பெயர், தொலைபேசி, முகவரி மற்றும் விரும்பும் தேதியை நிரப்புங்கள்.", "Choose today or a future date.":"இன்றைய தேதியையோ எதிர்காலத் தேதியையோ தேர்ந்தெடுக்கவும்.", "Demo booking saved in this browser. The workman was not notified.":"மாதிரி முன்பதிவு இந்த உலாவியில் சேமிக்கப்பட்டது. வேலைக்காரருக்கு அறிவிக்கப்படவில்லை.",
"No booking requests for this account yet. Requests made to fictional sample profiles will not appear here.":"இந்தக் கணக்கிற்கு இன்னும் முன்பதிவு கோரிக்கைகள் இல்லை. கற்பனை மாதிரி சுயவிவரங்களுக்கான கோரிக்கைகள் இங்கே தோன்றாது.", "Please complete all profile fields.":"சுயவிவரத்தின் அனைத்து புலங்களையும் நிரப்புங்கள்.", "Enter a valid phone number.":"சரியான தொலைபேசி எண்ணை உள்ளிடுங்கள்.", "Experience must be between 0 and 70 years.":"அனுபவம் 0 முதல் 70 ஆண்டுகளுக்குள் இருக்க வேண்டும்.", "Your demo profile has been updated.":"உங்கள் மாதிரி சுயவிவரம் புதுப்பிக்கப்பட்டது.", "Availability updated in demo mode.":"மாதிரி முறையில் கிடைக்கும் நிலை புதுப்பிக்கப்பட்டது.", "yrs exp.":"ஆண்டுகள் அனுபவம்", "profiles":"சுயவிவரங்கள்", "profile":"சுயவிவரம்", "No matching profiles yet":"பொருந்தும் சுயவிவரங்கள் இன்னும் இல்லை", "Try a different service or area. The demo data mainly uses Chennai neighbourhoods.":"வேறு சேவை அல்லது பகுதியை முயற்சிக்கவும். மாதிரி தரவு பெரும்பாலும் சென்னை பகுதிகளைப் பயன்படுத்துகிறது.",
"No rating yet":"இன்னும் மதிப்பீடு இல்லை", "years":"ஆண்டுகள்", "Results":"முடிவுகள்", "near":"அருகில்", "Welcome":"வரவேற்கிறோம்", "back":"மீண்டும்", "Find local help.":"உள்ளூர் உதவியைக் கண்டறியுங்கள்."
};
const originalTextNodes = new WeakMap();
const originalAttributes = new WeakMap();
function translateText(text) {
  if (currentLanguage !== "ta") return text;
  const trimmed = text.trim();
  if (languageText[trimmed]) return text.replace(trimmed, languageText[trimmed]);
  // Common dynamic interface messages containing a user's name or search terms.
  let result = text;
  result = result.replace(/^Welcome back, (.+)! Find local help\.$/, "மீண்டும் வரவேற்கிறோம், $1! உள்ளூர் உதவியைக் கண்டறியுங்கள்.");
  result = result.replace(/^Welcome! Find local help\.$/, "வரவேற்கிறோம்! உள்ளூர் உதவியைக் கண்டறியுங்கள்.");
  result = result.replace(/^Results for (.+) near (.+)$/, "முடிவுகள்: $1 சேவை, $2 அருகில்");
  result = result.replace(/^Results for (.+)$/, "முடிவுகள்: $1");
  result = result.replace(/^Results near (.+)$/, "$1 அருகிலுள்ள முடிவுகள்");
  result = result.replace(/^(\d+) profiles?$/, (_, n) => `${n} சுயவிவரங்கள்`);
  result = result.replace(/^(\d+) yrs exp\.$/, (_, n) => `${n} ஆண்டுகள் அனுபவம்`);
  result = result.replace(/^Requesting a booking with (.+) \((.+)\)\.$/, "$1 ($2) உடன் முன்பதிவு கோரப்படுகிறது.");
  result = result.replace(/^Register as a Customer$/, "வாடிக்கையாளராகப் பதிவு செய்");
  result = result.replace(/^Register as a Workman$/, "வேலைக்காரராகப் பதிவு செய்");
  return result;
}
function applyLanguage() {
  document.documentElement.lang = currentLanguage === "ta" ? "ta" : "en";
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    if (!node.parentElement || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(node.parentElement.tagName)) continue;
    if (!originalTextNodes.has(node)) originalTextNodes.set(node, node.nodeValue);
    const original = originalTextNodes.get(node);
    const translated = currentLanguage === "ta" ? translateText(original) : original;
    if (node.nodeValue !== translated) node.nodeValue = translated;
  }
  document.querySelectorAll("input[placeholder], textarea[placeholder], [aria-label], title").forEach(el => {
    ["placeholder", "aria-label", "title"].forEach(attr => {
      if (!el.hasAttribute(attr)) return;
      let values = originalAttributes.get(el);
      if (!values) { values = {}; originalAttributes.set(el, values); }
      if (!(attr in values)) values[attr] = el.getAttribute(attr);
      const original = values[attr];
      const translated = currentLanguage === "ta" ? translateText(original) : original;
      if (el.getAttribute(attr) !== translated) el.setAttribute(attr, translated);
    });
  });
  const selector = document.getElementById("language-switch");
  if (selector && selector.value !== currentLanguage) selector.value = currentLanguage;
}
function initLanguage() {
  const selector = document.getElementById("language-switch");
  if (selector) selector.addEventListener("change", () => {
    currentLanguage = selector.value === "ta" ? "ta" : "en";
    localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
    applyLanguage();
  });
  applyLanguage();
  let pending = false;
  const observer = new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; applyLanguage(); });
  });
  observer.observe(document.body, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:["placeholder", "aria-label", "title"]});
}

initLanguage();
init();
