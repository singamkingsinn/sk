const searchButton = document.querySelector('.form-button') || document.querySelector('.search-button');
const guestNameInput = document.getElementById('guestName');
const guestMobileInput = document.getElementById('guestMobile');
const guestCountInput = document.getElementById('guestCount');
const checkinDateInput = document.getElementById('checkinDate');
const checkoutDateInput = document.getElementById('checkoutDate');
const bookingConfirmation = document.getElementById('bookingConfirmation');
const bookRoomButton = document.querySelector('.book-room-button');
let availabilityConfirmed = false;

function showBookRoom() {
 if (bookingConfirmation) {
   bookingConfirmation.classList.add('visible');
 }
}

function hideBookRoom() {
 if (bookingConfirmation) {
   bookingConfirmation.classList.remove('visible');
 }
}

function updateBookRoomVisibility() {
 const isValid = validateBookingFields();

 if (!isValid || !availabilityConfirmed) {
   availabilityConfirmed = false;
   hideBookRoom();
   return;
 }

 showBookRoom();
}

function validateBookingFields() {
 const guestName = guestNameInput ? guestNameInput.value.trim() : '';
 const guestMobile = guestMobileInput ? guestMobileInput.value.trim() : '';
 const guestCount = guestCountInput ? guestCountInput.value.trim() : '';
 const checkinDate = checkinDateInput ? checkinDateInput.value.trim() : '';
 const checkoutDate = checkoutDateInput ? checkoutDateInput.value.trim() : '';
 const cleanedMobile = guestMobile.replace(/\D/g, '');

 const isValid = Boolean(
   guestName &&
   guestMobile &&
   guestCount &&
   checkinDate &&
   checkoutDate &&
   cleanedMobile.length >= 10
 );

 if (searchButton) {
   searchButton.disabled = !isValid;
   searchButton.title = isValid ? 'Check availability' : 'Please complete all booking fields';
 }

 return isValid;
}

if (searchButton) {
 const originalText = searchButton.textContent;

 searchButton.addEventListener('click', () => {
   if (!validateBookingFields()) {
     availabilityConfirmed = false;
     hideBookRoom();
     return;
   }

   searchButton.textContent = 'Checking availability...';

   setTimeout(() => {
     searchButton.textContent = 'Availability confirmed';
     availabilityConfirmed = true;
     showBookRoom();

     setTimeout(() => {
       searchButton.textContent = originalText;
     }, 1600);
   }, 600);
 });
}

if (bookRoomButton) {
 bookRoomButton.addEventListener('click', () => {
   bookRoomButton.textContent = 'Booked';
   bookRoomButton.disabled = true;
   bookRoomButton.style.opacity = '1';
 });
}

[guestNameInput, guestMobileInput, guestCountInput, checkinDateInput, checkoutDateInput].forEach((field) => {
 if (field) {
   field.addEventListener('input', () => {
     updateBookRoomVisibility();
   });
   field.addEventListener('change', () => {
     updateBookRoomVisibility();
   });
 }
});

updateBookRoomVisibility();

const calendarPopover = document.getElementById('calendarPopover');
const monthSelect = document.querySelector('.calendar-month');
const yearSelect = document.querySelector('.calendar-year');
const dayGrid = document.querySelector('.calendar-days');
const prevButton = document.querySelector('.calendar-nav.prev');
const nextButton = document.querySelector('.calendar-nav.next');
const dateButtons = document.querySelectorAll('.date-trigger');
const dateFields = document.querySelectorAll('.date-field');

let activeDateType = 'checkin';
let activeDate = new Date(2026, 9, 12);

const monthNames = Array.from({ length: 12 }, (_, index) =>
  new Date(2024, index, 1).toLocaleString('en-US', { month: 'long' })
);

function formatHumanDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric'
  });
}

function formatHiddenDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function setSelectedDate(type, date) {
  const trigger = document.querySelector(`.date-trigger[data-date-type="${type}"]`);
  const hiddenInput = trigger?.closest('.field')?.querySelector('input[type="hidden"]');

  if (!trigger || !hiddenInput) return;

  trigger.textContent = formatHumanDate(date);
  hiddenInput.value = formatHiddenDate(date);
}

function syncSelectedState() {
  const selectedYear = activeDate.getFullYear();
  const selectedMonth = activeDate.getMonth();

  monthSelect.value = String(selectedMonth);
  yearSelect.value = String(selectedYear);

  const selectedDate = new Date(activeDate.getFullYear(), activeDate.getMonth(), activeDate.getDate());
  const days = [...dayGrid.children];

  days.forEach((dayButton) => {
    const buttonDate = dayButton.dataset.date;
    if (!buttonDate) return;

    const dateValue = new Date(buttonDate);
    const isSelected =
      dateValue.getFullYear() === selectedDate.getFullYear() &&
      dateValue.getMonth() === selectedDate.getMonth() &&
      dateValue.getDate() === selectedDate.getDate();

    dayButton.classList.toggle('selected', isSelected);
  });
}

function renderCalendar() {
  if (!calendarPopover || !monthSelect || !yearSelect || !dayGrid) return;

  const year = activeDate.getFullYear();
  const month = activeDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const totalDays = lastDay.getDate();

  monthSelect.innerHTML = monthNames
    .map((name, index) => `<option value="${index}">${name}</option>`)
    .join('');

  yearSelect.innerHTML = Array.from({ length: 11 }, (_, i) => year - 5 + i)
    .map((value) => `<option value="${value}">${value}</option>`)
    .join('');

  monthSelect.value = String(month);
  yearSelect.value = String(year);

  dayGrid.innerHTML = '';

  for (let i = 0; i < startOffset; i += 1) {
    const blank = document.createElement('button');
    blank.type = 'button';
    blank.className = 'empty';
    blank.disabled = true;
    dayGrid.appendChild(blank);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(year, month, day);
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = String(day);
    button.dataset.date = formatHiddenDate(date);
    button.addEventListener('click', () => {
      const chosenDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      activeDate = chosenDate;
      setSelectedDate(activeDateType, chosenDate);
      calendarPopover.classList.remove('open');
    });

    const currentSelected = document.querySelector(`.date-trigger[data-date-type="${activeDateType}"]`);
    const hiddenSelected = currentSelected?.closest('.field')?.querySelector('input[type="hidden"]');
    if (hiddenSelected && hiddenSelected.value === formatHiddenDate(date)) {
      button.classList.add('selected');
    }

    dayGrid.appendChild(button);
  }
}

function openCalendar(button) {
  activeDateType = button.dataset.dateType || 'checkin';
  const hiddenInput = button.closest('.field')?.querySelector('input[type="hidden"]');
  if (hiddenInput && hiddenInput.value) {
    const [year, month, day] = hiddenInput.value.split('-').map(Number);
    activeDate = new Date(year, month - 1, day);
  }

  renderCalendar();
  const rect = button.getBoundingClientRect();
  const popWidth = 420;
  const left = Math.min(
    Math.max(16, rect.left + rect.width / 2 - popWidth / 2),
    window.innerWidth - popWidth - 16
  );
  const top = Math.min(Math.max(16, rect.bottom + 16), window.innerHeight - 340);

  calendarPopover.style.left = `${left}px`;
  calendarPopover.style.top = `${top}px`;
  calendarPopover.classList.add('open');
  calendarPopover.setAttribute('aria-hidden', 'false');
}

function closeCalendar() {
  calendarPopover.classList.remove('open');
  calendarPopover.setAttribute('aria-hidden', 'true');
}

if (dateButtons.length) {
  dateButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openCalendar(button);
    });

    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
    });
  });
}

if (dateFields.length) {
  dateFields.forEach((field) => {
    field.addEventListener('click', (event) => {
      if (event.target.closest('.date-trigger')) {
        return;
      }
      const trigger = field.querySelector('.date-trigger');
      if (trigger) {
        event.preventDefault();
        openCalendar(trigger);
      }
    });
  });
}

if (prevButton) {
  prevButton.addEventListener('click', () => {
    activeDate = new Date(activeDate.getFullYear(), activeDate.getMonth() - 1, 1);
    renderCalendar();
  });
}

if (nextButton) {
  nextButton.addEventListener('click', () => {
    activeDate = new Date(activeDate.getFullYear(), activeDate.getMonth() + 1, 1);
    renderCalendar();
  });
}

if (monthSelect) {
  monthSelect.addEventListener('change', (event) => {
    activeDate = new Date(activeDate.getFullYear(), Number(event.target.value), 1);
    renderCalendar();
  });
}

if (yearSelect) {
  yearSelect.addEventListener('change', (event) => {
    activeDate = new Date(Number(event.target.value), activeDate.getMonth(), 1);
    renderCalendar();
  });
}

document.addEventListener('click', (event) => {
  const clickedInsideCalendar = event.target.closest('.calendar-popover');
  const clickedDateTrigger = event.target.closest('.date-trigger');
  const clickedDateField = event.target.closest('.date-field');
  if (!clickedInsideCalendar && !clickedDateTrigger && !clickedDateField) {
    closeCalendar();
  }
});

setSelectedDate('checkin', new Date(2026, 9, 12));
setSelectedDate('checkout', new Date(2026, 9, 15));
renderCalendar();
