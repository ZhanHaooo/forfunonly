// leaderboard.js — live leaderboard + score submission
// Requires: auth.js (currentUser), Firebase Database SDK

function initLeaderboard(game, containerEl) {
  containerEl.innerHTML = '<div class="lb-empty">Loading…</div>';
  firebase.database()
    .ref('leaderboard/' + game)
    .orderByChild('score')
    .limitToLast(10)
    .on('value', function (snap) {
      var rows = [];
      snap.forEach(function (c) { rows.push(c.val()); });
      rows.sort(function (a, b) { return b.score - a.score; });
      _renderLb(containerEl, rows);
    });
}

function submitScore(game, score) {
  if (!currentUser || score <= 0) return;
  var ref = firebase.database().ref('leaderboard/' + game + '/' + currentUser.uid);
  ref.once('value').then(function (snap) {
    var prev = snap.val();
    if (!prev || score > prev.score) {
      ref.set({ uid: currentUser.uid, username: currentUser.username, score: score });
    }
  });
}

function _renderLb(el, rows) {
  if (!rows.length) {
    el.innerHTML = '<div class="lb-empty">No scores yet.<br>Be the first!</div>';
    return;
  }
  var medals = ['🥇', '🥈', '🥉'];
  el.innerHTML = rows.map(function (r, i) {
    var isYou = currentUser && r.uid === currentUser.uid;
    return '<div class="lb-entry' + (isYou ? ' lb-you' : '') + '">' +
      '<span class="lb-rank">' + (medals[i] || (i + 1)) + '</span>' +
      '<span class="lb-name">' + _esc(r.username) + '</span>' +
      '<span class="lb-score">' + r.score + '</span>' +
      '</div>';
  }).join('');
}

function _esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
