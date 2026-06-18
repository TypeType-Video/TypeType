type Props = {
  labelClassName: string;
};

export function YoutubeSessionInfoSection({ labelClassName }: Props) {
  return (
    <section className="grid gap-10 border-border border-b pb-10 lg:grid-cols-[18rem_1fr] xl:grid-cols-[22rem_1fr]">
      <div>
        <p className={labelClassName}>What happens</p>
        <p className="mt-2 text-fg-muted text-sm leading-6">
          The login page is rendered by a disposable Chromium session running in TypeType-Token.
        </p>
      </div>
      <ul className="flex flex-col gap-4 border-border border-l pl-5 text-fg-muted text-sm leading-6">
        <li>You sign in inside the remote browser shown above.</li>
        <li>Cookies and playback token are captured server-side only.</li>
        <li>The browser context is destroyed after success, timeout, or cancel.</li>
        <li>After connection, retry the video and /streams uses your YouTube session.</li>
      </ul>
    </section>
  );
}
