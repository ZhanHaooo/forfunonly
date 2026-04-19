// chat.js — live chat panel
// Requires: auth.js (currentUser), Firebase Database SDK

(function () {
  var s = document.createElement('style');
  s.textContent =
    '#chat-panel{display:flex;flex-direction:column;height:100%;background:#0d0d0d}' +
    '#chat-header{padding:8px 12px;font-size:.68rem;letter-spacing:2px;color:#555;text-transform:uppercase;border-bottom:1px solid #1a1a1a;flex-shrink:0}' +
    '#chat-messages{flex:1;overflow-y:auto;padding:8px 12px;display:flex;flex-direction:column;gap:5px;min-height:0}' +
    '.chat-msg{font-size:.82rem;line-height:1.4}' +
    '.cm-name{color:#4ade80;font-weight:700;margin-right:4px}' +
    '.cm-text{color:#bbb;word-break:break-word}' +
    '#chat-input-row{display:flex;gap:6px;padding:8px;border-top:1px solid #1a1a1a;flex-shrink:0}' +
    '#chat-text{flex:1;background:#111;border:1px solid #2a2a2a;border-radius:6px;color:#eee;font-size:.82rem;padding:6px 10px;outline:none;font-family:inherit}' +
    '#chat-text:focus{border-color:#4ade80}' +
    '#chat-send-btn{background:#4ade80;color:#111;border:none;border-radius:6px;padding:6px 14px;font-weight:700;cursor:pointer;font-size:.82rem;flex-shrink:0;font-family:inherit}' +
    '#chat-send-btn:hover{background:#22c55e}';
  document.head.appendChild(s);
})();

function initChat(containerEl) {
  containerEl.innerHTML =
    '<div id="chat-panel">' +
      '<div id="chat-header">Live Chat</div>' +
      '<div id="chat-messages"></div>' +
      '<div id="chat-input-row">' +
        '<input id="chat-text" type="text" maxlength="200" placeholder="Say something…" autocomplete="off" />' +
        '<button id="chat-send-btn">Send</button>' +
      '</div>' +
    '</div>';

  var msgs  = containerEl.querySelector('#chat-messages');
  var input = containerEl.querySelector('#chat-text');
  var btn   = containerEl.querySelector('#chat-send-btn');

  firebase.database().ref('chat/messages').limitToLast(50).on('child_added', function (snap) {
    _appendMsg(msgs, snap.val());
  });

  function send() {
    if (!currentUser) return;
    var text = input.value.trim();
    if (!text) return;
    firebase.database().ref('chat/messages').push({
      uid:       currentUser.uid,
      username:  currentUser.username,
      text:      text.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });
    input.value = '';
  }

  btn.addEventListener('click', send);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
}

function _appendMsg(container, msg) {
  var d = document.createElement('div');
  d.className = 'chat-msg';
  d.innerHTML = '<span class="cm-name">' + _escChat(msg.username) + ':</span>' +
                '<span class="cm-text">' + msg.text + '</span>';
  container.appendChild(d);
  container.scrollTop = container.scrollHeight;
}

function _escChat(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
