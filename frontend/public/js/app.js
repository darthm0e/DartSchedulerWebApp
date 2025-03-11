// frontend/public/js/app.js
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const availableTimesForm = document.getElementById('available-times-form');
  const proposeMatchForm = document.getElementById('propose-match-form');
  const logoutButton = document.getElementById('logout-button');
  const usernameSpan = document.getElementById('username');

  let currentUser = null;

  // Token aus dem Local Storage laden
  const token = localStorage.getItem('token');
  if (token) {
    fetchUserData(token);
  }

  // Benutzerdaten abrufen
async function fetchUserData(token) {
  try {
    const response = await fetch('/auth/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const user = await response.json();
      currentUser = user; // Setze currentUser
      localStorage.setItem('currentUser', JSON.stringify(user)); // Speichere currentUser im Local Storage
      if (usernameSpan) {
        usernameSpan.textContent = user.username;
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/login.html';
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Benutzerdaten:', error);
  }
}
  // Abmeldung
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/login.html';
    });
  }

  // Registrierung
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('register-username').value;
      const password = document.getElementById('register-password').value;

      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Registrierung erfolgreich! Bitte einloggen.');
        window.location.href = '/login.html';
      } else {
        alert(data.error || 'Fehler bei der Registrierung');
      }
    });
  }

  // Anmeldung
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;

      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        await fetchUserData(data.token);
        alert('Anmeldung erfolgreich!');
        window.location.href = '/dashboard.html';
      } else {
        alert(data.error || 'Fehler bei der Anmeldung');
      }
    });
  }

  // Verfügbare Zeiten eintragen
  if (availableTimesForm) {
    availableTimesForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const startTime = document.getElementById('start-time').value;
      const endTime = document.getElementById('end-time').value;

      const token = localStorage.getItem('token');
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
      const player2Id = document.getElementById('player2-id').value;
      const proposedTime = document.getElementById('proposed-time').value;

      const token = localStorage.getItem('token');
      const response = await fetch('/matches/propose-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ player1Id: currentUser.id, player2Id, proposedTime }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Match erfolgreich vorgeschlagen!');
      } else {
        alert(data.error || 'Fehler beim Vorschlagen des Matches');
      }
    });
  }
});
