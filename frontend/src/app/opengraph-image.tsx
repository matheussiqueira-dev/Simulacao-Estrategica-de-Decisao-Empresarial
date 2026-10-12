import { renderShareImage } from "./share-image";

export const alt = "Business Decision Simulator: simulador de decisões de negócio, por Matheus Siqueira";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderShareImage();
}
