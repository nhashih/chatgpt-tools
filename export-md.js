(() => {
  function formatDate(date = new Date()) {
    return date.toISOString().split("T")[0];
  }

  function formatDateTime(date = new Date()) {
    return date.toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  function sanitizeMarkdown(text) {
    return text
      .replace(/[*_`]/g, "\\$&")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function extractMarkdownContent() {
    const articles = document.querySelectorAll("article[data-turn]");
    let markdown = "";
    let lastContent = "";

    articles.forEach((article) => {
      const role = article.getAttribute("data-turn");
      const sender = role === "assistant" ? "ChatGPT" : "You";
      const timestamp = formatDateTime();

      let contentBlock = article.querySelector(".whitespace-pre-wrap");

      if (!contentBlock && role === "assistant") {
        contentBlock = article.querySelector(".markdown");
      }

      if (!contentBlock) return;

      const clone = contentBlock.cloneNode(true);

      clone.querySelectorAll("button, svg").forEach((el) => el.remove());
      clone.querySelectorAll("img, canvas").forEach((el) => {
        el.replaceWith("[Image or Canvas]");
      });

      clone.querySelectorAll("pre").forEach((pre) => {
        const code = pre.textContent;
        pre.innerHTML = `\n\`\`\`\n${code}\n\`\`\`\n`;
      });

      const content = clone.textContent.trim();
      if (!content || content === lastContent) return;
      lastContent = content;

      markdown += `### ${sender} – ${timestamp}\n\n${content}\n\n---\n\n`;
    });

    return markdown;
  }

  const markdownContent = extractMarkdownContent();
  const date = formatDate();

  const blob = new Blob([markdownContent], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `chat-export-${date}.md`;
  link.click();
})();
