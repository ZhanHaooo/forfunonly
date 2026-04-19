// auth.js — anonymous Firebase auth with username picker
// Requires: firebase-config.js + Firebase App/Auth/Database SDKs loaded first

(function () {
  const s = document.createElement('style');
  s.textContent = `
    #auth-modal{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center}
    .auth-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.85)}
    .auth-box{position:relative;background:#1a1a1a;border:2px solid #4ade80;border-radius:12px;padding:36px 28px;display:flex;flex-direction:column;align-items:center;gap:16px;min-width:300px;max-width:90vw;text-align:center}
    .auth-box h2{color:#4ade80;font-size:1.8rem;letter-spacing:4px;text-transform:uppercase;font-family:inherit}
    .auth-box .auth-sub{color:#aaa;font-size:.9rem}
    .auth-input{background:#111;border:2px solid #333;border-radius:8px;color:#eee;font-size:1.1rem;padding:10px 16px;outline:none;width:100%;text-align:center;font-family:inherit}
    .auth-input:focus{border-color:#4ade80}
    .auth-input.shake{animation:authShake .4s}
    .auth-go-btn{background:#4ade80;color:#111;border:none;border-radius:8px;padding:12px 0;font-size:1.1rem;font-weight:700;cursor:pointer;width:100%;font-family:inherit;letter-spacing:1px}
    .auth-go-btn:hover{background:#22c55e}
    .auth-hint{color:#444;font-size:.75rem}
    @keyframes authShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
  `;
  document.head.appendChild(s);
})();

var currentUser = null;
var _authQueue  = [];

function onAuthReady(cb) {
  if (currentUser) { cb(currentUser); return; }
  _authQueue.push(cb);
}

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    firebase.database().ref('users/' + user.uid).get().then(function (snap) {
      var data = snap.val() || {};
      currentUser = { uid: user.uid, username: data.username || 'Player' };
      _flushAuth();
    });
  } else {
    _showPicker(function (username) {
      firebase.auth().signInAnonymously().then(function (cred) {
        var uid = cred.user.uid;
        return firebase.database().ref('users/' + uid).set({ username: username }).then(function () {
          currentUser = { uid: uid, username: username };
          _flushAuth();
        });
      }).catch(function (err) { console.error('Auth error:', err); });
    });
  }
});

function _flushAuth() {
  _updateBadge();
  _authQueue.splice(0).forEach(function (cb) { cb(currentUser); });
}

function _updateBadge() {
  var el = document.getElementById('player-badge');
  if (el && currentUser) el.textContent = '👤 ' + currentUser.username;
}

function _showPicker(onSubmit) {
  var modal = document.createElement('div');
  modal.id = 'auth-modal';
  modal.innerHTML =
    '<div class="auth-backdrop"></div>' +
    '<div class="auth-box">' +
      '<h2>🕹 Arcade</h2>' +
      '<p class="auth-sub">Choose your player name</p>' +
      '<input class="auth-input" id="auth-name-input" type="text" maxlength="20" placeholder="Enter username…" autocomplete="off" spellcheck="false" />' +
      '<button class="auth-go-btn" id="auth-submit-btn">LET\'S PLAY</button>' +
      '<p class="auth-hint">No account needed — just pick a name!</p>' +
    '</div>';
  document.body.appendChild(modal);

  var input = modal.querySelector('#auth-name-input');
  var btn   = modal.querySelector('#auth-submit-btn');
  setTimeout(function () { input.focus(); }, 50);

  function submit() {
    var name = input.value.trim().replace(/[<>"&]/g, '').slice(0, 20);
    if (!name) {
      input.classList.add('shake');
      setTimeout(function () { input.classList.remove('shake'); }, 400);
      return;
    }
    modal.remove();
    onSubmit(name);
  }

  btn.addEventListener('click', submit);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });
}
