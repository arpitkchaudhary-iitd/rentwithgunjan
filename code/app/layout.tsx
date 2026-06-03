import './globals.css';

export const metadata = {
  title: 'rentwithgunjan',
  description: 'A scalable car rental website for Hoboken and beyond.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
