(() => {
    function formatDate(date = new Date()) {
        return date.toISOString().split('T')[0];
    }

    function formatDateTime(date = new Date()) {
        return date.toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
        });
    }

    function sanitize(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function extractFormattedContent() {
        const turns = document.querySelectorAll('article[data-turn-id], div[data-turn-id]');
        let html = '';

        turns.forEach(turn => {
            const block = turn.querySelector('.markdown, .prose, .whitespace-pre-wrap');
            if (!block) return;

            const roleAttr = turn.querySelector('[data-message-author-role]');
            const senderRaw = roleAttr?.getAttribute('data-message-author-role') === 'assistant' ? 'ChatGPT' : 'You';
            const isAssistant = senderRaw === 'ChatGPT';

            const clone = block.cloneNode(true);

            let timestamp = '';
            const timeContainer = turn.querySelector('div[title]');
            if (timeContainer && timeContainer.title) {
                timestamp = timeContainer.title;
            } else {
                timestamp = formatDateTime();
            }

            clone.querySelectorAll('button').forEach(btn => btn.remove());
            clone.querySelectorAll('img, canvas').forEach(el => {
                el.replaceWith('[Image or Canvas]');
            });

            clone.querySelectorAll('pre').forEach(pre => {
                const code = sanitize(pre.textContent);
                pre.innerHTML = `<code>${code}</code>`;
            });

            const cleanHTML = clone.innerHTML;

            html += `
                <div class="bubble-wrapper ${isAssistant ? 'left' : 'right'}">
                    <div class="bubble ${isAssistant ? 'assistant' : 'user'}">
                        <div class="sender">${senderRaw}</div>
                        <div class="timestamp">${timestamp}</div>
                        <div class="content">${cleanHTML}</div>
                    </div>
                </div>
            `;
        });

        return { html, count: turns.length };
    }

    const date = formatDate();
    const now = new Date();
    const fullDate = now.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const time = now.toLocaleTimeString('en-GB');
    const source = window.location.href;

    const { html: conversationHTML, count: messageCount } = extractFormattedContent();

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Chat Export – ${date}</title>
    <style>
        :root {
            --background: #f9fafb;
            --user-bubble: #dbeafe;
            --assistant-bubble: #ffffff;
            --text-color: #1f2937;
            --sender-color: #6b7280;
            --timestamp-color: #9ca3af;
            --code-bg: #f3f4f6;
            --meta-bg: #eef2f7;
        }

        body {
            font-family: "Segoe UI", system-ui, sans-serif;
            background-color: var(--background);
            color: var(--text-color);
            margin: 0;
            padding: 2rem;
            line-height: 1.6;
        }

        h1 {
            text-align: center;
            color: #111827;
            font-size: 1.75rem;
            margin-bottom: 0.25rem;
        }

        .meta {
            background: var(--meta-bg);
            border: 1px solid #d1d5db;
            padding: 1rem;
            margin: 1rem auto 2rem;
            border-radius: 8px;
            max-width: 600px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            font-size: 0.95rem;
            color: #374151;
            text-align: center;
        }

        .meta div {
            margin: 0.25rem 0;
        }

        .meta button {
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background-color: #2563eb;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        }

        .meta button:hover {
            background-color: #1d4ed8;
        }

        .bubble-wrapper {
            display: flex;
            justify-content: flex-start;
            margin: 1rem 0;
        }

        .bubble-wrapper.right {
            justify-content: flex-end;
        }

        .bubble {
            padding: 1rem 1.25rem;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            max-width: 100%;
            word-wrap: break-word;
        }

        .bubble.user {
            background-color: var(--user-bubble);
            text-align: left;
            max-width: 70%;
        }

        .bubble.assistant {
            background-color: var(--assistant-bubble);
            text-align: left;
            max-width: 100%;
        }

        .sender {
            font-weight: 600;
            font-size: 0.85rem;
            margin-bottom: 0.3rem;
            color: var(--sender-color);
        }

        .timestamp {
            font-size: 0.75rem;
            color: var(--timestamp-color);
            margin-bottom: 0.5rem;
        }

        .content {
            font-size: 1rem;
        }

        pre {
            background: var(--code-bg);
            padding: 1rem;
            overflow-x: auto;
            border-radius: 6px;
            font-family: "Courier New", monospace;
            font-size: 0.9rem;
            margin-top: 1rem;
            white-space: pre-wrap;
        }

        code {
            white-space: pre-wrap;
        }

        a {
            color: #2563eb;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            font-size: 0.95rem;
        }

        table thead {
            background-color: #f0f0f0;
        }

        table, th, td {
            border: 1px solid #ccc;
        }

        th, td {
            padding: 8px 12px;
            text-align: left;
        }
    </style>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
</head>
<body>
    <h1>Chat Transcript – Export</h1>
    <div class="meta">
        <div><strong>Date:</strong> ${fullDate}</div>
        <div><strong>Time:</strong> ${time}</div>
        <div><strong>Messages:</strong> ${messageCount}</div>
        <div><strong>Source URL:</strong> <a href="${source}" target="_blank">${source}</a></div>
        <button onclick="downloadPNG()">📸 Download as PNG</button>
    </div>
    <div id="chat-container">
        ${conversationHTML}
    </div>

    <script>
        function downloadPNG() {
            const container = document.getElementById('chat-container');
            setTimeout(() => {
                html2canvas(container, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true
                }).then(canvas => {
                    const link = document.createElement('a');
                    link.download = 'chat-export-${date}.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                }).catch(err => {
                    alert('Gagal membuat PNG: ' + err.message);
                });
            }, 500);
        }

        window.onload = () => {
            window.print();
        };
    </script>
</body>
</html>
`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
})();
