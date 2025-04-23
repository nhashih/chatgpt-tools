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

    function sanitizeMarkdown(text) {
        return text
            .replace(/[*_`]/g, '\\$&')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function extractMarkdownContent() {
        const turns = document.querySelectorAll('div[class*="group/conversation-turn"]');
        let markdown = '';

        turns.forEach(group => {
            const block = group.querySelector('.markdown, .prose, .whitespace-pre-wrap');
            if (!block) return;

            const senderRaw = block.classList.contains('markdown') ? 'ChatGPT' : 'You';
            const isAssistant = senderRaw === 'ChatGPT';
            const clone = block.cloneNode(true);

            let timestamp = '';
            const timeContainer = group.querySelector('div[class*="whitespace-pre-wrap"]');
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
                const code = sanitizeMarkdown(pre.textContent);
                pre.innerHTML = `\n\`\`\`\n${code}\n\`\`\`\n`;
            });

            const content = sanitizeMarkdown(clone.textContent.trim());

            markdown += `### ${senderRaw} – ${timestamp}\n\n${content}\n\n---\n\n`;
        });

        return markdown;
    }

    const markdownContent = extractMarkdownContent();
    const date = formatDate();

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-export-${date}.md`;
    link.click();
})();
