interface MobileInputProps {
  mobileNumber: string;
  setMobileNumber: (value: string) => void;
  onSkip?: () => void; // Make onSkip optional
}

import React, { MouseEvent, ChangeEvent } from "react";

export default function MobileInput({
  mobileNumber,
  setMobileNumber,
  onSkip,
}: MobileInputProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    console.log(event.currentTarget); // Now TypeScript knows the properties of 'event'
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission

    // ... your form submission logic ...
  };

  return (
    <div className="bg-gray-800/50 p-4 rounded-md space-y-2">
      <h2 className="text-xl font-bold">Enter Mobile Number</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="tel"
          pattern="[0-9]{10}" // Enforce 10-digit pattern
          value={mobileNumber}
          onChange={handleChange}
          className="w-full bg-gray-700 text-white p-2 rounded"
          placeholder="10-digit number"
          required
        />
        <div className="flex justify-between">
          <button type="button" onClick={onSkip} className="text-gray-500">
            Skip
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
