document.addEventListener('DOMContentLoaded', () => {
  const selectUserForm = document.getElementById('select-user-form');
  const userSelect = document.getElementById('user-select');
  const availableTimesList = document.getElementById('available-times-list');
  const myAvailableTimesList = document.getElementById('my-available-times-list');
  const proposedMatchesList = document.getElementById('proposed-matches-list');
  const usernameSpan = document.getElementById('username'); // Benutzername anzeigen
  const logoutButton = document.getElementById('logout-button'); // Abmelde-Button
  const token = localStorage.getItem('token');

  // currentUser aus dem Local Storage laden
  let currentUser = JSON.parse(localStorage.getItem('currentUser'));

  // Überprüfe, ob currentUser vorhanden ist
  if (!currentUser) {
    alert('Bitte melde dich an, um fortzufahren.');
    window.location.href = '/login.html';
    return;
  }

  // Benutzername anzeigen
  if (usernameSpan) {
    usernameSpan.textContent = currentUser.username;
  }

  // Benutzerliste abrufen
  fetch('/auth/users', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
    .then(response => response.json())
    .then(users => {
      users.forEach(user => {
        if (user.id !== currentUser.id) { // Eigene ID ausschließen
          const option = document.createElement('option');
          option.value = user.id;
          option.textContent = user.username;
          userSelect.appendChild(option);
        }
      });
    })
    .catch(error => console.error('Fehler beim Abrufen der Benutzer:', error));

  // Verfügbare Zeiten abrufen und anzeigen
  selectUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = userSelect.value;

    const response = await fetch(`/matches/available-times/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      displayAvailableTimes(data);
    } else {
      alert('Fehler beim Abrufen der Zeiten');
    }
  });

  // Verfügbare Zeiten anzeigen
  function displayAvailableTimes(times) {
    availableTimesList.innerHTML = ''; // Liste leeren

    if (times.length === 0) {
      availableTimesList.innerHTML = '<p>Keine verfügbaren Zeiten gefunden.</p>';
      return;
    }

    times.forEach(time => {
      const slots = splitInto30MinSlots(time.start_time, time.end_time); // Zeitslots aufteilen
      slots.forEach(slot => {
        const timeElement = document.createElement('div');
        timeElement.className = 'time-slot';
        timeElement.innerHTML = `
          <p>${formatDate(slot.start)} - ${formatDate(slot.end)}</p>
          <button onclick="selectTimeSlot(${time.user_id}, '${slot.start}', '${slot.end}')">Auswählen</button>
        `;
        availableTimesList.appendChild(timeElement);
      });
    });
  }

  // Eigene verfügbare Zeiten abrufen und anzeigen
  fetchMyAvailableTimes();

  async function fetchMyAvailableTimes() {
    const response = await fetch('/matches/my-available-times', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      displayMyAvailableTimes(data);
    } else {
      console.error('Fehler beim Abrufen der eigenen Zeiten:', data.error);
    }
  }

  // Eigene verfügbare Zeiten anzeigen
  function displayMyAvailableTimes(times) {
    myAvailableTimesList.innerHTML = ''; // Liste leeren

    if (times.length === 0) {
      myAvailableTimesList.innerHTML = '<p>Keine eigenen verfügbaren Zeiten gefunden.</p>';
      return;
    }

    // Zeiten nach Datum sortieren
    times.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    times.forEach(time => {
      const timeElement = document.createElement('div');
      timeElement.className = 'time-slot';
      timeElement.innerHTML = `
        <p>${formatDate(time.start_time)} - ${formatDate(time.end_time)}</p>
        <button onclick="deleteTimeSlot(${time.id})">Löschen</button>
      `;
      myAvailableTimesList.appendChild(timeElement);
    });
  }

  // Zeit löschen
  window.deleteTimeSlot = async (timeId) => {
    const response = await fetch(`/matches/available-times/${timeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      alert('Zeit erfolgreich gelöscht!');
      fetchMyAvailableTimes(); // Liste aktualisieren
    } else {
      alert(data.error || 'Fehler beim Löschen der Zeit');
    }
  };

  // Vorgeschlagene Termine abrufen und anzeigen
  fetchProposedMatches();

  async function fetchProposedMatches() {
    const response = await fetch('/matches/proposed-matches', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      displayProposedMatches(data);
    } else {
      console.error('Fehler beim Abrufen der vorgeschlagenen Termine:', data.error);
    }
  }

  // Vorgeschlagene Termine anzeigen
  function displayProposedMatches(matches) {
    proposedMatchesList.innerHTML = ''; // Liste leeren

    if (matches.length === 0) {
      proposedMatchesList.innerHTML = '<p>Keine vorgeschlagenen Termine gefunden.</p>';
      return;
    }

    matches.forEach(match => {
      const matchElement = document.createElement('div');
      matchElement.className = 'proposed-match';
      matchElement.innerHTML = `
        <p>${match.opponent_username}: ${formatDate(match.proposed_time)}</p>
        <button onclick="acceptMatch(${match.id})">Annehmen</button>
        <button onclick="rejectMatch(${match.id})">Ablehnen</button>
      `;
      proposedMatchesList.appendChild(matchElement);
    });
  }

  // Abmelde-Button
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/login.html';
    });
  }
});

// Hilfsfunktion: Zeitslots in 30-Minuten-Intervalle aufteilen
function splitInto30MinSlots(startTime, endTime) {
  const slots = [];
  let start = new Date(startTime);
  const end = new Date(endTime);

  while (start < end) {
    const slotEnd = new Date(start.getTime() + 30 * 60000); // 30 Minuten hinzufügen
    if (slotEnd > end) break; // Falls das Ende überschritten wird

    slots.push({ start: start.toISOString(), end: slotEnd.toISOString() });
    start = slotEnd;
  }

  return slots;
}

// Hilfsfunktion: Datum formatieren
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
