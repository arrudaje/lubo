import { remoteConfig } from "./index.js";
import { fetchAndActivate, getBoolean } from "firebase/remote-config";

const getFlag = (flag) => getBoolean(remoteConfig, flag);

fetchAndActivate(remoteConfig).then(() => {
    const natal = document.getElementById("natal");
    const natal_mobile = document.getElementById("natal_mobile");
    if (getFlag('NATAL_2025')) {
        natal.classList.remove("hidden");
        natal_mobile.classList.remove("hidden");
    }
});