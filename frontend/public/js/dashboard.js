document.addEventListener('DOMContentLoaded', () => {
  const availableTimesForm = document.getElementById('available-times-form');
  const proposeMatchForm = document.getElementById('propose-match-form');
  const playerSelect = document.getElementById('player-select');
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

  // Benutzerliste abrufen und Dropdown-Menü füllen
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
          playerSelect.appendChild(option);
        }
      });
    })
    .catch(error => console.error('Fehler beim Abrufen der Benutzer:', error));

  // Verfügbare Zeiten eintragen
  if (availableTimesForm) {
    availableTimesForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const startTime = document.getElementById('start-time').value;
      const endTime = document.getElementById('end-time').value;

      const response = await fetch('/matches/available-times', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: currentUser.id, startTime, endTime }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Zeiten erfolgreich gespeichert!');
      } else {
        alert(data.error || 'Fehler beim Speichern der Zeiten');
      }
    });
  }

  // Match vorschlagen
  if (proposeMatchForm) {
    proposeMatchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const playerId = playerSelect.value;
      const proposedTime = document.getElementById('proposed-time').value;

      const response = await fetch('/matches/propose-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ player1Id: currentUser.id, player2Id: playerId, proposedTime }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Match erfolgreich vorgeschlagen!');
      } else {
        alert(data.error || 'Fehler beim Vorschlagen des Matches');
      }
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
