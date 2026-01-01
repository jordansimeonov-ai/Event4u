export const clientsConfig: Record<string, {
    name: string;
    primaryColor: string;
    logo: string;
    welcomeMessage: string;
}> = {
  "starosel": {
    name: "СПА Комплекс Старосел",
    primaryColor: "#8b0000", // Dark Red (Wine)
    logo: "https://starosel.com/images/logo.png",
    welcomeMessage: "Добре дошли в магията на виното и траките!"
  },
  "yastrebec": {
    name: "Хотел Ястребец Уелнес и СПА",
    primaryColor: "#2E5D4B", // Forest Green
    logo: "https://www.hotelyastrebets.bg/assets/images/logo.png",
    welcomeMessage: "Изживейте магията на Рила планина!"
  },
  "sofia-grand": {
    name: "Гранд Хотел София",
    primaryColor: "#002366", // Royal Blue
    logo: "https://grandhotelsofia.bg/wp-content/themes/ghs/img/logo.svg",
    welcomeMessage: "Вашата персонализирана оферта е готова."
  },
  "demo": {
    name: "Demo Hotel",
    primaryColor: "#C5A059", // Gold
    logo: "",
    welcomeMessage: "Welcome to the Demo!"
  }
};
