(() => {
  function formatDateTime(date = new Date()) {
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  function sanitizeText(text) {
    return text
      .replace(/\u00A0/g, " ")
      .replace(/\r/g, "")
      .replace(/\t/g, "    ")
      .trim();
  }

  function extractChatAsJSON() {
    const turns = document.querySelectorAll(
      "article[data-turn-id], div[data-turn-id]"
    );
    const chatData = [];

    turns.forEach((turn) => {
      const block = turn.querySelector(
        ".markdown, .prose, .whitespace-pre-wrap"
      );
      if (!block) return;

      const roleAttr = turn.querySelector("[data-message-author-role]");
      const sender =
        roleAttr?.getAttribute("data-message-author-role") === "assistant"
          ? "ChatGPT"
          : "You";

      let timestamp = "";
      const timeContainer = turn.querySelector("div[title]");
      if (timeContainer && timeContainer.title) {
        timestamp = timeContainer.title;
      } else {
        timestamp = formatDateTime();
      }

      const content = sanitizeText(block.textContent);
      if (!content) return;

      chatData.push({ sender, timestamp, content });
    });

    return chatData;
  }

  const json = extractChatAsJSON();
  const blob = new Blob([JSON.stringify(json, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "chat-export.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
})();
