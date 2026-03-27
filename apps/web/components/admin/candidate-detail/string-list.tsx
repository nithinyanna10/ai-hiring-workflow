type StringListProps = {
  items: string[];
  emptyLabel: string;
};

export function StringList({ items, emptyLabel }: StringListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2 pl-5 text-sm leading-6 text-slate-700">
      {items.map((item) => (
        <li key={item} className="list-disc">
          {item}
        </li>
      ))}
    </ul>
  );
}
