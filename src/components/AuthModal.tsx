// src/components/AuthModal.tsx
import { Button, TextInput, Text } from "@mantine/core";
import { useState } from "react";

export default function AuthModal() {
  const [useEmail, setUseEmail] = useState(false);
  const [value, setValue] = useState("");

  return (
    <div className="flex items-center justify-center bg-gray-50 px-4 py-8 min-h-[50vh]">
      <div className="flex flex-col md:flex-row bg-white shadow-xl rounded-md overflow-hidden w-full max-w-3xl h-auto md:h-[50vh]">
        {/* LEFT SIDE */}
        <div className="bg-[#ffecec] p-8 flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-pink-500 font-bold text-lg mb-2">ONE TIME MAGIC!</div>
          <p className="text-xs text-rose-600 mt-1">LOGIN / REGISTER NOW TO CLAIM</p>
        </div>

        {/* RIGHT SIDE */}
        <div className="p-6 flex-1 flex flex-col justify-center">
          <Text size="xs" className="mb-2">Login / Register</Text>

          {!useEmail ? (
            <TextInput
              placeholder="Enter Mobile number"
              value={value}
              onChange={(e) => setValue(e.currentTarget.value)}
              className="mb-3"
            />
          ) : (
            <TextInput
              placeholder="Enter your email"
              value={value}
              onChange={(e) => setValue(e.currentTarget.value)}
              className="mb-3"
            />
          )}

          <Text
            size="xs"
            className="text-center mb-3 cursor-pointer text-blue-500"
            onClick={() => setUseEmail(!useEmail)}
          >
            {useEmail ? "Use Mobile Number" : "Use Email"}
          </Text>

          <Button fullWidth color="red" className="mb-3">
            SEND OTP
          </Button>

          <Text size="xs" className="mt-4 text-gray-500 text-center">
            By Signing, I agree to ToImpress’s T&C
          </Text>
        </div>
      </div>
    </div>
  );
}
