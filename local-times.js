document.querySelectorAll("[data-local-time]").forEach((element) => {
  const value = element.getAttribute("data-local-time");
  if (!value) return;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return;
  const time = new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  element.textContent = `${time} ${localTimezoneLabel(date)}`;
});

function localTimezoneLabel(date = new Date()) {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const mapped = {
    "America/New_York": "ET",
    "America/Detroit": "ET",
    "America/Indiana/Indianapolis": "ET",
    "America/Kentucky/Louisville": "ET",
    "America/Chicago": "CT",
    "America/Winnipeg": "CT",
    "America/Denver": "MT",
    "America/Phoenix": "MT",
    "America/Los_Angeles": "PT",
    "America/Vancouver": "PT",
  }[zone];
  if (mapped) return mapped;
  return offsetTimezoneLabel(date);
}

function offsetTimezoneLabel(date = new Date()) {
  const minutes = -date.getTimezoneOffset();
  const sign = minutes >= 0 ? "+" : "-";
  const absolute = Math.abs(minutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
  const mins = String(absolute % 60).padStart(2, "0");
  return `UTC${sign}${hours}:${mins}`;
}
