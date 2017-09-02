import Link from 'next/link';
import dva from 'dva';

export default function () {
  const app = dva();
  app.router(() => {
    return (
      <div>
        Hi,
        <Link href="/users">Go to /users</Link>
      </div>
    );
  });

  const Component = app.start();
  return (
    <Component />
  );
}
