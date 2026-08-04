// @section: page-interactions
const $ = (id) => document.getElementById(id);

const form = $("calculatorForm");
const birthDate = $("birthDate");
const referenceDate = $("referenceDate");
const formMessage = $("formMessage");
const themeToggle = $("themeToggle");
const languageToggle = $("languageToggle");

const translations = {
  en: {
    locale: "en-US", direction: "ltr", brandTop: "Birthdate", brandBottom: "Calculator", homeAria: "Birthdate Calculator home",
    eyebrow: "Date & time utility", titleOne: "Find the time", titleTwo: "behind your story.",
    introCopy: "Enter a birth date to calculate an exact age, the next birthday milestone, and the number of days lived.",
    datesTitle: "Your dates", datesCopy: "Choose a birth date and optional reference date.", birthLabel: "Date of birth", required: "Required",
    referenceLabel: "Calculate as of", defaultToday: "Defaults to today", calculate: "Calculate age", useToday: "Use today",
    resultEyebrow: "Your result", resultsTitle: "Your time, measured.", selectDate: "Select a date to begin", years: "years", months: "months", days: "days",
    nextBirthday: "Next birthday", birthdayPlaceholder: "Your next milestone will appear here.", daysLived: "Days lived", daysPlaceholder: "A small number with a big story.",
    weekday: "Day of the week", weekdayPlaceholder: "Based on your date of birth.", footerOne: "Made for small moments of perspective.", footerTwo: "All calculations stay in your browser.",
    switchLanguage: "Switch to Arabic", languageLabel: "العربية", switchTheme: (dark) => `Switch to ${dark ? "light" : "dark"} mode`, themeLabel: (dark) => dark ? "Dark" : "Light",
    asOf: (date) => `As of ${date}`, missingBirth: "Please enter your date of birth to calculate your result.", invalidDate: "Your birth date needs to be on or before the calculation date.",
    birthdayToday: (age) => `It is your ${ordinal(age)} birthday — happy birthday!`, birthdayDays: (days, age) => `${days} ${days === 1 ? "day" : "days"} until you celebrate ${age}.`,
    livedDays: (days) => `${days.toLocaleString("en-US")} ${days === 1 ? "day" : "days"} of lived experience.`, bornOn: (date) => `You were born on ${date}.`
  },
  ar: {
    locale: "ar-EG", direction: "rtl", brandTop: "حاسبة", brandBottom: "تاريخ الميلاد", homeAria: "الصفحة الرئيسية لحاسبة تاريخ الميلاد",
    eyebrow: "أداة التاريخ والوقت", titleOne: "اكتشف الزمن", titleTwo: "الذي يصنع قصتك.",
    introCopy: "أدخل تاريخ الميلاد لحساب العمر بدقة، وموعد عيد الميلاد القادم، وعدد الأيام التي عشتها.",
    datesTitle: "تواريخك", datesCopy: "اختر تاريخ الميلاد وتاريخًا اختياريًا لإجراء الحساب.", birthLabel: "تاريخ الميلاد", required: "مطلوب",
    referenceLabel: "الحساب حتى تاريخ", defaultToday: "الافتراضي هو اليوم", calculate: "احسب العمر", useToday: "استخدم تاريخ اليوم",
    resultEyebrow: "نتيجتك", resultsTitle: "وقتك، محسوب بدقة.", selectDate: "اختر تاريخًا للبدء", years: "سنة", months: "شهر", days: "يوم",
    nextBirthday: "عيد الميلاد القادم", birthdayPlaceholder: "ستظهر محطتك القادمة هنا.", daysLived: "الأيام التي عشتها", daysPlaceholder: "رقم صغير يحمل قصة كبيرة.",
    weekday: "يوم الميلاد", weekdayPlaceholder: "بناءً على تاريخ ميلادك.", footerOne: "صُممت للحظات صغيرة من التأمل.", footerTwo: "تظل جميع الحسابات داخل متصفحك.",
    switchLanguage: "التبديل إلى الإنجليزية", languageLabel: "English", switchTheme: (dark) => `التبديل إلى الوضع ${dark ? "الفاتح" : "الداكن"}`, themeLabel: (dark) => dark ? "داكن" : "فاتح",
    asOf: (date) => `اعتبارًا من ${date}`, missingBirth: "يرجى إدخال تاريخ ميلادك لحساب النتيجة.", invalidDate: "يجب أن يكون تاريخ الميلاد في تاريخ الحساب أو قبله.",
    birthdayToday: (age) => `اليوم هو عيد ميلادك رقم ${age} — عيد ميلاد سعيد!`, birthdayDays: (days, age) => `باقي ${formatNumber(days)} ${days === 1 ? "يوم" : "أيام"} على عيد ميلادك رقم ${formatNumber(age)}.`,
    livedDays: (days) => `عشت ${formatNumber(days)} يومًا من التجارب.`, bornOn: (date) => `وُلدت في ${date}.`
  }
};

let language = localStorage.getItem("birthdate-language") || "en";
let lastCalculation = null;

function ordinal(number) {
  const lastTwo = number % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${number}th`;
  return `${number}${({ 1: "st", 2: "nd", 3: "rd" })[number % 10] || "th"}`;
}

function formatNumber(number) {
  return new Intl.NumberFormat(translations[language].locale).format(number);
}

const todayISO = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const parseLocalDate = (value) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
};

const formatDate = (date) => date.toLocaleDateString(translations[language].locale, { month: "long", day: "numeric", year: "numeric" });
const weekdayName = (date) => date.toLocaleDateString(translations[language].locale, { weekday: "long" });
const daysInMonth = (year, monthIndex) => new Date(year, monthIndex + 1, 0).getDate();

function getAgeParts(birth, reference) {
  let years = reference.getFullYear() - birth.getFullYear();
  let months = reference.getMonth() - birth.getMonth();
  let days = reference.getDate() - birth.getDate();
  if (days < 0) {
    months -= 1;
    const previousMonth = (reference.getMonth() + 11) % 12;
    const previousMonthYear = previousMonth === 11 ? reference.getFullYear() - 1 : reference.getFullYear();
    days += daysInMonth(previousMonthYear, previousMonth);
  }
  if (months < 0) { years -= 1; months += 12; }
  return { years, months, days };
}

function birthdayForYear(birth, year) {
  const month = birth.getMonth();
  return new Date(year, month, Math.min(birth.getDate(), daysInMonth(year, month)), 12);
}

function updateResults(birth, reference) {
  const t = translations[language];
  const age = getAgeParts(birth, reference);
  $("yearsValue").textContent = formatNumber(age.years);
  $("monthsValue").textContent = formatNumber(age.months);
  $("daysValue").textContent = formatNumber(age.days);
  $("resultReference").textContent = t.asOf(formatDate(reference));

  let nextBirthday = birthdayForYear(birth, reference.getFullYear());
  if (nextBirthday < reference) nextBirthday = birthdayForYear(birth, reference.getFullYear() + 1);
  const daysUntil = Math.round((nextBirthday - reference) / 86_400_000);
  const nextAge = nextBirthday.getFullYear() - birth.getFullYear();
  $("nextBirthdayValue").textContent = formatDate(nextBirthday);
  $("birthdayDetail").textContent = daysUntil === 0 ? t.birthdayToday(formatNumber(nextAge)) : t.birthdayDays(daysUntil, nextAge);

  const livedDays = Math.floor((reference - birth) / 86_400_000);
  $("daysLivedValue").textContent = formatNumber(livedDays);
  $("daysLivedDetail").textContent = t.livedDays(livedDays);
  $("weekdayValue").textContent = weekdayName(birth);
  $("birthDateDetail").textContent = t.bornOn(formatDate(birth));
}

function calculate() {
  const birthValue = birthDate.value;
  const referenceValue = referenceDate.value || todayISO();
  const t = translations[language];
  if (!birthValue) { formMessage.textContent = t.missingBirth; birthDate.focus(); return; }
  const birth = parseLocalDate(birthValue);
  const reference = parseLocalDate(referenceValue);
  if (birth > reference) { formMessage.textContent = t.invalidDate; birthDate.focus(); return; }
  formMessage.textContent = "";
  lastCalculation = { birth, reference };
  updateResults(birth, reference);
}

function applyLanguage(nextLanguage) {
  language = nextLanguage;
  const t = translations[language];
  document.documentElement.lang = language === "ar" ? "ar" : "en";
  document.documentElement.dir = t.direction;
  document.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = t[element.dataset.i18n]; });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => { element.setAttribute("aria-label", t[element.dataset.i18nAria]); });
  languageToggle.setAttribute("aria-label", t.switchLanguage);
  $("languageLabel").textContent = t.languageLabel;
  document.title = language === "ar" ? "حاسبة تاريخ الميلاد — العمر وعيد الميلاد القادم" : "Birthdate Calculator — Age, Next Birthday & Days Lived";
  setTheme(document.documentElement.dataset.theme || "dark");
  localStorage.setItem("birthdate-language", language);
  if (lastCalculation) updateResults(lastCalculation.birth, lastCalculation.reference);
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === "dark";
  const t = translations[language];
  themeToggle.setAttribute("aria-pressed", String(dark));
  themeToggle.setAttribute("aria-label", t.switchTheme(dark));
  themeToggle.querySelector(".toggle-icon").textContent = dark ? "☾" : "☀";
  themeToggle.querySelector(".toggle-label").textContent = t.themeLabel(dark);
  localStorage.setItem("birthdate-theme", theme);
}

form.addEventListener("submit", (event) => { event.preventDefault(); calculate(); });
$("todayButton").addEventListener("click", () => { referenceDate.value = todayISO(); calculate(); });
themeToggle.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
languageToggle.addEventListener("click", () => applyLanguage(language === "en" ? "ar" : "en"));

setTheme(localStorage.getItem("birthdate-theme") || "dark");
applyLanguage(language);
referenceDate.max = todayISO();
referenceDate.value = todayISO();
birthDate.max = todayISO();
