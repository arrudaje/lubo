import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "./index.js";

const getSiteImage = async (name) =>
  getDownloadURL(ref(storage, `site/${name}.webp`));

const imgElements = Array.from(document.getElementsByTagName("img"));

imgElements.forEach(
  async (img) => img.id && (img.src = await getSiteImage(img.id))
);
