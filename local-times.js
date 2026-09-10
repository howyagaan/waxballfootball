const TIME_ZONE_LABELS = {
  "America/New_York": "ET",
  "America/Detroit": "ET",
  "America/Indiana/Indianapolis": "ET",
  "America/Kentucky/Louisville": "ET",
  "America/Chicago": "CT",
  "America/Mexico_City": "CT",
  "America/Monterrey": "CT",
  "America/Winnipeg": "CT",
  "America/Denver": "MT",
  "America/Phoenix": "MT",
  "America/Edmonton": "MT",
  "America/Mazatlan": "MT",
  "America/Los_Angeles": "PT",
  "America/Tijuana": "PT",
  "America/Vancouver": "PT",
};
const EASTERN_TIME_ZONE = "America/New_York";

document.querySelectorAll("[data-local-time]").forEach((element) => {
  const value = element.getAttribute("data-local-time");
  if (!value) return;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return;
  const time = new Intl.DateTimeFormat(undefined, {
    timeZone: displayTimeZone(),
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  element.textContent = `${time} ${localTimezoneLabel()}`;
});

function localTimezoneLabel() {
  return TIME_ZONE_LABELS[displayTimeZone()] || "ET";
}

function displayTimeZone() {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  return TIME_ZONE_LABELS[zone] ? zone : EASTERN_TIME_ZONE;
}
