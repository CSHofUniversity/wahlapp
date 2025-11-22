export function toRawGitHub(url: string | null | undefined): string {
  if (!url) return "";
  return url
    .replace("https://github.com/", "https://raw.githubusercontent.com/")
    .replace("/blob/", "/");
}
