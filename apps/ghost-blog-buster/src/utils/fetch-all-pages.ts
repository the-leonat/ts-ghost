type Page<T> = {
  current: { success: true; data: T[] } | { success: false; errors: { type: string; message: string }[] };
  next?: { paginate(): Promise<Page<T>> } | undefined;
};

/** Collects every page; throws on a failed page so an export is never silently cut short. */
export async function fetchAllPages<T>(first: Promise<Page<T>>): Promise<T[]> {
  const items: T[] = [];
  let cursor: Page<T> | undefined = await first;
  while (cursor) {
    const { current } = cursor;
    if (!current.success)
      throw new Error(current.errors.map((error) => `${error.type}: ${error.message}`).join("\n"));
    items.push(...current.data);
    cursor = cursor.next ? await cursor.next.paginate() : undefined;
  }
  return items;
}
