import PhoneInputBase from "react-phone-number-input";
import "react-phone-number-input/style.css";

export default function PhoneInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="formField">
      <span>{label}</span>
      <PhoneInputBase
        international
        defaultCountry="ZA"
        value={value}
        onChange={(next) => onChange(next ?? "")}
        className="phoneInput"
        placeholder="82 123 4567"
      />
    </label>
  );
}
