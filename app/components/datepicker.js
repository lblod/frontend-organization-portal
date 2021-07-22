import Component from '@glimmer/component';

export default class DatepickerComponent extends Component {
  get datePickerLocalization() {
    return {
      buttonLabel: 'Kies een datum',
      selectedDateMessage: 'De geselecteerde datum is',
      prevMonthLabel: 'Vorige maand',
      nextMonthLabel: 'Volgende maand',
      monthSelectLabel: 'Maand',
      yearSelectLabel: 'Jaar',
      closeLabel: 'Sluit venster',
      keyboardInstruction: 'Gebruik de pijltjestoetsen om te navigeren',
      calendarHeading: 'Kies een datum',
      dayNames: getLocalizedDays(),
      monthNames: getLocalizedMonths(),
      monthNamesShort: getLocalizedMonths('short'),
    };
  }
}

function getLocalizedMonths(monthFormat = 'long') {
  let someYear = 2021;
  return [...Array(12).keys()].map((monthIndex) => {
    let date = new Date(someYear, monthIndex);
    return intl({ month: monthFormat }).format(date);
  });
}

function getLocalizedDays(weekdayFormat = 'long') {
  let someSunday = new Date('2021-01-03');
  return [...Array(7).keys()].map((index) => {
    let weekday = new Date(someSunday.getTime());
    weekday.setDate(someSunday.getDate() + index);
    return intl({ weekday: weekdayFormat }).format(weekday);
  });
}

function intl(options) {
  return new Intl.DateTimeFormat('nl-BE', options);
}
