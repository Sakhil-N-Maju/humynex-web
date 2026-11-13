/** Cover image for a project, falling back to the shared placeholder set. */
export function projectCover(cover: string | null | undefined, index: number) {
  return cover || `/placeholders/work-${(index % 6) + 1}.jpg`;
}
