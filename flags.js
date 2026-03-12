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
    const pascoa = document.getElementById("pascoa");
    const pascoa_mobile = document.getElementById("pascoa_mobile");
    if (getFlag('PASCOA_2026')) {
        pascoa.classList.remove("hidden");
        pascoa_mobile.classList.remove("hidden");
    }
});