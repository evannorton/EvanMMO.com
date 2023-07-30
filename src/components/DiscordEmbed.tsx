interface Props {}

const DiscordEmbed: React.FC<Props> = () => {
  return (
    <iframe
      style={{ border: "none", borderRadius: "0.5rem", height: "30rem" }}
      src="https://discordapp.com/widget?id=543159733821898773&theme=dark"
      width="100%"
      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
    />
  );
};

export default DiscordEmbed;
