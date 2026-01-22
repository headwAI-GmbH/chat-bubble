/**
 * German translations for the chat bubble widget
 * Supports both de-DE (Germany) and de-AT (Austria) locales
 */

export default {
  chat: {
    header: {
      title: 'HeadwAI Chat Bubble',
      newChat: 'Neuen Chat starten',
      downloadHistory: 'Chat-Verlauf herunterladen',
      showInfo: 'Informationen anzeigen',
      closeChat: 'Chat schließen',
    },
    content: {
      placeholder: 'Geben Sie hier Ihre Fragen ein',
      initialMessage: 'Hallo, wie kann ich Ihnen helfen?',
      feedback: {
        positive: 'Gute Antwort',
        negative: 'Schlechte Antwort',
      },
    },
    disclaimer: {
      title: 'Nutzungs<strong>bedingungen</strong>',
      message: `<p>Durch die Nutzung dieses Chats stimmen Sie zu:</p>
<ul>
  <li><strong>Datenschutz:</strong> Ihre Daten sind geschützt</li>
  <li><strong>Nutzung:</strong> Verantwortungsvoller Umgang</li>
  <li>Siehe <a href="/nutzungsbedingungen">vollständige Bedingungen</a></li>
</ul>`,
      accept: 'Akzeptieren',
      decline: 'Ablehnen',
    },
    info: {
      title: 'Informationen',
      message: `<h4>Datenschutzhinweis</h4>
<p>Dieser Chat verwendet <strong>KI-Technologie</strong>. Wichtige Punkte:</p>
<ul>
  <li>Nachrichten werden für <em>KI-Antworten</em> verarbeitet</li>
  <li>Siehe unsere <a href="/datenschutz">Datenschutzrichtlinie</a></li>
  <li>Verwenden Sie nur <code>sichere Verbindungen</code></li>
</ul>
<blockquote>Ihr Datenschutz ist unsere Priorität</blockquote>`,
    },
  },
};
