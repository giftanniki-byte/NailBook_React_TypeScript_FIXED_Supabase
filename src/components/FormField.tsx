type Props = {
  label: string;
  name: string;
  type?: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange: (value: string) => void;
};

export default function FormField({ label, name, type = "text", value, placeholder, required = true, onChange }: Props) {
  return (
    <label className="formField">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
