import type { MaterialTint } from "@/components/rentals/model-viewer";

// Web-compressed 3D models (public/models, made with gltf-transform optimize),
// by rental slug. Rentals without one show their photo instead.
export const RENTAL_MODELS: Record<string, string> = {
  "robot-dog": "/models/robot-dog.glb",
  "serving-robot": "/models/serving-robot.glb",
  "bumblebee-costume": "/models/bumblebee-costume.glb",
  "kuka-robotic-arm": "/models/kuka-robotic-arm.glb",
};

// Material recolours so models match the real units (names come from each model file).
export const RENTAL_TINTS: Record<string, Record<string, MaterialTint>> = {
  // gunmetal grey aluminium, like the real robot dog
  "robot-dog": {
    material_100100100: { color: "#a3a7ad", metalness: 0.6, roughness: 0.38 }, // body shells
    material_737373: { color: "#80858c", metalness: 0.55, roughness: 0.42 }, // leg parts
    material_4C4C4C: { color: "#4b4f55", metalness: 0.45, roughness: 0.4 }, // joints and details
  },
};
