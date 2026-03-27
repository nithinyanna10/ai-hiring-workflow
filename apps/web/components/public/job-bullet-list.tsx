type JobBulletListProps = {
  items: string[];
};

export function JobBulletList({ items }: JobBulletListProps) {
  return (
    <ul className="space-y-3 pl-5 text-sm leading-6 text-slate-700">
      {items.map((item) => (
        <li key={item} className="list-disc">
          {item}
        </li>
      ))}
    </ul>
  );
}
