import Link from "next/link";

export function CategoryButton({
  href,
  label,
  color,
}: {
  href: string;
  label: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className={`${color} text-black text-2xl font-bold py-8 px-6 rounded-lg border-4 border-black shadow-brutal hover:shadow-brutal-hover transition-all duration-300 transform hover:-translate-y-1 hover:rotate-1`}
    >
      {label}
    </Link>
  );
}
