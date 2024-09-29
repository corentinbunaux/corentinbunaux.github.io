"use client";

import App from './App';
import Link from 'next/link';

const tabs = [
  'android',
  'quimesis',
  'kusmitea',
  'datascience',
  'web',
  'programming',
  'embedded',
  'robotics'
];


export default function Home() {
  return (
    <div>
      <App />
      <nav>
        {tabs.map(tab => (
          <Link key={tab} href={`/${tab}`} />
        ))}
      </nav>
    </div>
  );
}
