import Link from 'next/link';

type InfoPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: Array<{title: string; body: string; items?: string[]}>;
};

export default function InfoPage({eyebrow, title, intro, sections}: InfoPageProps) {
  return <main className="account-shell info-page">
    <Link className="account-back" href="/">← Ankara Usta</Link>
    <article>
      <span className="info-eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{intro}</p>
      {sections.map(section=><section key={section.title}>
        <h2>{section.title}</h2>
        <p>{section.body}</p>
        {section.items&&<ul>{section.items.map(item=><li key={item}>{item}</li>)}</ul>}
      </section>)}
      <nav className="info-actions" aria-label="Sonraki adımlar">
        <Link href="/">Hizmet ara</Link>
        <Link href="/giris">Hesabına git</Link>
      </nav>
    </article>
  </main>;
}
