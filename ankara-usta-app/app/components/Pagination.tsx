import Link from 'next/link';

export default function Pagination({page,total,pageSize,path}:{page:number;total:number;pageSize:number;path:string}){
  const pageCount=Math.max(1,Math.ceil(total/pageSize));
  if(pageCount<=1)return null;
  return <nav className="pagination" aria-label="Sayfalama">
    {page>1?<Link href={`${path}?page=${page-1}`} rel="prev">← Önceki</Link>:<span aria-disabled="true">← Önceki</span>}
    <strong>{page} / {pageCount}</strong>
    {page<pageCount?<Link href={`${path}?page=${page+1}`} rel="next">Sonraki →</Link>:<span aria-disabled="true">Sonraki →</span>}
  </nav>;
}
