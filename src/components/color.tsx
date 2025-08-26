export type ColorProps = {
  name: string;
  shade: string;
  value: string;
};

export default function Color({ name, shade, value }: ColorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-6 w-6 rounded" style={{ backgroundColor: value }} />
      <span className="text-sm font-medium">
        {name} {shade}
      </span>
      <span className="ml-auto text-xs text-gray-500">{value}</span>
    </div>
  );
}
