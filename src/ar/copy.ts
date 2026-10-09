export const TRY_ON_COPY = {
  button: "Try it on",
  buttonHint: "AR, in your browser. Your camera never leaves your phone. Neither will the clothes.",
  privacy: "Your camera stays on this device. Nothing is uploaded, saved or sent. Not even the clothes.",
  loading: "Warming up the fitting room…",
  findYou: "Step back so we can see you. Shoulders to hips, at least.",
  findYouFull: "This one's full length. Step back until your ankles are in shot.",
  denied: "No camera, no fitting room. Allow camera access in your browser settings and try again.",
  noCamera: "We couldn't find a camera. Here's the photo instead. It's about as close as you'll get.",
  unsupported: "Your browser can't do try-on. Here's the photo instead.",
  modelFailed: "The fitting room failed to load. Very on-brand of us.",
  snapshot: "Take a photo",
  snapshotCaption: "Tried it on. Still waiting.",
  flip: "Flip camera",
  close: "Back to the product",
  addToCart: "Add to cart (it won't come)",
  notTryable: "Shoes can't be tried on in AR. They can't arrive either.",
} as const;

export type TryOnCopyKey = keyof typeof TRY_ON_COPY;
