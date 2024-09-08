import { useEffect } from 'react';

declare global {
  interface Window {
    BotComponent: any; // You might want to type this more strictly if you have specific details for BotComponent.
  }
}

const BotContainer: React.FC = () => {
  useEffect(() => {
    // Ensure the BotComponent is available globally
    const loadBot = () => {
      if (window.BotComponent) {
        window.BotComponent.renderMyComponent('bot-container', {
          botId: "549616c5-052f-4145-929a-95d59f1023fb",
          botOpen: false,
          theme: 'emerald',
        });
      }
    };

    // Load the script dynamically if not already loaded
    const script = document.createElement('script');
    script.src = 'https://supbot.io/dist/bot.js';
    script.onload = loadBot;
    document.body.appendChild(script);

    return () => {
      // Cleanup script if necessary
      document.body.removeChild(script);
    };
  }, []);

  return <div id="bot-container"></div>;
};

export default BotContainer;
