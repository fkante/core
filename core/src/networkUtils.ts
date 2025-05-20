export const FACEBOOK_NETWORKS = [
  "facebook installs",
  "instagram installs",
  "off-facebook installs",
  "facebook messenger installs",
];
export const APPLE_NETWORK = "Apple";
export const FACEBOOK_NETWORK = "Facebook";
export const MINTEGRAL_NETWORK = "Mintegral";

export enum Network {
  ALL = "all",
  APPLE = "apple",
  APPLOVIN = "applovin",
  FACEBOOK = "facebook",
  GOOGLE = "google",
  IRONSOURCE = "ironsource",
  SNAPCHAT = "snapchat",
  UNITY = "unity",
  TIKTOK = "tiktok",
}
export enum NetworkCode {
  APPLOVIN = "al",
  FACEBOOK = "fb",
  GOOGLE_ADS = "ga",
  TIKTOK = "tk",
}

export function isApple(network: string) {
  const lowerCaseNetwork = network.toLowerCase();
  return lowerCaseNetwork.includes(APPLE_NETWORK.toLowerCase());
}

export function isMintegral(network: string) {
  const lowerCaseNetwork = network.toLowerCase();
  return lowerCaseNetwork.includes(MINTEGRAL_NETWORK.toLowerCase());
}

export function isFacebook(network: string) {
  const lowerCaseNetwork = network.toLowerCase();
  return (
    FACEBOOK_NETWORKS.includes(lowerCaseNetwork) ||
    lowerCaseNetwork.includes(FACEBOOK_NETWORK.toLowerCase())
  );
}

export function getNetworkCode(networkName = "") {
  switch (networkName.toLowerCase()) {
    case Network.APPLOVIN:
      return NetworkCode.APPLOVIN;
    case Network.FACEBOOK:
      return NetworkCode.FACEBOOK;
    case Network.GOOGLE:
      return NetworkCode.GOOGLE_ADS;
    case Network.TIKTOK:
      return NetworkCode.TIKTOK;
    default:
      return "";
  }
}
