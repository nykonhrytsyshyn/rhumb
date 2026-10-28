export async function copyText(text: string | Promise<string>): Promise<void> {
  const clipboard = navigator.clipboard as Clipboard | undefined;

  if (clipboard === undefined) {
    throw new Error("The clipboard is not available");
  }

  if (typeof ClipboardItem !== "undefined" && "write" in clipboard) {
    const blob = Promise.resolve(text).then(
      (value) => new Blob([value], { type: "text/plain" }),
    );

    await clipboard.write([new ClipboardItem({ "text/plain": blob })]);

    return;
  }

  await clipboard.writeText(await text);
}
