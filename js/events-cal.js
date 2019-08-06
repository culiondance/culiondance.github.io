/* via https://kb.zensoft.hu/javascript-to-display-a-public-google-calendar-as-a-list-on-your-website/


*This solution makes use of "simple access" to google, providing only an API Key.
* This way we can only get access to public calendars. To access a private calendar,
* we would need to use OAuth 2.0 access.
*
* "Simple" vs. "Authorized" access: https://developers.google.com/api-client-library/javascript/features/authentication
* Examples of "simple" vs OAuth 2.0 access: https://developers.google.com/api-client-library/javascript/samples/samples#authorizing-and-making-authorized-requests
*
* We will make use of "Option 1: Load the API discovery document, then assemble the request."
* as described in https://developers.google.com/api-client-library/javascript/start/start-js
*/
function printCalendar() {
  // The "Calendar ID" from your calendar settings page, "Calendar Integration" secion:
  var calendarId = 'columbiauniversityliondance@gmail.com';

  // 1. Create a project using google's wizard: https://console.developers.google.com/start/api?id=calendar
  // 2. Create credentials:
  //    a) Go to https://console.cloud.google.com/apis/credentials
  //    b) Create Credentials / API key
  //    c) Since your key will be called from any of your users' browsers, set "Application restrictions" to "None",
  //       leave "Website restrictions" blank; you may optionally set "API restrictions" to "Google Calendar API"
  var apiKey = 'AIzaSyBTv65C0AHNmDQH4YTWV7tGDYagdw9r8CE';
  // You can get a list of time zones from here: http://www.timezoneconverter.com/cgi-bin/zonehelp
  var userTimeZone = "America/New York";
  var today = new Date();

  /* UNUSED VARIABLES
  var yearStart = new Date(today.getFullYear(), 0, 1); // grabs first day of year
  var pastInterval = new Date(today.getFullYear(), today.getMonth() - 3, 1); // grabs 1st of three months ago
  var upcoming = [];
  var past = [];
  */

  // Initializes the client with the API key and the Translate API.
  gapi.client.init({
    'apiKey': apiKey,
    // Discovery docs docs: https://developers.google.com/api-client-library/javascript/features/discovery
    'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
  }).then(function () {

    // Use Google's "apis-explorer" for research: https://developers.google.com/apis-explorer/#s/calendar/v3/
    // Events: list API docs: https://developers.google.com/calendar/v3/reference/events/list
    return gapi.client.calendar.events.list({
      'calendarId': calendarId,
      'timeZone': userTimeZone,
      'singleEvents': true,
      'timeMin': today.toISOString(), // gathers only events not happened yet
      'maxResults': 10,
      'orderBy': 'startTime'
    });

  }).then(function (response) {
    if (response.result.items) {

      /* UNUSED CODE -- splitting date string to compare month
      dateTimeSplit = entry.start.dateTime.split('-');
      console.log(dateTimeSplit);
      if (today.getMonth() > parseInt(dateTimeSplit[1]))
        console.log("lol");

      UNUSED VARIABLES
      var dateTimeSplit = [];
      var i = 0;
      */

      var calendarEntries = ['<table><tbody>']; //enter beginning tag of whatever will hold actual entries
      var dateFormat = "L"; // just more semantic for moment calls because i'm fool
      var timeFormat = "LT";

      response.result.items.forEach(function(entry) { // iterates through all events and formats

      /* UNUSED CODE -- sorting events into past/upcoming. kind of broken/hacky
      if (entry.start.date) { // handle full day events
        dateTimeSplit = entry.start.date.split('-');
        if (today.getMonth() > dateTimeSplit[1]) { // event has passed, today's month is larger than events'
          past[i] = entry;
          console.log(i);
        } else {upcoming[i] = entry;}
          i++;
      } else {
        dateTimeSplit = entry.start.dateTime.split('-');
        if (today.getMonth() > dateTimeSplit[1]) { // event has passed, today's month is larger than events'
          past[i] = entry;
          console.log(i);
        } else {upcoming[i] = entry;}
          i++;
      }
      console.log(past);
      console.log(upcoming);
      */

        if (!entry.start.dateTime) { // handle full day events
          var startsAt = moment(entry.start.date).format(dateFormat);
          var endsAt = moment(entry.end.date).format(dateFormat);

          calendarEntries.push(
            `<tr><td class="event-time">${startsAt} - ${endsAt}</td></tr>
            <tr><td class="event-sum">${entry.summary}</td></tr>`);
        } else { // events with time
          var startsAt = moment(entry.start.dateTime).format(dateFormat) + ' ' + moment(entry.start.dateTime).format(timeFormat);
          if (moment(entry.start.dateTime).format(dateFormat) != moment(entry.end.dateTime).format(dateFormat)) { // handle multiple day events
            var endsAt = moment(entry.end.dateTime).format(dateFormat) + ' ' + moment(entry.end.dateTime).format(timeFormat);
          } else {var endsAt = moment(entry.end.dateTime).format(timeFormat);}

          calendarEntries.push(
            `<tr><td class="event-time">${startsAt} - ${endsAt}</td></tr>
            <tr><td class="event-sum">${entry.summary}</td></tr>`);
        }
      });
      calendarEntries.push('</tbody></table>');
      document.getElementById('events-list-id').insertAdjacentHTML('beforeend',calendarEntries.join(""));
    }
  }, function (reason) {
    console.log('Error: ' + reason.result.error.message);
  });
};

// Loads the JavaScript client library and invokes `start` afterwards.
gapi.load('client', printCalendar);