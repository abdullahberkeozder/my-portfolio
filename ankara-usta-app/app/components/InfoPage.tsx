import Link from 'next/link';

type InfoPageProps = {
  eyebrow: string; title: string; intro: string;
  sections: Array<{ title: string; body: string; items?: string[] }>;
};

export default function InfoPage({ eyebrow, title, intro, sections }: InfoPageProps) {
  return <main className="account-shell info-page">
    <Link className="account-back" href="/">← Ana sayfa</Link>
    <article>
      <header><span className="info-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{intro}</p></header>
      {sections.length > 2 && <nav className="info-contents" aria-label="Bu sayfada"><strong>Bu sayfada</strong>
        <ol>{sections.map((section,index)=><li key={section.title}><a href={`#bilgi-${index+1}`}>{section.title}</a></li>)}</ol>
      </nav>}
      {sections.map((section,index)=><section id={`bilgi-${index+1}`} key={section.title} tabIndex={-1}>
        <h2>{section.title}</h2><p>{section.body}</p>
        {section.items&&<ul>{section.items.map(item=><li key={item}>{item}</li>)}</ul>}
      </section>)}
      <nav className="info-actions" aria-label="Sonraki adım"><Link className="dialog-primary" href="/#services">Hizmetleri incele</Link></nav>
    </article>
  </main>;
}
